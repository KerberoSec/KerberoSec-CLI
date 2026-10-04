```
    ___     _              _        _                       ___      _              _     
   | _ \   (_)     __     | |__    | |     ___      o O O  | _ \    (_)     __     | |__  
   |  _/   | |    / _|    | / /    | |    / -_)    o       |   /    | |    / _|    | / /  
  _|_|_   _|_|_   \__|_   |_\_\   _|_|_   \___|   TS__[O]  |_|_\   _|_|_   \__|_   |_\_\  
_| """ |_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| {======|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'./o--000'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
```
This is a Rick and Morty CTF to help turn Rick back into a human hosted on THM. [^1]
The challenge requires us to exploit a web server and find three ingredients to help
Rick make his potion and transform himself back into a human from a pickle.

Ingredient 1: What is the first ingredient that Rick needs?
-----------------------------------------------------------------------------------------
At first, we inspect the source code of the website hosted on the target machine and
discover a comment referencing the username "R1ckRul3s". Besides this, we can browse the
`/assets/` directory with images and scripts but can not discover anything of particular
interest here. Further, we find the cryptic note "Wubbalubbadubdub" in the `robots.txt`
file. Then, we perform more file system enumeration on the server with `gobuster` and
`nmap` and discover the following entries.
```
$ gobuster dir -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
    -u <MACHINE_IP_ADDRESS>

/.hta (Status: 403)                                                             
/.htaccess (Status: 403)                                                        
/assets (Status: 301)                                                           
/.htpasswd (Status: 403)                                                        
/index.html (Status: 200)                                                       
/robots.txt (Status: 200)                                                       
/server-status (Status: 403)
```
Out of curiosity, we access the `login.php` file and try to login with the provided
username "R1ckRul3s" and guessed password "Wubbalubbadubdub" which gives us access to the
command panel. Here, we can poke around with some commands and list the directory first.
```
total 32
-rwxr-xr-x 1 ubuntu ubuntu   17 Feb 10  2019 Sup3rS3cretPickl3Ingred.txt
drwxrwxr-x 2 ubuntu ubuntu 4096 Feb 10  2019 assets
-rwxr-xr-x 1 ubuntu ubuntu   54 Feb 10  2019 clue.txt
-rwxr-xr-x 1 ubuntu ubuntu 1105 Feb 10  2019 denied.php
-rwxrwxrwx 1 ubuntu ubuntu 1062 Feb 10  2019 index.html
-rwxr-xr-x 1 ubuntu ubuntu 1438 Feb 10  2019 login.php
-rwxr-xr-x 1 ubuntu ubuntu 2044 Feb 10  2019 portal.php
-rwxr-xr-x 1 ubuntu ubuntu   17 Feb 10  2019 robots.txt
```
For example, this `ls -l` command lead us to the suspicious-looking file
`Sup3rS3cretPickl3Ingred.txt` which contains the first ingredient. Note, that the `cat`
command has been disabled to make it hard for future pickle rick. Yet, this is no problem
as we can simply use another command to print the file, like `less` or `nl`.

Ingredient 2: What is the second ingredient in Rick’s potion?
-----------------------------------------------------------------------------------------
Upon reading the `clue.txt` in the file system of the Rick Portal, we want to look around
the file system for the other ingredient. Therefore, we use the directory enumeration
command `find / -iname "*ingredient*"` to then discover the second ingredient to Rick's
elixir in the `/home/rick/second\ ingredients` file. 

Ingredient 3: What is the last and final ingredient?
-----------------------------------------------------------------------------------------
Upon browsing the source code to the `portal.php` application, we notice the encrypted
note `Vm1wR1UxTnRWa2RUV0d4VFlrZFNjRlV3V2t0alJsWnlWbXQwVkUxV1duaFZNakExVkcxS1NHVkliRmhoTVhCb1ZsWmFWMVpWTVVWaGVqQT0==`
and suspect it to be a cookie value to get access to the real Rick user, e.g. for admin
access in the Rick Portal. But, recurring decryption of the string with `base64 -d` does
not yield anything useful, in the end we are resulting with the string "rabbit hole" upon
around seven times of recursive base64 decryption.
Since, we are aiming to become the admin, aka. real Rick on the web application, we try
a privilege escalation attack with `sudo`. And indeed, this works and we are given root
rights with this circumvention. Now, we can browse the `/root/` directory and immediately
discover the `3rd.txt` file containing the third ingredient, which can be printed with
the `sudo less /root/3rd.txt` command.

The `denied.php` application does not leave the impression that a successful log in as
the real Rick is possible to us, so the "Potions" and "Creatures" pages might be out of
our reach or unimplemented.

[^1]: https://tryhackme.com/room/picklerick
