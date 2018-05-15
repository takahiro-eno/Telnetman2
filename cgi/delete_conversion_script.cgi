#!/usr/bin/perl
# 説明   : 変換スクリプト1つを削除する。
# 作成者 : 江野高広
# 作成日 : 2017/12/01

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_system;
use Access2DB;
use Telnetman_common;


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
# 指定されたスクリプトID を受け取る。
#
my $cgi = new CGI;
my $script_id = $cgi -> param('script_id');
unless(defined($script_id) && (length($script_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"スクリプトが指定されていません。"}';
 
 $access2db -> close;
 exit(0);
}

my $sql_escaped_package_name = &Common_sub::escape_sql($script_id);



#
# 対象のスクリプトの所有者の所有者と同じグループか確認する。
#
my $permission = &Telnetman_common::check_permission($access2db, 'script', $sql_escaped_package_name, $user_id);

unless($permission == 1){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"権限がありません。"}';
 
 $access2db -> close;
 exit(0);
}



#
# Action で使用されていないか確認する。
#
my $select_column = 'vcTitle';
my $table         = 'T_Action';
my $condition     = "where vcScriptId = '" . $sql_escaped_package_name . "'";
$access2db -> set_select($select_column, $table, $condition);
my $ref_action_list = $access2db -> select_array_col1;

if(scalar(@$ref_action_list) > 0){
 my $reason = '以下のアクションで使われているため削除できません。' . "\n" . join("\n", @$ref_action_list);
 my %results = (
  'login'     => 1,
  'session'   => 1,
  'result'    => 0,
  'reason'    => $reason
 );
 
 my $json_results = &JSON::to_json(\%results);

 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_results;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 対象のスクリプトの登録を削除する。
#
$access2db -> set_delete('T_Script', "where vcScriptId = '" . $sql_escaped_package_name . "'");
$access2db -> delete_exe;

$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


#
# 対象のスクリプトを削除する。
#
my $file_name = $script_id . '.pl';
my $PATH_script = &Common_system::dir_conversion_script() . '/' . $file_name;
if(-f $PATH_script){
 unlink($PATH_script);
}


my %results = (
 'login'     => 1,
 'session'   => 1,
 'result'    => 1,
 'script_id' => $script_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
