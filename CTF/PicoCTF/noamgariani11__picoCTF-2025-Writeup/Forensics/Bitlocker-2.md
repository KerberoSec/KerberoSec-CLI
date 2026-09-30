# Description

Jacky has learnt about the importance of strong passwords and made sure to encrypt the BitLocker drive with a very long and complex password. We managed to capture the RAM while this drive was opened however. See if you can break through the encryption!
Download the disk image here and the RAM dump here

# Solution

Uhh, it's just strings... 

Download the RAM dump and then run `gunzip memdump.mem.gz` and then `strings memdump.mem | grep pico` which you can see a lot of results and can probably sift through it and see the flag. Or you can just do `strings memdump.mem | grep picoCTF` and get three instances of the flag.

Note that the intended solution here was to use volatility to where you can download the tool here:
https://github.com/volatilityfoundation/volatility3

Or the Autopsy Digital Forensics tool (https://www.autopsy.com/) has an experimental volatility module where you can put the mem file in there and easily see the flag with the search feature for "picoCTF".

Flag: `picoCTF{B1tl0ck3r_dr1v3_d3crypt3d_902...}`