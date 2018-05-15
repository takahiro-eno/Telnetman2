#!/usr/bin/perl
# 説明   : アップロードされた変換スクリプトを保存する。
# 作成者 : 江野高広
# 作成日 : 2014/07/29
# 更新   : 2017/12/06 Ver2用に少し更新。

use strict;
use warnings;

use CGI;
use JSON;
use File::Copy;

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
# 現在時刻
#
my $time = time;


#
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;


#
# アップロードされたファイルを受け取る。
#
my $cgi = new CGI;
my $file_name = $cgi -> param('file_name');
my $file_text = $cgi -> param('file_text');
unless(defined($file_name) && (length($file_name) > 0)  && defined($file_text) && (length($file_text) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"ファイルを受け取れませんでした。"}';
 
 $access2db -> close;
 exit(0);
}
elsif(($file_name !~ /^Telnetman_script_/) || ($file_name !~ /\.pl$/)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"ファイル名が不正です。"}';
 
 $access2db -> close;
 exit(0);
}


#
# パッケージ名前を取得する。
#
my ($package_name) = $file_name =~ /(.+)\.pl$/g;
my $reg_escaped_package_name = &Common_sub::escape_reg($package_name);
my $sql_escaped_package_name = &Common_sub::escape_sql($package_name);



#
# スクリプトの改行コードから\r を取り除く。
#
$file_text =~ s/\r//g;


#
# sub convert が定義されているか確認する。
#
my $flag_package = 0;
my $flag_subroutine = 0;
my @split_text = split(/\n/, $file_text);
foreach my $line (@split_text){
 if(($line !~ /^\s*#/) && ($line =~ /package/) && ($line =~ /$reg_escaped_package_name\s*;/)){
  $flag_package = 1;
 }
 elsif(($flag_package == 1) && ($flag_subroutine == 0) && ($line !~ /^\s*#/) && ($line =~ /package/)){
  $flag_package = 0;
 }
 elsif(($flag_package == 1) && ($line !~ /^\s*#/) && ($line =~ /sub\s+convert/)){
  $flag_subroutine = 1;
 }
 
 if(($flag_package == 1) && ($flag_subroutine == 1)){
  last;
 }
}

unless(($flag_package == 1) && ($flag_subroutine == 1)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"' . $package_name . ' 空間にsub convert が定義されていません。"}';
 
 $access2db -> close;
 exit(0);
}

my $flag_true = 0;
for(my $i = scalar(@split_text) - 1; $i >= 0; $i --){
 my $line = $split_text[$i];
 
 if(defined($line)){
  $line =~ s/\s//g;
  
  if(length($line) > 0){
   if($line =~ /1;$/){
    $flag_true = 1;
   }
   
   last;
  }
 }
}

unless($flag_true == 1){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"スクリプトの最後は「1;」で終わらせて下さい。"}';
 
 $access2db -> close;
 exit(0);
}


#
# エラーが無いか実行してみる。
#
my $PATH_script_tmp = &Common_system::dir_tmp() . '/' . $file_name;
open(MSCRIPT, '>', $PATH_script_tmp);
binmode(MSCRIPT);
print MSCRIPT $file_text;
close(MSCRIPT);

eval{
 require($PATH_script_tmp);
};

if(length($@) > 0){
 unlink($PATH_script_tmp);
 
 my %results = (
  'login' => 1,
  'session' => 1,
  'result' => 0,
  'reason' => '次の構文エラーか確認されました。' . "\n" . $@
 );
 
 my $json_reason = &JSON::to_json(\%results);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_reason;
 
 $access2db -> close;
 exit(0);
}


#
# 上書きか新規登録か判別する。
#
my $operation = '';

my $select_column = 'count(*)';
my $table         = 'T_Script';
my $condition     = "where vcScriptId = '" . $sql_escaped_package_name . "'";
$access2db -> set_select($select_column, $table, $condition);
my $count = $access2db -> select_col1;

if($count == 0){
 $operation = 'insert';
}
else{
 my $permission = &Telnetman_common::check_permission($access2db, 'script', $sql_escaped_package_name, $user_id);
 
 if($permission == 1){
  $operation = 'update';
 }
 else{
  print "Content-type: text/plain; charset=UTF-8\n\n";
  print '{"login":1,"session":1,"result":0,"reason":"そのパッケージ名はグループ外の他の人が使っています。"}';
  
  $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
  $access2db -> close;
  exit(0);
 }
}



#
# DB の更新
#
my $escape_user_id = &Common_sub::escape_sql($user_id);

if($operation eq 'insert'){
 my $insert_column = 'vcScriptId,iCreateTime,iUpdateTime,vcUserId,vcChanger';
 my @values = ("('" . $sql_escaped_package_name . "'," . $time . "," . $time . ",'" . $escape_user_id . "','')");
 my $table = 'T_Script';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
}
elsif($operation eq 'update'){
 my @set = ('iUpdateTime = ' . $time, "vcChanger = '" . $escape_user_id . "'");
 my $table     = 'T_Script';
 my $condition = "where vcScriptId = '" . $sql_escaped_package_name . "'";
 $access2db -> set_update(\@set, $table, $condition);
 my $count = $access2db -> update_exe;
}


#
# ユーザーの名前を取り出す。
#
my $user_name = &Telnetman_common::user_name($access2db, $user_id);


$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


#
# 正規のディレクトリに移動させる。
#
my $PATH_script = &Common_system::dir_conversion_script() . '/' . $file_name;
&File::Copy::move($PATH_script_tmp, $PATH_script);

$time += 0;

my %results = (
 'login'     => 1,
 'session'   => 1,
 'result'    => 1,
 'operation' => $operation,
 'script_id' => $package_name,
 'update_time'  => $time
);

if($operation eq 'insert'){
 $results{'user_name'} = $user_name;
 $results{'create_time'} = $time;
}
elsif($operation eq 'update'){
 $results{'changer_name'} = $user_name; 
}

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
