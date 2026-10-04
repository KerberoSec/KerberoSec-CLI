# CTF-Write-up

## Vulnhub: RickdiculouslyEasy: 1

##### URL: https://www.vulnhub.com/entry/rickdiculouslyeasy-1,207/

##### Created by _https://www.vulnhub.com/author/luke,562/_

![rickandmorty](https://user-images.githubusercontent.com/20625004/160244882-a26c7784-c26c-415b-a091-9e49f37636e6.gif)

Run nmap against the target machine.

```nmap -sC -A  <target IP> -p-```

![nmap](https://user-images.githubusercontent.com/20625004/160244982-b3f9b951-bcd3-4e84-8d58-2e07ce0715d1.PNG)

From the outpout we see that on port 13337 we have found a flag (10) points. **(10/130)**

![flag1](https://user-images.githubusercontent.com/20625004/160245058-95d62490-11ab-4089-baa0-dda4ea22c9a2.PNG)

Further from the ``nmap`` output we see that we have ``anonymous`` access to the ``FTP`` service.

``ftp <target IP> 21``

Connect to the service with anonymous for both username and password.

![ftp](https://user-images.githubusercontent.com/20625004/160245223-a0b585e4-4927-4f91-8b80-687ab1f345d1.PNG)

Inside there is a file download it.

We have find the second flag (10) points. **(20/130)**

![flag2](https://user-images.githubusercontent.com/20625004/160245260-1c0636a0-f41a-48ca-9366-690fba0dc6cc.PNG)

Next access port 80 there is a web site.

![port80](https://user-images.githubusercontent.com/20625004/160245407-ab064a79-bbbd-479f-93df-f67ab2d93310.PNG)

By using ``gobuster`` we were able to find additional paths 

``gobuster dir -u <target IP> -w <path/to/wordlist>``

![gobuster](https://user-images.githubusercontent.com/20625004/160245436-bda34fca-1947-4902-877b-bf04a20b6e0f.PNG)

We have found another flag (10) points. **(30/130)**

![flag3](https://user-images.githubusercontent.com/20625004/160245575-d45551a4-451a-4a4c-9514-6f2ad263c159.PNG)

Further lets checkout the passwords.html file nothing, but with view source we found a password, that we can use later on.

![winter](https://user-images.githubusercontent.com/20625004/160245746-20aa21b8-ed18-43e8-8927-8a4245d83cea.PNG)

View ``robots.txt`` reveals the following:

```They're Robots Morty! It's ok to shoot them! They're just Robots!

/cgi-bin/root_shell.cgi
/cgi-bin/tracertool.cgi
/cgi-bin/*
```

``tracertool.cgi`` is a web application that performs traceroute on a given IP. 
Lets test the input for command injection, insert a semi-colon ``;`` to run a command. 

![whoami](https://user-images.githubusercontent.com/20625004/160247668-f1549418-6c00-4ff8-83f0-9bb0c5920492.PNG)

The site does not have any restrictions to the input we entered, thus we can use that in our advantage and run arbitrary commands.

Ok lets check now if we can access ``/etc/passwd``

![cat](https://user-images.githubusercontent.com/20625004/160247832-0d380248-d929-4c5c-bfee-547b03930a86.PNG)

Nice one cat command has been replaced, and it shows an ASCII cat. 
OK lets use ``less`` command to see the outcome.

![etc1](https://user-images.githubusercontent.com/20625004/160247949-37f4a3d1-f413-4709-874a-109ddc74ac1d.PNG)

Nice on the bottom we see three users. From previous step we have a password ``winter`` we can use it with user ``Summer`` and access ``SSH`` service.

![flag6](https://user-images.githubusercontent.com/20625004/160248055-049febd6-f068-4157-ab04-98831e049259.PNG)

Success we found another flag (10) points. **(40/130)**

![python](https://user-images.githubusercontent.com/20625004/160251823-d28fa2c5-721a-42eb-9ebb-470cd7da4237.PNG)

Further in Morty's Home direcotry there are two files lets donwload them.

``Python`` is installed on the system so we can use the command ``python -m SimpleHTTPServer port number`` and dowload those files to our system.

Back in our system we enter ``http://<target IP>:port/nameOftheFile``

We see a ``jpg`` picture.

![rick](https://user-images.githubusercontent.com/20625004/160251964-08dbfd00-2675-4500-ba53-d33a1dee416c.PNG)

Ok by using the command ``strings`` we found another password.

![pass_jpg](https://user-images.githubusercontent.com/20625004/160252029-6c2b128e-17b4-4cf4-b1d0-2175f11c8cbf.PNG)

Nice now for the zip file. Unzip the file ``unzip file`` is asking for password, use the one we found in previous step.

![flag7](https://user-images.githubusercontent.com/20625004/160252111-478d2ee5-790d-413c-ab68-394f960ba851.PNG)

Nice we found another flag (20) points. **(60/130)**

Now back again on Summer's access let's dig on Rick's home directory.

![rick_home](https://user-images.githubusercontent.com/20625004/160252185-d054e12e-233f-48fc-b3ba-c0bc68489bea.PNG)

There are two folders.

![no_flag](https://user-images.githubusercontent.com/20625004/160252244-65877724-a7d6-4745-9db3-415e013cc255.PNG)

Nothing there ok move to the other folder.

![safe](https://user-images.githubusercontent.com/20625004/160252269-a0531349-e96e-4407-8dd7-76e31f54dd82.PNG)

The file ``safe`` is a binary file which needs arguments based on previous flag.

As user ``Summer`` in that directory we do not have permissions to execute it. Let's copy the file to another folder.

![copy](https://user-images.githubusercontent.com/20625004/160252535-417b721a-e1a7-4889-9ae1-59e848237a0c.PNG)

Nice we found another flag (20) points. **(80/130)**

![flag8](https://user-images.githubusercontent.com/20625004/160252571-79434006-12ea-4daf-9783-ebd329052b07.PNG)

There is a hint there and some notes regarding the password.
We have to create a custom wordlist with the info we have aquired from the flag.

Rick's band is ``The Flesh Curtains``.

``https://rickandmorty.fandom.com/wiki/The_Flesh_Curtains``

![band](https://user-images.githubusercontent.com/20625004/160252695-62426dc4-252c-4c5a-aa15-60c4bc43c489.PNG)

Lets use ``crunch`` tool to create a custom wordlist.

![wordlist](https://user-images.githubusercontent.com/20625004/160253036-2e41e1af-0479-40e3-88db-5b7bde188ae9.PNG)

Now lets combine those two wordlists into one with ``cat`` command.

![combine](https://user-images.githubusercontent.com/20625004/160253067-2f5a9c2b-cf62-45bd-a4cc-bd54b99f7cfe.PNG)

Now we are going to use ``Hydra`` and try to brute force the ``SSH`` of rick with the wordlist we have created.

![hydra](https://user-images.githubusercontent.com/20625004/160253633-33005b1e-fdde-4081-87f8-9a2da314bbf5.PNG)

We found the password now login to the ``SSH`` account

![rick_ssh](https://user-images.githubusercontent.com/20625004/160253612-54abcd44-5a07-4c34-9ccd-28d0e3aff257.PNG)

Run ``sudo -l`` to see what the user can run with root privileges

![sudo](https://user-images.githubusercontent.com/20625004/160253715-e3c2d2f9-6c40-4433-8a8e-cb1f31812814.PNG)

User can execute any command using sudo so use ``sudo su`` to escalate our privileges:

![root](https://user-images.githubusercontent.com/20625004/160253813-081a850e-9107-4c26-9965-52074e52c209.PNG)

Success and we found the flag on the root directory, flag (30) points. **(110/130)**

Moving on to port 9090 another web site.

![flag4](https://user-images.githubusercontent.com/20625004/160245859-8228f4dd-99d2-4f15-9cf0-228c8efe8298.PNG)

We found another flag (10) points. **(120/130)**

Moving on to port 60000, the output from ``nmap`` was the following.
```60000/tcp open  unknown
|_drda-info: ERROR
| fingerprint-strings: 
|   NULL, ibm-db2: 
|_    Welcome to Ricks half baked reverse shell
```
Lets use netcat ``nc target IP port``

![flag5](https://user-images.githubusercontent.com/20625004/160245969-d92964fa-a94f-4f0a-b0cb-98b763070e2d.PNG)

Another flag success (10) points. **(130/130)**

