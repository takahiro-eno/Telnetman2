#!/usr/bin/perl
# 説明   : 画像認証とその他ユーザー情報の登録。
# 作成者 : 江野高広
# 作成日 : 2014/05/29
# 更新 2016/05/25 : 管理者にメール通知。

use strict;
use warnings;

use CGI;
use JSON;
use MIME::Base64;
use GD::SecurityImage::AC;

use lib '/usr/local/Telnetman2/lib';
use Common_system;
use Common_sub;
use Access2DB;
use Telnetman_auth;

# yum
# ========
# perl-GD
# ImageMagick-perl
# perl-Test-Simple

# CPAN
# ========
# GD-SecurityImage
# GD-SecurityImage-AC

my $cgi = new CGI;
my $security_code = $cgi -> param('security_code');
my $md5sum        = $cgi -> param('md5sum');
my $url           = $cgi -> param('url');


#
# 画像認証用のコードとkey が無ければ終了。
#
unless(defined($security_code) && (length($security_code) > 0) && defined($md5sum) && (length($md5sum) > 0)){
 my $json_result = &main::make_result(0, '認証文字を入力して下さい。');
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}


#
# GD オブジェクトの生成。
#
my $captcha = GD::SecurityImage::AC -> new;
my $dir_captcha = &Common_system::dir_captcha();
$captcha -> data_folder($dir_captcha);


#
# コードが正しいか確認。
#
my $captcha_result = $captcha -> check_code($security_code, $md5sum);
my $captcha_message = '';

if($captcha_result == 0){
 $captcha_message = '認証文字のチェックに失敗しました。';
}
elsif($captcha_result == -1){
 $captcha_message = '認証文字の有効期限が切れています。';
}
elsif($captcha_result == -2){
 $captcha_message = '無効な認証文字です。';
}
elsif($captcha_result == -3){
 $captcha_message = '認証文字が一致しません。';
}

if($captcha_result <= 0){
 my $json_result = &main::make_result(0, $captcha_message);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}

#
# コード認証関連ここまで
#


#
# ユーザー情報の取り出し。不足.不備があれば終了。
#
my $user_id           = $cgi -> param('user_id');
my $user_password     = $cgi -> param('user_password');
my $user_name         = $cgi -> param('user_name');
my $user_mail_address = $cgi -> param('user_mail_address');

unless(defined($user_id)           && (length($user_id) > 0) &&
       defined($user_password)     && (length($user_password) > 0) &&
       defined($user_name)         && (length($user_name) > 0) &&
       defined($user_mail_address) && (length($user_mail_address) > 0)){
 
 my $json_result = &main::make_result(0, 'ユーザー情報が足りません。');
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}
elsif(length($user_id) > 60){
 my $json_result = &main::make_result(0, 'ユーザーID は60 文字以内にして下さい。');
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}
elsif($user_id =~ /\s/){
 my $json_result = &main::make_result(0, 'ユーザーID に空白を含めないで下さい。');
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}
elsif(&Common_sub::check_fullsize_character($user_id) == 0){
 my $json_result = &main::make_result(0, 'ユーザーID に全角文字を含めないで下さい。');
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}
elsif($user_password =~ /\s/){
 my $json_result = &main::make_result(0, 'パスワードに空白を含めないで下さい。');
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 exit(0);
}


#
# sql 文字をエスケープする。
#
$user_id           = &Common_sub::escape_sql($user_id);
$user_name         = &Common_sub::escape_sql($user_name);
$user_mail_address = &Common_sub::escape_sql($user_mail_address);


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);


#
# エイリアスが既に使われていないか確認。使われていなければ登録。
#
my $select_column = 'count(*)';
my $table         = 'T_User';
my $condition     = "where vcUserId = '" . $user_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $count = $access2db -> select_col1;

my $result_code = 1;
my $message = '登録しました。' . "\n" . '管理者の承認をお待ち下さい。';

if($count == 0){
 #
 # パスワードをエンコードする。
 #
 my $encoded_password = &Common_sub::encode_password($user_password);
 
 #
 # 登録時刻
 #
 my $registration_time = time;
 
 my $insert_column = 'vcUserId,vcUserPassword,vcUserName,vcUserMailAddress,iMaxSessionNumber,iEffective,iUserRegistrationTime,iUserLastActivationTime';
 my @values = ("('" . $user_id . "','" . $encoded_password . "','" . $user_name . "','" . $user_mail_address . "',5,0," . $registration_time . ",0)");
 $access2db -> set_insert($insert_column, \@values, $table);
 my $rv = $access2db -> insert_exe;
 
 if($rv == 1){
  # グループの登録
  my $json_group_list = $cgi -> param('json_group_list');
  my $ref_group_list = &JSON::from_json($json_group_list);
  foreach my $group_id (@$ref_group_list){
   $insert_column = 'vcUserId,vcGroupId';
   $table = 'T_UserGroup';
   my @values_user_group = ("('" . $user_id . "','" . $group_id . "')");
   $access2db -> set_insert($insert_column, \@values_user_group, $table);
   $access2db -> insert_exe;
   
   $insert_column = 'vcGroupId,vcUserId';
   $table = 'T_GroupUser';
   my @values_group_user = ("('" . $group_id . "','" . $user_id . "')");
   $access2db -> set_insert($insert_column, \@values_group_user, $table);
   $access2db -> insert_exe;
  }
  
  my $dir_html = &Common_system::dir_html();
  $dir_html = &Common_sub::escape_reg($dir_html);
  $url =~ s/$dir_html\/.+/$dir_html\/authorize_user\.html/;
  
  my @administrator_mail_address_list = &Telnetman_auth::administrator_mail_address();
  if(scalar(@administrator_mail_address_list) > 0){
   my $from = $administrator_mail_address_list[0];
   my $subject = '【Telnetman】ユーザー登録通知';
   my $body = 'Telnetman 管理者各位' . "\n\n" . 'ユーザー登録がありました。'. "\n" . '問題無ければ承認して下さい。' . "\n\n" . 'name : ' . $user_name . "\n" . 'id : ' . $user_id . "\n" . 'mail : ' . $user_mail_address . "\n\n" . $url . "\n\n" . '(システム配信メール)';
   
   #&Common_sub::send_mail($from, \@administrator_mail_address_list, \@administrator_mail_address_list, $subject, $body);
  }
 }
 else{
  $result_code = 0;
  $message     = '登録に失敗しました。';
 }
}
else{
 $result_code = 0;
 $message     = 'そのエイリアスは既に使われています。';
}

$access2db -> close;


my $json_result = &main::make_result($result_code, $message);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;


sub make_result {
 my $result_code = $_[0];
 my $message = $_[1];
 
 my %result = (
  'result'  => $result_code,
  'message' => $message
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 return($json_result);
}
