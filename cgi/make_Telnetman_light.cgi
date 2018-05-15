#!/usr/bin/perl
# 説明   : Telnetman light を作成する。
# 作成者 : 江野高広
# 作成日 : 2018/01/23

use strict;
use warnings;

use CGI;
use JSON;
use Data::Dumper::Concise; #yum -y install perl-Data-Dumper-Concise
use File::Copy;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_sub;
use Common_system;
use Access2DB;
use Telnetman_common;



#
# 現在時刻
#
my $time = time;
my ($date) = &Common_sub::YYYYMMDDhhmmss($time, 'YYYY/MM/DD');



#
# ハードコーディングするパラメーターシートとサブルーチンと変換スクリプトリストと、その元となる対象ファイルリスト。
#
my $number_of_nodes = 0;
my %parameter_sheet_list = ();
my @subroutine_list = ();
my %script_id_list = ();

my @file_list_1 = (
 'login_info',
 'terminal_monitor_values',
 'diff_values',
 'optional_log_values'
);

my @file_list_2 = (
 'flowchart',
 'item',
 'item_repeat_type',
 'item_title',
 'routine_loop_type',
 'routine_repeat_type'
);



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
# ユーザーID とセッションID を取得する。
#
my $user_id    = $telnetman_auth -> get_user_id;
my $session_id = $telnetman_auth -> get_session_id;



#
# セッションステータスの確認。
#
my $session_status = &Telnetman_common::get_session_status($access2db, $session_id);
if(($session_status >= 0) && ($session_status <= 3)){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'このセッションは未実施、または、まだ終了していません。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
 exit(0);
}



#
# ユーザー名を取得する。
#
my $user_name = &Telnetman_common::user_name($access2db, $user_id);



#
# セッションタイトルを取得する。
#
my $select_column = 'vcTitle';
my $table         = 'T_SessionStatus';
my $condition     = "where vcSessionId = '" . $session_id . "'";
$access2db -> set_select($select_column, $table, $condition);
my $session_title = $access2db -> select_col1;



$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;



#
# パラメーターシートの定義
#
my $cgi = new CGI;
my $no_hard_coding_parameter_sheet = $cgi -> param('no_hard_coding_parameter_sheet');

if(defined($no_hard_coding_parameter_sheet) && ($no_hard_coding_parameter_sheet == 1)){
 my ($ref_A_list, $ref_B_list, $ref_A_info, $ref_B_info, $error_message_parameters) = &Telnetman_common::convert_parameter([["",""]]);
 $parameter_sheet_list{'A_info'} = $ref_A_info;
 $parameter_sheet_list{'A_list'} = $ref_A_list;
 $parameter_sheet_list{'B_info'} = $ref_B_info;
 $parameter_sheet_list{'B_list'} = $ref_B_list;
}
else{
 #
 # パラメーターシートを受け取る。
 #
 my ($ref_parameter_sheet, $json_parameter_sheet, $error_message_parameter) = &Telnetman_common::get_parameter($cgi);
 
 if(length($error_message_parameter) > 0){
  my %result = (
   'login'      => 1,
   'session'    => 1,
   'result'     => 0,
   'reason'     => $error_message_parameter,
   'session_id' => $session_id,
  );
  
  my $json_result = &JSON::to_json(\%result);
  
  print "Content-type: text/plain; charset=UTF-8\n\n";
  print $json_result;
  
  $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
  $access2db -> close;
  exit(0);
 }
 
 

 #
 # パラメーターシートを変換する。
 #
 my ($ref_A_list, $ref_B_list, $ref_A_info, $ref_B_info, $error_message_parameters) = &Telnetman_common::convert_parameter($ref_parameter_sheet);
 
 if(length($error_message_parameters) > 0){
  my %result = (
   'login'      => 1,
   'session'    => 1,
   'result'     => 0,
   'reason'     => $error_message_parameters,
   'session_id' => $session_id,
  );
 
  my $json_result = &JSON::to_json(\%result);
  
  print "Content-type: text/plain; charset=UTF-8\n\n";
  print $json_result;
  
  $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
  $access2db -> close;
  exit(0);
 }
 
 
 
 #
 # 対象ノードが有ればそのままそれを使い、無ければアップロード済みパラメーターシートを使う。
 #
 $number_of_nodes = scalar(@$ref_A_list);
 if($number_of_nodes > 0){
  $parameter_sheet_list{'A_info'} = $ref_A_info;
  $parameter_sheet_list{'A_list'} = $ref_A_list;
  $parameter_sheet_list{'B_info'} = $ref_B_info;
  $parameter_sheet_list{'B_list'} = $ref_B_list;
 }
 else{
  unshift(@file_list_1, 'B_list');
  unshift(@file_list_1, 'B_info');
  unshift(@file_list_1, 'A_list');
  unshift(@file_list_1, 'A_info');
 }
}



#
# Telentman_light.pl のコピー。
#
my $file_Telnetman_light_template = &Common_system::file_Telnetman_light_template();
my $file_Telnetman_light          = &Common_system::file_Telnetman_light($session_id);
&File::Copy::copy($file_Telnetman_light_template, $file_Telnetman_light);



#
# 各種アップロードファイルのハードコーディング部分の作成。
#
if(($no_hard_coding_parameter_sheet == 1) || ($number_of_nodes > 0)){
 foreach my $file_name ('A_info', 'A_list', 'B_info', 'B_list'){
  my $ref  = $parameter_sheet_list{$file_name};
  my $dump = &Data::Dumper::Concise::Dumper($ref);
  
  $dump =~ s/(\]|\})\n$/ $1/;
  
  my $subroutine = 'sub ' . $file_name . ' {' . "\n" .
                   ' my $ref_data = ' . $dump . ';' . "\n\n" .
                   ' return($ref_data);' . "\n" .
                   '}';
  
  push(@subroutine_list, $subroutine);
 }
}

foreach my $file_name (@file_list_1){
 my $path = &Common_system::file_session_data($session_id, $file_name);
 
 open(JSON, '<', $path);
 my $json = <JSON>;
 close(JSON);
 
 my $ref  = &JSON::from_json($json);
 
 # ログイン情報からユーザー情報を抜く。
 if($file_name eq 'login_info'){
  delete($ref -> {'user'});
  delete($ref -> {'password'});
  delete($ref -> {'enable_password'});
 }
 
 my $dump = &Data::Dumper::Concise::Dumper($ref);
 
 $dump =~ s/(\]|\})\n$/ $1/;
 
 my $subroutine = 'sub ' . $file_name . ' {' . "\n" .
                  ' my $ref_data = ' . $dump . ';' . "\n\n" .
                  ' return($ref_data);' . "\n" .
                  '}';
 
 push(@subroutine_list, $subroutine);
}

foreach my $file_name (@file_list_2){
 my $els = ' ';
 my $subroutine = 'sub ' . $file_name . ' {' . "\n" .
                  ' my $flowchart_type = $_[0];' . "\n\n";
 
 foreach my $flowchart_type ('before', 'middle', 'after'){
  my $path = &Common_system::file_session_data($session_id, $flowchart_type . '_' . $file_name);
  
  open(JSON, '<', $path);
  my $json = <JSON>;
  close(JSON);
  
  my $ref  = &JSON::from_json($json);
  
  # 変換スクリプトの確認。
  if($file_name eq 'item'){
   ITEM : while(my ($item_id, $ref_item_data) = each(%{$ref -> {'action'}})){
    while(my ($category_name, $data) = each(%$ref_item_data)){
     if($category_name eq 'script_id'){
      my $script_id = $data;
      
      if(length($script_id) > 0){
       $script_id_list{$script_id} = $script_id;
      }
      
      next ITEM;
     }
    }
   }
  }
  
  my $dump = &Data::Dumper::Concise::Dumper($ref);
  
  $dump =~ s/(\]|\})\n$/  $1/;
  
  $subroutine .= $els . "if(\$flowchart_type eq '" . $flowchart_type . "'){\n" .
                        '  my $ref_data = ' . $dump . ';' . "\n\n" .
                        '  return($ref_data);' . "\n" .
                        ' }';

  $els = "\n" . ' els';
 }
 
 $subroutine .= "\n" . '}';
 push(@subroutine_list, $subroutine);
}



#
# Telentman_light.pl を作成する。
#
open(LIGHT, '+<', $file_Telnetman_light);
my @Telnetman_light = <LIGHT>;
seek(LIGHT, 0, 0);
truncate(LIGHT, 0);

print LIGHT '#!/usr/bin/perl' . "\n";
print LIGHT '# 説明   : ' . $session_title . "\n";
print LIGHT '# 作成者 : ' . $user_name . "\n";
print LIGHT '# 作成日 : ' . $date . "\n";

print LIGHT @Telnetman_light;



#
# 変換スクリプトの記載。
#
my @keys_script_id_list = keys(%script_id_list);
if(scalar(@keys_script_id_list) > 0){
 my $dir_script  = &Common_system::dir_conversion_script();
 
 print LIGHT '##################' . "\n";
 print LIGHT '# 変換スクリプト #' . "\n";
 print LIGHT '##################' . "\n";
 foreach my $script_id (@keys_script_id_list){
  my $path = $dir_script . '/' . $script_id . '.pl';
  my $script = '';
  
  if(-e $path){
   open(MSCRIPT, '<', $path);
   while(my $line = <MSCRIPT>){
    if($line =~ /package/){
     $line =~ s/package\s+([^;\s]+)\s*;/package $1;/;
    }
    
    $script .= $line;
   }
   close(MSCRIPT);
   
   my $pos = index($script, 'package ' . $script_id . ';');
   substr($script, 0, $pos) = '';
   
   $pos = rindex($script, '1;');
   substr($script, $pos) = '';
  }
  
  print LIGHT $script . "\n\n";
 }
 
 print LIGHT "\n\n";
}



#
# 各種アップロードファイルのハードコーディング。
#
print LIGHT '#########################' . "\n";
print LIGHT '# ハードコーディング    #' . "\n";
print LIGHT '#  - パラメーターシート #' . "\n";
print LIGHT '#  - ログイン情報       #' . "\n";
print LIGHT '#  - SYSLOG 確認設定    #' . "\n";
print LIGHT '#  - Diff 設定          #' . "\n";
print LIGHT '#  - 任意ログ設定       #' . "\n";
print LIGHT '#  - 流れ図             #' . "\n";
print LIGHT '#  - Command 内容       #' . "\n";
print LIGHT '#  - Action 内容        #' . "\n";
print LIGHT '#  - Ping 内容          #' . "\n";
print LIGHT '#########################' . "\n";
print LIGHT 'package Telnetman_data;' . "\n\n"; 
foreach my $subroutine (@subroutine_list){
 print LIGHT $subroutine . "\n\n";
}

close(LIGHT);



#
# 結果を返す。
#
my %result = (
 'login'      => 1,
 'session'    => 1,
 'result'     => 1,
 'session_id' => $session_id,
);

my $json_result = &JSON::to_json(\%result);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_result;
