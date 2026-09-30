# HTB The Needle writeup

## CHALLENGE DESCRIPTION
As a part of our SDLC process, we've got our firmware ready for security testing. Can you help us by performing a security assessment?

The challenge contains a firmware binary file
Run binwalk and extract the content
```
binwalk firmware.bin   

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Linux kernel ARM boot executable zImage (big-endian)
14419         0x3853          xz compressed data
14640         0x3930          xz compressed data
538952        0x83948         Squashfs filesystem, little endian, version 4.0, compression:xz, size: 2068458 bytes, 995 inodes, blocksize: 262144 bytes, created: 
```

Go to the decompressed filesystem and search for the files which contain the word, "login" 
```
grep -r login
```
The search result shows one shell script which runs the login service
```
etc/scripts/telnetd.sh:		telnetd -l "/usr/sbin/login" -u Device_Admin:$sign	-i $lf &
```
So, the user name is Device_Admin and the password is in the /etc/config/sign file

The flag is shown after sucessful login 
