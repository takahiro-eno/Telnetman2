#!/usr/bin/perl
# 説明   : telnet の一時停止、再開、強制終了を行う。
# 作成者 : 江野高広
# 作成日 : 2014/09/03

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_system;
use Common_sub;
use Access2DB;
use Telnetman_common;

#
# 現在時刻。
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
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;



#
# セッションID を取得。
#
my $session_id = $telnetman_auth -> get_session_id;



#
# 移行先のステータスを受け取る。
#
my $cgi = new CGI;
my $node_status = $cgi -> param('status');

unless(defined($node_status) && (length($node_status) > 0)){
 my %result = (
  'login' => 1,
  'session' => 1,
  'session_id' => $session_id,
  'result' => 0,
  'reason' => '移行先のステータスを指定して下さい。'
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> close;
 exit(0);
}


if($node_status eq 'resumption'){# 再開
 $node_status = '2';
}
elsif($node_status eq 'pause'){# 一時停止
 $node_status = '1';
}
elsif($node_status eq 'forced_termination'){# 強制終了
 $node_status = '7';
}
else{
 my %result = (
  'login' => 1,
  'session' => 1,
  'session_id' => $session_id,
  'result' => 0,
  'reason' => '指定された移行先のステータス' . $node_status . ' は認識できないものです。。'
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> close;
 exit(0);
}




#
# 変更対象となる現在のステータスを定義する。
#
my $additional_condition = '';
if($node_status eq '2'){
 $additional_condition = 'iNodeStatus = 1';
}
elsif($node_status eq '1'){
 $additional_condition = 'iNodeStatus = 2';
}
elsif($node_status eq '7'){
 $additional_condition = '(iNodeStatus = 1 or iNodeStatus = 2)';
}



#
# 強制終了の場合はログを残す。
#
if($node_status eq '7'){
 my $select_column = 'vcIpAddress';
 my $table     = 'T_NodeStatus';
 my $condition = "where vcSessionId = '" . $session_id . "' and " . $additional_condition;
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_terminated_nodes = $access2db -> select_array_col1;
 
 my $log_header = &Telnetman_common::make_telnet_log_header(7, $time);
 
 foreach my $node (@$ref_terminated_nodes){
  &Telnetman_common::make_telnet_log($session_id, $node, $log_header);
 }
}



#
# ノードステータスを変更する。
#
my @set = ('iUpdateTime = ' . $time, 'iNodeStatus = ' . $node_status);
my $table     = 'T_NodeStatus';
my $condition = "where vcSessionId = '" . $session_id . "' and " . $additional_condition;
$access2db -> set_update(\@set, $table, $condition);
$access2db -> update_exe;



#
# セッションステータスを変更する。
#
my $session_status = &Telnetman_common::update_session_status($access2db, $session_id, $time);



#
# queue にこのセッションが登録されているか確認する。
#
my $select_column = 'count(*)';
$table         = 'T_Queue';
$condition     = "where vcSessionId = '" . $session_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $exists_queue = $access2db -> select_col1;



#
# queue に無く、セッションステータスが待機中であればqueue に入れる。
# それ以外の場合はqueue から削除する。
#
if(($exists_queue == 0) && ($session_status == 2)){
 &Telnetman_common::push_queue($access2db, $session_id);
}
elsif(($exists_queue > 0) && ($session_status != 2)){
 $table     = 'T_Queue';
 $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
}


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


my %results = (
 'login' => 1,
 'session' => 1,
 'session_id' => $session_id,
 'result' => 1
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
