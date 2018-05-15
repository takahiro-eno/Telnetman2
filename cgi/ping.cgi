#!/usr/bin/perl
# 説明   : ping を新規登録、更新、削除する。
# 作成者 : 江野高広
# 作成日 : 2017/11/20

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
my $ping_id = '';
my $repeat_type = 1;
my $title = '';
my $keyword = '';
my $comment = '';
my $target = '';
my $count = 5;
my $timeout = 2;
my $condition = 1;
my $ng_message = '';

my $reason = '';

if(($operation eq 'create') || ($operation eq 'update')){
 ($check, $reason, $ping_id, $repeat_type, $title, $keyword, $comment, $target, $count, $timeout, $condition, $ng_message) = &main::check_parameter($cgi);
 ($operation, $ping_id) = &Telnetman_common::check_operation($access2db, 'ping', $ping_id);
 
 
 if(($operation eq 'create') && ($check == 1)){
  $permission = 1;
 }
 elsif(($operation eq 'update') && ($check == 1)){
  $permission = &Telnetman_common::check_permission($access2db, 'ping', $ping_id, $user_id);
 }
}
elsif($operation eq 'delete'){
 $check = 1;
 $ping_id = $cgi -> param('ping_id');
 $permission = &Telnetman_common::check_permission($access2db, 'ping', $ping_id, $user_id);
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
  'ping_id'    => $ping_id,
  'item_type'  => 'ping',
  'item_id'    => $ping_id
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



my $escaped_user_id    = &Common_sub::escape_sql($user_id);
my $escaped_title      = &Common_sub::escape_sql($title);
my $escaped_keyword    = &Common_sub::escape_sql($keyword);
my $escaped_comment    = &Common_sub::escape_sql($comment);
my $escaped_target     = &Common_sub::escape_sql($target);
my $escaped_ng_message = &Common_sub::escape_sql($ng_message);


if($operation eq 'create'){
 my $insert_column = 'vcPingId,vcKeyword,iCreateTime,iUpdateTime,vcUserId,vcChanger,vcTitle,iRepeatType,vcComment,txTarget,iCount,iTimeout,iCondition,vcNgMessage';
 my @values = ("('" . $ping_id . "','" . $escaped_keyword . "'," . $time . "," . $time . ",'" . $escaped_user_id . "','','" . $escaped_title . "'," . $repeat_type . ",'" . $escaped_comment . "','" . $escaped_target . "'," . $count . "," . $timeout . "," . $condition . ",'" . $escaped_ng_message . "')");
 my $table = 'T_Ping';
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
        "txTarget = '" . $escaped_target . "'",
          'iCount = '  . $count,
        'iTimeout = '  . $timeout,
      'iCondition = '  . $condition,
     "vcNgMessage = '" . $escaped_ng_message . "'"        
 );
 my $table     = 'T_Ping';
 my $condition = "where vcPingId = '" . $ping_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 my $count = $access2db -> update_exe;
}
elsif($operation eq 'delete'){
 my $table     = 'T_Ping';
 my $condition = "where vcPingId = '" . $ping_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 $keyword = '';
}

&Telnetman_common::update_T_Search($access2db, $keyword, 'ping', $ping_id, $title);

$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;

$repeat_type += 0;

my %results = (
 'login'       => 1,
 'session'     => 1,
 'result'      => 1,
 'operation'   => $operation,
 'ping_id'     => $ping_id,
 'item_type'   => 'ping',
 'item_id'     => $ping_id,
 'repeat_type' => $repeat_type,
 'title'       => $title,
 'session_id'  => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;



#
# 登録、更新時の必須項目の確認と値の取り出し。
#
sub check_parameter {
 my $cgi = $_[0];
 my $ping_id      = $cgi -> param('ping_id');
 my $item_id      = $cgi -> param('item_id');
 my $repeat_type  = $cgi -> param('repeat_type');
 my $title        = $cgi -> param('title');
 my $keyword      = $cgi -> param('keyword');
 my $comment      = $cgi -> param('comment');
 my $target       = $cgi -> param('target');
 my $count        = $cgi -> param('count');
 my $timeout      = $cgi -> param('timeout');
 my $condition    = $cgi -> param('condition');
 my $ng_message   = $cgi -> param('ng_message');
 
 unless(defined($ping_id)){
  $ping_id = '';
 }
 
 unless(defined($item_id)){
  $item_id = '';
 }
 
 if((length($ping_id) == 0) && (length($item_id) > 0)){
  $ping_id = $item_id;
 }
 
 unless(defined($repeat_type) && (length($repeat_type) > 0)){
  $repeat_type = 1;
 }
 elsif(($repeat_type != 1) && ($repeat_type != 2)){
  $repeat_type = 1;
 }
 
 $repeat_type += 0;
 
 unless(defined($title) && (length($title) > 0)){
  return(0, 'タイトルが指定されていません。', $ping_id);
 }
 
 unless(defined($keyword)){
  $keyword = '';
 }
 
 unless(defined($comment)){
  $comment = '';
 }
 
 unless(defined($count) && (length($count) > 0)){
  $count = 5;
 }
 elsif($count !~ /^[0-9]+$/){
  $count = 5;
 }
 
 $count += 0;
 
 unless(defined($timeout) && (length($timeout) > 0)){
  $timeout = 2;
 }
 elsif($timeout !~ /^[0-9]+$/){
  $timeout = 2;
 }
 
 $timeout += 0;
 
 unless(defined($target) && (length($target) > 0)){
  return(0, 'ターゲットが指定されていません。', $ping_id);
 }
 else{
  $target =~ s/\t/ /g;
 }
 
 unless(defined($condition) && (length($condition) > 0)){
  $condition = 1;
 }
 elsif(($condition != 1) && ($condition != 2) && ($condition != 3) && ($condition != 4)){
  $condition = 1;
 }
 
 $condition += 0;
 
 unless(defined($ng_message)){
  $ng_message = '';
 }
  
 return(1, '', $ping_id, $repeat_type, $title, $keyword, $comment, $target, $count, $timeout, $condition, $ng_message);
}
