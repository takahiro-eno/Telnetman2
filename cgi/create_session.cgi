#!/usr/bin/perl
# 説明   : セッションを新規作成する。
# 作成者 : 江野高広
# 作成日 : 2014/06/20

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Telnetman_auth;
use Common_sub;
use Common_system;
use Access2DB;
use Generate_session;

my $create = 1;


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
my $login = $telnetman_auth -> check_login;

if($login == 0){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":0,"session":0}';
 
 $access2db -> close;
 
 exit(0);
}


#
# ユーザーID, iMaxSessionNumber を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;
my $max_session_number =  $telnetman_auth -> get_max_session_number;


#
# 現在のセッション数を確認する。
#
my $select_column = 'count(*)';
my $table         = 'T_SessionList';
my $condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
$access2db -> set_select($select_column, $table, $condition);
my $count = $access2db -> select_col1;


#
# 上限数に達していなかったらセッションを新規作成する。
#
my $session_id = '';
if(($count < $max_session_number) || ($max_session_number == 0)){
 # タイトルを取得する。
 my $cgi = new CGI;
 my $session_title = $cgi -> param('session_title');
 unless(defined($session_title) && (length($session_title) > 0)){
  $session_title = '';
 }
 
 $session_id = &Generate_session::gen($access2db, $user_id, $session_title);
}
else{
 $create = 0;
}


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


#
# 結果をまとめる。
#
my %results = (
 'login' => 1,
 'create' => $create,
 'max_session_number' => $max_session_number,
 'session_id' => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
