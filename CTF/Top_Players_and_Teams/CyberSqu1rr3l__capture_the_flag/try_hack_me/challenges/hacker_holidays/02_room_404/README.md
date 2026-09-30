```
░█▀▄░█▀█░█▀█░█▄█░░░█░█░▄▀▄░█░█
░█▀▄░█░█░█░█░█░█░░░░▀█░█/█░░▀█
░▀░▀░▀▀▀░▀▀▀░▀░▀░░░░░▀░░▀░░░░▀
```
He booked the quiet room. It's not on the floor plan, not in the brochure, not on any
door. But port 8080 is wide open, and the rooms it never lists are the ones worth
finding. [^1]

What is the flag?
-----------------------------------------------------------------------------------------
We begin by visiting the website `http://<TARGET_IP_ADDRESS>/8080` in our browser and
proceed to dump the exposed source code. This way, we spot the `/booking` page which
returns the HTTP error *404*, not found. At first, we look around a bit more, but can not
find anything of particular interest in the network developer tools and such. So, we
proceed to scan the web server with `nmap` and then `gobuster` for hidden pages.
```
nmap -p- <TARGET_IP_ADDRESS>

PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http-proxy
```
In `nmap` we can not spot any further ports just like the description says, but in
`gobuster` we can discover an interesting `.git` reference.
```
gobuster dir -u http://<TARGET_IP_ADDRESS>:8080 -w /usr/share/wordlists/dirb/common.txt

/.git/HEAD            (Status: 200) [Size: 21]
```
After researching what this `.git` disclosure means, we suspect to be able to download
repository metadata, source code, the commit history and find potential secrets.
Therefore, we search for some tools who can help us with recovering the hidden
repository. At first, we try out the *GitTools* [^2] dumper but are not successful with
it. Then, we discover the *git-dumper* [^3] tool which can be installed with `pip` and
works just fine.
```
git-dumper http://<TARGET_IP_ADDRESS>:8080/.git/HEAD git-dumper
```
This way, we were able to recover the full git repository, including the application
`app.gs`, web page `index.html` and valuable `README.md` containing the flag straight
away.

[^1]: https://tryhackme.com/room/hh-room404-804573bf
[^2]: https://github.com/internetwache/GitTools
[^3]: https://github.com/arthaud/git-dumper
