FROM centos:7

MAINTAINER telnetman

RUN yum -y update

RUN yum -y install telnet \
 mlocate \
 cronie \
 traceroute \
 tcpdump \
 wget \
 zip \
 unzip \
 gcc \
 epel-release \
 git \
 mariadb-server \
 httpd \
 mod_ssl \
 ipa-pgothic-fonts


RUN yum -y install perl-CGI \
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


RUN echo q | /usr/bin/perl -MCPAN -e shell && \
    cpan -f GD::SecurityImage && \
    cpan -f GD::SecurityImage::AC && \
    cpan -f URI::Escape::JavaScript && \
    cpan -f IO::Pty && \
    cpan -f Net::Ping::External


# TimeZone
RUN \cp -f /usr/share/zoneinfo/Asia/Tokyo /etc/localtime


# PAM
RUN sed -i -e '/pam_loginuid.so/s/^/#/' /etc/pam.d/crond


# Copy startup script
ADD ./install/start.sh /sbin/start.sh
RUN chmod 744 /sbin/start.sh


# MariaDB
RUN sed -i -e 's/\[mysqld\]/\[mysqld\]\ncharacter-set-server = utf8\nskip-character-set-client-handshake\nmax_connect_errors=999999999\n\n\[client\]\ndefault-character-set=utf8/' /etc/my.cnf.d/server.cnf && \
    mkdir /var/lib/mysql/Telnetman2 && \
    chmod 700 /var/lib/mysql/Telnetman2 && \
    chown mysql:mysql /var/lib/mysql/Telnetman2
ADD ./install/Telnetman2_Docker.sql /root/Telnetman2_Docker.sql
VOLUME /var/lib/mysql/Telnetman2


# Apache
RUN sed -i -e 's/Options Indexes FollowSymLinks/Options MultiViews/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/Options None/Options ExecCGI/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/#AddHandler cgi-script \.cgi/AddHandler cgi-script \.cgi/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/DirectoryIndex index\.html/DirectoryIndex index.html index\.cgi/' /etc/httpd/conf/httpd.conf && \
    sed -i -e '/ErrorDocument 403/s/^/#/' /etc/httpd/conf.d/welcome.conf


# SSL
RUN openssl genrsa 2048 > server.key && \
    echo -e "JP\n\n\n\n\nTelnetman2\n\n\n" | openssl req -new -key server.key > server.csr && \
    openssl x509 -days 3650 -req -signkey server.key < server.csr > server.crt && \
    mv server.crt /etc/httpd/conf/ssl.crt && \
    mv server.key /etc/httpd/conf/ssl.key


# Directories & Files
RUN mkdir /usr/local/Telnetman2 && \
    mkdir /usr/local/Telnetman2/lib && \
    mkdir /usr/local/Telnetman2/pl && \
    mkdir /var/Telnetman2 && \
    mkdir /var/Telnetman2/archive && \
    mkdir /var/Telnetman2/auth && \
    mkdir /var/Telnetman2/captcha && \
    mkdir /var/Telnetman2/session && \
    mkdir /var/Telnetman2/log && \
    mkdir /var/Telnetman2/conversion_script && \
    mkdir /var/Telnetman2/tmp && \
    mkdir /var/www/html/Telnetman2 && \
    mkdir /var/www/html/Telnetman2/img && \
    mkdir /var/www/html/Telnetman2/img/help && \
    mkdir /var/www/html/Telnetman2/img/training && \
    mkdir /var/www/html/Telnetman2/css && \
    mkdir /var/www/html/Telnetman2/js && \
    mkdir /var/www/cgi-bin/Telnetman2
ADD ./html/*         /var/www/html/Telnetman2/
ADD ./js/*           /var/www/html/Telnetman2/js/
ADD ./css/*          /var/www/html/Telnetman2/css/
ADD ./img/*png       /var/www/html/Telnetman2/img/
ADD ./img/*ico       /var/www/html/Telnetman2/img/
ADD ./img/help/*     /var/www/html/Telnetman2/img/help/
ADD ./img/training/* /var/www/html/Telnetman2/img/training/
ADD ./cgi/*          /var/www/cgi-bin/Telnetman2/
ADD ./lib/*          /usr/local/Telnetman2/lib/
ADD ./pl/*           /usr/local/Telnetman2/pl/
RUN chmod 755 /var/www/cgi-bin/Telnetman2/* && \
    chown -R apache:apache /var/Telnetman2/conversion_script && \
    chown -R apache:apache /var/Telnetman2/tmp && \
    chown -R apache:apache /var/Telnetman2/captcha && \
    chown -R apache:apache /var/Telnetman2/session && \
    chown -R apache:apache /var/Telnetman2/archive && \
    chown -R apache:apache /var/Telnetman2/log
VOLUME /var/Telnetman2/conversion_script
VOLUME /var/Telnetman2/session
VOLUME /var/Telnetman2/auth


# Update Source Code
RUN sed -i -e "s/'telnetman', 'tcpport23'/'root', ''/" /usr/local/Telnetman2/lib/Common_system.pm


# Cron
ADD ./install/Telnetman2.cron /etc/cron.d/Telnetman2.cron
RUN chmod 644 /etc/cron.d/Telnetman2.cron


# Logrotate 
ADD ./install/Telnetman2.logrotate.txt /etc/logrotate.d/Telnetman2


EXPOSE 443


CMD ["/sbin/start.sh"]
