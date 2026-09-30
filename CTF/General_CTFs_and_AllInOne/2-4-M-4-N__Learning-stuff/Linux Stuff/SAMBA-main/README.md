source: [here](https://youtu.be/q4qTkR2Hc34?si=lA1NAct_siSzkJFC)

## What is SAMBA?
 A linux utility or tool to share linux files and print srvices to other OS.  

 Using ___Server Message Block (SMB)___ and ___Common Internet File System (CIFS)___ protocols  

 ## Server Side Configuration

- To install smaba packages  

``` yum install samba samba-client samba-common```

- Enable Samba through Firewall  

```Firewall-cmd --permanent --zone=public --add-service=samba firewall-cmd --reload```

- Create a directory for Samba and give all the permissions

```mkdir /samba/apps```

- Change SElinux security context for samba shared directory in case SElinux is enabled

```chcon -t samba_share_t /samba/apps```

• Modify ```/etc/samba/smb.conf``` file to add our shared dir 

```
[global]
    workgroup = SAMBA
    netbios name = centos
    security = user
    map to guest = bad user
    dns proxy = no

[Apps]
    path = /samba/apps
    browsable = yes
    writable = yes
    guest ok = yes
    guest only = yes
    read only = no

```

- Verify th e setting by using  

```testparm```

- Enable and start the services  

```systemctl enable smb nmb```  
```systemctl start smb nmb```

---
## Client Side Configuration

### Windows to Linux directory access

- Open Start menu of Windows
- then type double backslash and IP of linux server on search_bar ```\\192.168,30,233```

### Linux to Windows directory access

- To install SAMBA packages

```yum install cifs-utils samba-client```

- Create a mount point (a directory)  
```mkdir /mnt/samba/apps```

- Mount the samba dir
```mount -t cifs IP_server/Apps /mnt/samba/apps```

- For checking  
```df -h```

---

## How to secure SAMBA server

```groupadd smbgrp```  
```useradd -M -d /samba_secure -s /usr/sbin/nologin -G smbgrp testuser```  
```mkdir /samba_secure```  
```chown testuser:smbgrp /samba_secure```  
```chmod 2770 /samba_secure```  
```chcon -t samba_share_t /samba_secure```  
```smbpasswd -a testuser```  
```smbpasswd -e testuser```  

### Add the following lines in ```/etc/smb.conf```

```
[Secure]
    path = /samba_secure/
    valid users = @smbgrp
    guest ok = no
    writable = yes
    browsable = yes

```
- Restart the services  
```systemctl restart smb.service```
```systemctl restart nmb.service```

