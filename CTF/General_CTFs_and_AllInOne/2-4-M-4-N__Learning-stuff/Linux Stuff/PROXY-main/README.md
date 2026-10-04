source : [here](https://youtu.be/hgLFNSelxAs?si=0j5G6Z0FKZ6X05Gi)

## What is proxy?

In computer networking, a proxy server is a server application that acts as an intermediary between a client requesting a resource and the server providing that resource.  

### There are two types of proxy

- Forward proxy (client side proxy)
- Reverse proxy (server side proxy)

## Reverse proxy 

A proxy service which takes a client request, passes it on to one or more servers.  
Proxying is typically used to distibute the load among several servers.  

seamlessly show content from different websites.  
or pass rquests for processing to application servers over protocols other that HTTP.  

### For setting up loction configuration to setup Reverse proxy (NGINX)

Config Location: ```vi /etc/nginx/nginx.conf```  

goto the server block and write from location block ``` proxy_pass htp://127.0.0.1:8080/; ```  

### Example:

```
location /some/path/ {
  proxy_pass http://www.example.com/link/;
}

```
To  

```
location/{
        proxy_pass htp://127.0.0.1:8080/;
  }

```

## Troubleshooting

__check the logs :__ ```cd /var/log/nginx/ ```  

```sudo cat/var/log/audit/audit.log | grep nginx | grep denied```  

## How to solve Access denied issue?  

```
[crit] 59982#0: *2 connect() to 127.0.0.1:8080 failed (13: Permission denied)

while connecting to upstream, client: 192.168.29.179, server: _, request: "GET /HTTP/1.1", upstream: "http://127.0.0.1:8080/", host: "192.168.29.41"

```

## Solution

List of all the httpd SELinux boolean  
```getsebool -a | grep httpd```  

Enable the network connect boolean  
```setsebool httpd_can_network_connect on -P```  

