#!/usr/bin/perl
# 説明   : コマンドとアクションとping のシンボル作成に必要なデータを取り出す。
# 作成者 : 江野高広
# 作成日 : 2014/07/02
# 更新   : 2017/11/13 Ver.2 用に大幅改造。

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Telnetman_common;
use Common_system;
use Common_sub;
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
# ユーザーID の取得。
#
my $user_id = $telnetman_auth -> get_user_id;



#
# 取り出すデータの条件を組み立てる。
#
my $cgi = new CGI;

# 呼び出し元のjavascript を特定。
my $page = $cgi -> param('page');

# 取り出す対象となるvcItemId の一次元配列のJSON
my $json_item_id_list = $cgi -> param('static_option');


# vcItemId を指定しない場合の条件
# keyword:vcKeyword の先頭一致用文字列
# title:タイトルの一部
my $json_fuzzy_option_list = $cgi -> param('fuzzy_option');



#
# 条件を組み立てる。
#
my %condition_list = ();
if(defined($json_item_id_list) && (length($json_item_id_list) > 0)){
 my $ref_item_id_list_list = &JSON::from_json($json_item_id_list);
  
 while(my ($item_type, $ref_item_id_list) = each(%$ref_item_id_list_list)){
  my $condition = &main::make_condition_1($item_type, $ref_item_id_list);
  
  if(length($condition) == 0){
   $condition = &main::make_condition_3($user_id);
  }
  
  $condition_list{$item_type} = $condition;
 }
}
elsif(defined($json_fuzzy_option_list) && (length($json_fuzzy_option_list) > 0)){
 my $ref_fuzzy_option_list_list = &JSON::from_json($json_fuzzy_option_list);
 
 while(my ($item_type, $ref_fuzzy_option_list) = each(%$ref_fuzzy_option_list_list)){
  my $condition = &main::make_condition_2($access2db, $item_type, $ref_fuzzy_option_list);
  
  if(length($condition) > 0){
   $condition_list{$item_type} = $condition;
  }
 }
}



#
# シンボルリストを作成する。
#
my %item_id_list = ();
my %item_symbol_list = ();
while(my ($item_type, $condition) = each(%condition_list)){
 my ($ref_item_id_list, $ref_item_symbol_list) = &main::make_item_symbol_list($access2db, $item_type, $condition);
 $item_id_list{$item_type} = $ref_item_id_list;
 $item_symbol_list{$item_type} = $ref_item_symbol_list;
}


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


#
# 結果をまとめる。
#
my %results = (
 'login' => 1,
 'session' => 1,
 'page' => $page,
 'item_id_list'     => \%item_id_list,
 'item_symbol_list' => \%item_symbol_list
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;



# 条件を作成する。
sub make_condition_1 {
 my $item_type = $_[0];
 my $ref_item_id_list = $_[1];
 my $condition = '';
 
 if(scalar(@$ref_item_id_list) > 0){
  my $id_column = &Telnetman_common::id_column($item_type);  
  $condition = 'where ' . $id_column . " in ('" . join("','", @$ref_item_id_list) . "') order by iCreateTime";
 }
 
 return($condition);
}


sub make_condition_2 {
 my $access2db = $_[0];
 my $item_type = $_[1];
 my $ref_fuzzy_option_list = $_[2];
 my $condition = '';
 
 my $keyword = $ref_fuzzy_option_list -> {'keyword'};
 my $title   = $ref_fuzzy_option_list -> {'title'};
 
 unless((defined($keyword) && (length($keyword) > 0)) || (defined($title) && (length($title) > 0))){
  $condition = &main::make_condition_3($user_id);
  return($condition);
 }
 
 my $search_condition = '';
 if(defined($keyword) && (length($keyword) > 0)){
  my $escaped_keyword = &Common_sub::escape_sql($keyword);
  $search_condition .= "vcKeyword like '" . $escaped_keyword . "%'";
 }
 
 if(length($search_condition) > 0){
  $search_condition .= " and vcItemType = '" . $item_type . "'";
 }
 else{
  $search_condition .= "vcItemType = '" . $item_type . "'";
 }
 
 if(defined($title) && (length($title) > 0)){
  my $escaped_title = &Common_sub::escape_sql($title);
  $search_condition .= " and vcTitle like '%" . $escaped_title . "%'";
 }
 
 $access2db -> set_select('vcItemId', 'T_Search', 'where ' . $search_condition);
 my $ref_item_id_list = $access2db -> select_array_col1;
 
 $condition = &main::make_condition_1($item_type, $ref_item_id_list);
 
 return($condition);
}


sub make_condition_3 {
 my $user_id = $_[0];
 
 $user_id = &Common_sub::escape_sql($user_id);
 my $condition = "where vcUserId = '" . $user_id . "' order by iCreateTime";
 
 return($condition);
}


# データを取り出す。
sub make_item_symbol_list{
 my $access2db = $_[0];
 my $item_type = $_[1];
 my $condition = $_[2];
 my @item_id_list = ();
 my %item_symbol_list = ();
 
 my $table     = &Telnetman_common::table($item_type);
 my $id_column = &Telnetman_common::id_column($item_type);
 
 my $select_column = $id_column . ',vcTitle,iRepeatType';
 
 if($item_type eq 'command'){
  $select_column .= ',iCommandType';
 }
 
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_Item = $access2db -> select_array_cols;
 
 foreach my $ref_cols (@$ref_Item){
  my $item_id      = $ref_cols -> [0];
  my $title        = $ref_cols -> [1];
  my $repeat_type  = $ref_cols -> [2];
  my $command_type = undef;
  
  $repeat_type += 0;
  
  if($item_type eq 'command'){
   $command_type = $ref_cols -> [3];
   $command_type += 0;
  }
  
  push(@item_id_list, $item_id);
  $item_symbol_list{$item_id} = {'title' => $title, 'repeat_type' => $repeat_type, 'command_type' => $command_type};
 }
 
 return(\@item_id_list, \%item_symbol_list);
}
