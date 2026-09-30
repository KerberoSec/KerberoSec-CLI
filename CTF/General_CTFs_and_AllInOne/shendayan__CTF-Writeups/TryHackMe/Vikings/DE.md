# Vikings

*[Image: Image]*

In diesem Writeup geht es um den Raum Vikings auf [TryHackMe](https://tryhackme.com/room/vikings) von ... [mir](https://tryhackme.com/p/Shendayan) :)

Ich habe diesen Raum als CTF aufgebaut, welches viele verschiedene Techniken benötigt, um gelöst zu werden.

## Verwendete Techniken
````
- nmap
- steghide
- ftp
- reverse image search
- hydra
- decryption with cyberchef
- zip2john / john
````

## Task 2: Roam around

Wie bei jedem neuen CTF ist es sinnvoll einen Portscan mit nmap durchzuführen.

````
nmap -A -sV 10.10.97.203
Starting Nmap 7.80 ( https://nmap.org ) at 2020-11-24 13:44 CET
Nmap scan report for 10.10.97.203
Host is up (0.031s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 05:a0:f7:73:1c:92:25:7f:76:ca:85:4b:e6:1e:9d:ee (RSA)
|   256 22:14:4d:87:a0:93:06:08:66:25:44:43:5a:b4:2e:ae (ECDSA)
|_  256 00:fe:b4:9a:31:bc:97:1a:91:b5:39:b4:2e:83:42:ae (ED25519)
80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Your arrived at a new shore!
1053/tcp open  ftp     vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             415 Nov 18 12:13 who-are-you.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.11.19.136
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 43.57 seconds
````
Wenn es einen Webserver gibt, schaue ich mir den immer an:

*[Image: Image]*

Im Sourcecode der Seite versteckt sich ein interessanter Kommentar:
````
<!-- WW91IGhhdmUgYXJyaXZlZCB3aXRoIHlvdXIgc2hpcCBvbiBhbiB1bmtub3duIGlzbGFuZC4gCkRvIHlvdSBzZWUgdGhhdCAvbGl0dGxlLWh1dCBpbiB0aGUgZGlzdGFuY2U/IApZb3UgbWlnaHQgZmluZCBhIGNsdWUgaW4gdGhlcmUuLi4= -->
````
````
❯ echo $comment | base64 -d
You have arrived with your ship on an unknown island. 
Do you see that /little-hut in the distance? 
You might find a clue in there...
````

/little-hut ist ein Hinweis auf ein Verzeichnis des Servers.

*[Image: Image]*

Wirklich einladend sieht es nicht aus. Aber der base64-Text sagte ja: "You might find a clue in there"

Heißt also, dass IN der Hütte der nächste Hinweis ist.

````
❯ steghide --extract -sf little-hut.jpg
Passwort eingeben: 
Extrahierte Daten wurden nach "runestone.txt" geschrieben.
❯ cat runestone.txt
Hello Stranger.

I hope you come with peaceful intent. 
Oh, you're looking for the key to Valhalla. 
Many others have tried that before. 
The only way I know to get there is to die honorably on the battlefield. 
The Valkyries will then show you the way.

An old friend of mine once told me about a wanderer who is said to have spoken to the Allfather.
If there is any way to travel to the golden hall without the Valkyries help, maybe this wanderer knows about it.
You can find him in a port nearby. His name is Bjorn. 
When you meet him, tell him I sent you. He owes me a favor.
So that he can be sure you are telling the truth, give him this:

*The old man hands you a rune-stone-carved-from-wood.*
````

#### T2Q1: How many open ports can you find? 

Answer: 3
#### T2Q2: Where can you find the next clue? 

Answer: /little-hut

#### T2Q3:  What name did the old man mention? 

Answer: Bjorn

## Task 3: Find his old friend

Okay, ich soll Bjorn also "in a port nearby" suchen.
Da fällt mir spontan der FTP-Server ein.

*[Image: Image]*

Wem muss ich denn hier Rede und Antwort stehen?

*[Image: Image]*

Da ich ja aber weiß, wen ich suche: bjorn: lasse ich mich davon nicht abschrecken und suche weiter!

````
ftp> ls -la
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drw-r-xr-x    3 0        0            4096 Nov 18 12:13 .
drw-r-xr-x    3 0        0            4096 Nov 18 12:13 ..
drwxr-xr-x    2 0        0            4096 Nov 19 14:14 .hidden
-rw-r--r--    1 0        0             415 Nov 18 12:13 who-are-you.txt
226 Directory send OK.
ftp> cd .hidden
250-You mingle with the crowd and walk through the village.
250-You don't really know what you're looking for.
250-Suddenly you see a familiar face.
250 Directory successfully changed.
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
-rw-r--r--    1 0        0             272 Nov 18 12:13 what-are-you-searching-for.txt
226 Directory send OK.
ftp> get what-are-you-searching-for.txt
local: what-are-you-searching-for.txt remote: what-are-you-searching-for.txt
200 PORT command successful. Consider using PASV.
150 Opening BINARY mode data connection for what-are-you-searching-for.txt (272 bytes).
226 Transfer complete.
272 bytes received in 0.00 secs (2.4243 MB/s)
````
*[Image: Image]*

Okay, das sieht nach einer Sackgasse aus!

Aber der alte Mann sagte ja auch, dass ich bjorn etwas geben soll, damit er weiß von wem ich komme.
Hört sich nach einer Art Passwort an. 

bjorn:rune-stone-carved-from-wood

*[Image: Image]*

Was fange ich jetzt mit den beiden Dateien an? Das eine ist ein Bild und das andere scheint eine ausführbare Datei zu sein.

Mit hexedit in die binary geschaut, fällt mir auf, dass es sich hierbei um eine Kopie der "strings" binary handelt.
Bjorns Tagelharpa ist ja kaputt gegangen, also bin ich nett und gebe ihm eine neue Saite für seine Harfe:

````strings Tagelharpa```` zeigt einen interessanten Abschnitt in der Mitte der Anzeige:

*[Image: Image]*

Wenn Bjorn sich nicht erinnert, muss ich eben nach dem Namen des Ortes suchen. So ganz ohne Anhaltspunkt bin ich ja nicht.

*[Image: Image]*

Wenn man das Bild aus dem Task bei yandex hochlädt, bekommt man als ersten Treffer angezeigt, wo dieses Wikingerdorf steht.

*[Image: Image]*

In [Gudvangen: Norwegen](https://gudvangenbudgethotel.com/about/).

````
❯ steghide --extract -sf vegvisir.jpg
Passwort eingeben: gudvangen
Extrahierte Daten wurden nach "wanderer.txt" geschrieben.
❯ cat wanderer.txt
wanderer:notallwhowanderarelost
````

#### T3Q1:  What instrument was Bjorn playing? 

Answer: Tagelharpa

#### T3Q2:  Where did he sent you? 

Answer: Gudvangen

#### T3Q3:  What secret is Vegvisir exposing to you? 

Answer: wanderer.txt

## Task 4: The Wanderer

Mit den soeben erhaltenen creds gibt es endlich Zugriff auf die Maschine!

*[Image: Image]*

Die .bash_history ist nicht gerade hilfreich:
````
wanderer@midgard:~$ cat .bash_history 
This thing is beyond your understanding, my child. 
Think no further on the matter and maybe you will read the riddle in the end. Who knows? 
Meanwhile the air is fresh and the day golden and my palace is near at hand. 
The young should enjoy themselves while they may, so come!
````

Mit ````sudo -l```` lässt sich überprüfen, ob wanderer etwas mit root-Rechten ausführen darf: darf er!

*[Image: Image]*

Das war eine kurze Vorstellung. Zum Glück kann man sich mit den creds nochmal anmelden. 

Sonst wäre es etwas schwierig herauszufinden, dass es noch einen weiteren User gibt: berserker.

*[Image: Image]*

#### T4Q1:  What did the wanderer do?

Answer: /etc/landscape/disappear.sh

#### T4Q2:  What did he tell you to fight with? 

Answer: brute force

## Task 5: The Berserker

Wenn ich gegen einen Berserker mit "brute force" kämpfen soll, schicke ich am besten die Hydra vor.
Die ist stärker, als ich :)

*[Image: Image]*

Im home-dir sind zwei bash-scripte, die ich nicht lesen kann. ````sudo -l```` hilft mir hier aber erneut weiter:

*[Image: Image]*

Da die Box ja sehr realitätsnah aufgebaut ist, verhalte ich mich auch ganz realistisch: NICHT :)
````
berserker@midgard:~$ sudo ./flee.sh 
If you run away from a fight, you will just die tired!
This is definitly not the way to Valhalla!
Connection to 10.10.97.203 closed by remote host.
Connection to 10.10.97.203 closed.
````
Tja, wenn ich nur die Wahl zwischen Kampf oder Flucht habe (und Flucht nicht funktioniert), bleibt mir wohl nichts anderes übrig, als zu kämpfen:

*[Image: Image]*

Den Kampf lasse ich hier mal aus: deine Kämpfe musst du selbst bestreiten... (Außerdem habe ich verloren!)

*[Image: Image]*

iwillguideyoutothegreathall flüstert sie mir ins Ohr? Liest sich nicht, wie etwas das ich erwartet hätte. Eher wie ein Passwort... Aber für wen?

````
berserker@midgard:~$ cd .. && ls
berserker  bjorn  valkyrie  wanderer
````
Ein neuer User...

#### T5Q1:  What sound does the berserker make?

Answer: hahaha

#### T5Q2:  Can you convince him not to fight? (Yay/Nay)

Answer: Nay

#### T5Q3:  Who appeared after the fight? 

Answer: valkyrie

## Task 6: The Valkyrie

Mit ````su valkyrie```` und dem Passwort iwillguideyoutothegreathall wechsle ich auf den neuen User.

Im home-dir von valkyrie liegt ein Script, welches ich (wieder mal) nicht ausführen kann .
````
valkyrie@midgard:~$ ll
total 24
drwxr-xr-x 2 valkyrie valkyrie 4096 Nov 24 19:29 ./
drwxr-xr-x 6 root     root     4096 Nov 24 19:29 ../
-rw-r--r-- 1 valkyrie valkyrie  220 Apr  4  2018 .bash_logout
-rw-r--r-- 1 valkyrie valkyrie 3771 Apr  4  2018 .bashrc
-r-x------ 1 root     root     1382 Nov 24 19:29 gullintanni*
-rw-r--r-- 1 valkyrie valkyrie  807 Apr  4  2018 .profile
valkyrie@midgard:/home$ sudo -l
[sudo] password for valkyrie: 
Matching Defaults entries for valkyrie on midgard:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User valkyrie may run the following commands on midgard:
    (root : root) /home/valkyrie/gullintanni
```` 
Bevor ich das Script ausführe, möchte ich aber gerne Frage 1 beantworten. 

Für wen ist Gullintanni ein anderer Name?

Eine kurze Google-Suche liefert hier das gewünschte Ergebnis:

*[Image: Image]*

Okay, dann mal schauen, was das Script so macht:
````
valkyrie@midgard:~$ sudo ./gullintanni
On your ride to Valhalla the colors suddenly become more colorful again...
Whats happening here..?
It looks like you didn't die on the battlefield after all.
Unfortunately, the Valkyrie noticed that too!

She moans softly:
I'm only allowed to bring fallen warriors to Valhalla!
But I don't have time to take you back to Midgard.
If I leave you here, you will be forever trapped between worlds.
Your only chance is to sneak past Heimdallr and head back to midgard via the Bifrost.
He's guarding the Bifrost very carefully, but today he'll be distracted.
A big feast is being celebrated and as far as I know him, he'll leave his post to get new mead,
everytime his drinking horn is empty. While he's not watching, you can search for a part of his key.
The key to Himinbjörg consists of four rune stones. Put them together in the correct order and enter Asgard.
````

#### T6Q1:   Who is Gullintanni another name for?

Answer: Heimdallr

#### T6Q2:  How many rune stones is the key made of?

Answer: 4

## Task 7: The Guardian

Plötzlich bekomme ich eine Broadcast message von root:

*[Image: Image]*

Ja Prost! Sieht so aus, als hätte da jemand etwas zu trinken.

````cd .. && ll```` zeigen, dass es schon wieder einen neuen User und eine neue Datei in /home gibt.

heimdallr wurde hinzugefügt und HeimdallrsDrinkingHorn liegt in /home.

````
valkyrie@midgard:/home$ cat HeimdallrsDrinkingHorn 
full
````
Die Walküre hat vorhin noch gesagt: 

[...] as far as I know him, he'll leave his post to get new mead,
everytime his drinking horn is empty. While he's not watching, you can search for a part of his key. [...]

Jetzt kam ein Broadcast: "This horn must have a hole..." 

Ja, das kenne ich. Meine Mate-Flaschen haben auch immer ein Loch :)

````
valkyrie@midgard:/home$ cat HeimdallrsDrinkingHorn 
empty
````

Aha, jetzt kann ich also nach den vier Teilen des Schlüssels suchen. 

Teil 1 liegt in /home/valkyrie. Dort ist plötzlich ein Heuhaufen entstanden, in welchem eine kleine Box versteckt ist:

*[Image: Image]*

Sieht auf den ersten Blick aus, wie base64: ist es aber nicht.

Ich habe es bei [Cyberchef](http://icyberchef.com/) eingegeben und siehe da: 

From Base62, From Hex -> youshallnot

Da bin ich ja mal gespannt, was ich nicht soll...

Teil 2 finde ich in /etc/ hinter einem .loose_board/ in einem .sachet/:

*[Image: Image]*

Cyberchef verrät mir auch hier die Lösung:

From Decimal, From Hex -> passthebifrost

Alles klar, bis jetzt habe ich "youshallnotpassthebifrost"...

Sehe ich ein, dass er das nicht möchte. Ich lebe ja und habe dementsprechend in Walhalla nichts verloren ;)

Teil 3 finde ich in /var/backups/ in einem .hollow_stone/.

*[Image: Image]*

Interessant, dass sich heimdallr auch gerade fragt, wie er die Kiste aufbekommt.

Denn man benötigt ein Passwort, um die Datei zu entpacken:
````
valkyrie@midgard:~$ unzip locked-chest.zip 
Archive:  locked-chest.zip
[locked-chest.zip] root/runestone.txt password:
````
Okay, ZIP-Passwörter sind ja einfach zu cracken, solange sie sich in einer Wordlist befinden.

Zuerst die Datei auf die eigene Maschine kopieren mit scp, dann mit zip2john den Passworthash auslesen und anschließend mit john cracken:

*[Image: Image]*

Entpacken werde ich das Archiv wieder auf der VM:

*[Image: Image]*

Sieht stark nach Morsecode aus. Den kann ich leider nicht: Cyberchef schon :)

From Morse Code, From Hex -> aslongas

Okay, youshallnotpassthebifrostaslongas ... so lange wie was?

Teil 4 finde ich in / unter einem .stack_of_blankets/ in einem .bag/.

*[Image: Image]*

Bäh, Binärcode... Hatte ich zwar im Studium, aber auch hier ist Cyberchef deutlich schneller, als ich es wäre:

From Binary, From Hex -> iamthekeeper

Aha! youshallnotpassthebifrostaslongasiamthekeeper

Sieht für mich nach einem ziemlich langen Password aus :) 

Während der Suche nach den Teilen, habe ich verschiedene Broadcasts bekommen. Einer ist base64 verschlüsselt und der andere ist irgendwie verdreht. ROTiert vielleicht? :)

#### T7Q1:    What is the first part hidden in?

Answer: .little_box/

#### T7Q2:  What is the second part hidden in?

Answer: .sachet/

#### T7Q3:   What is the third part hidden in?

Answer: locked-chest.zip

#### T7Q4:  What is the magic word to open the chest?

Answer: rainbow

#### T7Q5:   What is the fourth part hidden in?

Answer: .bag/

## Task 8: Valhalla

````su heimdallr```` und das ellenlange Passwort eingegeben. Passt!

Im home-dir befindet sich eine Notiz:

*[Image: Image]*

Kurz mal ````sudo -l```` gechecked und siehe da, heimdallr kann /bin/enter_valhalla als root ausführen!

In der Datei steht nur ein einziger Befehl, doch der ist der Jackpot: ````chmod 666 /etc/passwd````

World-writeable :) Also schnell ausführen und einen neuen root-User eintragen:

*[Image: Image]*

````
# cat /root/valhalla.txt
THM{xxx_xxxxxxxx_xx_xxxxxxxx} // Hey, alles kann ich ja hier auch nicht verraten :)
````

#### T8Q1: What's the content of /root/valhalla.txt? 

Answer: THM{xxx_xxxxxxxx_xx_xxxxxxxx}

Ich hoffe mit diesem Walkthrough war es kein Problem mehr, diesen Raum zu bewältigen.

Danke für's Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
