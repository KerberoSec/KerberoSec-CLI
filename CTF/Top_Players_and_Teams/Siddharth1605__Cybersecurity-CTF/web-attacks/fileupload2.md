## **Flawed validation of the file's contents**

Servers wont just check content-type in request, for example if is an image, it’ll check it’s dimension. So we can’t pass a php one-liner code in content.

Some file type contains specific header/footer bytes, for example JPEG files always begin with the bytes `FF D8 FF`.

This can also be modified using exiftool

```sql
exiftool -Comment="<?php echo 'START ' . file_get_contents('/home/carlos/secret') . ' END'; ?>" <YOUR-INPUT-IMAGE>.jpg -o polyglot.php

```

This command will create a image format and store the payload in it as comment, and the extension will be .php (which can be bypassed on the server)

## **Exploiting file upload race conditions**

Nowadays servers won’t execute a file directly it’ll place them in secondary folder and start to execute. But even in this case, due to some os level things, file will be first placed in primary folder(dangerous folder) and can able to execute by attacker.

Or we can provide file as link format, server will fetch it and store it and execute it. Fetching will be done by http, so there won’t be proper validations.

If the uploaded file seems to be both stored and served securely, the last resort is to try exploiting vulnerabilities specific to the parsing or processing of different file formats. For example, you know that the server parses XML-based files, such as Microsoft Office `.doc` or `.xls` files, this may be a potential vector for XXE injection attacks.
.
