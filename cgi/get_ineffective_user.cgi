#!/usr/bin/perl
# 説明   : 承認待ちユーザー一覧を取得する。
# 作成者 : 江野高広
# 作成日 : 2014/06/09

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
# administrator 権限が無ければ終了。
#
my $auth = &Telnetman_auth::check_administrator();

if($auth == 0){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":0}';
 exit(0);
}

my $admin_id = &Telnetman_auth::admin_id();



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# 無効で未利用なユーザーの情報を登録順で取り出す。
#
my $select_column = 'vcUserId,vcUserName,vcUserMailAddress,iUserRegistrationTime';
my $table         = 'T_User';
my $condition     = 'where iEffective = 0 and iUserLastActivationTime = 0 order by iUserRegistrationTime';
$access2db -> set_select($select_column, $table, $condition);
my $ref_User = $access2db -> select_array_cols;


$access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
$access2db -> close;


#
# iUserRegistrationTime を無理やり数値にする。
#
foreach my $ref_cols (@$ref_User){
 $ref_cols -> [3] += 0;
}


#
# 結果をJSON にする。
#
my %result = (
 "auth" => 1,
 "user_list" => $ref_User
);
my $json_result = &JSON::to_json(\%result);


print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
