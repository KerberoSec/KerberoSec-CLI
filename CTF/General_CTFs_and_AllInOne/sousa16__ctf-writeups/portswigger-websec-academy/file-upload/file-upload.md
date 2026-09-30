
## Web shell upload via path traversal
[Web Shell upload via path traversal](https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-path-traversal)

Files: 
rcewebshell.php

Write-up:

1. Upload a PHP web shell to the default `avatars/` directory.
   
2. Attempting to execute the web shell via GET request shows the code in plain text, indicating the directory is configured to prevent script execution.
   
3. Use a proxy tool to intercept the upload request. Modify the filename parameter in the request body to `../rcewebshell.php` to attempt a path traversal. The server filters the `../` sequence.
   
4. Bypass the filter by URL-encoding the forward slash, changing the filename to `..%2frcewebshell.php`. This allows the file to be saved one directory level up from the intended location.
   
5. Access the uploaded file at `/files/rcewebshell.php`. The web shell executes, and the secret is returned in the response.

## Content-Type restriction bypass
[Web Shell upload via Content-Type restriction bypass](https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-content-type-restriction-bypass)

Files:
rcewebshell.php

Write-up:

1. After attempting to upload a PHP web shell, the server responds with a message that the file format is not supported.
   
2. Using a proxy tool, intercept the request and change the Content-Type header from application/x-php to image/png.
   
3. The upload is successful, and the server saves the file as rcewebshell.php.
   
4. Navigate to the uploaded file's URL: /files/avatars/rcewebshell.php.
   
5. The PHP web shell executes, and the output, which is the content of the secret file, is returned in the response, solving the lab.

## Extension blacklist bypass
[Web Shell upload via extension blacklist bypass](https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-extension-blacklist-bypass)

Files:
rcewebshell.php

Write-up:

1. After submiting payload and using GET request to execute code, it returns:
   "Sorry, php files are not allowed Sorry, there was an error uploading your file."
2. Change the value of the `filename` parameter to `.htaccess`.
   Change the value of the `Content-Type` header to `text/plain`.
   Replace the contents of the file (your PHP payload) with the following Apache directive:
    
    `AddType application/x-httpd-php .l33t`
    
    This maps an arbitrary extension (`.l33t`) to the executable MIME type `application/x-httpd-php`. As the server uses the `mod_php` module, it knows how to handle this already. We see the file avatars/.htaccess was successfully uploaded.
3. Attempting the original request with file extension ".l33t" works.
    filename="rcewebshell.php.l33t"
	Content-Type: application/x-php
	
	The file avatars/rcewebshell.php.l33t has been uploaded.
4. GET /files/avatars/rcewebshell.php.l33t returns the secret.

## Obfuscated file extension
[Web Shell upload via obfuscated file extension](https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-obfuscated-file-extension)

Files:
rcewebshell.php

Write-up:

1. After uploading exploit, we get:
   Sorry, only JPG & PNG files are allowed

2. After changing filename to "rcewebshell.php.png" and Content-type to "image/png", we get:
   The file avatars/rcewebshell.php.png has been uploaded.
   However, when we make GET request, file is treated as image and code is not executed.

3. Changing filename to "rcewebshell.php%00.png" returns:
   The file avatars/rcewebshell.php has been uploaded.
   When we make GET request, we get the secret.

    Adding a URL encoded null-byte works because of a discrepancy between validating the extension and saving the file

4. Validating the extension: server sees .png with a null-byte before and believes the filename is .png, a valid filename.
   
5. Saving the file: server sees rcewebshell.php followed by a null-byte and saves the file with that filename, which allows PHP execution.

# Flawed validation of the file's contents
[RCE via polyglot web shell upload](https://portswigger.net/web-security/file-upload/lab-file-upload-remote-code-execution-via-polyglot-web-shell-upload)

Files:
png.php

Write-up:

1. Creating a fake PNG file by adding the **PNG magic bytes** and adding the payload after them
   
2. Server didn't validate file extension, so I uploaded png.php
   
3. Uploaded successfully, and GET request gets the secret

# Race Conditions
[Race Conditions](https://portswigger.net/web-security/file-upload/lab-file-upload-web-shell-upload-via-race-condition)

Files:
race.py

Write-up:

1. We are given the code that introduces the race condition. Upon analysis, we see that the file is temporarily moved to a directory, and only then validated. This introduces a small time window (after moving and before validating) where we the PHP file exists on the server before getting deleted.
   
2. To exploit this, we need to send the POST request in parallel with multiple GET requests in order to achieve correct timing. For this, we use race.py, which uses the asyncio and httpx libraries.
