#!/usr/bin/perl

use strict;
use warnings;

package Common_system;

# 本システムのDB への接続変数。
sub DB_connect_parameter {
 return('Telnetman2', 'localhost', 'telnetman', 'tcpport23');
}

# ユーザー登録画面の画像認証で使うフォントのパス。
sub font_path {
 return('/usr/share/fonts/ipa-pgothic/ipagp.ttf');
}

# システム配信メールで使う送信者メールアドレス。
sub mail_address {
 return('takahiro.eno@g.softbank.co.jp');
}

# ドキュメントルートの絶対パス。
sub document_root {
 return('/var/www/html');
}

# html 置き場の相対パス。
sub dir_html {
 return('Telnetman2');
}

# CGI 置き場の相対パス。
sub dir_cgi {
 return('cgi-bin/Telnetman2');
}

# データディレクトリの絶対パス。
sub dir_var {
 return('/var/Telnetman2');
}

sub dir_captcha {
 return(&Common_system::dir_var() . '/captcha');
}

sub dir_auth {
 return(&Common_system::dir_var() . '/auth');
}

sub dir_session {
 my $session_id = $_[0];
 return(&Common_system::dir_var() . '/session/' . $session_id);
}

sub file_sql_log {
 return(&Common_system::dir_var() . '/log/sql_log');
}

sub file_stamp {
 my $session_id = $_[0];
 return(&Common_system::dir_session($session_id) . '/stamp.txt');
}

sub file_session_data {
 my $session_id = $_[0];
 my $data_type  = $_[1];
 
 return(&Common_system::dir_session($session_id) . '/' . $data_type . '.json');
}

sub file_tmp_session_data {
 my $session_id = $_[0];
 my $data_type  = $_[1];
 
 return(&Common_system::dir_session($session_id) . '/_' . $data_type . '.json');
}

sub dir_telnet_log {
 my $session_id = $_[0];
 return(&Common_system::dir_session($session_id) . '/log');
}

sub file_telnet_log {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 return(&Common_system::dir_telnet_log($session_id) . '/telnet_' . $ip_address . '.log');
}

sub file_telnet_log_sjis {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 return(&Common_system::dir_telnet_log($session_id) . '/telnet_' . $ip_address . '_sjis.log');
}

sub file_additional_parameter_sheet {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 return(&Common_system::dir_telnet_log($session_id) . '/additional_parameter_sheet_' . $ip_address . '.json');
}

sub file_track_log {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 return(&Common_system::dir_telnet_log($session_id) . '/track_' . $ip_address . '.log');
}

sub file_diff_log {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 return(&Common_system::dir_telnet_log($session_id) . '/diff_' . $ip_address . '.log');
}

sub file_diff_log_sjis {
 my $session_id = $_[0];
 my $ip_address = $_[1];
 return(&Common_system::dir_telnet_log($session_id) . '/diff_' . $ip_address . '_sjis.log');
}

sub file_optional_log {
 my $session_id = $_[0];
 return(&Common_system::dir_telnet_log($session_id) . '/optional.log');
}

sub file_optional_log_sjis {
 my $session_id = $_[0];
 return(&Common_system::dir_telnet_log($session_id) . '/optional_sjis.log');
}

sub file_Telnetman_light {
 my $session_id = $_[0];
 return(&Common_system::dir_session($session_id) . '/Telnetman_light.pl');
}

sub file_Telnetman_light_template {
 return('/usr/local/Telnetman2/pl/Telnetman_light_template.pl');
}

sub dir_archive {
 my $user_id = $_[0];
 return(&Common_system::dir_var() . '/archive/' . $user_id);
}

sub file_auth {
 return(&Common_system::dir_auth() . '/Telnetman_administrator');
}

sub file_admin_mail {
 return(&Common_system::dir_auth() . '/Telnetman_administrator_mail');
}

sub dir_conversion_script {
 return(&Common_system::dir_var() . '/conversion_script');
}

sub dir_tmp {
 return(&Common_system::dir_var() . '/tmp');
}

sub name_telnet_zip_log {
 return('telnet_log');
}

sub file_telnet_zip_log {
 my $session_id = $_[0];
 my $dir_log = &Common_system::dir_telnet_log($session_id);
 my $name_zip = &Common_system::name_telnet_zip_log();
 
 return($dir_log . '/' . $name_zip . '.zip');
}

1;
