`hostname`
ip-10-10-15-182

`uname -a` 
Linux ip-10-10-15-182 3.10.0-1160.el7.x86_64 #1 SMP Mon Oct 19 16:18:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux

`cat /proc/version`
Linux version 3.10.0-1160.el7.x86_64 (mockbuild@kbuilder.bsys.centos.org) (gcc version 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) ) #1 SMP Mon Oct 19 16:18:59 UTC 2020

`env`
```
XDG_SESSION_ID=1
HOSTNAME=ip-10-10-15-182
SELINUX_ROLE_REQUESTED=
TERM=xterm-256color
SHELL=/bin/bash
HISTSIZE=1000
TMPDIR=/tmp/leonard
SSH_CLIENT=10.11.7.163 60762 22
PERL5LIB=/home/leonard/perl5/lib/perl5:
SELINUX_USE_CURRENT_RANGE=
QTDIR=/usr/lib64/qt-3.3
QTINC=/usr/lib64/qt-3.3/include
PERL_MB_OPT=--install_base /home/leonard/perl5
SSH_TTY=/dev/pts/0
QT_GRAPHICSSYSTEM_CHECKED=1
USER=leonard
LS_COLORS=...
CASTOR_HOME=/castor/cern.ch/user/l/leonard
MAIL=/var/spool/mail/leonard
PATH=/home/leonard/scripts:/usr/sue/bin:/usr/lib64/qt-3.3/bin:/home/leonard/perl5/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/opt/puppetlabs/bin:/home/leonard/.local/bin:/home/leonard/bin
PWD=/home/leonard
EDITOR=/bin/nano -w
LANG=en_IE.UTF-8
QT_GRAPHICSSYSTEM=native
KDEDIRS=/usr
SELINUX_LEVEL_REQUESTED=
HISTCONTROL=ignoredups
SHLVL=1
HOME=/home/leonard
PERL_LOCAL_LIB_ROOT=:/home/leonard/perl5
LOGNAME=leonard
QTLIB=/usr/lib64/qt-3.3/lib
XDG_DATA_DIRS=/home/leonard/.local/share/flatpak/exports/share:/var/lib/flatpak/exports/share:/usr/local/share:/usr/share
SSH_CONNECTION=10.11.7.163 60762 10.10.15.182 22
LESSOPEN=||/usr/bin/lesspipe.sh %s
XDG_RUNTIME_DIR=/run/user/1000
QT_PLUGIN_PATH=/usr/lib64/kde4/plugins:/usr/lib/kde4/plugins
PERL_MM_OPT=INSTALL_BASE=/home/leonard/perl5
```

`sudo -l`
Sorry, user leonard may not run sudo on ip-10-10-15-182.

`cat /etc/passwd`
leonard:x:1000:1000:leonard:/home/leonard:/bin/bash
missy:x:1001:1001: /home/missy:/bin/bash

`history`
```
    1  ls
    2  cd ..
    3  exit
    4  ls
    5  cd çç
    6  cd ..
    7  ls
    8  cd home/
    9  ls
   10  cd missy/
   11  su missy 
   12  ls
   13  cd ..
   14  ls
   15  cd rootflag/
   16  ls
   17  cat flag2.txt 
   18  su root
   19  ls
   20  cd rootflag/
   21  su missy
```
