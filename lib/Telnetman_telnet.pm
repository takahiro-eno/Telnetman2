#!/usr/bin/perl
# 説明   : 流れ図に従ってtelnet を実行する。
# 作成日 : 2014/08/25
# 作成者 : 江野高広
# 更新 2015/01/24 : &exec_command に、コマンド実行後にEnter を実行して2行連続で同じ文字列のプロンプトが検知できるかどうかの判断機能を追加。
# 更新 2015/07/08 : space 20個 Enter のロジックを大幅に更新。buffer に溜まり続けてprompt 検知の処理が遅くなるのを改善。
#                 : space 20個 と余計なプロンプトを除去する処理を改善。正規表現による除去からrindex, substr による処理へ。
#      2015/10/23 : syslog 検出機能追加。
#      2015/11/09 : user, password, enable_password も変数として使えるように。
#      2015/11/19 : show コマンドで_DUMMY_ を使えるように。
#      2015/11/30 : iOperator, iCount を追加。
#      2015/12/09 : --More-- に対応。
#      2016/06/27 : SSH に対応。
#      2017/08/01 : ローカル認証対応を修正。パラメーターシート追加で改行を_LF_ に変換するように修正。
#      2017/09/01 : ルーチンの繰り返し逆順を追加。
#      2017/10/31 : Ver2 に向けて大幅更新。
#      2018/05/16 : Begin, End 機能の追加。
#      2018/06/11 : コンソールログインの場合、Escape character is '^]'. で止まるので対応。
#      2018/06/11 : 個別プロンプト追加。
#      2019/03/29 : get_complete_command_list で{変数} 変換後に_LF_ を改行に変換できていないのを修正。
#      2020/01/28 : プロンプト多重確認の回数の上限を無しから10 に設定。
#      2020/06/08 : ssh ログインで不具合が出るためlocal 認証対策をコメントアウト。

use strict;
use warnings;

package Telnetman_telnet;

use JSON;
use Net::Telnet;# yum install perl-Net-Telnet
use Text::Diff;
use Net::OpenSSH;# yum install perl-Net-OpenSSH

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Common_sub;
use Common_system;
use Reverse_polish_notation;
use MTping;

sub new {
 my $self = $_[0];
 
 my $RPN = Reverse_polish_notation -> new();
 
 my %parameter_list = (
  'RPN' => $RPN,
  'telnet' => undef,
  'ssh' => undef,
  'eof_flag' => 0,
  'flag_space_20' => 1,
  'start_time' => 0,
  'total_time' => 0,
  'total_number' => 0,
  'node' => '',# telnet 実行中のノード
  'B' => '',# メインルーチンが繰り返し実行型の場合、現在対象となっているB値。
  'session_id' => '',
  'dummy' => 0,
  'item'             => undef,
  'item_repeat_type' => undef,
  'item_title'       => undef,
  'flowchart'           => undef,
  'routine_repeat_type' => undef,
  'routine_loop_type'   => undef,
  'login_info'          => undef,
  'A_list' => undef,
  'B_list' => undef,
  'A_info' => undef,
  'B_info' => undef,
  'matched_prompt'  => '',
  'command_return'  => '',
  'LOG'             => '',
  'TRACK'           => [],
  'x' => 0,# 流れ図の現在位置
  'y' => 0,# 流れ図の現在位置
  'z' => 0,# 流れ図の現在位置(ルーチン番号)
  'this_routine_index' => 0,# 現在実行中のルーチンがメインかサブか。
  'this_item_type'  => '',# 現在実行中のコマンド、アクション、ping のどれか。
  'this_item_id'    => '',# 現在実行中のコマンド、アクション、ping のID
  'complete_command'   => '',# 最後に実行された置換済みコマンド
  'complete_condition' => '',# 最後に実行された置換済み条件式
  'n'                  => 0,# コマンド結果からの抽出結果の個数
  'NG_log'          => [],
  'NG_message'      => '',
  'tmp_NG_log'      => '',
  'ERROR_message'   => '',
  'status6_flag'    => 0,# jumper6 を通ったかどうか。
  'last_OK_NG'      => 1,
  'flag_make_parameter_sheet' => 0,
  'additional_A_list' => undef,
  'additional_A_info' => undef,
  'additional_B_info' => undef,
  'additional_B_list' => undef,
  'calculation_type' => ''# 追加パラメーターシートの追加方法 .:改行追加 +:加算 -:減算
 );
 
 #
 # login_info のkey 一覧
 #
 ## service
 ## timeout
 ## prompt
 ## user
 ## user_prompt
 ## password
 ## password_prompt
 ## enable_prompt
 ## enable_command
 ## enable_password
 ## terminal_length
 ## terminal_width
 ## configure_terminal
 ## configure_end
 ## exit
 
 #
 # flowchart の要素の構造
 #
 ## $item_type $item_id
 ## $item_type = command|action|sub|jumper
 
 #
 # item の構造
 #
 ## $item_type -> $item_id
 ##
 ### command
 #### owner
 #### comment
 #### wait_time
 #### conft_end
 #### command
 #### command_type
 #### dummy_return
 #### particular_prompt
 #### prompt_checker
 #### store_command
 ### action
 #### owner
 #### comment
 #### begin_word
 #### pipe_type
 #### pipe_word
 #### end_word
 #### pattern
 #### script_id
 #### conditions (2次元配列)
 #### not
 #### operator
 #### count
 #### ng_message
 #### parameter_sheet_A (2次元配列)
 #### parameter_sheet_A (2次元配列)
 #### destroy
 ### ping
 #### owner
 #### comment
 #### target
 #### count
 #### timeout
 #### condition
 
 my %matched_values = (
  'main' => {
             'cols' => [],# $1, $2, $3, ... | #1, #2, #3, ...
             'rows' => [],# $* | #*
             'row_value' => ''# rows の参照値
            },
  'sub'  => {
             'cols' => [],# $1, $2, $3, ...
             'rows' => [],# $*
             'row_value' => ''# rows の参照値
            }
 );
 
 $parameter_list{'matched_values'} = \%matched_values;
 
 my %diff_values = (
  'header_1' => '',
  'header_2' => '',
  'value_1'  => '',
  'value_2'  => ''
 );
 
 $parameter_list{'diff_values'} = \%diff_values;
 
 my %optional_log_values = (
  'optional_log_header' => '',
  'optional_log_value'  => ''
 );
 
 $parameter_list{'optional_log_values'} = \%optional_log_values;
 
 my %terminal_monitor = (
  'command' => '',
  'pattern' => '',
  'errors'  => []
 );
 
 $parameter_list{'terminal_monitor'} = \%terminal_monitor;
 $parameter_list{'check_syslog'}     = 0;
 
 bless(\%parameter_list, $self);
}


#
# セッションID を記録する。
#
sub set_session_id {
 my $self = $_[0];
 my $session_id = $_[1];
 $self -> {'session_id'} = $session_id;
 
 # 初期化
 $self -> {'total_time'}   = 0;
 $self -> {'total_number'} = 0;
 $self -> {'item'}             = undef;
 $self -> {'item_repeat_type'} = undef;
 $self -> {'item_title'}       = undef;
 $self -> {'flowchart'}           = undef;
 $self -> {'routine_repeat_type'} = undef;
 $self -> {'routine_loop_type'}   = undef;
 $self -> {'login_info'}          = undef;
 $self -> {'A_list'} = undef;
 $self -> {'B_list'} = undef;
 $self -> {'A_info'} = undef;
 $self -> {'B_info'} = undef;
 $self -> {'optional_log_values'} -> {'optional_log_header'} = '';
 $self -> {'optional_log_values'} -> {'optional_log_value'}  = '';
 $self -> {'terminal_monitor'} -> {'command'} = '';
 $self -> {'terminal_monitor'} -> {'pattern'} = '';
 splice(@{$self -> {'terminal_monitor'} -> {'errors'}}, 0);
}


#################################
# パラメーターの入出力(ここから)#
#################################

#
# ノードリストを記録する。
#
sub set_A_list {
 my $self = $_[0];
 my $ref_node_list = $_[1];
 my @nodelist = @$ref_node_list;
 $self -> {'A_list'} = \@nodelist;
}

sub set_node {
 my $self = $_[0];
 my $node = $_[1];
 $self -> {'node'} = $node;
}

sub get_node {
 my $self = $_[0];
 my $node = $self -> {'node'};
 return($node);
}


#
# パラメーターシート、ログイン情報をJSON ファイルから読み取る。
#
sub load_parameter {
 my $self = $_[0];
 my $session_id = $self -> {'session_id'};
 
 my $json_login_info = &Telnetman_common::read_session_data($session_id, 'login_info');
 my $json_B_list     = &Telnetman_common::read_session_data($session_id, 'B_list');
 my $json_A_info     = &Telnetman_common::read_session_data($session_id, 'A_info');
 my $json_B_info     = &Telnetman_common::read_session_data($session_id, 'B_info');
 
 $self -> {'login_info'} = &JSON::from_json($json_login_info);
 $self -> {'B_list'}     = &JSON::from_json($json_B_list);
 $self -> {'A_info'}     = &JSON::from_json($json_A_info);
 $self -> {'B_info'}     = &JSON::from_json($json_B_info);
}


#
# 流れ図関連のデータをテキストから取り込む。
#
sub load_flowchart_data {
 my $self = $_[0];
 my $flowchart_type = $_[1];
 my $session_id = $self -> {'session_id'};
 
 $self -> {'item'}                = undef;
 $self -> {'item_repeat_type'}    = undef;
 $self -> {'item_title'}          = undef;
 $self -> {'flowchart'}           = undef;
 $self -> {'routine_repeat_type'} = undef;
 $self -> {'routine_loop_type'}   = undef;
 
 my $json_item                = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_item');
 my $json_item_repeat_type    = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_item_repeat_type');
 my $json_item_title          = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_item_title');
 my $json_flowchart           = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_flowchart');
 my $json_routine_repeat_type = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_routine_repeat_type');
 my $json_routine_loop_type   = &Telnetman_common::read_session_data($session_id, $flowchart_type . '_routine_loop_type');
 
 $self -> {'item'}                = &JSON::from_json($json_item);
 $self -> {'item_repeat_type'}    = &JSON::from_json($json_item_repeat_type);
 $self -> {'item_title'}          = &JSON::from_json($json_item_title);
 $self -> {'flowchart'}           = &JSON::from_json($json_flowchart);
 $self -> {'routine_repeat_type'} = &JSON::from_json($json_routine_repeat_type);
 $self -> {'routine_loop_type'}   = &JSON::from_json($json_routine_loop_type);
}


#
# Diff 設定のデータをテキストから読み取る。
#
sub load_diff_values {
 my $self = $_[0];
 my $session_id = $self -> {'session_id'};
 
 my $json_diff_values = &Telnetman_common::read_session_data($session_id, 'diff_values');
 
 if(length($json_diff_values) > 0){
  my $ref_diff_values = &JSON::from_json($json_diff_values);
  
  if((length($ref_diff_values -> {'diff_value_1'}) > 0) && (length($ref_diff_values -> {'diff_value_2'}) > 0)){
   $self -> {'diff_values'} -> {'header_1'} = $ref_diff_values -> {'diff_header_1'};
   $self -> {'diff_values'} -> {'header_2'} = $ref_diff_values -> {'diff_header_2'};
   $self -> {'diff_values'} -> {'value_1'}  = $ref_diff_values -> {'diff_value_1'};
   $self -> {'diff_values'} -> {'value_2'}  = $ref_diff_values -> {'diff_value_2'};
   
   return(1);
  }
  else{
   return(0);
  }
 }
 else{
  return(0);
 }
}


#
# 任意ログ設定のデータをテキストから読み取る。
#
sub load_optional_log_values {
 my $self = $_[0];
 my $session_id = $self -> {'session_id'};
 
 my $json_optional_log_values = &Telnetman_common::read_session_data($session_id, 'optional_log_values');
 if(length($json_optional_log_values) > 0){
  my $ref_optional_log_values = &JSON::from_json($json_optional_log_values);
  
  if(length($ref_optional_log_values -> {'optional_log_value'}) > 0){
   $self -> {'optional_log_values'} -> {'optional_log_header'} = $ref_optional_log_values -> {'optional_log_header'};
   $self -> {'optional_log_values'} -> {'optional_log_value'}  = $ref_optional_log_values -> {'optional_log_value'};
   
   return(1);
  }
  else{
   return(0); 
  }
 }
 else{
  return(0);
 }
}


#
# SYSLOG 設定をテキストから読み取る。
#
sub load_terminal_monitor {
 my $self = $_[0];
 my $session_id = $self -> {'session_id'};
 
 my $json_terminal_monitor_values = &Telnetman_common::read_session_data($session_id, 'terminal_monitor_values');
 if(length($json_terminal_monitor_values) > 0){
  my $ref_terminal_monitor_values = &JSON::from_json($json_terminal_monitor_values);
  $self -> {'terminal_monitor'} -> {'command'} = $ref_terminal_monitor_values -> {'command'};
  $self -> {'terminal_monitor'} -> {'pattern'} = $ref_terminal_monitor_values -> {'pattern'};
  
  foreach my $terminal_monitor_error (@{$ref_terminal_monitor_values -> {'errors'}}){
   push(@{$self -> {'terminal_monitor'} -> {'errors'}}, $terminal_monitor_error);
  }
 }
 
 if((length($self -> {'terminal_monitor'} -> {'pattern'}) > 0) && (scalar(@{$self -> {'terminal_monitor'} -> {'errors'}}) > 0)){
  $self -> {'check_syslog'} = 1;
 }
}


#
# login info の取得
#
sub get_service {
 my $self = $_[0];
 my $service = $self -> {'login_info'} -> {'service'};
 return($service);
}

sub get_port {
 my $self = $_[0];
 my $port = $self -> {'login_info'} -> {'port'};
 return($port);
}

sub get_timeout {
 my $self = $_[0];
 my $timeout = $self -> {'login_info'} -> {'timeout'};
 return($timeout);
}

sub get_prompt {
 my $self = $_[0];
 my $prompt = $self -> {'login_info'} -> {'prompt'};
 return($prompt);
}

sub get_user_prompt {
 my $self = $_[0];
 my $user_prompt = $self -> {'login_info'} -> {'user_prompt'};
 return($user_prompt);
}

sub get_user {
 my $self = $_[0];
 my $user = $self -> {'login_info'} -> {'user'};
 return($user);
}

sub get_password_prompt {
 my $self = $_[0];
 my $password_prompt = $self -> {'login_info'} -> {'password_prompt'};
 return($password_prompt);
}

sub get_password {
 my $self = $_[0];
 my $password = $self -> {'login_info'} -> {'password'};
 return($password);
}

sub get_enable_command {
 my $self = $_[0];
 my $enable_command = $self -> {'login_info'} -> {'enable_command'};
 return($enable_command);
}

sub get_enable_prompt {
 my $self = $_[0];
 my $enable_prompt = $self -> {'login_info'} -> {'enable_prompt'};
 return($enable_prompt);
}

sub get_enable_password {
 my $self = $_[0];
 my $enable_password = $self -> {'login_info'} -> {'enable_password'};
 return($enable_password);
}

sub get_terminal_length {
 my $self = $_[0];
 my $terminal_length = $self -> {'login_info'} -> {'terminal_length'};
 return($terminal_length);
}

sub get_terminal_width {
 my $self = $_[0];
 my $terminal_width = $self -> {'login_info'} -> {'terminal_width'};
 return($terminal_width);
}

sub get_conft {
 my $self = $_[0];
 my $configure_terminal = $self -> {'login_info'} -> {'configure_terminal'};
 return($configure_terminal);
}

sub get_end {
 my $self = $_[0];
 my $configure_end = $self -> {'login_info'} -> {'configure_end'};
 return($configure_end);
}

sub get_more_string {
 my $self = $_[0];
 my $more_string = $self -> {'login_info'} -> {'more_string'};
 return($more_string);
}

sub get_more_command {
 my $self = $_[0];
 my $more_command = $self -> {'login_info'} -> {'more_command'};
 return($more_command);
}

sub get_exit {
 my $self = $_[0];
 my $exit = $self -> {'login_info'} -> {'exit'};
 return($exit);
}



#
# 今実行中のcommand, action, ping の種類とIDを記録する。
#
sub set_item_type_id {
 my $self = $_[0];
 my $item_type_id = $_[1];
 my ($item_type, $item_id) = split(/\s/, $item_type_id);
 
 $self -> {'this_item_type'} = $item_type;
 $self -> {'this_item_id'}   = $item_id;
}

sub clear_item_type_id {
 my $self = $_[0];
 $self -> {'this_item_type'} = '';
 $self -> {'this_item_id'}   = ''
}



#
# 今実行中のcommand, action, ping の種類とIDを返す。
#
sub get_item_type_id {
 my $self = $_[0];
 
 my $item_type = $self -> {'this_item_type'};
 my $item_id   = $self -> {'this_item_id'};
 
 return($item_type, $item_id);
}


#
# 今実行中のcommand, action, ping のタイトルを取得。 
#
sub get_title {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $title = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $title = $self -> {'item_title'} -> {$item_type} -> {$item_id};
 }
 
 return($title);
}


#
# 今実行中のcommand, action, ping の繰り返し型を取得。 
#
sub get_repeat_type {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $repeat_type = 1;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $repeat_type = $self -> {'item_repeat_type'} -> {$item_type} -> {$item_id};
 }
  
 return($repeat_type);
}


#
# 今実行中のcommand, action, ping のコメントを取得。 
#
sub get_comment {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $comment = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $comment = $self -> {'item'} -> {$item_type} -> {$item_id} -> {'comment'};
 }

 return($comment);
}


#
# コマンド要素の各種取得。
#
sub get_wait_time {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $wait_time = 0;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $wait_time = $self -> {'item'} -> {'command'} -> {$item_id} -> {'wait_time'};
 }
 
 return($wait_time);
}

sub get_conft_end {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $conft_end = 0;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $conft_end = $self -> {'item'} -> {'command'} -> {$item_id} -> {'conft_end'};
 }
 
 # 1 : conf t, end を実行する。
 # 0 : しない。
 return($conft_end);
}

sub get_command {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $command = '_BLANK_';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $command = $self -> {'item'} -> {'command'} -> {$item_id} -> {'command'};
 }
 
 return($command);
}

sub get_command_type {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $command_type = 1;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $command_type = $self -> {'item'} -> {'command'} -> {$item_id} -> {'command_type'};
 }
 
 # 1 : show
 # 2 : conf t
 # 3 : 返り値なし
 return($command_type);
}

sub get_dummy_return {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $dummy_return = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $dummy_return = $self -> {'item'} -> {'command'} -> {$item_id} -> {'dummy_return'};
 }
 
 return($dummy_return);
}

sub get_particular_prompt {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $particular_prompt = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $particular_prompt = $self -> {'item'} -> {'command'} -> {$item_id} -> {'particular_prompt'};
 }
 
 if(length($particular_prompt) > 0){
  return($particular_prompt);
 }
 else{
  my $prompt = $self -> get_prompt;
  return($prompt);
 }
}

sub get_prompt_checker {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $prompt_checker = 1;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $prompt_checker = $self -> {'item'} -> {'command'} -> {$item_id} -> {'prompt_checker'};
 }
 
 # 1 : プロンプト確認が通常型
 # 2 : JUNOS型
 # 0 : プロンプト確認しない
 return($prompt_checker);
}

sub get_store_command {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $store_command = 0;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $store_command = $self -> {'item'} -> {'command'} -> {$item_id} -> {'store_command'};
 }
 
 # 1 : コマンド返り値を溜める
 # 0 : 溜めない
 return($store_command);
}


#
# アクション要素の各種取得。
#
sub get_pipe_type {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $pipe_type = 1;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $pipe_type = $self -> {'item'} -> {'action'} -> {$item_id} -> {'pipe_type'};
 }
 
 # 1 : include
 # 2 : exclude
 # 3 : begin
 return($pipe_type);
}

sub get_pipe_word {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $pipe_word = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $pipe_word = $self -> {'item'} -> {'action'} -> {$item_id} -> {'pipe_word'};
 }
 
 return($pipe_word);
}

sub get_begin_word {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $begin_word = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $begin_word = $self -> {'item'} -> {'action'} -> {$item_id} -> {'begin_word'};
 }
 
 return($begin_word);
}

sub get_end_word {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $end_word = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $end_word = $self -> {'item'} -> {'action'} -> {$item_id} -> {'end_word'};
 }
 
 return($end_word);
}

sub get_pattern {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $pattern = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $pattern = $self -> {'item'} -> {'action'} -> {$item_id} -> {'pattern'};
 }
 
 return($pattern);
}

sub get_script_id {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $script_id = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $script_id = $self -> {'item'} -> {'action'} -> {$item_id} -> {'script_id'};
 }
 
 return($script_id);
}

sub get_conditions {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $ref_conditions = undef;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $ref_conditions = $self -> {'item'} -> {'action'} -> {$item_id} -> {'conditions'};
 }
 else{
  $ref_conditions = [['']];
 }
 
 return($ref_conditions);
}

sub get_not {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $not = 0;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $not = $self -> {'item'} -> {'action'} -> {$item_id} -> {'not'};
 }
 
 # 1 : 分岐条件結果を反転する。
 # 0 : しない
 return($not);
}

sub get_operator {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $operator = 3;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $operator = $self -> {'item'} -> {'action'} -> {$item_id} -> {'operator'};
 }
 
 # 1 : ==
 # 2 : !=
 # 3 : >
 # 4 : >=
 # 5 : <
 # 6 : <=
 return($operator);
}

sub get_count {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $count = 0;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $count = $self -> {'item'} -> {'action'} -> {$item_id} -> {'count'};
 }
 
 return($count);
}

sub get_ng_message {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $ng_message = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $ng_message = $self -> {'item'} -> {$item_type} -> {$item_id} -> {'ng_message'};
 }
 
 return($ng_message);
}

sub get_parameter_sheet_A {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $ref_parameter_sheet_A = undef;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $ref_parameter_sheet_A = $self -> {'item'} -> {'action'} -> {$item_id} -> {'parameter_sheet_A'};
 }
 else{
  $ref_parameter_sheet_A = [['','','']];
 }
 
 return($ref_parameter_sheet_A);
}

sub get_parameter_sheet_B {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $ref_parameter_sheet_B = undef;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $ref_parameter_sheet_B = $self -> {'item'} -> {'action'} -> {$item_id} -> {'parameter_sheet_B'};
 }
 else{
  $ref_parameter_sheet_B = [['','','','']];
 }
 
 return($ref_parameter_sheet_B);
}

sub get_destroy {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $destroy = 1;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $destroy = $self -> {'item'} -> {'action'} -> {$item_id} -> {'destroy'};
 }
 
 # 1 : コマンド返り値を破棄する
 # 0 : 破棄しない。
 return($destroy);
}

sub get_ping_target {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $target = '';
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $target = $self -> {'item'} -> {'ping'} -> {$item_id} -> {'target'};
 }
 
 return($target);
}

sub get_ping_count {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $count = 5;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $count = $self -> {'item'} -> {'ping'} -> {$item_id} -> {'count'};
 }
 
 return($count);
}

sub get_ping_timeout {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $timeout = 2;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $timeout = $self -> {'item'} -> {'ping'} -> {$item_id} -> {'timeout'};
 }
 
 return($timeout);
}

sub get_ping_condition {
 my $self = $_[0];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 my $condition = 1;
 
 if(defined($item_type) && (length($item_type) > 0) && defined($item_id) && (length($item_id) > 0)){
  $condition = $self -> {'item'} -> {'ping'} -> {$item_id} -> {'condition'};
 }
 
 # 1 : 全成功
 # 2 : 一部or全成功
 # 3 : 全失敗
 # 4 : 一部or全失敗
 return($condition);
}

#################################
# パラメーターの入出力(ここまで)#
#################################


#
# telnet 開始
#
sub start_telnet {
 my $self = $_[0];
 my $time = time;
 my $ok_error = 1;
 
 if(scalar(@{$self -> {'A_list'}}) == 0){
  return(0, $time);
 }
 
 # 初期化
 $self -> clear_item_type_id;
 $self -> {'telnet'} = undef;
 $self -> {'ssh'}    = undef;
 $self -> {'eof_flag'} = 0;
 $self -> {'flag_space_20'} = 1;
 $self -> {'start_time'} = $time;
 $self -> {'matched_prompt'} = '';
 $self -> {'command_return'} = '';
 $self -> {'LOG'} = '';
 splice(@{$self -> {'TRACK'}}, 0);
 $self -> {'this_routine_index'} = 0;
 $self -> {'complete_command'} = '';
 $self -> {'complete_condition'} = '';
 splice(@{$self -> {'NG_log'}}, 0);
 $self -> {'NG_message'} = '';
 $self -> {'tmp_NG_log'} = '';
 $self -> {'ERROR_message'} = '';
 $self -> {'status6_flag'} = 0;
 $self -> {'last_OK_NG'} = 1;
 $self -> {'flag_make_parameter_sheet'} = 0;
 $self -> {'additional_A_list'} = [];
 $self -> {'additional_A_info'} = {};
 $self -> {'additional_B_info'} = {};
 $self -> {'additional_B_list'} = {};
 $self -> {'calculation_type'} = '';
 $self -> {'diff_values'} -> {'header_1'} = '';
 $self -> {'diff_values'} -> {'header_2'} = '';
 $self -> {'diff_values'} -> {'value_1'}  = '';
 $self -> {'diff_values'} -> {'value_2'}  = '';
 
 my $node = shift(@{$self -> {'A_list'}});
 $self -> set_node($node); 
                       
 my $service          = $self -> get_service;
 my $port             = $self -> get_port;
 my $timeout          = $self -> get_timeout;
 my $prompt           = $self -> get_prompt;
 my $user_prompt      = $self -> get_user_prompt;
 my $user             = $self -> get_user;
 my $password_prompt  = $self -> get_password_prompt;
 my $password         = $self -> get_password;
 my $enable_command   = $self -> get_enable_command;
 my $enable_prompt    = $self -> get_enable_prompt;
 my $enable_password  = $self -> get_enable_password;
 my $terminal_length  = $self -> get_terminal_length;
 my $terminal_width   = $self -> get_terminal_width;
 my $terminal_monitor = $self -> {'terminal_monitor'} -> {'command'};
 
 unless(defined($service) && (length($service) > 0)){
  $service = 'telnet';
 }
 
 unless(defined($port) && (length($port) > 0)){
  if($service eq 'telnet'){
   $port = 23;
  }
  else{
   $port = 22;
  }
 }
 
 unless(defined($user_prompt) && (length($user_prompt) > 0)){
  $user_prompt = $prompt;
 }
 
 unless(defined($password_prompt) && (length($password_prompt) > 0)){
  $password_prompt = $prompt;
 }
 
 unless(defined($enable_prompt) && (length($enable_prompt) > 0)){
  $enable_prompt = $prompt;
 }
 
 my $command_return  = '';
 my $matched_prompt  = '';
 
 # SSH の場合、この2つを同階層で定義しないとSSH のファイルハンドルが行方不明になるようだ。
 my $telnet = Net::Telnet -> new (Timeout => $timeout);
 my $ssh    = undef;
 
 if($service eq 'ssh-password'){
  $ssh = Net::OpenSSH -> new($node, ('user' => $user, 'password' => $password, 'port' => $port, 'timeout' => $timeout, 'master_opts' => ['-o' => 'StrictHostKeyChecking=no', '-o' => 'UserKnownHostsFile=/dev/null', '-o' => 'LogLevel=QUIET']));
  my ($pty, $pid) = $ssh -> open2pty({'stderr_to_stdout' => 1});
  
  if(defined($pid)){
   $telnet -> fhopen($pty);
  }
  else{
   $self -> update_counter;
   $self -> write_error_message('ログインできませんでした。');
   
   return(-1, $time);
  }
 }
 else{
  $telnet -> port($port);
 }
 
 # $ssh は直接は使わないが、このオブジェクト内で定義しておかないとファイルハンドルが行方不明になるようだ。 
 $self -> {'telnet'} = $telnet;
 $self -> {'ssh'}    = $ssh;
 
 $telnet -> max_buffer_length(10 * 1048576);
 eval{
  if($service eq 'telnet'){
   $telnet -> open($node);
   
   ($command_return, $matched_prompt) = $telnet -> waitfor(Match => '/' . $user_prompt . '/', Errmode => 'return', Timeout => 5);
   
   # コンソールログインの場合、Escape character is '^]'. の表示のまま止まるのでEnter を実行。
   unless(defined($matched_prompt)){
    $telnet -> print('');
    ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $user_prompt . '/');
   }
   
   $ok_error = $self -> add_command_return('', $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
   
   $telnet -> print($user);
   ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $password_prompt . '/');
   $ok_error = $self -> add_command_return($user, $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
   
   $telnet -> print($password);
  }
   
=pod
  # local 認証でパスワードを再度聞かれた場合の対処。
  sleep(1);
  $command_return = '';
  $matched_prompt = '';
  
  for(my $i = 0; $i < $timeout; $i ++){
   my ($tmp1_command_return, $tmp1_matched_prompt) = $telnet -> waitfor(Match => '/.+$/', Errmode => 'return', Timeout => 1);
                                 
   if(defined($tmp1_matched_prompt)){
    my ($tmp2_command_return, $tmp2_matched_prompt) = $telnet -> waitfor(Match => '/.+$/', Errmode => 'return', Timeout => 0);
    
    unless(defined($tmp2_matched_prompt)){
     if(($tmp1_matched_prompt =~ /$prompt/) || ($tmp1_matched_prompt =~ /$password_prompt/)){
      $command_return .= $tmp1_command_return;
      $matched_prompt  = $tmp1_matched_prompt; 
      
      last;
     }
    }
    else{
     $command_return .= $tmp1_command_return . $tmp1_matched_prompt . $tmp2_command_return;
     $matched_prompt  = $tmp2_matched_prompt;
    }
   }
  }
  
  my $login_success = 1;
  if((length($command_return) > 0) && (length($matched_prompt) > 0)){
   $ok_error = $self -> add_command_return($password, $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
   
   if($matched_prompt =~ /$password_prompt/){
    $telnet -> print($password);
    ($command_return, $matched_prompt) = $telnet -> waitfor('/.+$/');
    $ok_error = $self -> add_command_return($password, $command_return, $matched_prompt);
    
    if($ok_error == -1){
     return(-1, time);
    }
   }
   
   if($matched_prompt =~ /$prompt/){
    $login_success = 1;
   }
   else{
    $login_success = 0;
   }
  }
  else{
   $login_success = 0;
  }
  
  if($login_success == 0){
   $self -> update_counter;
   $self -> write_error_message('ログインできませんでした。');
   
   return(-1, $time);
  }
=cut
  
  if(defined($enable_command) && (length($enable_command) > 0)){
   $telnet -> print($enable_command);
   
   if(defined($enable_password) && (length($enable_password) > 0)){
    ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $enable_prompt . '/');
    $ok_error = $self -> add_command_return($enable_command, $command_return, $matched_prompt);
    
    if($ok_error == -1){
     return(-1, time);
    }
   
    $telnet -> print($enable_password);
   }
   
   ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $prompt . '/');
   $ok_error = $self -> add_command_return($enable_password, $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
  }
  
  if(defined($terminal_length) && (length($terminal_length) > 0)){
   $telnet -> print($terminal_length);
   ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $prompt . '/');
   $ok_error = $self -> add_command_return($terminal_length, $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
  }
  
  if(defined($terminal_width) && (length($terminal_width) > 0)){
   $telnet -> print($terminal_width);
   ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $prompt . '/');
   $ok_error = $self -> add_command_return($terminal_width, $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
  }
  
  if(defined($terminal_monitor) && (length($terminal_monitor) > 0)){
   $telnet -> print($terminal_monitor);
   ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $prompt . '/');
   $ok_error = $self -> add_command_return($terminal_monitor, $command_return, $matched_prompt);
   
   if($ok_error == -1){
    return(-1, time);
   }
  }
 
  # 空白20個Enter のプロンプト確認が通用する機器か確認する。
  $telnet -> print('                    ');
  ($command_return, $matched_prompt) = $telnet -> waitfor('/' . $prompt . '/');
 };
 
 $command_return =~ s/\r//g;
 unless($command_return =~ /^ {20}$/){
  $self -> {'flag_space_20'} = 0;
 }

 
 $self -> {'complete_command'} = '';
 
 if(length($@) == 0){
  return(1, $time);
 }
 else{
  $self -> update_counter;
  $self -> write_error_message($@);
  $@ = '';
  
  return(-1, $time);
 }
}


#
# telnet 終了
#
sub end_telnet {
 my $self = $_[0];
 my $telnet = $self -> {'telnet'};
 my $eof = $self -> {'eof_flag'};
 my $exit = $self -> get_exit;
 
 if(($eof == 0) && defined($exit) && (length($exit) > 0)){
  $telnet -> print($exit);
  $self -> {'LOG'} .= $exit;
 }
 
 $telnet -> close;
 $self -> {'telnet'} = undef;
}


#
# 流れ図を実行する。
#
sub exec_flowchart {
 my $self = $_[0];
 my $inc_i = 1;
 my $inc_j = 0;
 
 # 取得値を初期化する。
 $self -> crear_NG_message;
 $self -> {'B'} = '';
 $self -> {'n'} = '';
 $self -> {'complete_command'} = '';
 $self -> {'command_return'} = '';
 $self -> {'complete_condition'} = '';
 splice(@{$self -> {'matched_values'} -> {'main'} -> {'cols'}}, 0);
 splice(@{$self -> {'matched_values'} -> {'main'} -> {'rows'}}, 0);
 $self -> {'matched_values'} -> {'main'} -> {'row_value'} = '';
 splice(@{$self -> {'matched_values'} -> {'sub'} -> {'cols'}}, 0);
 splice(@{$self -> {'matched_values'} -> {'sub'} -> {'rows'}}, 0);
 $self -> {'matched_values'} -> {'sub'} -> {'row_value'} = '';
 
 my $mainroutine_repeat_type = $self -> {'routine_repeat_type'} -> {'0'};
 my $mainroutine_loop_type   = $self -> {'routine_loop_type'}   -> {'0'};
 
 if($mainroutine_repeat_type == 1){
  ($inc_i, $inc_j) = $self -> exec_mainroutine;
 }
 elsif($mainroutine_repeat_type == 2){
  my $round = 0;
  my $continue = 1;
  
  if($mainroutine_loop_type == 1){
   $continue = $self -> pop_B($round);
  }
  else{
   $continue = $self -> shift_B($round);
  }
  
  while($continue == 1){
   ($inc_i, $inc_j) = $self -> exec_mainroutine;
   
   if($self -> {'last_OK_NG'} == 0){
    last;
   }
   elsif(($inc_i == 0) && ($inc_j == 0)){
    last;
   }
   elsif(($inc_i < 0) || ($inc_j < 0)){
    last;
   }
   
   $round ++;
   
   if($mainroutine_loop_type == 1){
    $continue = $self -> pop_B($round);
   }
   else{
    $continue = $self -> shift_B($round);
   }
  }
 }
 
 $self -> update_counter;
 
 return($self -> {'last_OK_NG'});
}



#
# メインルーチンを実行する。
#
sub exec_mainroutine {
 my $self = $_[0];
 
 my $i = 0;
 my $j = 0;
 my $inc_i = 1;
 my $inc_j = 0;
 my $item_type_id = $self -> {'flowchart'} -> {'0'} -> [$i] -> [$j];
 
 MAINROUTINE : while(defined($item_type_id) && (length($item_type_id) > 0)){
  $self -> push_track_log($i, $j);
  $self -> set_item_type_id($item_type_id);
  my ($item_type, $item_id) = $self -> get_item_type_id;
  
  if($item_type eq 'jumper'){
   ($inc_i, $inc_j) = $self -> jump($inc_i, $inc_j);
  }
  elsif($item_type eq 'action'){
   ($inc_i, $inc_j) = $self -> exec_action;
  }
  elsif($item_type eq 'command'){
   ($inc_i, $inc_j) = $self -> exec_command;
  }
  elsif($item_type eq 'ping'){
   ($inc_i, $inc_j) = $self -> exec_ping;
  }
  elsif($item_type eq 'sub'){
   my $subroutine_index = $item_id; 
   my $subroutine_repeat_type = $self -> {'routine_repeat_type'} -> {$subroutine_index};
   my $subroutine_loop_type   = $self -> {'routine_loop_type'}   -> {$subroutine_index};
   
   $self -> set_routine_index($subroutine_index);
   
   if($subroutine_repeat_type == 1){
    ($inc_i, $inc_j) = $self -> exec_subroutine;
    
    if($self -> {'last_OK_NG'} == 0){
     last MAINROUTINE;
    }
    elsif(($inc_i == 0) && ($inc_j == 0)){
     last MAINROUTINE;
    }
    elsif(($inc_i < 0) || ($inc_j < 0)){
     last MAINROUTINE;
    }
   }
   elsif($subroutine_repeat_type == 2){ 
    my $round = 0;
    my $continue = 1;
    
    if($subroutine_loop_type == 1){
     $continue = $self -> pop_value($round, 'main');
    }
    else{
     $continue = $self -> shift_value($round, 'main');
    }
    
    while($continue == 1){
     ($inc_i, $inc_j) = $self -> exec_subroutine;
     
     if($self -> {'last_OK_NG'} == 0){
      last MAINROUTINE;
     }
     elsif(($inc_i == 0) && ($inc_j == 0)){
      last MAINROUTINE;
     }
     elsif(($inc_i < 0) || ($inc_j < 0)){
      last MAINROUTINE;
     }
     
     $round ++;
     
     if($subroutine_loop_type == 1){
      $continue = $self -> pop_value($round, 'main');
     }
     else{
      $continue = $self -> shift_value($round, 'main');
     }
    }
   }
   
   $self -> set_routine_index(0);
   $inc_i = 1;
   $inc_j = 0;
  }
  
  if(($inc_i == 0) && ($inc_j == 0)){
   last MAINROUTINE;
  }
  elsif(($inc_i < 0) || ($inc_j < 0)){
   last MAINROUTINE;
  }
  
  $i += $inc_i;
  $j += $inc_j;
  
  $item_type_id = $self -> {'flowchart'} -> {'0'} -> [$i] -> [$j];
 }
 
 $self -> clear_item_type_id;
 
 return($inc_i, $inc_j);
}



#
# サブルーチンを実行する。
#
sub exec_subroutine {
 my $self = $_[0];
 my $subroutine_index = $self -> get_routine_index;
 
 my $i = 0;
 my $j = 0;
 my $inc_i = 1;
 my $inc_j = 0;
 my $item_type_id = $self -> {'flowchart'} -> {$subroutine_index} -> [$i] -> [$j];
 
 while(defined($item_type_id) && (length($item_type_id) > 0)){
  $self -> push_track_log($i, $j);
  $self -> set_item_type_id($item_type_id);
  my ($item_type, $item_id) = $self -> get_item_type_id;
  
  if($item_type eq 'jumper'){
   ($inc_i, $inc_j) = $self -> jump($inc_i, $inc_j);
  }
  elsif($item_type eq 'action'){
   ($inc_i, $inc_j) = $self -> exec_action;
  }
  elsif($item_type eq 'command'){
   ($inc_i, $inc_j) = $self -> exec_command;
  }
  elsif($item_type eq 'ping'){
   ($inc_i, $inc_j) = $self -> exec_ping;
  }
  
  if(($inc_i == 0) && ($inc_j == 0)){
   last;
  }
  elsif(($inc_i < 0) || ($inc_j < 0)){
   last;
  }
  
  $i += $inc_i;
  $j += $inc_j;
  
  $item_type_id = $self -> {'flowchart'} -> {$subroutine_index} -> [$i] -> [$j];
 }
 
 return($inc_i, $inc_j);
}



#
# メインルーチンが繰り返し型の場合の対象B値を定義する。
#
sub shift_B {
 my $self = $_[0];
 my $round = $_[1];
 my $node = $self -> get_node;
 
 my $B = '';
 
 if(defined($self -> {'B_list'} -> {$node} -> [$round])){
  $B = $self -> {'B_list'} -> {$node} -> [$round];
 }
 else{
  return(0);
 }
 
 $self -> {'B'} = $B;
 
 return(1);
}



#
# メインルーチンが繰り返し型で逆順の場合の対象B値を定義する。
#
sub pop_B {
 my $self = $_[0];
 my $round = $_[1];
 my $node = $self -> get_node;
 
 my $B = '';
 my $B_list_length = scalar(@{$self -> {'B_list'} -> {$node}});
 my $i = $B_list_length - 1 - $round;
 
 if($i < 0){
  return(0);
 }
 
 if(defined($self -> {'B_list'} -> {$node} -> [$i])){
  $B = $self -> {'B_list'} -> {$node} -> [$i];
 }
 else{
  return(0);
 }
 
 $self -> {'B'} = $B;
 
 return(1);
}


#
# $1, $2, $3, ... #1, #2, #3, ... $* #* の初期化と値の代入と取り出し。
#
sub initialize_matched_values {
 my $self = $_[0];
 
 my $main_sub = $self -> check_routine_type;
 my $col_row  = $self -> check_row_col;

 splice(@{$self -> {'matched_values'} -> {$main_sub} -> {$col_row}}, 0);
 
 if($col_row eq 'rows'){
  $self -> {'matched_values'} -> {$main_sub} -> {'row_value'} = '';
 } 
}

sub push_matched_values {
 my $self  = $_[0];
 my $value = $_[1];

 my $main_sub = $self -> check_routine_type;
 my $col_row  = $self -> check_row_col;

 if(defined($value)){
  push(@{$self -> {'matched_values'} -> {$main_sub} -> {$col_row}}, $value);
 }
}

sub get_value_list {
 my $self = $_[0];
 
 my $main_sub = $self -> check_routine_type;
 my $col_row  = $self -> check_row_col;
 
 my @value_list = @{$self -> {'matched_values'} -> {$main_sub} -> {$col_row}};
 
 return(@value_list);
}


#
# $*, #* の値の参照操作。
#
sub shift_value {
 my $self     = $_[0];
 my $round    = $_[1];
 my $main_sub = $_[2];
 
 unless(defined($main_sub) && (length($main_sub) > 0)){
  $main_sub = $self -> check_routine_type;
 }
 
 my $value = '';
 
 if(defined($self -> {'matched_values'} -> {$main_sub} -> {'rows'} -> [$round])){
  $value = $self -> {'matched_values'} -> {$main_sub} -> {'rows'} -> [$round];
 }
 else{
  return(0);
 }
 
 $self -> {'matched_values'} -> {$main_sub} -> {'row_value'} = $value;
 
 return(1);
}

sub pop_value {
 my $self     = $_[0];
 my $round    = $_[1];
 my $main_sub = $_[2];
 
 unless(defined($main_sub) && (length($main_sub) > 0)){
  $main_sub = $self -> check_routine_type;
 }
 
 my $value = '';
 my $rows_length = scalar(@{$self -> {'matched_values'} -> {$main_sub} -> {'rows'}});
 my $i = $rows_length - 1 - $round;
 
 if($i < 0){
  return(0);
 }
 
 if(defined($self -> {'matched_values'} -> {$main_sub} -> {'rows'} -> [$i])){
  $value = $self -> {'matched_values'} -> {$main_sub} -> {'rows'} -> [$i];
 }
 else{
  return(0);
 }
 
 $self -> {'matched_values'} -> {$main_sub} -> {'row_value'} = $value;
 
 return(1);
}

sub get_row_value {
 my $self     = $_[0];
 my $main_sub = $_[1];
 
 unless(defined($main_sub) && (length($main_sub) > 0)){
  $main_sub = $self -> check_routine_type;
 }
 
 my $value = $self -> {'matched_values'} -> {$main_sub} -> {'row_value'};
 
 return($value);
}


#
# $1, $2, $3, ... #1, #2, #3, ... の参照。
#
sub get_col_value {
 my $self     = $_[0];
 my $i        = $_[1];
 my $main_sub = $_[2];
 
 unless(defined($main_sub) && (length($main_sub) > 0)){
  $main_sub = $self -> check_routine_type;
 }
 
 my $value = $self -> {'matched_values'} -> {$main_sub} -> {'cols'} -> [$i];

 return($value);
}



#
# jumper
#
sub jump {
 my $self = $_[0];
 my $inc_i = $_[1];
 my $inc_j = $_[2];
 my ($item_type, $item_id) = $self -> get_item_type_id;
 
 if(($inc_i == 1) && ($item_id eq '1')){
  $inc_i = 1;
  $inc_j = 0;
 }
 elsif(($inc_j == 1) && ($item_id eq '2')){
  $inc_i = 0;
  $inc_j = 1;
 }
 elsif(($inc_i == 1) && ($item_id eq '3')){
  $inc_i = 0;
  $inc_j = 1;
 }
 elsif(($inc_j == 1) && ($item_id eq '4')){
  $inc_i = 1;
  $inc_j = 0;
 }
 elsif(($inc_j == 1) && ($item_id eq '5')){
  $inc_i = 1;
  $inc_j = 0;
  $self -> {'last_OK_NG'} = 1;
 }
 elsif(($inc_j == 1) && ($item_id eq '6')){
  $inc_i = 1;
  $inc_j = 0;
  
  if($self -> {'last_OK_NG'} == 0){
   $self -> {'last_OK_NG'} = 1;
   $self -> {'status6_flag'} = 1;
   
   my $NG_log = $self -> {'tmp_NG_log'};
   
   if(length($NG_log) > 0){
    push(@{$self -> {'NG_log'}}, $NG_log);
    $self -> {'tmp_NG_log'} = '';
   }
  }
 }
 else{
  $inc_i = -1;
  $inc_j = -1;
 }
 
 return($inc_i, $inc_j);
}



#
# ログにコメントを入れる。
#
sub add_comment {
 my $self = $_[0];
 
 my $repeat_type      = $self -> get_repeat_type;
 my $comment          = $self -> get_comment;
 my $complete_comment = '';
 
 if($repeat_type == 1){
  $complete_comment = $self -> insert_skeleton_values($comment);
 }
 elsif($repeat_type == 2){
  $complete_comment = $self -> make_complete_string_type_2($comment);
 }
 
 unless(defined($complete_comment)){
  return(-1);
 }

 if(length($complete_comment) > 0){
  my $framed_comment= &Common_sub::add_frame($complete_comment);
  $self -> add_log($framed_comment);
  
  return(1);
 }
 else{
  return(0);
 }
}



#
# コマンドを実行する。
#
sub exec_command {
 my $self = $_[0];
 
 $self -> crear_NG_message;
 
 my $comment_ok_error = $self -> add_comment;
 if($comment_ok_error == -1){
  return(-1, -1);
 }
 
 my $repeat_type        = $self -> get_repeat_type;
 my $wait_time          = $self -> get_wait_time;
 my $conft_end          = $self -> get_conft_end;
 my $configure_terminal = $self -> get_conft;
 my $configure_end      = $self -> get_end;
 
 if($wait_time > 0){
  sleep($wait_time);
 }
 
 # conf t
 if(($conft_end == 1) && defined($configure_terminal) && (length($configure_terminal) > 0)){
  my ($command_return, $matched_prompt) = $self -> command_none($configure_terminal);
  
  if(defined($command_return) && defined($matched_prompt)){
   $self -> {'dummy'} = 0;
   my $ok_error = $self -> add_command_return($configure_terminal, $command_return, $matched_prompt);
    
   if($ok_error == -1){
    return(-1, -1);
   }
  }
  else{
   return(-1, -1);
  }
 }
 
 my $command_result = 1;
 if($repeat_type == 1){
  $command_result = $self -> once_command;
 }
 elsif($repeat_type == 2){
  $command_result = $self -> repeat_command;
 }
 
 if($command_result == -1){
  return(-1, -1);
 }
 elsif($command_result == 0){
  return(0, 0);
 }
 
 # end
 if(($conft_end == 1) && defined($configure_end) && (length($configure_end) > 0)){
  my ($command_return, $matched_prompt) = $self -> command_none($configure_end);
  
  if(defined($command_return) && defined($matched_prompt)){
   $self -> {'dummy'} = 0;
   my $ok_error = $self -> add_command_return($configure_end, $command_return, $matched_prompt);
    
   if($ok_error == -1){
    return(-1, -1);
   }
  }
  else{
   return(-1, -1);
  }
 }
 
 return(1, 0);
}

#
# コマンドを1回だけ実行する。
#
sub once_command {
 my $self = $_[0];
 
 my $prompt_checker = $self -> get_prompt_checker;
 
 my $ref_complete_command_list = $self -> get_complete_command_list;
 
 unless(defined($ref_complete_command_list)){
  return(-1);
 }
 
 if(scalar(@$ref_complete_command_list) > 0){
  foreach my $complete_command (@$ref_complete_command_list){
   my $command_return = '';
   my $matched_prompt = '';
   
   if($prompt_checker == 1){
    ($command_return, $matched_prompt) = $self -> command_cisco($complete_command);
   }
   elsif($prompt_checker == 2){
    ($command_return, $matched_prompt) = $self -> command_junos($complete_command);
   }
   else{
    ($command_return, $matched_prompt) = $self -> command_none($complete_command);
   }
   
   if(defined($command_return) && defined($matched_prompt)){
    my $ok_error = $self -> add_command_return($complete_command, $command_return, $matched_prompt);
    
    if($ok_error == -1){
     return(-1);
    }
   }
   else{
    return(-1);
   }
   
   if($self -> {'eof_flag'} == 1){
    return(0);
   }
  }
 }
 
 return(1);
}

#
# [繰り返し型]コマンドを実行する。
#
sub repeat_command {
 my $self = $_[0];
 
 my $round = 0;
 my $continue = $self -> shift_value($round);
 
 while($continue == 1){
  my $command_result= $self -> once_command;
  
  if($command_result == -1){
   return(-1);
  }
  elsif($command_result == 0){
   return(0);
  }
 
  $round ++;
  $continue = $self -> shift_value($round);
 }
 
 return(1);
}



#
# コマンド1つを実行。プロンプト確認:通常型
#
sub command_cisco {
 my $self = $_[0];
 my $complete_command = $_[1];
 my $command_return = '';
 my $matched_prompt = '';
 
 my $telnet = $self -> {'telnet'};
 my $prompt = $self -> get_particular_prompt;
 
 my $flag_match = 0;
 my $count_space_20 = 0;
 
 my $flag_space_20 = $self -> {'flag_space_20'};
 
 eval{
  if($flag_space_20 == 1){
   $telnet -> print($complete_command);
   
   while($count_space_20 < 10){
    my ($tmp1_command_return, $tmp1_matched_prompt) = $telnet -> waitfor('/.+$/');
    $tmp1_command_return =~ s/\r//g;
    $tmp1_matched_prompt =~ s/\r//g;
       
    # --More-- 処理のあとのBackSpace の除去。
    $tmp1_command_return =~ s/\x08//g;
    $tmp1_matched_prompt =~ s/\x08//g;
    
    if($tmp1_matched_prompt =~ /$prompt/){
     my ($tmp2_command_return, $tmp2_matched_prompt) = $telnet -> waitfor(Match => '/.+$/', Errmode => 'return', Timeout => 0);
     
     unless(defined($tmp2_matched_prompt)){
      $count_space_20 ++;
      $telnet -> print('                    ');
      ($tmp2_command_return, $tmp2_matched_prompt) = $telnet -> waitfor(Match => '/' . $prompt . '/', Errmode => 'return', Timeout => 1);
      
      unless(defined($tmp2_matched_prompt)){
       $command_return .= $tmp1_command_return . $tmp1_matched_prompt;
       next;
      }
     }
     
     $tmp2_command_return =~ s/\r//g;
     $tmp2_matched_prompt =~ s/\r//g;
     
     my $copy_tmp2_command_return = $tmp2_command_return;
     $copy_tmp2_command_return =~ s/ {20}\n//;
     my $length_copy_tmp2_command_return = length($copy_tmp2_command_return);
     
     if(($length_copy_tmp2_command_return == 0) && ($tmp2_matched_prompt eq $tmp1_matched_prompt)){
      $flag_match = 1;
      $command_return .= $tmp1_command_return . $tmp1_matched_prompt . $tmp2_command_return;
      $matched_prompt  = $tmp2_matched_prompt;
      last;
     }
     else{
      $command_return .= $tmp1_command_return . $tmp1_matched_prompt . $tmp2_command_return . $tmp2_matched_prompt;
      $count_space_20 ++;
      $telnet -> print('                    ');
      sleep(1);
     }
    }
    else{
     $command_return .= $tmp1_command_return . $tmp1_matched_prompt;
    }
    
    # --More-- 対策
    $command_return = $self -> do_more($command_return);
   }
  }
 };
 
 if($flag_space_20 == 0){
  $self -> write_error_message('プロンプト多重確認:通常型 が使えない機器のようです。');
  return(undef, undef);
 }
 
 my $prompt_ok_error = $self -> check_prompt($flag_match);
  
 # 余計なプロンプトとスペース20個を除去。
 if($prompt_ok_error == 1){
  if($count_space_20 > 0){
   my $tmp_count_space_20 = $count_space_20;
   my $length_matched_prompt = length($matched_prompt);
   
   while(1){
    my $length_command_return = length($command_return);
    my $pos = rindex($command_return, $matched_prompt);
    
    if($pos == -1){
     last;
    }
    elsif($pos >= $length_command_return - $length_matched_prompt - 21 - 1){
     substr($command_return, $pos) = '';
     $tmp_count_space_20 --;
    }
    else{
     last;
    }
    
    if($tmp_count_space_20 == 0){
     last;
    }
   }
   
   $tmp_count_space_20 = $count_space_20;
   
   while(1){
    my $pos = rindex($command_return, "                    \n");
    
    if($pos == -1){
     last;
    }
    else{
     substr($command_return, $pos, 21) = '';
     $tmp_count_space_20 --;
    }
    
    if($tmp_count_space_20 == 0){
     last;
    }
   }
  }
  
  return($command_return, $matched_prompt);
 }
 elsif($count_space_20 >= 10){
  my $title = $self -> get_title;
  $self -> write_error_message('プロンプト検知で失敗しました。' . "\n" . 'コマンド「' . $title . '」のプロンプト多重確認を「しない」に変更するとうまくいく可能性があります。');
  return(undef, undef);
 }
 elsif($prompt_ok_error == 0){
  return($complete_command, '');
 }
 else{ 
  return(undef, undef);
 }
}



#
# コマンド1つを実行。プロンプト確認:JUNOS型
# JUNOS のrequest support information のような自動で複数のコマンドを実行してしまう場合。
#
sub command_junos {
 my $self = $_[0];
 my $complete_command = $_[1];
 my $command_return = '';
 my $matched_prompt = '';
 
 my $telnet = $self -> {'telnet'};
 my $prompt = $self -> get_particular_prompt; 
 
 my $between_prompt = '';
 my $ref_buffer = $telnet -> buffer;
 my $flag_match = 0;
 my $count_enter = 0;
 
 eval{
  $telnet -> print($complete_command);
  
  LOOP1 : while($count_enter < 10){
   my ($tmp1_command_return, $tmp1_matched_prompt) = $telnet -> waitfor('/.+$/');
   $tmp1_command_return =~ s/\r//g;
   $tmp1_matched_prompt =~ s/\r//g;
   
   # --More-- 処理のあとのBackSpace の除去。
   $tmp1_command_return =~ s/\x08//g;
   $tmp1_matched_prompt =~ s/\x08//g;

   if($tmp1_matched_prompt =~ /$prompt/){
    my $buffer_length = length($$ref_buffer);
    
    LOOP2 : while(1){                      
     # buffer に移すためのダミー操作。
     my ($dummy_command_return, $dummy_matched_prompt) = $telnet -> waitfor(String => '/TELNETMANTELNETMANTELNETMAN/', Errmode => 'return', Timeout => 0);
     my $tmp_buffer_length = length($$ref_buffer);
      
     if($tmp_buffer_length == $buffer_length){
      last LOOP2;
     }
     elsif($tmp_buffer_length > 1000){
      $command_return .= $tmp1_command_return .  $tmp1_matched_prompt;
      next LOOP1;
     }
     else{
      $buffer_length = $tmp_buffer_length;
     }
    }
    
    $count_enter ++;
    $telnet -> print('');
    my ($tmp2_command_return, $tmp2_matched_prompt) = $telnet -> waitfor(Match => '/' . $prompt . '/', Errmode => 'return', Timeout => 1);
    
    unless(defined($tmp2_matched_prompt)){
     $command_return .= $tmp1_command_return . $tmp1_matched_prompt;
     next LOOP1;
    }
    
    $tmp2_command_return =~ s/\r//g;
    $tmp2_matched_prompt =~ s/\r//g;
    
    if($tmp2_matched_prompt eq $tmp1_matched_prompt){
     $flag_match = 1;
     $command_return .= $tmp1_command_return . $tmp1_matched_prompt . $tmp2_command_return;
     $matched_prompt = $tmp2_matched_prompt;
     $between_prompt = $tmp2_command_return;
     last LOOP1;
    }
    else{
     $command_return .= $tmp1_command_return . $tmp1_matched_prompt . $tmp2_command_return . $tmp2_matched_prompt;
     $count_enter ++;
     $telnet -> print('');
     sleep(1);
    }
   }
   else{
    $command_return .= $tmp1_command_return . $tmp1_matched_prompt;
   }
   
   # --More-- 対策
   $command_return = $self -> do_more($command_return);
  } 
 };
 
 my $prompt_ok_error = $self -> check_prompt($flag_match);
 
 # 余計なプロンプトを削除。
 if($prompt_ok_error == 1){
  if($count_enter > 0){
   my $tmp_count_enter = $count_enter * 2;
   my $length_matched_prompt = length($matched_prompt);
   my $length_between_prompt = length($between_prompt);
   
   while(1){
    my $length_command_return = length($command_return);
    my $pos_between_prompt = rindex($command_return, $between_prompt);
    
    if($pos_between_prompt == -1){
     last;
    }
    elsif($pos_between_prompt >= $length_command_return - $length_between_prompt - 1){
     substr($command_return, $pos_between_prompt) = '';
     $tmp_count_enter --;
    }
    else{
     last;
    }
    
    $length_command_return = length($command_return);
    my $pos_matched_prompt = rindex($command_return, $matched_prompt);
    
    if($pos_matched_prompt == -1){
     last;
    }
    elsif($pos_matched_prompt >= $length_command_return - $length_matched_prompt - 1){
     substr($command_return, $pos_matched_prompt) = '';
     $tmp_count_enter --;
    }
    else{
     last;
    }
    
    if($tmp_count_enter == 0){
     last;
    }
   }
  }
  
  return($command_return, $matched_prompt);
 }
 elsif($count_enter >= 10){
  my $title = $self -> get_title;
  $self -> write_error_message('プロンプト検知で失敗しました。' . "\n" . 'コマンド「' . $title . '」のプロンプト多重確認を「しない」に変更するとうまくいく可能性があります。');
  return(undef, undef);
 }
 elsif($prompt_ok_error == 0){
  return($complete_command, '');
 }
 else{ 
  return(undef, undef);
 }
}



#
# コマンド1つを実行。プロンプト確認:無し
#
sub command_none {
 my $self = $_[0];
 my $complete_command = $_[1];
 my $command_return = '';
 my $matched_prompt = '';
 
 my $telnet = $self -> {'telnet'};
 my $prompt = $self -> get_particular_prompt; 
 
 my $flag_match = 0;
 
 eval{
  $telnet -> print($complete_command);
  
  while(1){
   my ($tmp1_command_return, $tmp1_matched_prompt) = $telnet -> waitfor('/.+$/');
   $tmp1_command_return =~ s/\r//g;
   $tmp1_matched_prompt =~ s/\r//g;
   
   # --More-- 処理のあとのBackSpace の除去。
   $tmp1_command_return =~ s/\x08//g;
   $tmp1_matched_prompt =~ s/\x08//g;
   
   if($tmp1_matched_prompt =~ /$prompt/){
    $command_return .= $tmp1_command_return;
    $matched_prompt  = $tmp1_matched_prompt;
    $flag_match = 1;
    last;
   }
   else{
    $command_return .= $tmp1_command_return . $tmp1_matched_prompt;
   }
   
   # --More-- 対策
   $command_return = $self -> do_more($command_return);
  }
 };
 
 my $prompt_ok_error = $self -> check_prompt($flag_match);
 
 if($prompt_ok_error == 1){
  return($command_return, $matched_prompt);
 }
 elsif($prompt_ok_error == 0){
  return($complete_command, '');
 }
 else{ 
  return(undef, undef);
 }
}



#
# --More-- の対応。
#
sub do_more {
 my $self = $_[0];
 my $command_return = $_[1];
 my $more_string = $self -> get_more_string;
 
 if(defined($more_string) && (length($more_string) > 0)){
  my $last_LF_position = rindex($command_return, "\n");
  my $last_line = substr($command_return, $last_LF_position + 1);
  
  if(defined($last_line) && (index($last_line, $more_string) >= 0)){
   my $more_command = $self -> get_more_command;
   $more_command =~ s/_BLANK_//g;
   $more_command =~ s/_DUMMY_//g;
   $more_command =~ s/_LF_//g;
  
   my $telnet = $self -> {'telnet'};
   
   # buffer を空にして、--More-- 行を削除してから次の表示へ。
   my ($more_line_1, $more_line_2) = $telnet -> waitfor(Match => '/.+$/', Errmode => 'return', Timeout => 0);
   substr($command_return, $last_LF_position + 1) = '';
   
   if(defined($more_command) && (length($more_command) > 0)){
    $telnet -> put($more_command);
   }
   else{
    $telnet -> print('');
   }
  }
 }
 
 return($command_return);
}


#
# プロンプトを検知したかどうかの確認。
#
sub check_prompt {
 my $self = $_[0];
 my $flag_match = $_[1];

 if($flag_match == 0){
  if(defined($@) && ($@ =~ /^pattern match read eof/)){
   $self -> {'eof_flag'} = 1;
   $@ = '';
   return(0);
  }
  else{
   my $error_message = 'プロンプトを検知できませんでした。';
   if(length($@) > 0){
    $error_message .= "\n" . $@;
    $@ = '';
   }
   
   $self -> write_error_message($error_message);
   return(-1);
  }
 }
 elsif(length($@) > 0){
  my $error_message = $@;
  $@ = '';
  $self -> write_error_message($error_message);
  
  return(-1);
 }

 return(1);
}



#
# コマンド結果を溜める。
#
sub add_command_return {
 my $self = $_[0];
 my $complete_command = $_[1];
 my $command_return   = $_[2];
 my $matched_prompt   = $_[3];
 
 $self -> {'matched_prompt'} = $matched_prompt;
 
 if($self -> {'dummy'} == 0){
  $self -> add_log($command_return);
  
  if(length($complete_command) > 0){
   my $escaped_complete_command = &Common_sub::escape_reg($complete_command);
   $command_return =~ s/$escaped_complete_command[\s\r\n]*//;
  }
  
  my $syslog_ok_error = $self -> check_syslog($command_return);
  
  if($syslog_ok_error == -1){
   return(-1);
  }
 }
 elsif($self -> {'dummy'} == 1){
  my $dummy_return = $self -> get_dummy_return;
  $command_return = $self -> insert_skeleton_values($dummy_return);

  unless(defined($command_return)){
   return(-1);
  }
  
  $command_return =~ s/_BLANK_//g;
  $command_return =~ s/_DUMMY_//g;
  $command_return =~ s/_LF_/\n/g;
  
  unless($command_return =~ /\n$/){
   $command_return .= "\n";
  }
  
  my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('Telnetman Dummy Return');
  $self -> add_log($complete_command . "\n" . $log_start . "\n" . $command_return . $log_end . "\n");
 }
 
 my $store_command = $self -> get_store_command;
 if($store_command == 1){
  if(length($self -> {'complete_command'}) > 0){
   $self -> {'complete_command'} .= "\n";
  }
  
  $self -> {'complete_command'} .= $complete_command;
  $self -> {'command_return'} .= $command_return;
 }
 
 return(1);
}


#
# ログに追加する。
#
sub add_log {
 my $self = $_[0];
 my $log  = $_[1];
 my $matched_prompt = $self -> {'matched_prompt'};
 
 $self -> {'LOG'} .= $log;
 
 unless($self -> {'LOG'} =~ /\n$/){
  $self -> {'LOG'} .= "\n";
 }
 
 $self -> {'LOG'} .= $matched_prompt;
}
 

#
# コマンド結果からSYSLOG を取り出してエラーかどうか確認する。
#
sub check_syslog {
 my $self = $_[0];
 my $command_return = $_[1];
 my $ok_error = 1;
 
 if($self -> {'check_syslog'} == 1){
  my $pattern =   $self -> {'terminal_monitor'} -> {'pattern'};
  my @errors  = @{$self -> {'terminal_monitor'} -> {'errors'}};
  
  SYSLOG : while(length($command_return) > 0){
   my $pos = index($command_return, "\n");
   my $count = $pos + 1;
   my $line = '';
   
   if($pos > 0){
    $line = substr($command_return, 0, $count);
    substr($command_return, 0, $count) = '';
   }
   elsif($pos == 0){
    substr($command_return, 0, $count) = '';
   }
   elsif($pos < 0){
    $line = $line = substr($command_return, 0);
    substr($command_return, 0) = '';
   }
   
   chomp($line);
   
   if(length($line) > 0){
    if($line =~ /$pattern/){
     foreach my $error_pattern (@errors){
      my ($error_log) = $line =~ /$error_pattern/g;
      
      if(defined($error_log) && (length($error_log) > 0)){
       $self -> write_error_message('syslog のエラーパターンを検知しました。' . "\n" . $error_log);
       $ok_error = -1;
       last SYSLOG;
      }
     }
    }
   }
  }
 }
 
 return($ok_error);
}



#
# Action を実行する。
#
sub exec_action {
 my $self = $_[0];
 my $OK_NG = 1;
 my $repeat_type = $self -> get_repeat_type;
 
 $self -> {'n'} = 0;
 
 $self -> crear_NG_message;
 $self -> {'complete_condition'} = '';
 
 # コメント挿入
 $OK_NG = $self -> add_comment;
 if($OK_NG == -1){
  return(-1, -1);
 }
 
 # パターンマッチ
 $OK_NG = $self -> pattern_match;
 if($OK_NG  == -1){
  return(-1, -1);
 }
 
 # 変換スクリプト実行
 $OK_NG = $self -> exec_script;
 if($OK_NG  == -1){
  return(-1, -1);
 }
  
 # 分岐条件
 if($self -> {'n'} > 0){
  if($repeat_type == 1){
   $OK_NG = $self -> check_values_1;
  }
  elsif($repeat_type == 2){
   $OK_NG = $self -> check_values_2;
  }
 }
 
 if($OK_NG  == -1){
  return(-1, -1);
 }
 
 # 個数条件
 if($OK_NG == 1){
  $OK_NG = $self -> count_condition;
 }
 
 # NG メッセージの作成、または、追加パラメーターシートの作成。
 if($OK_NG == 1){
  # {$1}, {$2}, {$3}, ..., {$*} が書かれている
  # かつ
  # {$n} == 0
  # でなければパラメーターシート追加処理を行う。
  my $inc_pmv = $self -> include_pattern_matched_value;
  
  unless(($inc_pmv == 1) && ($self -> {'n'} == 0)){
   if($repeat_type == 1){
    $OK_NG = $self -> add_parameter_sheet;
   }
   elsif($repeat_type == 2){
    my $round = 0;
    my $continue = $self -> shift_value($round);
    
    while($continue == 1){
     $OK_NG = $self -> add_parameter_sheet;
     
     if($OK_NG == -1){
      last;
     }
    
     $round ++;
     $continue = $self -> shift_value($round);
    }
   }
  }
 }
 elsif($OK_NG == 0){
  $self -> write_NG_message;
 }
 
 $self -> {'last_OK_NG'} = $OK_NG;
 
 # コマンド結果の破棄。
 my $destroy = $self -> get_destroy;
 if($destroy == 1){
  $self -> {'complete_command'} = '';
  $self -> {'command_return'} = '';
 }
 
 if($OK_NG == 1){
  return(1, 0);
 }
 elsif($OK_NG == 0){
  return(0, 1);
 }
 elsif($OK_NG == -1){
  return(-1, -1);
 }
}



#
# コマンド結果から値を取り出す。
#
sub pattern_match {
 my $self = $_[0];
 
 my $command_return = $self -> {'command_return'};
 my $repeat_type = $self -> get_repeat_type;
 my $pattern     = $self -> get_pattern;
 my $pipe_type   = $self -> get_pipe_type;
 my $pipe_word   = $self -> get_pipe_word;
 my $begin_word  = $self -> get_begin_word;
 my $end_word    = $self -> get_end_word;
 my $complete_pipe_words  = '';
 my $complete_begin_words = '';
 my $complete_end_words   = '';
 
 # pipe word, begin word, end word のスケルトン埋め。
 if($repeat_type == 1){
  $complete_pipe_words  = $self -> insert_skeleton_values($pipe_word);
  $complete_begin_words = $self -> insert_skeleton_values($begin_word);
  $complete_end_words   = $self -> insert_skeleton_values($end_word);
 } 
 elsif($repeat_type == 2){
  $complete_pipe_words  = $self -> make_complete_string_type_2($pipe_word);
  $complete_begin_words = $self -> make_complete_string_type_2($begin_word);
  $complete_end_words   = $self -> make_complete_string_type_2($end_word);
 }
 
 unless(defined($complete_pipe_words) && defined($complete_begin_words) && defined($complete_end_words)){
  return(-1);
 } 
 
 $complete_pipe_words =~ s/_BLANK_//g;
 $complete_pipe_words =~ s/_DUMMY_//g;
 $complete_pipe_words =~ s/_LF_/\n/g;
 
 $complete_begin_words =~ s/_BLANK_//g;
 $complete_begin_words =~ s/_DUMMY_//g;
 $complete_begin_words =~ s/_LF_/\n/g;
 
 $complete_end_words =~ s/_BLANK_//g;
 $complete_end_words =~ s/_DUMMY_//g;
 $complete_end_words =~ s/_LF_/\n/g;
 
 # 初期化
 $self -> initialize_matched_values;
 
 # 抽出
 my @matched_values = &Telnetman_common::pattern_match($command_return, $pattern, $pipe_type, $complete_pipe_words, $complete_begin_words, $complete_end_words);
 my $n = shift(@matched_values);
 
 if($n > 0){
  foreach my $value (@matched_values){
   $self -> push_matched_values($value);
  }
 }
 elsif($n == -1){
  my $pattern = shift(@matched_values);
  my $title   = $self -> get_title;
  
  $self -> write_error_message('タイトル : ' . $title . "\n" . '正規表現の書き方がおかしいようです' . "\n" . $pattern);
  
  return(-1);
 }
 
 $self -> {'n'} = $n;
 
 return(1);
}


#
# 変換スクリプトを実行する。
#
sub exec_script {
 my $self = $_[0];
 my $script_id = $self -> get_script_id;
 
 if(defined($script_id) && (length($script_id) > 0)){
  my @new_value_list = ();
  my @value_list = $self -> get_value_list;
  my $n = scalar(@value_list);
  
  require(&Common_system::dir_conversion_script() . '/' . $script_id . '.pl');
  eval('@new_value_list = &' . $script_id . '::convert(@value_list)');
  
  if(length($@) > 0){
   $self -> write_error_message($@);
   $@ = '';
   
   return(-1);
  }
  
  # 初期化
  $self -> initialize_matched_values;
  
  $n = scalar(@new_value_list);
  
  if(($n == 1) && !defined($new_value_list[0])){
   $n = 0;
  }
  
  if($n > 0){
   # 入れ直し
   foreach my $value (@new_value_list){
    $self -> push_matched_values($value);
   }
  }
  
  $self -> {'n'} = $n;
 }
 
 return(1);
}


#
# [1回のみ]用の変数が分岐条件に一致するか確認する。
# 返り値 : 1:OK 0:NG
#
sub check_values_1 {
 my $self = $_[0];
 my $not  = $self -> get_not;
 
 my $ref_condition_list = $self -> get_conditions;
 
 my $OK_NG = 1;
 
 OR1 : foreach my $ref_condition_row (@$ref_condition_list){
  unless(defined($ref_condition_row)){
   next OR1;
  }
  
  
  AND1 : foreach my $condition (@$ref_condition_row){
   unless(defined($condition) && (length($condition) > 0)){
    next AND1;
   }
   
   my $complete_condition = $self -> insert_skeleton_values($condition);
   
   if(defined($complete_condition)){
    $self -> {'complete_condition'} = $complete_condition;
   }
   else{
    return(-1);
   }
   
   my $perl_code = 'if(' . $complete_condition . '){$OK_NG = 1;}else{$OK_NG = 0;}';
   eval($perl_code);
   
   if(length($@) > 0){
    $self -> write_error_message('分岐条件の書き方がおかしいようです。' . "\n" . '置換済み分岐条件 : ' . $complete_condition);
    $@ = '';
    
    return(-1);
   }
   
   if($OK_NG == 0){
    next OR1;
   }
  }
  
  last OR1;
 }
 
 $OK_NG = $OK_NG ^ $not;
 
 return($OK_NG);
}


#
# [繰り返し]用の変数が分岐条件に一致するか確認する。
# 返り値 : 分岐条件に一致した値の数
#
sub check_values_2 {
 my $self = $_[0];
 my $not  = $self -> get_not;
 
 my $ref_condition_list = $self -> get_conditions;
 
 # 条件を通過した値を入れる配列と個数。
 my @passed_value_list = ();
 my $n = 0;
 
 my $round = 0;
 my $continue = $self -> shift_value($round);
 
 while($continue == 1){
  my $ok_ng = 1;
  
  OR2 : foreach my $ref_condition_row (@$ref_condition_list){
   unless(defined($ref_condition_row)){
    next OR2;
   }
   
   AND2 : foreach my $condition (@$ref_condition_row){
    unless(defined($condition) && (length($condition) > 0)){
     next AND2;
    }
    
    my $complete_condition = $self -> insert_skeleton_values($condition);
    
    if(defined($complete_condition)){
     $self -> {'complete_condition'} = $complete_condition;
    }
    else{
     return(-1);
    }
    
    my $perl_code = 'if(' . $complete_condition . '){$ok_ng = 1;}else{$ok_ng = 0;}';
    eval($perl_code);
    
    if(length($@) > 0){
     $self -> write_error_message('分岐条件の書き方がおかしいようです。' . "\n" . '置換済み分岐条件 : ' . $complete_condition);
     $@ = '';
     
     return(-1);
    }
    
    if($ok_ng == 0){
     next OR2;
    }
   }
   
   last OR2;
  }
  
  $ok_ng = $ok_ng ^ $not;
  
  if($ok_ng == 1){
   my $value = $self -> get_row_value;
   push(@passed_value_list, $value);
   $n ++;
  }
  
  $round ++;
  $continue = $self -> shift_value($round);
 }
 
 # 初期化
 $self -> initialize_matched_values;
   
 # 入れ直し
 foreach my $value (@passed_value_list){
  $self -> push_matched_values($value);
 }
 
 $self -> {'n'} = $n;
 
 return(1);
}


# 
# 個数条件
#
sub count_condition {
 my $self = $_[0];
 my $n = $self -> {'n'};
 my $operator = $self -> get_operator;
 my $count    = $self -> get_count;
 my $OK_NG = 0;
 
 # operator
 # 1 : ==
 # 2 : !=
 # 3 : >
 # 4 : >=
 # 5 : <
 # 6 : <=
 
 if($operator == 1){
  if($n == $count){ 
   $OK_NG = 1;
  }
 }
 elsif($operator == 2){
  if($n != $count){ 
   $OK_NG = 1;
  }
 }
 elsif($operator == 3){
  if($n > $count){ 
   $OK_NG = 1;
  }
 }
 elsif($operator == 4){
  if($n >= $count){ 
   $OK_NG = 1;
  }
 }
 elsif($operator == 5){
  if($n < $count){ 
   $OK_NG = 1;
  }
 }
 elsif($operator == 6){
  if($n <= $count){ 
   $OK_NG = 1;
  }
 } 
 
 return($OK_NG);
}



#
# ping 実行。
#
sub exec_ping {
 my $self = $_[0];
 
 $self -> crear_NG_message;
 
 my $comment_ok_error = $self -> add_comment;
 if($comment_ok_error == -1){
  return(-1, -1);
 }
 
 my $repeat_type = $self -> get_repeat_type;
 my $target      = $self -> get_ping_target;
 my $count       = $self -> get_ping_count;
 my $timeout     = $self -> get_ping_timeout;
 my $condition   = $self -> get_ping_condition;
 
 my $complete_target = '';
 
 # target のスケルトン埋め。
 if($repeat_type == 1){
  $complete_target = $self -> insert_skeleton_values($target);
 }
 elsif($repeat_type == 2){
  $complete_target = $self -> make_complete_string_type_2($target);
 }
 
 unless(defined($complete_target)){
  return(-1, -1);
 } 
 
 $complete_target =~ s/_BLANK_//g;
 $complete_target =~ s/_DUMMY_//g;
 $complete_target =~ s/_LF_/\n/g;
 $complete_target = &Common_sub::trim_lines($complete_target);
 
 # 重複したtarget を1つにする。
 my @split_target = split(/\n/, $complete_target);
 my @target_list = &Common_sub::trim_array(@split_target);
 
 if(scalar(@target_list) == 0){
  return(1, 0);
 }
 
 # ping 実行。
 my $ref_ping_result_list = &MTping::mtping(\@target_list, $count, $timeout);
 
 # 実行結果をまとめる。
 my @ping_ok_list    = ();
 my @ping_ng_list    = ();
 my @ping_error_list = ();
 
 foreach my $target (@target_list){
  my $result = $ref_ping_result_list -> {$target};
  
  if($result == 1){
   push(@ping_ok_list, $target);
  }
  elsif($result == 0){
   push(@ping_ng_list, $target);
  }
  else{
   push(@ping_error_list, $target);
  }
 }
 
 my $count_ok    = scalar(@ping_ok_list);
 my $count_ng    = scalar(@ping_ng_list);
 my $count_error = scalar(@ping_error_list);
 
 # ping 未実施で終わったtarget があった場合。
 if($count_error > 0){
  my $error_message = '以下のノードにping 実行出来ませんでした。';
  
  foreach my $target (@ping_error_list){
   $error_message .= "\n" . $target;
  }
  
  $self -> write_error_message($error_message);
 
  return(-1, -1);
 }
 
 # 条件の確認。
 my $OK_NG = 0;
 
 if($condition == 1){
  if($count_ng == 0){
   $OK_NG = 1;
  }
 }
 elsif($condition == 2){
  if($count_ok > 0){
   $OK_NG = 1;
  }
 }
 elsif($condition == 3){
  if($count_ok == 0){
   $OK_NG = 1;
  }
 }
 elsif($condition == 4){
  if($count_ng > 0){
   $OK_NG = 1;
  }
 }
 
 # 実行結果をログに書き込む。
 my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('Telnetman Ping Result'); 
 $self -> add_log("\n" . $log_start . "\n[OK]\n" . join("\n", @ping_ok_list) . "\n\n[NG]\n" . join("\n", @ping_ng_list) . "\n" . $log_end . "\n");
 
 if($OK_NG == 0){
  $self -> write_NG_message;
 }
 
 $self -> {'last_OK_NG'} = $OK_NG;
 
 if($OK_NG == 1){
  return(1, 0);
 }
 elsif($OK_NG == 0){
  return(0, 1);
 }
 elsif($OK_NG == -1){
  return(-1, -1);
 }
}



#
# 置換済みコマンドを取得する。
#
sub get_complete_command_list {
 my $self = $_[0];
 my @complete_command_list = ();
 my ($item_type, $item_id) = $self -> get_item_type_id;
 
 my $commands = $self -> {'item'} -> {$item_type} -> {$item_id} -> {'command'};
 $commands =~ s/\r//g;
 $commands =~ s/\n/_LF_/g;
 
 my @command_list = split(/_LF_/, $commands);
 if((scalar(@command_list) == 1) && ($command_list[0] eq '_DUMMY_')){
  $self -> {'dummy'} = 1;
 }
 else{
  $self -> {'dummy'} = 0;
 }
 
 foreach my $command (@command_list){
  my $complete_command = $self -> insert_skeleton_values($command);
  
  unless(defined($complete_command)){
   return(undef);
  }
  
  $complete_command =~ s/_BLANK_//g;
  $complete_command =~ s/_DUMMY_//g;
  
  my @command_list = split(/_LF_/, $complete_command);
  
  push(@complete_command_list, @command_list);
 }
 
 return(\@complete_command_list);
}



#
# コマンド、抽出パターン、分岐条件などのスケルトンにTelentman 変数や'matched_values' の値を入れ込む。
#
sub insert_skeleton_values {
 my $self   = $_[0];
 my $string = $_[1];
 my $replaced_string = '';
 $self -> {'calculation_type'} = '';
 
 unless(defined($string) && (length($string) > 0)){
  return('');
 }
 
 my $node = $self -> get_node;
 my $user            = $self -> get_user;
 my $password        = $self -> get_password;
 my $enable_password = $self -> get_enable_password;
 my $matched_prompt = $self -> {'matched_prompt'};
 my $B = $self -> {'B'};
 my $n = $self -> {'n'};
 my $complete_command = $self -> {'complete_command'};
 my $complete_condition = $self -> {'complete_condition'};
 my $pattern = $self -> get_pattern;
 my $title = $self -> get_title;
 
 $self -> clear_error_message;
 
 my @string_list = split(//, $string);
 my @stack = ();
 
 my $flag_escape = 0;
 STACK1 : foreach my $character (@string_list){
  if(($flag_escape == 0) && ($character eq "\\")){
   $flag_escape = 1;
   next;
  }
  
  if($flag_escape == 1){
   push(@stack, $character);
   $flag_escape = 0;
   next;
  }
  
  if($character eq '}'){
   my $variable_name = '';
   
   my $poped_character = '';
   my $joined_character = '';
   while($poped_character ne '{'){
    $joined_character = $poped_character . $joined_character;
    
    if(scalar(@stack) == 0){
     push(@stack, $joined_character);
     next STACK1;
    }
    
    $poped_character = pop(@stack);
    
    if($poped_character eq ':'){
     $variable_name = $joined_character;
    }
   }
   
   my $value = '';
   if($joined_character =~ /^\$[0-9]+$/){
    my ($index) = $joined_character =~ /\$([0-9]+)/g;
    
    if($index >= 1){
     $value = $self -> get_col_value($index - 1);
    }
    else{
     $value = undef;
    }
   }
   elsif($joined_character =~ /^\$\*$/){
    $value = $self -> get_row_value;
   }
   elsif($joined_character =~ /^#[0-9]+$/){
    my ($index) = $joined_character =~ /#([0-9]+)/g;
    
    if($index >= 1){
     $value = $self -> get_col_value($index - 1, 'main');
    }
    else{
     $value = undef;
    }
   }
   elsif($joined_character =~ /^#\*$/){
    $value = $self -> get_row_value('main');
   }
   elsif($joined_character =~ /^\*:.+/){    
    if(defined($B) && (length($B) > 0) && defined($self -> {'B_info'} -> {$node} -> {$B}) && defined($self -> {'B_info'} -> {$node} -> {$B} -> {$variable_name})){
     $value = $self -> {'B_info'} -> {$node} -> {$B} -> {$variable_name};
    }
    else{
     $value = undef;
    }
   }
   elsif($joined_character =~ /.+:.+/){
    my @B_and_variable_name = split(/:/, $joined_character);
    splice(@B_and_variable_name, -1);
    my $this_B = join(':', @B_and_variable_name);
    
    if(defined($self -> {'B_info'} -> {$node} -> {$this_B}) && defined($self -> {'B_info'} -> {$node} -> {$this_B} -> {$variable_name})){
     $value = $self -> {'B_info'} -> {$node} -> {$this_B} -> {$variable_name};
    }
    else{
     $value = undef;
    }
   }
   elsif(($joined_character eq '.') || ($joined_character eq '+') || ($joined_character eq '-')){
    $value = '';
    $self -> {'calculation_type'} = $joined_character;
   }
   elsif($joined_character eq '$node'){
    $value = $node;
   }
   elsif($joined_character eq '$user'){
    $value = $user;
   }
   elsif($joined_character eq '$password'){
    $value = $password;
   }
   elsif($joined_character eq '$enable_password'){
    $value = $enable_password;
   }
   elsif($joined_character eq '$prompt'){
    $value = $matched_prompt;
   }
   elsif($joined_character eq '$B'){
    $value = $B;
   }
   elsif($joined_character eq '$command'){
    $value = $complete_command;
   }
   elsif($joined_character eq '$condition'){
    $value = $complete_condition;
   }
   elsif($joined_character eq '$pattern'){
    $value = $pattern;
   }
   elsif($joined_character eq '$n'){
    $value = $n;
   }
   elsif($joined_character eq '$title'){
    $value = $title;
   }
   else{
    my $variable_name = $joined_character;
    if(defined($self -> {'A_info'} -> {$node} -> {$variable_name})){
     $value = $self -> {'A_info'} -> {$node} -> {$variable_name};
    }
    else{
     $value = undef;
    }
   }
   
   if(defined($value)){
    push(@stack, $value);
   }
   elsif(length($title) > 0){
    $self -> write_error_message('タイトル:' . $title . "\n" . $string . "\n\n" . '{' . $joined_character . '} を埋める変数が未定義です。');
    return(undef);
   }
   else{
    $self -> write_error_message('Diff または任意ログ' . "\n" . $string . "\n\n" . '{' . $joined_character . '} を埋める変数が未定義です。');
    return(undef);
   }
   
   $variable_name = '';
  }
  else{
   push(@stack, $character);
  }
 }
 
 $replaced_string = join('', @stack);
 
 return($replaced_string);
}



#
# {$*} を含む文字列のスケルトンを埋める。
#
sub make_complete_string_type_2 {
 my $self   = $_[0];
 my $string = $_[1];
 my $complete_string = '';
 
 my @split_string = split(/\n/, $string);
 
 foreach my $line (@split_string){
  if(defined($line)){
   if($line =~ /\{\$\*\}/){
    my $round = 0;
    my $continue = $self -> shift_value($round);
    
    while($continue == 1){
     my $_complete_string = $self -> insert_skeleton_values($line);
     
     unless(defined($_complete_string)){
      return(undef);
     }
     
     $complete_string .= $_complete_string . "\n";
     
     $round ++;
     $continue = $self -> shift_value($round);
    }
   }
   else{
    $complete_string .= $self -> insert_skeleton_values($line) . "\n";
   }
  }
 }
 
 return($complete_string);
}



#
# 現在のルーチンインデックスを更新する。
#
sub set_routine_index {
 my $self = $_[0];
 my $routine_type = $_[1];
 $self -> {'this_routine_index'} = $routine_type;
}


#
# 現在のルーチンインデックスを返す。
#
sub get_routine_index {
 my $self = $_[0];
 return($self -> {'this_routine_index'});
}


#
# 現在メインルーチン内かサブルーチン内か確認する。
#
sub check_routine_type {
 my $self = $_[0];
 
 my $main_sub = '';
 if($self -> {'this_routine_index'} == 0){
  $main_sub = 'main';
 }
 else{
  $main_sub = 'sub';
 }
 
 return($main_sub);
}


#
# 繰り返し型から参照する変数格納庫を定義する。
#
sub check_row_col {
 my $self = $_[0];
 my $item_repeat_type = $self -> get_repeat_type;
 
 my $col_row = '';
 if($item_repeat_type == 1){
  $col_row = 'cols';
 }
 elsif($item_repeat_type == 2){
  $col_row = 'rows';
 }
 
 return($col_row);
}



# 特殊ログの始まりと終わりの記述を作成する。
sub log_start_end {
 my $title = $_[0];
 my $log_start = '===[' . $title . ']============>>>';
 my $log_end   = '<<<============[' . $title . ']===';
 
 return($log_start, $log_end);
}

# 追加パラメーターシートに{$1}, {$2}, {$3}, ..., {$*} が書かれているか確認する。
sub include_pattern_matched_value {
 my $self = $_[0];
 my $ref_parameter_sheet_A = $self -> get_parameter_sheet_A;
 my $ref_parameter_sheet_B = $self -> get_parameter_sheet_B;
 
 foreach my $ref_row (@$ref_parameter_sheet_A){
  my ($parameter_A, $parameter_name, $parameter_value) = @$ref_row;
  
  if(defined($parameter_A) && (($parameter_A =~ /\{\$[0-9]+\}/) || ($parameter_A =~ /\{\$\*\}/))){
   return(1);
  }
  
  if(defined($parameter_name) && (($parameter_name =~ /\{\$[0-9]+\}/) || ($parameter_name =~ /\{\$\*\}/))){
   return(1);
  }
  
  if(defined($parameter_value) && (($parameter_value =~ /\{\$[0-9]+\}/) || ($parameter_value =~ /\{\$\*\}/))){
   return(1);
  }
 }
 
 foreach my $ref_row (@$ref_parameter_sheet_B){
  my ($parameter_A, $parameter_B, $parameter_name, $parameter_value) = @$ref_row;
  
  if(defined($parameter_A) && (($parameter_A =~ /\{\$[0-9]+\}/) || ($parameter_A =~ /\{\$\*\}/))){
   return(1);
  }
  
  if(defined($parameter_B) && (($parameter_B =~ /\{\$[0-9]+\}/) || ($parameter_B =~ /\{\$\*\}/))){
   return(1);
  }
  
  if(defined($parameter_name) && (($parameter_name =~ /\{\$[0-9]+\}/) || ($parameter_name =~ /\{\$\*\}/))){
   return(1);
  }
  
  if(defined($parameter_value) && (($parameter_value =~ /\{\$[0-9]+\}/) || ($parameter_value =~ /\{\$\*\}/))){
   return(1);
  }
 }
 
 return(0);
}

# パラメーターシートに追加する。
sub add_parameter_sheet {
 my $self = $_[0];
 my $node = $self -> get_node;
 my $ref_parameter_sheet_A = $self -> get_parameter_sheet_A;
 my $ref_parameter_sheet_B = $self -> get_parameter_sheet_B;
 my $RPN = $self -> {'RPN'};
 
 foreach my $ref_row (@$ref_parameter_sheet_A){
  my ($parameter_A, $parameter_name, $parameter_value) = @$ref_row;
  
  unless(defined($parameter_A) && (length($parameter_A) > 0)){
   next;
  }
  
  unless(defined($parameter_name) && (length($parameter_name) > 0)){
   next;
  }
  
  unless(defined($parameter_value)){
   $parameter_value = '';
  }
  
  my $complete_parameter_A     = $self -> insert_skeleton_values($parameter_A);
  my $complete_parameter_name  = $self -> insert_skeleton_values($parameter_name);
  my $complete_parameter_value = $self -> insert_skeleton_values($parameter_value);
  
  unless(defined($complete_parameter_A) && defined($complete_parameter_name) && defined($complete_parameter_value)){
   return(-1);
  }
  
  $complete_parameter_A     =~ s/\r//g;
  $complete_parameter_name  =~ s/\r//g;
  $complete_parameter_value =~ s/\r//g;
  
  $complete_parameter_A     =~ s/\n/_LF_/g;
  $complete_parameter_name  =~ s/\n/_LF_/g;
  $complete_parameter_value =~ s/\n/_LF_/g;
  
  if((length($complete_parameter_A) > 0) && (length($complete_parameter_name) > 0)){
   $self -> {'flag_make_parameter_sheet'} = 1;
  }
  else{
   next;
  }
  
  unless(exists($self -> {'additional_A_info'} -> {$complete_parameter_A})){
   $self -> {'additional_A_info'} -> {$complete_parameter_A} = {};
   push(@{$self -> {'additional_A_list'}}, $complete_parameter_A);
  }
  
  # A info に追加。
  $RPN -> set($complete_parameter_value);
  my $calculated_value = $RPN -> calculate;
  $self -> {'additional_A_info'} -> {$complete_parameter_A} -> {$complete_parameter_name} = $self -> calculate_value(
   $self -> {'additional_A_info'} -> {$complete_parameter_A} -> {$complete_parameter_name},
   $calculated_value
  );
  
  # telnet しているノードと同じノードのA info なら既存A info にも追加。
  if($complete_parameter_A eq $node){
   $self -> {'A_info'} -> {$node} -> {$complete_parameter_name} = $self -> calculate_value(
    $self -> {'A_info'} -> {$node} -> {$complete_parameter_name},
    $calculated_value
   );
  }
 }
 
 foreach my $ref_row (@$ref_parameter_sheet_B){
  my ($parameter_A, $parameter_B, $parameter_name, $parameter_value) = @$ref_row;
  
  unless(defined($parameter_A) && (length($parameter_A) > 0)){
   next;
  }
  
  unless(defined($parameter_B) && (length($parameter_B) > 0)){
   next;
  }
  
  unless(defined($parameter_name) && (length($parameter_name) > 0)){
   next;
  }
  
  unless(defined($parameter_value)){
   $parameter_value = '';
  }
  
  my $complete_parameter_A     = $self -> insert_skeleton_values($parameter_A);
  my $complete_parameter_B     = $self -> insert_skeleton_values($parameter_B);
  my $complete_parameter_name  = $self -> insert_skeleton_values($parameter_name);
  my $complete_parameter_value = $self -> insert_skeleton_values($parameter_value);
  
  unless(defined($complete_parameter_A) && defined($complete_parameter_B) && defined($complete_parameter_name) && defined($complete_parameter_value)){
   return(-1);
  }
  
  $complete_parameter_A     =~ s/\r//g;
  $complete_parameter_B     =~ s/\r//g;
  $complete_parameter_name  =~ s/\r//g;
  $complete_parameter_value =~ s/\r//g;
  
  $complete_parameter_A     =~ s/\n/_LF_/g;
  $complete_parameter_B     =~ s/\n/_LF_/g;
  $complete_parameter_name  =~ s/\n/_LF_/g;
  $complete_parameter_value =~ s/\n/_LF_/g;
  
  if((length($complete_parameter_A) > 0) && (length($complete_parameter_B) > 0) && (length($complete_parameter_name) > 0)){
   $self -> {'flag_make_parameter_sheet'} = 1;
  }
  else{
   next;
  }
  
  unless(exists($self -> {'additional_A_info'} -> {$complete_parameter_A})){
   $self -> {'additional_A_info'} -> {$complete_parameter_A} = {};
   push(@{$self -> {'additional_A_list'}}, $complete_parameter_A);
  }
  
  unless(exists($self -> {'additional_B_info'} -> {$complete_parameter_A})){
   $self -> {'additional_B_info'} -> {$complete_parameter_A} = {};
   $self -> {'additional_B_list'} -> {$complete_parameter_A} = [];
  }
  
  unless(exists($self -> {'additional_B_info'} -> {$complete_parameter_A} -> {$complete_parameter_B})){
   $self -> {'additional_B_info'} -> {$complete_parameter_A} -> {$complete_parameter_B} = {};
   push(@{$self -> {'additional_B_list'} -> {$complete_parameter_A}}, $complete_parameter_B);
  }
  
  # B info に追加。
  $RPN -> set($complete_parameter_value);
  my $calculated_value = $RPN -> calculate;
  $self -> {'additional_B_info'} -> {$complete_parameter_A} -> {$complete_parameter_B} -> {$complete_parameter_name} = $self -> calculate_value(
   $self -> {'additional_B_info'} -> {$complete_parameter_A} -> {$complete_parameter_B} -> {$complete_parameter_name},
   $calculated_value
  );
  
  if($complete_parameter_A eq $node){
   unless(exists($self -> {'B_info'} -> {$node} -> {$complete_parameter_B})){
    $self -> {'B_info'} -> {$node} -> {$complete_parameter_B} = {};
    push(@{$self -> {'B_list'} -> {$node}}, $complete_parameter_B);
   }
   
   $self -> {'B_info'} -> {$node} -> {$complete_parameter_B} -> {$complete_parameter_name} = $self -> calculate_value(
    $self -> {'B_info'} -> {$node} -> {$complete_parameter_B} -> {$complete_parameter_name},
    $calculated_value
   );
  }
 }
 
 return(1);
}

# パラメーターシートの既存値に新しい値を演算した結果を返す。
sub calculate_value {
 my $self = $_[0];
 my $value1 = $_[1];
 my $value2 = $_[2];
 
 if(defined($value2) && (length($value2) > 0)){
  if((length($self -> {'calculation_type'}) > 0) && defined($value1) && (length($value1) > 0) && ($value1 ne '_BLANK_') && ($value1 ne '_DUMMY_')){
   if($self -> {'calculation_type'} eq '.'){
    $value1 .= '_LF_' . $value2;
   }
   elsif($self -> {'calculation_type'} eq '+'){
    $value1 += $value2;
   }
   elsif($self -> {'calculation_type'} eq '-'){
    $value1 -= $value2;
   }
  }
  elsif((length($self -> {'calculation_type'}) > 0) && !defined($value1)){
   if($self -> {'calculation_type'} eq '.'){
    $value1 = $value2;
   }
   elsif($self -> {'calculation_type'} eq '+'){
    $value1 = $value2;
   }
   elsif($self -> {'calculation_type'} eq '-'){
    $value1 = -1 * $value2;
   }
  }
  else{
   $value1 = $value2;
  }
 }
 elsif(!defined($value1) || (length($value1) == 0)){
  $value1 = '_BLANK_';
 }
 
 return($value1);
}

# 追加パラメーターシートを取り出す。
sub get_additional_parameter_sheet {
 my $self = $_[0];
 
 if($self -> {'flag_make_parameter_sheet'} == 0){
  return(undef);
 }
 
 my $ref_A_list = $self -> {'additional_A_list'};
 my $ref_A_info = $self -> {'additional_A_info'};
 my $ref_B_info = $self -> {'additional_B_info'};
 my $ref_B_list = $self -> {'additional_B_list'};
 
 my $ref_parameter_sheet = &Telnetman_common::restore_ref_parameter_sheet($ref_A_list, $ref_B_list, $ref_A_info, $ref_B_info);
 
 return($ref_parameter_sheet);
}



# NG メッセージを消去する。
sub crear_NG_message {
 my $self = $_[0];
 $self -> {'NG_message'} = '';
 $self -> {'tmp_NG_log'} = '';
}

# NG メッセージを書き込む。
sub write_NG_message {
 my $self = $_[0];
 my $repeat_type = $self -> get_repeat_type;
 my $NG_message = $self -> get_ng_message;
 my $complete_NG_message = '';
 
 if($repeat_type == 1){
  $complete_NG_message = $self -> insert_skeleton_values($NG_message);
 }
 elsif($repeat_type == 2){
  $complete_NG_message = $self -> make_complete_string_type_2($NG_message);
 }
 
 $self -> {'NG_message'} = $complete_NG_message;
 
 if(length($complete_NG_message) > 0){
  my $comment = $self -> get_comment;
  my $complete_comment = $self -> insert_skeleton_values($comment);
  
  if(length($complete_comment) > 0){
   $self -> {'tmp_NG_log'} = &Common_sub::add_frame($complete_comment);
  }
  
  $self -> {'tmp_NG_log'} .= $complete_NG_message;
 }
}

# NG メッセージを取得する。
sub get_NG_message {
 my $self = $_[0];
 my $NG_message = $self -> {'NG_message'};
 
 if(length($NG_message) > 0){
  my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('NG Message');
  
  return("\n\n\n" . $log_start . "\n" . $NG_message . "\n" . $log_end . "\n");
 }
 else{
  return('');
 }
}

# NG log を取得する。
sub get_NG_log {
 my $self = $_[0];
 my @NG_log = @{$self -> {'NG_log'}};
 
 if(scalar(@NG_log) > 0){
  my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('NG Message list');
  
  return("\n\n\n" . $log_start . "\n" . join("\n\n\n", @NG_log) . "\n" . $log_end . "\n");
 }
 else{
  return('');
 }
}

# エラーメッセージを書き込む。
sub write_error_message {
 my $self = $_[0];
 my $error_message = $_[1];
 
 $self -> {'ERROR_message'} = $error_message;
 
 if(defined($self -> {'telnet'})){
  my $ref_buffer = $self -> {'telnet'} -> buffer;
  if(defined($ref_buffer) && (length($$ref_buffer) > 0)){
   $self -> {'ERROR_message'} .= "\n\n" . '---------- buffer ----------' . "\n" . $$ref_buffer;
  }
 }
 
 $self -> {'last_OK_NG'} = -1;
}

# エラ－メッセージを取得する。
sub get_error_message {
 my $self = $_[0];
 my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('Error Message');
 
 return("\n\n\n" . $log_start . "\n". $self -> {'ERROR_message'} . "\n" . $log_end . "\n");
}

# エラーメッセージを空にする。
sub clear_error_message {
 my $self = $_[0];
 $self -> {'ERROR_message'} = '';
}

# ログを取得する。
sub get_log {
 my $self = $_[0];
 return($self -> {'LOG'});
}

# トラックログを更新する。
sub push_track_log {
 my $self = $_[0];
 my $x = $_[1];
 my $y = $_[2];
 my $routine_index = $self -> get_routine_index;
 
 $self -> {'x'} = $x;
 $self -> {'y'} = $y;
 $self -> {'z'} = $routine_index;
 
 push(@{$self -> {'TRACK'}}, [$x, $y, $routine_index]);
}

# トラックログを出力する。
sub get_track_log {
 my $self = $_[0];
 my $track_log = '';
 
 foreach my $ref_xyz (@{$self -> {'TRACK'}}){
  $track_log .= join(',' , @$ref_xyz) . "\n";
 }
 
 return($track_log);
}


#
# telnet 合計時間とtelnet 済み台数を更新する。
#
sub update_counter {
 my $self = $_[0];
 my $start_time = $self -> {'start_time'};
 my $end_time   = time;
 
 $self -> {'total_time'}   += $end_time - $start_time + 1;
 $self -> {'total_number'} += 1;
}



#
# node status を決定する。
#
sub node_status {
 my $self = $_[0];
 my $OK_NG = $self -> {'last_OK_NG'};
 my $node = $self -> get_node;
 
 my $node_status = 4;
 
 if($OK_NG == 0){
  $node_status = 5;
 }
 elsif($OK_NG == -1){
  $node_status = 8;
 }
 
 if(($node_status == 4) && ($self -> {'status6_flag'} == 1)){
  $node_status = 6;
 }
 
 return($node_status);
}



#
# かかった時間とtelnet した台数。
#
sub total_time {
 my $self = $_[0];
 my $total_time = $self -> {'total_time'};
 return($total_time);
}

sub total_number {
 my $self = $_[0];
 my $total_number = $self -> {'total_number'};
 return($total_number);
}



#
# diff を実行する。
#
sub exec_diff {
 my $self = $_[0];
 my $header_1 = $self -> insert_skeleton_values($self -> {'diff_values'} -> {'header_1'});
 my $header_2 = $self -> insert_skeleton_values($self -> {'diff_values'} -> {'header_2'});
 my $value_1  = $self -> insert_skeleton_values_6($self -> {'diff_values'} -> {'value_1'});
 my $value_2  = $self -> insert_skeleton_values_6($self -> {'diff_values'} -> {'value_2'});
 
 if(defined($header_1) && defined($header_2) && defined($value_1) && defined($value_2)){
  $header_1 =~ s/_BLANK_//g;
  $header_2 =~ s/_BLANK_//g;
  $value_1 =~ s/_BLANK_//g;
  $value_2 =~ s/_BLANK_//g;
  $header_1 =~ s/_DUMMY_//g;
  $header_2 =~ s/_DUMMY_//g;
  
  my $diff_header = '';
  if((length($header_1) > 0) && (length($header_2) > 0)){
   $diff_header = $header_1 . ' <=== diff ===> ' . $header_2;
  }
  
  my $diff_log = &Text::Diff::diff(\$value_1, \$value_2, {STYLE => 'Table'});
  if(length($diff_log) == 0){
   $diff_log = 'No difference.';
  }
  
  return($diff_header, $diff_log);
 }
 else{
  return(undef);
 }
}



#
# 任意ログを作成する。(ヘッダー)
#
sub make_optional_log_header {
 my $self = $_[0];
 my $optional_log_header = $self -> insert_skeleton_values($self -> {'optional_log_values'} -> {'optional_log_header'});
 
 if(defined($optional_log_header)){
  $optional_log_header =~ s/_BLANK_//g;
  $optional_log_header =~ s/_DUMMY_//g;
 }
 
 return($optional_log_header);
}

#
# 任意ログを作成する。(値)
#
sub make_optional_log_value {
 my $self = $_[0];
 my $optional_log_value = $self -> insert_skeleton_values_6($self -> {'optional_log_values'} -> {'optional_log_value'});
 
 return($optional_log_value);
}


#
# diff, 任意ログのスケルトンを埋める。
#
sub insert_skeleton_values_6 {
 my $self   = $_[0];
 my $string = $_[1];
 my $complete_string = '';
 
 if(($string =~ /\{\*:.+?\}/) || ($string =~ /\{\$B\}/)){
  my $round = 0;
  my $continue = $self -> shift_B($round);
  
  while($continue == 1){
   my $complete_string_line = $self -> insert_skeleton_values($string);
   
   if(defined($complete_string_line)){
    if(length($complete_string) > 0 && ($complete_string !~ /\n$/)){
     $complete_string .= "\n";
    }
    
    $complete_string .= $complete_string_line;
   }
   else{
    $complete_string = undef;
    last;
   }
   
   $round ++;
   $continue = $self -> shift_B($round);
  }
 }
 else{
  $complete_string = $self -> insert_skeleton_values($string);
 }
 
 if(defined($complete_string)){
  $complete_string =~ s/\r//g;
  $complete_string =~ s/_BLANK_//g;
  $complete_string =~ s/_DUMMY_//g;
  $complete_string =~ s/_LF_/\n/g;
 }
 
 return($complete_string);
}

1;
