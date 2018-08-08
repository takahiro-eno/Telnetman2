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
1. `sudo yum -y install git`
1. `git clone https://github.com/takahiro-eno/Telnetman2.git`
1. `cd Telnetman2`
1. `sudo sh Telnetman2_install.sh`
1. `cd ..`
1. `rm -rf Telnetman2`
1. `sudo reboot`

https&#58;//server address/Telnetman2/

### Docker Container
1. `sudo yum -y install git`
1. `git clone https://github.com/takahiro-eno/Telnetman2.git`
1. `cd Telnetman2`
1. `sudo docker build -t telnetman2/telnetman .`
1. `sudo docker run -i -p 8443:8443 -d telnetman2/telnetman`
1. `cd ..`
1. `rm -rf Telnetman2`

https&#58;//host address:8443/Telnetman2/

---
The administrator account is created as admin.  
Admin's password is tcpport23.  
If you want to change administrator account, you erase the corresponding line of the files which exists in /var/Telnetman2/auth at first.  
And execute the following command.  
`sudo perl /usr/local/Telnetman2/pl/create_administrator.pl`
