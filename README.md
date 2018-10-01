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
1. `git clone https://github.com/takahiro-eno/Telnetman2.git`
1. `cd Telnetman2`
1. `sudo sh Telnetman2_install.sh`
1. `cd ..`
1. `rm -rf Telnetman2`
1. `sudo reboot`

https&#58;//server address/ 

### Docker Container CentOS7
If you are going to put TelnetmanWF too, follow the installation manual of TelnetmanWF's page.  
https://github.com/takahiro-eno/TelnetmanWF  
This installation manual is available for those who use Telnetman2 only.  

1. `git clone https://github.com/takahiro-eno/Telnetman2.git`
1. `cd Telnetman2`
1. `sudo docker-compose build`
1. `sudo docker-compose up -d`

https&#58;//host address:8443/

---
The default administrator account is admin and the password is tcpport23.  
You can create new administrator account with the following command on Telnetman2 server.  
`perl /usr/local/Telnetman2/pl/create_administrator.pl`  
Then, the default administrator account is invalidated.
