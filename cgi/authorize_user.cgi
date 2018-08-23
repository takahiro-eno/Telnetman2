#!/usr/bin/perl
# 説明   : 承認待ちユーザーを承認する。
# 作成者 : 江野高広
# 作成日 : 2014/06/10
# 更新 2016/05/25 : ユーザーにメール通知。

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
# ユーザーIndex を受け取る。
#
my $cgi = new CGI;
my $user_id = $cgi -> param('user_id');
unless(defined($user_id) && (length($user_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0}';
 exit(0);
}


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# ユーザーを承認する。
#
my @set = ('iEffective = 1');
my $table = 'T_User';
my $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
$access2db -> set_update(\@set, $table, $condition);
my $count = $access2db -> update_exe;


#
# ユーザーにメール通知。
#
my $result = 1;
if($count == 1){
 my $url = $cgi -> param('url');
 my $dir_html = &Common_system::dir_html();
 $dir_html = &Common_sub::escape_reg($dir_html);
 $url =~ s/$dir_html\/.+/$dir_html\/index\.html/;
 
 my $select_column = 'vcUserName,vcUserMailAddress';
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_User = $access2db -> select_cols;
 
 my @administrator_mail_address_list = &Telnetman_auth::administrator_mail_address();
 if(scalar(@administrator_mail_address_list) > 0){
  my $from = $administrator_mail_address_list[0];
  my ($user_name, $user_mail_address) = @$ref_User;
  my $subject = '【Telnetman】ユーザー登録完了通知';
  my $body = $user_name . ' さん' . "\n\n" . 'ユーザー登録が承認されました。' . "\n" . 'ログインできるか確認して下さい。' . "\n\n" . $url . "\n\n" . '(システム配信メール)';
  
  #&Common_sub::send_mail($from, $user_mail_address, \@administrator_mail_address_list, $subject, $body);
 }
}
else{
 $result = -1;
}

$access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
$access2db -> close;


print "Content-type: text/plain; charset=UTF-8\n\n";
print '{"auth":1,"result":' . $result . ',"user_id":"' . $user_id . '"}';
