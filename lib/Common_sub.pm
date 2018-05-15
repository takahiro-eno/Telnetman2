#!/usr/bin/perl
# 説明   : 共通で使えそうなサブルーチン集
# 作成日 : 2012/08/10
# 作成者 : 江野高広
# 更新   : 2013/04/09 replace_halh_size_katakana, replace_full_size_alphabet, replace_full_size_number を追加。
# 更新   : 2014/06/03 encode_password, check_password を追加。
# 更新   : 2014/06/30 check_fullsize_character を追加。
# 更新   : 2017/11/29 trim_array を追加。

use strict;
use warnings;

package Common_sub;

use Digest::MD5 qw(md5_hex);
use Mail::Sendmail;# CPAN
use Encode;
use URI::Escape::JavaScript;#CPAN /usr/local/share/perl5/URI/Escape/JavaScript.pm
use Data::UUID;


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

# 文字列の中のファイル名に使えない文字を「-」に変換
sub escape_filename {
 my $filename = $_[0];
 
 $filename =~ s/\s/-/g;
 $filename =~ s/\\/-/g;
 $filename =~ s/\//-/g;
 $filename =~ s/:/-/g;
 $filename =~ s/\*/-/g;
 $filename =~ s/\?/-/g;
 $filename =~ s/"/-/g;
 $filename =~ s/</-/g;
 $filename =~ s/>/-/g;
 $filename =~ s/\|/-/g;
 
 return($filename);
}

# 文字列の中のHTML に使う文字をエスケープ
sub escape_HTML {
 my $string = $_[0];
 
 $string =~ s/&/&amp;/g;
 $string =~ s/"/&quot;/g;
 $string =~ s/</&lt;/g;
 $string =~ s/>/&gt;/g;
 
 return($string);
}

# エスケープされたHTML の文字を元に戻す。
sub escape_HTML_reverse {
 my $string = $_[0];
 
 $string =~ s/&gt;/>/g;
 $string =~ s/&lt;/</g;
 $string =~ s/&quot;/"/g;
 $string =~ s/&amp;/&/g;
 
 return($string);
}

# 文字列の中の、sql 文の構文エラーになる「\」や「'」をエスケープする。
# ついでに前後の空白も除去する。
sub escape_sql {
 my $string = $_[0];
 
 $string =~ s/\r//g;
 $string =~ s/\\/\\\\/g;
 $string =~ s/'/\\'/g;
 
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

# メールアドレスが正しく書けているか確認する。
sub check_mail_address {
 my $mail_address = $_[0];
 
 unless(defined($mail_address) && (length($mail_address) > 0)){
  return(0);
 }
 
 unless($mail_address =~ /.+@.+/){
  return(0);
 }
 
 if($mail_address =~ /\s/){
  return(0);
 }
 
 my @split_mail_address = split(/@/, $mail_address);
 
 if(($split_mail_address[1] !~ /\./) || ($split_mail_address[1] =~ /\.$/)){
  return(0);
 }
 
 return(1);
}

# 任意の長さのランダムな文字列を作成する。
sub make_random_string {
 my $length = $_[0];
 
 unless(defined($length)){
  $length = 32;
 }
 
 my @small = ('a'..'z');
 my @large = ('A'..'Z');
 my $random_string = '';
 
 for(my $i = 0; $i < $length; $i++){
  my $nsl = int(rand(3));
  if($nsl == 0){
   $random_string .= int(rand(10));
  }
  elsif($nsl == 1){
   $random_string .= $small[int(rand(24))];
  }
  elsif($nsl == 2){
   $random_string .= $large[int(rand(24))];
  }
 }
 
 return($random_string);
}

# 入力されたパスワードをDigest::MD5 (hex) で暗号化する。
sub encode_password {
 my $password = $_[0];

 my $salt = &Common_sub::make_random_string(8);
 my $encoded_password = $salt . &Digest::MD5::md5_hex($salt . $password);

 return($encoded_password);
}

# 入力されたパスワードが登録済みのものと同じか確認する。
sub check_password {
 my $password = $_[0];
 my $registerd_password = $_[1];

 my $salt = substr($registerd_password, 0, 8);
 my $encoded_password = $salt . &Digest::MD5::md5_hex($salt . $password);

 if($encoded_password eq $registerd_password){
  return(1);
 }
 else{
  return(0);
 }
}

# 入力された開始日時と終了日時を確認し、不正であれば正す。
sub check_start_end {
 my ($start_YYYYMMDD, $start_HHMM, $end_YYYYMMDD, $end_HHMM, $max_period) = @_;
 
 # 未定義の日付に空の文字列を定義する。
 foreach my $number ($start_YYYYMMDD, $start_HHMM, $end_YYYYMMDD, $end_HHMM){
  unless(defined($number) && (length($number) > 0)){
   $number = '';
  }
 }
 
 # 最大期間が未定義なら365 日にする。
 unless(defined($max_period) && (length($max_period) > 0)){
  $max_period = 365;
 }
 
 my $start_unixtime = 0;
 my $end_unixtime   = 0;
 
 # 現在時刻
 my $time = time;
 $time   -= $time % 300;
 
 # 全角数字を半角に変換し数字以外を文字を除去する。
 foreach my $number ($start_YYYYMMDD, $start_HHMM, $end_YYYYMMDD, $end_HHMM, $max_period){
  $number = &Common_sub::replace_full_size_number($number);
  $number =~ s/[^0-9]//g;
 }
 
 # 時、分が空だったら0000を代入
 if(length($start_HHMM) == 0){
  $start_HHMM = '0000';
 }
 
 if(length($end_HHMM) == 0){
  $end_HHMM = '0000';
 }
 
 $start_HHMM = sprintf('%04d', $start_HHMM);
 $end_HHMM   = sprintf('%04d', $end_HHMM);
 
 # スタート時刻の書式チェック
 if(length($start_YYYYMMDD) > 0){
  if(($start_YYYYMMDD =~ /^[0-9]{8}$/) && ($start_HHMM =~ /^[0-9]{4}$/)){
   $start_unixtime = &Common_sub::check_date($start_YYYYMMDD, $start_HHMM);
   if($start_unixtime > 0){
    $start_unixtime -= $start_unixtime % 300;
    
    # スタート時刻が$max_period より前だったら$max_period に修正。
    if($start_unixtime < $time - 86400 * $max_period){
     $start_unixtime = $time - 86400 * $max_period;
    }
   }
  }
 }
 
 # 終了時刻の書式チェック
 if(length($end_YYYYMMDD) > 0){
  if(($end_YYYYMMDD =~ /^[0-9]{8}$/) && ($end_HHMM =~ /^[0-9]{4}$/)){
   $end_unixtime = &Common_sub::check_date($end_YYYYMMDD, $end_HHMM);
   if($end_unixtime > 0){
    $end_unixtime -= $end_unixtime % 300;
    
    # 終了時刻が未来だったら現在に修正。
    if($end_unixtime > $time){
     $end_unixtime = $time;
    }
   }
  }
 }
 
 # 空だったり書式エラーの場合は直近24時間を適用。
 if(($start_unixtime <= 0) || ($end_unixtime <= 0) || ($start_unixtime >= $end_unixtime) || ($start_unixtime > $time)){
  $start_unixtime = $time - 86400;
  $end_unixtime   = $time;
 }
 
 ($start_YYYYMMDD, $start_HHMM) = &Common_sub::YYYYMMDDhhmmss($start_unixtime, 'YYYYMMDD', 'hhmm');
 ($end_YYYYMMDD, $end_HHMM)     = &Common_sub::YYYYMMDDhhmmss($end_unixtime, 'YYYYMMDD', 'hhmm');
 
 return($start_unixtime, $end_unixtime, $start_YYYYMMDD, $start_HHMM, $end_YYYYMMDD, $end_HHMM);
}

sub check_date{
 use Time::Local;
 
 my $YYYYMMDD = $_[0];
 my $HHMM     = $_[1];
 
 my ($year, $month, $day) = $YYYYMMDD =~ /^([0-9]{4})([0-9]{2})([0-9]{2})$/g;
 my ($hour, $minute)      = $HHMM     =~ /^([0-9]{2})([0-9]{2})$/g;
 $month  = sprintf('%d', $month);
 $day    = sprintf('%d', $day);
 $hour   = sprintf('%d', $hour);
 $minute = sprintf('%d', $minute);
 $year  -= 1900;
 $month -= 1;
 
 my $unixtime = 0;
 eval{$unixtime = &Time::Local::timelocal(0, $minute, $hour, $day, $month, $year);};
 if(defined($@) && (length($@) > 0)){
  $unixtime = -1;
  $@ = '';
 }
 
 return($unixtime);
}


sub send_mail {
 my $from    = $_[0];
 my $ref_to  = $_[1];
 my $ref_cc  = $_[2];
 my $subject = $_[3];
 my $body    = $_[4];
 
 &Encode::from_to($subject, 'utf8', 'jis');
 &Encode::from_to($body, 'utf8', 'jis');
 
 my %mail = (
  'Content-Transfer-Encoding' => '7bit',
  'Content-Type' => 'text/plain; charset="ISO-2022-JP"',
  'From'         => $from,
  'Subject'      => $subject,
  'message'      => $body . "\n"
 );
 
 if(defined($ref_to)){
  if(ref($ref_to) eq 'ARRAY'){
   my @to = @$ref_to;
   if(scalar(@to) > 0){
    $mail{'To'} = join(',', @to)
   }
  }
  else{
   $mail{'To'} = $ref_to;
  }
 }
 
 if(defined($ref_cc)){
  if(ref($ref_cc) eq 'ARRAY'){
   my @cc = @$ref_cc;
   if(scalar(@cc) > 0){
    $mail{'Cc'} = join(',', @cc)
   }
  }
  else{
   $mail{'Cc'} = $ref_cc;
  }
 }
 
 &Mail::Sendmail::sendmail(%mail);
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


#
# UUID を生成
#
sub uuid {
 my $ug   = Data::UUID -> new;
 my $uuid = $ug -> create();
 my $uuid_string = $ug -> to_string($uuid);
 
 return($uuid_string);
}

1;
