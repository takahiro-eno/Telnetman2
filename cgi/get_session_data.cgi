#!/usr/bin/perl
# 説明   : パラメーターシート、ログイン情報、SYSLOG 確認設定, Diff 設定、任意ログ設定をJSON でダウンロードする。
# 作成者 : 江野高広
# 作成日 : 2016/07/19

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_sub;
use Common_system;
use Access2DB;
use Telnetman_common;

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



$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;




#
# パラメーターシート、ログイン情報、SYSLOG 確認設定, Diff 設定、任意ログ設定をJSON で取り出して結果をまとめる。
#
my %results = (
 'login' => 1,
 'session' => 1,
 'result' => 1,
 'session_id' => $session_id
);

foreach my $data_type ('parameter_sheet', 'login_info', 'terminal_monitor_values', 'diff_values', 'optional_log_values'){
 my $json_data = &Telnetman_common::read_session_data($session_id, $data_type);
 
 if(length($json_data) > 0){
  my $ref_data = &JSON::from_json($json_data);
  $results{$data_type} = $ref_data;
 }
}



my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
