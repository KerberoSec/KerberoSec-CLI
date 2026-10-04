# Mission-Pumpkin v1.0: PumpkinRaising

This is about the second part of the Pumpkin trilogy by [VulnHub](https://www.vulnhub.com/?q=pumpkin).

## Techniques used
````
- Zenmap
- Dirbuster
- hex2raw
- gpg
- Morsecode
- base32
- Wireshark
- steghide
- stegosiute
- SSH
- Python
````

*[Image: Image]*

## Finding out the IP address

The second part of the series is also aimed at beginners. And here, the IP is displayed when the VM starts, too.

So my target this time is IP 192.168.178.60.

## Looking for open ports

Step number one is always a port scan with Zenmap for me. (Yeah, I know nmap looks more professional, but idc :))

*[Image: Image]*

Okay there is a web server and SSH. I'll start with the easier one.

## Webserver

I am greeted with a lovingly designed website:
*[Image: Image]*

Hovering over the pictures will likely show you the name of the corresponding pumpkin species.

The text tells me that if you want to grow a pumpkin, you need seeds first. That's a no brainer.

Then you need WATER and SUNLIGHT, as the lower part of the page suggests.

As with every website that I look at in a CTF, it is worth taking a look at the source code.

*[Image: Image]*

Looks like base64 encoded to me:

````
echo VGhpcyBpcyBqdXN0IHRvIHJlbWFpbmQgeW91IHRoYXQgaXQncyBMZXZlbCAyIG9mIE1pc3Npb24tUHVtcGtpbiEgOyk= | base64 -d
This is just to remaind you that it's Level 2 of Mission-Pumpkin! ;)
````

Okay, I got it: the level of difficulty has been increased.

Since I couldn't find any other information on the site, I'll take a look if there are any other sites on the server.

## Dirbuster

Yes, here I choose the GUI instead of the command line tool, too. 
For the tree view alone, I love the GUI:

*[Image: Image]*

Interesting, the pumpkin.html looks promising. Just like underconstruction.html.

*[Image: Image]*

Okay, so Jack orders his pumpkin seeds from Morse and is probably communicating unencrypted over the Internet.

But before I look for unencrypted data traffic, I take a look at the source code of the page.

*[Image: Image]*

That looks like base64 again: but it isn't. Decoding it results in gibberish.
I make a note of it and look at it again later.

## hex2raw

Careful, don't overlook anything: The line numbering for the source code doesn't stop at the end of the page ...
It continues to line 151! And just before that there is a long string of characters that at first glance looks like hex code to me.

`59 61 79 21 20 41 70 70 72 65 63 69 61 74 65 20 79 6f 75 72 20 70 61 74 69 65 6e 63 65 20 3a 29 0a 41 6c 6c 20 74 68 69 6e 67 73 20 61 72 65 20 64 69 66 66 69 63 75 6c 74 20 62 65 66 6f 72 65 20 74 68 65 79 20 62 65 63 6f 6d 65 20 65 61 73 79 2e 0a 41 63 6f 72 6e 20 50 75 6d 70 6b 69 6e 20 53 65 65 64 73 20 49 44 3a 20 39 36 34 35 34 0a 0a 44 6f 2c 20 72 65 6d 65 6d 62 65 72 20 74 6f 20 69 6e 66 6f 72 6d 20 4a 61 63 6b 20 74 6f 20 70 6c 61 6e 74 20 61 6c 6c 20 34 20 73 65 65 64 73 20 69 6e 20 74 68 65 20 73 61 6d 65 20 6f 72 64 65 72 2e`

I piped this string into `hex2raw` and here is the result:
````
echo 59 61 79 21 20 41 70 70 72 65 63 69 61 74 65 20 79 6f 75 72 20 70 61 74 69 65 6e 63 65 20 3a 29 0a 41 6c 6c 20 74 68 69 6e 67 73 20 61 72 65 20 64 69 66 66 69 63 75 6c 74 20 62 65 66 6f 72 65 20 74 68 65 79 20 62 65 63 6f 6d 65 20 65 61 73 79 2e 0a 41 63 6f 72 6e 20 50 75 6d 70 6b 69 6e 20 53 65 65 64 73 20 49 44 3a 20 39 36 34 35 34 0a 0a 44 6f 2c 20 72 65 6d 65 6d 62 65 72 20 74 6f 20 69 6e 66 6f 72 6d 20 4a 61 63 6b 20 74 6f 20 70 6c 61 6e 74 20 61 6c 6c 20 34 20 73 65 65 64 73 20 69 6e 20 74 68 65 20 73 61 6d 65 20 6f 72 64 65 72 2e | hex2raw 
Yay! Appreciate your patience :)
All things are difficult before they become easy.
Acorn Pumpkin Seeds ID: 96454

Do, remember to inform Jack to plant all 4 seeds in the same order.
````

Okay, so I'm looking for 4 seeds (flags), which have to be "planted" in the correct order, and I've already found one.
If I look closely at the first page again and check the order of the listing, the seed is No. 3
````
Big Max Pumpkin:
Jack-Be-little Pumpkin:
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon:
````

Have I already missed the first two?

## Back to basics

Unfortunately, what dirbuster didn't show me was the `robots.txt`, which can be found on almost every web server.
So I just dared a shot in the dark and hit:

`wget 192.168.178.68/robots.txt` copied the file to my machine.

Content of robots.txt:
````
#
# robots.txt
#
# This file is to prevent the crawling and indexing of certain parts
# of your site by web crawlers and spiders run by sites like Yahoo!
# and Google. By telling these "robots" where not to go on your site,
# you save bandwidth and server resources.
#
# This file will be ignored unless it is at the root of your host:
# Used:    http://example.com/robots.txt
# Ignored: http://example.com/site/robots.txt
#
# For more information about the robots.txt standard, see:
# http://www.robotstxt.org/robotstxt.html

User-agent: *
Crawl-delay: 10
# CSS, JS, Images

# Directories
Disallow: /includes/
Disallow: /scripts/
Disallow: /js/
Disallow: /secrets/
Disallow: /css/
Disallow: /themes/

#Images
Allow: /images/*.gif
Allow: /images/*.jpg

# Files
Disallow: /CHANGELOG.txt
Disallow: /underconstruction.html
Disallow: /info.php
Disallow: /hidden/note.txt
Disallow: /INSTALL.mysql.txt
Disallow: /seeds/seed.txt.gpg
Disallow: /js/hidden.js

# Paths (clean URLs)
Disallow: /comment/reply/
Disallow: /filter/tips/
Disallow: /scripts/pcap
Disallow: /node/add/
Disallow: /security/gettips/
Disallow: /search/hidden/
Disallow: /user/addme/
Disallow: /user/donotopen/
Disallow: /user/
Disallow: /user/settings/
````

Interesting, some paths are shown here that dirbuster didn't find.
So for the next time I should take a bigger wordlist.

I was particularly interested in a few entries:
- In the `/ images` path not only GIFs but also JPGs are allowed.
- In the `/ hidden` path there is a file` note.txt`.
- In the `/ seeds` path there is a file` seed.txt.gpg`.

With `wget 192.168.178.60 / hidden / note.txt` I downloaded the note.txt, which has a very interesting content:
````
Robert : C@43r0VqG2=
Mark : Qn@F5zMg4T
goblin : 79675-06172-65206-17765
````

So Mr. Goblin is back again. But who are Robert and Mark?

None of the combinations works for SSH.

## GNU Privacy Guard

With `wget 192.168.178.60 / seeds / seed.txt.gpg` I download the next interesting file.
The first attempt to decrypt the file was interrupted by a password query!
None of the three passwords from note.txt works. After wondering whether I might have missed the password, suddenly a good idea came to my mind.

It's a pretty playful CTF with a story. So it's not really a realistic machine.
On the first website there was a list of what you need to grow the seeds.
SEED: WATER: SUNLIGHT
After a few tries I finally guessed the correct password: SEEDWATERSUNLIGHT
````
                               _
                              /\              )\
                _           __)_)__        .'`--`'.
                )\_      .-'._'-'_.'-.    /  ^  ^  \
             .'`---`'. .'.' /o\'/o\ '.'.  \ \/\/\/ /...-_..
            /  <> <>  \ : ._:  0  :_. : \  '------'       _J_..-_
            |    A    |:   \\/\_/\//   : |     _/)_    .'`---`'.    ..-_
'...    ..  \  <\_/>  / :  :\/\_/\/:  : /   .'`----`'./.'0\ 0\  \
           _?_._`"`_.'`'-:__:__:__:__:-'   /.'<\   /> \:   o    |..-_
        .'`---`'.``  _/(              /\   |:,___A___,|' V===V  /
       /.'a . a  \.'`---`'.        __(_(__ \' \_____/ /'._____.'
       |:  ___   /.'/\ /\  \    .-'._'-'_.'-:.______.' _?_            ..-.
..-    \'  \_/   |:   ^    |  .'.' (o\'/o) '.'.     .'`"""`'.-...-_
        '._____.'\' 'vvv'  / / :_/_:  A  :_\_: \   /   ^.^   \
                  '.__.__.' | :   \'=...='/   : |  \  `===`  /
         --                  \ :  :'.___.':  : /    `-------`                                                     
                    -.        '-:__:__:__:__:-'..                                                                 
.._,'...-.._,'...-.._,'...-.._,'...-.._,'...-.._,'...-.._,'...-.._,'...-                                          
-.-- .. .--. .--. . . -.-.--                                                                                      
                                -.-- --- ..-                                                                      
    .- .-. .                                                                                                      
                        --- -.                                                                                    
                                                               - .... .                                           
       .-. .. --. .... -                                                                                          
                     .--. .- - .... .-.-.- .-.-.- .-.-.-                                                          
                            -... .. --. -- .- -..- .--. ..- -- .--. -.- .. -.                                     
... . . -.. ...                                                                                                   
                 .. -.. ---...                                                                                    
                                    -.... ----. ..... ----- --... 
````
A nice piece of ASCII art. But does that really help me?
The last 11 lines are interesting here. They just consists of periods and dashes...
Almost looks like a Morse code.

#### MORSE! The supplier!

Unfortunately, I can't memorize Morse code, so I looked for a way to decipher the characters.
[Here I found what I was looking for.](https://gc.de/gc/morse/)

The decrypted text looks like this:
````
yippee!
you are on the right path...
bigmaxpumpkin seeds id: 69507
````

Great, that's probably flag 2/4:
````
Big Max Pumpkin: 69507
Jack-Be-little Pumpkin:
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon:
````

What's next now?
Oh yes, I still had this strange string from the pumpkin.html

## Base32

So what does `F5ZWG4TJOB2HGL3TOB4S44DDMFYA====` mean?
Since it wasn't base64, I googled a bit and found out that it should be base32.

````
echo F5ZWG4TJOB2HGL3TOB4S44DDMFYA==== | base32 -d   
/scripts/spy.pcap
````

Dirbuster had already shown me the scripts path on the web server. However, I assumed Javascript or something.

## Wireshark

But well, I already had the thought earlier that I would like to monitor the traffic from the VM if Jack is communicating unencrypted over the Internet.

It looks like I don't need that anymore.

With `wget 192.168.178.60/scripts/spy.pcap` I downloaded the file and then opened it in Wireshark.

The individual packets looked like 2 different communications, so I followed the different TCP streams:

*[Image: Image]*

Great, now I already have another ID, but which of the two remaining pumpkin varieties does it belong to?

Maybe the second stream will provide information about this:

*[Image: Image]*

Indeed. So this is flag 3/4:

````
Big Max Pumpkin: 69507
Jack-Be-little Pumpkin: 50609
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon:
````

Now only the last one is missing ...

## Under construction!

Dirbuster had shown an `/underconstruction.hmtl` page, which I haven't looked at yet.

*[Image: Image]*

A funny little pumpkin that even "talks" to you when you point the mouse at it:

`Looking for seeds? I ate them all!`

The source code is basically inconspicuous, except for a small passage that is not displayed on the page:

*[Image: Image]*

So it means: There is a file `/images/jackolantern.gif`

This is the same picture as on the underconstruction.hmtl, but with a different file name.

## I ate them all!

When a picture tells me that it has eaten something, I immediately have think of steganography.

With `steghide` I wanted to check whether the assumption was correct and was asked for a password.

`steghide --extract -sf jackolantern.gif`

To make it easier, I loaded the image into `stegosuite` and tried the passwords from note.txt I found earlier. They have to be good for something.

In fact, one of the passwords worked and I was presented with a new text file:

*[Image: Image]*

````
Fantastic!!! looking forward for your presence in pumpkin party.
Lil' Pump-Ke-Mon Pumpkin seeds ID : 86568
```` 
Great, now I have found all 4 flags:
````
Big Max Pumpkin: 69507
Jack-Be-little Pumpkin: 50609
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon: 86568
````

Since the sequence of the seed IDs is the same as the pictures on the first website, I assume that this is the correct sequence.

And when I think of the note.txt, the given "password" from goblin looks similar.

## SSH

*[Image: Image]*

Bingo! The numbers were placed in the right order.

Unfortunately, this seems to be a restricted shell.
`ls` is unknown and `cd` is forbidden.

## Breaking out

python works ... Interesting! So I quickly spawned a python shell:

`python -c 'import pty;pty.spawn("/bin/bash/")`

That's working! After looking around a little and couldn't find anything interesting, I wondered if Jack could do anything as sudo:

`sudo -l` shows the available commands here.

*[Image: Image]*

Hmm, strace doesn't mean much to me. So I had to ask google, she always knows :)
*[Image: Image]*

Well that reads very well!

## Privilege escalation

Let's see if it's really that simple:

*[Image: Image]*

Indeed! Well that was a piece of cake :)

Looked around a little and * BOOM * found what I was looking for!

*[Image: Image]*

Very nice! I enjoyed the machine even more than the first! I'm really caught up in pumpkin fever and would like to go straight to the third part of the series ...

Thanks for reading and happy pwning :)

Contact -> [Twitter](https://twitter.com/_the_someone)
