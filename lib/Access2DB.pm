#!/usr/bin/perl
# 用途   : 各sql 文の実行と、select 文の実行結果を8パターンの決まった書式で出力する。
# 作成日 : 2012/08/10
# 作成者 : 江野高広
# 前提   : DBI.pm がインストールされていること。
# 更新   : 2013/04/08 : uts8 の判定をデータベース毎に行えるように。insert でignor を使えるように。
# 更新   : 2017/11/15 : select文にutf8 フラグを付けていなかったので修正。
# 更新   : 2017/12/21 : ログ書き込み機能の追加。

# select 文の結果の構造をつくるサブルーチンは以下の8つ。
#
# select_col1
# select_cols
# select_array_col1
# select_array_cols
# select_hash_col2
# select_hash_cols
# select_hash_array_col2
# select_hash_array_cols
#
# array ... 配列のリファレンス(要素数が選択したレコード数)
# hash  ... 連想配列のリファレンス(先頭のカラムの値をkey にする。)
# col1  ... select したカラムの先頭のカラムの値
# col2  ... select したカラムの先頭から2番目のカラムの値
# cols  ... select したカラム全ての値を格納した配列のリファレンス(ただし、hash の場合は先頭のカラムは除く。)

use strict;
use warnings;
package Access2DB;

use DBI;

# DB アクセスに必要な変数を受け取る。
sub open {
 my $self                      = shift(@_);
 my @DB_connect_parameter_list = @_;
 my $error                     = '';
 my $utf8_flag                 = 0;
 my $db_handle                 = DBI -> connect(@DB_connect_parameter_list);
 
 unless(defined($db_handle)){
  $error = $DBI::errstr;
 }
 elsif($DB_connect_parameter_list[0] =~ /^dbi:mysql:/i){# Mysql のとき、utf8 環境かどうか判別する。
  my ($database) = $DB_connect_parameter_list[0] =~ /^dbi:mysql:(.+):/ig;
  
  if(defined($database)){
   my $sth = $db_handle -> prepare('show create database ' . $database);
   $sth -> execute;
   
   my $create_database = ($sth -> fetchrow_array)[1];
   
   if($create_database =~ /utf8 \*\/$/){
    $utf8_flag = 1;
   }
   
   $sth -> finish;
   
   if($utf8_flag == 1){
    $db_handle -> do('set character set utf8');
   }
  }
 }
 elsif($DB_connect_parameter_list[0] =~ /^dbi:ODBC:/i){
  $db_handle -> {'LongTruncOk'} = 1;
  $db_handle -> {'LongReadLen'} = 10000000;
 }
 
 if(defined($db_handle)){
  $error = '';
 }
 
 my $ref_parameter = {
  'db_handle'     => $db_handle,
  'table'         => undef,
  'select_column' => undef, # select するときの指定カラム
  'insert_column' => undef, # insert 先の指定カラム
  'ref_values'    => undef,
  'ref_set'       => undef,
  'condition'     => undef,
  'sql'           => '',# 一番最後に実行されたsql 文を格納する。
  'error'         => $error,# connect とexecute 実行時のエラーを格納する。
  'utf8_flag'     => $utf8_flag,
  'LOG'           => '',
  'log_file'      => ''
 };
 
 bless($ref_parameter, $self);
}

sub close {
 my $self = shift(@_);
 
 my $db_handle = $self -> {'db_handle'};
 $db_handle -> disconnect;
 $self      -> {'db_handle'} = undef;
 $self      -> {'LOG'} = '';
}

# デストラクタ
sub DESTROY {
 my $self = shift(@_);
}

# ログファイルの定義
sub log_file {
 my $self = shift(@_);
 my ($log_file) = @_;
 
 if(defined($log_file) && (length($log_file) > 0)){
  my $log_dir = $log_file;
  my $pos = rindex($log_dir, '/');
  substr($log_dir, $pos) = '';
  
  if(length($log_dir) == 0){
   $log_dir = '/';
  }
  
  if(-d $log_dir){
   $self -> {'log_file'} = $log_file;
  }
 }
}

# ログファイルに書き込む。
sub write_log {
 my $self = shift(@_);
 my ($prefix) = @_;
 
 if(length($self -> {'LOG'}) > 0){
  unless(defined($prefix)){
   $prefix = '';
  }
  chomp($prefix);
  
  my $log_file = $self -> {'log_file'};
  
  if(length($log_file) > 0){
   my @split_LOG = split(/\n/, $self -> {'LOG'});
   
   &CORE::open(my $fh_sql_log, '>>', $log_file);
   foreach my $line (@split_LOG){
    if(defined($line) && (length($line) > 0)){
     if(length($prefix) > 0){
      print $fh_sql_log $prefix; 
     }
     
     print $fh_sql_log $line . "\n";
    }
   }
   &CORE::close($fh_sql_log);
   
   $self -> {'LOG'} = '';
  }
 }
}

# 直前に実行されたのsql 文を返す。
sub sql {
 my $self = shift(@_);
 return($self -> {'sql'});
}

# 直前のエラーを返す。
sub error {
 my $self = shift(@_);
 return($self -> {'error'});
}

# select 結果からutf8 フラグを除去する。
sub remove_utf8_flag {
 my $row = $_[0];
 
 if(ref($row) eq 'ARRAY'){
  foreach my $col (@$row){
   if(defined($col)){
    if(&utf8::is_utf8($col)){
     &utf8::encode($col);
    }
   }
  }
 }
 else{
  if(defined($row)){
   if(&utf8::is_utf8($row)){
    &utf8::encode($row);
   }
  }
 }
 
 return($row);
}

# select に必要な変数を受け取る。
sub set_select {
 my $self = shift(@_);
 my ($select_column, $table, $condition) = @_;
 
 if(defined($select_column) && (length($select_column) > 0)){
  $self -> {'select_column'} = $select_column;
 }
 
 if(defined($table) && (length($table) > 0)){
  $self -> {'table'} = $table;
 }
 
 if(defined($condition)){
  $self -> {'condition'} = $condition;
 }
}

# insert に必要な変数を受け取る。
sub set_insert {
 my $self = shift(@_);
 my ($insert_column, $ref_values, $table) = @_;
 
 if(defined($insert_column) && (length($insert_column) > 0)){
  $self -> {'insert_column'} = $insert_column;
 }
 
 if(defined($ref_values) && (ref($ref_values) eq 'ARRAY')){
  my @values = @$ref_values;
  $self -> {'ref_values'} = \@values;
 }
 
 if(defined($table) && (length($table) > 0)){
  $self -> {'table'} = $table;
 }
}

# update に必要な変数を受け取る。
sub set_update {
 my $self = shift(@_);
 my ($ref_set, $table, $condition) = @_;
 
 if(defined($ref_set) && (ref($ref_set) eq 'ARRAY')){
  my @set = @$ref_set;
  $self -> {'ref_set'} = \@set;
 }
 
 if(defined($table) && (length($table) > 0)){
  $self -> {'table'} = $table;
 }
 
 if(defined($condition)){
  $self -> {'condition'} = $condition;
 }
}

# delete に必要な変数を受け取る。
sub set_delete {
 my $self = shift(@_);
 my ($table, $condition) = @_;
 
 if(defined($table) && (length($table) > 0)){
  $self -> {'table'} = $table;
 }
 
 if(defined($condition)){
  $self -> {'condition'} = $condition;
 }
}

sub select_col1 {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my $data = '';
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  my $col = ($sth -> fetchrow_array)[0];
  $data = &Access2DB::remove_utf8_flag($col);
 }
 
 $sth -> finish;
 
 return($data);
}

sub select_cols {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my @data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  my @cols = $sth -> fetchrow_array;
  my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
  @data = @$ref_cols;
 }
 
 $sth -> finish;
 
 return(\@data);
}

sub select_array_col1 {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my @data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  while(my $col = ($sth -> fetchrow_array)[0]){
   push(@data, &Access2DB::remove_utf8_flag($col));
  }
 }
 
 $sth -> finish;
 
 return(\@data);
}

sub select_array_cols {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my @data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  while(my @cols = $sth -> fetchrow_array){
   push(@data, &Access2DB::remove_utf8_flag(\@cols));
  }
 }
 
 $sth -> finish;
 
 return(\@data);
}

sub select_hash_col2 {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my %data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   $data{$key} = $ref_cols -> [0];
  }
 }
 
 $sth -> finish;
 
 return(\%data);
}

sub select_hash_cols {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my %data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   $data{$key} = $ref_cols;
  }
 }
 
 $sth -> finish;
 
 return(\%data);
}

sub select_hash_array_col2 {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my %data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   unless(exists($data{$key})){
    $data{$key} = [$ref_cols -> [0]];
   }
   else{
    push(@{$data{$key}}, $ref_cols -> [0]);
   }
  }
 }
 
 $sth -> finish;
 
 return(\%data);
}

sub select_hash_array_cols {
 my $self          = shift(@_);
 my $db_handle     = $self -> {'db_handle'};
 my $select_column = $self -> {'select_column'};
 my $table         = $self -> {'table'};
 my $condition     = $self -> {'condition'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 my $sql = 'select ' . $select_column . ' from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 my %data = ();
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
  
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   unless(exists($data{$key})){
    $data{$key} = [$ref_cols];
   }
   else{
    push(@{$data{$key}}, $ref_cols);
   }
  }
 }
 
 $sth -> finish;
 
 return(\%data);
}

# insert 文を実行。
sub insert_exe {
 my $self          = shift(@_);
 my $ignore        = $_[0];
 my $db_handle     = $self -> {'db_handle'};
 my $insert_column = $self -> {'insert_column'};
 my $ref_values    = $self -> {'ref_values'};
 my $table         = $self -> {'table'};
 my $utf8_flag     = $self -> {'utf8_flag'};
 
 unless(defined($ignore) && ($ignore =~ /^ignore$/i)){
  $ignore = '';
 }
 
 my $sql = 'insert ' . $ignore . ' into ' . $table . ' (' . $insert_column . ') values ' . join(',', @$ref_values);
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 my $rv  = $sth -> execute;
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
 }
 
 $sth -> finish;
 
 return($rv);
}

# update 文を実行。
sub update_exe {
 my $self      = shift(@_);
 my $db_handle = $self -> {'db_handle'};
 my $ref_set   = $self -> {'ref_set'};
 my $table     = $self -> {'table'};
 my $condition = $self -> {'condition'};
 my $utf8_flag = $self -> {'utf8_flag'};
 
 my $sql = 'update ' . $table . ' set ' . join(',', @$ref_set);
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 my $rv  = $sth -> execute;
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
 }
 
 $sth -> finish;
 
 return($rv);
}

# delete 文を実行。
sub delete_exe {
 my $self      = shift(@_);
 my $db_handle = $self -> {'db_handle'};
 my $table     = $self -> {'table'};
 my $condition = $self -> {'condition'};
 my $utf8_flag = $self -> {'utf8_flag'};
 
 my $sql = 'delete from ' . $table;
 if(defined($condition) && (length($condition) > 0)){
  $sql .= ' ' . $condition;
 }
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 my $rv  = $sth -> execute;
 
 if($sth -> err){
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
 }
 else{
  $self -> {'error'} = '';
 }
 
 $sth -> finish;
 
 return($rv);
}

# 任意のinsert, update, delete 文を実行する。
sub do_exe {
 my $self      = shift(@_);
 my $sql       = $_[0];
 my $db_handle = $self -> {'db_handle'};
 my $rv        = 0;
 
 if(defined($sql) && (($sql =~ /^insert/i) || ($sql =~ /^update/i) || ($sql =~ /^delete/i))){
  $self -> {'sql'} = $sql;
  $self -> {'LOG'} .= $sql . "\n";
  $rv = $db_handle -> do($sql);
 }
 
 return($rv);
}

# 任意のselect 文を実行する。
sub select_exe {
 my $self      = shift(@_);
 my $sql       = $_[0];
 my $output    = $_[1];
 my $db_handle = $self -> {'db_handle'};
 my $utf8_flag = $self -> {'utf8_flag'};
 
 unless(defined($output) && (length($output) > 0)){
  $output = 'array_cols';
 }
 elsif(($output ne 'col1') && ($output ne 'cols') && ($output ne 'array_col1') && ($output ne 'hash_col2') && ($output ne 'hash_cols') && ($output ne 'hash_array_col2') && ($output ne 'hash_array_cols')){
  $output = 'array_cols';
 }
 
 $self -> {'sql'} = $sql;
 $self -> {'LOG'} .= $sql . "\n";
 
 if($utf8_flag == 1){
  &utf8::decode($sql);
 }
 
 my $sth = $db_handle -> prepare($sql);
 $sth -> execute;
 
 if($sth -> err){
  $sth -> finish;
  
  my $error = $sth -> errstr;
  $self -> {'error'} = $error;
  $self -> {'LOG'} .= $error . "\n";
  
  return(undef);
 }
 else{
  $self -> {'error'} = '';
 }
 
 # select 結果を指定された出力形式でまとめる。
 if($output eq 'col1'){
  my $col = ($sth -> fetchrow_array)[0];
  $col = &Access2DB::remove_utf8_flag($col);
  
  $sth -> finish;
  
  return($col);
 }
 elsif($output eq 'cols'){
  my @cols = $sth -> fetchrow_array;
  my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
  
  $sth -> finish;
  
  return($ref_cols);
 }
 elsif($output eq 'array_col1'){
  my @data = ();
  while(my $col = ($sth -> fetchrow_array)[0]){
   push(@data, &Access2DB::remove_utf8_flag($col));
  }
  
  $sth -> finish;
  
  return(\@data);
 }
 elsif($output eq 'array_cols'){
  my @data = ();
  while(my @cols = $sth -> fetchrow_array){
   push(@data, &Access2DB::remove_utf8_flag(\@cols));
  }
  
  $sth -> finish;
  
  return(\@data);
 }
 elsif($output eq 'hash_col2'){
  my %data = ();
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   $data{$key} = $ref_cols -> [0];
  }
  
  $sth -> finish;
  
  return(\%data);
 }
 elsif($output eq 'hash_cols'){
  my %data = ();
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   $data{$key} = $ref_cols;
  }
  
  $sth -> finish;
  
  return(\%data);
 }
 elsif($output eq 'hash_array_col2'){
  my %data = ();
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   unless(exists($data{$key})){
    $data{$key} = [$ref_cols -> [0]];
   }
   else{
    push(@{$data{$key}}, $ref_cols -> [0]);
   }
  }
  
  $sth -> finish;
  
  return(\%data);
 }
 elsif($output eq 'hash_array_cols'){
  my %data = ();
  while(my @cols = $sth -> fetchrow_array){
   my $ref_cols = &Access2DB::remove_utf8_flag(\@cols);
   my $key = shift(@$ref_cols);
   unless(exists($data{$key})){
    $data{$key} = [$ref_cols];
   }
   else{
    push(@{$data{$key}}, $ref_cols);
   }
  }
  
  $sth -> finish;
  
  return(\%data);
 }
}

1;
