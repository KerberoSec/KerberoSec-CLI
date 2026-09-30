#CTF #FreeRoom 

https://tryhackme.com/room/rabbitstore

```
nmap

22/tcp    open  ssh
80/tcp    open  http
|_http-title: Did not follow redirect to http://cloudsite.thm/

4369/tcp  open  epmd
| epmd-info: 
|   epmd_port: 4369
|   nodes: 
|_    rabbit: 25672

25672/tcp open  unknown
MAC Address: 02:BE:18:A5:F2:73 (Unknown)

http://cloudsite.thm/

developed by smarteyeapps

gobuster

http://cloudsite.thm/assets/

Apache/2.4.52
exploit db 
https://www.exploit-db.com/exploits/50446       ?

# Erlang Port Mapper Daemon

Port 4369 is used for epmd (Erlang Port Mapper Daemon), which is a small daemon that runs alongside every RabbitMQ node and is used by the runtime to discover what port a particular node listens on for inter-node communication.

"rabbit" strongly suggests that RabbitMQ, a message broker, is in use.

exploit db  RabbitMQ

10.10.101.248

https://www.rabbitmq.com/

https://www.rapid7.com/db/vulnerabilities/debian-cve-2021-22116/
https://www.exploit-db.com/exploits/44902
https://www.rabbitmq.com/tutorials/tutorial-one-python

nmap -sS -sC -A $ip -p 4369

PORT     STATE SERVICE VERSION
4369/tcp open  epmd    Erlang Port Mapper Daemon
| epmd-info: 
|   epmd_port: 4369
|   nodes: 
|_    rabbit: 25672
MAC Address: 02:BE:18:A5:F2:73 (Unknown)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.10 - 3.13 (95%), Linux 3.8 (95%), Linux 3.1 (95%), Linux 3.2 (95%), AXIS 210A or 211 Network Camera (Linux 2.6.17) (94%), ASUS RT-N56U WAP (Linux 3.4) (93%), Linux 3.16 (93%), Adtran 424RG FTTH gateway (92%), Linux 2.6.32 (92%), Linux 2.6.39 - 3.2 (92%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop

TRACEROUTE
HOP RTT     ADDRESS
1   0.34 ms rabbitstore.thm (10.10.101.248)

```

