---
layout: post
title:  "Authentication CentOS/RHEL 7 to Windows Active Directory"
tags: sysadmin
---

It's safe to say that most companies are running Windows Active Directory as their centralized authentication server which handles user accounts and group management. It seems like some folks create a strong divide between Linux and Windows, however, this guide shows how to quickly integrate the two together.

#### Shoutouts:  
[LinuxTechi article by Pradeep Kumar](https://www.linuxtechi.com/integrate-rhel7-centos7-windows-active-directory/)  
[RedHat Documentation](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/windows_integration_guide/introduction)

## Packages
```
yum install sssd realmd oddjob oddjob-mkhomedir adcli samba-common samba-common-tools krb5-workstation openldap-clients policycoreutils-python
```

## Join Linux machine to AD
```
realm join --user=scott ad.example.com
```

## Edit /etc/sssd/sssd.conf
Change the "use_fully_qualifies_names" and "fallback_homedir" to look like:
```
use_fully_qualified_names = False
fallback_homedir = /home/%u
```

## Restart sssd service
```
systemctl restart sssd
systemctl daemon-reload
```

## Start using!
```
id scott
uid=591001105(scott) gid=591000513(domain users) groups=591000513(domain users),591001108(server admins)
```
```
ssh scott@linux.example.com
[scott@linux ~]$
```
