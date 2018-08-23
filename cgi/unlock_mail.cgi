#!/usr/bin/perl
# 説明   : ロック解除メールを送信する。
# 作成者 : 江野高広
# 作成日 : 2015/01/21

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Common_system;
use Common_sub;
use Access2DB;
use Telnetman_auth;



#
# ユーザーID を取得する。
#
my $cgi = new CGI;
my $user_id = $cgi -> param('user_id');
unless(defined($user_id) && (length($user_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0,"reason":"ユーザーID を指定して下さい。"}';
 
 exit(0);
}



#
# URL を取得する。
#
my $url = $cgi -> param('url');
unless(defined($url) && (length($url) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0,"reason":"アクセス先のURL が不明です。"}';
 
 exit(0);
}
elsif($url !~ /^https*:\/\/.+\//){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0,"reason":"アクセス先のURL の書式が不正です。"}';
 
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
# 対象ユーザーのロックID を取得する。
#
my $select_column = 'vcLockingId';
my $table         = 'T_LockedAccount';
my $condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
$access2db -> set_select($select_column, $table, $condition);
my $locking_id = $access2db -> select_col1;

unless(defined($locking_id) && (length($locking_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0,"reason":"ロックされていません。"}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 対象ユーザーの名前とメールアドレスを取得する。
#
$select_column = 'vcUserName,vcUserMailAddress';
$table         = 'T_User';
$condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
$access2db -> set_select($select_column, $table, $condition);
my $ref_User = $access2db -> select_cols;



$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;



my $unse_name         = $ref_User -> [0];
my $user_mail_address = $ref_User -> [1];
my ($scheme_authority) = $url =~ /^https*:\/\/.+?\//g;
$url = $scheme_authority . &Common_system::dir_cgi() . '/unlock.cgi?id=' . $locking_id;

my @administrator_mail_address_list = &Telnetman_auth::administrator_mail_address();
if(scalar(@administrator_mail_address_list) > 0){
 my $from = $administrator_mail_address_list[0];
 my @to = ($user_mail_address);
 my $subject = '【Telnetman】アカウントロック解除';
 my $message = 'システム配信メール' . "\n\n" .
               $unse_name . 'さん' . "\n\n" .
               '以下のアドレスにアクセスするとロック解除されます。' . "\n" .
               $url . "\n";

 &Common_sub::send_mail($from, \@to, \@administrator_mail_address_list, $subject, $message);
}


print "Content-type: text/plain; charset=UTF-8\n\n";
print '{"result":1}';
