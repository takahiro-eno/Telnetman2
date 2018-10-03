#!/usr/bin/sh

if [ -z "$(ls /var/Telnetman2)" ]; then
 mkdir /var/Telnetman2/archive
 mkdir /var/Telnetman2/auth
 mkdir /var/Telnetman2/captcha
 mkdir /var/Telnetman2/session
 mkdir /var/Telnetman2/log
 mkdir /var/Telnetman2/conversion_script
 mkdir /var/Telnetman2/tmp

 chmod -R g=u /var/Telnetman2/*
fi

exec /usr/sbin/httpd -D FOREGROUND
