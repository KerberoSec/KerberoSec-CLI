# PHP Command Injection 

We got some interesting site where we can ping a site.

<img alt="ping" src="https://github.com/user-attachments/assets/afc8625d-d3f7-43fe-8ef1-5197f148924c" />

As name suggestes, lets greb the request and play around it.

ummhmm, interesting 

<img width="1116" height="604" alt="image" src="https://github.com/user-attachments/assets/3da9ec8e-a745-4e06-b6e5-fe0d153e9fca" />

As the challenge said, we must need to read the `index.php`. So, Lets try to read it via command injection. *Soultion is in challange name :P*

nice, we can see the `index.php` is in parent directory.

<img alt="ls -a" src="https://github.com/user-attachments/assets/eae5a67c-f762-4960-917c-528245c2d5bf" />

Lets try to cat it out. We got the `index.php`.
```php
<?php 
$flag = "".file_get_contents(".passwd")."";
if(isset($_POST["ip"]) && !empty($_POST["ip"])){
        $response = shell_exec("timeout -k 5 5 bash -c 'ping -c 3 ".$_POST["ip"]."'");
        echo $response;
}
?>
```
<img alt="index.php" src="https://github.com/user-attachments/assets/e98ab5c2-12c1-4e7f-b2c5-b32bb656e323" />

huh, Well everything is clear, I just cat out the `.passwd` file and submitted it. Simple ? yes, Lets try to make a script to solve the challenge.

