#!/usr/bin/perl
# 説明   : zip 圧縮されたtelnet log をダウンロードして削除する。
# 作成者 : 江野高広
# 作成日 : 2014/06/16

use strict;
use warnings;

use CGI;

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
# zip ファイルのパスの定義。
#
my $file_zip = &Common_system::file_telnet_zip_log($session_id);
unless(-f $file_zip){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'ログがありません。';
 exit(0);
}



#
# zip ファイルをバイナリモードで開く。
#
my $size = -s $file_zip;
my $buf;
open(ZLOG, '<', $file_zip);
binmode(ZLOG);
read(ZLOG, $buf, $size);
close(ZLOG);



#
# zip ファイルを削除する。
#
&File::Path::rmtree($file_zip);



#
# セッションの作成者とqueue へのpush 時刻からダウンロードファイル名を作成する。
#
my ($user_id, $pushed_time) = &Telnetman_common::check_session_owner($session_id);
my ($pushed_date) = &Common_sub::YYYYMMDDhhmmss($pushed_time, 'YYYYMMDD-hhmmss');
$user_id          = &Common_sub::escape_filename($user_id);
my $download_file_name = $user_id . '_' . $pushed_date . '_telnet_log.zip';



print "Content-type: application/octet-stream\n";
print 'Content-Disposition: attachment; filename=' . $download_file_name . "\n\n";
print $buf;
