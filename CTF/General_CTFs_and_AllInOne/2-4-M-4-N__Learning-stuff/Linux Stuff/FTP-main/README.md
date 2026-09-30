source:[here](https://youtu.be/q37lf7lTVA4?si=fppRb8mL28Stsl__)

## What is FTP?

the __FIle Transfer Protocol__ is a communicaion protocal used for the transfer of computer files between a client and sever on a computer network.  

uses TCP/IP  

__FTP also used to upload/download files from web servers.__  

## Remote server FTP setup:

- Need root access
- Install ```vsftpd``` service
- ```yum install vsftpd```

__config__  
```/etc/vsftpd/vsftpd.conf```  

__Config Changes__  
```vi vsftpd.conf```  
```anonymous_enable=NO```  

Uncomment:  
- ```ascii_upload_enable=YES```
- ```ascii_download_enable=YES```  

Optional:  
- ```use_localtime=YES```

__Start and enable vsftpd service__  
- ```systemctl start vsftpd```
- ```systemctl enable vsftpd```

__Stop firewall or allow FTP to firewall__
- temporarily stop firewall
- ```systemctl stop firewall```

## Client Server FTP setup:

- need root access
- Install ftp service
- ```yum install ftp```

### How to transfer/Upload file to remote server?

- ftp 192.168.0.0 (ip of remote server)
- Enter username/password
- put file_name  

__For sending multiple files__
- ```mput file1 file2```

### How to download file from remote server?
- ```get filename```
