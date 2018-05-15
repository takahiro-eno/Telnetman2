#!/usr/bin/perl
# 説明   : セッションID を新規発行する。
# 作成日 : 2014/06/11
# 作成者 : 江野高広
# 更新   : 2017/09/08 Ver.2 向けに微修正。
#        : 2017/10/30 ID をuuid に変更。

use strict;
use warnings;

package Generate_session;

use lib '/usr/local/Telnetman2/lib';
use Common_sub;
use Telnetman_common;

# セッションID を新規作成する。
sub gen {
 my $access2db = $_[0];
 my $user_id = $_[1];
 my $title = $_[2];
 my $time = time;
 
 if(defined($title) && (length($title) > 0)){
  $title = &Common_sub::escape_sql($title);
 }
 else{
  $title = '名無し';
 }
 
 my $session_id = &Common_sub::uuid();
 
 # 同じセションID が無いかどうかの確認。
 while(1){
  my $select_column = 'count(*)';
  my $table         = 'T_SessionStatus';
  my $condition     = "where vcSessionId = '" . $session_id . "'";
  $access2db -> set_select($select_column, $table, $condition);
  my $count = $access2db -> select_col1;
  
  if($count == 0){
   last;
  }
  else{
   $session_id = &Common_sub::uuid();
  }
 }
 
 $title = &Common_sub::replace_halh_size_katakana($title);
 $title = &Common_sub::replace_full_size_alphabet($title);
 $title = &Common_sub::replace_full_size_number($title);
 
 # セッションID を発行する。
 my $insert_column = 'vcUserId,vcSessionId,iCreateTime,iLastAccessTime';
 my @values = ("('" . $user_id . "','" . $session_id . "'," . $time . "," . $time . ")");
 my $table = 'T_SessionList';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
 
 $insert_column = 'vcSessionId,iCreateTime,iUpdateTime,vcTitle,vcUserId,iSessionStatus,iAutoPause,iTotalTime,iTotalNumber';
 @values = ("('" . $session_id . "'," . $time . "," . $time . ",'" . &Common_sub::escape_sql($title) . "','" . $user_id . "',0,0,0,0)");
 $table = 'T_SessionStatus';
 $access2db -> set_insert($insert_column, \@values, $table);
 $access2db -> insert_exe;
 
 return($session_id);
}

# 既存のセッション一覧を作成する。
sub list {
 my $access2db = $_[0];
 my $user_id   = $_[1];
 
 my $select_column = 'vcSessionId';
 my $table         = 'T_SessionList';
 my $condition     = "where vcUserId = '" . &Common_sub::escape_sql($user_id) . "' order by iCreateTime";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_SessionList = $access2db -> select_array_col1;
 
 if(scalar(@$ref_SessionList) == 0){
  my @session_sort = ();
  my %session_title_list = ();
  return(\@session_sort, \%session_title_list);
 }
 
 $select_column = 'vcSessionId,vcTitle';
 $table         = 'T_SessionStatus';
 $condition     = "where vcSessionId in ('" . join("','", @$ref_SessionList) . "')";
 $access2db -> set_select($select_column, $table, $condition);
 my $ref_SessionStatus = $access2db -> select_hash_col2;
 
 return($ref_SessionList, $ref_SessionStatus);
}

1;
