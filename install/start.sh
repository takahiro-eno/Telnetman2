#!/usr/bin/sh

/usr/sbin/crond
/usr/bin/mysqld_safe --skip-grant-tables &
/usr/sbin/httpd -D FOREGROUND
