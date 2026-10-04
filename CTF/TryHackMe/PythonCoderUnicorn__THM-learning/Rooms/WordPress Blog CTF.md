#wordpress 

https://tryhackme.com/r/room/blog

https://youtu.be/WOn16SkEPqY?feature=shared

**In order to get the blog to work with AWS, you'll need to add MACHINE_IP blog.thm to your /etc/hosts file.**

```
nano /etc/hosts

10.10.129.172 blog.thm

nmap -sV -sC 10.10.129.172

22/tcp 
80/tcp 
robots.txt
	Allow: /wp-admin/admin-ajax.php
139
445 

gobuster dir -u 10.10.129.172 -w /usr/share/wordlists/dirbuster/directory-list-2-3-medium.txt

blog.thm/wp-includes/
	list of directories 
	ID3/ = 0

blog.thm/2020/05/26/note-from-mom/

	

wpscan --url http://blog.thm

```

```
root.txt

user.txt 

Where was user.txt found?

What CMS was Billy using?
wordpress

What version of the above CMS was being used?
5.0
```

