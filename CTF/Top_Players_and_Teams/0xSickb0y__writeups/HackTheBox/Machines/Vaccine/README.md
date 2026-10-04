# Vaccine

> https://app.hackthebox.com/starting-point?tier=2

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/135bac4f-eca0-4b79-b853-6793a7faaaa5" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Insecure Backup Storage](#insecure-backup-storage)
* [Administrator Dashboard](#administrator-dashboard)
* [Initial Access](#initial-access)
    * [SQL Injection](#sql-injection)
* [Privilege Escalation](#privilege-escalation)
* [Conclusion](#conclusion)

## About

Vaccine was an Ubuntu-based machine running a vulnerable web application. The challenge revolves around exploiting insecure backup storage, SQL injection vulnerabilities, and hardcoded credentials to gain initial access. Privilege escalation is achieved through the exploitation of insecure sudo permissions for the _vi_ binary, allowing root access.

## References

- [GTFObins: vi](https://gtfobins.github.io/gtfobins/vi/)
- [SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [Insecure Data Storage](https://cwe.mitre.org/data/definitions/922.html)
- [Improper Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
- [CWE-328: Use of Weak Hash](https://cwe.mitre.org/data/definitions/328.html)
- [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [CWE-613: Insufficient Session Expiration](https://cwe.mitre.org/data/definitions/613.html)
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [CWE-209: Generation of Error Message Containing Sensitive Information](https://cwe.mitre.org/data/definitions/209.html)

## Reconnaissance

Nmap port scanning revealed 3 open TCP ports:

- __21__: vsftpd 3.0.3
- __22__: OpenSSH 8.0p1 Ubuntu
- __80__: Apache httpd 2.4.41 ((Ubuntu))

The FTP service allowed anonymous access (as shown by the Nmap scan) and hosted a single file called _backup.zip_.

<img width="1894" height="926" alt="0" src="https://github.com/user-attachments/assets/7375f7b3-47cb-4afe-8b38-a520589a445a" />

<br>
<br>

Accessing the web page in the browser displayed an index page titled __MegaCorp Login__, prompting for credentials.

<img width="1914" height="1030" alt="1" src="https://github.com/user-attachments/assets/c792b256-850e-406e-91bb-451df9209168" />

## Insecure Backup Storage

From the Nmap results, I already knew there was a backup zip archive hosted on the FTP server, but at that point, I couldn't possibly know its contents because it was password-protected.

However, attempting to extract the archive revealed the filenames inside, confirming this was indeed the backup for the web server.

```bash
┌──(kali💀ATX-nl1337k)-[~/HackTheBox/machines/vaccine]
└─$ unzip backup.zip                                  
Archive:  backup.zip
[backup.zip] index.php password: 
   skipping: index.php               incorrect password
   skipping: style.css               incorrect password
```

The next step was to try to crack the password for this zip archive. I used [Zip2John](https://github.com/openwall/john/blob/bleeding-jumbo/src/zip2john.c) to convert _backup.zip_ into a format suitable for use with [John The Ripper](https://github.com/openwall/john/). The password cracked almost instantly, revealing it to be `741852963`.

<img width="1896" height="778" alt="2" src="https://github.com/user-attachments/assets/08cd8a4d-2f17-4742-8b3f-7dd3bce94b03" />

## Administrator Dashboard

From the now accessible server backup, I could see the source code for _index.php_, which revealed hardcoded credentials for the `admin` user. The password hash was an MD5 hash and was quickly cracked using the _rockyou.txt_ wordlist, effectively giving me access to the administrator dashboard.

### __index.php__:
```php
<?php
session_start();
  if(isset($_POST['username']) && isset($_POST['password'])) {
    if($_POST['username'] === 'admin' && md5($_POST['password']) === "2cb42f8734ea607eefed3b70af13bbd3") {
      # CWE-328: Use of Weak Hash
      # CWE-798: Use of Hard-coded Credentials 
      $_SESSION['login'] = "true";
      header("Location: dashboard.php");
    }
  }
?>
```

<img width="1410" height="559" alt="3" src="https://github.com/user-attachments/assets/76451c03-d977-4d66-8cb9-f24abaa82067" />

<br>
<br>

Accessing the dashboard, I could interact with the application by using the `?search=` option. This allowed me to search for values like _Name, Type, Fuel, and Engine_ in a database of cars.

<img width="1547" height="345" alt="4" src="https://github.com/user-attachments/assets/12cabd2d-3df0-4098-a08b-805b76c5a867" />

## Initial Access

### SQL Injection

The `?search=` parameter was the only attack vector at the time, so I started fuzzing it. Eventually, some special characters broke the query, which returned SQL-related errors. The next step was to run [SQLmap](https://github.com/sqlmapproject/sqlmap) on the `?search=` parameter to see if I could extract information from the database or even get a system shell.

```bash
# http://10.129.95.174:80/dashboard.php?search=meta (GET)

┌──(kali💀ATX-nl1337k)-[~/HackTheBox/machines/vaccine]
└─$ /usr/bin/sqlmap --output-dir=/home/kali/HackTheBox/machines/vaccine --cookie=PHPSESSID=gppd9k1qkbpicg2ekvp1gi1069 --proxy=http://127.0.0.1:8080 -b --batch -r request
```

The database was PostgreSQL 11.7 running on Ubuntu, SQLmap identified multiple injection points: __Boolean-based__ and __time-based__ blind injections allow data extraction by observing differences in response behavior or timing. __Error-based__ injection can reveal database details through error messages, and __stacked queries__ enable arbitrary SQL command execution.

<img width="1919" height="1028" alt="5" src="https://github.com/user-attachments/assets/16404537-5233-4eaa-90ac-eeb03c265c94" />

<br>
<br>

After confirming the presence of _SQL injection_, I used the `--os-shell`/`--os-cmd` options in [SQLmap](https://github.com/sqlmapproject/sqlmap) to trigger a reverse shell as the same user running the database instance (i.e. __postgres__).

<img width="1147" height="559" alt="6" src="https://github.com/user-attachments/assets/4ead5733-8813-4cb4-a0f7-ec3548df1785" />

## Privilege Escalation

Immediately after gaining access, I analyzed the _dashboard.php_ file to understand the _SQL injection_ vulnerabilities in place, but I was presented with another set of hardcoded credentials, with the password for __postgres__ in clear text.

### dashboard.php

```php
<?php
    session_start();
    if($_SESSION['login'] !== "true") { # CWE-613: Insufficient Session Expiration 
      header("Location: index.php");
      die();
    }
    try {
      $conn = pg_connect("host=localhost port=5432 dbname=carsdb user=postgres password=P@s5w0rd!"); # CWE-798: Use of Hard-coded Credentials
    }

    catch ( exception $e ) {
      echo $e->getMessage(); #  CWE-209: Generation of Error Message Containing Sensitive Information 
    }

    if(isset($_REQUEST['search'])) {

      $q = "Select * from cars where name ilike '%". $_REQUEST["search"] ."%'"; # CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')

      $result = pg_query($conn,$q);

      if (!$result)
      {
                die(pg_last_error($conn)); # CWE-209: Generation of Error Message Containing Sensitive Information 
      }
      while($row = pg_fetch_array($result, NULL, PGSQL_NUM))
          {
        echo "
          <tr>
            <td class='lalign'>$row[1]</td>
            <td>$row[2]</td>
            <td>$row[3]</td>
            <td>$row[4]</td>
          </tr>";
        }
    }
    else {
        
      $q = "Select * from cars";

      $result = pg_query($conn,$q);

      if (!$result)
      {
                die(pg_last_error($conn)); # CWE-209: Generation of Error Message Containing Sensitive Information 
      }
      while($row = pg_fetch_array($result, NULL, PGSQL_NUM))
          {
        echo "
          <tr>
            <td class='lalign'>$row[1]</td>
            <td>$row[2]</td>
            <td>$row[3]</td>
            <td>$row[4]</td>
          </tr>";
        }
    }
?>
```

With those credentials, I was able to list the sudo privileges for the __postgres__ user. This user could run: `(ALL) /bin/vi /etc/postgresql/11/main/pg_hba.conf`. This is extremely insecure as `vi` allows interaction with the system shell using `:!/path/to/binary --options <target>` in command mode. This is also referenced in [GTFObins](https://gtfobins.github.io/gtfobins/vi/).

By opening the `vi` editor as __root__, I triggered a reverse shell to my attacking machine and completed the challenge.

!<img width="1903" height="767" alt="7" src="https://github.com/user-attachments/assets/606d97b3-c0ea-4cff-902f-ba94e6fa9d70" />

## Conclusion

The Vaccine machine demonstrated several critical vulnerabilities:

- **Insecure Backup Storage**: Sensitive files were stored in a publicly accessible location, allowing attackers to retrieve and analyze them.
- **SQL Injection**: Poor input validation enabled attackers to exploit database queries and gain unauthorized access.
- **Hardcoded Credentials**: Storing credentials in plaintext within the source code exposed the system to credential reuse attacks.
- **Insecure Sudo Permissions**: Misconfigured sudo permissions allowed privilege escalation through the `vi` binary.

These vulnerabilities highlight the importance of secure storage practices, proper input validation, avoiding hardcoded credentials, and restricting sudo
