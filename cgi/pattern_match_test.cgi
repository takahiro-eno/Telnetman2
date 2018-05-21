#!/usr/bin/perl
# 説明   : show コマンド結果のパターンマッチ試験を行う。
# 作成者 : 江野高広
# 作成日 : 2014/10/08
# 更新 : 2017/01/28 include, exclude, begin に対応。
# 更新 : 2018/05/16 Begin, End 機能の追加。

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_auth;
use Common_system;
use Access2DB;
use Telnetman_common;


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
# コマンド結果とパターンを受け取る。
#
my $cgi = new CGI;
my $command_return = $cgi -> param('command_return');
my $pattern        = $cgi -> param('pattern');
my $pipe_type      = $cgi -> param('pipe_type');
my $pipe_word      = $cgi -> param('pipe_word');
my $begin_word     = $cgi -> param('begin_word');
my $end_word       = $cgi -> param('end_word');

unless(defined($command_return) && (length($command_return) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"login":1,"session":1,"result":0,"reason":"コマンド結果がありません。"}';
 
 $access2db -> close;
 exit(0);
}

unless(defined($pattern)){
 $pattern = '';
}

unless(defined($pipe_type)){
 $pipe_type = 1;
}

unless(defined($pipe_word)){
 $pipe_word = '';
}

unless(defined($begin_word)){
 $begin_word = '';
}

unless(defined($end_word)){
 $end_word = '';
}



#
# パターンマッチ
#
my @matched_values = &Telnetman_common::pattern_match($command_return, $pattern, $pipe_type, $pipe_word, $begin_word, $end_word);
my $count_of_values = shift(@matched_values);

if($count_of_values == -1){
 my $pattern = shift(@matched_values);
 
 my %results = (
  'login'      => 1,
  'session'    => 1,
  'result'     => 0,
  'reason'     => '正規表現の書き方がおかしいようです' . "\n" . $pattern,
  'session_id' => $session_id
 );
 
 my $json_results = &JSON::to_json(\%results);
 
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print $json_results;
 
 $access2db -> close;
 exit(0);
}


$access2db -> close;

my %results = (
 'login'      => 1,
 'session'    => 1,
 'result'     => 1,
 'values'     => \@matched_values,
 'session_id' => $session_id
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
