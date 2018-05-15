#!/usr/bin/perl
# 説明   : ユーザー情報を更新する。
# 作成者 : 江野高広
# 作成日 : 2017/12/11

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Telnetman_auth;
use Common_system;
use Access2DB;
use Common_sub;

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
# 変更内容を取得。
#
my $cgi = new CGI;
my $user_id = $cgi -> param('user_id');

unless(defined($user_id) && (length($user_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":0,"result":0,"reason":"ユーザーID が指定されていません。"}';
 exit(0);
}

my $user_name = $cgi -> param('user_name');
my $user_mail_address = $cgi -> param('user_mail_address');
my $user_password = $cgi -> param('user_password');

unless(defined($user_name)){
 $user_name = '';
}

unless(defined($user_mail_address)){
 $user_mail_address = '';
}

unless(defined($user_password)){
 $user_password = '';
}

my $encoded_password = '';

if(length($user_password) > 0){
 $encoded_password = &Common_sub::encode_password($user_password);
}



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# 更新。
#
my @set = ();

if(length($user_name) > 0){
 push(@set, "vcUserName = '" . &Common_sub::escape_sql($user_name) . "'");
}

if(length($user_mail_address) > 0){
 push(@set, "vcUserMailAddress = '" . &Common_sub::escape_sql($user_mail_address) . "'");
}

if(length($encoded_password) > 0){
 push(@set, "vcUserPassword = '" . $encoded_password . "'");
}

if(scalar(@set) > 0){
 my $table     = 'T_User';
 my $condition = "where vcUserId = '" . $user_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
}


$access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
$access2db -> close;


#
# 結果をJSON にする。
#
my %result = (
 'auth' => 1,
 'result' => 1,
 'user_id' => $user_id
);
my $json_result = &JSON::to_json(\%result);


print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
