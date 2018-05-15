#!/usr/bin/perl
# 説明   : ログアウト
# 作成者 : 江野高広
# 作成日 : 2014/09/19

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
# セッションID の取得
#
my $session_id = $telnetman_auth -> get_session_id;



#
# ログインID の取得
#
my $login_id = $telnetman_auth -> get_login_id;



#
# ログインID の削除
#
my $table     = 'T_LoginList';
my $condition = "where vcLoginId = '" . $login_id . "'";
$access2db -> set_delete($table, $condition);
$access2db -> delete_exe;


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


my %results = (
 'login' => 1,
 'session' => 1,
 'session_id' => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
