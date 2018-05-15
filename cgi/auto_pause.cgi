#!/usr/bin/perl
# 説明   : 自動一時停止機能を有効、無効にする。
# 作成者 : 江野高広
# 作成日 : 2015/01/09

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
# 有効、無効を取得。
#
my $cgi = new CGI;
my $auto_pause = $cgi -> param('auto_pause');
unless(defined($auto_pause) && ($auto_pause == 1)){
 $auto_pause = 0;
}



#
# 有効、無効を更新。
#
my @set = ('iAutoPause = ' . $auto_pause);
my $table     = 'T_SessionStatus';
my $condition = "where vcSessionId = '" . $session_id . "'";
$access2db -> set_update(\@set, $table, $condition);
$access2db -> update_exe;


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


$auto_pause += 0;

my %results = (
 'login' => 1,
 'session' => 1,
 'session_id' => $session_id,
 'auto_pause' => $auto_pause
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
