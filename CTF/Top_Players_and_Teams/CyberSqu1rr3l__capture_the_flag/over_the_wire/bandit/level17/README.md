```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  |_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 |/ /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|_/   
```
The credentials for the next level can be retrieved by submitting the password of the
current level to a port on localhost in the range 31000 to 32000. First find out which
of these ports have a server listening on them. Then find out which of those speak
SSL/TLS and which don’t. There is only one server that will give the next credentials,
the others will simply send back to you whatever you send to it. In case we are
getting the *DONE*, *RENEGOTIATING* or *KEYUPDATE* keywords, it is best to read the
*CONNECTED COMMANDS* section in the manpage. [^1]

Solution
----------------------------------------------------------------------------------------
First, we want to scan the localhost for all ports in the range 31000 to 32000.
Thus, we are able to discover five open ports.
```bash
$ nmap -p 31000-32000 localhost

PORT      STATE SERVICE
31046/tcp open  unknown
31518/tcp open  unknown
31691/tcp open  unknown
31790/tcp open  unknown
31960/tcp open  unknown
```
Now, we want to find out the port that communicates via SSL/TLS by attempting an
`openssl` connection for each one.
```bash
cat /etc/bandit_pass/bandit16 | openssl s_client -connect localhost:31046 -ign_eof
cat /etc/bandit_pass/bandit16 | openssl s_client -connect localhost:31518 -ign_eof
cat /etc/bandit_pass/bandit16 | openssl s_client -connect localhost:31691 -ign_eof
cat /etc/bandit_pass/bandit16 | openssl s_client -connect localhost:31790 -ign_eof
```
With the fourth attempt, we were finally able to intercept a RSA privat key, that we
can copy to our system. Note, that in order to login with it, we first need to adjust
it's permissions via `chmod 600 sshkey.private`. And, then we can log in to the new
level with `ssh -i sshkey.private -o IdentitiesOnly=yes -p 2220
bandit17@bandit.labs.overthewire.org` and finally obtain the level 17 password with
`cat /etc/bandit_pass/bandit17`.

[^1]: https://overthewire.org/wargames/bandit/bandit17.html
