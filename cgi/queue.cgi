#!/usr/bin/perl
# 説明   : telnet 実行の依頼を受けてqueue に入れる。
# 作成者 : 江野高広
# 作成日 : 2014/08/16
#
# 更新 : 2014/12/26 対象ノードが1台であっても、timeout が300s 以上の場合もqueue に入れる仕様に変更。
# 更新 : 2015/01/09 自動一時停止機能の追加。
#      : 2015/10/23 syslog 検出機能追加。
#      : 2016/06/28 SSH に対応。
#      : 2017/08/31 ルーチンの繰り返し逆順を追加。
#      : 2017/10/27 Ver2 に向けて大幅に更新。

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_sub;
use Common_system;
use Access2DB;
use Telnetman_check_flowchart;
use Telnetman_common;

#
# 現在時刻
#
my $time = time;


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
# ユーザーID とセッションID を取得する。
#
my $user_id    = $telnetman_auth -> get_user_id;
my $session_id = $telnetman_auth -> get_session_id;



#
# queue に取り込み済みかどうか確認する。
#
my $select_column = 'count(*)';
my $table         = 'T_Queue';
my $condition     = "where vcSessionId = '" . $session_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $exists_session = $access2db -> select_col1;

if($exists_session > 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'このセッションは既にqueue に取り込み済みです。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# セッションステータスの確認。
#
my $session_status = &Telnetman_common::get_session_status($access2db, $session_id);
if(($session_status >= 1) && ($session_status <= 3)){
 my %result = (
  'login' => 1,
  'session' => 1,
  'result' => 0,
  'reason' => 'このセッションはまだ終了していません。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 自動一時停止するかどうか、流れ図、ルーチンタイプ、パラメーターシート、ログイン情報を受け取る。
#
my $cgi = new CGI;
my $auto_pause = $cgi -> param('auto_pause');
unless(defined($auto_pause) && ($auto_pause == 1)){
 $auto_pause = 0;
}


my ($ref_middle_flowchart, $ref_middle_routine_repeat_type, $ref_middle_routine_loop_type, $ref_middle_routine_title) = &main::parse_flowchart_data($cgi, 'middle');
my $error_message_middle_flowchart           = &main::check_flowchart($ref_middle_flowchart);
my $error_message_middle_routine_repeat_type = &main::check_routine_repeat_type($ref_middle_routine_repeat_type);
my $error_message_middle_routine_loop_type   = &main::check_routine_loop_type($ref_middle_routine_loop_type);
my $error_message_middle_routine_title       = &main::check_routine_title_type($ref_middle_routine_title);

my ($ref_before_flowchart, $ref_before_routine_repeat_type, $ref_before_routine_loop_type, $ref_before_routine_title) = &main::parse_flowchart_data($cgi, 'before');
my $error_message_before_flowchart           = &main::check_flowchart($ref_before_flowchart);
my $error_message_before_routine_repeat_type = &main::check_routine_repeat_type($ref_before_routine_repeat_type);
my $error_message_before_routine_loop_type   = &main::check_routine_loop_type($ref_before_routine_loop_type);
my $error_message_before_routine_title       = &main::check_routine_title_type($ref_before_routine_title);

my ($ref_after_flowchart, $ref_after_routine_repeat_type, $ref_after_routine_loop_type, $ref_after_routine_title) = &main::parse_flowchart_data($cgi, 'after');
my $error_message_after_flowchart           = &main::check_flowchart($ref_after_flowchart);
my $error_message_after_routine_repeat_type = &main::check_routine_repeat_type($ref_after_routine_repeat_type);
my $error_message_after_routine_loop_type   = &main::check_routine_loop_type($ref_after_routine_loop_type);
my $error_message_after_routine_title       = &main::check_routine_title_type($ref_after_routine_title);

my ($ref_parameter_sheet,         $json_parameter_sheet,         $error_message_parameter)               = &Telnetman_common::get_parameter($cgi);
my ($ref_login_info,              $json_login_info,              $error_message_login_info)              = &main::get_login_info($cgi);
my ($ref_diff_values,             $json_diff_values,             $error_message_diff_values)             = &main::get_diff_values($cgi);
my ($ref_optional_log_values,     $json_optional_log_values,     $error_message_optional_log_values)     = &main::get_optional_log_values($cgi);
my ($ref_terminal_monitor_values, $json_terminal_monitor_values, $error_message_terminal_monitor_values) = &main::get_terminal_monitor_values($cgi);

my @error_message_list = ();
foreach my $error_message ($error_message_middle_flowchart,
                           $error_message_middle_routine_repeat_type,
                           $error_message_middle_routine_loop_type,
                           $error_message_middle_routine_title,
                           $error_message_before_flowchart,
                           $error_message_before_routine_repeat_type,
                           $error_message_before_routine_loop_type,
                           $error_message_before_routine_title,
                           $error_message_after_flowchart,
                           $error_message_after_routine_repeat_type,
                           $error_message_after_routine_loop_type,
                           $error_message_after_routine_title,
                           $error_message_parameter,
                           $error_message_login_info,
                           $error_message_diff_values,
                           $error_message_optional_log_values,
                           $error_message_terminal_monitor_values){
 if(length($error_message) > 0){
  push(@error_message_list, $error_message);
 }
}

if(scalar(@error_message_list) > 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => join("\n", @error_message_list),
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}

my $json_middle_flowchart           = &JSON::to_json($ref_middle_flowchart);
my $json_middle_routine_repeat_type = &JSON::to_json($ref_middle_routine_repeat_type);
my $json_middle_routine_loop_type   = &JSON::to_json($ref_middle_routine_loop_type);
my $json_middle_routine_title       = &JSON::to_json($ref_middle_routine_title);
my $json_before_flowchart           = &JSON::to_json($ref_before_flowchart);
my $json_before_routine_repeat_type = &JSON::to_json($ref_before_routine_repeat_type);
my $json_before_routine_loop_type   = &JSON::to_json($ref_before_routine_loop_type);
my $json_before_routine_title       = &JSON::to_json($ref_before_routine_title);
my $json_after_flowchart            = &JSON::to_json($ref_after_flowchart);
my $json_after_routine_repeat_type  = &JSON::to_json($ref_after_routine_repeat_type);
my $json_after_routine_loop_type    = &JSON::to_json($ref_after_routine_loop_type);
my $json_after_routine_title        = &JSON::to_json($ref_after_routine_title);


#
# パラメーターシートを変換する。
#
my ($ref_A_list, $ref_B_list, $ref_A_info, $ref_B_info, $error_message_parameters) = &Telnetman_common::convert_parameter($ref_parameter_sheet);

if(length($error_message_parameters) > 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => $error_message_parameters,
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}

my $json_A_list = &JSON::to_json($ref_A_list);
my $json_B_list = &JSON::to_json($ref_B_list);
my $json_A_info = &JSON::to_json($ref_A_info);
my $json_B_info = &JSON::to_json($ref_B_info);



#
# 対象ノード数を確認する。
#
my $number_of_nodes = scalar(@$ref_A_list);
if($number_of_nodes == 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => '対象ノード数が0台です。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 流れ図が正しく書けているか確認する。
#
my $middle_flowchart_checker = Telnetman_check_flowchart -> new($access2db);
my $before_flowchart_checker = Telnetman_check_flowchart -> new($access2db);
my $after_flowchart_checker  = Telnetman_check_flowchart -> new($access2db);

$middle_flowchart_checker -> set_flowchart($json_middle_flowchart);
$middle_flowchart_checker -> set_routine_repeat_type($json_middle_routine_repeat_type);
$middle_flowchart_checker -> parse_flowchart;

$before_flowchart_checker -> set_flowchart($json_before_flowchart);
$before_flowchart_checker -> set_routine_repeat_type($json_before_routine_repeat_type);
$before_flowchart_checker -> parse_flowchart;

$after_flowchart_checker -> set_flowchart($json_after_flowchart);
$after_flowchart_checker -> set_routine_repeat_type($json_after_routine_repeat_type);
$after_flowchart_checker -> parse_flowchart;

my @middle_missing_data_list = $middle_flowchart_checker -> check_missing_data;
my @before_missing_data_list = $before_flowchart_checker -> check_missing_data;
my @after_missing_data_list  = $after_flowchart_checker  -> check_missing_data;

my @missing_data_list = (@middle_missing_data_list, @before_missing_data_list, @after_missing_data_list);

if(scalar(@missing_data_list) > 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => '以下のコマンドの登録がありません。' . "\n" . join("\n", @missing_data_list),
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}

my @middle_message_list = $middle_flowchart_checker -> check_flowchart;
my @before_message_list = $before_flowchart_checker -> check_flowchart;
my @after_message_list  = $after_flowchart_checker  -> check_flowchart;

my @message_list = (@middle_message_list, @before_message_list, @after_message_list);

if(scalar(@message_list) > 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'スケルトンの書き方に間違いがあります。' . "\n" . join("\n", @message_list),
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# セッションタイトルを受け取る。
#
my $session_title = $cgi -> param('session_title');
unless(defined($session_title)){
 $session_title = '';
}



#
# 取り出したコマンドデータをJSON にする。
#
my $ref_middle_item              = $middle_flowchart_checker -> get_item_json;
my $ref_middle_item_repeat_type  = $middle_flowchart_checker -> get_item_repeat_type;
my $ref_middle_item_title        = $middle_flowchart_checker -> get_item_title;
my $json_middle_item             = &JSON::to_json($ref_middle_item);
my $json_middle_item_repeat_type = &JSON::to_json($ref_middle_item_repeat_type);
my $json_middle_item_title       = &JSON::to_json($ref_middle_item_title);

my $ref_before_item              = $before_flowchart_checker -> get_item_json;
my $ref_before_item_repeat_type  = $before_flowchart_checker -> get_item_repeat_type;
my $ref_before_item_title        = $before_flowchart_checker -> get_item_title;
my $json_before_item             = &JSON::to_json($ref_before_item);
my $json_before_item_repeat_type = &JSON::to_json($ref_before_item_repeat_type);
my $json_before_item_title       = &JSON::to_json($ref_before_item_title);

my $ref_after_item              = $after_flowchart_checker -> get_item_json;
my $ref_after_item_repeat_type  = $after_flowchart_checker -> get_item_repeat_type;
my $ref_after_item_title        = $after_flowchart_checker -> get_item_title;
my $json_after_item             = &JSON::to_json($ref_after_item);
my $json_after_item_repeat_type = &JSON::to_json($ref_after_item_repeat_type);
my $json_after_item_title       = &JSON::to_json($ref_after_item_title);


#
# セッションデータを保存する。
#
&Telnetman_common::insert_archive_data($access2db, $session_id);
&Telnetman_common::archive_session_data($session_id);
&Telnetman_common::make_stamp($session_id, $user_id, $time); 
&Telnetman_common::make_session_data($session_id, 'terminal_monitor_values', $json_terminal_monitor_values);
&Telnetman_common::make_session_data($session_id, 'optional_log_values',     $json_optional_log_values);
&Telnetman_common::make_session_data($session_id, 'diff_values',             $json_diff_values);
&Telnetman_common::make_session_data($session_id, 'login_info',              $json_login_info);
&Telnetman_common::make_session_data($session_id, 'parameter_sheet',         $json_parameter_sheet);
&Telnetman_common::make_session_data($session_id, 'A_list', $json_A_list);
&Telnetman_common::make_session_data($session_id, 'B_list', $json_B_list);
&Telnetman_common::make_session_data($session_id, 'A_info', $json_A_info);
&Telnetman_common::make_session_data($session_id, 'B_info', $json_B_info);
&Telnetman_common::make_session_data($session_id, 'middle_item',             $json_middle_item);
&Telnetman_common::make_session_data($session_id, 'middle_item_repeat_type', $json_middle_item_repeat_type);
&Telnetman_common::make_session_data($session_id, 'middle_item_title',       $json_middle_item_title);
&Telnetman_common::make_session_data($session_id, 'middle_flowchart',           $json_middle_flowchart);
&Telnetman_common::make_session_data($session_id, 'middle_routine_repeat_type', $json_middle_routine_repeat_type);
&Telnetman_common::make_session_data($session_id, 'middle_routine_loop_type',   $json_middle_routine_loop_type);
&Telnetman_common::make_session_data($session_id, 'middle_routine_title',       $json_middle_routine_title);
&Telnetman_common::make_session_data($session_id, 'before_item',             $json_before_item);
&Telnetman_common::make_session_data($session_id, 'before_item_repeat_type', $json_before_item_repeat_type);
&Telnetman_common::make_session_data($session_id, 'before_item_title',       $json_before_item_title);
&Telnetman_common::make_session_data($session_id, 'before_flowchart',           $json_before_flowchart);
&Telnetman_common::make_session_data($session_id, 'before_routine_repeat_type', $json_before_routine_repeat_type);
&Telnetman_common::make_session_data($session_id, 'before_routine_loop_type',   $json_before_routine_loop_type);
&Telnetman_common::make_session_data($session_id, 'before_routine_title',       $json_before_routine_title);
&Telnetman_common::make_session_data($session_id, 'after_item',             $json_after_item);
&Telnetman_common::make_session_data($session_id, 'after_item_repeat_type', $json_after_item_repeat_type);
&Telnetman_common::make_session_data($session_id, 'after_item_title',       $json_after_item_title);
&Telnetman_common::make_session_data($session_id, 'after_flowchart',           $json_after_flowchart);
&Telnetman_common::make_session_data($session_id, 'after_routine_repeat_type', $json_after_routine_repeat_type);
&Telnetman_common::make_session_data($session_id, 'after_routine_loop_type',   $json_after_routine_loop_type);
&Telnetman_common::make_session_data($session_id, 'after_routine_title',       $json_after_routine_title);



#
# T_SessionStatus, T_NodeStatus を更新する。
#
my $timeout = $ref_login_info -> {'timeout'};
my @set = (
 'iUpdateTime = ' . $time,
 'iSessionStatus = 2',
 'iAutoPause = ' . $auto_pause,
 'iTotalTime = ' . $timeout,
 'iTotalNumber = 1'
);

if(length($session_title) > 0){
 push(@set, "vcTitle = '" . &Common_sub::escape_sql($session_title) . "'");
}

$table     = 'T_SessionStatus';
$condition = "where vcSessionId = '" . $session_id . "'";
$access2db -> set_update(\@set, $table, $condition);
$access2db -> update_exe;

$table     = 'T_NodeStatus';
$access2db -> set_delete($table, $condition);
$access2db -> delete_exe;

my $node_index = 0;
my $insert_column = 'vcSessionId,iCreateTime,iUpdateTime,iNodeStatus,iNodeIndex,vcIpAddress';
my @values = ();
foreach my $node (@$ref_A_list){
 $node_index ++;
 push(@values, "('" . $session_id . "'," . $time . "," . $time . ",2," . $node_index . ",'" . &Common_sub::escape_sql($node) . "')");
}
$table = 'T_NodeStatus';
$access2db -> set_insert($insert_column, \@values, $table);
$access2db -> insert_exe;



#
# T_Queue の更新。
#
&Telnetman_common::push_queue($access2db, $session_id);


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;



#
# 結果のまとめ。
#
my %results = (
 'login'          => 1,
 'session'        => 1,
 'result'         => 1,
 'session_id'     => $session_id,
 'node_list'      => $ref_A_list,
 'session_status' => 2,
 'node_status'    => {}
);

foreach my $node (@$ref_A_list){
 $results{'node_status'} -> {$node} = 2;
}

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;



#
# 流れ図のデータを流れ図、サブルーチンの繰り返し型、繰り返しの順序のJSON に分ける。
#
sub parse_flowchart_data {
 my $cgi = $_[0];
 my $flowchart_type = $_[1];
 my $ref_flowchart = undef;
 my $ref_routine_repeat_type = undef;
 my $ref_routine_loop_type = undef;
 my $ref_routine_title = undef;
 
 my $flowchart_json      = $cgi -> param($flowchart_type . '_flowchart_json');
 my $flowchart_json_file = $cgi -> param($flowchart_type . '_flowchart_json_file');
 
 my $json_flowchart_data = '';
 if(defined($flowchart_json) && (length($flowchart_json) > 0)){
  $json_flowchart_data = $flowchart_json;
 }
 elsif(defined($flowchart_json_file) && (length($flowchart_json_file) > 0)){
  my $fh = $cgi -> upload('flowchart_json_file');
  my $size = (stat($fh))[7];
  read($fh, $json_flowchart_data, $size);
 }
 else{
  $json_flowchart_data = '{"flowchart":{"0":[["","",""],["","",""],["","",""]]},"routine_repeat_type":{"0":1},"routine_title":{"0":"名無し"},"routine_loop_type":{"0":0}}';
 }
 
 $json_flowchart_data =~ s/\r//g;
 $json_flowchart_data =~ s/\n//g;
 
 if(length($json_flowchart_data) > 0){
  my $ref_flowchart_data = undef;
  eval{
   $ref_flowchart_data = &JSON::from_json($json_flowchart_data);
  };
  
  if(length($@) == 0){
   $ref_flowchart           = $ref_flowchart_data -> {'flowchart'};
   $ref_routine_repeat_type = $ref_flowchart_data -> {'routine_repeat_type'};
   $ref_routine_title       = $ref_flowchart_data -> {'routine_title'};
   $ref_routine_loop_type   = $ref_flowchart_data -> {'routine_loop_type'};
  }
  else{
   $@ = '';
  }
 }
 
 return($ref_flowchart, $ref_routine_repeat_type, $ref_routine_loop_type, $ref_routine_title);
}


#
# 流れ図が正しい構造か確認する。
#
sub check_flowchart {
 my $ref_flowchart = $_[0];
 my $error_message = '';
 
 if(defined($ref_flowchart)){
  if(ref($ref_flowchart) eq "HASH"){
   if(defined($ref_flowchart -> {'0'}) && (ref($ref_flowchart -> {'0'}) eq "ARRAY")){
    if(defined($ref_flowchart -> {'0'} -> [0]) && (ref($ref_flowchart -> {'0'} -> [0]) eq "ARRAY")){
     unless(length($ref_flowchart -> {'0'} -> [0]) > 0){
      $error_message = '流れ図のメインルーチンが空です。';
     }
    }
    else{
     $error_message = '流れ図のメインルーチンが正しく定義されていません。';
    }
   }
   else{
    $error_message = '流れ図のメインルーチンがありません。';
   }
  }
  else{
   $error_message = '流れ図が正しく定義されていません。';
  }
 }
 else{
  $error_message = '流れ図がありません。';
 }
 
 return($error_message);
}



#
# ルーチンの繰り返しタイプが正しい構造か確認する。
#
sub check_routine_repeat_type {
 my $ref_routine_repeat_type = $_[0];
 my $error_message = '';
 
 if(defined($ref_routine_repeat_type)){
  if(ref($ref_routine_repeat_type) eq 'HASH'){
   unless(defined($ref_routine_repeat_type -> {'0'})){
    $error_message = 'メインルーチンの繰り返しタイプが未定義です。';
   }
  }
  else{
   $error_message = '繰り返しタイプが正しく定義されていません。';
  }
 }
 else{
  $error_message = '繰り返しタイプが未定義です。';
 }
 
 return($error_message);
}



#
# ルーチンのループタイプが正しい構造か確認する。
#
sub check_routine_loop_type {
 my $ref_routine_loop_type = $_[0];
 my $error_message = '';
 
 if(defined($ref_routine_loop_type)){
  if(ref($ref_routine_loop_type) eq 'HASH'){
   unless(defined($ref_routine_loop_type -> {'0'})){
    $error_message = 'メインルーチンのループタイプが未定義です。';
   }
  }
  else{
   $error_message = 'ループタイプが正しく定義されていません。';
  }
 }
 else{
  $error_message = 'ループタイプが未定義です。';
 }
 
 return($error_message);
}



#
# ルーチンのタイトルが正しい構造か確認する。
#
sub check_routine_title_type {
 my $ref_routine_title = $_[0];
 my $error_message = '';
 
 if(defined($ref_routine_title)){
  if(ref($ref_routine_title) eq 'HASH'){
   unless(defined($ref_routine_title -> {'0'})){
    $error_message = 'メインルーチンのタイトルが未定義です。';
   }
  }
  else{
   $error_message = 'ルーチンのタイトルが正しく定義されていません。';
  }
 }
 else{
  $error_message = 'ルーチンのタイトルが未定義です。';
 }
 
 return($error_message);
}



#
# ログイン情報を受取る。
#
sub get_login_info {
 my $cgi = $_[0];
 my $ref_login_info = undef;
 my $json_login_info = '';
 my $error_message = '';
 
 my $login_info_json      = $cgi -> param('login_info_json');
 my $login_info_json_file = $cgi -> param('login_info_json_file');
 
 if(defined($login_info_json) && (length($login_info_json) > 0)){
  $json_login_info = $login_info_json;
 }
 elsif(defined($login_info_json_file) && (length($login_info_json_file) > 0)){
  my $fh = $cgi -> upload('login_info_json_file');
  my $size = (stat($fh))[7];
  read($fh, $json_login_info, $size);
 }
 
 $json_login_info =~ s/\r//g;
 $json_login_info =~ s/\n//g;
 
 if(length($json_login_info) > 0){
  eval{
   $ref_login_info = &JSON::from_json($json_login_info);
  };
  
  if(length($@) == 0){
   if(ref($ref_login_info) eq 'HASH'){
    unless(defined($ref_login_info -> {'user'}) && (length($ref_login_info -> {'user'}) > 0) && defined($ref_login_info -> {'password'}) && (length($ref_login_info -> {'password'}) > 0)){
     $error_message = 'ログインIDとログインパスワードを定義して下さい。';
    }
    elsif(!defined($ref_login_info -> {'prompt'}) || (length($ref_login_info -> {'prompt'}) == 0)){
     $error_message = 'プロンプトを定義して下さい。';
    }
    elsif(!defined($ref_login_info -> {'timeout'}) || (length($ref_login_info -> {'timeout'}) == 0)){
     $error_message = 'タイムアウト時間を定義して下さい。';
    }
    elsif($ref_login_info -> {'timeout'} !~ /^[0-9]+$/){
     $error_message = 'タイムアウト時間は正の整数にして下さい。';
    }
    elsif($ref_login_info -> {'timeout'} =~ /^0+$/){
     $error_message = 'タイムアウト時間は1 以上にして下さい。';
    }
    elsif($ref_login_info -> {'timeout'} > 21600){
     $error_message = 'タイムアウト時間は21600 以下にして下さい。';
    }
    elsif(defined($ref_login_info -> {'port'}) && (length($ref_login_info -> {'port'}))){
     if($ref_login_info -> {'port'} !~ /^[0-9]+$/){
      $error_message = 'ポートは正の整数にして下さい。';
     }
     elsif($ref_login_info -> {'port'} =~ /^0+$/){
      $error_message = 'ポートは1 以上にして下さい。';
     }
    }
    
    if(length($error_message) == 0){
     my $check_prompt          = &Telnetman_common::check_prompt_reg($ref_login_info -> {'prompt'});
     my $check_user_prompt     = &Telnetman_common::check_prompt_reg($ref_login_info -> {'user_prompt'});
     my $check_password_prompt = &Telnetman_common::check_prompt_reg($ref_login_info -> {'password_prompt'});
     my $check_enable_prompt   = &Telnetman_common::check_prompt_reg($ref_login_info -> {'enable_prompt'});
     
     if($check_prompt ne '1'){
      $error_message = 'プロンプト : ' . $check_prompt;
     }
     elsif($check_user_prompt ne '1'){
      $error_message = 'ユーザー名プロンプト : ' . $check_user_prompt;
     }
     elsif($check_password_prompt ne '1'){
      $error_message = 'パスワードプロンプト : ' . $check_password_prompt;
     }
     elsif($check_enable_prompt ne '1'){
      $error_message = '特権モードプロンプト : ' . $check_enable_prompt;
     }
    }
   }
   else{
    $error_message = 'ログイン情報が正しく定義されていません。';
   }
   
   $@ = '';
  }
  else{
   $error_message = 'ログイン情報のデータ形式が不正です。';
  }
 }
 else{
  $error_message = 'ログイン情報がありません。';
 }
 
 return($ref_login_info, $json_login_info, $error_message);
}



#
# Diff 設定を受け取る。
#
sub get_diff_values {
 my $cgi = $_[0];
 my $ref_diff_values = undef;
 my $json_diff_values = '';
 my $error_message = '';
 
 my $diff_values_json      = $cgi -> param('diff_values_json');
 my $diff_values_json_file = $cgi -> param('diff_values_json_file');
 
 if(defined($diff_values_json) && (length($diff_values_json) > 0)){
  $json_diff_values = $diff_values_json;
 }
 elsif(defined($diff_values_json_file) && (length($diff_values_json_file) > 0)){
  my $fh = $cgi -> upload('diff_values_json_file');
  my $size = (stat($fh))[7];
  read($fh, $json_diff_values, $size);
 }
 
 $json_diff_values =~ s/\r//g;
 $json_diff_values =~ s/\n//g;
 
 if(length($json_diff_values) > 0){
  eval{
   $ref_diff_values = &JSON::from_json($json_diff_values);
  };
  
  if(length($@) == 0){
   if(ref($ref_diff_values) eq 'HASH'){
    if(!exists($ref_diff_values -> {'diff_value_1'})){
     $error_message = 'Diff 値1が未定義です。';
    }
    elsif(!exists($ref_diff_values -> {'diff_value_2'})){
     $error_message = 'Diff 値2が未定義です。';
    }
    else{
     if(!defined($ref_diff_values -> {'diff_header_1'})){
      $ref_diff_values -> {'diff_header_1'} = '';
     }
     
     if(!defined($ref_diff_values -> {'diff_header_2'})){
      $ref_diff_values -> {'diff_header_2'} = '';
     }
     
     $error_message = &main::check_pattern_5($ref_diff_values -> {'diff_header_1'});
     
     if(length($error_message) == 0){
      $error_message = &main::check_pattern_5($ref_diff_values -> {'diff_header_2'});
     }
     
     if(length($error_message) > 0){
      $error_message = 'Diff タイトルで' . $error_message;
     }
     
     if(length($error_message) == 0){
      $error_message = &main::check_pattern_56($ref_diff_values -> {'diff_value_1'});
      if(length($error_message) > 0){
       $error_message = 'Diff の値で' . $error_message;
      }
     }
     
     if(length($error_message) == 0){
      $error_message = &main::check_pattern_56($ref_diff_values -> {'diff_value_2'});
      if(length($error_message) > 0){
       $error_message = 'Diff の値で' . $error_message;
      }
     }
    }
   }
   else{
    $error_message = 'Diff 設定が連想配列ではありません。';
   }
  }
  else{
   $error_message = 'Diff 設定のデータ形式が不正です。';
  }
  
  $json_diff_values = &JSON::to_json($ref_diff_values);
 }
 
 return($ref_diff_values, $json_diff_values, $error_message);
}



#
# 任意ログ設定を受け取る。
#
sub get_optional_log_values {
 my $cgi = $_[0];
 my $ref_optional_log_values = undef;
 my $json_optional_log_values = '';
 my $error_message = '';
 
 my $optional_log_values_json      = $cgi -> param('optional_log_values_json');
 my $optional_log_values_json_file = $cgi -> param('optional_log_values_json_file');
 
 if(defined($optional_log_values_json) && (length($optional_log_values_json) > 0)){
  $json_optional_log_values = $optional_log_values_json;
 }
 elsif(defined($optional_log_values_json_file) && (length($optional_log_values_json_file) > 0)){
  my $fh = $cgi -> upload('optional_log_values_json_file');
  my $size = (stat($fh))[7];
  read($fh, $json_optional_log_values, $size);
 }
 
 $json_optional_log_values =~ s/\r//g;
 $json_optional_log_values =~ s/\n//g;
 
 if(length($json_optional_log_values) > 0){
  eval{
   $ref_optional_log_values = &JSON::from_json($json_optional_log_values);
  };
  
  if(length($@) == 0){
   if(ref($ref_optional_log_values) eq 'HASH'){
    if(!exists($ref_optional_log_values -> {'optional_log_value'})){
     $error_message = '任意ログが未定義です。';
    }
    else{
     if(!defined($ref_optional_log_values -> {'optional_log_header'})){
      $ref_optional_log_values -> {'optional_log_header'} = '';
     }
     
     $error_message = &main::check_pattern_5($ref_optional_log_values -> {'optional_log_header'});
     
     if(length($error_message) > 0){
      $error_message = '任意ログのヘッダーで' . $error_message;
     }
     
     if(length($error_message) == 0){
      $error_message = &main::check_pattern_56($ref_optional_log_values -> {'optional_log_value'});
      if(length($error_message) > 0){
       $error_message = '任意ログの値で' . $error_message;
      }
     } 
    }
   }
   else{
    $error_message = '任意ログ設定が連想配列ではありません。';
   }
  }
  else{
   $error_message = '任意ログ設定のデータ形式が不正です。';
  }
  
  $json_optional_log_values = &JSON::to_json($ref_optional_log_values);
 }
 
 return($ref_optional_log_values, $json_optional_log_values, $error_message);
}



#
# diff や任意ログが正しく定義できているか確認。
#
sub check_pattern_5 {
 my $value = $_[0];
 my $error_message = '';
 
 if($value =~ /\{\$[0-9]+\}/){
  $error_message = '{$1},{$2},{$3},... は使えません。';
 }
 elsif($value =~ /\{\$\*\}/){
  $error_message = '{$*} は使えません。';
 }
 elsif($value =~ /\{#[0-9]+\}/){
  $error_message = '{#1},{#2},{#3},... は使えません。';
 }
 elsif($value =~ /\{#\*\}/){
  $error_message = '{#*} は使えません。';
 }
 elsif($value =~ /\{\*:.+?\}/){
  $error_message = '{*:変数名} は使えません。';
 }
 elsif($value =~ /\{\$.+?\}/){
  my @parameter_name_list = $value =~ /\{\$(.+?)\}/g;
  foreach my $parameter_name (@parameter_name_list){
   unless(($parameter_name eq 'node') || ($parameter_name eq 'user')){
    $error_message = '{$node} {$user} 以外は使えません。';
    last;
   }
  }
 }
 
 return($error_message);
}

sub check_pattern_56 {
 my $value = $_[0];
 my $error_message = '';
 
 if($value =~ /\{\$[0-9]+\}/){
  $error_message = '{$1},{$2},{$3},... は使えません。';
 }
 elsif($value =~ /\{\$\*\}/){
  $error_message = '{$*} は使えません。';
 }
 elsif($value =~ /\{#[0-9]+\}/){
  $error_message = '{#1},{#2},{#3},... は使えません。';
 }
 elsif($value =~ /\{#\*\}/){
  $error_message = '{#*} は使えません。';
 }
 elsif($value =~ /\{\$.+?\}/){
  my @parameter_name_list = $value =~ /\{\$(.+?)\}/g;
  foreach my $parameter_name (@parameter_name_list){
   unless(($parameter_name eq 'node') || ($parameter_name eq 'user') || ($parameter_name eq 'B')){
    $error_message = '{$node} {$user} {$B} 以外は使えません。';
    last;
   }
  }
 }
 
 return($error_message);
}



#
# syslog 検出のための各値を取得する。
#
sub get_terminal_monitor_values {
 my $cgi = $_[0];
 my $ref_terminal_monitor_values = undef;
 my $json_terminal_monitor_values = '';
 my $error_message = '';
 
 my $terminal_monitor_values_json      = $cgi -> param('terminal_monitor_values_json');
 my $terminal_monitor_values_json_file = $cgi -> param('terminal_monitor_values_json_file');
 
 if(defined($terminal_monitor_values_json) && (length($terminal_monitor_values_json) > 0)){
  $json_terminal_monitor_values = $terminal_monitor_values_json;
 }
 elsif(defined($terminal_monitor_values_json_file) && (length($terminal_monitor_values_json_file) > 0)){
  my $fh = $cgi -> upload('terminal_monitor_values_json_file');
  my $size = (stat($fh))[7];
  read($fh, $json_terminal_monitor_values, $size);
 }
 
 $json_terminal_monitor_values =~ s/\r//g;
 $json_terminal_monitor_values =~ s/\n//g;
 
 if(length($json_terminal_monitor_values) > 0){
  eval{
   $ref_terminal_monitor_values = &JSON::from_json($json_terminal_monitor_values);
  };
  
  if(length($@) == 0){
   if(ref($ref_terminal_monitor_values) eq 'HASH'){
    if(!exists($ref_terminal_monitor_values -> {'command'})){
     $error_message = 'SYSLOG 確認コマンドが未定義です。';
    }
    elsif(!exists($ref_terminal_monitor_values -> {'pattern'})){
     $error_message = 'SYSLOG パターンが未定義です。';
    }
    elsif(!exists($ref_terminal_monitor_values -> {'errors'})){
     $error_message = 'SYSLOG エラーパターンが未定義です。';
    }
    else{
     unless(defined($ref_terminal_monitor_values -> {'command'})){
      $ref_terminal_monitor_values -> {'command'} = '';
     }
     
     if(defined($ref_terminal_monitor_values -> {'pattern'}) && (length($ref_terminal_monitor_values -> {'pattern'}) > 0)){
      my $terminal_monitor_pattern = $ref_terminal_monitor_values -> {'pattern'};
      my $test_string = 'ABCDEFG';
      
      eval{
       my @matches = $test_string =~ /$terminal_monitor_pattern/g;
      };
      
      if(length($@) > 0){
       $error_message = 'SYSLOG パターン「' . $terminal_monitor_pattern . '」が正規表現として正しく無いようです。';
       $@ = '';
      }
     }
     else{
      $ref_terminal_monitor_values -> {'pattern'} = '';
     }
     
     if(defined($ref_terminal_monitor_values -> {'errors'})){
      my $ref_terminal_monitor_errors = $ref_terminal_monitor_values -> {'errors'};
      
      if(ref($ref_terminal_monitor_errors) eq 'ARRAY'){
       my $test_string = 'ABCDEFG';
       
       foreach my $terminal_monitor_error (@$ref_terminal_monitor_errors){
        if(defined($terminal_monitor_error) && (length($terminal_monitor_error) > 0)){
         eval{
          my @matches = $test_string =~ /$terminal_monitor_error/g;
         };
         
         if(length($@) > 0){
          $error_message = 'SYSLOG エラーパターン「' . $terminal_monitor_error . '」が正規表現として正しく無いようです。';
          $@ = '';
          last;
         }
        }
       }
      }
      else{
       $error_message = 'SYSLOG エラーパターンのデータ形式が不正です。';
      }
     }
     else{
      $ref_terminal_monitor_values -> {'errors'} = [];
     }
    }
   }
   else{
    $error_message = 'SYSLOG 設定が連想配列ではありません。';
   }
  }
  else{
   $error_message = 'SYSLOG 設定のデータ形式が不正です。';
  }
  
  $json_terminal_monitor_values = &JSON::to_json($ref_terminal_monitor_values);
 }
 
 return($ref_terminal_monitor_values, $json_terminal_monitor_values, $error_message);
}
