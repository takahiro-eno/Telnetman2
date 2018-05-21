#!/usr/bin/perl
# 説明   : action を新規登録、更新、削除する。
# 作成者 : 江野高広
# 作成日 : 2017/09/11
# 更新 2018/05/16 Begin, End 機能の追加。

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
my $repeat_type = 1;
my $action_id = '';
my $title = '';
my $keyword = '';
my $comment = '';
my $pipe_type = 1;
my $pipe_word = '';
my $begin_word = '';
my $end_word = '';
my $pattern = '';
my $script_id = '';
my $json_condition = '';
my $not = 0;
my $operator = 3;
my $count = 0;
my $ng_message = '';
my $json_parameter_sheet_a = '';
my $json_parameter_sheet_b = '';
my $destroy = 1;

my $reason = '';

if(($operation eq 'create') || ($operation eq 'update')){
 ($check, $reason, $action_id, $repeat_type, $title, $keyword, $comment, $begin_word, $pipe_type, $pipe_word, $end_word, $pattern, $script_id, $json_condition, $not, $operator, $count, $ng_message, $json_parameter_sheet_a, $json_parameter_sheet_b, $destroy) = &main::check_parameter($cgi);
 ($operation, $action_id) = &Telnetman_common::check_operation($access2db, 'action', $action_id);
 
 
 if(($operation eq 'create') && ($check == 1)){
  $permission = 1;
 }
 elsif(($operation eq 'update') && ($check == 1)){
  $permission = &Telnetman_common::check_permission($access2db, 'action', $action_id, $user_id);
 }
}
elsif($operation eq 'delete'){
 $check = 1;
 $action_id = $cgi -> param('action_id');
 $permission = &Telnetman_common::check_permission($access2db, 'action', $action_id, $user_id);
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
  'action_id'  => $action_id,
  'item_type'  => 'action',
  'item_id'    => $action_id
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



my $escaped_user_id        = &Common_sub::escape_sql($user_id);
my $escaped_title          = &Common_sub::escape_sql($title);
my $escaped_keyword        = &Common_sub::escape_sql($keyword);
my $escaped_comment        = &Common_sub::escape_sql($comment);
my $escaped_pipe_word      = &Common_sub::escape_sql($pipe_word);
my $escaped_begin_word     = &Common_sub::escape_sql($begin_word);
my $escaped_end_word       = &Common_sub::escape_sql($end_word);
my $escaped_pattern        = &Common_sub::escape_sql($pattern);
my $escaped_script_id      = &Common_sub::escape_sql($script_id);
my $escaped_json_condition = &Common_sub::escape_sql($json_condition);
my $escaped_ng_message     = &Common_sub::escape_sql($ng_message);
my $escaped_json_parameter_sheet_a = &Common_sub::escape_sql($json_parameter_sheet_a);
my $escaped_json_parameter_sheet_b = &Common_sub::escape_sql($json_parameter_sheet_b);



#
# 新規登録、更新、削除の実行。
#
if($operation eq 'create'){
 my $insert_column = 'vcActionId,vcKeyword,iCreateTime,iUpdateTime,vcUserId,vcChanger,vcTitle,iRepeatType,vcComment,vcBeginWord,iPipeType,vcPipeWord,vcEndWord,vcPattern,txConditions,iNot,iOperator,iCount,vcScriptId,vcNgMessage,txParameterSheetA,txParameterSheetB,iDestroy';
 my @values = ("('" . $action_id . "','" . $escaped_keyword . "'," . $time . "," . $time . ",'" . $escaped_user_id . "','','" . $escaped_title . "'," . $repeat_type . ",'" . $escaped_comment . "','" . $escaped_begin_word . "'," . $pipe_type . ",'" . $escaped_pipe_word . "','" . $escaped_end_word . "','" . $escaped_pattern . "','" . $escaped_json_condition . "'," . $not . "," . $operator . "," . $count . ",'" . $escaped_script_id . "','" . $escaped_ng_message . "','" . $escaped_json_parameter_sheet_a . "','" . $escaped_json_parameter_sheet_b . "'," . $destroy . ")");
 my $table = 'T_Action';
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
        "vcBeginWord = '" . $escaped_begin_word . "'",
          'iPipeType = '  . $pipe_type,
         "vcPipeWord = '" . $escaped_pipe_word . "'",
          "vcEndWord = '" . $escaped_end_word . "'",
          "vcPattern = '" . $escaped_pattern . "'",
       "txConditions = '" . $escaped_json_condition . "'",
               'iNot = '  . $not,
          'iOperator = '  . $operator,
             'iCount = '  . $count,
         "vcScriptId = '" . $escaped_script_id . "'",
        "vcNgMessage = '" . $escaped_ng_message . "'",
  "txParameterSheetA = '" . $escaped_json_parameter_sheet_a . "'",
  "txParameterSheetB = '" . $escaped_json_parameter_sheet_b . "'",
           'iDestroy = '  . $destroy
 );
 my $table     = 'T_Action';
 my $condition = "where vcActionId = '" . $action_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 my $count = $access2db -> update_exe;
}
elsif($operation eq 'delete'){
 my $table     = 'T_Action';
 my $condition = "where vcActionId = '" . $action_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 $keyword = '';
}

&Telnetman_common::update_T_Search($access2db, $keyword, 'action', $action_id, $title);

$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;

$repeat_type += 0;

my %results = (
 'login'       => 1,
 'session'     => 1,
 'result'      => 1,
 'operation'   => $operation,
 'action_id'   => $action_id,
 'item_type'   => 'action',
 'item_id'     => $action_id,
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
 my $repeat_type    = $cgi -> param('repeat_type');
 my $action_id      = $cgi -> param('action_id');
 my $item_id        = $cgi -> param('item_id');
 my $title          = $cgi -> param('title');
 my $keyword        = $cgi -> param('keyword');
 my $comment        = $cgi -> param('comment');
 my $begin_word     = $cgi -> param('begin_word');
 my $pipe_type      = $cgi -> param('pipe_type');
 my $pipe_word      = $cgi -> param('pipe_word');
 my $end_word       = $cgi -> param('end_word');
 my $pattern        = $cgi -> param('pattern');
 my $script_id      = $cgi -> param('script_id');
 my $json_condition = $cgi -> param('json_condition');
 my $not            = $cgi -> param('not');
 my $operator       = $cgi -> param('operator');
 my $count          = $cgi -> param('count');
 my $ng_message     = $cgi -> param('ng_message');
 my $destroy        = $cgi -> param('destroy');
 my $json_parameter_sheet_a = $cgi -> param('json_parameter_sheet_a');
 my $json_parameter_sheet_b = $cgi -> param('json_parameter_sheet_b');
 
 unless(defined($action_id)){
  $action_id = '';
 }
 
 unless(defined($item_id)){
  $item_id = '';
 }
 
 if((length($action_id) == 0) && (length($item_id) > 0)){
  $action_id = $item_id;
 }
 
 unless(defined($repeat_type) && (length($repeat_type) > 0)){
  $repeat_type = 1;
 }
 elsif(($repeat_type != 1) && ($repeat_type != 2)){
  $repeat_type = 1;
 }
 
 $repeat_type += 0;
 
 unless(defined($title) && (length($title) > 0)){
  return(0, 'タイトルが指定されていません。', $action_id);
 }
 
 unless(defined($keyword)){
  $keyword = '';
 }
 
 unless(defined($comment)){
  $comment = '';
 }
 
 unless(defined($pipe_type) && (length($pipe_type) > 0)){
  $pipe_type = 1;
 }
 elsif(($pipe_type != 1) && ($pipe_type != 2) && ($pipe_type != 3)){
  $pipe_type = 1;
 }
 
 $pipe_type += 0;
 
 unless(defined($pipe_word)){
  $pipe_word = '';
 }
 
 unless(defined($begin_word)){
  $begin_word = '';
 }
 
 unless(defined($end_word)){
  $end_word = '';
 }
 
 $pipe_word = &Common_sub::trim_lines($pipe_word);
 
 unless(defined($pattern)){
  $pattern = '';
 }
 
 $pattern = &Common_sub::trim_lines($pattern);
 
 unless(defined($script_id)){
  $script_id = '';
 }
 
 if(length($script_id) > 0){
  unless(-f (&Common_system::dir_conversion_script() . '/' . $script_id . '.pl')){
   return(0, '変換スクリプト' . $script_id . '.pl がアップロードされていません。先にアップロードしてからやり直して下さい。' , $action_id);
  }
 }
 
 unless(defined($json_condition) && (length($json_condition) > 0)){
  $json_condition = '[[""]]';
 }
 
 unless(defined($not) && (length($not) > 0)){
  $not = 0;
 }
 elsif(($not != 0) && ($not != 1)){
  $not = 0;
 }
 
 $not += 0;
 
 unless(defined($operator) && (length($operator) > 0)){
  $operator = 3;
 }
 elsif(($operator != 1) && ($operator != 2) && ($operator != 3) && ($operator != 4) && ($operator != 5) && ($operator != 6)){
  $operator = 3;
 }
 
 $operator += 0;
 
 unless(defined($count) && (length($count) > 0)){
  $count = 0;
 }
 
 $count += 0;
 
 unless(defined($ng_message)){
  $ng_message = '';
 }
 
 unless(defined($json_parameter_sheet_a) && (length($json_parameter_sheet_a) > 0)){
  $json_parameter_sheet_a = '[["","",""]]';
 }
 else{
  my $ref_parameter_sheet_a = &JSON::from_json($json_parameter_sheet_a);
  my @parameter_sheet_a = ();
  
  foreach my $ref_row (@$ref_parameter_sheet_a){
   my ($node, $parameter_name, $value) = @$ref_row;
   
   if((length($node) > 0) && (length($parameter_name) > 0)){
    push(@parameter_sheet_a, [$node, $parameter_name, $value]);
   }
  }
  
  if(scalar(@parameter_sheet_a) > 0){
   $json_parameter_sheet_a = &JSON::to_json(\@parameter_sheet_a);
  }
  else{
   $json_parameter_sheet_a = '[["","",""]]';
  }
 }
 
 unless(defined($json_parameter_sheet_b) && (length($json_parameter_sheet_b) > 0)){
  $json_parameter_sheet_b = '[["","","",""]]';
 }
 else{
  my $ref_parameter_sheet_b = &JSON::from_json($json_parameter_sheet_b);
  my @parameter_sheet_b = ();
  
  foreach my $ref_row (@$ref_parameter_sheet_b){
   my ($node, $bbbb, $parameter_name, $value) = @$ref_row;
   
   if((length($node) > 0) && (length($bbbb) > 0) && (length($parameter_name) > 0)){
    push(@parameter_sheet_b, [$node, $bbbb, $parameter_name, $value]);
   }
  }
  
  if(scalar(@parameter_sheet_b) > 0){
   $json_parameter_sheet_b = &JSON::to_json(\@parameter_sheet_b);
  }
  else{
   $json_parameter_sheet_b = '[["","","",""]]';
  }
 }
 
 unless(defined($destroy) && (length($destroy) > 0)){
  $destroy = 1;
 }
 elsif(($destroy != 0) && ($destroy != 1)){
  $destroy = 1;
 }
 
 $destroy += 0;
 
 return(1, '', $action_id, $repeat_type, $title, $keyword, $comment, $begin_word, $pipe_type, $pipe_word, $end_word, $pattern, $script_id, $json_condition, $not, $operator, $count, $ng_message, $json_parameter_sheet_a, $json_parameter_sheet_b, $destroy);
}
