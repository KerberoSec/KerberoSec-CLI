```
_____________ ________________           _______                                                        _____ 
__  ___/__  /____(_)__  /__  /_______    ___    |_______________________________________ _________________  /_
_____ \__  //_/_  /__  /__  /__  ___/    __  /| |_  ___/_  ___/  _ \_  ___/_  ___/_  __ `__ \  _ \_  __ \  __/
____/ /_  ,<  _  / _  / _  / _(__  )     _  ___ |(__  )_(__  )/  __/(__  )_(__  )_  / / / / /  __/  / / / /_  
/____/ /_/|_| /_/  /_/  /_/  /____/      /_/  |_/____/ /____/ \___//____/ /____/ /_/ /_/ /_/\___//_/ /_/\__/  
```
You are given an online academy's IP address but have no further information about their
website. As the first step of conducting a Penetration Test, you are expected to locate
all pages and domains linked to their IP to enumerate the IP and domains properly.
Finally, you should do some fuzzing on pages you identify to see if any of them has any
parameters that can be interacted with. If you do find active parameters, see if you can
retrieve any data from them. [^1]

Run a sub-domain/vhost fuzzing scan on '*.academy.htb' for the IP shown above. What are
all the sub-domains you can identify? 
-----------------------------------------------------------------------------------------
At first, we run a `ffuf` scan on all the subdomains without any filtering but then, we
quickly identify that the size 985 is for incorrect subdomains, so we apply the filter
accordingly and identify the subdomains *test*, *archive* and *faculty*.

```bash
ffuf -w /opt/useful/seclists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ
     -u http://academy.htb:41211/ -H 'Host: FUZZ.academy.htb' -fs 985
```

We must now add them to the `/etc/hosts` file and can check if we can access the
subdomain URL in the browser.

Before you run your page fuzzing scan, you should first run an extension fuzzing scan.
What are the different extensions accepted by the domains? 
-----------------------------------------------------------------------------------------
Now, we browse through the SecLists and discover the web-extensions dictionary which we
can then use to discover for the extension fuzzing scan on all the subdomains. This way,
we discover the extensions *.php*, *.phps* and *.php7* from the subdomains faculty,
archive and test combined.

```bash
ffuf -w /opt/useful/seclists/Discovery/Web-Content/web-extensions.txt:FUZZ
     -u http://faculty.academy.htb:41211/indexFUZZ
```

One of the pages you will identify should say 'You don't have access!'. What is the full
page URL? 
-----------------------------------------------------------------------------------------
For this task, we create a ffuf query that works recursively and with the file extensions
we got from the previous task. We can also filter for the 287 length.

```bash
ffuf -w /opt/useful/seclists/Discovery/Web-Content/directory-list-2.3-small.txt
     -u http://faculty.academy.htb:41211/FUZZ -recursion -recursion-depth 1
     -e .php,.phps,.php7 -fs 287
```

Here, we can see that the courses subdirectory is detected and in it, ffuf found the
*linux-security.php7* file besides common index PHP files. So, we can open the file at
`http://faculty.academy.htb:41211/courses/linux-security.php7` and are informed that we
have no access rights to view it.

In the page from the previous question, you should be able to find multiple parameters
that are accepted by the page. What are they? 
-----------------------------------------------------------------------------------------
Again, we preform a fuzzing query, this time to retrieve the POST parameters.

```bash
ffuf -w /opt/useful/seclists/Discovery/Web-Content/burp-parameter-names.txt
     -u http://faculty[.]academy[.]htb:41211/courses/linux-security.php7 -X POST
     -d 'FUZZ=key'-H 'Content-Type: application/x-www-form-urlencoded' -fs 774
```

This way, we find out that the *user* and *username* parameters are accepted here.

Try fuzzing the parameters you identified for working values. One of them should return a
flag. What is the content of the flag? 
-----------------------------------------------------------------------------------------
For the last task, we want to use a usernames wordlist and provide it as a fuzzing
parameter to the "user" and "username" for the website from the previous task.

```bash
ffuf -w /opt/useful/seclists/Usernames/xato-net-10-million-usernames.txt -fs 781
     -u http://faculty.academy.htb:41211/courses/linux-security.php7 -X POST
     -d 'username=FUZZ' -H 'Content-Type: application/x-www-form-urlencoded'
```

At first, we try the `top-usernames-shortlists.txt` as a dictionary but don't
succeed. Then, we try the `xato-net-10-million-usernames.txt` and are able to find
the usernames *harry*, *Harry* and *HARRY*. We then provide them in `username=HARRY`
one after the other and finally get the flag for the last one.

[^1]: https://academy.hackthebox.com/module/54
