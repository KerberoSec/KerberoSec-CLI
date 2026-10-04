# CTF-Write-up

## Try Hack Me: Lian_Yu

URL: https://tryhackme.com/room/lianyu

Created by _https://tryhackme.com/p/Deamon_

![logo](https://user-images.githubusercontent.com/20625004/111899596-51ca1f80-8a36-11eb-94ff-fd726fab3227.jpeg)

You should deploy the machine first.

Run nmap against the target machine.

```nmap -sC -A <target IP>```

Port 80 web access. 

![port80](https://user-images.githubusercontent.com/20625004/111899688-d452df00-8a36-11eb-86f7-69bcf2762d3b.PNG)

Then we use ```gobuster``` to seach for paths in the web application.

```gobuster dir <target IP> -w /path/to/wordlist```

```===============================================================```
```/.htaccess            (Status: 403) [Size: 199]```
```/.htpasswd            (Status: 403) [Size: 199]```
```/island               (Status: 301) [Size: 235]```
```/server-status        (Status: 403) [Size: 199]```                             

Accessing the web app with the new path 

![code](https://user-images.githubusercontent.com/20625004/111899829-87233d00-8a37-11eb-8543-f85bcc1904ad.PNG)

Seems we have a code.

Again use ```gobuster``` with the new path.

After a lot enumeration we found a new path 

```===============================================================```
```/2100                 (Status: 301) [Size: 240] ```

![2100](https://user-images.githubusercontent.com/20625004/111900051-f188ad00-8a38-11eb-8ffa-74264719ad46.PNG)

View source of the page provide us with an extension.

![source_2100](https://user-images.githubusercontent.com/20625004/111900103-2d237700-8a39-11eb-8358-a3de1ea9db8b.PNG)

Again fire ```gobuster``` to search for the file extension with flag ```-x```.

```gobuster dir -u "<Target IP>/island/2100/" -w /path/to/wordlsit -x <name extension>```

ok we found it ```/green_arrow.ticket   (Status: 200) [Size: 71]```

Access the new path on the browser.

![file_](https://user-images.githubusercontent.com/20625004/111900357-d880fb80-8a3a-11eb-9c89-3f8722a96730.PNG)

We found a token and we should decrypt it. It is a Base58 and decode it provide us with a pass. And we have the FTP password.

By using as username the code we found earlier "third pic" and the decoded pass we can access the FTP service.

```220 (vsFTPd 3.0.2)```
```Name (10.10.70.136): <code_word>```
```331 Please specify the password.```
```Password:```
```230 Login successful.```
```Remote system type is UNIX.```
```Using binary mode to transfer files.```
```ftp> ls```
```200 PORT command successful. Consider using PASV.```
```150 Here comes the directory listing.```
```-rw-r--r--    1 0        0          511720 May 01  2020 Leave_me_alone.png```
```-rw-r--r--    1 0        0          549924 May 05  2020 Queen's_Gambit.png```
```-rw-r--r--    1 0        0          191026 May 01  2020 aa.jpg```
```226 Directory send OK.```
```ftp> ```

download the pics from the FTP service ```get xxxxx.xxx```

```Leave me alone``` pic has an error, as we see with the help of ```exiftool``` .

```ExifTool Version Number         : 12.16```
```File Name                       : Leave_me_alone.png```
```Directory                       : .```
```File Size                       : 500 KiB```
```File Modification Date/Time     : 2021:03:21 05:55:40-04:00```
```File Access Date/Time           : 2021:03:21 05:59:33-04:00```
```File Inode Change Date/Time     : 2021:03:21 05:59:26-04:00```
```File Permissions                : rw-r--r--```
```Error                           : File format error```

This means that the image’s header is corrupted, google Hex table of PNG image to check the values and modify the image with Hexeditor tool.

The file’s magic number is incorrect.

I opened the png with hexeditor and changed the first 16 digits with magic number for .png file : 89 50 4E 47 0D 0A 1A 0A

![hexeditor](https://user-images.githubusercontent.com/20625004/111904529-1d635d00-8a50-11eb-81c7-eab43e90054a.PNG)

```exiftool``` again the image 

```ExifTool Version Number         : 12.16```
```File Name                       : Leave_me_alone.png```
```Directory                       : .```
```File Size                       : 500 KiB```
```File Modification Date/Time     : 2021:03:21 08:14:06-04:00```
```File Access Date/Time           : 2021:03:21 08:14:06-04:00```
```File Inode Change Date/Time     : 2021:03:21 08:14:06-04:00```
```File Permissions                : rw-r--r--```
```File Type                       : PNG```
```File Type Extension             : png```
```MIME Type                       : image/png```
```Image Width                     : 845```
```Image Height                    : 475```
```Bit Depth                       : 8```
```Color Type                      : RGB with Alpha```
```Compression                     : Deflate/Inflate```
```Filter                          : Adaptive```
```Interlace                       : Noninterlaced```
```Image Size                      : 845x475```
```Megapixels                      : 0.401```

Finally the pic with the password.

![passwd](https://user-images.githubusercontent.com/20625004/111904665-b4301980-8a50-11eb-8235-20f1acc8fb66.PNG)

Nothing the password we found in not valid for SSH, lets check the other two pictures.

Lets try steghide for the other two pics.

```steghide extract -sf aa.jpg```

![zip](https://user-images.githubusercontent.com/20625004/111904878-a8912280-8a51-11eb-9afd-c6feee5fa8b4.PNG)

We used the one pass found on the First picture and saved it to a zip file, that contains two files.
Checked passwd.txt and here’s a Note, the other file ```shado``` has a string.

After a lot of searching to identify what was missing i logged in again to the the FTP service.
There i observed that there was also another user.

![user](https://user-images.githubusercontent.com/20625004/111905104-bbf0bd80-8a52-11eb-8691-09d45ab71c9d.PNG)

Then use SSH with the new name ```ssh slade@<target IP>``` and use the passwd that we found on the zip file, and you have access to the SSH service.

![ssh](https://user-images.githubusercontent.com/20625004/111905208-2570cc00-8a53-11eb-81a2-2cc80efce123.PNG)

In the ```/home/slade``` folder is the user.txt flag.

check current user has sudo permissions.
```sudo -l```
``` *User may run the following commands on LianYu: (root) PASSWD: /usr/bin/pkexec```
  
Searching for pkexec file on gtfobins for privilege escalation we found pkexec /bin/bash command.
When we run this command ```sudo /usr/bin/pkexec /bin/bash``` , we have root shell.

![root](https://user-images.githubusercontent.com/20625004/111905574-0410df80-8a55-11eb-83f9-37470276adb6.PNG)

On path ```/root``` you can find the second flag.

Congtarz finished...
