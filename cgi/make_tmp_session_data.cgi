#!/usr/bin/perl
# 説明   : セッションデータファイルのコピーを作る。
# 作成者 : 江野高広
# 作成日 : 2014/09/22
# 更新   : 2018/01/30 syslog確認、diff、任意ログの設定をダウンロードできうように。

use strict;
use warnings;

use CGI;
use JSON;
use File::Copy;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Telnetman_common;
use Common_system;
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
# セッションID の取得
#
my $session_id = $telnetman_auth -> get_session_id;



#
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;



$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;



#
# データタイプの取得
#
my $cgi = new CGI;
my $data_type = $cgi -> param('data_type');
unless(defined($data_type) && (length($data_type) > 0)){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'データタイプを指定して下さい。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 exit(0);
}
elsif(($data_type ne 'parameter_sheet') && ($data_type ne 'login_info') && ($data_type ne 'terminal_monitor_values') && ($data_type ne 'diff_values') && ($data_type ne 'optional_log_values') && ($data_type ne 'before_flowchart') && ($data_type ne 'middle_flowchart') && ($data_type ne 'after_flowchart')){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'データタイプはparameter_sheet, login_info, terminal_monitor_values, diff_values, optional_log_values, before_flowchart, middle_flowchart, after_flowchart のどれかを指定して下さい。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 exit(0);
}



#
# データファイルのコピー。
#
if(($data_type eq 'before_flowchart') || ($data_type eq 'middle_flowchart') || ($data_type eq 'after_flowchart')){
 my $flowchart_type = '';
 
 if($data_type eq 'before_flowchart'){
  $flowchart_type = 'before';
 }
 elsif($data_type eq 'middle_flowchart'){
  $flowchart_type = 'middle';
 }
 elsif($data_type eq 'after_flowchart'){
  $flowchart_type = 'after';
 }
 
 my %flowchart_data = ();
 
 foreach my $data_type ('flowchart', 'routine_repeat_type', 'routine_title', 'routine_loop_type'){
  my $json = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_' . $data_type);
  my $ref  = &JSON::from_json($json);
  $flowchart_data{$data_type} = $ref;
 }
 
 my $json_flowchart_data = &JSON::to_json(\%flowchart_data);
 
 my $copy_file = &Common_system::file_tmp_session_data($session_id, $data_type);
 open(FLOWCHARTDATA, '>', $copy_file);
 print FLOWCHARTDATA $json_flowchart_data;
 close(FLOWCHARTDATA);
}
else{
 my $from = &Common_system::file_session_data($session_id, $data_type);
 my $to   = &Common_system::file_tmp_session_data($session_id, $data_type);
 &File::Copy::copy($from, $to);
}



my %results = (
 'login'      => 1,
 'session'    => 1,
 'result'     => 1,
 'session_id' => $session_id,
 'data_type'  => $data_type
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
