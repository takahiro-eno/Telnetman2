#!/usr/bin/perl
# 説明   : 管理者アカウントを作成する。
# 作成者 : 江野高広
# 作成日 : 2014/06/09
# 更新 : 2016/05/18 Term::ReadKey 導入。

use strict;
use warnings;

use Term::ReadKey;

use lib '/usr/local/Telnetman2/lib';
use Common_sub;
use Telnetman_auth;

if($< != 0){
 print 'root 権限で実行して下さい。' . "\n";
 exit(0);
}

print 'Administrator ID : ';
ReadMode 'normal';
my $id = ReadLine 0;
chomp($id);

print 'Password : ';
ReadMode "noecho";
my $password = ReadLine 0;
chomp($password);
ReadMode 'restore';

print "\n" . 'Verify Password : ';
ReadMode "noecho";
my $verify = ReadLine 0;
chomp($verify);
ReadMode 'restore';
print "\n";

print 'Administrator Mail Address : ';
ReadMode 'normal';
my $mail = ReadLine 0;
chomp($mail);


if(!defined($id) || (length($id) == 0)){
 print 'ID が未定義です。' . "\n";
 exit(0);
}
elsif(!defined($password) || (length($password) == 0)){
 print 'Password が未定義です。' . "\n";
 exit(0);
}
elsif(!defined($mail) && (length($mail) == 0)){
 print 'メールアドレス が未定義です。' . "\n";
 exit(0);
}
elsif($id =~ /\s/){
 print 'ID に空白文字は使えません。' . "\n";
 exit(0);
}
elsif($password =~ /\s/){
 print 'Password に空白文字は使えません。' . "\n";
 exit(0);
}
elsif($password ne $verify){
 print 'Password が一致しません。' . "\n";
 exit(0);
}
elsif(&Common_sub::check_mail_address($mail) == 0){
 print 'メールアドレスが不正です。' . "\n";
 exit(0);
}


&Telnetman_auth::create_administrator($id, $password, $mail);

my $file_auth = &Common_system::file_auth();
my $ok_auth = 0;
if(-f $file_auth){
 open(TELNETMANAUTH, '<', $file_auth);
 flock(TELNETMANAUTH, 1);
 while(my $line = <TELNETMANAUTH>){
  my $_id = (split(/\s/, $line))[0];
  
  if($_id eq $id){
   $ok_auth = 1;
   last;
  }
 }
 close(TELNETMANAUTH);
}

my $admin_mail = 0;
my $administrator_mail_address = &Telnetman_auth::administrator_mail_address($id);
if($mail eq $administrator_mail_address){
 $admin_mail = 1;
}

if(($ok_auth == 1) && ($admin_mail == 1)){
 print '管理者を追加しました。' . "\n";
}
else{
 print '追加できませんでした。' . "\n";
 
 if($< != 0){
  print 'root 権限で実行してみて下さい。' . "\n";
 }
}
