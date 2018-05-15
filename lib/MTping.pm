#!/usr/bin/perl
# 説明   : マルチスレッドで一斉にping を実行。
# 作成日 : 2017/11/17
# 作成者 : 江野高広

use strict;
use warnings;

package MTping;

use Net::Ping::External 'ping';
use threads;
use Thread::Queue;

sub mtping{
 my $ref_target_list = $_[0];
 my $count           = $_[1];
 my $timeout         = $_[2];
 my $N               = 16;
 my %result = ();
 
 my @target_list = @$ref_target_list;
 my $number_of_node = scalar(@target_list);
 if($number_of_node < $N){
  $N = $number_of_node;
 }
 
 $count   = &MTping::check_number($count, 5);
 $timeout = &MTping::check_number($timeout, 2);
 
 # キューを作成。
 my $queue = new Thread::Queue;
 
 # 番号札の束を作成
 for(my $i = 0; $i < $N; $i++){
  $queue -> enqueue($i);
 }
 
 # IP Address list を$N 個に分ける。
 my @target_list_list = ();
 for(my $i = 0; $i < $N; $i++){
  $target_list_list[$i] = [];
 }
 
 my $i = 0;
 while(scalar(@target_list) > 0){
  my $target = shift(@target_list);
  push(@{$target_list_list[$i]}, $target);
 
  $i++;
  if($i == $N){
   $i= 0;
  }
 }
 
 my @threads = ();# どのスレッドが何番の番号札を持っているか記録する配列(以降チェック表)
 my $q;# 番号札
 my $thread;# スレッドの名前
 
 # 最大スレッド数だけ番号札を配ってスレッドを生成し、
 # チェック表の該当する番号にスレッドの名前を記録。
 for(my $i = 0; $i < $N; $i++){
  $q = $queue -> dequeue;
  ($thread) = threads -> create(\&MTping::ping_to_target, $queue, $q, $target_list_list[$i], $count, $timeout);
  $threads[$q] = $thread;
 }
 
 # スレッドの返りを待つ。
 my $joined_thread = 0;
 while($joined_thread < $N){
  $q = $queue -> dequeue;
  $thread = $threads[$q];
  my ($ref_result) = $thread -> join;
  
  while(my ($target, $ping_result) = each(%$ref_result)){
   $result{$target} = $ping_result;
  }
  
  $joined_thread ++;
 }
 
 return(\%result);
}

sub ping_to_target {
 my $queue           = $_[0];
 my $q               = $_[1];
 my $ref_target_list = $_[2];
 my $count           = $_[3];
 my $timeout         = $_[4];
 my %result = ();
  
 while(scalar(@$ref_target_list) > 0){
  my $target = shift(@$ref_target_list);
  my $ping_result = Net::Ping::External::ping(hostname => $target, count => $count, size => 56, timeout => $timeout);
  
  $result{$target} = $ping_result;
 }
 
 # 番号札を返す。
 $queue -> enqueue($q);
 
 return(\%result);
}

sub check_number {
 my $number  = $_[0];
 my $default = $_[1];
 
 unless(defined($number)){
  $number = $default;
 }
 elsif($number !~ /^[0-9]+$/){
  $number = $default;
 }
 
 $number =~ s/^0+/0/;
 $number += 0;
 
 if($number == 0){
  $number = $default;
 }
 
 return($number);
}

1;

