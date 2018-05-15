#!/usr/bin/perl
# 説明   : 変換スクリプト1つを取得する。
# 作成者 : 江野高広
# 作成日 : 2014/07/31

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Telnetman_auth;
use Common_system;
use Access2DB;


#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# 認証
#
my $telnetman_auth = Telnetman_auth -> new($access2db);
my $login   = $telnetman_auth -> check_login;
my $session = $telnetman_auth -> check_session;

unless(($login == 1) && ($session == 1)){
 my $ref_results = $telnetman_auth -> marge_result;
 my $json_results = &JSON::to_json($ref_results);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_results;
 
 $access2db -> close;
 exit(0);
}


$access2db -> close;


#
# 指定されたスクリプトID を受け取る。
#
my $cgi = new CGI;
my $script_id = $cgi -> param('script_id');
unless(defined($script_id) && (length($script_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"スクリプトが指定されていません。"}';
 
 $access2db -> close;
 exit(0);
}


#
# スクリプトを読み出す。
#
my $file_name = $script_id . '.pl';
my $PATH_script = &Common_system::dir_conversion_script() . '/' . $file_name;
unless(-f $PATH_script){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"スクリプトがありません。"}';
 
 $access2db -> close;
 exit(0);
}

my $file_text = '';
open(MSCRIPT, '<', $PATH_script);
while(my $line = <MSCRIPT>){
 $file_text .= $line
}
close(MSCRIPT);


my %results = (
 'login'   => 1,
 'session' => 1,
 'result'  => 1,
 'name'    => $file_name,
 'text'    => $file_text
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
