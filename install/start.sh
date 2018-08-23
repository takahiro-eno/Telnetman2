#!/usr/bin/sh

# Start Cron
/usr/sbin/crond

# Start MariaDB
/usr/bin/mysqld_safe --skip-grant-tables &
/bin/sleep 5
/bin/mysql -u root < /root/Telnetman2_Docker.sql

# Start Apache
/usr/sbin/httpd -D FOREGROUND
