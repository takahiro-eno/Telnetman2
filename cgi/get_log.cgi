#!/usr/bin/perl
# 説明   : telnet ログを取得する。
# 作成者 : 江野高広
# 作成日 : 2014/09/02

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Telnetman_auth;
use Common_system;
use Access2DB;


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



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



$access2db -> close;



#
# セッションID を取得。
#
my $session_id = $telnetman_auth -> get_session_id;



#
# 対象ノードを受け取る。
#
my $cgi = new CGI;
my $node = $cgi -> param('node');
unless(defined($node) && (length($node) > 0)){
 my %result = (
  'login' => 1,
  'session' => 1,
  'session_id' => $session_id,
  'result' => 0,
  'reason' => 'ノードを指定して下さい。'
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 exit(0);
}



#
# ログファイルを特定する。
#
my $sjis = $cgi -> param('sjis');
my $file_telnet_log = '';
if(defined($sjis) && ($sjis eq '1')){
 $file_telnet_log = &Common_system::file_telnet_log_sjis($session_id, $node);
}
else{
 $file_telnet_log = &Common_system::file_telnet_log($session_id, $node);
}

unless((length($file_telnet_log) > 0) && (-f $file_telnet_log)){
 my %result = (
  'login' => 1,
  'session' => 1,
  'session_id' => $session_id,
  'result' => 0,
  'reason' => 'ログが見つかりませんでした。'
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 exit(0);
}




#
# ログファイルを開く。
#
my $log = '';
open(TLOG, '<', $file_telnet_log);
while(my $ line = <TLOG>){
 $log .= $line;
}
close(TLOG);



my %results = (
 'login' => 1,
 'session' => 1,
 'session_id' => $session_id,
 'result' => 1,
 'node' => $node,
 'log' => $log
);



#
# 追加パラメーターシートを結果に混ぜる。 
#
my $get_additional_parameter_sheet = $cgi -> param('additional_parameter_sheet');
if(defined($get_additional_parameter_sheet) && ($get_additional_parameter_sheet eq '1')){
 my $file_additional_parameter_sheet = &Common_system::file_additional_parameter_sheet($session_id, $node);
 
 if(-f $file_additional_parameter_sheet){
  open(PSHEET, '<', $file_additional_parameter_sheet);
  my $json_additional_parameter_sheet = <PSHEET>;
  close(PSHEET);
  
  my $ref_additional_parameter_sheet = &JSON::from_json($json_additional_parameter_sheet);
  $results{'additional_parameter_sheet'} = $ref_additional_parameter_sheet;
 }
}


my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
