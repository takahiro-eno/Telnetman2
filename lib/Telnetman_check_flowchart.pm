#!/usr/bin/perl
# 説明   : 流れ図内のコマンド情報を全て読みだす。
# 作成日 : 2014/08/06
# 作成者 : 江野高広
# 更新 2015/11/09 : user, password, enable_password も変数として使えるように。
# 更新 2015/11/30 : iOperator, iCount を追加。
# 更新 2016/05/23 : 変換スクリプトがアップロードされていなかったら警告する。
#      2017/10/27 : Ver2 に向けて大幅に更新。
# 更新 2018/05/16 : Begin, End 機能の追加。

use strict;
use warnings;

package Telnetman_check_flowchart;

use JSON;

use lib '/usr/local/Telnetman2/lib';
use Common_sub;
use Common_system;

sub new {
 my $self = $_[0];
 my $access2db = $_[1];
 
 my %parameter_list = (
  'access2db' => $access2db,
  'item_type' => '',
  'item_id' => '',
  'flowchart' => undef,
  'routine_repeat_type' => undef,
  'item' => {
   'command' => {},
   'action'  => {},
   'ping'    => {}
  },
  'item_repeat_type' => {
   'command' => {},
   'action'  => {},
   'ping'    => {}
  },
  'item_title' => {
   'command' => {},
   'action'  => {},
   'ping'    => {}
  },
  'missing_data_list' => []
 );
 
 bless(\%parameter_list, $self);
}


#
# 流れ図を受け取って連想配列にする。
#
sub set_flowchart {
 my $self = $_[0];
 my $json_flowchart = $_[1];
 
 $self -> {'flowchart'} = &JSON::from_json($json_flowchart);
}


#
# ルーチンの繰り返しタイプを受け取って連想配列にする。
#
sub set_routine_repeat_type {
 my $self = $_[0];
 my $json_routine_repeat_type = $_[1];
 
 $self -> {'routine_repeat_type'} = &JSON::from_json($json_routine_repeat_type);
}


#
# コマンド一覧を取り出す。
#
sub get_item_json {
 my $self = $_[0];
 return($self -> {'item'});
}


#
# コマンドの繰り返し型一覧を取り出す。
#
sub get_item_repeat_type {
 my $self = $_[0];
 return($self -> {'item_repeat_type'});
}


#
# コマンドタイトル一覧を取り出す。
#
sub get_item_title {
 my $self = $_[0];
 return($self -> {'item_title'});
}

#
# 流れ図内のコマンドのデータを全て読みだす。
#
sub parse_flowchart {
 my $self = $_[0];
 my %checked_sub_list = ();
 
 foreach my $main_row (@{$self -> {'flowchart'} -> {0}}){
  foreach my $main_col (@$main_row){
   unless(defined($main_col) && (length($main_col) > 0)){
    next;
   }
   
   my ($item_type, $item_id) = split(/\s/, $main_col);
   $self -> {'item_type'} = $item_type;
   $self -> {'item_id'}   = $item_id;
   
   if($item_type eq 'jumper'){
    next;
   }
   elsif(($item_type eq 'sub') && (exists($checked_sub_list{$item_id}))){
    next;
   }
   elsif($item_type eq 'sub'){
    my $routine = $item_id;
    $checked_sub_list{$routine} = 1;
    
    foreach my $sub_row (@{$self -> {'flowchart'} -> {$routine}}){
     foreach my $sub_col (@$sub_row){
      unless(defined($sub_col) && (length($sub_col) > 0)){
       next;
      }
      
      ($item_type, $item_id) = split(/\s/, $sub_col);
      $self -> {'item_type'} = $item_type;
      $self -> {'item_id'}   = $item_id;
      
      if($item_type eq 'jumper'){
       next;
      }
      else{
       &Telnetman_check_flowchart::get_item_data($self);
      }
     }
    }
   }
   else{
    &Telnetman_check_flowchart::get_item_data($self);
   }
  }
 }
}


#
# 指定されたアイテムのデータを取り出す。
#
sub get_item_data {
 my $self      = $_[0];
 my $item_type = $self -> {'item_type'};
 my $item_id   = $self -> {'item_id'};
 
 unless(exists($self -> {'item'} -> {$item_type} -> {$item_id})){
  $self -> {'item'} -> {$item_type} -> {$item_id} = {};
  my $access2db = $self -> {'access2db'};
  
  my $select_column = &Telnetman_check_flowchart::select_column($self);
  my $table         = &Telnetman_common::table($item_type);
  my $id_column     = &Telnetman_common::id_column($item_type);
  my $condition     = 'where ' . $id_column . " = '" . $item_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $ref_item_data = $access2db -> select_cols;
  
  if(scalar(@$ref_item_data) > 0){
   &Telnetman_check_flowchart::stor_item_data($self, $ref_item_data);
  }
  else{
   push(@{$self -> {'missing_data_list'}}, $item_type . ' ' . $item_id);
  }
 }
}


#
# コマンドデータを取り出すためのカラム指定を行う。
#
sub select_column {
 my $self      = $_[0];
 my $item_type = $self -> {'item_type'};
 my $select_column = 'vcUserId,vcTitle,iRepeatType,vcComment';
 
 if($item_type eq 'command'){
  $select_column .= ',iWaitTime,iConftEnd,txCommand,iCommandType,txDummyReturn,iPromptChecker,iStore';
 }
 elsif($item_type eq 'action'){
  $select_column .= ',vcBeginWord,iPipeType,vcPipeWord,vcEndWord,vcPattern,vcScriptId,txConditions,iNot,iOperator,iCount,vcNgMessage,txParameterSheetA,txParameterSheetB,iDestroy';
 }
 elsif($item_type eq 'ping'){
  $select_column .= ',txTarget,iCount,iTimeout,iCondition,vcNgMessage';
 }
 
 return($select_column);
}



#
# コマンドデータを整形して格納する。
#
sub stor_item_data {
 my $self          = $_[0];
 my $ref_item_data = $_[1];
 my $item_type     = $self -> {'item_type'};
 my $item_id       = $self -> {'item_id'};
 
 my $user_id     = shift(@$ref_item_data);
 my $title       = shift(@$ref_item_data);
 my $repeat_type = shift(@$ref_item_data);
 my $comment     = shift(@$ref_item_data);
 
 $self -> {'item_title'}       -> {$item_type} -> {$item_id} = $title;
 $self -> {'item_repeat_type'} -> {$item_type} -> {$item_id} = $repeat_type + 0;
 $self -> {'item'}             -> {$item_type} -> {$item_id} -> {'owner'} = $user_id;
 $self -> {'item'}             -> {$item_type} -> {$item_id} -> {'comment'} = $comment;
 
 if($item_type eq 'command'){
  my $wait_time      = shift(@$ref_item_data);
  my $conft_end      = shift(@$ref_item_data);
  my $command        = shift(@$ref_item_data);
  my $command_type   = shift(@$ref_item_data);
  my $dummy_return   = shift(@$ref_item_data);
  my $prompt_checker = shift(@$ref_item_data);
  my $store_command  = shift(@$ref_item_data);
  
  $wait_time      += 0;
  $conft_end      += 0;
  $command_type   += 0;
  $prompt_checker += 0;
  $store_command  += 0;
  
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'wait_time'}      = $wait_time;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'conft_end'}      = $conft_end;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'command'}        = $command;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'command_type'}   = $command_type;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'dummy_return'}   = $dummy_return;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'prompt_checker'} = $prompt_checker;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'store_command'}  = $store_command;
 }
 elsif($item_type eq 'action'){
  my $begin_word = shift(@$ref_item_data);
  my $pipe_type  = shift(@$ref_item_data);
  my $pipe_word  = shift(@$ref_item_data);
  my $end_word   = shift(@$ref_item_data);
  my $pattern    = shift(@$ref_item_data);
  my $script_id  = shift(@$ref_item_data);
  my $conditions = shift(@$ref_item_data);
  my $not        = shift(@$ref_item_data);
  my $operator   = shift(@$ref_item_data);
  my $count      = shift(@$ref_item_data);
  my $ng_message = shift(@$ref_item_data);
  my $json_parameter_sheet_A = shift(@$ref_item_data);
  my $json_parameter_sheet_B = shift(@$ref_item_data);
  my $destroy    = shift(@$ref_item_data);
  
  $not       += 0;
  $operator  += 0;
  $count     += 0;
  $pipe_type += 0;
  $destroy   += 0;
  
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'begin_word'} = $begin_word;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'pipe_type'}  = $pipe_type;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'pipe_word'}  = $pipe_word;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'end_word'}   = $end_word;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'pattern'}    = $pattern;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'script_id'}  = $script_id;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'conditions'} = &JSON::from_json($conditions);
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'not'}        = $not;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'operator'}   = $operator;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'count'}      = $count;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'ng_message'} = $ng_message;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'parameter_sheet_A'} = &JSON::from_json($json_parameter_sheet_A);
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'parameter_sheet_B'} = &JSON::from_json($json_parameter_sheet_B);
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'destroy'}  = $destroy;
 }
 elsif($item_type eq 'ping'){
  my $target    = shift(@$ref_item_data);
  my $count     = shift(@$ref_item_data);
  my $timeout   = shift(@$ref_item_data);
  my $condition = shift(@$ref_item_data);
  my $ng_message = shift(@$ref_item_data);
  
  $count     += 0;
  $timeout   += 0;
  $condition += 0;
  
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'target'}     = $target;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'count'}      = $count;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'timeout'}    = $timeout;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'condition'}  = $condition;
  $self -> {'item'} -> {$item_type} -> {$item_id} -> {'ng_message'} = $ng_message;
 }
}


#
# 流れ図が正しく書かれているか確認する。
#
sub check_flowchart {
 my $self = $_[0];
 my @message_list = ();
 
 foreach my $main_row (@{$self -> {'flowchart'} -> {0}}){
  foreach my $main_col (@$main_row){
   unless(defined($main_col) && (length($main_col) > 0)){
    next;
   }
   
   my ($item_type, $item_id) = split(/\s/, $main_col);
   $self -> {'item_type'} = $item_type;
   $self -> {'item_id'}   = $item_id;
   
   if($item_type eq 'jumper'){
    next;
   }
   elsif($item_type eq 'sub'){
    my $routine = $item_id;
    
    foreach my $sub_row (@{$self -> {'flowchart'} -> {$routine}}){
     foreach my $sub_col (@$sub_row){
      unless(defined($sub_col) && (length($sub_col) > 0)){
       next;
      }
      
      ($item_type, $item_id) = split(/\s/, $sub_col);
      $self -> {'item_type'} = $item_type;
      $self -> {'item_id'}   = $item_id;
      
      if($item_type eq 'jumper'){
       next;
      }
      else{
       push(@message_list, &Telnetman_check_flowchart::check_item($self, $routine));
      }
     }
    }
   }
   else{
    push(@message_list, &Telnetman_check_flowchart::check_item($self, 0));
   }
  }
 }
 
 return(@message_list);
}


#
# コマンド、アクションが正しく書けているか確認する。
#
sub check_item {
 my $self    = $_[0];
 my $routine = $_[1];
 my $item_type = $self -> {'item_type'};
 my $item_id   = $self -> {'item_id'};
 my $main_routine_repeat_type = $self -> {'routine_repeat_type'} -> {0};
 my $routine_repeat_type      = $self -> {'routine_repeat_type'} -> {$routine};
 my $item_title       = $self -> {'item_title'}       -> {$item_type} -> {$item_id};
 my $item_repeat_type = $self -> {'item_repeat_type'} -> {$item_type} -> {$item_id};
 
 my @message_list = ();
 
 if($item_type eq 'command'){
  my $ref_skeleton_list_comment      = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'comment'});
  my $ref_skeleton_list_command      = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'command'});
  my $ref_skeleton_list_dummy_return = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'dummy_return'});
  
  my @message_list_comment      = &Telnetman_check_flowchart::check_pattern_13($ref_skeleton_list_comment,      $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'コメント');
  my @message_list_command      = &Telnetman_check_flowchart::check_pattern_12($ref_skeleton_list_command,      $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'コマンド');
  my @message_list_dummy_return = &Telnetman_check_flowchart::check_pattern_12($ref_skeleton_list_dummy_return, $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'ダミー用コマンド結果');
 
  push(@message_list,
   @message_list_comment,
   @message_list_command,
   @message_list_dummy_return
  );
 }
 elsif($item_type eq 'action'){
  my $ref_skeleton_list_comment           = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'comment'});
  my $ref_skeleton_list_pipe_word         = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'pipe_word'});
  my $ref_skeleton_list_begin_word        = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'begin_word'});
  my $ref_skeleton_list_end_word          = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'end_word'});
  my $ref_skeleton_list_conditions        = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'conditions'});
  my $ref_skeleton_list_ng_message        = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'ng_message'});
  my $ref_skeleton_list_parameter_sheet_A = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'parameter_sheet_node'});
  my $ref_skeleton_list_parameter_sheet_B = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'parameter_sheet_interface'});
  my $script_id = $self -> {'item'} -> {$item_type} -> {$item_id} -> {'script_id'};
  
  my @message_list_comment           = &Telnetman_check_flowchart::check_pattern_13(  $ref_skeleton_list_comment,           $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'コメント');
  my @message_list_pipe_word         = &Telnetman_check_flowchart::check_pattern_12(  $ref_skeleton_list_pipe_word,         $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'include/exclude');
  my @message_list_begin_word        = &Telnetman_check_flowchart::check_pattern_12(  $ref_skeleton_list_begin_word,        $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'begin');
  my @message_list_end_word          = &Telnetman_check_flowchart::check_pattern_12(  $ref_skeleton_list_end_word,          $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'end');
  my @message_list_conditions        = &Telnetman_check_flowchart::check_pattern_12(  $ref_skeleton_list_conditions,        $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, '分岐条件');
  my @message_list_ng_message        = &Telnetman_check_flowchart::check_pattern_34(  $ref_skeleton_list_ng_message,                  $item_type,                                                            $item_title,                    'NGメッセージ');
  my @message_list_parameter_sheet_A = &Telnetman_check_flowchart::check_pattern_1234($ref_skeleton_list_parameter_sheet_A, $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, '追加パラメーターシートA');
  my @message_list_parameter_sheet_B = &Telnetman_check_flowchart::check_pattern_1234($ref_skeleton_list_parameter_sheet_B, $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, '追加パラメーターシートB)');
  
  push(@message_list,
   @message_list_comment,
   @message_list_begin_word,
   @message_list_pipe_word,
   @message_list_end_word,
   @message_list_conditions,
   @message_list_ng_message,
   @message_list_parameter_sheet_A,
   @message_list_parameter_sheet_B
  );
  
  if(length($script_id) > 0){
   unless(-f (&Common_system::dir_conversion_script() . '/' . $script_id . '.pl')){
    push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, '変換スクリプト', $script_id . '.pl', 'アップロードされていません。'));
   }
  }
 }
 elsif($item_type eq 'ping'){
  my $ref_skeleton_list_comment    = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'comment'});
  my $ref_skeleton_list_target     = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'target'});
  my $ref_skeleton_list_ng_message = &Telnetman_check_flowchart::pickout_skeleton($self -> {'item'} -> {$item_type} -> {$item_id} -> {'ng_message'});
  
  my @message_list_comment    = &Telnetman_check_flowchart::check_pattern_13($ref_skeleton_list_comment,    $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'コメント');
  my @message_list_target     = &Telnetman_check_flowchart::check_pattern_1( $ref_skeleton_list_target,     $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, '対象');
  my @message_list_ng_message = &Telnetman_check_flowchart::check_pattern_13($ref_skeleton_list_ng_message, $routine, $item_type, $item_id, $main_routine_repeat_type, $routine_repeat_type, $item_title, $item_repeat_type, 'NGメッセージ');
 
  push(@message_list,
   @message_list_comment, 
   @message_list_target,
   @message_list_ng_message
  );
 }
 
 return(@message_list);
}



#
# 入力項目の確認
#
sub check_pattern_1 {
 my $ref_skeleton_list        = $_[0];
 my $routine                  = $_[1];
 my $item_type                = $_[2];
 my $item_id                  = $_[3];
 my $main_routine_repeat_type = $_[4];
 my $routine_repeat_type      = $_[5];
 my $item_title               = $_[6];
 my $item_repeat_type         = $_[7];
 my $sub_item                 = $_[8];
 
 my @message_list = ();
 
 foreach my $skeleton (@$ref_skeleton_list) {
  if(($routine == 0) && ($skeleton =~ /^#/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチン内で{#1},{#2},{#3},... {#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 1) && ($skeleton =~ /^#\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型サブルーチン内で{#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 2) && ($skeleton =~ /^#[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型サブルーチン内で{#1},{#2},{#3},... は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton =~ /^\*:.+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{*:変数名} は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton eq '$B')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{$B} は使えません。'));
  }
  elsif(($item_repeat_type == 1) && ($skeleton =~ /^\$\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型で{$*} は使えません。'));
  }
  elsif(($item_repeat_type == 2) && ($skeleton =~ /^\$[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型で{$1},{$2},{$3},... は使えません。'));
  }
  elsif(($skeleton =~ /^\$/) && ($skeleton !~ /^\$[1-9][0-9]*$/) && ($skeleton ne '$*') && ($skeleton ne '$B') && ($skeleton ne '$node')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '$ で始まる変数は{$1},{$2},{$3},... {$*} {$B} {$node} 以外使えません'));
  }
  else{
   my @colon_list = $skeleton =~ /:/g;
   if(scalar(@colon_list) > 1){
    push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '区切り文字「:」が使えるのは1回だけです。'));
   }
  }
 }
 
 return(@message_list);
}

sub check_pattern_12 {
 my $ref_skeleton_list        = $_[0];
 my $routine                  = $_[1];
 my $item_type                = $_[2];
 my $item_id                  = $_[3];
 my $main_routine_repeat_type = $_[4];
 my $routine_repeat_type      = $_[5];
 my $item_title               = $_[6];
 my $item_repeat_type         = $_[7];
 my $sub_item                 = $_[8];
 
 my @message_list = ();
 
 foreach my $skeleton (@$ref_skeleton_list) {
  if(($routine == 0) && ($skeleton =~ /^#/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチン内で{#1},{#2},{#3},... {#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 1) && ($skeleton =~ /^#\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型サブルーチン内で{#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 2) && ($skeleton =~ /^#[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型サブルーチン内で{#1},{#2},{#3},... は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton =~ /^\*:.+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{*:変数名} は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton eq '$B')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{$B} は使えません。'));
  }
  elsif(($item_repeat_type == 1) && ($skeleton =~ /^\$\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型で{$*} は使えません。'));
  }
  elsif(($item_repeat_type == 2) && ($skeleton =~ /^\$[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型で{$1},{$2},{$3},... は使えません。'));
  }
  elsif(($skeleton =~ /^\$/) && ($skeleton !~ /^\$[1-9][0-9]*$/) && ($skeleton ne '$*') && ($skeleton ne '$node') && ($skeleton ne '$user') && ($skeleton ne '$password') && ($skeleton ne '$enable_password') && ($skeleton ne '$promt') && ($skeleton ne '$B')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '$ で始まる変数は{$1},{$2},{$3},... {$*} {$node} {$user} {$password} {$enable_password} {$prompt} {$B} 以外使えません'));
  }
  else{
   my @colon_list = $skeleton =~ /:/g;
   if(scalar(@colon_list) > 1){
    push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '区切り文字「:」が使えるのは1回だけです。'));
   }
  }
 }
 
 return(@message_list);
}

sub check_pattern_13 {
 my $ref_skeleton_list        = $_[0];
 my $routine                  = $_[1];
 my $item_type                = $_[2];
 my $item_id                  = $_[3];
 my $main_routine_repeat_type = $_[4];
 my $routine_repeat_type      = $_[5];
 my $item_title               = $_[6];
 my $item_repeat_type         = $_[7];
 my $sub_item                 = $_[8];
 
 my @message_list = ();
 
 foreach my $skeleton (@$ref_skeleton_list) {
  if(($routine == 0) && ($skeleton =~ /^#/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチン内で{#1},{#2},{#3},... {#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 1) && ($skeleton =~ /^#\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型サブルーチン内で{#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 2) && ($skeleton =~ /^#[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型サブルーチン内で{#1},{#2},{#3},... は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton =~ /^\*:.+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{*:変数名} は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton eq '$B')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{$B} は使えません。'));
  }
  elsif(($item_repeat_type == 1) && ($skeleton =~ /^\$\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型で{$*} は使えません。'));
  }
  elsif(($item_repeat_type == 2) && ($skeleton =~ /^\$[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型で{$1},{$2},{$3},... は使えません。'));
  }
  elsif(($skeleton =~ /^\$/) && ($skeleton !~ /^\$[1-9][0-9]*$/) && ($skeleton ne '$*') && ($skeleton ne '$node') && ($skeleton ne '$B') && ($skeleton ne '$title')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '$ で始まる変数は{$1},{$2},{$3},... {$*} {$node} {$B} {$title} 以外使えません'));
  }
  else{
   my @colon_list = $skeleton =~ /:/g;
   if(scalar(@colon_list) > 1){
    push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '区切り文字「:」が使えるのは1回だけです。'));
   }
  }
 }
 
 return(@message_list);
}

sub check_pattern_34 {
 my $ref_skeleton_list = $_[0];
 my $item_type         = $_[1];
 my $item_title        = $_[2];
 my $sub_item          = $_[3];
 
 my @message_list = ();
 
 foreach my $skeleton (@$ref_skeleton_list) {
  unless(($skeleton eq '$title') || ($skeleton eq '$command') || ($skeleton eq '$pattern') || ($skeleton eq '$condition') || ($skeleton eq '$n')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '{$title} {$command} {$pattern} {$condition} {$n}以外は使えません。'));
  }
 }
 
 return(@message_list);
}

sub check_pattern_1234 {
 my $ref_skeleton_list        = $_[0];
 my $routine                  = $_[1];
 my $item_type                = $_[2];
 my $item_id                  = $_[3];
 my $main_routine_repeat_type = $_[4];
 my $routine_repeat_type      = $_[5];
 my $item_title               = $_[6];
 my $item_repeat_type         = $_[7];
 my $sub_item                 = $_[8];
 
 my @message_list = ();
 
 foreach my $skeleton (@$ref_skeleton_list) {
  if(($routine == 0) && ($skeleton =~ /^#/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチン内で{#1},{#2},{#3},... {#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 1) && ($skeleton =~ /^#\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型サブルーチン内で{#*} は使えません。'));
  }
  elsif(($routine > 0) && ($routine_repeat_type == 2) && ($skeleton =~ /^#[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型サブルーチン内で{#1},{#2},{#3},... は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton =~ /^\*:.+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{*:変数名} は使えません。'));
  }
  elsif(($main_routine_repeat_type == 1) && ($skeleton eq '$B')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', 'メインルーチンが1回のみ実行型の場合{$B} は使えません。'));
  }
  elsif(($item_repeat_type == 1) && ($skeleton =~ /^\$\*$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '1回のみ実行型で{$*} は使えません。'));
  }
  elsif(($item_repeat_type == 2) && ($skeleton =~ /^\$[0-9]+$/)){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '繰り返し実行型で{$1},{$2},{$3},... は使えません。'));
  }
  elsif(($skeleton =~ /^\$/) && ($skeleton !~ /^\$[1-9][0-9]*$/) && ($skeleton ne '$*') && ($skeleton ne '$node') && ($skeleton ne '$user') && ($skeleton ne '$password') && ($skeleton ne '$enable_password') && ($skeleton ne '$promt') && ($skeleton ne '$B') && ($skeleton ne '$title') || ($skeleton ne '$command') || ($skeleton ne '$pattern') || ($skeleton ne '$condition') || ($skeleton ne '$n')){
   push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '$ で始まる変数は{$1},{$2},{$3},... {$*} {$node} {$user} {$password} {$enable_password} {$prompt} {$B} {$title} {$command} {$pattern} {$condition} {$n} 以外使えません'));
  }
  else{
   my @colon_list = $skeleton =~ /:/g;
   if(scalar(@colon_list) > 1){
    push(@message_list, &Telnetman_check_flowchart::make_message($item_type, $item_title, $sub_item, '{' . $skeleton . '}', '区切り文字「:」が使えるのは1回だけです。'));
   }
  }
 }
 
 return(@message_list);
}



#
# スケルトンを取り出す。
#
sub pickout_skeleton {
 my $ref_string_list = $_[0];
 my @skeleton_list = ();
 my @strings = ();
 
 if(ref($ref_string_list) eq 'ARRAY'){
  if(ref($ref_string_list -> [0]) eq 'ARRAY'){
   foreach my $ref_strings (@$ref_string_list) {
    foreach my $string (@$ref_strings) {
     if(defined($string)){
      push(@strings, $string);
     }
    }
   }
  }
  else{
   foreach my $string (@$ref_string_list){
    if(defined($string)){
     push(@strings, $string);
    }
   }
  }
 }
 elsif(defined($ref_string_list)){
  push(@strings, $ref_string_list);
 }
 
 foreach my $string (@strings){
  my @split_string = split(//, $string);
  my @stack = ();
  
  my $flag_escape = 0;
  STACK : foreach my $character (@split_string){
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
    my $poped_character = '';
    my $joined_character = '';
    while($poped_character ne '{'){
     $joined_character = $poped_character . $joined_character;
     
     if(scalar(@stack) == 0){
      push(@stack, $joined_character);
      next STACK;
     }
     
     $poped_character = pop(@stack);
    }
    
    push(@stack, '{' . $joined_character . '}');
    push(@skeleton_list, $joined_character);
   }
   else{
    push(@stack, $character);
   }
  }
 }
 
 return(\@skeleton_list);
}


#
# 流れ図内に指定されていた登録の無いコマンド一覧を返す。
#
sub check_missing_data {
 my $self = $_[0];
 return(@{$self -> {'missing_data_list'}});
}


#
# エラーメッセージを見やすい形で作る。
#
sub make_message {
 my $item_type  = $_[0];
 my $item_title = $_[1];
 my $sub_item   = $_[2];
 my $missing    = $_[3];
 my $message    = $_[4];
 
 my $item = '';
 if($item_type eq 'command'){
  $item = 'コマンド';
 }
 elsif($item_type eq 'action'){
  $item = 'アクション';
 }
 
 my $body = '------------------------------' . "\n" .
            '[ ' . $item . ' ]' . "\n" .
            ' タイトル   : ' . $item_title . "\n" .
            ' 項目       : ' . $sub_item . "\n" .
            ' エラー箇所 : ' . $missing . "\n" .
            ' エラー内容 : ' . $message . "\n";
 
 return($body);
}

1;
