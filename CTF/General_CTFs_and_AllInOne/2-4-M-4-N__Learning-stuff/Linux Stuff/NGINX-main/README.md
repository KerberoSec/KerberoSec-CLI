source: [here](https://youtu.be/EmtCxPCo4WY?si=xQbWHcalvoSR0S1O)

## What is NGINX?

It is a web server that accept request via /s and reposnd to display website content through storing, processing and deliveing web pages to users.  
This can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache.  
Companies like Airbnb, Netflix, Wordpress.com, and many others deploy NGINX for scalability and performance reason.   

## Installation

1.Setup yum repo for RHEL/CENTOS
```sudo vi /etc/yum.repos.d/nginx.repo```  

2. Add the following to nginx.repo

```
[nginx]  
[name=nginx repo]  
[baseurl=https://nginx.org/packages/centos/10/$bsearch/  
gpgcheck=0  
enabled=1

```

3. Update the yum repo
```sudo yum update```

4. Install NGINX Open source package:
```sudo yum install nginx```

5. Start and chec the status of nginx
```systemctl status/start/stop nginx```

6. Anoter way of verifying
```curl -l 127.0.0.1```

## Configs

/etc/nginx/nginx.conf  
/usr/share/nginx/html

## Logs

/var/log/nginx/  

- error.log
- access.log

