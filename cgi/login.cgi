#!/usr/bin/perl
# 説明   : ログイン認証用。
# 作成者 : 江野高広
# 作成日 : 2014/06/16
# 更新   : 2016/05/19 既に有効なログインID が有れば作り直さない。
#        : 2017/10/30 ID をuuid に変更。

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Common_system;
use Common_sub;
use Access2DB;
use Generate_session;
use Telnetman_common;


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



my $telnetman_login = Telnetman_login -> new($access2db);
$telnetman_login -> check_user;
$telnetman_login -> issue_login_id;
my $ref_results = $telnetman_login -> marge_result;

my $user_id = $telnetman_login -> get_user_id();

$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;

my $json_results = &JSON::to_json($ref_results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;



package Telnetman_login;

sub new {
 my $self = $_[0];
 my $access2db = $_[1];
 my $time = time;
 
 my %parameter_list = (
  'login' => 0,
  'access2db' => $access2db,
  'user_id' => '',
  'max_session_number' => 5,
  'login_id' => '',
  'time' => $time
 );
 
 bless(\%parameter_list, $self);
}


sub check_user {
 my $self = $_[0];
 my $access2db = $self -> {'access2db'};
 
 my $http_authorization = $ENV{'HTTP_TELNETMANAUTH'};
 
 unless(defined($http_authorization) && (length($http_authorization) > 0)){
  $self -> {'login'} = 0;
  return(0);
 }
 elsif($http_authorization !~ /^Telnetman/){
  $self -> {'login'} = 0;
  return(0);
 }
 
 my ($user_id, $user_password) = (split(/\s/, $http_authorization))[1,2];
 
 unless(defined($user_id) && (length($user_id) > 0) && defined($user_password) && (length($user_password) > 0)){
  $self -> {'login'} = 0;
  return(0);
 }
 
 my $select_column = 'vcUserPassword,iEffective,iMaxSessionNumber';
 my $table         = 'T_User';
 my $condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_User = $access2db -> select_cols;
 
 if(scalar(@$ref_User) == 0){
  $self -> {'login'} = -1;
  return(0);
 }
 
 my ($registerd_user_password, $effictive, $max_session_number) = @$ref_User;
 
 my $check = &Common_sub::check_password($user_password, $registerd_user_password);
 
 if($check == 0){
  $self -> {'login'} = -1;
  return(0);
 }
 
 if($effictive == 0){
  $self -> {'login'} = -2;
  return(0);
 }
 
 $max_session_number += 0;
 $self -> {'user_id'} = $user_id;
 $self -> {'max_session_number'} = $max_session_number;
 
 $self -> {'login'} = 1;
 return(1);
}

# ユーザーID
sub get_user_id {
 my $self = $_[0];
 return($self -> {'user_id'});
}


# ログインID を発行する。
sub issue_login_id {
 my $self = $_[0];
 my $time = $self -> {'time'};
 my $time_2hours_ago = $time - 7200;
 
 unless($self -> {'login'} == 1){
  return(0);
 }
 
 my $access2db          = $self -> {'access2db'};
 my $user_id            = $self -> {'user_id'};
 my $max_session_number = $self -> {'max_session_number'};

=pod
 # 有効なログインID が発行済みでないか確認する。
 my $select_column = 'vcLoginId,iLastAccessTime';
 my $table         = 'T_LoginList';
 my $condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "' order by iLastAccessTime";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_LoginList = $access2db -> select_array_cols;
 
 if(scalar(@$ref_LoginList) > 0){
  my $ref_cols = pop(@$ref_LoginList);
  my ($login_id, $last_access_time) = @$ref_cols;
  
  if(($last_access_time > $time_2hours_ago) || ($max_session_number == 0)){
   $self -> {'login_id'} = $login_id;
   
   # アクティベート時刻を更新する。
   my @set = ('iUserLastActivationTime = ' . $time);
   my $table     = 'T_User';
   my $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
   $access2db -> set_update(\@set, $table, $condition);
   my $count = $access2db -> update_exe;
   
   # アクティベート時刻を更新する。
   @set = ('iLastAccessTime = ' . $time);
   $table     = 'T_LoginList';
   $condition = "where vcLoginId = '" . $login_id . "'";
   $access2db -> set_update(\@set, $table, $condition);
   $count = $access2db -> update_exe;
   
   return(1);
  }
 }
=cut 
 
 my $login_id = &Common_sub::uuid();
 
 # 同じログインID が無いかどうか確認する。
 while(1){
  my $select_column = 'count(*)';
  my $table         = 'T_LoginList';
  my $condition     = "where vcLoginId = '" . $login_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $count = $access2db -> select_col1;
  
  if($count == 0){
   last;
  }
  else{
   $login_id = &Common_sub::uuid();
  }
 }
 
 # ログインID を登録する。
 my $insert_column = 'vcLoginId,vcUserId,iLastAccessTime';
 my @values = ("('" . $login_id . "','" . $user_id . "'," . $time . ")");
 my $table = 'T_LoginList';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
 
 $self -> {'login_id'} = $login_id;
 
 # アクティベート時刻を更新する。
 my @set = ('iUserLastActivationTime = ' . $time);
 $table     = 'T_User';
 my $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
 $access2db -> set_update(\@set, $table, $condition);
 my $count = $access2db -> update_exe;
 
 return(1);
}


sub marge_result {
 my $self = $_[0];
 
 my $access2db = $self -> {'access2db'};
 my $user_id   = $self -> {'user_id'};
 my $login     = $self -> {'login'};
 my $login_id  = $self -> {'login_id'};
 my $max_session_number = $self -> {'max_session_number'};
 
 my %results = (
  'login' => $login,
  'session' => 0
 );
 
 if($login == 1){
  my ($ref_session_sort, $ref_session_title_list) = &Generate_session::list($access2db, $user_id);
  $results{'max_session_number'} = $max_session_number;
  $results{'session_sort'}       = $ref_session_sort;
  $results{'session_title_list'} = $ref_session_title_list;
  $results{'login_id'}           = $login_id;
  $results{'user_id'}            = $user_id;
 }
 
 return(\%results);
}

1;
