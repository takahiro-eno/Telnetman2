#!/usr/bin/perl
# 説明   : アカウントロック解除。
# 作成者 : 江野高広
# 作成日 : 2015/02/24

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/Telnetman2/lib';
use Telnetman_common;
use Common_system;
use Common_sub;
use Access2DB;



#
# 表示するメッセージ
#
my $message = '';



#
# ロックID を取得する。
#
my $cgi = new CGI;
my $id = $cgi -> param('id');
unless(defined($id) && (length($id) > 0)){
 $message = '解除ID が指定されていません。';
}



if(length($message) == 0){
 #
 # DB アクセスのためのオブジェクトを作成する。
 #
 my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
 my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
 my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);
 $access2db -> log_file(&Common_system::file_sql_log());
 
 
 
 #
 # 対象ユーザーのロックID を取得する。
 #
 my $select_column = 'vcUserId';
 my $table         = 'T_LockedAccount';
 my $condition     = "where vcLockingId = '" . $id . "'";
 $access2db -> set_select($select_column, $table, $condition);
 my $user_id = $access2db -> select_col1;
 
 
 
 if(defined($user_id) && (length($user_id) > 0)){
  #
  # ロック解除する。
  #
  my @set    = ('iEffective = 1');
  $table     = 'T_User';
  $condition = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "'";
  $access2db -> set_update(\@set, $table, $condition);
  $access2db -> update_exe;
  
  
  
  #
  # ロックリストから削除する。
  #
  $table         = 'T_LockedAccount';
  $condition     = "where vcLockingId = '" . $id . "'";
  $access2db -> set_delete($table, $condition);
  $access2db -> delete_exe;
  
  
  
  $message = 'ロック解除しました。';
 }
 else{
  $message = 'ロックされていないようです。';
 }
 
 $access2db -> write_log(&Telnetman_common::prefix_log($user_id));
 $access2db -> close;
}



my $dir_html = &Common_system::dir_html();
my $dir_css = '/' . $dir_html . '/css';
my $file_bace_css = $dir_css . '/base.css';
my $file_common_layout_css = $dir_css . '/common_layout2.css';
my $file_title_img = '/' . $dir_html . '/img/Telnetman.png';
my $index_html = '/' . $dir_html . '/index.html';



print $cgi -> header(-charset => 'UTF-8');
print <<"_HTML_";
<!DOCTYPE html>
<html lang='ja'>
<head>
<meta charset='UTF-8'>
_HTML_

print "<link rel='stylesheet' href='" . $file_bace_css . "' type='text/css'>\n";
print "<link rel='stylesheet' href='" . $file_common_layout_css . "' type='text/css'>\n";

print <<"_HTML_";
<title>Telnetman&nbsp;アカウントロック解除</title>
</head>
<body>

<div id='header_zone'>
<header>
<div id='headline_area'>
<h1>汎用的telnet&nbsp;ツール</h1>
<nav>
<ul>
_HTML_

print "<li><a href='" . $index_html . "'>トップ</a></li>\n";

print <<"_HTML_";
</ul>
</nav>
</div>

<div id='menu_area'>
_HTML_

print "<img id='png_telnetman' src='" . $file_title_img . "' width='364' height='52' alt='telnetman'>\n";

print <<"_HTML_";
<p><span id='title_string'>アカウントロック解除</span></p>
</div>
</header>
</div>

_HTML_

print "<div id='section_zone'>" . $message . "</div>\n";

print <<"_HTML_";
<footer></footer>

</body>
</html>
_HTML_
