#!/usr/bin/perl
# 説明   : グループの新規登録や更新。
# 作成者 : 江野高広
# 作成日 : 2017/12/05

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
# グループ名等を受け取る。
#
my $cgi = new CGI;
my $operation = $cgi -> param('operation');
unless(defined($operation) && (length($operation) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"新規作成、更新、削除が指定されていません。"}';
 exit(0);
}

my $group_id   = $cgi -> param('group_id');
my $group_name = $cgi -> param('group_name');

unless(defined($group_id)){
 $group_id = '';
}

unless(defined($group_name)){
 $group_name = '';
}

if(($operation eq 'create') && (length($group_name) == 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"グループ名を指定して下さい。"}';
 exit(0);
}
elsif(($operation eq 'update') && (length($group_id) == 0) && (length($group_name) == 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"グループID, グループ名を指定して下さい。"}';
 exit(0);
}
elsif(($operation eq 'delete') && (length($group_id) ==0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"auth":1,"result":0,"reason":"グループID を指定して下さい。"}';
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
# 新規作成、更新、削除
#
if($operation eq 'create'){
 $group_id = &Common_sub::uuid();
 my $escaped_group_name = &Common_sub::escape_sql($group_name);
 
 my $insert_column = 'vcGroupId,vcGroupName,iCreateTime,iUpdateTime';
 my @values = ("('" . $group_id . "','" . $escaped_group_name . "'," . $time . "," . $time . ")");
 my $table = 'T_Group';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
}
elsif($operation eq 'update'){
 my $escaped_group_name = &Common_sub::escape_sql($group_name);
 
 my @set = ("vcGroupName = '" . $escaped_group_name . "'", 'iUpdateTime = ' . $time);
 my $table = 'T_Group';
 my $condition = "where vcGroupId = '" . $group_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
}


$access2db -> write_log(&Telnetman_common::prefix_log($admin_id));
$access2db -> close;



#
# 結果をJSON にする。
#
my %result = (
 'auth'       => 1,
 'result'     => 1,
 'group_id'   => $group_id,
 'group_name' => $group_name
);
my $json_result = &JSON::to_json(\%result);


print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
