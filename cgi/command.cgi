#!/usr/bin/perl
# 説明   : コマンドを新規登録、更新、削除する。
# 作成者 : 江野高広
# 作成日 : 2017/09/07

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Telnetman_common;
use Common_system;
use Common_sub;
use Access2DB;


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# 認証
#
my $telnetman_auth = Telnetman_auth -> new($access2db);
my $login   = $telnetman_auth -> check_login;
my $session = $telnetman_auth -> check_session;

unless(($login == 1) && ($session == 1)){
 my $ref_results = $telnetman_auth -> marge_result;
 my $json_results = &JSON::to_json($ref_results);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_results;
 
 $access2db -> close;
 exit(0);
}



#
# 新規登録、更新、削除の選択。
#
my $cgi = new CGI;
my $operation = $cgi -> param('operation');

unless(defined($operation) && (length($operation) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"新規登録、更新、削除の指定がされていません。"}';
 
 $access2db -> close;
 exit(0);
}



#
# 現在時刻
#
my $time = time;



#
# セッションID の取得
#
my $session_id = $telnetman_auth -> get_session_id;



#
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;



#
# 新規登録、更新、削除前の確認。
#
my $check = 0;
my $permission = 0;
my $command_id = '';
my $repeat_type = 1;
my $command_type = 1;
my $title = '';
my $keyword = '';
my $comment = '';
my $wait = 0;
my $conft_end = 0;
my $command = '';
my $dummy = '';
my $prompt = 1;
my $store = 1;

my $reason = '';

if(($operation eq 'create') || ($operation eq 'update')){
 ($check, $reason, $command_id, $repeat_type, $command_type, $title, $keyword, $comment, $wait, $conft_end, $command, $dummy, $prompt, $store) = &main::check_parameter($cgi);
 ($operation, $command_id) = &Telnetman_common::check_operation($access2db, 'command', $command_id);
 
 
 if(($operation eq 'create') && ($check == 1)){
  $permission = 1;
 }
 elsif(($operation eq 'update') && ($check == 1)){
  $permission = &Telnetman_common::check_permission($access2db, 'command', $command_id, $user_id);
 }
}
elsif($operation eq 'delete'){
 $check = 1;
 $command_id = $cgi -> param('command_id');
 $permission = &Telnetman_common::check_permission($access2db, 'command', $command_id, $user_id);
}

if(($check == 1) && ($permission == 0)){
 $check = 0;
 $reason = '権限がありません。';
}

if($check == 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'operation'  => $operation,
  'reason'     => $reason,
  'session_id' => $session_id,
  'command_id' => $command_id,
  'item_type'  => 'command',
  'item_id'    => $command_id
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



my $escaped_user_id = &Common_sub::escape_sql($user_id);
my $escaped_title   = &Common_sub::escape_sql($title);
my $escaped_keyword = &Common_sub::escape_sql($keyword);
my $escaped_comment = &Common_sub::escape_sql($comment);
my $escaped_command = &Common_sub::escape_sql($command);
my $escaped_dummy   = &Common_sub::escape_sql($dummy);



if($operation eq 'create'){
 my $insert_column = 'vcCommandId,vcKeyword,iCreateTime,iUpdateTime,vcUserId,vcChanger,vcTitle,iRepeatType,vcComment,iWaitTime,iConftEnd,txCommand,iCommandType,txDummyReturn,iPromptChecker,iStore';
 my @values = ("('" . $command_id . "','" . $escaped_keyword . "'," . $time . "," . $time . ",'" . $escaped_user_id . "','','" . $escaped_title . "'," . $repeat_type . ",'" . $escaped_comment . "'," . $wait . "," . $conft_end . ",'" . $escaped_command . "'," . $command_type . ",'" . $escaped_dummy . "'," . $prompt . "," . $store . ")");
 my $table = 'T_Command';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
}
elsif($operation eq 'update'){
 my @set = (
       "vcKeyword = '" . $escaped_keyword . "'",
     'iUpdateTime = '  . $time,
       "vcChanger = '" . $escaped_user_id . "'",
         "vcTitle = '" . $escaped_title . "'",
     'iRepeatType = '  . $repeat_type,
       "vcComment = '" . $escaped_comment . "'",
       'iWaitTime = '  . $wait,
       'iConftEnd = '  . $conft_end,
       "txCommand = '" . $escaped_command . "'",
    'iCommandType = '  . $command_type,
   "txDummyReturn = '" . $escaped_dummy . "'",
  'iPromptChecker = '  . $prompt,
          'iStore = '  . $store         
 );
 my $table     = 'T_Command';
 my $condition = "where vcCommandId = '" . $command_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 my $count = $access2db -> update_exe;
}
elsif($operation eq 'delete'){
 my $table     = 'T_Command';
 my $condition = "where vcCommandId = '" . $command_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 $keyword = '';
}

&Telnetman_common::update_T_Search($access2db, $keyword, 'command', $command_id, $title);

$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;

$repeat_type  += 0;
$command_type += 0;

my %results = (
 'login'        => 1,
 'session'      => 1,
 'result'       => 1,
 'operation'    => $operation,
 'command_id'   => $command_id,
 'item_type'    => 'command',
 'item_id'      => $command_id,
 'command_type' => $command_type,
 'repeat_type'  => $repeat_type,
 'title'        => $title,
 'session_id'   => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;



#
# 登録、更新時の必須項目の確認と値の取り出し。
#
sub check_parameter {
 my $cgi = $_[0];
 my $command_id   = $cgi -> param('command_id');
 my $item_id      = $cgi -> param('item_id');
 my $repeat_type  = $cgi -> param('repeat_type');
 my $command_type = $cgi -> param('command_type');
 my $title        = $cgi -> param('title');
 my $keyword      = $cgi -> param('keyword');
 my $comment      = $cgi -> param('comment');
 my $wait         = $cgi -> param('wait');
 my $conft_end    = $cgi -> param('conft_end');
 my $command      = $cgi -> param('command');
 my $dummy        = $cgi -> param('dummy');
 my $prompt       = $cgi -> param('prompt');
 my $store        = $cgi -> param('store');
 
 unless(defined($command_id)){
  $command_id = '';
 }
 
 unless(defined($item_id)){
  $item_id = '';
 }
 
 if((length($command_id) == 0) && (length($item_id) > 0)){
  $command_id = $item_id;
 }
 
 unless(defined($repeat_type) && (length($repeat_type) > 0)){
  $repeat_type = 1;
 }
 elsif(($repeat_type != 1) && ($repeat_type != 2)){
  $repeat_type = 1;
 }
 
 $repeat_type += 0;
 
 unless(defined($command_type) && (length($command_type) > 0)){
  $command_type = 1;
 }
 elsif(($command_type != 1) && ($command_type != 2) && ($command_type != 3)){
  $command_type = 1;
 }
 
 $command_type += 0;
 
 unless(defined($title) && (length($title) > 0)){
  return(0, 'タイトルが指定されていません。', $command_id);
 }
 
 unless(defined($keyword)){
  $keyword = '';
 }
 
 unless(defined($comment)){
  $comment = '';
 }
 
 unless(defined($wait) && (length($wait) > 0)){
  $wait = 0;
 }
 elsif($wait !~ /^[0-9]+$/){
  $wait = 0;
 }
 
 $wait += 0;
 
 unless(defined($conft_end) && (length($conft_end) > 0)){
  $conft_end = 0;
 }
 elsif(($conft_end != 0) && ($conft_end != 1)){
  $conft_end = 0;
 }
 
 $conft_end += 0;
 
 unless(defined($command) && (length($command) > 0)){
  return(0, 'コマンドが指定されていません。', $command_id);
 }
 else{
  $command =~ s/\t/ /g;
 }
 
 unless(defined($dummy)){
  $dummy = '';
 }
 
 unless(defined($prompt) && (length($prompt) > 0)){
  $prompt = 1;
 }
 elsif(($prompt != 1) && ($prompt != 2) && ($prompt != 0)){
  $prompt = 1;
 }
 
 $prompt += 0;
 
 unless(defined($store) && (length($store) > 0)){
  $store = 1;
 }
 elsif(($store != 1) && ($store != 0)){
  $store = 1;
 }
 
 $store += 0;
  
 return(1, '', $command_id, $repeat_type, $command_type, $title, $keyword, $comment, $wait, $conft_end, $command, $dummy, $prompt, $store);
}
