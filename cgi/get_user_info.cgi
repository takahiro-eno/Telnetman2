#!/usr/bin/perl
# 説明   : ユーザー一覧を取得する。
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
# 検索条件の作成。
#
my $cgi = new CGI;
my $search_word = $cgi -> param('search_word');

unless(defined($search_word)){
 $search_word = '';
}

my $condition = '';

if(length($search_word) > 0){
 my $escaped_search_word = &Common_sub::escape_sql($search_word);
 $condition = "where vcUserId like '%" . $escaped_search_word . "%' or vcUserName like '%" . $escaped_search_word . "%' ";
}

$condition .= 'order by iUserRegistrationTime';



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# ユーザーの情報を登録順で取り出す。
#
my $select_column = 'vcUserId,vcUserName,vcUserMailAddress,iUserRegistrationTime,iUserLastActivationTime';
my $table         = 'T_User';
$access2db -> set_select($select_column, $table, $condition);
my $ref_User = $access2db -> select_array_cols;


$access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
$access2db -> close;



#
# 結果をまとめる。
#
my @user_list = ();
foreach my $ref_row (@$ref_User){
 my ($user_id, $user_name, $user_mail_address, $registration_time, $activation_time) = @$ref_row;
 $registration_time += 0;
 $activation_time   += 0;
 
 my %user_info = (
  'user_id'   => $user_id,
  'user_name' => $user_name,
  'user_mail_address' => $user_mail_address,
  'registration_time' => $registration_time,
  'activation_time'   => $activation_time
 );
 
 push(@user_list, \%user_info);
}
 


#
# 結果をJSON にする。
#
my %result = (
 'auth' => 1,
 'user_list' => \@user_list
);
my $json_result = &JSON::to_json(\%result);


print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
           