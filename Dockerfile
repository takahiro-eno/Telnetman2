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
#VOLUME /var/lib/mysql/Telnetman2


# Apache
RUN sed -i -e 's/Options Indexes FollowSymLinks/Options MultiViews/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/Options None/Options ExecCGI/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/#AddHandler cgi-script \.cgi/AddHandler cgi-script \.cgi/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/DirectoryIndex index\.html/DirectoryIndex index.html index\.cgi/' /etc/httpd/conf/httpd.conf && \
    sed -i -e 's/80/8080/g' /etc/httpd/conf/httpd.conf && \
    sed -i -e '/ErrorDocument 403/s/^/#/' /etc/httpd/conf.d/welcome.conf


# SSL
RUN sed -i -e "\$a[SAN]\nsubjectAltName='DNS:telnetman" /etc/pki/tls/openssl.cnf && \
    openssl req \
     -newkey rsa:2048 \
     -days 3650 \
     -nodes \
     -x509 \
     -subj "/C=JP/ST=/L=/O=/OU=/CN=telnetman" \
     -extensions SAN \
     -reqexts SAN \
     -config /etc/pki/tls/openssl.cnf \
     -keyout /etc/pki/tls/private/server.key \
     -out /etc/pki/tls/certs/server.crt && \
    chmod 644 /etc/pki/tls/private/server.key && \
    chmod 644 /etc/pki/tls/certs/server.crt && \
    sed -i -e 's/localhost\.key/server.key/' /etc/httpd/conf.d/ssl.conf && \
    sed -i -e 's/localhost\.crt/server.crt/' /etc/httpd/conf.d/ssl.conf && \
    sed -i -e 's/443/8443/g' /etc/httpd/conf.d/ssl.conf


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
    chown -R apache:apache /usr/local/Telnetman2 && \
    chown -R apache:apache /var/Telnetman2 && \
    chown -R apache:apache /var/www/html/Telnetman2 && \
    chown -R apache:apache /var/www/cgi-bin/Telnetman2
#VOLUME /var/Telnetman2/conversion_script
#VOLUME /var/Telnetman2/session
#VOLUME /var/Telnetman2/auth


# Update Source Code
RUN sed -i -e "s/'telnetman', 'tcpport23'/'root', ''/" /usr/local/Telnetman2/lib/Common_system.pm


# Cron
ADD ./install/Telnetman2.cron /etc/cron.d/Telnetman2.cron
RUN chmod 644 /etc/cron.d/Telnetman2.cron


# Logrotate 
ADD ./install/Telnetman2.logrotate.txt /etc/logrotate.d/Telnetman2


# permissions for root group (for Openshift)
RUN chgrp -R 0   /run && \
    chmod -R g=u /run && \
    chgrp -R 0   /var/log/mariadb && \
    chmod -R g=u /var/log/mariadb && \
    chgrp -R 0   /var/log/httpd && \
    chmod -R g=u /var/log/httpd && \
    chgrp -R 0   /var/lib/mysql && \
    chmod -R g=u /var/lib/mysql && \
    chgrp -R 0   /var/Telnetman2 && \
    chmod -R g=u /var/Telnetman2


EXPOSE 8443


CMD ["/sbin/start.sh"]
