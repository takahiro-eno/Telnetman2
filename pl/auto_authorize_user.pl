#!/usr/bin/perl
# 説明   : 承認待ちユーザーを自動承認する。
# 作成者 : 江野高広
# 作成日 : 2018/06/18

use strict;
use warnings;

use lib '/usr/local/Telnetman2/lib';
use Common_system;
use Access2DB;


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# ユーザーを承認する。
#
my @set = ('iEffective = 1');
my $table = 'T_User';
my $condition = 'where iEffective = 0';
$access2db -> set_update(\@set, $table, $condition);
my $count = $access2db -> update_exe;



$access2db -> close;
