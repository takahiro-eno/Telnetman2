#!/usr/bin/perl
# 説明   : 2ヶ月利用の無いセッションを削除する。
# 作成者 : 江野高広
# 作成日 : 2015/01/21
# 更新 2016/06/02 : 古いログインID も削除する。

use strict;
use warnings;

use lib '/usr/local/Telnetman2/lib';
use Common_sub;
use Common_system;
use Access2DB;
use Telnetman_common;



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
# 対象セッションを取得する。
#
my $select_column = 'vcUserId,vcSessionId';
my $table         = 'T_SessionList';
my $condition     = 'where iLastAccessTime < ' . $two_months_ago;
$access2db -> set_select($select_column, $table, $condition);
my $ref_SessionList = $access2db -> select_array_cols;



foreach my $ref_row (@$ref_SessionList){
 my ($user_id, $session_id) = @$ref_row;
 
 #
 # セッションデータを圧縮保存する。
 #
 &Telnetman_common::insert_archive_data($access2db, $session_id);
 &Telnetman_common::archive_session_data($session_id);
 
 
 
 #
 # セッション削除
 #
 &Telnetman_common::delete_session($access2db, $user_id, $session_id);
}



#
# ログインID を取得
#
$select_column = 'vcLoginId,vcUserId,iLastAccessTime';
$table         = 'T_LoginList';
$condition     = 'order by iLastAccessTime';
$access2db -> set_select($select_column, $table, $condition);
my $ref_LoginList = $access2db -> select_array_cols;



#
# 特権ユーザーの確認
#
$select_column = 'vcUserId,vcUserId';
$table         = 'T_User';
$condition     = 'where iMaxSessionNumber = 0';
$access2db -> set_select($select_column, $table, $condition);
my $ref_User = $access2db -> select_hash_col2;



#
# 2ヶ月以上前のログインID を削除する。
# ただし、特権ユーザーなら最新のログインID は無条件で残す。
#
my $N = scalar(@$ref_LoginList);
for(my $i = $N - 1; $i >= 0; $i --){
 my ($login_id, $user_id, $last_access_time) = @{$ref_LoginList -> [$i]};
 
 if(exists($ref_User -> {$user_id})){
  delete($ref_User -> {$user_id});
  next;
 }
 
 if($last_access_time >= $two_months_ago){
  next;
 }
 
 $table     = 'T_LoginList';
 $condition = "where vcLoginId = '" . $login_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
}


$access2db -> write_log(&Telnetman_common::prefix_log('root'));
$access2db -> close;
