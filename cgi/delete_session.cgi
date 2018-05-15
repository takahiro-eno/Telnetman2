#!/usr/bin/perl
# 説明   : セッションを削除する。
# 作成者 : 江野高広
# 作成日 : 2014/06/24

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
my $login = $telnetman_auth -> check_login;

if($login == 0){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":0,"session":0}';
 
 $access2db -> close;
 exit(0);
}


#
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;


#
# セッションID を取得する。
#
my $cgi = new CGI;
my $session_id = $cgi -> param('session_id');
unless(defined($session_id) && (length($session_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"delete":-1}';
 
 $access2db -> close;
 exit(0);
}


#
# セッションステータスを取得する。
#
my $select_column = 'iSessionStatus,vcUserId';
my $table         = 'T_SessionStatus';
my $condition     = "where vcSessionId = '" . $session_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $ref_SessionList = $access2db -> select_cols;

my ($session_status, $_user_id) = @$ref_SessionList;
$session_status += 0;


#
# 他人のセッションを削除しようとする不正アクセスの場合は終了。
#
unless($user_id eq $_user_id){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"delete":-2}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}


#
# telnet 実行中の場合は削除しない。
#
if(($session_status == 1) || ($session_status == 2) || ($session_status == 3)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"delete":0,"session_status":' . $session_status . '}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}


#
# セッションデータを圧縮保存する。
#
&Telnetman_common::insert_archive_data($access2db, $session_id);
&Telnetman_common::archive_session_data($session_id);


#
# セッション削除
#
&Telnetman_common::delete_session($access2db, $user_id, $session_id);


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


#
# 結果をまとめる。
#
my %results = (
 'login' => 1,
 'delete' => 1,
 'session_status' => $session_status,
 'session_id' => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
