source : [here](https://youtu.be/lrcQ6wT-VYs?si=efX2xDseFoscsIiH)

## Linux utility tool: Logrotate

### Install logrotate

- ```yum install logrotate```
- ```dnf install logrotate```
- ```apt install logrotate```

__Log files Location__  
- /var/log/

__config files__  
- /etc/logrotate.conf

```
Example = cat /etc/logrotate.conf

# see "man logrotate" for details

# global options do not affect preceding include directives

# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
#dateext

# uncomment this if you want your log files compressed
#compress

# packages drop log rotation information into this directory
include /etc/logrotate.d

# system-specific logs may also be configured here.

```
- /etc/logrotate.d

```
ls -ltr
total 92
-rw-r--r-- 1 root root  130 Jun 23  2020 btmp
-rw-r--r-- 1 root root  132 Sep 10  2020 sane-utils
-rw-r--r-- 1 root root  145 Jul 26  2021 wtmp
-rw-r--r-- 1 root root  173 Jul 31  2023 postgresql-common
-rw-r--r-- 1 root root   91 Jan  5  2024 bootlog
-rw-r--r-- 1 root root   96 Mar 18  2024 snort
-rw-r--r-- 1 root root   94 Apr 20  2024 ppp
-rw-r--r-- 1 root root  677 Apr 29  2024 speech-dispatcher
-rw-r--r-- 1 root root 1859 Aug 19  2024 mariadb
-rw-r--r-- 1 root root  112 Sep 10  2024 dpkg
-rw-r--r-- 1 root root  120 Sep 10  2024 alternatives
-rw-r--r-- 1 root root   89 Sep 11  2024 macchanger
-rw-r--r-- 1 root root  329 Sep 21  2024 nginx
-rw-r--r-- 1 root root  397 Sep 30 00:51 apache2
-rw-r--r-- 1 root root  380 Oct  9 15:04 gvmd
-rw-r--r-- 1 root root  291 Oct  9 15:25 openvas-scanner
-rw-r--r-- 1 root root  146 Oct 10 02:41 redis-server
-rw-r--r-- 1 root root  252 Oct 21 17:42 mosquitto
-rw-r--r-- 1 root root  246 Oct 24 15:00 stunnel4
-rw-r--r-- 1 root root  173 Oct 30 19:28 apt
-rw-r--r-- 1 root root   93 Nov  6 00:11 firewalld
-rw-r--r-- 1 root root  242 Feb  8 15:39 tor
-rw-r--r-- 1 root root  248 Feb 20 15:04 rsyslog

```

```

less httpd

# Note that logs are not compressed unless "compress" is configured, # which can be done either here or globally in /etc/logrotate.conf.
/var/log/httpd/*log {
missingok
notifempty
sharedscripts
delaycompress
postrotate
/bin/systemctl reload httpd.service > /dev/null 2>/dev/null || true

endscript

}

```

```
less firewalld

/var/log/firewalld {
    weekly
    missingok
    rotate 4
    copytruncate
    minsize 1M
}

```

__More information about logrotate__

- ```man logrotate```

