#!/usr/bin/perl
# 説明   : コマンドの所有者を変更する。
# 作成者 : 江野高広
# 作成日 : 2014/11/27
# 更新 2016/05/20 : 管理者権限でも実行できるように。

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_system;
use Access2DB;
use Telnetman_common;

my $cgi = new CGI;

#
# 管理者用の認証
#
my $administrator = $cgi -> param('administrator');
my $auth_admin = 0;
my $admin_id = '';

if(defined($administrator) && (length($administrator) > 0)){
 $administrator += 0;
}
else{
 $administrator = 0;
}

if($administrator == 1){
 $auth_admin = &Telnetman_auth::check_administrator();

 if($auth_admin == 0){
  print "Content-type: text/plain; charset=UTF-8\n\n";
  print '{"administrator":1,"auth_admin":0,"login":0,"session":0}';
  exit(0);
 }
 
 $admin_id = &Telnetman_auth::admin_id();
}



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# 一般ユーザー用の認証
#
my $telnetman_auth = Telnetman_auth -> new($access2db);
my $login   = $telnetman_auth -> check_login;
my $session = $telnetman_auth -> check_session;

unless(($login == 1) && ($session == 1)){
 my $ref_results = $telnetman_auth -> marge_result;
 $ref_results -> {'administrator'} = $administrator;
 $ref_results -> {'auth_admin'}    = $auth_admin;
 my $json_results = &JSON::to_json($ref_results);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_results;
 
 $access2db -> close;
 exit(0);
}


#
# セッションID の取得
#
my $session_id = $telnetman_auth -> get_session_id;



#
# ユーザーID を取得
#
my $user_id = $telnetman_auth -> get_user_id;



#
# 新しい所有者のID を受け取る。
#
my $new_owner_id = $cgi -> param('new_owner_id');
unless(defined($new_owner_id) && (length($new_owner_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"administrator":' . $administrator . ',"auth_admin":' . $auth_admin . ',"login":1,"session":1,"result":0,"reason":"新しい所有者のユーザーID を指定して下さい。"}';
 
 $access2db -> close;
 exit(0);
}



#
# 新しい所有者のID が存在するか確認する。
#
my $select_column = 'count(*)';
my $table         = 'T_User';
my $condition     = "where vcUserId = '" . &Common_sub::escape_sql($new_owner_id) . "'";
$access2db -> set_select($select_column, $table, $condition);
my $exists_new_owner = $access2db -> select_col1;
if($exists_new_owner == 0){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"administrator":' . $administrator . ',"auth_admin":' . $auth_admin . ',"login":1,"session":1,"result":0,"reason":"指定された新しい所有者のユーザーID は存在しません。"}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 所有者を変更するコマンド一覧を受け取る。
#
my $json_item_list = $cgi -> param('json_item_list');
unless(defined($json_item_list) && (length($json_item_list) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"administrator":' . $administrator . ',"auth_admin":' . $auth_admin . ',"login":1,"session":1,"result":0,"reason":"所有者を変更するコマンドが指定されていません。"}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# コマンド一覧の連想配列を復元する。
#
my $ref_item_list = undef;
eval{$ref_item_list = &JSON::from_json($json_item_list);};
if(length($@) > 0){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"administrator":' . $administrator . ',"auth_admin":' . $auth_admin . ',"login":1,"session":1,"result":0,"reason":"コマンド一覧の書式が不正です。"}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 所有者を変更しつつ結果を記録する。
#
my %change_owner_results = ();
while(my ($item_type, $ref_comand_id_list) = each(%$ref_item_list)){
 
 my %results_per_item_type = ();
 my $table = &Telnetman_common::table($item_type);
 my $id_column = &Telnetman_common::id_column($item_type);
 
 while(my ($item_id, $change) = each(%$ref_comand_id_list)){
  if($change == 1){
   my $select_column = 'vcUserId';
   my $condition     = 'where ' . $id_column . " = '" . $item_id . "'";
   $access2db -> set_select($select_column, $table, $condition);
   my $owner_id = $access2db -> select_col1;
   
   if(defined($owner_id)){
    if(($auth_admin == 1) || ($owner_id eq $user_id)){
     my @set = ("vcUserId = '" . &Common_sub::escape_sql($new_owner_id) . "'");
     $access2db -> set_update(\@set, $table, $condition);
     my $update_count = $access2db -> update_exe;
     
     if($update_count == 1){
      $results_per_item_type{$item_id} = '変更しました。';
     }
     else{
      $results_per_item_type{$item_id} = '変更できませんでした。';
     }
    }
    else{
     $results_per_item_type{$item_id} = '現在の所有者があなたではないため変更できませんでした。';
    }
   }
   else{
    $results_per_item_type{$item_id} = 'コマンドの登録がありませんでした。';
   }
  }
  else{
   $results_per_item_type{$item_id} = '変更しませんでした。';
  }
 }
 
 $change_owner_results{$item_type} = \%results_per_item_type;
}


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


my %results = (
 'administrator' => $administrator,
 'auth_admin'    => $auth_admin,
 'login'         => 1,
 'session'       => 1,
 'session_id'    => $session_id,
 'result'        => 1,
 'change_owner_results' => \%change_owner_results
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
