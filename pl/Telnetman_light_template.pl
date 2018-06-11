
=pod
----- オプション説明 -------------------------------------------------------------------------------
 [必須]
  -U : 対象機器へのログインユーザー名
  -P : 対象機器へのログインパスワード

 [準必須]
  -C : パラメーターシートファイルのパス
        * パラメーターシートをハードコーディングしていない場合は必須
        * 指定するとハードコーディングされたパラメーターシートではなくこちらを使用

 [任意]
  -E : 特権モード移行パスワード
  -N : 対象ノード
        * 省略した場合はパラメーターシート記載のノード全てが対象
        * 複数指定可 例) -N 10.1.1.1 -N 10.2.2.2 -N 10.3.3.3
  -F : 最大並列数
        * 最大値 : 10
        * 省略した場合は10
  -D : ログディレクトリの親ディレクトリ
        * 省略すると/tmp
        * 存在しないディレクトリなら自動生成


----- 実行例 ---------------------------------------------------------------------------------------
 perl Telnetman_light.pl -U cisco -P cisco -E cisco -F 2 -D ~/Telnetman -C Telnetman2_parameter_version-up.csv -N 10.1.1.1 -N 10.2.2.2 -N 10.3.3.3 -N 10.4.4.4



----- 必要モジュールのインストール手順 -------------------------------------------------------------
[CentOS 7 の場合]
sudo yum -y install gcc epel-release cpan
sudo yum -y install perl-JSON \
perl-Net-Telnet \
perl-Net-OpenSSH \
perl-Text-Diff \
perl-Thread-Queue \
perl-Clone

sudo perl -MCPAN -e shell

最後の
Would you like me to append that to /root/.bashrc now? [yes]no

sudo vi /root/.cpan/CPAN/MyConfig.pm
編集
============================================================
'makepl_arg' => q[INSTALLDIRS=site],
'mbuildpl_arg' => q[--installdirs site],
============================================================

/root/.bashrc に追記してしまった場合
sudo vi /root/.bashrc
編集
============================================================
追記分全て削除
============================================================

ログインし直し。

sudo cpan URI::Escape::JavaScript
sudo cpan Net::Ping::External
sudo cpan IO::Pty



[Ubuntu の場合]
sudo apt-get -y install build-essential cpanminus
sudo apt-get -y install libjson-perl libnet-telnet-perl libnet-openssh-perl libtext-diff-perl

sudo perl -MCPAN -e shell

sudo vi ~/.cpan/CPAN/MyConfig.pm
編集
============================================================
'mbuildpl_arg' => q[--installdirs site],
============================================================

ログインし直し

sudo cpanm URI::Escape::JavaScript
sudo cpanm Net::Ping::External
sudo cpanm IO::Pty

=cut



use strict;
use warnings;

use Getopt::Long (':config', 'posix_default', 'no_ignore_case', 'gnu_compat');
use JSON;
use Net::Telnet;
use Net::OpenSSH;
use Text::Diff;
use Scalar::Util;
use Encode;
use URI::Escape::JavaScript;
use Net::Ping::External 'ping';
use threads;
use Thread::Queue;
use Clone;
use File::Path;



#
# 引数を受け取る。
# 必要に応じて追加する。
#
my $user               = '';
my $password           = '';
my $enable_password    = '';
my @node_list          = ();
my $N                  = 10;
my $parameter_csv_file = '';
my $dir                = '';

&Getopt::Long::GetOptions(
#'--のオプション名|-のオプション名=s(文字列) or i(数値)' => 変数のリファレンス,
 'user|U=s'            => \$user,               # ユーザー名
 'password|P=s'        => \$password,           # パスワード
 'enable-password|E=s' => \$enable_password,    # enable passsword
 'node|N=s'            => \@node_list,          # 対象ノードリスト
 'fork-number|F=i'     => \$N,                  # 最大並列数
 'csv|C=s'             => \$parameter_csv_file, # パラメーターシートのパス
 'dir|D=s'             => \$dir                 # ログディレクトリ
);



#
# メインオブジェクトを生成して変数を入れる。
# ここは変更しない。
#
my $telnetman = Telnetman_main -> new();

$telnetman -> set_user($user);
$telnetman -> set_password($password);
$telnetman -> set_enable_password($enable_password);
$telnetman -> set_node_list(@node_list);
$telnetman -> set_N($N);
$telnetman -> set_parameter_sheet($parameter_csv_file);
$telnetman -> set_dir($dir);



#
# 機器へのオペレーションを実行。
# ここは変更しない。
#
$telnetman -> telnet();



#
# 結果を取得。
# 以下の結果を受け取る関数を使って事後処理を行う。
#

#  1 : 全台telnet 実施済み。
#  0 : 並列プロセスが途中で消滅。telent 実施済みと未実施のノードが混在。
# -1 : オプションに問題有り。telent 未実施。
my $result = $telnetman -> result();

# $result == 0|-1 の場合の理由。1 の場合は空文字。
my $reason = $telnetman -> reason();

# ノードのステータスコード
#  参照方法 : $ref_node_status -> {'パラメーターシートA列'}
#   2 : telent 未実施
#   3 : telent 実行中
#   4 : OK 終了
#   5 : NG 終了
#   6 : NG 強制続行
#   8 : エラー終了
my $ref_node_status = $telnetman -> get_node_status();

# ログの保存ディレクトリ
my $dir_log = $telnetman -> dir_log();

# ログ取得
#  - telent ログ
#  - Diff 結果
#  - 任意ログ
#my $telnet_log   = $telnetman -> telnet_log('パラメーターシートA列');
#my $diff_log     = $telnetman -> diff_log('パラメーターシートA列');
#my $optional_log = $telnetman -> optional_log();

# SJIS のログの場合は第2引数に何か入れる。(optional_log の場合は第1引数)
#  - telent ログ(SJIS)
#  - Diff 結果(SJIS)
#  - 任意ログ(SJIS)
#my $telnet_log_sjis   = $telnetman -> telnet_log('パラメーターシートA列', 1);
#my $diff_log_sjis     = $telnetman -> diff_log('パラメーターシートA列', 1);
#my $optional_log_sjis = $telnetman -> optional_log(1);



#
# 結果の出力。
#
# 例1. JSON 形式で結果のまとめを標準出力する。
my %summary = ();
$summary{'result'}  = $result;
$summary{'reason'}  = $reason;
$summary{'dir_log'} = $dir_log;
$summary{'node_status'} = {};
while(my ($node, $status_code) = each(%$ref_node_status)){
 my $status = '';

 if($status_code == 2){
  $status = 'telent 未実施';
 }
 elsif($status_code == 3){
  $status = 'telent 実行中';
 }
 elsif($status_code == 4){
  $status = 'OK 終了';
 }
 elsif($status_code == 5){
  $status = 'NG 終了';
 }
 elsif($status_code == 6){
  $status = 'NG 強制続行';
 }
 elsif($status_code == 8){
  $status = 'エラー終了';
 }

 $summary{'node_status'} -> {'node'} = $status;
}

my $json_summary = &JSON::to_json(\%summary);
print $json_summary . "\n";

#
# 例2. 単純にtelnet ログを標準出力する。
while(my ($node, $status_code) = each(%$ref_node_status)){
 my $telnet_log = $telnetman -> telnet_log($node);
 print $telnet_log . "\n";
}

####################################################################################################
###################################### ここから下は変更しない ######################################
####################################################################################################

######################
# メインオブジェクト #
######################
package Telnetman_main;

sub new {
 my $self = $_[0];

 my %parameter_list = (
  'result'              => 1,
  'reason'              => '',
  'user'                => '',
  'passworsd'           => '',
  'enable_password'     => '',
  'specified_node_list' => [],
  'node_list'           => [],
  'N'                   => 10,
  'node_status'         => {},
  'session_id'          => '',
  'A_info'              => undef,
  'A_list'              => undef,
  'B_info'              => undef,
  'B_list'              => undef,
  'dir'                 => ''
 );

 bless(\%parameter_list, $self);
}

sub set_user {
 my $self = $_[0];
 my $user = $_[1];

 $self -> {'user'} = $user;
}

sub set_password {
 my $self     = $_[0];
 my $password = $_[1];

 $self -> {'password'} = $password;
}

sub set_enable_password {
 my $self            = $_[0];
 my $enable_password = $_[1];

 unless(defined($enable_password)){
  $enable_password = '';
 }

 $self -> {'enable_password'} = $enable_password;
}

sub set_node_list {
 my $self      = shift(@_);
 my @node_list = @_;

 foreach my $node (@node_list){
  push(@{$self -> {'specified_node_list'}}, $node);
 }
}

sub set_N {
 my $self = $_[0];
 my $N    = $_[1];

 unless(defined($N)){
  $N = 10;
 }

 unless($N =~ /^[0-9]+$/){
  $N = 10;
 }

 $N += 0;

 unless(($N > 0) && ($N <= 10)){
  $N = 10;
 }

 $self -> {'N'} = $N;
}

sub set_parameter_sheet {
 my $self               = $_[0];
 my $parameter_csv_file = $_[1];

 if(defined($parameter_csv_file) && (length($parameter_csv_file) > 0)){
  my ($ref_parameter_sheet, $error_message) = &Telnetman_common::get_parameter($parameter_csv_file);

  if(length($error_message) == 0){
   my ($ref_A_list, $ref_B_list, $ref_A_info, $ref_B_info, $error_message) = &Telnetman_common::convert_parameter($ref_parameter_sheet);

   if(length($error_message) == 0){
    $self -> {'A_list'} = $ref_A_list;
    $self -> {'B_list'} = $ref_B_list;
    $self -> {'A_info'} = $ref_A_info;
    $self -> {'B_info'} = $ref_B_info;
   }
   else{
    $self -> {'result'} = -1;
    $self -> {'reason'} = $error_message;
   }
  }
  else{
   $self -> {'result'} = -1;
   $self -> {'reason'} = $error_message;
  }
 }
}

sub set_dir {
 my $self = $_[0];
 my $dir  = $_[1];

 if(defined($dir) && ($dir =~ /^~\//)){
  my $home_dir = $ENV{'HOME'};
  $dir =~ s/^~/$home_dir/;
 }
 elsif(!defined($dir) || (length($dir) == 0)){
  $dir = '/tmp';
 }

 $dir =~ s/\/$//;

 unless(-d $dir){
  my @maked_dirs = &File::Path::mkpath($dir);
 }

 $self -> {'dir'} = $dir;
}

sub make_node_list {
 my $self = $_[0];

 if(scalar(@{$self -> {'specified_node_list'}})){
  my %check_duplication = ();

  foreach my $node (@{$self -> {'specified_node_list'}}){
   unless(exists($check_duplication{$node})){
    push(@{$self -> {'node_list'}}, $node);
    $check_duplication{$node} = 1;
   }
  }
 }
 else{
  my $ref_A_list = $self -> A_list;

  foreach my $node (@{$ref_A_list}){
   push(@{$self -> {'node_list'}}, $node);
  }
 }

 foreach my $node (@{$self -> {'node_list'}}){
  $self -> {'node_status'} -> {$node} = 2;
 }
}

sub check_parameter {
 my $self = $_[0];

 unless(-d $self -> {'dir'}){
  $self -> {'result'} = -1;
  $self -> {'reason'} = 'ログディレクトリ' . $self -> {'dir'} . ' がありません。';
 }
 else{
  my $test_text = 'telnetman log test';
  my $test_file = $self -> {'dir'} . '/test';
  open(TESTFILE, '>', $test_file);
  print TESTFILE $test_text;
  close(TESTFILE);

  open(TESTFILE, '<', $test_file);
  my $line = <TESTFILE>;
  close(TESTFILE);

  unless(defined($line) && ($line eq $test_text)){
   $self -> {'result'} = -1;
   $self -> {'reason'} = 'ログディレクトリ' . $self -> {'dir'} . ' に書き込み権限がありません。';
  }

  &File::Path::rmtree($test_file);
 }

 if(scalar(@{$self -> {'node_list'}}) > 0){
  my $ref_A_info = $self -> A_info;

  foreach my $node (@{$self -> {'node_list'}}){
   unless(exists($ref_A_info -> {$node})){
    $self -> {'result'} = -1;
    $self -> {'reason'} = $node . ' がパラメーターシートにありません。';
   }
  }
 }
 else{
  $self -> {'result'} = -1;
  $self -> {'reason'} = '対象ノードがありません。';
 }

 unless(defined($self -> {'password'}) && (length($self -> {'password'}) > 0)){
  $self -> {'result'} = -1;
  $self -> {'reason'} = '対象機器へのログインパスワードを指定して下さい。';
 }

 unless(defined($self -> {'user'}) && (length($self -> {'user'}) > 0)){
  $self -> {'result'} = -1;
  $self -> {'reason'} = '対象機器へのログインユーザー名を指定して下さい。';
 }
}

sub A_info {
 my $self = $_[0];

 if(defined($self -> {'A_info'})){
  my $ref_A_info = &Clone::clone($self -> {'A_info'});
  return($ref_A_info);
 }
 else{
  my $ref_A_info = &Telnetman_data::A_info();
  return($ref_A_info);
 }
}

sub A_list {
 my $self = $_[0];

 if(defined($self -> {'A_list'})){
  my $ref_A_list = &Clone::clone($self -> {'A_list'});
  return($ref_A_list);
 }
 else{
  my $ref_A_list = &Telnetman_data::A_list();
  return($ref_A_list);
 }
}

sub B_info {
 my $self = $_[0];

 if(defined($self -> {'B_info'})){
  my $ref_B_info = &Clone::clone($self -> {'B_info'});
  return($ref_B_info);
 }
 else{
  my $ref_B_info = &Telnetman_data::B_info();
  return($ref_B_info);
 }
}

sub B_list {
 my $self = $_[0];

 if(defined($self -> {'B_list'})){
  my $ref_B_list = &Clone::clone($self -> {'B_list'});
  return($ref_B_list);
 }
 else{
  my $ref_B_list = &Telnetman_data::B_list();
  return($ref_B_list);
 }
}

sub telnet {
 my $self = $_[0];

 if($self -> {'result'} == 1){
  $self -> make_node_list;
  $self -> check_parameter;
 }

 if($self -> {'result'} == 1){
  my $user            = $self -> {'user'};
  my $password        = $self -> {'password'};
  my $enable_password = $self -> {'enable_password'};
  my $N               = $self -> {'N'};
  my $dir             = $self -> {'dir'};

  # ログ出力先を作成。
  my $session_id = &Telnetman_common::make_session_data_dir($dir, $user);
  $self -> {'session_id'} = $session_id;

  # node status を3(実行中) にする。
  # node list をN 分割する。
  my @node_list_list = ();
  for(my $i = 0; $i < $N; $i ++){
   $node_list_list[$i] = [];
  }

  my $n = 0;
  foreach my $node (@{$self -> {'node_list'}}){
   $self -> {'node_status'} -> {$node} = 3;

   my $i = $n % $N;
   push(@{$node_list_list[$i]}, $node);
   $n ++;
  }

  for(my $i = $N - 1; $i >= 0; $i --){
   if(scalar(@{$node_list_list[$i]}) == 0){
    splice(@node_list_list, $i, 1);
   }
  }

  $N = scalar(@node_list_list);

  # 子プロセスを生成してtelnet を実行させる。
  my @child_process_status_list = ();
  my %fh_list = ();
  for(my $i = 0; $i < $N; $i ++){
   $child_process_status_list[$i] = 1;

   my $fh;
   my $pid = open($fh, '-|');

   if($pid == 0){
    my %result_telent = ('child_process_index' => $i, 'node_status' => {});
    my $telnet = Telnetman_telnet -> new();

    my $make_optional_log = $telnet -> load_optional_log_values;
    my $optional_log_header = '';
    my $optional_log_value  = '';
    $telnet -> load_terminal_monitor;

    $telnet -> set_A_list($node_list_list[$i]);
    $telnet -> load_parameter($self, $user, $password, $enable_password);

    my $start_status = 1;
    while($start_status != 0){
     ($start_status, my $start_time) = $telnet -> start_telnet;
     my $node = $telnet -> get_node;

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
          &Telnetman_common::make_diff_log($dir, $session_id, $node, $diff_header, $diff_log);
         }
         else{
          my $diff_error_mesage = $telnet -> get_error_message;
          &Telnetman_common::make_diff_log($dir, $session_id, $node, 'Diff Error.', $diff_error_mesage);
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

      my $node_status = $telnet -> node_status;
      $result_telent{'node_status'} -> {$node} = $node_status;

      my $log_header = &Telnetman_common::make_telnet_log_header($node_status, $start_time);
      &Telnetman_common::make_telnet_log($dir, $session_id, $node, $log_header . $log);
      &Telnetman_common::make_track_log($dir, $session_id, $node, $track_log);
      &Telnetman_common::make_additional_parameter_sheet($dir, $session_id, $node, $ref_additional_parameter_sheet);
     }
     elsif($start_status == -1){# ログイン失敗
      my $log = $telnet -> get_log;
      $log .= $telnet -> get_error_message;

      my $node_status = $telnet -> node_status;
      $result_telent{'node_status'} -> {$node} = $node_status;

      my $log_header = &Telnetman_common::make_telnet_log_header($node_status, $start_time);
      &Telnetman_common::make_telnet_log($dir, $session_id, $node, $log_header . $log);
     }
    }

    if($make_optional_log == 1){
     &Telnetman_common::make_optional_log($dir, $session_id, $optional_log_header, $optional_log_value);
    }

    my $json_result_telent = &JSON::to_json(\%result_telent);
    print $json_result_telent;

    exit(0);
   }
   else{
    $fh_list{$pid} = $fh;
   }
  }



  # 子プロセスの終了を確認してnode status を更新する。
  my $error_flag = 0;
  for(my $i = 0; $i < $N; $i ++){
   my $pid = wait;

   if($pid == -1){
    $error_flag = 1;
    next;
   }

   my $fh = $fh_list{$pid};
   my $json_result_telent = <$fh>;

   if(defined($json_result_telent)){
    my $ref_result_telent = &JSON::from_json($json_result_telent);

    my $child_process_index = $ref_result_telent -> {'child_process_index'};
    $child_process_status_list[$child_process_index] = 0;

    while(my ($node, $node_status) = each(%{$ref_result_telent -> {'node_status'}})){
     $self -> {'node_status'} -> {$node} = $node_status;
    }
   }
   else{
    $error_flag = 1;
   }

   close($fh);
  }



  # 子プロセスが消滅してしまった場合の後処理。
  if($error_flag == 1){
   my @error_node_list = ();

   for(my $i = 0; $i < $N; $i ++){
    my $child_process_index = $i;
    if($child_process_status_list[$child_process_index] == 1){

     my $found_flag = 0;
     foreach my $node (@{$node_list_list[$i]}){
      my $node_status = $self -> {'node_status'} -> {$node};

      if($node_status == 3){
       if($found_flag == 0){
        $self -> {'node_status'} -> {$node} = 8;
        my ($log_start, $log_end) = &Telnetman_telnet::log_start_end('Error Message');
        &Telnetman_common::make_telnet_log($dir, $session_id, $node, "\n" . $log_start . "\n並列プロセスが消滅しました。\n" . $log_end . "\n");
        push(@error_node_list, $node);
        $found_flag = 1;
       }
       else{
        $self -> {'node_status'} -> {$node} = 2;
       }
      }
     }
    }
   }

   $self -> {'result'} = 0;

   if(scalar(@error_node_list) > 0){
    $self -> {'reason'} = join(',', @error_node_list) . ' へのtelnet 実施中に並列プロセスが消滅しました。';
   }
   else{
    $self -> {'reason'} = '並列プロセスが消滅しました。';
   }
  }
 }
}

sub result {
 my $self = $_[0];
 return($self -> {'result'});
}

sub reason {
 my $self = $_[0];
 return($self -> {'reason'});
}

sub get_node_status {
 my $self = $_[0];
 my %node_status = ();

 while(my ($node, $node_status) = each(%{$self -> {'node_status'}})){
  $node_status{$node} = $node_status;
 }

 return(\%node_status);
}

sub dir_log {
 my $self = $_[0];
 my $dir        = $self -> {'dir'};
 my $session_id = $self -> {'session_id'};
 my $dir_log = &Common_system::dir_telnet_log($dir, $session_id);

 return($dir_log);
}

sub telnet_log {
 my $self = $_[0];
 my $node = $_[1];
 my $sjis = $_[2];
 my $dir        = $self -> {'dir'};
 my $session_id = $self -> {'session_id'};
 my $log = '';

 if(defined($node) && (length($node) > 0) && (length($session_id) > 0)){
  my $path = '';

  if(defined($sjis)){
   $path = &Common_system::file_telnet_log_sjis($dir, $session_id, $node);
  }
  else{
   $path = &Common_system::file_telnet_log($dir, $session_id, $node);
  }

  if(-e $path){
   open(LOG, '<', $path);
   while(my $line = <LOG>){
    $log .= $line;
   }
   close(LOG);
  }
 }

 return($log);
}

sub diff_log {
 my $self = $_[0];
 my $node = $_[1];
 my $sjis = $_[2];
 my $dir        = $self -> {'dir'};
 my $session_id = $self -> {'session_id'};
 my $log = '';

 if(defined($node) && (length($node) > 0) && (length($session_id) > 0)){
  my $path = '';

  if(defined($sjis)){
   $path = &Common_system::file_diff_log_sjis($dir, $session_id, $node);
  }
  else{
   $path = &Common_system::file_diff_log($dir, $session_id, $node);
  }

  if(-e $path){
   open(LOG, '<', $path);
   while(my $line = <LOG>){
    $log .= $line;
   }
   close(LOG);
  }
 }

 return($log);
}

sub optional_log {
 my $self = $_[0];
 my $sjis = $_[1];
 my $dir        = $self -> {'dir'};
 my $session_id = $self -> {'session_id'};
 my $log = '';

 if(length($session_id) > 0){
  my $path = '';

  if(defined($sjis)){
   $path = &Common_system::file_optional_log_sjis($dir, $session_id);
  }
  else{
   $path = &Common_system::file_optional_log($dir, $session_id);
  }

  if(-e $path){
   open(LOG, '<', $path);
   while(my $line = <LOG>){
    $log .= $line;
   }
   close(LOG);
  }
 }

 return($log);
}



###########################
# telnet 実行オブジェクト #
###########################
package Telnetman_telnet;

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
 my $self            = $_[0];
 my $telnetman       = $_[1];
 my $user            = $_[2];
 my $password        = $_[3];
 my $enabme_password = $_[4];

 my $ref_login_info = &Telnetman_data::login_info();
 my $ref_B_list     = $telnetman -> B_list();
 my $ref_A_info     = $telnetman -> A_info();
 my $ref_B_info     = $telnetman -> B_info();

 $ref_login_info -> {'user'}            = $user;
 $ref_login_info -> {'password'}        = $password;
 $ref_login_info -> {'enable_password'} = $enabme_password;

 $self -> {'login_info'} = $ref_login_info;
 $self -> {'B_list'}     = $ref_B_list;
 $self -> {'A_info'}     = $ref_A_info;
 $self -> {'B_info'}     = $ref_B_info;
}


#
# 流れ図関連のデータをテキストから取り込む。
#
sub load_flowchart_data {
 my $self           = $_[0];
 my $flowchart_type = $_[1];

 $self -> {'item'}                = undef;
 $self -> {'item_repeat_type'}    = undef;
 $self -> {'item_title'}          = undef;
 $self -> {'flowchart'}           = undef;
 $self -> {'routine_repeat_type'} = undef;
 $self -> {'routine_loop_type'}   = undef;

 my $ref_item                = &Telnetman_data::item($flowchart_type);
 my $ref_item_repeat_type    = &Telnetman_data::item_repeat_type($flowchart_type);
 my $ref_item_title          = &Telnetman_data::item_title($flowchart_type);
 my $ref_flowchart           = &Telnetman_data::flowchart($flowchart_type);
 my $ref_routine_repeat_type = &Telnetman_data::routine_repeat_type($flowchart_type);
 my $ref_routine_loop_type   = &Telnetman_data::routine_loop_type($flowchart_type);

 $self -> {'item'}                = $ref_item;
 $self -> {'item_repeat_type'}    = $ref_item_repeat_type;
 $self -> {'item_title'}          = $ref_item_title;
 $self -> {'flowchart'}           = $ref_flowchart;
 $self -> {'routine_repeat_type'} = $ref_routine_repeat_type;
 $self -> {'routine_loop_type'}   = $ref_routine_loop_type;
}


#
# Diff 設定のデータをテキストから読み取る。
#
sub load_diff_values {
 my $self = $_[0];

 my $ref_diff_values = &Telnetman_data::diff_values();

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


#
# 任意ログ設定のデータをテキストから読み取る。
#
sub load_optional_log_values {
 my $self = $_[0];

 my $ref_optional_log_values = &Telnetman_data::optional_log_values();

 if(length($ref_optional_log_values -> {'optional_log_value'}) > 0){
  $self -> {'optional_log_values'} -> {'optional_log_header'} = $ref_optional_log_values -> {'optional_log_header'};
  $self -> {'optional_log_values'} -> {'optional_log_value'}  = $ref_optional_log_values -> {'optional_log_value'};

  return(1);
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

 my $ref_terminal_monitor_values = &Telnetman_data::terminal_monitor_values();

 $self -> {'terminal_monitor'} -> {'command'} = $ref_terminal_monitor_values -> {'command'};
 $self -> {'terminal_monitor'} -> {'pattern'} = $ref_terminal_monitor_values -> {'pattern'};

 foreach my $terminal_monitor_error (@{$ref_terminal_monitor_values -> {'errors'}}){
  push(@{$self -> {'terminal_monitor'} -> {'errors'}}, $terminal_monitor_error);
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

   while(1){
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

  LOOP1 : while(1){
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
  push(@complete_command_list, $complete_command);
 }

 return(\@complete_command_list);
}



#
# コマンド、抽出パターン、分岐条件などのスケルトンにTelentman 変数や'matched_values' の値を入れ込む。
#
sub insert_skeleton_values {
 my $self   = $_[0];
 my $string = $_[1];
 my $replaced_string = "";

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



######################################
# マルチスレッドで一斉にping を実行。#
######################################
package MTping;

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



##################################
# Telentman 固有共通サブルーチン #
##################################
package Telnetman_common;

#
# ログ格納ディレクトリを作成する。
#
sub make_session_data_dir {
 my $dir  = $_[0];
 my $user = $_[1];

 my $time = time;
 my ($date_time) = &Common_sub::YYYYMMDDhhmmss($time, 'YYYYMMDD-hhmmss');
 my $session_id = $user . '_' . $date_time;
 my $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);

 while(1){
  unless(-d $dir_telnet_log){
   mkdir($dir_telnet_log, 0755);
   last;
  }
  else{
   sleep(1);
   $time = time;
   ($date_time) = &Common_sub::YYYYMMDDhhmmss($time, 'YYYYMMDD-hhmmss');
   $session_id = $user . '_' . $date_time;
   $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);
  }
 }

 return($session_id);
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
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 my $log        = $_[3];

 my $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);

 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
 }

 my $file_telnet_log = &Common_system::file_telnet_log($dir, $session_id, $ip_address);
 open(TLOG, '>', $file_telnet_log);
 print TLOG $log;
 close(TLOG);

 # ShifJIS のログも作成する。
 $log =~ s/\n/\r\n/g;
 &Encode::from_to($log, 'UTF-8', 'Shift_JIS');

 my $file_telnet_log_sjis = &Common_system::file_telnet_log_sjis($dir, $session_id, $ip_address);
 open(TLOG, '>', $file_telnet_log_sjis);
 print TLOG $log;
 close(TLOG);
}



#
# 任意ログを作成する。
#
sub make_optional_log {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $header     = $_[2];
 my $value      = $_[3];

 my $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);

 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
 }

 my $file_optional_log = &Common_system::file_optional_log($dir, $session_id);

 if(-f $file_optional_log){
  open(OLOGU, '>>', $file_optional_log);
  flock(OLOGU, 2);
  print OLOGU $value;
  close(OLOGU);
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

 my $file_optional_log_sjis = &Common_system::file_optional_log_sjis($dir, $session_id);

 if(-f $file_optional_log_sjis){
  open(OLOGJ, '>>', $file_optional_log_sjis);
  flock(OLOGJ, 2);
  print OLOGJ $value;
  close(OLOGJ);
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
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 my $log        = $_[3];

 my $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);

 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
 }

 my $file_track_log = &Common_system::file_track_log($dir, $session_id, $ip_address);
 open(TRACK, '>', $file_track_log);
 print TRACK $log;
 close(TRACK);
}



#
# diff ログを作成する。
#
sub make_diff_log {
 my $dir         = $_[0];
 my $session_id  = $_[1];
 my $ip_address  = $_[2];
 my $diff_header = $_[3];
 my $diff_log    = $_[4];

 my $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);

 unless(-d $dir_telnet_log){
  mkdir($dir_telnet_log, 0755);
 }

 my $file_diff_log = &Common_system::file_diff_log($dir, $session_id, $ip_address);
 open(DIFF, '>', $file_diff_log);
 print DIFF $diff_header . "\n\n" . $diff_log;
 close(DIFF);

 # ShifJIS のログも作成する。
 &Encode::from_to($diff_header, 'UTF-8', 'Shift_JIS');
 &Encode::from_to($diff_log, 'UTF-8', 'Shift_JIS');
 $diff_log =~ s/\n/\r\n/g;

 my $file_diff_log_sjis = &Common_system::file_diff_log_sjis($dir, $session_id, $ip_address);
 open(DIFF, '>', $file_diff_log_sjis);
 print DIFF $diff_header . "\r\n\r\n" . $diff_log;
 close(DIFF);
}



#
# 追加パラメーターシートをファイルにする。
#
sub make_additional_parameter_sheet {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 my $ref_additional_parameter_sheet = $_[3];

 if(defined($ref_additional_parameter_sheet)){
  my $json_additional_parameter_sheet = &JSON::to_json($ref_additional_parameter_sheet);

  my $dir_telnet_log = &Common_system::dir_telnet_log($dir, $session_id);

  unless(-d $dir_telnet_log){
   mkdir($dir_telnet_log, 0755);
  }

  my $file_additional_parameter_sheet = &Common_system::file_additional_parameter_sheet($dir, $session_id, $ip_address);
  open(PSHEET, '>', $file_additional_parameter_sheet);
  print PSHEET $json_additional_parameter_sheet;
  close(PSHEET);
 }
}



#
# コマンド結果のパターンマッチ
#
sub pattern_match {
 my $command_return = $_[0];
 my $pattern        = $_[1];
 my $pipe_type      = $_[2];
 my $pipe_words     = $_[3];
 my $begin_words    = $_[4];
 my $end_words      = $_[5];

 $pattern     = &Common_sub::trim_lines($pattern);
 $pipe_words  = &Common_sub::trim_lines($pipe_words);
 $begin_words = &Common_sub::trim_lines($begin_words);
 $end_words   = &Common_sub::trim_lines($end_words);

 if((!defined($pipe_words)   || (length($pipe_words)  == 0)) &&
    (!defined($pattern)      || (length($pattern)     == 0)) &&
    (!defined($begin_words)  || (length($begin_words) == 0)) &&
    (!defined($end_words)    || (length($end_words)   == 0)))
 {
  return(1, $command_return);
 }

 $command_return = &Common_sub::trim_lines($command_return);

 my @command_resul_list = split(/\n/, $command_return);
 my @pattern_list       = split(/\n/, $pattern);
 my @pipe_word_list     = split(/\n/, $pipe_words);
 my @begin_word_list    = split(/\n/, $begin_words);
 my @end_word_list      = split(/\n/, $end_words);
 my @trimed_pipe_word_list  = &Common_sub::trim_array(@pipe_word_list);
 my @trimed_begin_word_list = &Common_sub::trim_array(@begin_word_list);
 my @trimed_end_word_list   = &Common_sub::trim_array(@end_word_list);

 my @escaped_pipe_word_list = ();
 foreach my $pipe_word (@trimed_pipe_word_list){
  if(length($pipe_word) > 0){
   my $escaped_pipe_word = &Common_sub::escape_reg($pipe_word);
   push(@escaped_pipe_word_list, $escaped_pipe_word);
  }
 }

 my @escaped_begin_word_list = ();
 foreach my $begin_word (@trimed_begin_word_list){
  if(length($begin_word) > 0){
   my $escaped_begin_word = &Common_sub::escape_reg($begin_word);
   push(@escaped_begin_word_list, $escaped_begin_word);
  }
 }

 my @escaped_end_word_list = ();
 foreach my $end_word (@trimed_end_word_list){
  if(length($end_word) > 0){
   my $escaped_end_word = &Common_sub::escape_reg($end_word);
   push(@escaped_end_word_list, $escaped_end_word);
  }
 }

 my $number_of_pattern    = scalar(@pattern_list);
 my $number_of_pipe_word  = scalar(@escaped_pipe_word_list);
 my $number_of_begin_word = scalar(@escaped_begin_word_list);
 my $number_of_end_word   = scalar(@escaped_end_word_list);
 my @matched_values = ();

 my $begin = 0;
 my $include = 0;
 my $exclude = 0;
 my $end = 0;

 if($number_of_begin_word == 0){
  $begin = 1;
 }

 foreach my $command_resul_line (@command_resul_list){
  if($end == 1){
   last;
  }

  if($begin == 1){
   if($number_of_end_word > 0){
    foreach my $escaped_end_word (@escaped_end_word_list){
     if(length($escaped_end_word) > 0){
      if($command_resul_line =~ /$escaped_end_word/){
       $end = 1;
       last;
      }
     }
    }
   }
  }
  elsif($begin == 0){
   foreach my $escaped_begin_word (@escaped_begin_word_list){
    if(length($escaped_begin_word) > 0){
     if($command_resul_line =~ /$escaped_begin_word/){
      $begin = 1;
      last;
     }
    }
   }
  }

  if($begin == 1){
   if($number_of_pipe_word > 0){
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
      }
     }
    }

    if(($include == 0) && ($exclude == 0)){
     next;
    }
   }
  }
  elsif($begin == 0){
   next;
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
# パラメーターシートを受け取る。
#
sub get_parameter {
 my $parameter_csv_file = $_[0];
 my $ref_parameter_sheet = undef;

 if(defined($parameter_csv_file) && (length($parameter_csv_file) > 0)){
  if(-e $parameter_csv_file){
   my $csv = '';

   open(PARAMETERSHEET, '<', $parameter_csv_file);
   while(my $line = <PARAMETERSHEET>){
    $csv .= $line;
   }
   close(PARAMETERSHEET);

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
  }
  else{
   return([["",""]], $parameter_csv_file . ' がありません。');
  }
 }

 unless(defined($ref_parameter_sheet)){
  return([["",""]], '');
 }

 return($ref_parameter_sheet, '');
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




####################
# 共通サブルーチン #
####################
package Common_sub;

# unixtime を指定したフォーマットの日付に変換
sub YYYYMMDDhhmmss {
 my ($unixtime, @format_list) = @_;

 unless(defined($unixtime) && (length($unixtime) > 0)){
  $unixtime = time;
 }

 unless(defined($format_list[0]) && (length($format_list[0]) > 0)){
  $format_list[0] = 'YYYY/MM/DD hh:mm:ss';
 }

 my ($sec, $min, $hour, $mday, $mon, $year) = (localtime($unixtime))[0,1,2,3,4,5];

 $year += 1900;
 $mon  += 1;

 $mon  = sprintf('%02d', $mon);
 $mday = sprintf('%02d', $mday);
 $hour = sprintf('%02d', $hour);
 $min  = sprintf('%02d', $min);
 $sec  = sprintf('%02d', $sec);

 foreach my $format (@format_list){
  $format =~ s/YYYY/$year/g;
  $format =~ s/MM/$mon/g;
  $format =~ s/DD/$mday/g;
  $format =~ s/hh/$hour/g;
  $format =~ s/mm/$min/g;
  $format =~ s/ss/$sec/g;
 }

 return(@format_list);
}

# UTF-8 の半角カタカナを全角カタカナにする。
sub replace_halh_size_katakana {
 my $string = $_[0];

 $string =~ s/\xef\xbd\xa5/\xe3\x83\xbb/g;
 $string =~ s/\xef\xbd\xb3\xef\xbe\x9e/\xe3\x83\xb4/g;
 $string =~ s/\xef\xbd\xb6\xef\xbe\x9e/\xe3\x82\xac/g;
 $string =~ s/\xef\xbd\xb7\xef\xbe\x9e/\xe3\x82\xae/g;
 $string =~ s/\xef\xbd\xb8\xef\xbe\x9e/\xe3\x82\xb0/g;
 $string =~ s/\xef\xbd\xb9\xef\xbe\x9e/\xe3\x82\xb2/g;
 $string =~ s/\xef\xbd\xba\xef\xbe\x9e/\xe3\x82\xb4/g;
 $string =~ s/\xef\xbd\xbb\xef\xbe\x9e/\xe3\x82\xb6/g;
 $string =~ s/\xef\xbd\xbc\xef\xbe\x9e/\xe3\x82\xb8/g;
 $string =~ s/\xef\xbd\xbd\xef\xbe\x9e/\xe3\x82\xba/g;
 $string =~ s/\xef\xbd\xbe\xef\xbe\x9e/\xe3\x82\xbc/g;
 $string =~ s/\xef\xbd\xbf\xef\xbe\x9e/\xe3\x82\xbe/g;
 $string =~ s/\xef\xbe\x80\xef\xbe\x9e/\xe3\x83\x80/g;
 $string =~ s/\xef\xbe\x81\xef\xbe\x9e/\xe3\x83\x82/g;
 $string =~ s/\xef\xbe\x82\xef\xbe\x9e/\xe3\x83\x85/g;
 $string =~ s/\xef\xbe\x83\xef\xbe\x9e/\xe3\x83\x87/g;
 $string =~ s/\xef\xbe\x84\xef\xbe\x9e/\xe3\x83\x89/g;
 $string =~ s/\xef\xbe\x8a\xef\xbe\x9e/\xe3\x83\x90/g;
 $string =~ s/\xef\xbe\x8b\xef\xbe\x9e/\xe3\x83\x93/g;
 $string =~ s/\xef\xbe\x8c\xef\xbe\x9e/\xe3\x83\x96/g;
 $string =~ s/\xef\xbe\x8d\xef\xbe\x9e/\xe3\x83\x99/g;
 $string =~ s/\xef\xbe\x8e\xef\xbe\x9e/\xe3\x83\x9c/g;
 $string =~ s/\xef\xbe\x8a\xef\xbe\x9f/\xe3\x83\x91/g;
 $string =~ s/\xef\xbe\x8b\xef\xbe\x9f/\xe3\x83\x94/g;
 $string =~ s/\xef\xbe\x8c\xef\xbe\x9f/\xe3\x83\x97/g;
 $string =~ s/\xef\xbe\x8d\xef\xbe\x9f/\xe3\x83\x9a/g;
 $string =~ s/\xef\xbe\x8e\xef\xbe\x9f/\xe3\x83\x9d/g;
 $string =~ s/\xef\xbd\xa6/\xe3\x83\xb2/g;
 $string =~ s/\xef\xbd\xa7/\xe3\x82\xa1/g;
 $string =~ s/\xef\xbd\xa8/\xe3\x82\xa3/g;
 $string =~ s/\xef\xbd\xa9/\xe3\x82\xa5/g;
 $string =~ s/\xef\xbd\xaa/\xe3\x82\xa7/g;
 $string =~ s/\xef\xbd\xab/\xe3\x82\xa9/g;
 $string =~ s/\xef\xbd\xac/\xe3\x83\xa3/g;
 $string =~ s/\xef\xbd\xad/\xe3\x83\xa5/g;
 $string =~ s/\xef\xbd\xae/\xe3\x83\xa7/g;
 $string =~ s/\xef\xbd\xaf/\xe3\x83\x83/g;
 $string =~ s/\xef\xbd\xb0/\xe3\x83\xbc/g;
 $string =~ s/\xef\xbd\xb1/\xe3\x82\xa2/g;
 $string =~ s/\xef\xbd\xb2/\xe3\x82\xa4/g;
 $string =~ s/\xef\xbd\xb3/\xe3\x82\xa6/g;
 $string =~ s/\xef\xbd\xb4/\xe3\x82\xa8/g;
 $string =~ s/\xef\xbd\xb5/\xe3\x82\xaa/g;
 $string =~ s/\xef\xbd\xb6/\xe3\x82\xab/g;
 $string =~ s/\xef\xbd\xb7/\xe3\x82\xad/g;
 $string =~ s/\xef\xbd\xb8/\xe3\x82\xaf/g;
 $string =~ s/\xef\xbd\xb9/\xe3\x82\xb1/g;
 $string =~ s/\xef\xbd\xba/\xe3\x82\xb3/g;
 $string =~ s/\xef\xbd\xbb/\xe3\x82\xb5/g;
 $string =~ s/\xef\xbd\xbc/\xe3\x82\xb7/g;
 $string =~ s/\xef\xbd\xbd/\xe3\x82\xb9/g;
 $string =~ s/\xef\xbd\xbe/\xe3\x82\xbb/g;
 $string =~ s/\xef\xbd\xbf/\xe3\x82\xbd/g;
 $string =~ s/\xef\xbe\x80/\xe3\x82\xbf/g;
 $string =~ s/\xef\xbe\x81/\xe3\x83\x81/g;
 $string =~ s/\xef\xbe\x82/\xe3\x83\x84/g;
 $string =~ s/\xef\xbe\x83/\xe3\x83\x86/g;
 $string =~ s/\xef\xbe\x84/\xe3\x83\x88/g;
 $string =~ s/\xef\xbe\x85/\xe3\x83\x8a/g;
 $string =~ s/\xef\xbe\x86/\xe3\x83\x8b/g;
 $string =~ s/\xef\xbe\x87/\xe3\x83\x8c/g;
 $string =~ s/\xef\xbe\x88/\xe3\x83\x8d/g;
 $string =~ s/\xef\xbe\x89/\xe3\x83\x8e/g;
 $string =~ s/\xef\xbe\x8a/\xe3\x83\x8f/g;
 $string =~ s/\xef\xbe\x8b/\xe3\x83\x92/g;
 $string =~ s/\xef\xbe\x8c/\xe3\x83\x95/g;
 $string =~ s/\xef\xbe\x8d/\xe3\x83\x98/g;
 $string =~ s/\xef\xbe\x8e/\xe3\x83\x9b/g;
 $string =~ s/\xef\xbe\x8f/\xe3\x83\x9e/g;
 $string =~ s/\xef\xbe\x90/\xe3\x83\x9f/g;
 $string =~ s/\xef\xbe\x91/\xe3\x83\xa0/g;
 $string =~ s/\xef\xbe\x92/\xe3\x83\xa1/g;
 $string =~ s/\xef\xbe\x93/\xe3\x83\xa2/g;
 $string =~ s/\xef\xbe\x94/\xe3\x83\xa4/g;
 $string =~ s/\xef\xbe\x95/\xe3\x83\xa6/g;
 $string =~ s/\xef\xbe\x96/\xe3\x83\xa8/g;
 $string =~ s/\xef\xbe\x97/\xe3\x83\xa9/g;
 $string =~ s/\xef\xbe\x98/\xe3\x83\xaa/g;
 $string =~ s/\xef\xbe\x99/\xe3\x83\xab/g;
 $string =~ s/\xef\xbe\x9a/\xe3\x83\xac/g;
 $string =~ s/\xef\xbe\x9b/\xe3\x83\xad/g;
 $string =~ s/\xef\xbe\x9c/\xe3\x83\xaf/g;
 $string =~ s/\xef\xbe\x9d/\xe3\x83\xb3/g;

 return($string);
}

# UTF-8 の全角空白、全角英字を半角にする。
sub replace_full_size_alphabet {
 my $string = $_[0];

 $string =~ s/\xe3\x80\x80/\x20/g;
 $string =~ s/\xef\xbc\xa1/\x41/g;
 $string =~ s/\xef\xbc\xa2/\x42/g;
 $string =~ s/\xef\xbc\xa3/\x43/g;
 $string =~ s/\xef\xbc\xa4/\x44/g;
 $string =~ s/\xef\xbc\xa5/\x45/g;
 $string =~ s/\xef\xbc\xa6/\x46/g;
 $string =~ s/\xef\xbc\xa7/\x47/g;
 $string =~ s/\xef\xbc\xa8/\x48/g;
 $string =~ s/\xef\xbc\xa9/\x49/g;
 $string =~ s/\xef\xbc\xaa/\x4a/g;
 $string =~ s/\xef\xbc\xab/\x4b/g;
 $string =~ s/\xef\xbc\xac/\x4c/g;
 $string =~ s/\xef\xbc\xad/\x4d/g;
 $string =~ s/\xef\xbc\xae/\x4e/g;
 $string =~ s/\xef\xbc\xaf/\x4f/g;
 $string =~ s/\xef\xbc\xb0/\x50/g;
 $string =~ s/\xef\xbc\xb1/\x51/g;
 $string =~ s/\xef\xbc\xb2/\x52/g;
 $string =~ s/\xef\xbc\xb3/\x53/g;
 $string =~ s/\xef\xbc\xb4/\x54/g;
 $string =~ s/\xef\xbc\xb5/\x55/g;
 $string =~ s/\xef\xbc\xb6/\x56/g;
 $string =~ s/\xef\xbc\xb7/\x57/g;
 $string =~ s/\xef\xbc\xb8/\x58/g;
 $string =~ s/\xef\xbc\xb9/\x59/g;
 $string =~ s/\xef\xbc\xba/\x5a/g;
 $string =~ s/\xef\xbd\x81/\x61/g;
 $string =~ s/\xef\xbd\x82/\x62/g;
 $string =~ s/\xef\xbd\x83/\x63/g;
 $string =~ s/\xef\xbd\x84/\x64/g;
 $string =~ s/\xef\xbd\x85/\x65/g;
 $string =~ s/\xef\xbd\x86/\x66/g;
 $string =~ s/\xef\xbd\x87/\x67/g;
 $string =~ s/\xef\xbd\x88/\x68/g;
 $string =~ s/\xef\xbd\x89/\x69/g;
 $string =~ s/\xef\xbd\x8a/\x6a/g;
 $string =~ s/\xef\xbd\x8b/\x6b/g;
 $string =~ s/\xef\xbd\x8c/\x6c/g;
 $string =~ s/\xef\xbd\x8e/\x6e/g;
 $string =~ s/\xef\xbd\x8d/\x6d/g;
 $string =~ s/\xef\xbd\x8f/\x6f/g;
 $string =~ s/\xef\xbd\x90/\x70/g;
 $string =~ s/\xef\xbd\x91/\x71/g;
 $string =~ s/\xef\xbd\x92/\x72/g;
 $string =~ s/\xef\xbd\x93/\x73/g;
 $string =~ s/\xef\xbd\x94/\x74/g;
 $string =~ s/\xef\xbd\x95/\x75/g;
 $string =~ s/\xef\xbd\x96/\x76/g;
 $string =~ s/\xef\xbd\x97/\x77/g;
 $string =~ s/\xef\xbd\x98/\x78/g;
 $string =~ s/\xef\xbd\x99/\x79/g;
 $string =~ s/\xef\xbd\x9a/\x7a/g;

 return($string);
}

# UTF-8 の全角数字を半角にする。
sub replace_full_size_number {
 my $string = $_[0];

 $string =~ s/\xef\xbc\x90/\x30/g;
 $string =~ s/\xef\xbc\x91/\x31/g;
 $string =~ s/\xef\xbc\x92/\x32/g;
 $string =~ s/\xef\xbc\x93/\x33/g;
 $string =~ s/\xef\xbc\x94/\x34/g;
 $string =~ s/\xef\xbc\x95/\x35/g;
 $string =~ s/\xef\xbc\x96/\x36/g;
 $string =~ s/\xef\xbc\x97/\x37/g;
 $string =~ s/\xef\xbc\x98/\x38/g;
 $string =~ s/\xef\xbc\x99/\x39/g;

 return($string);
}

# 全角文字を含んでいたら0 無かったら1
sub check_fullsize_character {
 my $string = $_[0];
 my $escaped_string = &URI::Escape::JavaScript::js_escape($string);
 my @split_escaped_string = split(//, $escaped_string);
 my $length_split_escaped_string = scalar(@split_escaped_string);

 for(my $i = 0; $i < $length_split_escaped_string; $i ++){
  if($split_escaped_string[$i] eq '%'){
   $i ++;
   if($split_escaped_string[$i] eq 'u'){
    return(0);
   }
   else{
    $i ++;
   }
  }
 }

 return(1);
}

# 全角文字、半角文字混合の文字列長を求める。
sub length_fullsize_character {
 my $string = $_[0];

 my $escaped_string = &URI::Escape::JavaScript::js_escape($string);
 my @split_escaped_string = split(//, $escaped_string);

 my $length = 0;

 while(scalar(@split_escaped_string) > 0){
  my $s1 = shift(@split_escaped_string);

  if($s1 eq '%'){
   my $s2 = shift(@split_escaped_string);

   if($s2 eq 'u'){
    splice(@split_escaped_string, 0, 16);
    $length += 2;
   }
   else{
    splice(@split_escaped_string, 0, 1);
    $length ++;
   }
  }
  else{
   $length ++;
  }
 }

 return($length);
}


# 文字列のメタ文字をエスケープ
sub escape_reg {
 my $string = $_[0];

 $string =~ s/\^/\\\^/g;
 $string =~ s/\$/\\\$/g;
 $string =~ s/\+/\\\+/g;
 $string =~ s/\*/\\\*/g;
 $string =~ s/\?/\\\?/g;
 $string =~ s/\./\\\./g;
 $string =~ s/\(/\\\(/g;
 $string =~ s/\)/\\\)/g;
 $string =~ s/\[/\\\[/g;
 $string =~ s/\]/\\\]/g;
 $string =~ s/\{/\\\{/g;
 $string =~ s/\}/\\\}/g;
 $string =~ s/\//\\\//g;
 $string =~ s/\|/\\\|/g;

 return($string);
}

# 改行コードを\n に統一。空の行除去。
sub trim_lines {
 my $lines = $_[0];

 unless(defined($lines)){
  return('');
 }

 $lines =~ s/\r//g;
 $lines =~ s/\n+/\n/g;
 $lines =~ s/^\n//;
 $lines =~ s/\n$//;

 return($lines);
}

# 配列の重複する要素を1つにする。空要素やundef を除去する。
sub trim_array {
 my @value_list = @_;
 my %hash_value  = ();
 my @new_value_list = ();

 foreach my $value (@value_list){
  if(defined($value) && (length($value) > 0)){
   unless(exists($hash_value{$value})){
    push(@new_value_list, $value);
    $hash_value{$value} = 1;
   }
  }
 }

 return(@new_value_list);
}

#
# 文字列のまわりに枠を付ける。
#
sub add_frame {
 my $string = $_[0];
 my $framed_string = '';

 if(length($string) > 0){
  $string =~ s/_BLANK_//g;
  $string =~ s/_DUMMY_//g;
  $string =~ s/\r//g;
  $string =~ s/\n/_LF_/g;
  $string =~ s/^(_LF_)+//;
  $string =~ s/(_LF_)+$//;

  $string = &Common_sub::replace_halh_size_katakana($string);
  $string = &Common_sub::replace_full_size_alphabet($string);
  $string = &Common_sub::replace_full_size_number($string);

  my @split_string = split(/_LF_/, $string);

  my $max_length = 1;
  my @length_list = ();
  foreach my $line (@split_string){
   my $length = &Common_sub::length_fullsize_character($line);
   push(@length_list, $length);

   if($length > $max_length){
    $max_length = $length;
   }
  }

  $framed_string .= "\n" . '##';
  for(my $i = 0; $i < $max_length; $i ++){
   $framed_string .= '#';
  }
  $framed_string .= '##' . "\n";
  foreach my $line (@split_string){
   $framed_string .= '# ' . $line;

   my $length = shift(@length_list);
   for(my $i = $length; $i < $max_length; $i ++){
    $framed_string .= ' ';
   }

   $framed_string .= ' #' . "\n";
  }
  $framed_string .= '##';
  for(my $i = 0; $i < $max_length; $i ++){
   $framed_string .= '#';
  }
  $framed_string .= '##' . "\n";
 }

 return($framed_string);
}



################
# ファイルパス #
################
package Common_system;

# データディレクトリやログファイルの絶対パス。
sub dir_telnet_log {
 my $dir        = $_[0];
 my $session_id = $_[1];
 return($dir . '/' . $session_id);
}

sub file_telnet_log {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/telnet_' . $ip_address . '.log');
}

sub file_telnet_log_sjis {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/telnet_' . $ip_address . '_sjis.log');
}

sub file_additional_parameter_sheet {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/additional_parameter_sheet_' . $ip_address . '.json');
}

sub file_track_log {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/track_' . $ip_address . '.log');
}

sub file_diff_log {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/diff_' . $ip_address . '.log');
}

sub file_diff_log_sjis {
 my $dir        = $_[0];
 my $session_id = $_[1];
 my $ip_address = $_[2];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/diff_' . $ip_address . '_sjis.log');
}

sub file_optional_log {
 my $dir        = $_[0];
 my $session_id = $_[1];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/optional.log');
}

sub file_optional_log_sjis {
 my $dir        = $_[0];
 my $session_id = $_[1];
 return(&Common_system::dir_telnet_log($dir, $session_id) . '/optional_sjis.log');
}



##########################
# 逆ポーランド記法で計算 #
##########################
package Reverse_polish_notation;

sub new {
 my $self = $_[0];
 my $reverse_polish_notation = $_[1];

 my %parameter_list = (
  'input_string' => $reverse_polish_notation,
  'reverse_polish_notation' => undef,
  'stack' => [],
  'check' => 0
 );

 if(defined($reverse_polish_notation) && (length($reverse_polish_notation) > 0)){
  $reverse_polish_notation =~ s/^,//;
  $reverse_polish_notation =~ s/,$//;

  my @split_reverse_polish_notation = split(/,/, $reverse_polish_notation);
  $parameter_list{'reverse_polish_notation'} = \@split_reverse_polish_notation;

  $parameter_list{'check'} = &Reverse_polish_notation::check($parameter_list{'reverse_polish_notation'});
 }

 bless(\%parameter_list, $self);
}


sub set {
 my $self = $_[0];
 my $reverse_polish_notation = $_[1];

 $self -> {'input_string'} = $reverse_polish_notation;

 $reverse_polish_notation =~ s/^,//;
 $reverse_polish_notation =~ s/,$//;

 my @split_reverse_polish_notation = split(/,/, $reverse_polish_notation);

 $self -> {'reverse_polish_notation'} = \@split_reverse_polish_notation;
 splice(@{$self -> {'stack'}}, 0);

 $self -> {'check'} = &Reverse_polish_notation::check($self -> {'reverse_polish_notation'});
}


# +, -, *, / 以外で数値以外のものが無いか確認する。
sub check {
 my $ref_reverse_polish_notation = $_[0];

 foreach my $n (@$ref_reverse_polish_notation){
  if(($n ne '+') && ($n ne '-') && ($n ne '*') && ($n ne '/')){
   unless(&Scalar::Util::looks_like_number($n)){
    return(0);
    last;
   }
  }
 }

 return(1);
}


sub calculate {
 my $self = $_[0];

 if($self -> {'check'} == 0){
  return($self -> {'input_string'});
 }

 foreach my $n (@{$self -> {'reverse_polish_notation'}}){
  if($n eq '+'){
   $self -> plus;
  }
  elsif($n eq '-'){
   $self -> minus;
  }
  elsif($n eq '*'){
   $self -> multiply;
  }
  elsif($n eq '/'){
   $self -> division;
  }
  else{
   push(@{$self -> {'stack'}}, $n);
  }
 }

 my $value = pop(@{$self -> {'stack'}});

 return($value);
}

sub plus{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});

 $n1 += 0;
 $n2 += 0;

 push(@{$self -> {'stack'}}, $n1 + $n2);
}

sub minus{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});

 $n1 += 0;
 $n2 += 0;

 push(@{$self -> {'stack'}}, $n1 - $n2);
}

sub multiply{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});

 $n1 += 0;
 $n2 += 0;

 push(@{$self -> {'stack'}}, $n1 * $n2);
}

sub division{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});

 $n1 += 0;
 $n2 += 0;

 if($n2 == 0){
  $n2 = 1;
 }

 push(@{$self -> {'stack'}}, $n1 / $n2);
}
