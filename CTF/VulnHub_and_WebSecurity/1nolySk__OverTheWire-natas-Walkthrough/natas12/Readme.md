# Natas12 solution: #

- Create a php file with content as follows(file available in repo):<br>
```php
<?php

	echo passthru("cat /etc/natas_webpass/natas13");
?>
```

- Load tha natas12 page, look through source code. 
- Do a **right-click → inspect element** or **press F12**. 
- There is  a hidden input tag inside form change the value to ***work.php***.
- The source picks up the extension and generates the new filename and appends the same extension to the uploaded file. Thus there is no check on file extension. 
- So now select your php file and upload it. The file will be uploaded and a  link will be created.
- Click on that link our php gets executed the pass for next level is displayed.
