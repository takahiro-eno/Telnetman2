#!/usr/bin/perl
# 説明   : 画像認証用のPNG を作成する。
# 作成者 : 江野高広
# 作成日 : 2014/05/28

use strict;
use warnings;

use JSON;
use MIME::Base64;
use GD::SecurityImage::AC;

use lib '/usr/local/Telnetman2/lib';
use Common_system;

# yum
# ========
# perl-GD
# ImageMagick-perl
# perl-Test-Simple

# CPAN
# ========
# GD-SecurityImage
# GD-SecurityImage-AC

my $width = 240;
my $height = 80;
my $dir_captcha = &Common_system::dir_captcha();
my $font_path = &Common_system::font_path();

my $captcha = GD::SecurityImage::AC -> new;

$captcha -> gdsi(
 new => {
  width    => $width,
  height   => $height,
  lines    => 10,
  scramble => 1,
  font     => $font_path,
  ptsize   => 30,
 },
 create => ['ttf', 'rect', '#000000', '#555555'],
 particle => [500],
);

$captcha -> data_folder($dir_captcha);
$captcha -> output_folder($dir_captcha);
$captcha -> expire(300);

my $md5sum = $captcha -> generate_code(4);

my $path_png = $dir_captcha . '/' . $md5sum . '.png';

my $size = -s $path_png;
my $buf;
open(CAPPNG, '<', $path_png);
binmode(CAPPNG);
read(CAPPNG, $buf, $size);
close(CAPPNG);

my $base64_png = &MIME::Base64::encode_base64($buf, '');

my %png_data = (
 'width'  => $width,
 'height' => $height,
 'base64' => $base64_png,
 'md5sum' => $md5sum
);

my $json_png_data = &JSON::to_json(\%png_data);

print 'Content-Type: text/plain; charset=UTF-8' . "\n\n";
print $json_png_data;
