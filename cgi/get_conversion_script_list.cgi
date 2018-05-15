#!/usr/bin/perl
# 説明   : アップロードされたスクリプト一覧を取得する。
# 作成者 : 江野高広
# 作成日 : 2014/07/30

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
# 全登録を取得する。
#
my $select_column = 'vcScriptId,vcUserId,vcChanger,iCreateTime,iUpdateTime';
my $table = 'T_Script';
my $condition = 'order by iCreateTime';
$access2db -> set_select($select_column, $table, $condition);
my $ref_Script = $access2db -> select_array_cols;



#
# 登録者と更新者を取得する。
#
if(scalar(@$ref_Script) > 0){
 my @user_id_list = ();
 foreach my $ref_row (@$ref_Script){
  my $user_id = $ref_row -> [1];
  my $changer = $ref_row -> [2];
  push(@user_id_list, $user_id);
  
  if(length($changer) > 0){
   push(@user_id_list, $changer);
  }
 }
 
 $select_column = 'vcUserId,vcUserName';
 $table = 'T_User';
 $condition = "where vcUserId in ('" . join("','", @user_id_list) . "')";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_User = $access2db -> select_hash_col2;
 
 foreach my $ref_row (@$ref_Script){
  my $user_id = $ref_row -> [1];
  my $changer = $ref_row -> [2];
  
  my $user_name = $ref_User -> {$user_id};
  $ref_row -> [1] = $user_name;
  
  if(length($changer) > 0){
   my $changer_name = $ref_User -> {$changer};
   $ref_row -> [2] = $changer_name;
  }
 }
}


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


#
# 結果をまとめる。
#
my @script_list = ();
foreach my $ref_row (@$ref_Script){
 my ($script_id, $user_name, $changer_name, $create_time, $update_time) = @$ref_row;
 $create_time += 0;
 $update_time += 0;
 
 my %script_info = (
  'script_id' => $script_id,
  'user_name' => $user_name,
  'changer_name' => $changer_name,
  'create_time' => $create_time,
  'update_time' => $update_time
 );
 
 push(@script_list, \%script_info);
}


my %results = (
 'login'     => 1,
 'session'   => 1,
 'script_list' => \@script_list
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
