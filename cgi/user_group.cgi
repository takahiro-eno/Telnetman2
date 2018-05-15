#!/usr/bin/perl
# 説明   : ユーザーのグループの関連付け。
# 作成者 : 江野高広
# 作成日 : 2017/12/22

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

my $time = time;

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
# ユーザーID等を受け取る。
#
my $cgi = new CGI;
my $operation = $cgi -> param('operation');
unless(defined($operation) && (length($operation) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"取得、更新が指定されていません。"}';
 exit(0);
}

my $user_id = $cgi -> param('user_id');
unless(defined($user_id) && (length($user_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"ユーザーID が指定されていません。"}';
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
# 存在するユーザーか確認。
#
my $select_column = 'count(*)';
my $table         = 'T_User';
my $condition     = "where vcUserId = '" . $user_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $count = $access2db -> select_col1;

if($count == 0){
 $access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
 $access2db -> close;
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"存在しないユーザーID です。"}';
 exit(0);
}



my %result = (
 'auth'      => 1,
 'result'    => 1,
 'operation' => $operation,
 'user_id'   => $user_id
);



#
# 取得、保存。
#
if($operation eq 'get'){
 my $select_column = 'vcGroupId,vcGroupName';
 my $table         = 'T_Group';
 my $condition     = 'order by iCreateTime';
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_unassigned_group_list = $access2db -> select_array_cols;
 
 $select_column = 'vcGroupId';
 $table         = 'T_UserGroup';
 $condition     = "where vcUserId = '" . $user_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_UserGroup = $access2db -> select_array_col1;
 
 my @allocated_group_list  = ();
 
 foreach my $group_id (@$ref_UserGroup){
  my $j = scalar(@$ref_unassigned_group_list);
  
  for(my $i = $j - 1; $i >= 0; $i --){
   my $_group_id = $ref_unassigned_group_list -> [$i] -> [0];
   
   if($_group_id eq $group_id){
    my $group_name = $ref_unassigned_group_list -> [$i] -> [1];
    unshift(@allocated_group_list, [$group_id, $group_name]);
    splice(@$ref_unassigned_group_list, $i, 1);
    next;
   }
  }
 }
 
 $result{'unassigned_group_list'} = $ref_unassigned_group_list;
 $result{'allocated_group_list'}  = \@allocated_group_list;
}
elsif($operation eq 'save'){
 my $table     = 'T_UserGroup';
 my $condition = "where vcUserId = '" . $user_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 $table     = 'T_GroupUser';
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 my $json_group_list = $cgi -> param('json_group_list');
 
 if(defined($json_group_list) && (length($json_group_list) > 0)){
  my $ref_group_list = &JSON::from_json($json_group_list);
  
  my @values = ();
  foreach my $group_id (@$ref_group_list){
   push(@values, "('" . $user_id . "','" . $group_id . "')");
  }
  
  my $insert_column = 'vcUserId,vcGroupId';
  my $table = 'T_UserGroup';
  $access2db -> set_insert($insert_column, \@values, $table);
  $access2db -> insert_exe;
  
  $table = 'T_GroupUser';
  $access2db -> set_insert($insert_column, \@values, $table);
  $access2db -> insert_exe;
 }
}



$access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
$access2db -> close;



#
# 結果をJSON にする。
#
my $json_result = &JSON::to_json(\%result);


print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
