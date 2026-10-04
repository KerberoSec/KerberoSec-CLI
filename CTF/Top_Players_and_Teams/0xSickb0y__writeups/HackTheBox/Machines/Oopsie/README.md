# Oopsie

> [https://app.hackthebox.com/starting-point?tier=2](https://app.hackthebox.com/starting-point?tier=2)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/ee5ea955-76c8-45a8-a41d-d0d50f37f053" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [IDOR / Information Disclosure](#idor--information-disclosure)
* [Cookie Tampering / Unrestricted File Upload](#cookie-tampering--unrestricted-file-upload)
* [Code Review](#code-review)
* [Initial Access](#initial-access)
* [Privilege Escalation](#privilege-escalation)
    * [Path Traversal](#path-traversal)
    * [Path Injection](#path-injection)
* [Conclusion](#conclusion)

## About

Oopsie was a _Ubuntu_ machine running a vulnerable web application. The main challenge involved exploiting insecure direct object references (IDOR), cookie tampering, and file upload vulnerabilities to gain initial access. Privilege escalation was achieved through path traversal and path injection in a SUID binary.

## References

- [Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [SUID Privilege Escalation](https://gtfobins.github.io/)
- [SUID Binaries in GNU/Linux](https://ieeexplore.ieee.org/document/10584001)
- [Cookie Tampering Techniques](https://www.geeksforgeeks.org/ethical-hacking/cookie-tampering-techniques/)
- [Environment Variables in Development](https://www.geeksforgeeks.org/javascript/what-are-environment-variables-in-development/)
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [Linux Privilege Escalation Using PATH Variable](https://www.hackingarticles.in/linux-privilege-escalation-using-path-variable/)

## Reconnaissance

Port scanning revealed two open TCP ports:

- **22**: OpenSSH (OpenSSH 7.6p1 Ubuntu)
- **80**: Apache (Apache httpd 2.4.29 (ubuntu))

<img width="1901" height="535" alt="0" src="https://github.com/user-attachments/assets/e5b57eee-62d7-47c9-b7ee-cec24d97d9a9" />

<br>
<br>

The main web page serves as a website for an electrical vehicles auto repair shop/garage.

<img width="1862" height="902" alt="1" src="https://github.com/user-attachments/assets/345b9a79-f8ed-4b6b-9334-fc1ab25721a4" />

From the website:

#### _Introducing MegaCorp EVehicles_

_The MegaCorp truck-based chassis provides solid structural rigidity while the electric propulsion system delivers a smooth and fuel-efficient drive. The flexibility of the platform allows the vehicle to optimize its wheel-to-body ratio, making the architecture dynamic while enlarging battery space. The elevated height and forward driving position of the Mega provide open visibility and an engaging experience._

<br>

The page source code revealed the login page, saving time and avoiding directory brute-forcing.

```html
<script src="/cdn-cgi/login/script.js"></script>
<script src="/js/index.js"></script>
```

Navigating to `/cdn-cgi/login`, I could log in to the application as `guest`. Inspecting the cookies in the dev tools revealed two cookies: `role=guest` and `user=2233`.

<img width="1912" height="1030" alt="2" src="https://github.com/user-attachments/assets/08532c27-c0b4-4a33-8b65-81221ddbcd86" />

I could further verify this by going to the __Account__ page, which displayed what seemed to be a database table with __Access ID__, __Name__, and __Email__. This was the same for the other pages __Branding__ and __Clients__.

However, one thing that immediately catches the eye is the use of `id=<int>`/`content=<page>`, hinting at the possible presence of an __IDOR__ vulnerability.

> #### http://10.129.167.103/cdn-cgi/login/admin.php?content=accounts&id=2

| Access ID |	Name |	Email |
| --- | --- | --- | 
| 2233 |	guest |	guest@megacorp.com |

> #### http://10.129.167.103/cdn-cgi/login/admin.php?content=branding&brandId=2

| Brand ID | Model | Price
| --- | --- | --- | 
| 2 | MC-2124 | $100,430 |

> #### http://10.129.167.103/cdn-cgi/login/admin.php?content=clients&orgId=2

| Client ID	| Name	| Email| 
| --- | --- | --- |
| 2	| client	| client@client.htb| 

<br>

## IDOR / Information Disclosure

No proper authorization checks are done before accessing sensitive records like accounts, clients, branding, etc. Access is controlled only by `id` / `orgId` / `brandId` in URL parameters. By navigating to http://10.129.167.103/cdn-cgi/login/admin.php?content=accounts&id=1, I could see the information table for the __admin__ user, revealing the id `34322`.

| Access ID |	Name |	Email |
| --- | --- | --- | 
| 34322 |	admin |	admin@megacorp.com |

<img width="1918" height="551" alt="3" src="https://github.com/user-attachments/assets/62e8c8af-2b37-4d2e-b9fe-8ed1485d0b5d" />

## Cookie Tampering / Unrestricted File Upload

The application was using cookie-based authentication, which trusted values like `user=34322` or `user=2233` and `role=guest/admin` without validation. By modifying my cookies to impersonate the admin user, I could access the upload page.

The server saved the files in `/uploads/<file>`, but it did not validate the files being sent to this directory, which had public access (except for listing). Knowing that the server was running PHP, I could potentially upload malicious files to abuse that.

<img width="1920" height="873" alt="4" src="https://github.com/user-attachments/assets/9f9fa3b1-69fa-4c93-8933-f4c94f6a51f8" />

## Code Review

### Authentication: index.php:

No server-side verification is done on the cookies after login. The app assumes the user is authenticated if the `user` cookie has a valid value.

```php
<?php
if(isset($_GET["guest"]))
{
    $cookie_name = "user";
    $cookie_value = "2233";
    setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/");
    setcookie('role','guest', time() + (86400 * 30), "/");
    header('Location: /cdn-cgi/login/admin.php');
}
if($_POST["username"]==="admin" && $_POST["password"]==="MEGACORP_4dm1n!!")
{
    $cookie_name = "user";
    $cookie_value = "34322";
    setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/");
    setcookie('role','admin', time() + (86400 * 30), "/");
    header('Location: /cdn-cgi/login/admin.php');
}
else
{?>
```

### Dashboard: admin.php

There is no access control check to ensure that the logged-in user is authorized to view a specific account, client, or branding entry. The IDs are sequential, so anyone with valid cookies (`user=2233`, etc.) can iterate over IDs and harvest all account or client data.

The server allowed the upload of malicious files, no check on file extension/type, no filename sanitization. Files are saved to a public directory.

```php
<?php
include("db.php");
if($_COOKIE["user"]==="34322" || $_COOKIE["user"]==="86575" || $_COOKIE["user"]==="2233")
{
?>

<!DOCTYPE html>
< -- SNIP -- >

<?php
if($_GET["content"]==="branding" && $_GET["brandId"]!="") # IDOR
{
    $stmt=$conn->prepare("select model,price from branding where id=?"); # Execute query
    $stmt->bind_param('i',$_GET["brandId"]);
    $stmt->execute();
    $stmt=$stmt->get_result();
    $stmt=$stmt->fetch_assoc();
    $model=$stmt["model"];
    $price=$stmt["price"];
    echo '<table><tr><th>Brand ID</th><th>Model</th><th>Price</th></tr><tr><td>'.$_GET["brandId"].'<td>'.$model.'</td><td>'.$price.'</td></tr></table';
}
else
{
    if($_GET["content"]==="clients"&&$_GET["orgId"]!="")# IDOR
    {
        $stmt=$conn->prepare("select name,email from clients where id=?"); # Execute query
        $stmt->bind_param('i',$_GET["orgId"]);
        $stmt->execute();
        $stmt=$stmt->get_result();
        $stmt=$stmt->fetch_assoc();
        $name=$stmt["name"];
        $email=$stmt["email"];
        echo '<table><tr><th>Client ID</th><th>Name</th><th>Email</th></tr><tr><td>'.$_GET["orgId"].'</td><td>'.$name.'</td><td>'.$email.'</td></tr></table';
    }
    else
    {
        if($_GET["content"]==="accounts"&&$_GET["id"]!="") # IDOR
        {
            $stmt=$conn->prepare("select access,name,email from accounts where id=?"); # Execute query
            $stmt->bind_param('i',$_GET["id"]);
            $stmt->execute();
            $stmt=$stmt->get_result();
            $stmt=$stmt->fetch_assoc();
            $id=$stmt["access"];
            $name=$stmt["name"];
            $email=$stmt["email"];
            echo '<table><tr><th>Access ID</th><th>Name</th><th>Email</th></tr><tr><td>'.$id.'</td><td>'.$name.'</td><td>'.$email.'</td></tr></table';
        }
        else
        {
            if($_GET["content"]==="uploads")
            {
                if($_COOKIE["user"]==="2233") # Cookie Tampering
                {
                    echo 'This action require super admin rights.';
                }
                else # Cookie Tampering
                {
                    if($_GET["action"]==="upload")
                    {
                        $target_dir = "/var/www/html/uploads/";
                        $target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]); # Malicious File Upload
                        if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) { # Malicious File Upload
                            echo "The file ". basename( $_FILES["fileToUpload"]["name"]). " has been uploaded.";
                        } else {
                            echo "Sorry, there was an error uploading your file.";
                        }
                    } else {  ?>

<h2>Branding Image Uploads</h2><br /><form action="/cdn-cgi/login/admin.php?content=uploads&action=upload" method="POST" enctype="multipart/form-data">
<table class="new"><tr><td>Brand Name</td><td><input name="name" type="text"/></td></tr><tr><td colspan="2"><input type="file" name="fileToUpload"/><input type="submit" value="Upload"/></td></tr></table></form>
<?php   } }

            }
            else {
                ?>
            <?php }
        }
    }
}?>
<script src='/js/jquery.min.js'></script>
<script src='/js/bootstrap.min.js'></script>
</body>
</html>
<?php }
else
{
    header('Location: /cdn-cgi/login/index.php');
}
?>
```

## Initial Access

Since I was able to write to the `/uploads` directory, I uploaded a copy of [php-reverse-shell.php](https://github.com/pentestmonkey/php-reverse-shell) and gained access as `www-data`.

<img width="1920" height="1057" alt="5" src="https://github.com/user-attachments/assets/e8397a85-42fe-4dde-b947-4da7c6eb9346" />

Looking through the webserver files, the interesting files are under: `/var/www/html/cdn-cgi/login`

- __db.php__: Database Connection
- __index.php__: Authentication
- __admin.php__: Dashboard

I analyzed the __index.php__/__admin.php__ files to better understand the vulnerabilities, which was discussed in the previous section [Code Review](#code-review).

The __db.php__ file did not use environment variables to access the database, instead it hardcoded database credentials for the __robert__ user. (There is also the lack of error handling for the SQL connection). Due to password reuse, I was able to SSH login to the machine.

<img width="1517" height="706" alt="6" src="https://github.com/user-attachments/assets/fae9dde1-1d58-4a6d-9392-7e00d74c258a" />

## Privilege Escalation

I noticed that __robert__ was part of an unusual group called `bugtracker`. Searching for all files belonging to this group revealed `/usr/bin/bugtracker`, which had the SUID bit set and was owned by the __root__ user.

Interacting with the program (_Electrical Vehicle Bug Tracker_) revealed basic functionality: you provide a _Bug ID_, and it reads the bug description from somewhere in the system, potentially a file or a database.

<img width="1479" height="564" alt="7" src="https://github.com/user-attachments/assets/6ad7af83-b207-4747-b754-c3fafb25b7b9" />

### Path Traversal

Before attempting privilege escalation, I wanted to understand how the program behaved with unexpected input. At first, I thought this program was interacting with a database, but there was nothing related to `bugtracker` in the MySQL instance running on the machine (_"garage"_ database). The next step was to experiment with the input and see if I could manipulate the query somehow.

My first finding was that the program did not correctly filter the input and allowed path traversal for the file name. Knowing this, I was able to read `/root/root.txt` and complete the challenge.

<img width="1903" height="643" alt="8" src="https://github.com/user-attachments/assets/4258c448-4c1c-46b3-be24-b27955c55b9f" />

### Path Injection

Initially, I thought of privilege escalation by checking for _SSH keys_, but the __root__ user didn’t have any in their home directory. The next step was to try to cause the program to fail and see if it returned any relevant information.

This was precisely the case. By providing an invalid file name, I could see the __stderr__ for the command:

```
cat: /root/reports/1234: No Such file or directory
```

This revealed two important details: a path inside the root directory (which was unreadable at the time) and the fact that the function call did not use the full path to the `cat` binary. This allowed for _Path Injection_.

To exploit this, I created a malicious version of `cat` in the `/tmp` directory that executed `/bin/sh`. I then modified my __PATH__ variable to include `/tmp` at the beginning. This caused the `bugtracker` binary to first look in `/tmp` and execute a malicious version of `cat` instead of the legitimate one in `/bin/cat`.

After providing any file name, the program immediately executed `/bin/sh` and gave me a root shell, concluding the privilege escalation for this box.

<img width="1123" height="521" alt="9" src="https://github.com/user-attachments/assets/fc077628-a77f-4523-a52f-9550d09c2e10" />

## Conclusion

The Oopsie machine highlighted several critical vulnerabilities that can compromise a system:

- **IDOR vulnerabilities**: Allowed unauthorized access to sensitive data by manipulating URL parameters.

- **Cookie tampering**: Authentication relied on unvalidated cookie values, enabling privilege escalation.

- **Unrestricted file uploads**: Permitted uploading malicious files, leading to remote code execution.

- **Path traversal and injection**: Exploited a SUID binary to gain root access by abusing improper input validation and reliance on relative paths.
