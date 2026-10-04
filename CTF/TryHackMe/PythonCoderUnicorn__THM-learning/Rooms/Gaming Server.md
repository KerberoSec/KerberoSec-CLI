An easy Boot2Root box for beginners

- https://tryhackme.com/room/gamingserver

Can you gain access to this gaming server built by amateurs with no experience of web development and take advantage of the deployment system.

we have an IP address, so enumerate using Nmap
- `nmap -sS -sV x.x.x.x --top-ports 1000 `
- we get back 2 ports open: 22 OpenSSH and 80 HTTP Apache 2.4.29
- go to the browser IP address at port 80

the webpage is Draagan, some dummy dragon fiction site.
inspect source code, we see the name `John` in a comment

- video links to about.html has uploads/  when you click on it takes you to a directory
- myths links to myths.html
- archives links to nowhere

about.html has uploads/  when you click on it takes you to a directory

- dict.list , a list of possible passwords, so need to get this  file `wget x.x.x.x/uploads/dict.lst`
- manifesto.txt, the hacker manifesto of 1986
- meme.jpg , image is of Muppet's Beeker

> with images it is good idea to check for any steganography (strings, exiftool, binwalk), but i did not for this task

now would be a time to use OWASP dirbuster to enumerate any other directories

inside the THM AttackBox go to Applications > Web > Fuzzing > Dirb
- `dirb http://x.x.x.x -o dirb-scans.txt`
- dirb found 3 directories including secret/

go to secret/
- there is a `secretKey` which is a RSA key
- we grab this `wget x.x.x.x/secret/secretKey`

right now we have:
- name 'john'
- dictionary of passwords `dict.lst`
- RSA key `secretKey` , need to `chmod 600 secretKey` to use this
- port 22 open

SSH + RSA key, use John the Ripper
- `ssh -i secretKey john@x.x.x.x`
- get asked about passphrase for `secretKey`

since we don't know the passphrase we need to crack the `secretKey` for the SSH, John the Ripper has that tool `ssh2john.py`
- the AttackBox path to John the Ripper tool is `~/Tools/Password Attacks/john/ssh2john.py`
- `python ~/Tools/Password Attacks/john/ssh2john.py > hash`
- we have the .hash file and the `dict.lst` we can pass those to John the Ripper
- `john dict.lst hash`

> NOT FINISHED

