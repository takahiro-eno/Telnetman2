#!/usr/bin/perl
# 説明   : Telnetman 固有のサブルーチン、または、セッションデータに関するサブルーチン集。
# 作成者 : 江野高広
# 作成日 : 2014/08/21
# 更新   : 2017/01/28 include, exclude, begin に対応。
# 更新   : 2017/09/12 Ver.2 用に修正。ユーザーグループ確認関数を追加。

use strict;
use warnings;

package Telnetman_common;

use File::Path;
use Archive::Zip;# sudo yum install perl-Archive-Zip
use Encode;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Common_sub;
use Common_system;

#
# セッションデータ格納ディレクトリを作成する。
#
sub make_session_data_dir {
 my $session_id = $_[0];
 my $dir_session = &Common_system::dir_session($session_id);
 
 unless(-d $dir_session){
  mkdir($dir_session, 0755);
 }
}


#
# セッションデータを圧縮保存する。
#
sub archive_session_data {
 my $session_id = $_[0];
 
 # バックアップ対象のディレクトリ。
 my $dir_session = &Common_system::dir_session($session_id);
 
 if(-d $dir_session){
  my ($user_id, $pushed_time) = &Telnetman_common::check_session_owner($session_id);
  $user_id = &Common_sub::escape_filename($user_id);
  
  # バックアップ先ディレクトリを作成する。
  my $dir_archive = &Common_system::dir_archive($user_id);
  unless(-d $dir_archive){
   mkdir($dir_archive, 0755);
  }
  
  # zip の名前とパスを定義する。
  my $archive_name = &Telnetman_common::archive_name($session_id, $pushed_time);
  my $file_zip = $dir_archive . '/' . $archive_name . '.zip';
  
  # zip 圧縮する。
  my $zip = Archive::Zip -> new();
  $zip -> addTree($dir_session, $archive_name);
  $zip -> writeToFileNamed($file_zip);
  
  # 元のファイルを削除する。
  &File::Path::rmtree($dir_session);
 }
}



#
# ログの圧縮ファイルをたどるのに必要なデータをDB に保存する。
#
sub insert_archive_data{
 my $access2db   = $_[0];
 my $session_id  = $_[1];
 
 my ($user_id, $pushed_time) = &Telnetman_common::check_session_owner($session_id);
 
 if($pushed_time > 0){
  my ($pushed_date) = &Common_sub::YYYYMMDDhhmmss($pushed_time, 'YYYYMMDD');
  
  my $select_column = 'vcTitle';
  my $table     = 'T_SessionStatus';
  my $condition = "where vcSessionId = '" . $session_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $session_title = $access2db -> select_col1;
  
  my $insert_column = 'iYyyyMmDd,vcUserId,vcSessionId,vcTitle,iPushedTime';
  my @values = ("(" . $pushed_date . ",'" . &Common_sub::escape_sql($user_id) . "','" . $session_id . "','" . &Common_sub::escape_sql($session_title) . "'," . $pushed_time . ")");
  $table = 'T_Archive';
  $access2db -> set_insert($insert_column, \@values, $table);
  $access2db -> insert_exe;
 }
}



#
# ログの圧縮ファイル名。
#
sub archive_name {
 my $session_id = $_[0];
 my $pushed_time = $_[1];
 
 my ($pushed_date) = &Common_sub::YYYYMMDDhhmmss($pushed_time, 'YYYYMMDD-hhmmss');
 my $archive_name = $pushed_date . '_' . $session_id;
 
 return($archive_name);
}



#
# セッションの実行者と時刻開始時刻を取得する。
#
sub check_session_owner {
 my $session_id = $_[0];
 my @stamp = ();
 
 my $file_stamp = &Common_system::file_stamp($session_id);
 
 if(-f $file_stamp ){
  open(STAMP, '<', $file_stamp);
  while(my $line = <STAMP>){
   chomp($line);
   
   push(@stamp, $line);
  }
  close(STAMP);
  
  my $user_id     = $stamp[0];
  my $pushed_time = $stamp[1];
  
  return($user_id, $pushed_time);
 }
 else{
  return('', 0);
 }
}


#
# セッションデータのスタンプを作成する。
#
sub make_stamp {
 my $session_id = $_[0];
 my $user_id    = $_[1];
 my $time       = $_[2];
 
 &Telnetman_common::make_session_data_dir($session_id);
 
 my $file_stamp = &Common_system::file_stamp($session_id);
 open(STAMP, '>', $file_stamp);
 print STAMP $user_id . "\n" . $time;
 close(STAMP);
}


#
# セッションデータを作成する。
#
sub make_session_data {
 my $session_id = $_[0];
 my $data_type  = $_[1];
 my $json       = $_[2];
 
 if(defined($json) && (length($json) > 0)){
  &Telnetman_common::make_session_data_dir($session_id);
  
  my $file_session_data = &Common_system::file_session_data($session_id, $data_type);
  open(SDATA, '>', $file_session_data);
  print SDATA $json;
  close(SDATA);
 }
}


#
# セッションデータを読み取る。
#
sub read_session_data {
 my $session_id = $_[0];
 my $data_type  = $_[1];
 my $json = '';
 
 my $file_session_data = &Common_system::file_session_data($session_id, $data_type);
 
 if(-f $file_session_data){
  open(SDATA, '<', $file_session_data);
  while(my $line = <SDATA>){
   chomp($line);
   $json .= $line;
  }
  close(SDATA);
 }
 
 return($json);
}



#
# telnet ログのヘッダーを作る。
#
sub make_telnet_log_header {
 my $node_status = $_[0];
 my $start_time  = $_[1];
 
 my ($date) = &Common_sub::YYYYMMDDhhmmss($start_time, 'YYYY/MM/DD hh:mm:ss');
 
 my $status = 'OK終了';
 if($node_status == 5){
  $status = 'NG終了';
 }
 elsif($node_status == 6){
  $status = 'NG強制続行';
 }
 elsif($node_status == 7){
  $status = '強制終了';
 }
 elsif($node_status == 8){
  $status = 'エラー終了';
 }
 
 my $header = $node_status . "\n" .
              $start_time . "\n" .
              $status . "\n" .
              $date . "\n\n";
 
 return($header);
}



#
# telnet ログを作成する。
#
sub make_telnet_log {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 my $log = $_[2];
 
 my $dir_telnet_log = &Common_system::dir_telnet_log($session_id);
 
 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
  
  # 実行者がroot だったら所有者をApache にする。
  if($< == 0){
   chown(48, 48, $dir_telnet_log);
  }
 }
 
 my $file_telnet_log = &Common_system::file_telnet_log($session_id, $ip_address);
 open(TLOG, '>', $file_telnet_log);
 print TLOG $log;
 close(TLOG);
 
 if($< == 0){
  chown(48, 48, $file_telnet_log);
 }
 
 # ShifJIS のログも作成する。
 $log =~ s/\n/\r\n/g;
 &Encode::from_to($log, 'UTF-8', 'Shift_JIS');
 
 my $file_telnet_log_sjis = &Common_system::file_telnet_log_sjis($session_id, $ip_address);
 open(TLOG, '>', $file_telnet_log_sjis);
 print TLOG $log;
 close(TLOG);
 
 if($< == 0){
  chown(48, 48, $file_telnet_log_sjis);
 }
}



#
# 任意ログを作成する。
#
sub make_optional_log {
 my $session_id = $_[0];
 my $header = $_[1];
 my $value = $_[2];
 
 my $dir_telnet_log = &Common_system::dir_telnet_log($session_id);
 
 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
  
  # 実行者がroot だったら所有者をApache にする。
  if($< == 0){
   chown(48, 48, $dir_telnet_log);
  }
 }
 
 my $file_optional_log = &Common_system::file_optional_log($session_id);
 
 if(-f $file_optional_log){
  open(OLOGU, '>>', $file_optional_log);
  flock(OLOGU, 2);
  print OLOGU $value;
  close(OLOGU);
  
  if($< == 0){
   chown(48, 48, $file_optional_log);
  }
 }
 else{
  open(OLOGU, '>', $file_optional_log);
  flock(OLOGU, 2);
  print OLOGU $header . "\n" . $value;
  close(OLOGU);
 }
 
 
 # ShifJIS のログも作成する。
 $value =~ s/\n/\r\n/g;
 &Encode::from_to($value, 'UTF-8', 'Shift_JIS');
 &Encode::from_to($header, 'UTF-8', 'Shift_JIS');
 
 my $file_optional_log_sjis = &Common_system::file_optional_log_sjis($session_id);
 
 if(-f $file_optional_log_sjis){
  open(OLOGJ, '>>', $file_optional_log_sjis);
  flock(OLOGJ, 2);
  print OLOGJ $value;
  close(OLOGJ);
  
  if($< == 0){
   chown(48, 48, $file_optional_log_sjis);
  }
 }
 else{
  open(OLOGJ, '>', $file_optional_log_sjis);
  flock(OLOGJ, 2);
  print OLOGJ $header . "\r\n" . $value;
  close(OLOGJ);
 }
}



#
# track ログを作成する。
#
sub make_track_log {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 my $log = $_[2];
 
 my $dir_telnet_log = &Common_system::dir_telnet_log($session_id);
 
 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
  
  # 実行者がroot だったら所有者をApache にする。
  if($< == 0){
   chown(48, 48, $dir_telnet_log);
  }
 }
 
 my $file_track_log = &Common_system::file_track_log($session_id, $ip_address);
 open(TRACK, '>', $file_track_log);
 print TRACK $log;
 close(TRACK);
 
 if($< == 0){
  chown(48, 48, $file_track_log);
 }
}



#
# diff ログを作成する。
#
sub make_diff_log {
 my $session_id  = $_[0];
 my $ip_address  = $_[1];
 my $diff_header = $_[2];
 my $diff_log    = $_[3];
 
 my $dir_telnet_log = &Common_system::dir_telnet_log($session_id);
 
 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
  
  # 実行者がroot だったら所有者をApache にする。
  if($< == 0){
   chown(48, 48, $dir_telnet_log);
  }
 }
 
 my $file_diff_log = &Common_system::file_diff_log($session_id, $ip_address);
 open(DIFF, '>', $file_diff_log);
 print DIFF $diff_header . "\n\n" . $diff_log;
 close(DIFF);
 
 if($< == 0){
  chown(48, 48, $file_diff_log);
 }
 
 # ShifJIS のログも作成する。
 &Encode::from_to($diff_header, 'UTF-8', 'Shift_JIS');
 &Encode::from_to($diff_log, 'UTF-8', 'Shift_JIS');
 $diff_log =~ s/\n/\r\n/g;
 
 my $file_diff_log_sjis = &Common_system::file_diff_log_sjis($session_id, $ip_address);
 open(DIFF, '>', $file_diff_log_sjis);
 print DIFF $diff_header . "\r\n\r\n" . $diff_log;
 close(DIFF);
 
 if($< == 0){
  chown(48, 48, $file_diff_log_sjis);
 }
}



#
# 追加パラメーターシートをファイルにする。
#
sub make_additional_parameter_sheet {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 my $ref_additional_parameter_sheet = $_[2];
 
 if(defined($ref_additional_parameter_sheet)){
  my $json_additional_parameter_sheet = &JSON::to_json($ref_additional_parameter_sheet);
  
  my $dir_telnet_log = &Common_system::dir_telnet_log($session_id);
  
  unless(-d $dir_telnet_log){
   mkdir($dir_telnet_log, 0755);
   
   # 実行者がroot だったら所有者をApache にする。
   if($< == 0){
    chown(48, 48, $dir_telnet_log);
   }
  }
  
  my $file_additional_parameter_sheet = &Common_system::file_additional_parameter_sheet($session_id, $ip_address);
  open(PSHEET, '>', $file_additional_parameter_sheet);
  print PSHEET $json_additional_parameter_sheet;
  close(PSHEET);
  
  if($< == 0){
   chown(48, 48, $file_additional_parameter_sheet);
  }
 }
}


#
# queue に登録する。
#
sub push_queue {
 my $access2db = $_[0];
 my $session_id = $_[1];
 
 my $select_column = 'max(iQueueIndex)';
 my $table     = 'T_Queue';
 my $condition = '';
 $access2db -> set_select($select_column, $table, $condition);
 my $queue_index = $access2db -> select_col1;
 
 unless(defined($queue_index)){
  $queue_index = 0;
 }
 
 $queue_index ++;
 
 my $insert_column = 'vcSessionId,iQueueIndex';
 my @values = ("('" . $session_id . "'," . $queue_index . ")");
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
}



#
# セッションステータスを更新する。
#
sub update_session_status {
 my $access2db    = $_[0];
 my $session_id   = $_[1];
 my $total_time   = $_[2];
 my $total_number = $_[3];
 
 my $update_time = time;

 my $select_column = 'min(iNodeStatus)';
 my $table         = 'T_NodeStatus';
 my $condition     = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $min_node_status = $access2db -> select_col1;

 $min_node_status += 0;

 my $session_status = 4;
 if($min_node_status < 4){
  $session_status = $min_node_status;
 }

 my @set = ('iUpdateTime = ' . $update_time, 'iSessionStatus = ' . $session_status);
 if(defined($total_time)){
  push(@set, 'iTotalTime = iTotalTime + ' . $total_time);
 }
 
 if(defined($total_number)){
  push(@set, 'iTotalNumber = iTotalNumber + ' . $total_number);
 }
 
 $table     = 'T_SessionStatus';
 $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;

 $session_status += 0;

 return($session_status);
}



#
# セッションステータスを取得。
#
sub get_session_status {
 my $access2db = $_[0];
 my $session_id = $_[1];
 
 my $select_column = 'iSessionStatus';
 my $table         = 'T_SessionStatus';
 my $condition     = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $session_status = $access2db -> select_col1;
 
 if(defined($session_status)){
  $session_status += 0;
 }
 else{
  $session_status = -1;
 }
 
 return($session_status);
}


#
# 自動一時停止するのかどうか確認する。
#
sub check_session_mode {
 my $access2db = $_[0];
 my $session_id = $_[1];
 
 my $select_column = 'iAutoPause';
 my $table         = 'T_SessionStatus';
 my $condition     = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $auto_pause = $access2db -> select_col1;
 
 if(defined($auto_pause)){
  $auto_pause += 0;
 }
 else{
  $auto_pause = 0;
 }
 
 return($auto_pause);
}


#
# コマンド結果のパターンマッチ
#
sub pattern_match {
 my $command_return = $_[0];
 my $pattern        = $_[1];
 my $pipe_type      = $_[2];
 my $pipe_words     = $_[3];
 
 $pattern    = &Common_sub::trim_lines($pattern);
 $pipe_words = &Common_sub::trim_lines($pipe_words);
 
 if((!defined($pipe_words) || (length($pipe_words) == 0)) && (!defined($pattern) || (length($pattern) == 0))){
  return(1, $command_return);
 }
 
 $command_return = &Common_sub::trim_lines($command_return);
 
 my @command_resul_list = split(/\n/, $command_return);
 my @pattern_list       = split(/\n/, $pattern);
 my @pipe_word_list     = split(/\n/, $pipe_words);
 my @trimed_pipe_word_list = &Common_sub::trim_array(@pipe_word_list);
 
 my @escaped_pipe_word_list = ();
 foreach my $pipe_word (@trimed_pipe_word_list){
  if(length($pipe_word) > 0){
   my $escaped_pipe_word = &Common_sub::escape_reg($pipe_word);
   push(@escaped_pipe_word_list, $escaped_pipe_word);
  }
 }
 
 my $number_of_pattern   = scalar(@pattern_list);
 my $number_of_pipe_word = scalar(@escaped_pipe_word_list);
 my @matched_values = ();
 
 my $include = 0;
 my $exclude = 0;
 my $begin = 0;
   
 foreach my $command_resul_line (@command_resul_list){
  if($number_of_pipe_word > 0){
   if($begin == 0){
    foreach my $escaped_pipe_word (@escaped_pipe_word_list){
     if($pipe_type == 1){
      $include = 0;
     }
     elsif($pipe_type == 2){
      $exclude = 1;
     }
     
     if(length($escaped_pipe_word) > 0){
      if($command_resul_line =~ /$escaped_pipe_word/){
       if($pipe_type == 1){
        $include = 1;
        last;
       }
       elsif($pipe_type == 2){
        $exclude = 0;
        last;
       }
       elsif($pipe_type == 3){
        $begin = 1;
        last;
       }
      }
     }
    }
   }
   
   if(($include == 0) && ($exclude == 0) && ($begin == 0)){
    next;
   }
  }
  
  if($number_of_pattern > 0){
   foreach my $pattern_line (@pattern_list){
    my @tmp_matched_values = ();
    eval{@tmp_matched_values = $command_resul_line =~ /$pattern_line/g;};
    
    if(length($@) > 0){
     return(-1, $pattern_line);
    }
    
    if(scalar(@tmp_matched_values) > 0){
     push(@matched_values, @tmp_matched_values);
    }
   }
  }
  else{
   push(@matched_values, $command_resul_line);
  }
 }
 
 my $count_of_values = scalar(@matched_values);
 
 return($count_of_values, @matched_values);
}



#
# タイプのからテーブル名、IDカラム名の指定を行う。
#
sub table {
 my $item_type = $_[0];
 
 if($item_type eq 'command'){
  return('T_Command');
 }
 elsif($item_type eq 'action'){
  return('T_Action');
 }
 elsif($item_type eq 'ping'){
  return('T_Ping');
 }
 elsif($item_type eq 'script'){
  return('T_Script');
 }
}

sub id_column {
 my $item_type = $_[0];
 
 if($item_type eq 'command'){
  return('vcCommandId');
 }
 elsif($item_type eq 'action'){
  return('vcActionId');
 }
 elsif($item_type eq 'ping'){
  return('vcPingId');
 }
 elsif($item_type eq 'script'){
  return('vcScriptId');
 }
}



#
# セッション削除
#
sub delete_session {
 my $access2db  = $_[0];
 my $user_id    = $_[1];
 my $session_id = $_[2];
 
 my $table     = 'T_SessionStatus';
 my $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 $table = "T_NodeStatus";
 $access2db -> set_delete($table);
 $access2db -> delete_exe;
 
 $table     = 'T_SessionList';
 $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "' and vcSessionId = '" . $session_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
}



#
# プロンプトの正規表現に問題が無いか確認する。
#
sub check_prompt_reg {
 my $reg_prompt = $_[0];
 
 if(!defined($reg_prompt) || (length($reg_prompt) == 0)){
  return('1');
 }
 
 if($reg_prompt =~ /^\^/){
  return('先頭を表す「^」を使うと仕様上プロンプトを検知出来ません。');
 }
 
 my @split_reg_prompt = split(//, $reg_prompt);
 my $last_character = pop(@split_reg_prompt);
 my $flag_escape = 0;
 foreach my $character (@split_reg_prompt){
  if(($flag_escape == 0) && ($character eq "\$")){
   return('末尾を表すため以外でエスケープ無しの「' . "\$" . '」を使うとプロンプトを検知出来ません。');
  }
  
  if(($flag_escape == 0) && ($character eq "\\")){
   $flag_escape = 1;
  }
  else{
   $flag_escape = 0;
  }
 }
 
 unless(($flag_escape == 0) && ($last_character eq "\$")){
  return('末尾を表す「' . "\$" . '」は付けた方が良いです。');
 }
 
 eval{
  my $test_string = 'ABCDEFG';
  my @matches = $test_string =~ /$reg_prompt/g;
 };
 
 if(length($@) > 0){
  my $error_message = '正規表現が正しく書けていないようです。' . "\n" . $@;
  $@ = '';
  return($error_message);
 }
 
 return('1');
}



#
# パラメーターシートを復元する。
#
sub restore_ref_parameter_sheet {
 my $ref_A_list = $_[0];
 my $ref_B_list = $_[1];
 my $ref_A_info = $_[2];
 my $ref_B_info = $_[3];
 my @parameter_sheet = ();
 $parameter_sheet[0] = ['', ''];
 
 # どの変数が何列目にあるか。
 my $max_index = 1;
 my %variable_name_index_list = ();
 
 # ノード情報を埋めていく。
 my $count_node = scalar(@$ref_A_list);
 for(my $i = 0; $i < $count_node; $i ++){
  my $node = $ref_A_list -> [$i];
  my @rows = ();
  $rows[0] = $node;
  $rows[1] = '';
  
  unless(exists($ref_A_info -> {$node})){
   push(@parameter_sheet, \@rows);
   next;
  }
  
  foreach my $variable_name (sort {$a cmp $b} keys %{$ref_A_info -> {$node}}){
   my $value = $ref_A_info -> {$node} -> {$variable_name};
   
   if(defined($value) && length($value) == 0){
    $value = '_BLANK_';
   }
   
   unless(exists($variable_name_index_list{$variable_name})){
    $max_index ++;
    $variable_name_index_list{$variable_name} = $max_index;
    $parameter_sheet[0] -> [$max_index] = $variable_name;
   }
   
   my $index = $variable_name_index_list{$variable_name};
   $rows[$index] = $value;
  }
  
  push(@parameter_sheet, \@rows);
 }
 
 # B情報を埋めていく。
 my $A_info_length = $max_index;
 for(my $i = 0; $i < $count_node; $i ++){
  my $node = $ref_A_list -> [$i];
  
  unless(exists($ref_B_list -> {$node})){
   next;
  }
  
  my $count_B = scalar(@{$ref_B_list -> {$node}});
  for(my $j = 0; $j < $count_B; $j ++){
   my $B = $ref_B_list -> {$node} -> [$j];
   my @rows = ();
   $rows[0] = $node;
   $rows[1] = $B;
   
   for(my $k = 2; $k <= $A_info_length; $k ++){
    $rows[$k] = '';
   }
   
   unless(exists($ref_B_info -> {$node} -> {$B})){
    next;
   }
   
   #while(my ($variable_name, $value) = each(%{$ref_B_info -> {$node} -> {$B}})){
   foreach my $variable_name (sort {$a cmp $b} keys %{$ref_B_info -> {$node} -> {$B}}){
    my $value = $ref_B_info -> {$node} -> {$B} -> {$variable_name};
    
    if(defined($value) && length($value) == 0){
     $value = '_BLANK_';
    }
    
    unless(exists($variable_name_index_list{$variable_name})){
     $max_index ++;
     $variable_name_index_list{$variable_name} = $max_index;
     $parameter_sheet[0] -> [$max_index] = $variable_name;
    }
    
    my $index = $variable_name_index_list{$variable_name};
    $rows[$index] = $value;
   }
   
   push(@parameter_sheet, \@rows);
  }
 }
 
 return(\@parameter_sheet);
}




#
# コマンド、アクション、ping, script の更新者が作成者と同じグループに属しているか確認する。
#
sub check_permission {
 my $access2db = $_[0];
 my $item_type = $_[1];
 my $item_id   = $_[2];
 my $user_id   = $_[3];
 my $check = 0;
 
 unless(defined($item_id) && (length($item_id) > 0)){
  return(0);
 }
 
 unless(defined($user_id) && (length($user_id) > 0)){
  return(0);
 }
 
 my $select_column = 'vcUserId';
 my $table         = &Telnetman_common::table($item_type);
 my $condition     = 'where ' . &Telnetman_common::id_column($item_type) . " = '" . $item_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $owner_id = $access2db -> select_col1;
 
 if($user_id eq $owner_id){
  $check = 1;
 }
 else{
  $select_column = 'vcGroupId';
  $table         = 'T_UserGroup';
  $condition     = "where vcUserId = '" . &Common_sub::escape_sql($owner_id) . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $ref_group_list = $access2db -> select_array_col1;
  
  $select_column = 'vcGroupId,vcUserId';
  $table         = 'T_GroupUser';
  $condition     = "where vcGroupId in ('" . join("','", @$ref_group_list) . "')";
  $access2db -> set_select($select_column, $table, $condition);
  my $ref_user_list = $access2db -> select_hash_array_col2;
  
  CHECKUSER : foreach my $group_id (@$ref_group_list){
   foreach my $_user_id (@{$ref_user_list -> {$group_id}}){
    if($_user_id eq $user_id){
     $check = 1;
     last CHECKUSER;
    }
   }
  }
 }
 
 return($check);
}


#
# コマンド、アクション、ping の新規作成か更新か判定する。
#
sub check_operation {
 my $access2db = $_[0];
 my $item_type = $_[1];
 my $item_id   = $_[2];
 my $count = 0;
 my $operation = 'create';
 
 if(length($item_id) > 0){
  my $select_column = 'count(*)';
  my $table = &Telnetman_common::table($item_type);
  my $condition = 'where ' . &Telnetman_common::id_column($item_type) . " = '" . $item_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  $count = $access2db -> select_col1;
  $count += 0;
 }
 else{
  $item_id = &Common_sub::uuid();
 }
 
 if($count > 0){
  $operation = 'update';
 }
 
 return($operation, $item_id);
}



#
# T_Search の更新。
#
sub update_T_Search {
 my $access2db = $_[0];
 my $keyword   = $_[1];
 my $item_type = $_[2];
 my $item_id   = $_[3];
 my $title     = $_[4];
 
 my $table     = 'T_Search';
 my $condition = "where vcItemType = '" . $item_type . "' and vcItemId = '" . $item_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
 
 if(length($keyword) == 0){
  $keyword = '_BLANK_';
 }
 
 my $escaped_keyword = &Common_sub::escape_sql($keyword);
 my $escaped_title   = &Common_sub::escape_sql($title);
 
 my $insert_column = 'vcKeyword,vcItemType,vcItemId,vcTitle';
 my @values = "('" . $escaped_keyword . "','" . $item_type . "','" . $item_id . "','" . $escaped_title . "')";
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
}


#
# ログの行頭部分
#
sub prefix_log {
 my $user_id = $_[0];
 
 unless(defined($user_id)){
  $user_id = '';
 }
 
 my $time = time;
 my ($date_time) = &Common_sub::YYYYMMDDhhmmss($time);
 
 my $script_path = $0;
 my $pos = rindex($script_path, '/');
 my $script_name = substr($script_path, $pos + 1);
 
 return($date_time . ' ' . $user_id . ' ' . $script_name . ' : ');
}



#
# パラメーターシートを受け取る。
#
sub get_parameter {
 my $cgi = $_[0];
 my $ref_parameter_sheet = undef;
 my $json_parameter_sheet = '';
 my $error_message = '';
 
 my $parameter_json     = $cgi -> param('parameter_json');
 my $parameter_csv_file = $cgi -> param('parameter_csv_file');
 
 if(defined($parameter_json) && (length($parameter_json) > 0)){
  $json_parameter_sheet = $parameter_json;
  
  eval{
   $ref_parameter_sheet = &JSON::from_json($json_parameter_sheet);
  };
  
  if(length($@) == 0){
   if(ref($ref_parameter_sheet) eq 'ARRAY'){
    unless(defined($ref_parameter_sheet -> [0]) && (ref($ref_parameter_sheet -> [0]) eq 'ARRAY')){
     $error_message = 'パラメーターシートのデータ形式が不正です。';
    }
   }
   else{
    $error_message = 'パラメーターシートのデータ形式が不正です。';
   }
   
   $@ = '';
  }
  else{
   $error_message = 'パラメーターシートのデータ形式が不正です。';
  }
 }
 elsif(defined($parameter_csv_file) && (length($parameter_csv_file) > 0)){
  my $csv = '';
  my $fh = $cgi -> upload('parameter_csv_file');
  my $size = (stat($fh))[7];
  read($fh, $csv, $size);
  
  my @parameter_sheet = ();
  
  $csv =~ s/\r//g;
  my @rows = split(/\n/, $csv);
  foreach my $row (@rows){
   
   unless(defined($row) && (length($row) > 0)){
    next;
   }
   elsif($row =~ /^\s*#/){
    next;
   }
   
   my @cols = split(/,|\t/, $row);
   push(@parameter_sheet, \@cols);
  }
  
  $ref_parameter_sheet = \@parameter_sheet;
  $json_parameter_sheet = &JSON::to_json($ref_parameter_sheet);
 }
 
 if(length($json_parameter_sheet) == 0){
  return([["",""]], '[["",""]]', '');
 }
 
 return($ref_parameter_sheet, $json_parameter_sheet, $error_message);
}



#
# パラメーターシートからA_list, B_list, A_info, B_info を作成する。
#
sub convert_parameter {
 my $ref_parameter_sheet = $_[0];
 my @A_list = ();
 my %B_list = ();
 my %A_info = ();
 my %B_info = ();
 my $error_message = '';
 
 # 変数名を取り出す。
 my $ref_name_row = shift(@$ref_parameter_sheet);
 splice(@$ref_name_row, 0, 2);
 
 
 # 変数名に誤りが無いか確認する。
 foreach my $variable_name (@$ref_name_row) {
  if(defined($variable_name) && (length($variable_name) > 0)){
   if($variable_name =~ /\$/){
    $error_message = '変数名に$ は使えません。';
   }
   elsif($variable_name =~ /#/){
    $error_message = '変数名に# は使えません。';
   }
   elsif($variable_name =~ /\*/){
    $error_message = '変数名に* は使えません。';
   }
   elsif($variable_name =~ /:/){
    $error_message = '変数名に: は使えません。';
   }
   elsif($variable_name =~ /\{/){
    $error_message = '変数名に{ は使えません。';
   }
   elsif($variable_name =~ /\}/){
    $error_message = '変数名に} は使えません。';
   }
   elsif($variable_name =~ /^\s+$/){
    $error_message = '空白文字のみの変数名は使えません。';
   }
   elsif(&Common_sub::check_fullsize_character($variable_name) == 0){
    $error_message = '変数名に全角文字は使えません。';
   }
  }
 }
 
 if(length($error_message) > 0){
  return(\@A_list, \%B_list, \%A_info, \%B_info, $error_message);
 }
 
 # ****_list を作成する。
 foreach my $ref_variable_row (@$ref_parameter_sheet){
  my $node  = shift(@$ref_variable_row);
  my $B     = shift(@$ref_variable_row);
  
  unless(defined($node) && (length($node) > 0)){
   next;
  }
  elsif($node =~ /^\s*#/){
   next;
  }
  elsif($node =~ /^\s+$/){
   next;
  }
  
  
  # 枠作り
  if(defined($B) && (length($B) > 0)){
   unless(exists($B_list{$node})){
    $B_list{$node} = [];
    $B_info{$node} = {};
   }
   
   unless(exists($B_info{$node} -> {$B})){
    push(@{$B_list{$node}}, $B);
    $B_info{$node} -> {$B} = {};
   }
  }
  else{
   unless(exists($A_info{$node})){
    push(@A_list, $node);
    $A_info{$node} = {};
   }
  }
  
  my $number_of_variable = scalar(@$ref_name_row);
  
  for(my $i = 0; $i < $number_of_variable; $i ++){
   my $variable_name = $ref_name_row -> [$i];
   
   unless(defined($variable_name) && (length($variable_name) > 0)){
    next;
   }
   elsif($variable_name =~ /^\s+$/){
    next;
   }
   
   if(defined($ref_variable_row -> [$i]) && (length($ref_variable_row -> [$i]) > 0)){
    my $value = $ref_variable_row -> [$i];
    
    if(defined($B) && (length($B) > 0)){
     $B_info{$node} -> {$B} -> {$variable_name} = $value;
    }
    else{
     $A_info{$node} -> {$variable_name} = $value;
    }
   }
  }
 }
 
 return(\@A_list, \%B_list, \%A_info, \%B_info, $error_message);
}




#
# ユーザーの名前を取り出す。
#
sub user_name {
 my $access2db = $_[0];
 my $user_id   = $_[1];
 
 my $select_column = 'vcUserName';
 my $table = 'T_User';
 my $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $user_name = $access2db -> select_col1;

 return($user_name); 
}

1;
