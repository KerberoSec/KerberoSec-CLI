# Bandit Level 20 --> Level 21
## Level Goal
There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).

**NOTE:** Try connecting to your own network daemon to see if it works as you think

## Commands you may need to solve this level
ssh, nc, cat, bash, screen, tmux, Unix ‘job control’ (bg, fg, jobs, &, CTRL-Z, …)

## Solution

ls command show there is setuid file in home directory
```console
bandit20@bandit:~$ ls
suconnect
```
```console
bandit20@bandit:~$ ./suconnect
Usage: ./suconnect <portnumber>
This program will connect to the given port on localhost using TCP. If it receives the correct password from the other side, the next password is transmitted back.
```

We need to open port for listening but first we should know if there are any open ports to not use them 
```console
bandit20@bandit:~$ nmap localhost

Starting Nmap 7.40 ( https://nmap.org ) at 2021-03-23 13:07 CET
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00027s latency).
Not shown: 997 closed ports
PORT      STATE SERVICE
22/tcp    open  ssh
113/tcp   open  ident
30000/tcp open  ndmps

Nmap done: 1 IP address (1 host up) scanned in 0.09 seconds
```

Open any closed port to listening
```console
nc -l -p 50000
```

In another terminal execute suconnect with the same port
```console
./suconnect 50000
```
Send level password to listener if it match our pass will appear

## Password
> gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr

  
