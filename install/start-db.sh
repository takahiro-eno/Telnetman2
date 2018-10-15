#!/usr/bin/sh

if [ ! -e "/var/lib/mysql/Telnetman2" ]; then
 mkdir /var/lib/mysql/Telnetman2
 /usr/bin/mysqld_safe --skip-grant-tables &
 /bin/sleep 10
 /bin/mysql -u root < /root/Telnetman2.sql
 /bin/mysqladmin shutdown

 chmod -R g=u /var/lib/mysql/*
fi

exec /usr/bin/mysqld_safe --skip-grant-tables
