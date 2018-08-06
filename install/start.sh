#!/usr/bin/sh

# Start Cron
/usr/sbin/crond

# Start MariaDB
/usr/bin/mysqld_safe --skip-grant-tables &
/bin/sleep 5
/bin/mysql -u root < /root/Telnetman2_Docker.sql

# Add Administrator
/bin/echo -e "admin\ntcpport23\ntcpport23\nadmin@telnetman.com" | /user/bin/perl /usr/local/Telnetman2/pl/create_administrator.pl

# Start Apache
/usr/sbin/httpd -D FOREGROUND
