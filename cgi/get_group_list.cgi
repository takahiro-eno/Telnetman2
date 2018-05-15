#!/usr/bin/perl
# 説明   : グループ一覧を取得する。
# 作成者 : 江野高広
# 作成日 : 2017/12/05

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Access2DB;



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# グループ一覧を登録順で取り出す。
#
my $select_column = 'vcGroupId,vcGroupName';
my $table         = 'T_Group';
my $condition     = 'order by iCreateTime';
$access2db -> set_select($select_column, $table, $condition);
my $ref_Group = $access2db -> select_array_cols;

$access2db -> close;


my @group_list = ();
foreach my $ref_row (@$ref_Group){
 my ($group_id, $group_name) = @$ref_row;
 my %group_info = ('group_id' => $group_id, 'group_name' => $group_name);
 push(@group_list, \%group_info);
}



#
# 結果をJSON にする。
#
my %result = (
 "group_list" => \@group_list
);
my $json_result = &JSON::to_json(\%result);


print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
