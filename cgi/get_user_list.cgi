#!/usr/bin/perl
# 説明   : ユーザーのID と名前一覧を取得する。
# 作成者 : 江野高広
# 作成日 : 2014/11/27

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
# ユーザー一覧を取得する。
#
my $select_column = 'vcUserId,vcUserName';
my $table         = 'T_User';
my $condition     = 'order by iUserRegistrationTime';
$access2db -> set_select($select_column, $table, $condition);
my $ref_User = $access2db -> select_array_cols;



$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;



#
# 結果をまとめる。
#
my @user_id_list = ();
my %user_name_list = ();
foreach my $ref_row (@$ref_User){
 my ($user_id, $user_name) = @$ref_row;
 
 push(@user_id_list, $user_id);
 $user_name_list{$user_id} = $user_name;
}



my %results = (
 'login' => 1,
 'session' => 1,
 'session_id' => $session_id,
 'user_id_list' => \@user_id_list,
 'user_name_list' => \%user_name_list
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
