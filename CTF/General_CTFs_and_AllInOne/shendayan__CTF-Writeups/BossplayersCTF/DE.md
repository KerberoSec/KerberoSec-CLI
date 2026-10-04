# Bossplayers CTF

In diesem Writeup geht es um das CTF [bossplayersCTF: 1 von Vulnhub](https://www.vulnhub.com/entry/bossplayersctf-1,375/)

*[Image: Image]*

### Beschreibung von Vulnhub:

Aimed at Beginner Security Professionals who want to get their feet wet into doing some CTF's. 

It should take around 30 minutes to root.

You may have issues using VMware. 

Das hört sich ja sportlich an: 30 Minuten bis root....

Ich bin gespannt, wie lange ich denn brauche.

## Verwendete Techniken:
````
- nmap
- base64
- dirbuster
- burpsuite
- netcat
````

## nmap

Zuerst muss ich mal wissen, wo die Maschine denn zu finden ist, also lasse ich mir das von nmap sagen:

````
nmap -sn 192.168.178.0/24
[...]
Nmap scan report for bossplayers.fritz.box (192.168.178.64)
Host is up (0.0033s latency).
MAC Address: 08:00:27:EB:5F:D5 (Oracle VirtualBox virtual NIC)
[...]
````

Jetzt wo ich die IP kenne, ist der nächste logische Schritt nach offenen Ports zu schauen.

Auch das erledigt nmap für mich.

````
nmap -A -p- 192.168.178.64
[...]
PORT      STATE    SERVICE      VERSION
22/tcp    open     ssh          OpenSSH 7.9p1 Debian 10 (protocol 2.0)
80/tcp    open     http         Apache httpd 2.4.38 ((Debian))
[...]
````

## Webserver

Bei den meisten CTFs, wo ein Port ein Webserver ist, ist die Auskundschaftung davon mein nächster Schritt.

So ist das auch hier der Fall:

*[Image: Image]*

Die angegebene Website bringt mir außer einem 404er Error gar nichts.

Dafür ist im Quellcode in Zeile 131 noch ein Kommentar versteckt:

*[Image: Image]*

`WkRJNWVXRXliSFZhTW14MVkwaEtkbG96U214ak0wMTFZMGRvZDBOblBUMEsK` sieht für mich stark nach base64-Verschlüsselung aus.

*[Image: Image]*

Da war aber jemand gründlich :)

Die Seite schaue ich mir mal an:

*[Image: Image]*

Wichtig ist schonmal, dass der Arme sich endlich getraut hat Haley "Hi" zu sagen ;-)

Ping Command ist nicht getestet und Privilege Escalation ist nicht gefixt, hört sich gut an!

Da ich aktuell keinen weiteren Anhaltspunkt habe, versuche ich es mal mit etwas neuem:

## dirbuster

So richtig neue Erkenntnisse habe ich dadurch jetzt nicht gewonnen, bis auf diese beiden Seiten:

`/robots.txt` ist vorhanden
`/logs.php` ist vorhanden

Zuerst werfe ich mal einen Blick in die robots.txt:

`super secret password - bG9sIHRyeSBoYXJkZXIgYnJvCg==`

Wohoo, das scheint ja wirklich schnell zu gehen!

*[Image: Image]*

Okay, so leicht ist es dann wohl doch nicht. Soll mir recht sein!

Die Seite `/logs.php` kann man sich nur im Quelltext anschauen, wenn man etwas erkennen möchte.

*[Image: Image]*

Bis auf die Tatsache, dass auf dem Apache Server PHP7.3 installiert ist, hat mir das aber nicht wirklich was gebracht.

Irgendwas muss ich an dieser Stelle übersehen. Es liegen doch im Normalfall keine Logs öffentlich zugänglich herum...

Ich glaube hier muss ein ganz anderer Ansatz her...

## burpsuite

Zurück auf der /workinginprogress.php habe ich burpsuite gestartet und mal geschaut, was ich mit Injections so erreichen kann.

Dummerweise hatte ich keine Ahnung, nach was für einem Command ich suche, also habe ich ausprobiert.

ping, id, haley, usw... Bis ich dann irgendwann bei `cmd` angekommen war. Das hat tatsächlich funktioniert.

Herrlich, dieses Gefühl, wenn man ins blaue rät und auf einmal wirklich einen Treffer landet :)

Also habe ich im Repeater von burpsuite den Parameter mit eingegeben:

*[Image: Image]*

Und nach einem Klick auf "Send" konnte ich mir auf der rechten Seite die Antwort ansehen:

*[Image: Image]*

Nachdem ich ein bisschen mit dieser Art der Command Injection herumprobiert hatte, kam ich auf die Idee darüber eine Verbindung mit netcat zu meinem Rechner herzustellen:

*[Image: Image]*

Zuerst im Terminal den listener mit `nc -lvp 6666` aufsetzen und dann den Befehl für die Verbindung mit einer Shell an den Webserver schicken.

## Wonach suche ich denn? suche ich denn? su ich denn? su i denn? su i d... 

An dieser Stelle habe ich wirklich lange gebraucht, um weiter zu kommen. An die angegebene halbe Stunde bis zum Root war schon länger nicht mehr zu denken...

Dann irgendwann habe ich nach Dateien gesucht, welche das SUID-Bit gesetzt hatten:

*[Image: Image]*

Fakt ist, bei `/usr/bin/find` sollte es im Normalfall definitiv nicht gesetzt sein!

Das heißt also, dass ich `find` mit root-Rechten ausführen kann. Interessant.

Ein wenig rumprobiert und getestet und dann hatte ich es:

*[Image: Image]*

Die Hashes zu cracken hätte mir zu lange gedauert, da konnte ich mir doch lieber auf eine andere Art die flag holen :)

*[Image: Image]*

*[Image: Image]*

Das war jetzt tatsächlich einfacher, als gedacht. Noch schnell decodieren:

*[Image: Image]*

Das wars! 

Es war wirklich eine schnelle CTF, Spaß gemacht hat sie trotzdem! Vor allem an den Punkten mit Command Injection über php und bei der SUID Sache hatte ich zu knacken!

Vielen Dank für's Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
