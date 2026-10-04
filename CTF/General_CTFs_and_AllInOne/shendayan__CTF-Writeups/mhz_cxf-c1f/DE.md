# mhz_cxf: c1f

Das [CTF](https://www.vulnhub.com/entry/mhz_cxf-c1f,471/) hatte mich angesprochen, weil ich nicht viel Zeit hatte und die Beschreibung vermuten lies, dass man recht schnell fertig sein müsste :)

## Verwendete Techniken
````
- nmap
- dirb
- ssh
- scp
- binwalk
- steghide
- su
````

*[Image: Image]*

### Beschreibung von Vulnhub:

A piece of cake machine

You will learn a little about enumeration/local enumeration , steganography.

This machine tested on Virtualbox , so i'm not sure about it with Vmware

If you need any help you can find me on twitter @mhz_cyber , and i will be happy to read your write-ups guy send it on twitter too

cya with another machine #mhz_cyber
This works better with VirtualBox rather than VMware 

## nmap

Der erste Schritt bei jedem CTF: Herausfinden, welche IP die Maschine besitzt und schauen, ob Ports offen sind:

````
nmap -sn 192.168.178.0/24

[...]
Nmap scan report for mhz-c1f.fritz.box (192.168.178.65)
Host is up (0.0037s latency).
MAC Address: 08:00:27:46:A2:BE (Oracle VirtualBox virtual NIC)
[...]

nmap -A -v 192.168.178.65

[...]
PORT      STATE    SERVICE      VERSION
22/tcp    open     ssh          OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp    open     http         Apache httpd 2.4.29 ((Ubuntu))
135/tcp   filtered msrpc
139/tcp   filtered netbios-ssn
445/tcp   filtered microsoft-ds
1110/tcp  filtered nfsd-status
2869/tcp  filtered icslap
19780/tcp filtered unknown
[...]
````

Eine beliebte Kombination bei "kleinen" CTFs -> Webserver und SSH.

Im Normalfall kann man sich irgendwo auf dem Webserver dann die Login-creds für SSH heraussuchen.

Mal schauen, ob die hier nach demselben Prinzip funktioniert:

## Webserver

Die landing page ist die Standard-Seite nach einer Apache Installation. Auch die Source wurde nicht verändert.

Eine /.robots.txt gibt es nicht: Zeit zu schauen, ob es etwas anderes gibt!

## dirb

Wenn es schnell gehen soll und die Wordlist nicht allzu groß ist, ist dirb das Tool der Wahl:

````
dirb http://192.168.178.65 /usr/share/wordlists/dirb/common.txt -X .txt,.html,.php

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Wed Sep 23 09:14:15 2020
URL_BASE: http://192.168.178.65/
WORDLIST_FILES: /usr/share/wordlists/dirb/common.txt
EXTENSIONS_LIST: (.txt,.html,.php) | (.txt)(.html)(.php) [NUM = 3]

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.178.65/ ----
+ http://192.168.178.65/index.html (CODE:200|SIZE:10918)                                                         
+ http://192.168.178.65/notes.txt (CODE:200|SIZE:86)                                                             
                                                                                                                 
-----------------
END_TIME: Wed Sep 23 09:14:49 2020
DOWNLOADED: 13836 - FOUND: 2
````

Naja gut, nicht viel, sieht aber vielversprechend aus!

`http://192.168.178.65/notes.txt`

*[Image: Image]*

`http://192.168.178.65/remb.txt`

*[Image: Image]*

Na wunderbar, das sieht doch aus wie Login-creds :)

Die Seite `http://192.168.178.65/remb2.txt` gibt es nicht. Vielleicht liegt die Datei ja im home-Verzeichnis...

## SSH

Bingo! 

*[Image: Image]*

Im Verzeichnis liegt eine user.txt -> `cat user.txt`

````
HEEEEEY , you did it
that's amazing , good job man

so just keep it up and get the root bcz i hate low privileges ;)

#mhz_cyber
````

Danke, hilft mir aber nicht viel. Vielleicht ist `mhz_cyber` ein neuer Username. Erstmal notiert.

Ein bisschen herumgeschaut und im Verzeichnis `/home/mhz_c1f/Paintings/` vier Bilder entdeckt.

*[Image: Image]*

## scp 

Da auf dem System kein binwalk installiert ist und ich keine root-Rechte habe, um es zu installieren, habe ich mir die Dateien auf meinen Rechner kopiert.

*[Image: Image]*

## binwalk

Um zu schauen, ob in einer der Dateien etwas versteckt ist (Stichwort Steganografie), habe ich binwalk auf sie angesetzt:

*[Image: Image]*

Die Dateien sehen erstmal normal aus, aber so recht traue ich dem Braten noch nicht.

## steghide

Eine Möglichkeit, um versteckte Dateien aus Bildern zu extrahieren ist `steghide`.

*[Image: Image]*

Na geht doch! Da ist die `remb2.txt` von der vorhin bereits die Rede war.

*[Image: Image]*

Ja, anstatt rein zu schreiben, dass du die Datei hättest löschen wollen, wäre die bessere Alternative gewesen es einfach zu tun ;)

Das sieht für mich aus wie neue login-creds. Leider funktionieren sie über SSH nicht.

## su

Dann bleibt noch die Möglichkeit auszuprobieren, ob ich mich als superuser damit identifizieren kann:

*[Image: Image]*

Klasse, das klappt! Direkt noch geschaut, was für Befehle ich mit root-Rechten ausführen darf: `ALL` - wunderbar.

Mit sudo su habe ich mich zum root gemacht und konnte dann die entsprechende flag auslesen:

*[Image: Image]*

Das war in der Tat, wie beschrieben "a piece of cake". Spaß gemacht hat es deswegen aber nicht weniger!

Danke für's Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
