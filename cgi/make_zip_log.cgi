#!/usr/bin/perl
# 説明   : telnet log をzip 圧縮する。
# 作成者 : 江野高広
# 作成日 : 2014/06/16
# 更新   : 2018/10/05 作成するファイルのパーミッションを664 に変更。

use strict;
use warnings;

use CGI;
use JSON;

use Archive::Zip;# sudo yum install perl-Archive-Zip

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


#
# セッションID の取得
#
my $session_id = $telnetman_auth -> get_session_id;


#
# バックアップ対象のディレクトリ。
#
my $dir_log = &Common_system::dir_telnet_log($session_id);
unless(-d $dir_log){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'ログが作成されていません。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> close;
 exit(0);
}



#
# telnet ログのファイル名を収集する。
#
opendir(DLOG, $dir_log);
my @log_files = readdir(DLOG);
closedir(DLOG);

my @log_list = ();
foreach my $log_name (@log_files){
 if((($log_name =~ /^telnet_/) && ($log_name =~ /\.log$/)) || (($log_name =~ /^diff_/) && ($log_name =~ /\.log$/)) || (($log_name =~ /^optional/) && ($log_name =~ /\.log$/))){
  push(@log_list, $log_name);
 }
}

if(scalar(@log_list) == 0){
 my %result = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => 'ログが作成されていません。',
  'session_id' => $session_id,
 );
 
 my $json_result = &JSON::to_json(\%result);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_result;
 
 $access2db -> close;
 exit(0);
}



#
# zip 圧縮する。
#
my $file_zip = &Common_system::file_telnet_zip_log($session_id);
my $zip = Archive::Zip -> new();
foreach my $log_name (@log_list){
 $zip -> addFile($dir_log . '/' . $log_name, $log_name);
}
$zip -> writeToFileNamed($file_zip);

umask(0002);
chmod(0664, $file_zip);

$access2db -> close;

my %results = (
 'login'      => 1,
 'session'    => 1,
 'result'     => 1,
 'session_id' => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
