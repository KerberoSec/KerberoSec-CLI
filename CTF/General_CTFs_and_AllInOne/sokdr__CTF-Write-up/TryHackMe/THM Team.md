# CTF-Write-up

## Try Hack Me: Team

##### URL: https://tryhackme.com/room/teamcw

##### Created by _https://tryhackme.com/p/dalemazza_

![logo](https://user-images.githubusercontent.com/20625004/113483507-76011400-94ac-11eb-8bcc-472c91b4fec4.PNG)

You should deploy the machine first.
 
Run nmap against the target machine.

```nmap -sC -A <target IP>```

Port 80 web access, ftp and ssh.

![port80](https://user-images.githubusercontent.com/20625004/113483533-9df07780-94ac-11eb-865b-3439a5ce3ece.PNG)

Fired ``gobuster`` on the target IP with nothing notable.

I searched the first page and it says that you should at 'team.thm' to your hosts! file.

![curl1](https://user-images.githubusercontent.com/20625004/113483653-371f8e00-94ad-11eb-90fc-f2bfe22b35b9.PNG)

Add it to your host file ```echo "Target IP team.thm" >> /etc/hosts```.

![new](https://user-images.githubusercontent.com/20625004/113483734-a1383300-94ad-11eb-922b-084cccf1a369.PNG)

Fire again ```gobuster```.

```gobuster dir <target IP> -w /path/to/wordlist```.

![go2](https://user-images.githubusercontent.com/20625004/113484150-751db180-94af-11eb-87a6-939c7c8fdac2.PNG)

I accessed first robots.txt and found a name and tried to bruteforce the ftp and the SSH with hydra, but nothing.

![dale](https://user-images.githubusercontent.com/20625004/113486860-735aea80-94bd-11eb-80d7-e4338b456200.PNG)

Let's access ``scripts```.

![go1](https://user-images.githubusercontent.com/20625004/113484083-2f60e900-94af-11eb-9034-415936cac465.PNG)

Fire again ```gobuster``` with the new path.

Nothing, it says scripts maybe if we search with an extension like txt gobuster might bring something up.

Fire again ```gobuster``` along with ``-x`` flag and ```txt```.
 
```gobuster dir <target IP> -w /path/to/wordlist -x extension```.

OK now it brought up ```script.txt```.

![script](https://user-images.githubusercontent.com/20625004/113484380-aea2ec80-94b0-11eb-9004-4fa4edcdf28e.PNG)

There is a note at the end that there is also an old script. Lest search again with ```old``` extension in ```gobuster```.

```gobuster dir <target IP> -w /path/to/wordlist -x extension1,extension2```.

OK it found it, and it contains the ftpuser username and password.

![ftp_user](https://user-images.githubusercontent.com/20625004/113484462-148f7400-94b1-11eb-9f47-0ef48844d158.PNG)

Use the above information to access the ftp, there is a file, download it.

![ftp_access](https://user-images.githubusercontent.com/20625004/113484546-8f588f00-94b1-11eb-97dd-a00b387f3112.PNG)

There are two names into the txt and some information.

![new_site](https://user-images.githubusercontent.com/20625004/113484589-ccbd1c80-94b1-11eb-9511-927166d766ca.PNG)

Now add the ```dev``` again in the hosts file.

```echo "Target IP dev.team.thm" >> /etc/hosts```.

![dev](https://user-images.githubusercontent.com/20625004/113484647-1c034d00-94b2-11eb-970a-0b832a6ec684.PNG)

Follow the link.

![dev1](https://user-images.githubusercontent.com/20625004/113484665-30dfe080-94b2-11eb-81a1-1a0b3e5ae504.PNG)

OK lets check for Local File Inclusion vulnerability in place here.

![passwd](https://user-images.githubusercontent.com/20625004/113484711-68e72380-94b2-11eb-8444-a4cf000ef635.PNG)

It worked now we can search various folders and paths, since this can take a lot, i created a bash script with paths to automate this part.
Seclists can help you ```https://github.com/danielmiessler/SecLists/blob/master/Fuzzing/LFI/LFI-LFISuite-pathtotest.txt```.

Create a txt file with the paths that you want to search, i created the below script.

![bash](https://user-images.githubusercontent.com/20625004/113485368-c630a400-94b5-11eb-8006-80076f832738.PNG)

We found ```id_rsa```, the path to found it ```/etc/ssh/sshd_config```.

![ssh](https://user-images.githubusercontent.com/20625004/113485394-f0826180-94b5-11eb-979d-079817bd11bc.PNG)

![private](https://user-images.githubusercontent.com/20625004/113485441-232c5a00-94b6-11eb-8682-0facfd527a0a.PNG)

We found the private ssh key of ```Dale``` user, download it.

```wget http://dev.team.thm/script.php?page=/etc/ssh/sshd_config```.

Remove everythin else and keep only the private key.

Remove the commnets and denote proper ssh permissions chmod 600 <file>.

Access SSH ```ssh -i <file> dale@target IP```.

We have access and found our first flag.

![user](https://user-images.githubusercontent.com/20625004/113485625-3855b880-94b7-11eb-843d-9bbb455da22d.PNG)

Privilege escalation.

Type ```sudo -l```, to find what commands the current user can execute as other users.

![sudo_l](https://user-images.githubusercontent.com/20625004/113485663-6affb100-94b7-11eb-9807-40d22b4ca5ff.PNG)

It is a script that the user gyles can run. After digging around, we see that there are three possible places where we can inject system commands 
on the script. We will inject the error variable with /bin/bash as payload because it will spawn a bash shell, and run as gyles user.

![admin_rights](https://user-images.githubusercontent.com/20625004/113485853-65569b00-94b8-11eb-8e33-c28e90ed1fb8.PNG)

![escalte](https://user-images.githubusercontent.com/20625004/113485915-d72ee480-94b8-11eb-8eac-9bc2e63fde76.PNG)

And we have access to the gyles user. 

Also use this ```python3 -c 'import pty;pty.spawn("/bin/bash")'``` to have an interactive terminal.

Search```cat .bash_history``` for commands executed on the system, there is ```/usr/local/bin/main_backup.sh ```.

Looking at the file it’s a bash script that copies backups,
lets add inside a reverse shell.

![shell](https://user-images.githubusercontent.com/20625004/113486173-0db92f00-94ba-11eb-89d1-1c78e1262381.PNG)

We have permission to modify and run it.

![perimissions](https://user-images.githubusercontent.com/20625004/113486229-5c66c900-94ba-11eb-9ea6-986c8f676064.PNG)

Before executing the script open a netcat listener on your system.

```nc -lvnp local port```.

Run the script.

![root](https://user-images.githubusercontent.com/20625004/113486591-51149d00-94bc-11eb-9a6b-86bef5af35c7.PNG)

And you have root access, and the flag.
