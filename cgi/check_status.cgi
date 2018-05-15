#!/usr/bin/perl
# 説明   : セッション、ノードの状態を確認する。
# 作成者 : 江野高広
# 作成日 : 2014/09/02

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
#$access2db -> log_file(&Common_system::file_sql_log());



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
# ユーザーID を取得する。
#
my $user_id = $telnetman_auth -> get_user_id;



#
# セッションID を取得。
#
my $session_id = $telnetman_auth -> get_session_id;



#
# ノードリストも必要かどうか。
#
my $cgi = new CGI;
my $require_node_list = $cgi -> param('require_node_list');

if(defined($require_node_list) && (length($require_node_list) > 0)){
 $require_node_list = 1;
}
else{
 $require_node_list = 0;
}



#
# セッションステータスを取得。
#
my $session_status = &Telnetman_common::get_session_status($access2db, $session_id);



#
# iAutoPause の確認。
#
my $auto_pause = &Telnetman_common::check_session_mode($access2db, $session_id);



#
# ノードステータスを取得。ノードリストも作る。
#
my $select_column = 'vcIpAddress,iNodeStatus';
my $table         = 'T_NodeStatus';
my $condition     = "where vcSessionId = '" . $session_id . "' order by iNodeIndex";
$access2db -> set_select($select_column, $table, $condition);
my $ref_node_status = $access2db -> select_array_cols;

my @node_list = ();
my %node_status = ();
my $number_of_nodes = scalar(@$ref_node_status);
for(my $i = $number_of_nodes - 1; $i >= 0; $i --){
 my $node   = $ref_node_status -> [$i] -> [0];
 my $status = $ref_node_status -> [$i] -> [1];
 $status += 0;
 
 unless(exists($node_status{$node})){
  $node_status{$node} = $status;
  
  if($require_node_list == 1){
   unshift(@node_list, $node);
  }
 }
}


#$access2db -> write_log(&Telnetman_common::prefix_log($user_id));
$access2db -> close;


my %results = (
 'login' => 1,
 'session' => 1,
 'session_id' => $session_id,
 'session_status' => $session_status,
 'auto_pause' => $auto_pause,
 'node_status' => \%node_status
);

if($require_node_list == 1){
 $results{'node_list'} = \@node_list;
}

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
