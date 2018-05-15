#!/usr/bin/perl
# 説明   : 一時的にコピーされたセッションデータファイルを開いて削除する。
# 作成者 : 江野高広
# 作成日 : 2014/09/22
# 更新   : 2017/01/29 ダウンロードファイル名を正しいものに修正。
# 更新   : 2018/01/30 syslog確認、diff、任意ログの設定をダウンロードできうように。


use strict;
use warnings;

use CGI;
use JSON;
use File::Path;

use lib '/usr/local/Telnetman2/lib';
use Common_system;
use Common_sub;
use Telnetman_common;



#
# セッションID を取得する。
#
my $cgi = new CGI;
my $session_id = $cgi -> param('session_id');
unless(defined($session_id) && (length($session_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'セッションID を指定して下さい。';
 exit(0);
}



#
# データタイプの取得
#
my $data_type = $cgi -> param('data_type');
unless(defined($data_type) && (length($data_type) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'データタイプを指定して下さい。';
 exit(0);
}
elsif(($data_type ne 'parameter_sheet') && ($data_type ne 'login_info') && ($data_type ne 'terminal_monitor_values') && ($data_type ne 'diff_values') && ($data_type ne 'optional_log_values') && ($data_type ne 'before_flowchart') && ($data_type ne 'middle_flowchart') && ($data_type ne 'after_flowchart')){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'データタイプはparameter_sheet, login_info, terminal_monitor_values, diff_values, optional_log_values, before_flowchart, middle_flowchart, after_flowchart のどれかを指定して下さい。';
 exit(0);
}



#
# TMP データファイルのパスの定義。
#
my $file = &Common_system::file_tmp_session_data($session_id, $data_type);



#
# TMP データファイルを開く。
#
my $data = '';
if($data_type eq 'parameter_sheet'){
 #
 # パラメーターシートの場合はJSON をCSV にする。
 #
 my $json_parameter_sheet = '';
 open(PSHEET, '<', $file);
 while(my $line = <PSHEET>){
  $json_parameter_sheet .= $line;
 }
 close(PSHEET);
 
 my $csv = '';
 
 my $ref_parameter_sheet = &JSON::from_json($json_parameter_sheet);
 foreach my $ref_csv (@$ref_parameter_sheet){
  $csv .= join(',', @$ref_csv) . "\n";
 }
 
 $data = $csv;
}
else{
 #
 # バイナリモードで開く。
 #
 my $size = -s $file;
 my $buf;
 open(TELNETMANPARAMETER, '<', $file);
 binmode(TELNETMANPARAMETER);
 read(TELNETMANPARAMETER, $buf, $size);
 close(TELNETMANPARAMETER);
 
 $data = $buf;
}



#
# TMP データファイルを削除する。
#
&File::Path::rmtree($file);



#
# セッションの作成者とqueue へのpush 時刻からダウンロードファイル名を作成する。
#
my ($user_id, $pushed_time) = &Telnetman_common::check_session_owner($session_id);
my ($pushed_date) = &Common_sub::YYYYMMDDhhmmss($pushed_time, 'YYYYMMDD-hhmmss');
$user_id          = &Common_sub::escape_filename($user_id);

my $download_file_name = '';
if($data_type eq 'parameter_sheet'){
 $download_file_name = 'Telnetman2_parameter_';
}
elsif($data_type eq 'login_info'){
 $download_file_name = 'Telnetman2_loginInfo_';
}
elsif($data_type eq 'terminal_monitor_values'){
 $download_file_name = 'Telnetman2_terminalMonitor_';
}
elsif($data_type eq 'diff_values'){
 $download_file_name = 'Telnetman2_diffValues_';
}
elsif($data_type eq 'optional_log_values'){
 $download_file_name = 'Telnetman2_optionalLog_';
}
elsif($data_type eq 'before_flowchart'){
 $download_file_name = 'Telnetman2_flowchart_before_';
}
elsif($data_type eq 'middle_flowchart'){
 $download_file_name = 'Telnetman2_flowchart_middle_';
}
elsif($data_type eq 'after_flowchart'){
 $download_file_name = 'Telnetman2_flowchart_after_';
}

$download_file_name .= $user_id . '_' . $pushed_date;



#
# ダウンロードファイルのヘッダーと拡張子を決める。
#
my $header = '';
my $ext = '';
if($data_type  eq 'parameter_sheet'){
 $header = 'Content-type: text/csv; charset=UTF-8';
 $ext = 'csv';
}
else{
 $header = 'Content-type: application/octet-stream';
 $ext = 'json';
}



print $header . "\n";
print 'Content-Disposition: attachment; filename=' . $download_file_name . '.' . $ext . "\n\n";
print $data;
