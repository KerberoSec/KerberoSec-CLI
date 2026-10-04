# Meow
### Task 1
- What does the acronym VM stand for?
```
Virtual Machine
```

### Task 2
- What tool do we use to interact with the operating system in order to start our VPN connection?
```
terminal
```
### Task 3
- What service do we use to form our VPN connection?
```
openvpn
```
### Task 4
- What is the abreviated name for a tunnel interface in the output of your VPN boot-up sequence output?
```
tun
```
### Task 5
- What tool do we use to test our connection to the target?
```
ping
```
### Task 6
- What is the name of the tool we use to scan the target's ports?
```
nmap
```
### Task 7
- What service do we identify on port 23/tcp during our scans?
```
telnet
```
### Task 8
- What username ultimately works with the remote management login prompt for the target?
```
root
```
### SUBMIT FLAG

```bash
root# ping 10.129.206.241
root# nmap -sV 10.129.206.241
the open port is 23/tcp Telnet

root# telnet 10.129.206.241
root# cat flag.txt
```
