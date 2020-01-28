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
### A. VM or Bare Metal
1. install minimal CentOS7
1. `git clone https://github.com/takahiro-eno/Telnetman2.git`
1. `cd Telnetman2`
1. `sudo sh Telnetman2_install.sh`
1. `cd ..`
1. `rm -rf Telnetman2`
1. `sudo reboot`

https&#58;//server address/  

The default administrator account is admin and the password is tcpport23.  
You can create new administrator account with the following command on Telnetman2 server.  
`sudo perl /usr/local/Telnetman2/pl/create_administrator.pl`  
Then, the default administrator account is invalidated.  
- - -

### B. Docker Container
If you are going to put TelnetmanWF too, follow the installation manual of TelnetmanWF's page.  
https://github.com/takahiro-eno/TelnetmanWF  
This installation manual is available for those who use Telnetman2 only.  

1. `git clone https://github.com/takahiro-eno/Telnetman2.git`
1. `cd Telnetman2`
1. `sudo docker-compose build`
1. `sudo docker-compose up -d`

https&#58;//host address:8443/  

Similarly, you can create new administrator account.  
`docker-compose exec telnetman2-web bash`  
`perl /usr/local/Telnetman2/pl/create_administrator.pl`  
- - -

### C. OpenShift Origin v3.9
Structure  
![Demo](https://github.com/takahiro-eno/Telnetman2/blob/demo/Telnetman2-Container-Structure.png)

Make config file  
- PVC Config  
```
cat <<EOF > telnetman2-pvc.yml
apiVersion: "v1"  
kind: "List"  
items:  

- apiVersion: "v1"
  kind: "PersistentVolumeClaim"
  metadata:
   name: "telnetman2-database"
  spec:
   accessModes:
    - ReadWriteMany
   resources:
     requests:
          storage: 2Gi
   storageClassName: "glusterfs-storage"

- apiVersion: "v1"
  kind: "PersistentVolumeClaim"
  metadata:
   name: "telnetman2-file"
  spec:
   accessModes:
    - ReadWriteMany
   resources:
     requests:
          storage: 2Gi
   storageClassName: "glusterfs-storage"
EOF
```
- Build config  
Set triggers arbitrarily.  
```
cat <<EOF > telnetman2-build.yml
apiVersion: "v1"
kind: "List"
items:

- apiVersion: "v1"
  kind: "ImageStream"
  metadata:
    name: "telnetman2-db"

- apiVersion: "v1"
  kind: "ImageStream"
  metadata:
    name: "telnetman2-web"

- apiVersion: "v1"
  kind: "ImageStream"
  metadata:
    name: "telnetman2-cron"
  
- apiVersion: "v1"
  kind: "BuildConfig"
  metadata:
    name: "telnetman2-db"
  spec:
    runPolicy: "Serial"
    source: 
      type: "Git"
      git:
        uri: "https://github.com/takahiro-eno/Telnetman2"
        ref: "master"
      contextDir: "./"
    strategy: 
      type: "Docker"
      dockerStrategy:
        dockerfilePath: "Dockerfile-db"
    output: 
      to:
        kind: "ImageStreamTag"
        name: "telnetman2-db:latest"
    triggers:
      - type: "GitHub"
        github:
          secret: "<SECRET>"

- apiVersion: "v1"
  kind: "BuildConfig"
  metadata:
    name: "telnetman2-web"
  spec:
    runPolicy: "Serial"
    source: 
      type: "Git"
      git:
        uri: "https://github.com/takahiro-eno/Telnetman2"
        ref: "master"
      contextDir: "./"
    strategy: 
      type: "Docker"
      dockerStrategy:
        dockerfilePath: "Dockerfile-web"
        env:
          - name: "DBSERVER"
            value: "telnetman2"
    output: 
      to:
        kind: "ImageStreamTag"
        name: "telnetman2-web:latest"
    triggers:
      - type: "GitHub"
        github:
          secret: "<SECRET>"

- apiVersion: "v1"
  kind: "BuildConfig"
  metadata:
    name: "telnetman2-cron"
  spec:
    runPolicy: "Serial"
    source: 
      type: "Git"
      git:
        uri: "https://github.com/takahiro-eno/Telnetman2"
        ref: "master"
      contextDir: "./"
    strategy: 
      type: "Docker"
      dockerStrategy:
        dockerfilePath: "Dockerfile-openshift-cron"
        env:
          - name: "DBSERVER"
            value: "telnetman2"
    output: 
      to:
        kind: "ImageStreamTag"
        name: "telnetman2-cron:latest"
    triggers:
      - type: "GitHub"
        github:
          secret: "<SECRET>"
EOF
```
- Deploymet Config  
\<Project Name\> : Youer project name.  
\<openshift_master_default_subdomain\> : A value defined in inventory file.  
```
cat <<EOF > telnetman2-deploy.yml
apiVersion: "v1"
kind: "List"
items:

- apiVersion: "v1"
  kind: "DeploymentConfig"
  metadata:
    name: "telnetman2"
  spec:
    template: 
      metadata:
        labels:
          name: "telnetman2"
      spec:
        containers:
          - name: "telnetman2-web"
            image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-web:latest"
            ports:
              - containerPort: 8443
                protocol: "TCP"
              - containerPort: 8080
                protocol: "TCP"
            volumeMounts:
              - mountPath: "/var/Telnetman2"
                name: "telnetman2-file-dir"
          - name: "telnetman2-db"
            image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-db:latest"
            ports:
              - containerPort: 3306
                protocol: "TCP"
            volumeMounts:
              - mountPath: "/var/lib/mysql"
                name: "telnetman2-database-dir"
        volumes:
          - name: "telnetman2-file-dir"
            persistentVolumeClaim:
              claimName: "telnetman2-file"
          - name: "telnetman2-database-dir"
            persistentVolumeClaim:
              claimName: "telnetman2-database"
    replicas: 1
    triggers:
      - type: "ConfigChange"
      - type: "ImageChange"
        imageChangeParams:
          automatic: true
          containerNames:
            - "telnetman2-web"
          from:
            kind: "ImageStreamTag"
            name: "telnetman2-web:latest"
      - type: "ImageChange"
        imageChangeParams:
          automatic: true
          containerNames:
            - "telnetman2-db"
          from:
            kind: "ImageStreamTag"
            name: "telnetman2-db:latest"
    strategy: 
      type: "Rolling"
    paused: false
    revisionHistoryLimit: 2 
    minReadySeconds: 0

- apiVersion: "v1"
  kind: "Service"
  metadata:
    name: "telnetman2"
  spec:
    ports:
    - name: "3306-tcp"
      protocol: "TCP"
      port: 3306
      targetPort: 3306
    - name: "8443-tcp"
      protocol: "TCP"
      port: 8443
      targetPort: 8443
    - name: "8080-tcp"
      protocol: "TCP"
      port: 8080
      targetPort: 8080
    selector:
      deploymentconfig: "telnetman2"

- apiVersion: "v1"
  kind: "Route"
  metadata:
    name: "telnetman2"
  spec:
    host: "telnetman2-<Project Name>.<openshift_master_default_subdomain>"
    port:
      targetPort: "8080-tcp"
    tls:
      termination: "edge"
    to:
      kind: "Service"
      name: "telnetman2"
EOF
```
- CronJob Config  
\<Project Name\> : Youer project name.  
```
cat <<EOF > telnetman2-cron.yml
apiVersion: "v1"
kind: "List"
items:

- apiVersion: "batch/v2alpha1"
  kind: "CronJob"
  metadata:
    name: "telnetman2-telnet"
  spec:
    schedule: "*/1 * * * *"
    jobTemplate:
      spec:
        template:
          metadata:
            labels:
              parent: "telnetman2"
          spec:
            containers:
              - name: "telnetman2-telnet-00"
                image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-cron:latest"
                command: ["perl", "/usr/local/Telnetman2/pl/telnet.pl"]
                volumeMounts:
                  - mountPath: "/var/Telnetman2"
                    name: "telnetman2-file-dir"
              - name: "telnetman2-telnet-20"
                image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-cron:latest"
                command: ["perl", "/usr/local/Telnetman2/pl/telnet.pl",  "-w",  "20"]
                volumeMounts:
                  - mountPath: "/var/Telnetman2"
                    name: "telnetman2-file-dir"
              - name: "telnetman2-telnet-40"
                image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-cron:latest"
                command: ["perl", "/usr/local/Telnetman2/pl/telnet.pl",  "-w",  "40"]
                volumeMounts:
                  - mountPath: "/var/Telnetman2"
                    name: "telnetman2-file-dir"
            volumes:
              - name: "telnetman2-file-dir"
                persistentVolumeClaim:
                  claimName: "telnetman2-file"
            restartPolicy: "Never"

- apiVersion: "batch/v2alpha1"
  kind: "CronJob"
  metadata:
    name: "telnetman2-delete-session"
  spec:
    schedule: "30 6 * * *"
    jobTemplate:
      spec:
        template:
          metadata:
            labels:
              parent: "telnetman2"
          spec:
            containers:
              - name: "telnetman2-delete-session"
                image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-cron:latest"
                command: ["perl", "/usr/local/Telnetman2/pl/delete_session.pl"]
                volumeMounts:
                  - mountPath: "/var/Telnetman2"
                    name: "telnetman2-file-dir"
            volumes:
              - name: "telnetman2-file-dir"
                persistentVolumeClaim:
                  claimName: "telnetman2-file"
            restartPolicy: "Never"

- apiVersion: "batch/v2alpha1"
  kind: "CronJob"
  metadata:
    name: "telnetman2-logrotate"
  spec:
    schedule: "42 4 1 * *"
    jobTemplate:
      spec:
        template:
          metadata:
            labels:
              parent: "telnetman2"
          spec:
            containers:
              - name: "telnetman2-logrotate"
                image: "docker-registry.default.svc:5000/<Project Name>/telnetman2-cron:latest"
                command: ["sh", "/usr/local/bin/logrotate.sh", "/var/Telnetman2/log/sql_log"]
                volumeMounts:
                  - mountPath: "/var/Telnetman2"
                    name: "telnetman2-file-dir"
            volumes:
              - name: "telnetman2-file-dir"
                persistentVolumeClaim:
                  claimName: "telnetman2-file"
            restartPolicy: "Never"

EOF
```
1. `oc create -f telnetman2-pvc.yml`
1. `oc create -f telnetman2-build.yml`
1. `oc start-build telnetman2-db`  
`oc start-build telnetman2-web`  
`oc start-build telnetman2-cron`  
wait for building
1. `oc create -f telnetman2-deploy.yml`
1. `oc create -f telnetman2-cron.yml`

https&#58;//telnetman2-\<Project Name\>.\<openshift_master_default_subdomain\>/  

Similarly, you can create new administrator account on telnetman2-web container.   
`perl /usr/local/Telnetman2/pl/create_administrator.pl`
