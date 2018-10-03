#!/usr/bin/sh

if [ -z "$(ls /var/lib/mysql/Telnetman2)" ]; then
 /usr/bin/mysqld_safe --skip-grant-tables &
 /bin/sleep 5
 /bin/mysql -u root < /root/Telnetman2.sql
 /bin/mysqladmin shutdown

 chmod -R g=u /var/lib/mysql/Telnetman2/*
fi

exec /usr/bin/mysqld_safe --skip-grant-tables
