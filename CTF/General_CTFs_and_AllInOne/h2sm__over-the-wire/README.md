# over-the-wire
<details>
   <summary> Level 0: </summary>
1. ssh bandit0@bandit.labs.overthewire.org -p 2220 
2. bandit0
</details>

<details>
   <summary>Level 0 -> Level 1:</summary>
1) ls 
2) cat readme (password is boJ9jbbUNNfktd78OOpsqOltutMc3MY1)
</details>
<details>
   <summary> Level 1 -> Level 2: </summary>
1) ssh bandit1@bandit.labs.overthewire.org -p 2220
2) cd ~
3) ls 
4) cat ./- (password is CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9)
</details>  

<details>
<summary>Level 2 -> Level 3: </summary>
1) ssh bandit2@bandit.labs.overthewire.org -p 2220 
2) ls
3) cat spaces\ in\ this\ filename (password is UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK)
</details> 

<details>
<summary>Level 3 -> Level 4:</summary>
1) ssh bandit3@bandit.labs.overthewire.org -p 2220
2) cd inhere/
3) ls
4) cat .hidden (password is pIwrPrtPN36QITSp3EQaw936yaFoFgAB)
</details>

<details>
<summary> Level 4 -> Level 5:</summary>
1) ssh bandit4@bandit.labs.overthewire.org -p 2220
2) cd inhere/
3) find . -type f -exec file {} + | grep ASCII (password is koReBOKuIDDepwhWk7jZC0RTdopnAYKh)
</details>

<details>
<summary> Level 5 -> Level 6: </summary>
1) ssh bandit5@bandit.labs.overthewire.org -p 2220
2) find . -size 1033c -type f -exec file {} + | grep ASCII (output is "./maybehere07/.file2: ASCII text, with very long lines")
3) cat ./maybehere07/.file2 (password is DXjZPULLxYr17uwoI01bNLQbtFemEgo7)
</details>

<details>
<summary> Level 6: > Level 7: </summary>
1) ssh bandit6@bandit.labs.overthewire.org -p 2220
2) cd /
3) find . -size 33c -user bandit7 -group bandit6 (file is here : /var/lib/dpkg/info/bandit7.password)
4) cat /var/lib/dpkg/info/bandit7.password (password is HKBPTKQnIay4Fw76bEy8PVxKEDQRKTzs)
</details>

<details>
<summary>Level 7 -> Level 8:</summary>
1) ssh bandit7@bandit.labs.overthewire.org -p 2220
2) cat data.txt | grep millionth (password is cvX2JJa4CFALtqS87jk27qwqGhBM9plV)
</details>
<details>
<summary>Level 8 -> Level 9:</summary>
1) ssh bandit8@bandit.labs.overthewire.org -p 2220
2) cat data.txt | sort | uniq -u (password is UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR)
</details>
<details>
<summary>Level 9 -> Level 10: </summary>
1) ssh bandit9@bandit.labs.overthewire.org -p 2220
2) strings data.txt | grep -E "==" (password is truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk)
</details>

<details>   
<summary>Level 10 -> Level 11:</summary>
1) ssh bandit10@bandit.labs.overthewire.org -p 2220 
2) base64 --decode data.txt (password is IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR)
</details>

<details>
<summary>Level 11 -> Level 12:</summary>
1) ssh bandit11@bandit.labs.overthewire.org -p 2220
2) cat data.txt | tr '[a-z]' '[n-za-m]' | tr '[A-Z]' '[N-ZA-M]' (password is 5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu)
</details>

<details>
<summary>Level 12 -> Level 13:</summary>
1) ssh bandit12@bandit.labs.overthewire.org -p 2220
2) mkdir /tmp/pass
3) cp data.txt /tmp/pass
4) file data1 (data1: gzip compressed data, was "data2.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix)
5) mv data1 data1.gz
6) ls (data1.gz  data.txt)
7) gunzip data1.gz 
8) ls (data1  data.txt)
9) file data1 (data1: bzip2 compressed data, block size = 900k)
10) bzip2 -d data1 (bzip2: Can't guess original name for data1: using data1.out)
11) ls (data1.out  data.txt)
12) file data1.out (data1.out: gzip compressed data, was "data4.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix)
13) mv data1.out data1.gz
14) ls (data1.gz  data.txt)
15) gunzip data1.gz
16) ls (data1  data.txt)
17) file data1 (data1: POSIX tar archive (GNU))
18) tar xvf data1
19) ls (data1  data5.bin  data.txt)
20) file data5.bin (data5.bin: POSIX tar archive (GNU))
21) tar xvf data5.bin (data6.bin)
22) file data6.bin (data6.bin: bzip2 compressed data, block size = 900k)
23) bzip2 -d data6.bin (bzip2: Can't guess original name for data6.bin: using data6.bin.out)
24) ls (data1  data5.bin  data6.bin.out  data.txt)
25) file data6.bin.out (data6.bin.out: POSIX tar archive (GNU))
26) tar xvf data6.bin.out
27) ls (data1  data5.bin  data6.bin.out  data8.bin  data.txt)
28) file data8.bin (data8.bin: gzip compressed data, was "data9.bin", last modified: Thu May  7 18:14:30 2020, max compression, from Unix)
29) mv data8.bin data8.gz
30) gunzip data8.gz
31) ls (data1  data5.bin  data6.bin.out  data8  data.txt)
32) file data8 (data8: ASCII text)
33) cat data8 (The password is 8ZjyCRiBWFYkneahHwxCv3wb2a1ORpYL)
</details>

<details>
 <summary>Level 13 -> Level 14: </summary>
1) ssh bandit13@bandit.labs.overthewire.org -p 2220
2) ssh bandit14@localhost -i sshkey.private
3) cd /etc/bandit_pass
4) cat bandit14 (4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e)
</details>

<details>
 <summary>Level 14 -> Level 15: </summary>
1) nc localhost 30000
2) 4wcYUJFw0k0XLShlDzztnTBHiqxU3b3e (Correct! BfMYroe26WYalil77FoDi9qh59eK5xNr)
</details>
<details>
 <summary>Level 15 -> Level 16: </summary>
1) ssh bandit15@bandit.labs.overthewire.org -p 2220
2) openssl s_client -connect localhost:30001 -ign_eof 
3) BfMYroe26WYalil77FoDi9qh59eK5xNr (Correct! cluFn7wTiGryunymYOu4RcffSxQluehd)
</details>

<details>   
 <summary>Level 16 -> Level 17: </summary>
1) ssh bandit16@bandit.labs.overthewire.org -p 2220
2) mkdir /tmp/myfiles
3) cmd /tmp/myfiles
4) nmap -31000-32000 localhost | awk '/open/{print $1+0}' > ports.txt (31046 31518 31691 31790 31960)
5) for i in $(cat ports.txt); do print $i | echo "cluFn7wTiGryunymYOu4RcffSxQluehd" | timeout 1 openssl s_client -connect localhost:$i -quiet; done
6) cat /etc/bandit_pass/bandit16 | openssl s_client -connect localhost:31790 -quiet > ssh22.private
7) Удаляем "Correct!" из ssh22.private
8) chmod 400 ssh22.private
9) ssh -i ssh22.private bandit17@localhost
</details>
   
<details>   
 <summary>Level 17 -> Level 18: </summary>
1) diff passwords.new passwords.old (< kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd)
</details>
   
<details>   
 <summary>Level 18 -> Level 19: </summary>
1) ssh bandit18@bandit.labs.overthewire.org -p 2220 "cat ~/readme" (IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x)
</details>
   
<details>   
 <summary>Level 19 -> Level 20: </summary>
1) ssh bandit19@bandit.labs.overthewire.org -p 2220
2) ./bandit20-do
3) ./bandit20-do id
4) ./bandit20-do cat /etc/bandit_pass/bandit20 (password is GbKksEFF4yrVs6il55v6gwY5aVje5f0j)
</details>
<details>   
 <summary>Level 20 -> Level 21: </summary>
1) echo "GbKksEFF4yrVs6il55v6gwY5aVje5f0j" | nc -l localhost -p 10000 &
2) ./suconnect 10000 (password is gE269g2h3mw3pwgrj0Ha9Uoqen1c9DGr)
</details>
<details>
 <summary>Level 21 -> Level 22: </summary>
1) cd /etc/cron.d
2) ls
3) cat /etc/cron.d/cronjob_bandit22
4) cat /usr/bin/cronjob_bandit22.sh
5) cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv (password is Yk7owGAcWjwMVRwrTesJEwB7WVOiILLI)
</details>
<details>   
 <summary>Level 22 -> Level 23: </summary>
1) cd /etc/cron.d
2) ls
3) cat cronjob_bandit23
4) cat /usr/bin/cronjob_bandit23.sh
5) echo I am user bandit23 | md5sum | cut -d ' ' -f 1 (8ca319486bfbbc3663ea0fbe81326349)
6) cat /tmp/8ca319486bfbbc3663ea0fbe81326349 (jc1udXuA1tiHqjIsL8yaapX5XIAI6i0n)
</details>
<details>   
 <summary>Level 23 -> Level 24: </summary>
1) mkdir /tmp/pass_papka
2) cd /tmp/pass_papka
3) touch passSH.sh
4) chmod 777 passSH.sh
5) vim passSH.sh
5.1) 
   #!/bin/bash
   cat /etc/bandit_pass/bandit24 > /tmp/passpapka/pass_two
6) touch pass_two
7) chmod 666 pass_two
8) cp passSH.sh /var/spool/bandit24/
9) cat pass_two (UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ)
</details>
<details>
 <summary>Level 24 -> Level 25: </summary>
1) mkdir /tmp/kekw
2) cd /tmp/kekw
3) touch sh_comm.sh 
4) chmod 777 sh_comm.sh
5) vim sh_comm.sh
   #!/bin/bash
   for i in {0000..9999}
   do
      echo "UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ $i"
   done
6) touch all_nums.txt
7) chmod 777 all_nums.txt
8) ./sh_comm.sh > all_nums.txt
9) nc localhost 30002 < all_nums.txt (password is uNG9O58gUE7snukf3bvZ0rxhtnjzSGzG)
</details>
   
<details>
 <summary>Level 25 -> Level 26: </summary>
1) ssh bandit26@localhost -i bandit26.sshkey 
2) Соединение автоматически завершается
3) cat /etc/passwd | grep bandit26 (bandit26:x:11026:11026:bandit level 26:/home/bandit26:/usr/bin/showtext)
4) cat /usr/bin/showtext (
   #!/bin/sh
   more ~/text.txt
   exit 0
)
5) Пароль находится в папке /etc/bandit_pass/bandit26, значит нужно зайти в него перед выходом из системы
6) Уменьшаю окно терминала
7) ssh 
8) Логотип "bandit" полностью не отображается, нажимаю "v"
9) Ввожу :e /etc/bandit_pass/bandit26 чтобы открыть файл с паролем
10) Пароль: 5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z
</details>
<details>
 <summary>Level 26 -> Level 27: </summary>
1) Вхожу обратно в vim, где искал пароль от этого задания
2) Ввожу :set shell=/bin/bash
3) Открываю :shell
4) ls 
5) ./bandit27-do
6) ./bandit27-do cat /etc/bandit_pass/bandit27 (3ba3118a22e93127a4ed485be72ef5ea)
</details>
<details>
 <summary>Level 27 -> Level 28: </summary>
1) git clone ssh://bandit27-git@localhost/home/bandit27-git/repo (fatal: could not create work tree dir 'repo': Permission denied)
2) mkdir /tmp/gitTask
3) cd /tmp/gitTask
4) git clone ssh://bandit27-git@localhost/home/bandit27-git/repo
5) ls
6) cd repo/
7) ls
8) cat README (The password to the next level is: 0ef186ac70e04ea33b4c1853d2526fa2)
</details>
<details>
 <summary>Level 28 -> Level 29: </summary>
1) mkdir /tmp/git4
2) cd /tmp/git4 
3) git clone ssh://bandit28-git@localhost/home/bandit28-git/repo
4) cd repo
5) ls
6) git log -p (bbc96594b4e001778eee9975372716b2)
</details>
<details>
 <summary>Level 29 -> Level 30: </summary>
1) mkdir /tmp/gitTask111
2) cd /tmp/gitTask111
3) git clone ssh://bandit29-git@localhost/home/bandit29-git/repo
4) cd repo
5) cat README.md
6) git branch -r
7) git checkout dev
8) cat README.MD (5b90576bedb2cc04c86a9e924ce42faf)
</details>
<details>   
 <summary>Level 30 -> Level 31: </summary>
1) mkdir /tmp/gitNorm
2) cd /tmp/gitNorm
3) git clone ssh://bandit30-git@localhost/home/bandit29-git/repo
4) cd repo
5) cat README.md (рассмешнил :|)
6) git tag (secret)
7) git show secret (47e603bb428404d265f59c42920d81e5)
</details>
<details>
 <summary>Level 31 -> Level 32: </summary>
1) mkdir /tmp/gitTask31
2) cd /tmp/gitTask31
3) git clone ssh://bandit31-git@localhost/home/bandit31-git/repo
4) cd repo/
5) cat README.md
6) echo "May I come in?" > key.txt
7) git add -f key.txt
8) git commit -m "lol"
9) git push (56a9bf19c63d650ce78e6ec0354ee45e)
</details>
<details>
 <summary>Level 32 -> Level 33: </summary>
1) $0 (название файла сценария, как бы запускаем sh еще раз)
2) cat /etc/bandit_pass/bandit33 (c9c3199ddf4121b10cf581a98d51caee)
</details>
<details>
 <summary>Level 33 -> Level 34: </summary>
</details>
