#!/usr/bin/perl
# 説明   : コマンドとアクションとping の登録内容を取り出す。
# 作成者 : 江野高広
# 作成日 : 2014/07/03
# 更新 2015/05/24 txParameterSheetNode, txParameterSheetInterface を追加。
# 更新 2015/11/30 iOperator, iCount を追加。
# 更新 2017/09/06 Ver.2 用に大幅改造。
# 更新 2018/05/16 Begin, End 機能の追加。

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
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;



#
# 対象の指定を取得する。
#
my $cgi = new CGI;
my $item_type = $cgi -> param('item_type');
my $item_id   = $cgi -> param('item_id');
my $operation    = $cgi -> param('operation');
unless(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"コマンド、または、アクションの指定やID の指定がありません。"}';
 
 $access2db -> close;
 exit(0);
}



#
# コマンドの種類によってテーブルとカラムを決める。
#
my $table = &Telnetman_common::table($item_type);
my $id_column = &Telnetman_common::id_column($item_type);
my $select_column = 'iCreateTime,iUpdateTime,vcKeyword,vcUserId,vcChanger,vcTitle,iRepeatType,vcComment';
my @key_list = ('create_time', 'update_time', 'keyword', 'user_id', 'changer', 'title', 'repeat_type', 'comment');
my $condition = 'where ' . $id_column . " = '" . &Common_sub::escape_sql($item_id) . "'";

if($item_type eq 'command'){
 $select_column .= ',iWaitTime,iConftEnd,txCommand,iCommandType,txDummyReturn,iPromptChecker,iStore';
 push(@key_list, 'wait', 'conft_end', 'command', 'command_type', 'dummy', 'prompt', 'store');
}
elsif($item_type eq 'action'){
 $select_column .= ',vcBeginWord,iPipeType,vcPipeWord,vcEndWord,vcPattern,vcScriptId,txConditions,iNot,iOperator,iCount,vcNgMessage,txParameterSheetA,txParameterSheetB,iDestroy';
 push(@key_list, 'begin_word', 'pipe_type', 'pipe_word', 'end_word', 'pattern', 'script_id', 'json_condition', 'not', 'operator', 'count', 'ng_message', 'json_parameter_sheet_a', 'json_parameter_sheet_b', 'destroy');
}
elsif($item_type eq 'ping'){
 $select_column .= ',txTarget,iCount,iTimeout,iCondition,vcNgMessage';
 push(@key_list, 'target', 'count', 'timeout', 'condition', 'ng_message');
}
else{
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"コマンド、アクション、または、ping の指定が不正です。"}';
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# コマンドのデータを全て取り出す。
#
$access2db -> set_select($select_column, $table, $condition);
my $ref_cols = $access2db -> select_cols;

if(scalar(@$ref_cols) == 0){
 my %result = (
  'login' => 1,
  'session' => 1,
  'item_type' => $item_type,
  'item_id' => $item_id,
  'result' => 0,
  'reason' => '指定されたコマンド、アクション、または、ping の登録はありませんでした。'
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# 結果を連想配列にまとめる。
#
my %item_data = ();
foreach my $key (@key_list){
 my $value = shift(@$ref_cols);
 
 unless(defined($value)){
  $value = '';
 }
 
 $item_data{$key} = $value;
}
$item_data{'create_time'} += 0;
$item_data{'update_time'} += 0;
$item_data{'repeat_type'} += 0;

if($item_type eq 'command'){
 $item_data{'wait'}         += 0;
 $item_data{'conft_end'}    += 0;
 $item_data{'command_type'} += 0;
 $item_data{'prompt'}       += 0;
 $item_data{'store'}        += 0;
}
elsif($item_type eq 'action'){
 $item_data{'pipe_type'} += 0;
 $item_data{'not'}       += 0;
 $item_data{'operator'}  += 0;
 $item_data{'count'}     += 0;
 $item_data{'destroy'}   += 0;
}
elsif($item_type eq 'ping'){
 $item_data{'count'}     += 0;
 $item_data{'timeout'}   += 0;
 $item_data{'condition'} += 0;
}



#
# 作成者の名前を取り出す。
#
my $user_name = &Telnetman_common::user_name($access2db, $item_data{'user_id'});
$item_data{'owner_name'} = $user_name;



#
# 更新者の名前を取り出す。
#
my $changer_name = '';

if(length($item_data{'changer'}) > 0){
 $select_column = 'vcUserName';
 $table = 'T_User';
 $condition = "where vcUserId = '" . &Common_sub::escape_sql($item_data{'changer'}) . "'";
 $access2db -> set_select($select_column, $table, $condition);
 $changer_name = $access2db -> select_col1;
 
 unless(defined($changer_name)){
  $changer_name = '';
 }
}

$item_data{'changer_name'} = $changer_name;


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;



#
# 結果を出力。
#
$item_data{'login'}   = 1;
$item_data{'session'} = 1;
$item_data{'result'}  = 1;
$item_data{'item_type'} = $item_type;
$item_data{'item_id'}   = $item_id;
$item_data{'operation'} = $operation;

my $json_item_data = &JSON::to_json(\%item_data);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_item_data;
