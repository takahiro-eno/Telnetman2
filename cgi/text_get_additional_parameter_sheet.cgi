#!/usr/bin/perl
# 説明   : 追加パラメーターシートのみを取得する。
# 作成者 : 江野高広
# 作成日 : 2015/07/08

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
$access2db -> log_file(&Common_system::file_sql_log());



#
# 認証
#
my $telnetman_auth = Telnetman_auth -> new($access2db);
my $login   = $telnetman_auth -> check_login;
my $session = $telnetman_auth -> check_session;

unless(($login == 1) && ($session == 1)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'login:' . $login  . "\n";
 print 'session:' . $session . "\n";
 
 $access2db -> close;
 exit(0);
}



#
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;



$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
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
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'login:1' . "\n";
 print 'session:1' . "\n";
 print 'session_id:' . $session_id . "\n";
 print 'result:0' . "\n";
 print 'reason:ノードを指定して下さい。';
 
 exit(0);
}



#
# 追加パラメーターシートを開く。
#
my $file_additional_parameter_sheet = &Common_system::file_additional_parameter_sheet($session_id, $node);
my $json_additional_parameter_sheet = '';
if(-f $file_additional_parameter_sheet){
 open(PSHEET, '<', $file_additional_parameter_sheet);
 $json_additional_parameter_sheet = <PSHEET>;
 close(PSHEET);
}
else{
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'login:1' . "\n";
 print 'session:1' . "\n";
 print 'session_id:' . $session_id . "\n";
 print 'result:0' . "\n";
 print 'reason:追加パラメーターシートがありません。';
 
 exit(0);
}



print "Content-type: text/plain; charset=UTF-8\n\n";
print 'login:1' . "\n";
print 'session:1' . "\n";
print 'session_id:' . $session_id . "\n";
print 'result:1' . "\n";
print 'json_additional_parameter_sheet:' . $json_additional_parameter_sheet;
