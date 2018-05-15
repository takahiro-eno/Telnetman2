#!/usr/bin/perl
# 説明   : queue にたまったtelnet 実行の依頼を実行する。
# 作成者 : 江野高広
# 作成日 : 2014/08/29
#
# 更新   : 2014/12/24 iCountOfNode, iExpectedTime, iStartTime の更新とrrd ファイルの更新部分を追加。
# 更新   : 2015/01/09 自動一時停止機能の追加。
#        : 2015/10/23 syslog 検出機能追加。
#        : 2017/10/31 Ver2 に向けて更新。
#        : 2018/01/19 $ref_child_process_list の扱いの誤りを修正。

use strict;
use warnings;

use Getopt::Long;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Access2DB;
use Telnetman_telnet;
use Telnetman_common;
use Common_sub;
use Common_system;



#
# wait 時間を取得して待機。
#
my $wait_time = 0;

&Getopt::Long::GetOptions(
 'wait=i' => \$wait_time
);

if($wait_time > 0){
 sleep($wait_time);
}



#
# 現在時刻
#
my $time = time;



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
$access2db -> log_file(&Common_system::file_sql_log());



#
# T_Queue の内容を全部取得する。
#
my $select_column = 'vcSessionId';
my $table     = 'T_Queue';
my $condition = 'order by iQueueIndex';
$access2db -> set_select($select_column, $table, $condition);
my $ref_session_id_list = $access2db -> select_array_col1;

if(scalar(@$ref_session_id_list) == 0){
 $access2db -> close;
 exit(0);
}



#
# 実行可能な子プロセス一覧を取得する。
#
$select_column = 'iChildProcessIndex,iChildProcessStatus';
$table     = 'T_ChildProcess';
$condition = 'where iChildProcessStatus = 0 order by iChildProcessIndex';
$access2db -> set_select($select_column, $table, $condition);
my $ref_child_process_status_list = $access2db -> select_hash_col2;

my @child_process_index_list = ();
while(my ($child_process_index, $child_process_status) = each(%$ref_child_process_status_list)){
 push(@child_process_index_list, $child_process_index);
}

my $N = scalar(@child_process_index_list);
if($N == 0){
 $access2db -> write_log(&Telnetman_common::prefix_log('root'));
 $access2db -> close;
 exit(0);
}



#
# セッション毎の待機中ノード一覧
# セッションのデバッグモード、合計telnet 時間、合計telnet 数一覧
# を作る。
#
my %all_node_list = ();
my %session_info_list = ();
foreach my $session_id (@$ref_session_id_list){
 $select_column = 'vcIpAddress';
 $table     = 'T_NodeStatus';
 $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 2 order by iNodeIndex";
 $access2db -> set_select($select_column, $table, $condition);
 $all_node_list{$session_id} = $access2db -> select_array_col1;

 $select_column = 'iTotalTime,iTotalNumber';
 $table     = 'T_SessionStatus';
 $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 $session_info_list{$session_id} = $access2db -> select_cols;
}



#
# 今回telnet の対象とするセッションとノードの選定を行う。
#
my @target_session_id_list = ();
my @target_node_list = ();
my @total_expected_time_list = ();
my @count_of_node_list = ();
my %expected_time_list = ();
my @child_index_list = ();
for(my $i = 0; $i < $N; $i ++){
 $target_session_id_list[$i] = [];
 $target_node_list[$i] = {};
 $total_expected_time_list[$i] = 0;
 $count_of_node_list[$i] = 0;
 push(@child_index_list, $i);
}

SESSION : foreach my $session_id (@$ref_session_id_list){
 my $total_time   = $session_info_list{$session_id} -> [0];
 my $total_number = $session_info_list{$session_id} -> [1];

 my $expected_time = int($total_time / $total_number);
 if($expected_time == 0){
  $expected_time = 1;
 }

 NODE : while(scalar(@{$all_node_list{$session_id}}) > 0){
  my $node = shift(@{$all_node_list{$session_id}});

  PROCESS : for(my $count = 0; $count < $N; $count ++){
   my $i = shift(@child_index_list);

   if($expected_time < 50){
    if($total_expected_time_list[$i] + $expected_time < 50){
     if(exists($target_node_list[$i] -> {$session_id})){
      push(@{$target_node_list[$i] -> {$session_id}}, $node);
     }
     else{
      $target_node_list[$i] -> {$session_id} = [$node];
      push(@{$target_session_id_list[$i]}, $session_id);
      $expected_time_list{$session_id} = $expected_time;
     }

     $total_expected_time_list[$i] += $expected_time;
     $count_of_node_list[$i] ++;

     push(@child_index_list, $i);

     next NODE;
    }

    push(@child_index_list, $i);
   }
   else{
    # telnet 継続時間が長いセッションが全てのプロセスを専有するのを防ぐため、最初のプロセスには割り当てない。
    if($i == 0){
     push(@child_index_list, $i);
     next PROCESS;
    }

    if($total_expected_time_list[$i] < 50){
     if(exists($target_node_list[$i] -> {$session_id})){
      push(@{$target_node_list[$i] -> {$session_id}}, $node);
     }
     else{
      $target_node_list[$i] -> {$session_id} = [$node];
      push(@{$target_session_id_list[$i]}, $session_id);
      $expected_time_list{$session_id} = $expected_time;
     }

     $total_expected_time_list[$i] += $expected_time;
     $count_of_node_list[$i] ++;

     push(@child_index_list, $i);

     next NODE;
    }

    push(@child_index_list, $i);
   }
  }

  unshift(@{$all_node_list{$session_id}}, $node);
  next SESSION;
 }
}



#
# telnet 対象ノードのステータスを「実行中」にする。
#
for(my $i = 0; $i < $N; $i ++){
 while(my ($session_id, $ref_node_list) = each(%{$target_node_list[$i]})){
 my @node_list= @$ref_node_list;
  foreach my $node (@node_list){
   $node = &Common_sub::escape_sql($node);
  }

  my @set = ('iNodeStatus = 3');
  my $table     = 'T_NodeStatus';
  my $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 2 and vcIpAddress in ('" . join("','", @node_list) . "')";
  $access2db -> set_update(\@set, $table, $condition);
  $access2db -> update_exe;
 }
}



#
# セッションステータスの更新とqueue index の振り直し。
#
my @typeA_session_list = ();# 1つのノードも子プロセスの仕事に割り当てられなかったセッション
my @typeB_session_list = ();# 一部のノードが子プロセスの仕事に割り当てられたセッション
my @tooBig_session_list = ();# typeB と基本は同じ。1ノードあたりの平均telnet 時間が50秒以上のもの。
my @typeC_session_list = ();# 全てのノードが子プロセスの仕事に割り当てられたセッション
foreach my $session_id (@$ref_session_id_list){
 if(exists($expected_time_list{$session_id})){
  if(scalar(@{$all_node_list{$session_id}}) == 0){
   push(@typeC_session_list, $session_id);
  }
  else{
   if($expected_time_list{$session_id} < 50){
    push(@typeB_session_list, $session_id);
   }
   else{
    push(@tooBig_session_list, $session_id);
   }
  }
 }
 else{
  push(@typeA_session_list, $session_id);
 }
}

foreach my $session_id (@typeB_session_list, @tooBig_session_list){
 my @set = ('iSessionStatus = 2');
 my $table     = 'T_SessionStatus';
 my $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
}

foreach my $session_id (@typeC_session_list){
 my @set = ('iSessionStatus = 3');
 my $table     = 'T_SessionStatus';
 my $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
}

foreach my $session_id (@typeC_session_list){
 &main::delete_queue($access2db, $session_id);
}

my $queue_index = 1;
foreach my $session_id (@typeB_session_list, @typeA_session_list, @tooBig_session_list){
 my @set = ('iQueueIndex = ' . $queue_index);
 my $table     = 'T_Queue';
 my $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;

 $queue_index ++;
}



#
# 稼働の無い子プロセス分のデータを削除して稼働のある子プロセスのステータスを更新する。
#
for(my $i = $N - 1; $i >= 0; $i --){
 if($count_of_node_list[$i] == 0){
  splice(@child_process_index_list, $i, 1);
  splice(@target_session_id_list, $i, 1);
  splice(@target_node_list, $i, 1);
  splice(@total_expected_time_list, $i, 1);
  splice(@count_of_node_list, $i, 1);
  $N --;
 }
}

for(my $i = 0; $i < $N; $i ++){
 my $child_process_index = $child_process_index_list[$i];
 my $count_of_node = $count_of_node_list[$i];
 my $expected_time = $total_expected_time_list[$i];

 my @set = ('iChildProcessStatus = 1', 'iCountOfNode = ' . $count_of_node, 'iExpectedTime = ' . $expected_time, 'iStartTime = ' . $time);
 $table     = 'T_ChildProcess';
 $condition = 'where iChildProcessIndex = ' . $child_process_index;
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;

 $ref_child_process_status_list -> {$child_process_index} = 1;
}


$access2db -> write_log(&Telnetman_common::prefix_log('root'));
$access2db -> close;



#
# 子プロセスを生成してtelnet を実行させる。
#
my %fh_list = ();
for(my $i = 0; $i < $N; $i ++){
 my $fh;
 my $pid = open($fh, '-|');

 if($pid == 0){
  my $child_process_index = $child_process_index_list[$i];

  # 流れ図実行開始。
  my $telnet = Telnetman_telnet -> new();

  foreach my $session_id (@{$target_session_id_list[$i]}){
   $telnet -> set_session_id($session_id);
   my $make_optional_log = $telnet -> load_optional_log_values;
   my $optional_log_header = '';
   my $optional_log_value  = '';
   $telnet -> load_terminal_monitor;

   $telnet -> set_A_list($target_node_list[$i] -> {$session_id});
   $telnet -> load_parameter;

   my $start_status = 1;
   while($start_status != 0){
    ($start_status, my $start_time) = $telnet -> start_telnet;
    my $node = $telnet -> get_node;
    my $node_status = 3;
    
    if($start_status == 1){# ログイン成功
     my $result = 1;

     if($result == 1){
      $telnet -> load_flowchart_data('before');
      $result = $telnet -> exec_flowchart;
     }

     if($result == 1){
      $telnet -> load_flowchart_data('middle');
      $result = $telnet -> exec_flowchart;
     }

     if($result == 1){
      $telnet -> load_flowchart_data('after');
      $result = $telnet -> exec_flowchart;
     }

     my $log = '';

     if(($result == 1) || ($result == 0)){# OK 終了 or NG 終了
      $telnet -> end_telnet;
      $log  = $telnet -> get_log;

      if($result == 1){
       # diff を実行する。
       my $diff_exec = $telnet -> load_diff_values;
       if($diff_exec == 1){
        my ($diff_header, $diff_log) = $telnet -> exec_diff;

        if(defined($diff_header)){
         &Telnetman_common::make_diff_log($session_id, $node, $diff_header, $diff_log);
        }
        else{
         my $diff_error_mesage = $telnet -> get_error_message;
         &Telnetman_common::make_diff_log($session_id, $node, 'Diff Error.', $diff_error_mesage);
         $log .= $telnet -> get_error_message;
        }
       }

       # 任意ログを作成する。
       if($make_optional_log == 1){
        if(length($optional_log_header) == 0){
         my $_optional_log_header = $telnet -> make_optional_log_header;

         unless(defined($_optional_log_header)){
          $_optional_log_header = $telnet -> get_error_message;
          $log .= $telnet -> get_error_message;
         }

         $optional_log_header = $_optional_log_header
        }

        my $_optional_log_value = $telnet -> make_optional_log_value;

        unless(defined($_optional_log_value)){
         $_optional_log_value = $telnet -> get_error_message;
         $log .= $telnet -> get_error_message;
        }

        $optional_log_value .= $_optional_log_value;

        unless($optional_log_value =~ /\n$/){
         $optional_log_value .= "\n"
        }
       }
      }
      elsif($result == 0){
       $log .= $telnet -> get_NG_message;
      }

      my $NG_log = $telnet -> get_NG_log;
      if(length($NG_log) > 0){
       $log .= $NG_log;
      }
     }
     elsif($result == -1){# 異常終了
      $log  = $telnet -> get_log;
      $log .= $telnet -> get_error_message;
     }

     my $track_log = $telnet -> get_track_log;
     my $ref_additional_parameter_sheet = $telnet -> get_additional_parameter_sheet;

     $node_status = $telnet -> node_status;

     my $log_header = &Telnetman_common::make_telnet_log_header($node_status, $start_time);
     &Telnetman_common::make_telnet_log($session_id, $node, $log_header . $log);
     &Telnetman_common::make_track_log($session_id, $node, $track_log);
     &Telnetman_common::make_additional_parameter_sheet($session_id, $node, $ref_additional_parameter_sheet);
    }
    elsif($start_status == -1){# ログイン失敗
     my $log = $telnet -> get_log;
     $log .= $telnet -> get_error_message;

     $node_status = $telnet -> node_status;

     my $log_header = &Telnetman_common::make_telnet_log_header($node_status, $start_time);
     &Telnetman_common::make_telnet_log($session_id, $node, $log_header . $log);
    }
    
    $access2db = Access2DB -> open(@DB_connect_parameter_list);
    $access2db -> log_file(&Common_system::file_sql_log());
    
    # node status を更新する。
    &main::update_node_status($access2db, $session_id, $node, $node_status);
    
    # 自動一時停止
    &main::auto_pause($access2db, $session_id, $node_status);
    
    $access2db -> write_log(&Telnetman_common::prefix_log('root'));
    $access2db -> close;
   }

   # session status を更新する。
   $access2db = Access2DB -> open(@DB_connect_parameter_list);
   $access2db -> log_file(&Common_system::file_sql_log());
   
   my $total_time   = $telnet -> total_time();
   my $total_number = $telnet -> total_number();
   &Telnetman_common::update_session_status($access2db, $session_id, $total_time, $total_number);
   
   $access2db -> write_log(&Telnetman_common::prefix_log('root'));
   $access2db -> close;

   if($make_optional_log == 1){
    &Telnetman_common::make_optional_log($session_id, $optional_log_header, $optional_log_value);
   }
  }

  # telnet が終わった子プロセスであることをDB に記録する。
  $access2db = Access2DB -> open(@DB_connect_parameter_list);
  $access2db -> log_file(&Common_system::file_sql_log());
  &main::close_child_process($access2db, $child_process_index);
  $access2db -> write_log(&Telnetman_common::prefix_log('root'));
  $access2db -> close;
   
  print $child_process_index;

  exit(0);
 }
 else{
  $fh_list{$pid} = $fh;
 }
}



#
# 子プロセスの終了を確認する。
#
my $error_flag = 0;
for(my $i = 0; $i < $N; $i ++){
 my $pid = wait;

 if($pid == -1){
  $error_flag = 1;
  next;
 }

 my $fh = $fh_list{$pid};
 my $child_process_index = <$fh>;
 
 if(defined($child_process_index)){
  $ref_child_process_status_list -> {$child_process_index} = 0;
 }
 else{
  $error_flag = 1;
 }
 
 close($fh);
}



#
# 消滅した子プロセスがあった場合、消滅時のノードを異常終了とし、それ以降のノードを待機中にする。
#
if($error_flag == 1){
 $access2db = Access2DB -> open(@DB_connect_parameter_list);
 $access2db -> log_file(&Common_system::file_sql_log());
 
 for(my $i = 0; $i < $N; $i ++){
  my $child_process_index = $child_process_index_list[$i];
  if($ref_child_process_status_list -> {$child_process_index} == 1){
   my $found_flag = 0;

   foreach my $session_id (@{$target_session_id_list[$i]}){
    my $select_column = 'vcIpAddress';
    my $table     = 'T_NodeStatus';
    my $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 3 order by iNodeIndex";
    $access2db -> set_select($select_column, $table, $condition);
    my $ref_running_node_list = $access2db -> select_array_col1;

    if(scalar(@$ref_running_node_list) == 0){
     next;
    }

    # このプロセスが担当したノードで実行中のものを待機中にする。
    my $ref_node_list = $target_node_list[$i] -> {$session_id};
    my @escaped_node_list = ();
    foreach my $node (@$ref_node_list){
     my $escaped_node = &Common_sub::escape_sql($node);
     push(@escaped_node_list, $escaped_node);
    }
    
    my @set = ('iNodeStatus = 2');
    $table     = 'T_NodeStatus';
    $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 3 and vcIpAddress in ('" . join("','", @escaped_node_list) . "')";
    $access2db -> set_update(\@set, $table, $condition);
    $access2db -> update_exe;

    # 最初に見つけたノードをエラー終了したノードとする。
    if($found_flag == 0){
     my $error_node = shift(@$ref_running_node_list);
     my $error_escaped_node = &Common_sub::escape_sql($error_node);

     @set = ('iNodeStatus = 8');
     $table     = 'T_NodeStatus';
     $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 2 and vcIpAddress = '" . $error_escaped_node . "'";
     $access2db -> set_update(\@set, $table, $condition);
     $access2db -> update_exe;

     my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('Error Message');
     &Telnetman_common::make_telnet_log($session_id, $error_node, "\n" . $log_start . "\nプロセスが消滅しました。\n" . $log_end . "\n");

     $found_flag = 1;
    }
    
    # セッションステータスの更新。
    my $session_status = &Telnetman_common::update_session_status($access2db, $session_id);
    
    # 新規でtelent すべきnode がある場合はqueue に入れ直す。
    if($session_status <= 2){
     $select_column = 'max(iQueueIndex)';
     $table     = 'T_Queue';
     $condition = '';
     $access2db -> set_select($select_column, $table, $condition);
     my $queue_index = $access2db -> select_col1;

     unless(defined($queue_index)){
      $queue_index = 0;
     }

     $queue_index ++;
     
     $select_column = 'count(*)';
     $table         = 'T_Queue';
     $condition     = "where vcSessionId = '" . $session_id . "'";
     $access2db -> set_select($select_column, $table, $condition);
     my $exists_session = $access2db -> select_col1;
     
     if($exists_session > 0){
      my @set = ('iQueueIndex = ' . $queue_index);
      $table     = 'T_Queue';
      $condition = "where vcSessionId = '" . $session_id . "'";
      $access2db -> set_update(\@set, $table, $condition);
      $access2db -> update_exe;
     }
     else{
      my $insert_column = 'vcSessionId,iQueueIndex';
      my @values = ("('" . $session_id . "'," . $queue_index . ")");
      $table     = 'T_Queue';
      $access2db -> set_insert($insert_column, \@values, $table);
      $access2db -> insert_exe;
     }
    }
    else{
     &main::delete_queue($access2db, $session_id);
    }
   }# session
  }

  &main::close_child_process($access2db, $child_process_index);
 }# N
 
 $access2db -> write_log(&Telnetman_common::prefix_log('root'));
 $access2db -> close;
}



#
# node status を更新する。
#
sub update_node_status {
 my $access2db   = $_[0];
 my $session_id  = $_[1];
 my $node        = $_[2];
 my $node_status = $_[3];
 my $update_time = time;
    
 my @set = ('iUpdateTime = ' . $update_time, 'iNodeStatus = ' . $node_status);
 my $table     = 'T_NodeStatus';
 my $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 3 and vcIpAddress = '" . &Common_sub::escape_sql($node) . "'";
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
}



#
# 自動一時停止
#
sub auto_pause {
 my $access2db   = $_[0];
 my $session_id  = $_[1];
 my $node_status = $_[2];

 if(($node_status == 5) || ($node_status == 8)){
  my $auto_pause = &Telnetman_common::check_session_mode($access2db, $session_id);

  if($auto_pause == 1){
   my $update_time = time;

   my @set = ('iUpdateTime = ' . $update_time, 'iNodeStatus = 1');
   my $table     = 'T_NodeStatus';
   my $condition = "where vcSessionId = '" . $session_id . "' and iNodeStatus = 2";
   $access2db -> set_update(\@set, $table, $condition);
   $access2db -> update_exe;

   $table     = 'T_Queue';
   $condition = "where vcSessionId = '" . $session_id . "'";
   $access2db -> set_delete($table, $condition);
   $access2db -> delete_exe;
  }
 }
}



#
# telnet が終わった子プロセスであることをDB に記録する。
#
sub close_child_process {
 my $access2db           = $_[0];
 my $child_process_index = $_[1];
 
 my @set = ('iChildProcessStatus = 0', 'iCountOfNode = 0', 'iExpectedTime = 0', 'iStartTime = 0');
 my $table     = 'T_ChildProcess';
 my $condition = 'where iChildProcessIndex = ' . $child_process_index;
 $access2db -> set_update(\@set, $table, $condition);
 $access2db -> update_exe;
}



#
# T_Qeue から削除する。
#
sub delete_queue {
 my $access2db  = $_[0];
 my $session_id = $_[1];
 
 my $table     = 'T_Queue';
 my $condition = "where vcSessionId = '" . $session_id . "'";
 $access2db -> set_delete($table, $condition);
 $access2db -> delete_exe;
}
