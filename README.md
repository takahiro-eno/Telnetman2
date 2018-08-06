Telnetman (version 2)
====

## Description
This is a tool to create telnet or ssh tools.
- GUI
- non-programming
- versatility

## Demo
![Demo](https://github.com/takahiro-eno/Telnetman2/blob/demo/Telnetman_demo.gif)

## Install
### VM or Bare Metal
1. install minimal CentOS7  
1. curl -O https://raw.githubusercontent.com/takahiro-eno/Telnetman2/master/Telnetman2_install.sh
1. sudo sh ./Telnetman2_install.sh
1. sudo reboot

https&#58;//server address/Telnetman2/

### Docker Container
1. curl -O https://raw.githubusercontent.com/takahiro-eno/Telnetman2/master/Dockerfile
1. docker build -t telnetman2/telnetman .
1. docker run -i -p 8443:8443 -d telnetman2/telnetman

https&#58;//host address:8443/Telnetman2/

---
The administrator account is created as admin. 
Admin's password is tcpport23.  
If you want to change administrator account, you erase the corresponding line of the files which exists in /var/Telnetman2/auth at first.  
And try the following command.  
sudo perl /usr/local/Telnetman2/pl/create_administrator.pl
