#!/usr/bin/perl
# 説明   : Telnetman Light をダウンロードする。
# 作成者 : 江野高広
# 作成日 : 2018/01/25

use strict;
use warnings;

use CGI;
use File::Path;

use lib '/usr/local/Telnetman2/lib';
use Common_system;



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
# Telentman Light のパスの定義。
#
my $file_Telnetman_light = &Common_system::file_Telnetman_light($session_id);
unless(-f $file_Telnetman_light){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print 'Telentman Light がありません。';
 exit(0);
}



#
# Telentman Light をバイナリモードで開く。
#
my $size = -s $file_Telnetman_light;
my $buf;
open(TELNETMANLIGHT, '<', $file_Telnetman_light);
binmode(TELNETMANLIGHT);
read(TELNETMANLIGHT, $buf, $size);
close(TELNETMANLIGHT);



#
# Telentman Light を削除する。
#
&File::Path::rmtree($file_Telnetman_light);



print "Content-type: application/octet-stream\n";
print 'Content-Disposition: attachment; filename=Telnetman_light.pl' . "\n\n";
print $buf;
