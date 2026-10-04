# Challenge Name:
 [*Easy Message*](https://cybertalents.com/challenges/web/easy-message)
 
# Challenge Description
I Have a Message for you.

Link: [http://35.240.62.111/easymessage/](http://35.240.62.111/easymessage/)

## Answer
* Open the [link](http://35.240.62.111/easymessage/) then try to login with:
```
Username: demo
Password: demo
```
* There isn't any response from the website so lets see 'robots.txt' file of this server
* Open [http://35.240.62.111/easymessage/robots.txt] you can see that directory "/?source" is disallowed for search engine lets see its content
* Open [http://35.240.62.111/easymessage/?source] its contain php code which check entered username and password which he compare with 'base64_decode('Q3liZXItVGFsZW50')'
```php
 <?php

$user = $_POST['user'];
$pass = $_POST['pass'];

include('db.php');

if ($user == base64_decode('Q3liZXItVGFsZW50') && $pass == base64_decode('Q3liZXItVGFsZW50')
    {
        success_login();
    }
    else {
        failed_login();
}

?> 
```
* Decode this string with base64 command to know the username and password
```sh
echo 'Q3liZXItVGFsZW50' | base64 -d
```
* Return to the main link then enter the username and password we have already generate
```
I Have a Message For You

..-. .-.. .- --. -.--. .. -....- -.- -. ----- .-- -....- -.-- ----- ..- -....- .- .-. ...-- -....- -- ----- .-. ... ...-- -.--.- 
```
* This symbols implies that it is morse code, we can decode it using [this](https://morsedecoder.com/) online tool
* You got the Flag!!

 ## The Flag
 > 15716a249064f7e9684a816dcdb05282
