#!/usr/bin/perl
# 説明   : 2ヶ月利用の無いアカウントをロックする。
# 作成者 : 江野高広
# 作成日 : 2015/01/21

use strict;
use warnings;

use CGI;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Common_sub;
use Common_system;
use Access2DB;



#
# 2ヶ月前のunixtime
#
my $time = time;
my $two_months_ago = $time - 86400 * 60;



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# 対象アカウントを特定する。
#
my $select_column = 'vcUserId';
my $table         = 'T_User';
my $condition     = 'where iEffective = 1 and iUserLastActivationTime > 0 and iUserLastActivationTime < ' . $two_months_ago;
$access2db -> set_select($select_column, $table, $condition);
my $ref_User = $access2db -> select_array_col1;



#
# ロックする。
#
foreach my $user_id (@$ref_User){
 my @set = ('iEffective = 0');
 my $table     = 'T_User';
 my $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
 
 my $locking_id = &Common_sub::make_random_string(32);
 while(1){
  my $select_column = 'count(*)';
  $table         = 'T_LockedAccount';
  $condition     = "where vcLockingId = '" . $locking_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $count = $access2db -> select_col1;
  
  if($count == 0){
   last;
  }
  else{
   $locking_id = &Common_sub::make_random_string(32);
  }
 }
 
 my $insert_column = 'vcLockingId,vcUserId';
 my @values = ("('" . $locking_id . "','" . &Common_sub::escape_sql($user_id) . "')");
 $table     = 'T_LockedAccount';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
}


$access2db -> write_log(&Telnetman_common::prefix_log('root'));
$access2db -> close;
