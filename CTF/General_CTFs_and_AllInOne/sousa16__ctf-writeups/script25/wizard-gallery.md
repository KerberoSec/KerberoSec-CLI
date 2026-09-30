Write-up:

1. We are given some files that contain the challenge's code. We see we can upload a file with format
'png', 'jpg', 'jpeg', 'gif', 'bmp' or 'webp' and a max of 10MB.

2. We see that we can upload to `../logo.png`, since only the basename is verified and
then the full path is used. We also see that the image we upload is being resized 
using ImageMagick.

3. I found [CVE-2022-44268](https://hackerone.com/reports/1858574), as well as a
[tool](https://github.com/Sybil-Scan/imagemagick-lfi-poc) to exploit it.
Using the following command, we get an `exploit.png` we can upload to replace `logo.png`. <br>

    `python3 generate.py -f "/etc/passwd" -o exploit.png`

4. After replacing `logo.png`, we access `logo-sm.png` to trigger resizing. Downloading
this file and running `identify -verbose logo-sm.png` shows us the hex string of the resized PNG.
Decoding the hex string shows us the contents of `/etc/passwd`.

5. Uploading a file without extension allows us to clear every file in the app, so we can
trigger resizing again. Next, we do:

    `python3 generate.py -f "./flag.txt" -o exploit.png`

    And repeat the same steps to download `logo-sm.png`.

6. We notice that `identify -verbose logo-sm.png` doesn't work, as there is no
"Raw Profile". However, there is a "Profile-txt". This prompts us to attempt to
use `strings` to extract the flag:

    `strings logo-sm.png`

    This shows the existence of two hex strings. <br>
    Decoding these shows us the flag: `scriptCTF{t00_much_m46ic_32596bb76b1e}`