# Fawn
> **Labs: Startin Point**

> **Startin Point Tier: 0**

> **Box difficulty: Very Easy**

## Starting Point Labs

Learn the basics of Penetration Testing: Starting Point is a good place to start if you're new to hack the box or in general just to pen testing. This will get you though the beginning and help you out with tips. These machines/boxes in the start point labs are actually very fun to do. So if you just want to try out what it's all about then try at least the first box.

## Machine: Fawn
> Tags: Linux | FTP | Account Misconfiguration

> Has walkthough pdf available

### CONNECT
Just create a connection to the VPN, remember that this is to a special "starting point" vpn so dont just connect to EU1-Free etc. Wont work. To continue you need to be connected.

### Start VM
Just hit Start VM button

### TASK 1
**Question**
> What does the 3-letter acronym FTP stand for? 

**How did i find the information ?**
> Google? But you should know this

**Answer**
```
File Transfer Protocol
```
### TASK 2
**Question**
> What communication model does FTP use, architecturally speaking?  

**How did i find the information ?**
> Google? But you should know this

**Answer**
```
client-server model
```
### TASK 3
**Question**
> What is the name of one popular GUI FTP program?

**How did i find the information ?**
> Honestly, i mostly only use terminal so had to do a quick Google lol ... I have not even used filezilla before!

**Answer**
```
FileZilla
```
### TASK 4
**Question**
> Which port is the FTP service active on usually? 

**How did i find the information ?**
> Google? But you should REALLY know this

**Answer**
```
21 tcp
```
### TASK 5
**Question**
> What acronym is used for the secure version of FTP? 

**How did i find the information ?**
> Again, basic knowlagde but you can just Google it ...

**Answer**
```
sftp
```
### TASK 6
**Question**
> What is the command we can use to test our connection to the target?  

**How did i find the information ?**
> Google? But you should know this

**Answer**
```
ping
```
### TASK 7
**Question**
> From your scans, what version is FTP running on the target?  

**How did i find the information ?**
> From nmap output scanning the ip or you can just telnet to the ip:port and see the header version text.

**Answer**
```
vsFTPd 3.0.3
```
### TASK 8
**Question**
> From your scans, what OS type is running on the target? 

**How did i find the information ?**
> From nmap scanning output

**Answer**
```
unix
```
### SUBMIT FLAGSubmit root flag 
**Question**
> Submit root flag  

**How did i find the information ?**
> Connected to ftp as anonymous and downloaded the flag.txt file.

**Answer**
```
HTB{035db21c881520061c53e0536e44f815}
```
