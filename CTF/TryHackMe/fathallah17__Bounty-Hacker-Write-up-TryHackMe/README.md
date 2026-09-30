# Bounty Hacker | Write-up (THM)
![bounty](https://github.com/user-attachments/assets/428cc711-bae3-4c47-9f96-a7135bbe2c1c)

## Enumeration
#### First step in almost every box, running an ```nmap``` scan.
```
sudo nmap -T4 -p- -A (ip)
```
#### After reviewing the results of the nmap scan, we can point out some useful findings:
1. anonymous access to ```FTP``` on port 21
2. HTTP page and Apache 2.4.18 server on port 80
3. ```SSH``` on port 22

![image](https://github.com/user-attachments/assets/947c917d-04df-48f5-bf78-eb5edd3b439a)

## HTTP
#### After reaching this page in the browser we saw this:
![page](https://github.com/user-attachments/assets/a4c9e5cc-49f2-4f90-8391-32000b842dc1)
#### This page is useful anecdotally, but there's really nothing we can use later, except for some names as potential ```usernames```.

#### I used ```Gobuster``` to check for any login pages, but nothing was helpful.
```
gobuster dir -w (wordlist) -u (url)
```
![gobuster](https://github.com/user-attachments/assets/b2205df9-021d-42c3-acd7-a55175836dad)

## FTP
#### ```Nmap``` scan showed us that ```anonymous FTP login is allowed```, so why not use it.
```
ftp (ip)
```
![image](https://github.com/user-attachments/assets/35d5d5fe-3b14-44f9-897e-c2a1c24ae2dd)

#### We see two files, ```locks.txt``` and ```task.txt```
#### All we need to do now is read the files, so let's use the ```get(filename)``` command and read them to our machine.
#### The first file gives us a set of passwords and ```task.txt``` is some tasks written by ***

![image](https://github.com/user-attachments/assets/44f2488f-e0c4-4448-8672-ff7be85c04ee)

## Brute-Force:
#### Let's put these names on the web page into a file that includes the name we found in ```task.txt``` and call it ```user.txt```.
#### Since we only have ```ssh```, the next step we need to do is run ```hydra``` to force ```ssh``` login to use the password list which is ```locks.txt```.
```
hydra ssh://ip -L users.txt -P locks.txt
```
![image](https://github.com/user-attachments/assets/e8fb817f-bc6e-4c5a-b1ec-7af2a48b1381)
#### Now we got credentials and can log in ```ssh``` and read ```user.txt```

## SSH
#### let’s login using ```ssh``` !
![image](https://github.com/user-attachments/assets/38283bb0-78fa-440c-8a6a-c435ea086396)

![image](https://github.com/user-attachments/assets/19e61b23-a862-492b-aa26-a2edff3d2c78)

## Privilege Escalation and Root flag
#### Trying to get to root is impossible at the moment because we are currently just the user *** himself.
#### Let’s run ```sudo -l``` to see what the user can run as another user or root
![image](https://github.com/user-attachments/assets/597f613f-53bd-48a1-a091-b1aa00f4635c)
#### It can be seen that we can run tar as root.
#### Go to [gtfobins](https://gtfobins.github.io/) and search for ```tar```
![image](https://github.com/user-attachments/assets/6112a82a-303d-4360-9841-8dccdfea2761)
```
sudo tar -cf /dev/null /dev/null: checkpoint=1: checkpoint-action=exec=/bin/sh
```
![image](https://github.com/user-attachments/assets/e862db5d-a45c-4e5c-84ed-9eefd369cd8e)
#### Let’s grab this flag !! 🚩

#### That's all about this machine. Enjoy hacking!

