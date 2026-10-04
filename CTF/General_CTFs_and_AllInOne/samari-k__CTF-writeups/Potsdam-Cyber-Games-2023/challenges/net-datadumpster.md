# Data Dumpster

> A friend of you found a server the admins at the HackHigh university are using for exchanging some seemingly uncritical data. They say network traffic is encrypted anyways, so there is nothing sensitive in there. But maybe they forgot something?

In dieser Challenge gibt es ein Packet Capture zu analysieren. In Wireshark geöffnet, sieht es ungefähr so aus:

Es findet viel Kommunikation zu einem Port 9100 statt. Nach [speedguide.net/port.php?port=9100](https://www.speedguide.net/port.php?port=9100) handelt es sich vermutlich um die Kommunikation mit einem Drucker.

Rechtsklick auf eines der Pakete -> Follow -> TCP Stream liefert den Inhalt der Kommunikation. Auch das sieht stark nach einem Druckauftrag aus, auch wenn ich bisher noch keinen Druckauftrag in Wireshark gesehen habe.

Beim Extrahieren des Druckauftrages hat mir sehr diese Anleitung geholfen, auf die ich bei meiner Recherche gestoßen bin: http://rfg-esource.ricoh-usa.com/oracle/groups/public/documents/communication/rfg042515.pdf

Dafür muss in dem geöffneten TCP STream einmal die Richtung eingestellt werden, so dass nur die Daten angezeigt werden, die zum Drucker gesendet wurden. Außerdem muss die Anzeige von `ASCII` auf `Raw` umgestellt werden. Dann kann der Auftrag als Datei gespeichert werden.

Jetzt haben wir ein PostSript Dokument.

Das lässt sich mit `ps2pdf <filename>` zu einer PDF Datei umwandeln, die sich mit jedem PDF Reader öffnen lässt. Die PDF ethält den letzten Hinweis zur Flag.

