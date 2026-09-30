# Lab 6: Web Servers

- **Question 1a**: What command did you use to display the networked services?

```bash
netstat
```

***

- **Question 1b**: Paste the output of the command.

```bash
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 localhost:36325         localhost:40526         ESTABLISHED
tcp        0      0 localhost:40526         localhost:36325         ESTABLISHED
tcp        0     81 172.26.193.138:59308    lb-140-82-112-21-:https CLOSING    
tcp        0      0 localhost:40534         localhost:36325         ESTABLISHED
tcp        0      0 localhost:36325         localhost:40534         ESTABLISHED
Active UNIX domain sockets (w/o servers)
Proto RefCnt Flags       Type       State         I-Node   Path
unix  3      [ ]         STREAM     CONNECTED     24780    @e26f557f6bb14b0c/bus/systemd/bus-api-system
unix  2      [ ]         DGRAM                    25024    /run/user/1000/systemd/notify
unix  2      [ ]         DGRAM                    17507    /var/run/chrony/chronyd.sock
unix  3      [ ]         DGRAM      CONNECTED     24594    /run/systemd/notify
unix  2      [ ]         DGRAM                    24608    /run/systemd/journal/syslog
unix  8      [ ]         DGRAM      CONNECTED     24610    /run/systemd/journal/dev-log
unix  8      [ ]         DGRAM      CONNECTED     24612    /run/systemd/journal/socket
unix  3      [ ]         STREAM     CONNECTED     27762    @698bbec5f18b0382/bus/systemd-resolve/bus-api-resolve
unix  3      [ ]         STREAM     CONNECTED     209818   @ec8c1c80c4f35247/bus/systemd/bus-api-user
unix  3      [ ]         STREAM     CONNECTED     17668    @6bf549e1d9b80173/bus/systemd-timesyn/bus-api-timesync
unix  3      [ ]         STREAM     CONNECTED     26850    @735d5cf4ede33f24/bus/systemd-logind/system
unix  3      [ ]         STREAM     CONNECTED     25028    @bca14d6d0e04bdff/bus/systemd/bus-system
unix  3      [ ]         STREAM     CONNECTED     4530260  
unix  3      [ ]         STREAM     CONNECTED     24859    /run/dbus/system_bus_socket
unix  2      [ ]         DGRAM      CONNECTED     1403699  
unix  3      [ ]         STREAM     CONNECTED     218388   /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     27887    
unix  3      [ ]         STREAM     CONNECTED     4531327  
unix  3      [ ]         STREAM     CONNECTED     24818    
unix  3      [ ]         STREAM     CONNECTED     24808    
unix  2      [ ]         DGRAM      CONNECTED     21825    
unix  3      [ ]         DGRAM      CONNECTED     25025    
unix  3      [ ]         STREAM     CONNECTED     27851    /run/dbus/system_bus_socket
unix  3      [ ]         STREAM     CONNECTED     4530263  
unix  3      [ ]         DGRAM      CONNECTED     17657    
unix  3      [ ]         STREAM     CONNECTED     20698    
unix  2      [ ]         DGRAM      CONNECTED     19651    
unix  3      [ ]         STREAM     CONNECTED     27853    /run/dbus/system_bus_socket
unix  3      [ ]         STREAM     CONNECTED     18825    
unix  3      [ ]         STREAM     CONNECTED     21792    
unix  3      [ ]         DGRAM      CONNECTED     24595    
unix  3      [ ]         STREAM     CONNECTED     21690    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     21717    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     24800    
unix  2      [ ]         DGRAM      CONNECTED     23667    
unix  3      [ ]         STREAM     CONNECTED     17767    
unix  3      [ ]         STREAM     CONNECTED     17702    
unix  3      [ ]         STREAM     CONNECTED     27848    
unix  3      [ ]         STREAM     CONNECTED     4530253  
unix  3      [ ]         STREAM     CONNECTED     24815    
unix  3      [ ]         STREAM     CONNECTED     24804    
unix  2      [ ]         DGRAM      CONNECTED     25692    
unix  3      [ ]         STREAM     CONNECTED     24805    
unix  3      [ ]         STREAM     CONNECTED     4530258  
unix  3      [ ]         STREAM     CONNECTED     20688    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     4531332  
unix  2      [ ]         DGRAM      CONNECTED     17652    
unix  3      [ ]         STREAM     CONNECTED     24819    
unix  3      [ ]         STREAM     CONNECTED     212161   /run/user/1000/bus
unix  3      [ ]         STREAM     CONNECTED     447      /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     24809    
unix  3      [ ]         STREAM     CONNECTED     214083   
unix  3      [ ]         STREAM     CONNECTED     4530262  
unix  3      [ ]         STREAM     CONNECTED     27850    /run/dbus/system_bus_socket
unix  3      [ ]         DGRAM      CONNECTED     17658    
unix  3      [ ]         STREAM     CONNECTED     20699    
unix  3      [ ]         STREAM     CONNECTED     23640    
unix  3      [ ]         STREAM     CONNECTED     27831    
unix  3      [ ]         STREAM     CONNECTED     21691    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     27890    /run/dbus/system_bus_socket
unix  3      [ ]         STREAM     CONNECTED     17764    
unix  3      [ ]         STREAM     CONNECTED     4531334  
unix  2      [ ]         DGRAM      CONNECTED     178      
unix  3      [ ]         STREAM     CONNECTED     24801    
unix  3      [ ]         STREAM     CONNECTED     19625    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     27847    
unix  3      [ ]         STREAM     CONNECTED     4530261  
unix  3      [ ]         STREAM     CONNECTED     20746    /tmp/dbus-VTeQircuZ7
unix  3      [ ]         STREAM     CONNECTED     24816    
unix  3      [ ]         STREAM     CONNECTED     4531333  
unix  3      [ ]         DGRAM      CONNECTED     22606    
unix  3      [ ]         STREAM     CONNECTED     4531330  
unix  3      [ ]         STREAM     CONNECTED     24806    
unix  3      [ ]         STREAM     CONNECTED     21701    /run/systemd/journal/stdout
unix  2      [ ]         STREAM     CONNECTED     17876    
unix  3      [ ]         STREAM     CONNECTED     17525    
unix  2      [ ]         DGRAM      CONNECTED     24875    
unix  3      [ ]         STREAM     CONNECTED     26865    
unix  3      [ ]         DGRAM      CONNECTED     17659    
unix  3      [ ]         STREAM     CONNECTED     21816    
unix  3      [ ]         STREAM     CONNECTED     24820    
unix  3      [ ]         STREAM     CONNECTED     24812    
unix  3      [ ]         STREAM     CONNECTED     24810    
unix  3      [ ]         STREAM     CONNECTED     27689    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     4531329  
unix  3      [ ]         STREAM     CONNECTED     332      
unix  3      [ ]         STREAM     CONNECTED     4530257  
unix  3      [ ]         STREAM     CONNECTED     24798    
unix  3      [ ]         STREAM     CONNECTED     18933    /run/dbus/system_bus_socket
unix  2      [ ]         DGRAM      CONNECTED     27745    
unix  3      [ ]         STREAM     CONNECTED     4530254  
unix  3      [ ]         STREAM     CONNECTED     26831    
unix  3      [ ]         STREAM     CONNECTED     18920    /tmp/.X11-unix/X0
unix  3      [ ]         STREAM     CONNECTED     17669    
unix  3      [ ]         DGRAM      CONNECTED     22605    
unix  3      [ ]         STREAM     CONNECTED     214074   
unix  3      [ ]         STREAM     CONNECTED     24817    
unix  3      [ ]         STREAM     CONNECTED     24802    
unix  3      [ ]         STREAM     CONNECTED     28000    
unix  3      [ ]         STREAM     CONNECTED     20641    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     21751    
unix  2      [ ]         DGRAM      CONNECTED     24637    
unix  3      [ ]         STREAM     CONNECTED     17706    
unix  3      [ ]         STREAM     CONNECTED     4531328  
unix  3      [ ]         DGRAM      CONNECTED     17656    
unix  3      [ ]         STREAM     CONNECTED     24814    
unix  2      [ ]         DGRAM      CONNECTED     21830    
unix  3      [ ]         STREAM     CONNECTED     24807    
unix  3      [ ]         STREAM     CONNECTED     17524    
unix  3      [ ]         STREAM     CONNECTED     26792    
unix  3      [ ]         STREAM     CONNECTED     1414157  /run/dbus/system_bus_socket
unix  3      [ ]         STREAM     CONNECTED     20697    
unix  3      [ ]         STREAM     CONNECTED     24821    
unix  3      [ ]         STREAM     CONNECTED     24813    
unix  3      [ ]         STREAM     CONNECTED     21711    /run/systemd/journal/stdout
unix  3      [ ]         DGRAM      CONNECTED     25026    
unix  3      [ ]         STREAM     CONNECTED     24811    
unix  3      [ ]         STREAM     CONNECTED     26864    
unix  3      [ ]         STREAM     CONNECTED     26735    
unix  2      [ ]         STREAM     CONNECTED     3343067  
unix  3      [ ]         STREAM     CONNECTED     20700    
unix  2      [ ]         DGRAM      CONNECTED     441      
unix  3      [ ]         STREAM     CONNECTED     24799    
unix  3      [ ]         STREAM     CONNECTED     21791    
unix  3      [ ]         DGRAM      CONNECTED     24596    
unix  3      [ ]         STREAM     CONNECTED     4530264  
unix  3      [ ]         STREAM     CONNECTED     19623    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     4531331  
unix  2      [ ]         DGRAM      CONNECTED     22603    
unix  3      [ ]         STREAM     CONNECTED     24874    /run/dbus/system_bus_socket
unix  3      [ ]         STREAM     CONNECTED     20689    /run/systemd/journal/stdout
unix  3      [ ]         STREAM     CONNECTED     24803    
unix  3      [ ]         STREAM     CONNECTED     1403698  
unix  3      [ ]         STREAM     CONNECTED     27999    
unix  3      [ ]         STREAM     CONNECTED     214082   
unix  3      [ ]         STREAM     CONNECTED     22642    
unix  3      [ ]         STREAM     CONNECTED     4530259  
```

***

- **Question 1c**: Choose one service from the output and describe what it does.

```bash
/var/run/chrony/chronyd.sock
```

A network socket which is a time synchronization srvice which makes sure that the system clock is accurate by connecting to a remote NTP (Netork Time Protocol)

***

Let’s check the status of the service using systemctl. **What command can you run to do this?**

```bash
systemctl status bind9
```

***

- **Question 2a**: What is the systemctl command to show whether bind9 is running or not?

```bash
systemctl status bind9
```

- **Question 2b**: Why does the dig command (dig ocf.berkeley.edu) work if @localhost is not present at the end (if bind9 is not started) but times out when @localhost is added?

without @localhost `dig` sends to the system default DNS server, while with @localhost `dig` sends the DNS query to the local DNS server; that's why if `bind9` is not running it will time out.

***

- **Question 2c**: What additional entries did you add to your DNS server config (the db.example.com file)?

```bash
test IN CNAME hshs-dev.com.
```

***

- **Question 2d**: What commands did you use to make requests to the local DNS server for your additional entries?

`dig` command

***

Unable to fully complete part3 due to lack of ocf account, but here is my HAProxy config. file:

```bash
global
	log /dev/log	local0
	log /dev/log	local1 notice
	chroot /var/lib/haproxy
	stats socket /run/haproxy/admin.sock mode 660 level admin
	stats timeout 30s
	user haproxy
	group haproxy
	daemon

	# Default SSL material locations
	ca-base /etc/ssl/certs
	crt-base /etc/ssl/private

	# See: https://ssl-config.mozilla.org/#server=haproxy&server-version=2.0.3&config=intermediate
        ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
        ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
        ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
	log	global
	mode	http
	option	httplog
	option	dontlognull
        timeout connect 5000
        timeout client  50000
        timeout server  50000
	errorfile 400 /etc/haproxy/errors/400.http
	errorfile 403 /etc/haproxy/errors/403.http
	errorfile 408 /etc/haproxy/errors/408.http
	errorfile 500 /etc/haproxy/errors/500.http
	errorfile 502 /etc/haproxy/errors/502.http
	errorfile 503 /etc/haproxy/errors/503.http
	errorfile 504 /etc/haproxy/errors/504.http

listen stats
  bind    0.0.0.0:7001
  bind    [::]:7001
  mode    http
  stats   enable
  stats   hide-version
  stats   uri /stats

frontend workers_frontend

  bind [::]:7000 v4v6 
  bind :8080-8085
  default_backend workers

backend workers

  balance roundrobin
  server hshs1 127.0.0.1:8080 check
  server hshs2 127.0.0.1:8081 check
  server hshs3 127.0.0.1:8082 check
  server hshs4 127.0.0.1:8083 check
  server hshs5 127.0.0.1:8084 check
  server hshs6 127.0.0.1:8085 check
```
