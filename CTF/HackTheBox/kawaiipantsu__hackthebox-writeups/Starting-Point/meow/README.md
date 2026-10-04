# Meow
> **Labs: Startin Point**

> **Startin Point Tier: 0**

> **Box difficulty: Very Easy**

## Starting Point Labs

Learn the basics of Penetration Testing: Starting Point is a good place to start if you're new to hack the box or in general just to pen testing. This will get you though the beginning and help you out with tips. These machines/boxes in the start point labs are actually very fun to do. So if you just want to try out what it's all about then try at least the first box.

## Machine: Meow
> Tags: Linux | Network | Account Misconfiguration

> Has walkthough pdf available

### CONNECT
Just create a connection to the VPN, remember that this is to a special "starting point" vpn so dont just connect to EU1-Free etc. Wont work. To continue you need to be connected.

### Start VM
Just hit Start VM button

### TASK 1
**Question**
> What does the acronym VM stand for? 

**How did i find the information ?**
> Google? But you should know this :)

**Answer**
```
virtual machine
```

### TASK 2
**Question**
> What tool do we use to interact with the operating system in order to start our VPN connection?

**How did i find the information ?**
> Google? But you should know this :)

**Answer**
```
Terminal
```

### TASK 3
**Question**
> What service do we use to form our VPN connection? 

**How did i find the information ?**
> Google? But you should know this :)

**Answer**
```
Openvpn
```

### TASK 4
**Question**
> What is the abreviated name for a tunnel interface in the output of your VPN boot-up sequence output? 

**How did i find the information ?**
> You can see this by doing a `ifconfig` that lists your interfaces.
> But you should already know this.

**Answer**
```
tun
```

### TASK 5
**Question**
> What tool do we use to test our connection to the target? 

**How did i find the information ?**
> Google? But you should know this :)

**Answer**
```
ping
```

### TASK 6
**Question**
> What is the name of the script we use to scan the target's ports? 

**How did i find the information ?**
> You should know this, but i would like to say i dont call nmap for a script. It's a program. So their question can be a bit misleading if you ask me.

**Answer**
```
nmap
```

### TASK 7
**Question**
> What service do we identify on port 23/tcp during our scans? 

**How did i find the information ?**
> Obviously we want to use nmap to see ports open, question is how we use nmap.
> You can either google it or just do `man nmap` to see the manual. Also, even without the portscan you should know what runs on port 23/tcp default.

**Answer**
```
telnet
```

### TASK 8
**Question**
> What username ultimately works with the remote management login prompt for the target? 

**How did i find the information ?**
> First try would be the administrator username of any linux distribution

**Answer**
```
root
```

### SUBMIT FLAG
**Question**
> Submit root flag 

**How did i find the information ?**
> Found the flag.txt file in the user directory, look at the content.

**Answer**
```
HTB{b40abdfe23665f766f9c61ecba8a4c19}
```
