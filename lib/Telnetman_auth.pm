#!/usr/bin/perl
# 説明   : $ENV{'HTTP_TELNETMNAUTH'} でHTTP リクエストからヘッダーを取得。そこから認証文字列を取り出して認証処理を行う。
# 
# 通常認証の書式       : Telnetman ログインID セッションID
# 管理者ページ用の書式 : Administrator ユーザーID パスワード
# 
# 作成日 : 2014/06/06
# 作成者 : 江野高広
# 更新   : 2018/08/23 一度も管理者アカウントが作成されていなければ、初期管理者アカウントとしてadmin/tcpport23 のアクセスを許可する。

use strict;
use warnings;

use lib '/usr/local/Telnetman2/lib';
use Common_sub;
use Common_system;
use Generate_session;

package Telnetman_auth;

sub new {
 my $self = $_[0];
 my $access2db = $_[1];
 my $time = time;
 
 my %parameter_list = (
  'login' => 0,
  'session' => 0,
  'access2db' => $access2db,
  'time' => $time,
  'user_id' => '',
  'max_session_number' => 5,
  'session_id' => '',
  'login_id' => ''
 );
 
 bless(\%parameter_list, $self);
}


#
# ユーザーIndex , iMaxSessionNumber, session_id, login_id を返す。
#
sub get_user_id {
 my $self = $_[0];
 return($self -> {'user_id'});
}

sub get_max_session_number {
 my $self = $_[0];
 return($self -> {'max_session_number'});
}

sub get_session_id {
 my $self = $_[0];
 return($self -> {'session_id'});
}

sub get_login_id {
 my $self = $_[0];
 return($self -> {'login_id'});
}

#
# ログインID の有無、ログインしているか、ログインが有効かどうかを判定する。
#
sub check_login {
 my $self = $_[0];
 my $time = $self -> {'time'};
 
 my $http_authorization = $ENV{'HTTP_TELNETMANAUTH'};
 
 unless(defined($http_authorization) && (length($http_authorization) > 0)){
  return(0);
 }
 elsif($http_authorization !~ /^Telnetman/){
  return(0);
 }
 
 my ($login_id, $session_id) = (split(/\s/, $http_authorization))[1,2];
 
 unless(defined($login_id) && (length($login_id) > 0)){
  return(0);
 }
 
 unless(defined($session_id) && (length($session_id) > 0)){
  $session_id = '';
 }
 
 $self -> {'login_id'}   = $login_id;
 $self -> {'session_id'} = $session_id;
 
 my $access2db = $self -> {'access2db'};
 
 my $select_column = 'vcUserId,iLastAccessTime';
 my $table         = 'T_LoginList';
 my $condition     = "where vcLoginId = '" . $login_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_LoginList = $access2db -> select_cols;
 
 
 # ログインしているかどうかの確認。
 my $user_id = '';
 my $last_access_time = 0;
 if(scalar(@$ref_LoginList) > 0){
  ($user_id, $last_access_time) = @$ref_LoginList;
  $self -> {'user_id'} = $user_id;
 }
 else{
  return(0);
 }
 
 # 最大セッション数の取得。
 $select_column = 'iMaxSessionNumber';
 $table         = 'T_User';
 $condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $max_session_number = $access2db -> select_col1;
 
 $max_session_number += 0;
 $self -> {'max_session_number'} = $max_session_number;
 
 
 # ログインが時間切れでないかの確認とiMaxSessionNumber = 0 の特権ユーザーかどうかの確認。 
 my $time_2hours_ago = $time - 7200;
 if(($last_access_time > $time_2hours_ago) || ($max_session_number == 0)){
  my @set = ('iLastAccessTime = ' . $time);
  $table     = 'T_LoginList';
  $condition = "where vcLoginId = '" . $login_id . "'";
  $access2db -> set_update(\@set, $table, $condition);
  $access2db -> update_exe;
 }
 else{
  $table     = 'T_LoginList';
  $condition = "where vcLoginId = '" . $login_id . "'";
  $access2db -> set_delete($table, $condition);
  $access2db -> delete_exe;
  
  return(0);
 }
 
 $self -> {'login'} = 1;
 return(1);
}


#
# セッションID の確認。
#
sub check_session {
 my $self = $_[0];
 my $access2db  = $self -> {'access2db'};
 my $user_id    = $self -> {'user_id'};
 my $session_id = $self -> {'session_id'};
 my $time       = $self -> {'time'};
 
 if($self -> {'login'} != 1){
  return(0);
 }
 
 if(length($session_id) > 0){
  my $select_column = 'vcUserId';
  my $table         = 'T_SessionStatus';
  my $condition     = "where vcSessionId = '" . $session_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $_user_id = $access2db -> select_col1;
  
  unless(defined($_user_id) && (length($_user_id) > 0)){
   $self -> {'session'} = -2;
   return(0);
  }
  elsif($_user_id ne $user_id){
   $self -> {'session'} = -2;
   return(0);
  }
 }
 else{
  if($self -> {'max_session_number'} == 0){
   $session_id = &Generate_session::gen($access2db, $user_id);
   $self -> {'session_id'} = $session_id;
  }
  else{
   $self -> {'session'} = -1;
   return(0);
  }
 }
 
 # アクティベート
 my @set = ('iUserLastActivationTime = ' . $time);
 my $table     = 'T_User';
 my $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
 
 @set = ('iLastAccessTime = ' . $time);
 $table     = 'T_SessionList';
 $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "' and vcSessionId = '" . $session_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
 
 $self -> {'session'} = 1;
 return(1);
}


#
# 認証結果をまとめる。
#
sub marge_result {
 my $self = $_[0];
 my $access2db  = $self -> {'access2db'};
 my $user_id    = $self -> {'user_id'};
 my $login      = $self -> {'login'};
 my $session    = $self -> {'session'};
 my $session_id = $self -> {'session_id'};
 my $max_session_number = $self -> {'max_session_number'};
 
 my %results = (
  'login' => $login,
  'session' => $session
 );
 
 if($login == 1){
  my ($ref_session_sort, $ref_session_title_list) = &Generate_session::list($access2db, $user_id);
  $results{'max_session_number'} = $max_session_number;
  $results{'session_sort'}       = $ref_session_sort;
  $results{'session_title_list'} = $ref_session_title_list;
  $results{'user_id'}            = $user_id;
  
  if($session == 1){
   $results{'session_id'} = $session_id;
  }
  elsif($session == -2){
   $results{'undefined_session_id'} = $session_id;
  }
 }
 
 return(\%results);
}


#
# 管理者権限があるかどうかの確認。
#
sub check_administrator {
 my $http_authorization = $ENV{'HTTP_TELNETMANAUTHADMIN'};
 
 unless(defined($http_authorization) && (length($http_authorization) > 0)){
  return(0);
 }
 elsif($http_authorization !~ /^Administrator/){
  return(0);
 }
 
 my ($admin_id, $admin_password) = (split(/\s/, $http_authorization))[1,2];
 
 unless(defined($admin_id) && (length($admin_id) > 0) && defined($admin_password) && (length($admin_password) > 0)){
  return(0);
 }
 
 my $file_auth = &Common_system::file_auth();
 
 unless(-f $file_auth){
  if(($admin_id eq 'admin') && ($admin_password eq 'tcpport23')){
   return(1);
  }
  else{
   return(0);
  }
 }
 
 my $registerd_password = '';
 open(TELNETMANAUTH, '<', $file_auth);
 flock(TELNETMANAUTH, 1);
 while(my $line = <TELNETMANAUTH>){
  chomp($line);
  my ($id, $password) = split(/\s/, $line);
  
  if($id eq $admin_id){
   $registerd_password = $password;
   last;
  }
 }
 close(TELNETMANAUTH);
 
 if(length($registerd_password) == 0){
  return(0);
 }
 
 my $check = &Common_sub::check_password($admin_password, $registerd_password);
 
 return($check);
}


#
# 管理者ID を取り出す。
#
sub admin_id {
 my $http_authorization = $ENV{'HTTP_TELNETMANAUTHADMIN'};
 
 unless(defined($http_authorization) && (length($http_authorization) > 0)){
  return('');
 }
 elsif($http_authorization !~ /^Administrator/){
  return('');
 }
 
 my ($admin_id) = (split(/\s/, $http_authorization))[1];
 
 return($admin_id);
}


#
# 管理者を作成する。
#
sub create_administrator {
 my $id       = $_[0];
 my $password = $_[1];
 my $mail     = $_[2];
 
 my $encoded_password = &Common_sub::encode_password($password);
 
 my $file_auth = &Common_system::file_auth();
 open(TELNETMANAUTH, '>>', $file_auth);
 flock(TELNETMANAUTH, 2);
 print TELNETMANAUTH $id . ' ' . $encoded_password . "\n";
 close(TELNETMANAUTH);
 
 my $file_admin_mail = &Common_system::file_admin_mail();
 open(TELNETMANMAIL, '>>', $file_admin_mail);
 flock(TELNETMANMAIL, 2);
 print TELNETMANMAIL $id . ' ' . $mail . "\n";
 close(TELNETMANMAIL);
}

#
# 管理者のメールアドレスを返す。
#
sub administrator_mail_address {
 my $id = $_[0];
 
 my $file_admin_mail = &Common_system::file_admin_mail();
 
 unless(-f $file_admin_mail){
  return('');
 }
 
 if(defined($id) && (length($id) > 0)){
  my $mail_address = '';
  
  if(-f $file_admin_mail){
   open(TELNETMANMAIL, '<', $file_admin_mail);
   flock(TELNETMANMAIL, 1);
   while(my $line = <TELNETMANMAIL>){
    chomp($line);
    my ($_id, $_mail_address) = split(/\s/, $line);
    
    if($_id eq $id){
     $mail_address = $_mail_address;
     last;
    }
   }
   close(TELNETMANMAIL);
  }
  
  return($mail_address);
 }
 else{
  my @mail_address_list = ();
  
  if(-f $file_admin_mail){
   open(TELNETMANMAIL, '<', $file_admin_mail);
   flock(TELNETMANMAIL, 1);
   while(my $line = <TELNETMANMAIL>){
    chomp($line);
    my $mail_address = (split(/\s/, $line))[1];
    
    push(@mail_address_list, $mail_address);
   }
   close(TELNETMANMAIL);
  }
  
  return(@mail_address_list);
 }
}

1;
