# Pit

First as always, we start with `nmap`

```
# Nmap 7.92 scan initiated Thu Aug 26 13:11:05 2021 as: nmap -vvv -p 22,80,9090 -sCV -oA init 10.10.10.241
Nmap scan report for box.ip (10.10.10.241)
Host is up, received syn-ack (0.051s latency).
Scanned at 2021-08-26 13:11:06 +07 for 191s

PORT     STATE SERVICE         REASON  VERSION
22/tcp   open  ssh             syn-ack OpenSSH 8.0 (protocol 2.0)
| ssh-hostkey:
|   3072 6f:c3:40:8f:69:50:69:5a:57:d7:9c:4e:7b:1b:94:96 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDPRtC3Zd+DPBo1Raur/oVw/vz3BFbDkm6wmyb+E+0kBcgsDzm+UZqGn3u+rbI9L7PtNCIOTHa4j0Qs6fD9CvWa9xl1PXPQEI4X8UIfiDKduW+NhC0tRtfKzBSIR0XE+n2MjNCLM6pAR4xwhPZcpkXQmwurayT3OOHPV5QpOdSfzp0Zv56sBn3FmYe9j6fuhRFFL2x6Q8NfHOFkd4tAwkcCB1EebD0S/1ajB+TO6WeMOIHEU9HAAyg2LDzUKh0pzfFdK2MQHzKrGcFe3kOalz/dRJApa9wzUgq6iDbQvstDucPFLmvu8Y4YKFg1trKnf4Z2kopSUn0kKOxBROddoKOBdTyE309PF1b/Jo4ziDVVkRvPIHh06Se7NRVzbRtO8mBTFbi/Efag8QtLHeLDnF5SJj5SdTBiMiLvyGNWs3UySweOazyijw5bQtlgKbZHy0tLsjOCWjTuXGHAS3pHkkgSYKfr/NwWDsVQwHgCf1M7EZ23Uxww/qE6vRWbHStc6gM=
|   256 c2:6f:f8:ab:a1:20:83:d1:60:ab:cf:63:2d:c8:65:b7 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBASBJvHyFZwgmAuf2qWsMHborC5pS152XK8TVyTESkcPGWHqVAa/9rmFNvMuiMvBTPWhPq2+b5apFURHdxW2S5Q=
|   256 6b:65:6c:a6:92:e5:cc:76:17:5a:2f:9a:e7:50:c3:50 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJmDbvdFwHALNAnJDXuRD6aO9yppoVnKbTLbUmn6CWUn
80/tcp   open  http            syn-ack nginx 1.14.1
| http-methods:
|_  Supported Methods: GET HEAD
|_http-title: Test Page for the Nginx HTTP Server on Red Hat Enterprise Linux
|_http-server-header: nginx/1.14.1
9090/tcp open  ssl/zeus-admin? syn-ack
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=dms-pit.htb/organizationName=4cd9329523184b0ea52ba0d20a1a6f92/countryName=US
| Subject Alternative Name: DNS:dms-pit.htb, DNS:localhost, IP Address:127.0.0.1
| Issuer: commonName=dms-pit.htb/organizationName=4cd9329523184b0ea52ba0d20a1a6f92/countryName=US/organizationalUnitName=ca-5763051739999573755
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2020-04-16T23:29:12
| Not valid after:  2030-06-04T16:09:12
| MD5:   0146 4fba 4de8 5bef 0331 e57e 41b4 a8ae
| SHA-1: 29f2 edc3 7ae9 0c25 2a9d 3feb 3d90 bde6 dfd3 eee5
| -----BEGIN CERTIFICATE-----
| MIIEpjCCAo6gAwIBAgIISl2h4yex5dEwDQYJKoZIhvcNAQELBQAwbzELMAkGA1UE
| BhMCVVMxKTAnBgNVBAoMIDRjZDkzMjk1MjMxODRiMGVhNTJiYTBkMjBhMWE2Zjky
| MR8wHQYDVQQLDBZjYS01NzYzMDUxNzM5OTk5NTczNzU1MRQwEgYDVQQDDAtkbXMt
| cGl0Lmh0YjAeFw0yMDA0MTYyMzI5MTJaFw0zMDA2MDQxNjA5MTJaME4xCzAJBgNV
| BAYTAlVTMSkwJwYDVQQKDCA0Y2Q5MzI5NTIzMTg0YjBlYTUyYmEwZDIwYTFhNmY5
| MjEUMBIGA1UEAwwLZG1zLXBpdC5odGIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
| ggEKAoIBAQDZLaNRUf3BXYCd+Df9XZwMBmIwGzy/yX+9fPY6zGXYEYS7SeH9xZ7p
| GTUQMfk30Olb7rzftCKx9xSMHyoCJIAWFeVDV9vxJbGaEqFRvKHPeqcpQbRAKoqL
| xWaqbDZCXsBtTVYEwpRHvJ/GoGEWAQSbP1zkHzvVBkHuXE7Sj0zlW5NaBjvG/wEe
| wAB6crwnIYoqC550cMPritvjLwijk9nhwaPJ462anhJR5vFBvkR4nqD3mhIytUOb
| YMsfVoI0FiXtlBdu1ApABxtIdQgkY94eRAaMTkQ4Je0a8G5PlRZ20xCdqHb3xIZV
| 1mphZehkUeN0MzgEloL5TX8Zab+LZW+ZAgMBAAGjZzBlMA4GA1UdDwEB/wQEAwIF
| oDAJBgNVHRMEAjAAMCcGA1UdEQQgMB6CC2Rtcy1waXQuaHRigglsb2NhbGhvc3SH
| BH8AAAEwHwYDVR0jBBgwFoAUc8ssOet8O2a3+F2If4eQixSV7PwwDQYJKoZIhvcN
| AQELBQADggIBAG8kou51q78wdzxiPejMv9qhWlBWW3Ly5TvAav07ATx8haldEHvT
| LlFNGPDFAvJvcKguiHnGrEL9Im5GDuzi31V4fE5xjzWJdkepXasK7NzIciC0IwgP
| 7G1j11OUJOt9pmDRu2FkTHsSdr5b57P4uXS8rRF5lLCEafuemk6ORXa07b9xSrhC
| 3pWl22RtVlTFQ3wX8OsY0O3w5UUz8T/ezhKYUoM/mYQu+ICTAltlX4xae6PGauCh
| uaOY+/dPtM17KfHSbnCS1ZnR0oQ4BXJuYNfOR/C59L5B7TWzaOx5n1TD6JHOzrDu
| LxjO0OTeFaBRXL/s2Z5zNPTpZVnHyKEmHr5ZObjR6drDGqXfShPq5y70RfE28Pxm
| VTCdK4MCqDkELIlXrxzHQ/IPC8pxho6WEQsY80xZ1nXbLshlymh6clgblOetToZT
| HObIkEoPBtszUssFmWSN5hd4JcuyqSbJhichYtFQRASb2I4jWdP831LPir+MCGQv
| iAnieBF8zYus7kboTwfXmBGUt6r6eNE1yr4ZXPxOZoWq2ob6aAeLp2mqif+jgUSk
| fiG9oiAoyXWxw5pLfYHxVQGY+rGbjOs8gCAxBaTPt6dCkHZy/nU8PNZtV6QC4OME
| LI/sYtmG8XENdQhsLM2sewOMvv5rgsZ8SlX05Bw8C1xuq5Rg1KewCjlY
|_-----END CERTIFICATE-----
| fingerprint-strings:
[snip]

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Aug 26 13:14:17 2021 -- 1 IP address (1 host up) scanned in 191.89 seconds
```

Looking at the SSL certificate information on port 9090, we see the domain name `dms-pit.htb`, and we can find the domain name `pit.htb` when visiting port 9090 with the IP so we add the 2 to our `/etc/hosts`. `pit.htb` seems to behave the same as when we just use the IP address but `dms-pit.htb` returns a 403 Forbidden on port 80 so we note that down for later.

With nothing go on with, we run a UDP scan.

```
# Nmap 7.92 scan initiated Thu Aug 26 13:30:49 2021 as: nmap -sUCV -oA udp.pit.htb pit.htb
Warning: 10.10.10.241 giving up on port because retransmission cap hit (10).
Nmap scan report for pit.htb (10.10.10.241)
Host is up (0.053s latency).
Scanned at 2021-08-26 13:30:50 +07 for 2154s
Not shown: 931 filtered udp ports (admin-prohibited)
PORT      STATE         SERVICE         VERSION
2/udp     open|filtered compressnet
22/udp    open|filtered ssh
37/udp    open|filtered time
80/udp    open|filtered http
135/udp   open|filtered msrpc
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open          snmp            SNMPv1 server; net-snmp SNMPv3 server (public)
| snmp-processes:
[snip]
| snmp-sysdescr: Linux pit.htb 4.18.0-305.10.2.el8_4.x86_64 #1 SMP Tue Jul 20 17:25:16 UTC 2021 x86_64
|_  System uptime: 2h09m7.94s (774794 timeticks)
| snmp-info:
|   enterprise: net-snmp
|   engineIDFormat: unknown
|   engineIDData: 4ca7e41263c5985e00000000
|   snmpEngineBoots: 73
|_  snmpEngineTime: 2h09m08s
[snip]

Read from /usr/bin/../share/nmap: nmap-payloads nmap-service-probes nmap-services.
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Aug 26 14:06:44 2021 -- 1 IP address (1 host up) scanned in 2154.42 seconds
```

We can see SNMP port 161 so I ran `snmpwalk`, `snmpenum`, and [`snmpbw.pl`](https://github.com/dheiland-r7/snmp/blob/master/snmpbw.pl).

```sh
snmpwalk -v2c -c public pit.htb
snmpenum 10.10.10.241 public /usr/share/doc/snmpenum/linux.txt
snmpbw.pl 10.10.10.241 public 2 1
```

Among the result, output from `snmpbw.pl` contains an interesting string.

```
.1.3.6.1.4.1.2021.9.1.2.2 = STRING: /var/www/html/seeddms51x/seeddms
```

It seems one of the web services should have `/seeddms51x/seeddms` as a path. Checking the found web pages, we find that `dms-pit.htb` port 80 has the seeddms path. Navigating said path, we're greeted with a login portal. Additionally, at the bottom of the snmpbw results we have some credentials

```
Login Name           SELinux User         MLS/MCS Range        Service

__default__          unconfined_u         s0-s0:c0.c1023       *
michelle             user_u               s0                   *
root                 unconfined_u         s0-s0:c0.c1023       *
```

Trying `michelle:michelle` allows us to log in as michelle.

Knowing the web server is running SeedDMS, we look for exploits with `searchsploit seeddms` and find and RCE: "hp/webapps/47022.txt". Following the instructions:

1. Go to `Docs/Users/Michelle` where we can write files
1. Add document (I named it `1.php`)
1. Upload our PHP code as "local file"
1. Click on the uploaded document to get its `documentid`
1. Navigate to `http://dms-pit.htb/seeddms51x/data/1048576/{documentid}/1.php?cmd=id` for command execution

Looking around, we find that `/var/www/html/seeddms51x/conf/settings.xml` contains database credentials

```xml
<database dbDriver="mysql" dbHostname="localhost" dbDatabase="seeddms" dbUser="seeddms" dbPass="ied^ieY6xoquu" doNotCheckVersion="false">
```

Testing around, we find that the password works with the username "michelle" logging into `pit.htb:9090`. Logged in, we have access to a terminal on the box.

Looking back at our SNMP scans, specifically `snmpbw`, one binary stands out: `/usr/bin/monitor`.

```
.1.3.6.1.4.1.8072.1.3.2.2.1.2.10.109.111.110.105.116.111.114.105.110.103 = STRING: /usr/bin/monitor
```

```sh
[michelle@pit hacker.htb]$ cat /usr/bin/monitor
#!/bin/bash

for script in /usr/local/monitoring/check*sh
do
    /bin/bash $script
done
```

We see the script runs multiple files with a wild card. Judging by the name, we can guess this script is run periodically as a cron job. Thanks to the wild card, we can get the script to run our `sh` script simply by giving a name matching the wild card. To get a root shell, we can generate an SSH key and have the script append our key to `/root/.ssh/authorized_keys`. After adding our SSH key, we should be able to log in as root.
