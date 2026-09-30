source: [SSH_explained](https://youtu.be/Ei3nU-fHI6E?si=cA6H6RYYdyjuvWqo)

## What is SSH?
SSH or Shell is a network communication protocal that enables two computers/devices to communicate and share data

## Why it is called as secure shell?
Because communication between host and client will be in encrypt format.

## More about SSH
The default port for SSH client connections is 22  
We can change the default port and use one between 1024 and 32,767  
SSH is also a command in Linux.  
It is used to access an another Linux server or accessing a Linux server from a terminal.  
__Syntax:__ ```ssh user_name@host(ip/Domain_name)```  
__Example:__```ssh goku@192.168.0.114```  

## How to use SSH?
To use SSH, ssh service must be installed on linux server  
You can check using ```rpm -qa | grep ssh,``` or check the file ```/etc/ssh/sshd_config```  
If not already installed then install below to ```install openssh_clients openssh-server```  
and now enable the ssh or check if it is enabled using ```systemctl status sshd```  

## How to access remote server without password?
If you frquently access the server then its goof idea to configure your ssh key so thet you can login without password  

__Follow the steps below__
1. Generate a new ssh key pair on local machine.
2. Copy public key to Remote Machine.
3. Login to remote server without password.

__Its a 3 step process:__

- step1 : Generate an SSH key using  
```ssh-keygen```  
- step2 : Check generated key using  
```ls -l .ssh```  
```cat `/.ssh/id_rsa.pub```  
- step3 : Copy public SSH key to remote server. (on remote server it is copied under ```~/.ssh/authorizedkeys``` file)  
```ssh-copy-id root@192.168....``` (It will copy by default public key)

