#!/usr/bin/sh

#
# CentOS 7
#

yum -y update

yum -y install telnet \
mlocate \
traceroute \
tcpdump \
wget \
zip \
unzip \
gcc \
epel-release \
mariadb-server \
httpd \
mod_ssl \
ipa-pgothic-fonts


yum -y install perl-CGI \
perl-GD \
ImageMagick-perl \
perl-Test-Simple \
perl-Archive-Zip \
perl-Net-Telnet \
perl-JSON \
perl-ExtUtils-MakeMaker \
perl-Digest-MD5 \
perl-Text-Diff \
perl-Mail-Sendmail \
perl-Net-OpenSSH \
perl-TermReadKey \
perl-Thread-Queue \
perl-Data-UUID \
perl-Data-Dumper-Concise \
perl-Clone \
cpan


# CPAN
echo q | /usr/bin/perl -MCPAN -e shell
cpan -f GD::SecurityImage
cpan -f GD::SecurityImage::AC
cpan -f URI::Escape::JavaScript
cpan -f IO::Pty
cpan -f Net::Ping::External


# MariaDB
sed -i -e 's/\[mysqld\]/\[mysqld\]\ncharacter-set-server = utf8\nskip-character-set-client-handshake\nmax_connect_errors=999999999\n\n\[client\]\ndefault-character-set=utf8/' /etc/my.cnf.d/server.cnf
systemctl start mariadb
mysql -u root < ./install/Telnetman2.sql


# Apache
sed -i -e 's/Options Indexes FollowSymLinks/Options MultiViews/' /etc/httpd/conf/httpd.conf
sed -i -e 's/Options None/Options ExecCGI/' /etc/httpd/conf/httpd.conf
sed -i -e 's/#AddHandler cgi-script \.cgi/AddHandler cgi-script \.cgi/' /etc/httpd/conf/httpd.conf
sed -i -e 's/DirectoryIndex index\.html/DirectoryIndex index\.html index\.cgi/' /etc/httpd/conf/httpd.conf
sed -i -e '/ErrorDocument 403/s/^/#/' /etc/httpd/conf.d/welcome.conf


# SSL
openssl genrsa 2048 > server.key
echo -e "JP\n\n\n\n\nTelnetman2\n\n\n" | openssl req -new -key server.key > server.csr
openssl x509 -days 3650 -req -signkey server.key < server.csr > server.crt
mv server.crt /etc/httpd/conf/ssl.crt
mv server.key /etc/httpd/conf/ssl.key


# Directories & Files
mkdir /usr/local/Telnetman2
mkdir /usr/local/Telnetman2/lib
mkdir /usr/local/Telnetman2/pl
mkdir /var/Telnetman2
mkdir /var/Telnetman2/archive
mkdir /var/Telnetman2/auth
mkdir /var/Telnetman2/captcha
mkdir /var/Telnetman2/session
mkdir /var/Telnetman2/log
mkdir /var/Telnetman2/conversion_script
mkdir /var/Telnetman2/tmp
mkdir /var/www/html/Telnetman2
mkdir /var/www/html/Telnetman2/img
mkdir /var/www/html/Telnetman2/css
mkdir /var/www/html/Telnetman2/js
mkdir /var/www/cgi-bin/Telnetman2
mv ./html/* /var/www/html/Telnetman2/
mv ./js/*   /var/www/html/Telnetman2/js/
mv ./css/*  /var/www/html/Telnetman2/css/
mv ./img/*  /var/www/html/Telnetman2/img/
mv ./cgi/*  /var/www/cgi-bin/Telnetman2/
mv ./lib/*  /usr/local/Telnetman2/lib/
mv ./pl/*   /usr/local/Telnetman2/pl/
chmod 755 /var/www/cgi-bin/Telnetman2/*
chown -R apache:apache /var/Telnetman2/conversion_script
chown -R apache:apache /var/Telnetman2/tmp
chown -R apache:apache /var/Telnetman2/captcha
chown -R apache:apache /var/Telnetman2/session
chown -R apache:apache /var/Telnetman2/archive
chown -R apache:apache /var/Telnetman2/log


# Cron
mv ./install/Telnetman2.cron /etc/cron.d/
chmod 644 /etc/cron.d/Telnetman2.cron
chown root:root /etc/cron.d/Telnetman2.cron


# Logrotate 
mv ./install/Telnetman2.logrotate.txt /etc/logrotate.d/Telnetman2


# Firewalld
firewall-cmd --zone=public --add-service=https --permanent
firewall-cmd --zone=public --remove-service=dhcpv6-client --permanent


# Disable SELinux
sed -i -e 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config


systemctl enable mariadb
systemctl enable httpd
