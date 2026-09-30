# Mission-Pumpkin v1.0: PumpkinRaising

Hier geht es um den zweiten Teil der Pumpkin-Trilogie von [VulnHub](https://www.vulnhub.com/?q=pumpkin).

## Verwendete Techniken
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

## Herausfinden der IP-Adresse

Auch der zweite Teil der Serie ist an Beginner gerichtet. Und auch hier wird die IP beim Start der VM angezeigt.

Mein Ziel ist diesmal also die IP 192.168.178.60.

## Erste Ansatzpunkte finden

Schritt Nummer eins ist bei mir immer ein Portscan mit Zenmap. (Ja-ha, ich weiß, dass nmap professioneller aussieht!)

*[Image: Image]*

Okay, es gibt einen Webserver und SSH. Da fange ich doch mit dem einfacheren an.

## Webserver

Ich werde mit einer liebevoll gestalteten Website begrüßt:
*[Image: Image]*

Mit dem Mauszeiger über die Bilder zeigend, wird einem wahrscheinlich der Name der entsprechenden Kürbisart angezeigt.

Der Text gibt mir den Hinweis, dass man zuerst Samen braucht, wenn man einen Kürbis aufziehen will. Klingt logisch.

Im Anschluss daran braucht man wohl WATER und SUNLIGHT, wie der untere Teil der Seite vermuten lässt.

Wie bei jeder Website, die ich mir in einem CTF anschaue, lohnt sich auch hier wieder ein Blick auf den Sourcecode.

*[Image: Image]*

Sieht für mich wie bas64 codiert aus:

````
echo VGhpcyBpcyBqdXN0IHRvIHJlbWFpbmQgeW91IHRoYXQgaXQncyBMZXZlbCAyIG9mIE1pc3Npb24tUHVtcGtpbiEgOyk= | base64 -d
This is just to remaind you that it's Level 2 of Mission-Pumpkin! ;)
````

Okay, habe verstanden: Der Schwierigkeitsgrad wurde also angehoben.

Da ich keinen weiteren Hinweis auf der Seite gefunden habe, schaue ich mal, ob es eventuell noch andere Seiten auf dem Server gibt.

## Dirbuster

Ja, auch hier wähle ich wieder das GUI, statt dem Commandlinetool. 
Alleine für die Tree-Ansicht, liebe ich das GUI:

*[Image: Image]*

Interessant, die pumpkin.html sieht vielversprechend aus. Genau so wie underconstruction.html.

*[Image: Image]*

Okay, Jack bestellt seine Kürbissamen also bei Morse und kommuniziert dabei wohl unverschlüsselt übers Internet.

Bevor ich aber nach unverschlüsseltem Datenverkehr schaue, werfe ich noch einen Blick auf den Sourcecode der Seite.

*[Image: Image]*

Das sieht wieder nach base64 aus: ist es aber nicht. Da wird nur mumpitz ausgegeben. 
Notiere ich mir und schaue mir das später nochmal an.

## hex2raw

Nichts übersehen: Die Zeilenangaben für den Sourcecode hören am Ende der Seite nicht auf...
Es geht weiter bis zur Zeile 151! Und kurz davor findet sich eine lange Zeichenfolge, die für mich auf den ersten Blick nach Hexadezimalzahlen aussieht.

`59 61 79 21 20 41 70 70 72 65 63 69 61 74 65 20 79 6f 75 72 20 70 61 74 69 65 6e 63 65 20 3a 29 0a 41 6c 6c 20 74 68 69 6e 67 73 20 61 72 65 20 64 69 66 66 69 63 75 6c 74 20 62 65 66 6f 72 65 20 74 68 65 79 20 62 65 63 6f 6d 65 20 65 61 73 79 2e 0a 41 63 6f 72 6e 20 50 75 6d 70 6b 69 6e 20 53 65 65 64 73 20 49 44 3a 20 39 36 34 35 34 0a 0a 44 6f 2c 20 72 65 6d 65 6d 62 65 72 20 74 6f 20 69 6e 66 6f 72 6d 20 4a 61 63 6b 20 74 6f 20 70 6c 61 6e 74 20 61 6c 6c 20 34 20 73 65 65 64 73 20 69 6e 20 74 68 65 20 73 61 6d 65 20 6f 72 64 65 72 2e`

Diese Zeichenfolge habe ich in `hex2raw` gepiped und siehe da:
````
echo 59 61 79 21 20 41 70 70 72 65 63 69 61 74 65 20 79 6f 75 72 20 70 61 74 69 65 6e 63 65 20 3a 29 0a 41 6c 6c 20 74 68 69 6e 67 73 20 61 72 65 20 64 69 66 66 69 63 75 6c 74 20 62 65 66 6f 72 65 20 74 68 65 79 20 62 65 63 6f 6d 65 20 65 61 73 79 2e 0a 41 63 6f 72 6e 20 50 75 6d 70 6b 69 6e 20 53 65 65 64 73 20 49 44 3a 20 39 36 34 35 34 0a 0a 44 6f 2c 20 72 65 6d 65 6d 62 65 72 20 74 6f 20 69 6e 66 6f 72 6d 20 4a 61 63 6b 20 74 6f 20 70 6c 61 6e 74 20 61 6c 6c 20 34 20 73 65 65 64 73 20 69 6e 20 74 68 65 20 73 61 6d 65 20 6f 72 64 65 72 2e | hex2raw 
Yay! Appreciate your patience :)
All things are difficult before they become easy.
Acorn Pumpkin Seeds ID: 96454

Do, remember to inform Jack to plant all 4 seeds in the same order.
````

Okay, ich suche also nach 4 seeds (flags), welche in der korrekten Reihenfolge "gepflanzt" werden müssen und habe bereits einen gefunden.
Wenn ich mir die erste Seite nochmal genau anschaue und die Reihenfolge der Auflistung übernehme, ist das Seed Nr. 3
````
Big Max Pumpkin:
Jack-Be-little Pumpkin:
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon:
````

Habe ich die ersten beiden bereits übersehen?

## Back to basics

Was mir dirbuster leider nicht angezeigt hat, war die `robots.txt`, welche sich auf so gut wie jedem Webserver findet.
Also habe ich einfach einen Schuss ins Blaue gewagt und getroffen:

`wget 192.168.178.68/robots.txt` hat mir dann die entsprechende Datei auf meine Festplatte kopiert.

Inhalt der robots.txt:
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

Interessant, hier werden einige Pfade angezeigt, die mir dirbuster nicht ausgespuckt hat. 
Fürs nächste Mal sollte ich mir also eine größere Wordlist nehmen.

Ein paar Einträge haben mich besonders interessiert:
- Im `/images`-Pfad sind nicht nur GIFs, sondern auch JPGs erlaubt. 
- Im `/hidden`-Pfad gibt es eine Datei `note.txt`.
- Im `/seeds`-Pfad gibt es eine Datei `seed.txt.gpg`.

Mit `wget 192.168.178.60/hidden/note.txt` habe ich mir die note.txt besorgt, welche einen recht interessanten Inhalt hat:
````
Robert : C@43r0VqG2=
Mark : Qn@F5zMg4T
goblin : 79675-06172-65206-17765
````

Mr. Goblin ist also wieder mit von der Partie. Wer sind aber Robert und Mark?

Keine der Kombinationen funktioniert über SSH. 

## GNU Privacy Guard

Mit `wget 192.168.178.60/seeds/seed.txt.gpg` lade ich mir die nächste interessante Datei herunter.
Der erste Versuch die Datei zu entschlüsseln wurde jäh von einer Passwortabfrage unterbrochen!
Keins der drei Passwörter aus note.txt funktioniert. Nachdem ich mir einige Zeit den Kopf darüber zerbrochen hatte, ob ich das Passwort vielleicht übersehen hätte, kam ich auf einen Gedanken.
Es ist ein recht verspieltes CTF mit einer Story. Ist also nicht wirklich eine realitätsnahe Maschine.
Auf der ersten Website gab es doch eine Auflistung, was man braucht, um die Samen aufzuziehen.
SEED: WATER: SUNLIGHT
Nach ein paar Versuchen hatte ich dann endlich das korrekte Passwort erraten: SEEDWATERSUNLIGHT
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
Ein schönes Stück ASCII-Art. Aber hilft mir das wirklich weiter? 
Interessant sind hier die letzten 11 Zeilen. Die bestehen nur aus . und -....
Sieht fast wie ein Morsecode aus. 

#### MORSE! Der Lieferant!

Leider kann ich das Morsealphabet nicht auswendig, also habe ich nach einer Möglichkeite gesucht die Zeichen zu entschlüsseln.
[Hier](https://gc.de/gc/morse/) wurde ich dann fündig.

Der entschlüsselte Text sieht wie folgt aus:
````
yippee!
you are on the right path...
bigmaxpumpkin seeds id: 69507
````

Klasse, das ist dann wohl flag 2/4:
````
Big Max Pumpkin: 69507
Jack-Be-little Pumpkin:
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon:
````

Wie geht es von hier aus weiter?
Ach ja, ich hatte ja noch diesen merkwürdigen String von der pumpkin.html

## Base32

Was also heißt jetzt `F5ZWG4TJOB2HGL3TOB4S44DDMFYA====`?
Da es kein base64 war, habe ich etwas gegoogelt und herausgefunden, dass es sich um base32 handeln müsste.

````
echo F5ZWG4TJOB2HGL3TOB4S44DDMFYA==== | base32 -d   
/scripts/spy.pcap
````

Den scripts-Pfad auf dem Webserver hatte mir Dirbuster ja schon gezeigt. Ich bin allerdings von Javascript oder sowas ausgegangen. 

## Wireshark

Aber gut, ich hatte ja vorhin schon den Gedanken, dass ich mal den Traffic ausgehend von der VM beobachten möchte, wenn Jack unverschlüsselt übers Internet kommuniziert.

Wie es aussieht, kann ich mir das jetzt sparen.

Mit `wget 192.168.178.60/scripts/spy.pcap` habe ich mir die Datei heruntergeladen und dann in Wireshark geöffnet.

Die einzelnen Pakete sahen wie 2 verschiedene Kommunikationen aus, also bin ich den unterschiedlichen TCP-Streams gefolgt:

*[Image: Image]*

Klasse, jetzt habe ich schonmal eine weitere ID, aber zu welchem der beiden verbleibenden Kürbissorten gehört sie?

Vielleicht gibt darüber ja der zweite Stream eine Auskunft:

*[Image: Image]*

Tatsächlich. Das ist also Flag 3/4:

````
Big Max Pumpkin: 69507
Jack-Be-little Pumpkin: 50609
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon:
````

Jetzt fehlt noch die letzte...

## Under construction!

Dirbuster hatte ja noch eine `/underconstruction.hmtl` Seite angezeigt, welche ich noch gar nicht angeschaut habe.

*[Image: Image]*

Ein lustiger kleiner Kürbis, der sogar mit einem "spricht", wenn man die Maus darauf zeigen lässt:

`Looking for seeds? I ate them all!`

Der Sourcecode ist prinzipiell unauffällig, bis auf eine kleine Passage, die auf der Seite nicht angezeigt wird:

*[Image: Image]*

Im Klartext heißt das also: Es gibt die Datei `/images/jackolantern.gif`

Hier handelt es sich um das gleiche Bild, wie auf der underconstruction.hmtl, allerdings mit einem anderen Dateinamen.

## I ate them all!

Wenn ein Bild mir sagt, dass es etwas gegessen hat, muss ich sofort an Steganographie denken.

Mit `steghide` wollte ich nachschauen, ob die Vermutung stimmt und wurde um ein Passwort gebeten.

`steghide --extract -sf jackolantern.gif`

Um es einfacher zu gestalten habe ich das Bild dann in `stegosuite` geladen und die Passwörter aus der vorher gefundenen note.txt ausprobiert. Für irgendwas müssen die doch gut sein.

Tatsächlich hat eins der Passwörter funktioniert und mir wurde eine neue Textdatei präsentiert:

*[Image: Image]*

````
Fantastic!!! looking forward for your presence in pumpkin party.
Lil' Pump-Ke-Mon Pumpkin seeds ID : 86568
```` 
Ja super, jetzt habe ich alle 4 flags gefunden:
````
Big Max Pumpkin: 69507
Jack-Be-little Pumpkin: 50609
Acorn Pumpkin:96454
Lil' Pump-Ke-Mon: 86568
````

Da die Reihenfolge der Seed-IDs mit den Bildern auf der ersten Website übereinstimmt, gehe ich mal davon aus, dass dies die richtige Abfolge ist.

Und wenn ich an die note.txt denke, sieht das angegebene "Passwort" von goblin ähnlich aus.

## SSH

*[Image: Image]*

Bingo! Die Reihenfolge hat also gestimmt. 

Dummerweise scheint es sich hier um eine restricted shell zu handeln.
`ls` ist unbekannt und `cd` ist verboten.

## Breaking out

python funktioniert aber... Interessant! Also schnell eine python shell gespawned:

`python -c 'import pty;pty.spawn("/bin/bash/")`

Das funktioniert! Nachdem ich mich ein wenig umgeschaut habe und nichts interessantes entdecken konnte, fragte ich mich, ob Jack wohl irgendwas als sudo ausführen darf:

`sudo -l` zeigt hier die verfügbaren Befehle.

*[Image: Image]*

Hmm, strace sagt mir nicht viel. Also das Tantchen befragt, sie weiß doch immer weiter :)
*[Image: Image]*

Na das liest sich doch sehr gut!

## Privilege escalation

Mal sehen, ob es wirklich so einfach ist:

*[Image: Image]*

Tatsächlich! Na das war ja dann ein Kinderspiel :)

Ein wenig umgeschaut und *ZACK* gefunden, wonach ich gesucht habe!

*[Image: Image]*

Klasse! Die Maschine hat mir noch mehr Spaß gemacht, als die erste! Ich bin richtig im Kürbisfieber und möchte mich am liebsten direkt an den dritten Teil der Reihe machen...

Danke für's Lesen und happy pwning :)

Kontakt -> [Twitter](https://twitter.com/_the_someone)
