#!/usr/bin/sh

/usr/bin/mysqld_safe --skip-grant-tables &
/usr/sbin/httpd -D FOREGROUND
