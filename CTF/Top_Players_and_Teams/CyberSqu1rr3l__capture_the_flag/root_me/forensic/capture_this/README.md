```
   ______                 _                            _________  __        _          
 .' ___  |               / |_                         |  _   _  |[  |      (_)         
/ .'   \_| ,--.  _ .--. `| |-'__   _   _ .--.  .---.  |_/ | | \_| | |--.   __   .--.   
| |       `'_\ :[ '/'`\ \| | [  | | | [ `/'`\]/ /__\\     | |     | .-. | [  | ( (`\]  
\ `.___.'\// | |,| \__/ || |, | \_/ |, | |    | \__.,    _| |_    | | | |  | |  `'.'.  
 `.____ .'\'-;__/| ;.__/ \__/ '.__.'_/[___]    '.__.'   |_____|  [___]|__][___][\__) ) 
                [__|                                                                                                                                                                                      
```
An employee has lost his Keepass password. He couldn't remember it, and couldn't find his
password file. After hours of searching, it turns out that he has sent a screen of his 
passwords to one of his colleagues, but it's still nowhere to be found. [^1]

Solution
-----------------------------------------------------------------------------------------
First, we verify the `sha256sum` of the compressed file *ch42.zip* to be correct and then
decompress the file with `unzip`. This way, we obtain two files, the *Keepass* database
and a screenshot capture. It is our objective, to obtain the password from *Capture.png*
but upon looking at it, we only discover other passwords and not the *Keepass* password
in the Excel sheet. After some looking, we discover a small *k* on the rightmost side
indicating that the table might go on but the screenshot cut it off. Now, we find out
that there was a vulnerability in the *Windows Snipping Tool*, which when exploited
could lead to the exposure of PPI. [^2] So, we research the *CVE-2023-28303* a bit 
further and discover an *Acropalypse Restoration and Detection Multi-Tool*. [^3] With it,
we can now proceed to restore the captured PNG file. Prior to that, we first need to
install the requirements in a Python environmnent of our choice with `pip install -r 
requirements.txt` and can then start the GUI through `python3.10 gui.py`. At first, we
have a bug in the snipping tool selection menu and thus hard-code the 
`self.selected_option` to *Windows 11 Snipping Tool* instead of the Google Pixel's.
Finally, we can restore the picture and are able to retrieve the original *Keepass*
password in plaintext. Under the *Internet* group, we can finally obtain the real flag.

[^1]: https://www.root-me.org/en/Challenges/Forensic/Capture-this
[^2]: https://nvd.nist.gov/vuln/detail/CVE-2023-28303
[^3]: https://github.com/frankthetank-music/Acropalypse-Multi-Tool
