## Challenge 🧩
If you can find the flag on this disk image, we can close the case for good!

Author: SYREAL</br>
Points: 400

Hint: If you're observing binary data raw in the terminal you may be misled about the contents of a block.

## Solution 🕵️‍♂️

```bash
┌──(user㉿shell)-[~]
└─$ sudo autopsy
============================================================================

                       Autopsy Forensic Browser 
                  http://www.sleuthkit.org/autopsy/
                             ver 2.24 

============================================================================
Evidence Locker: /var/lib/autopsy
Remote Host: localhost
Local Port: 9999

Open an HTML browser on the remote host and paste this URL in it:

    http://localhost:9999/autopsy

Keep this process running and use <ctrl-c> to exit
```

*[Image: autopsy_welcome]*

Lets create a new case </br>

*[Image: autopsy_newCase]*

Click on add host. Lets continue with the defaults </br>

*[Image: autopsy_addHost]*

Add the extracted .img file to autopsy </br>

*[Image: autopsy_imageAdd]*
*[Image: autopsy_imageAdd_details]*

Lets analyze entire disk which has 3 partitions. Click on `Analyze` to continue </br>

*[Image: Volume_Analyze]*

Searching for the `pico` keyword yields not-so-helpful results.
*[Image: keywordSearch]*
*[Image: keywordSearch_pico]*

Lets try with the `.txt` keyword, after analyzing all results we can find the flag. </br>

*[Image: keywordSearch_txt]*

`Tool Used: autopsy`

## Flag 🚩

`picoCTF{1_533_n4m35_xxxxxxxx}`
