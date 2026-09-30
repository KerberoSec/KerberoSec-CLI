# The Server Room's Door

> The ominous door leads to the server room: Direct Hardware Access incoming! 🤩 Unfortunately, it is secured with an electronic lock. However, an anonymous informant couldn't get you the key: but maybe valuable info anyway. While the admin was unlocking the door last time, the informant overheard the radio connection to the door, but can't figure it out. Can you understand what is being sent?

Uns wird eine Datei namens `doof.pulseview.vcd` bereit gestellt, mit deren Inhalt ich auf den ersten Blick überhaupt nichts anfangen kann.

Eine kurze Recherche der Datei-Endung verrät, dass es sich um eine [Value Change Dump](https://de.wikipedia.org/wiki/Value_Change_Dump) handelt. Es ist also eine Datei, die die Änderung von Signalen auf bestimmten Leitungen innerhalb eines Zeitfensters darstellt. Visualisieren lässt sich das mit einem Waveform Viewer. Unter Linux eignet sich dafür [gtkwave](https://github.com/gtkwave/gtkwave).

In `gtkwave` sieht die Datei wie folgt aus:

Wir haben offenbar drei Leitungen: CLK,CS und MISO. CLK nimmt in ganz regelmäßigen Abständen immer genau 8 mal den Wert 1 an. Genau zwischen diesen 8er-Paketen nimmt ebenfalls absolut regelmäßig CS den Wert 1 an. MISO scheint keiner festen Struktur zu folgen.

Da ein Wort bzw. eine flag gesucht ist, könnte CLK das Schema für die einzelnen Buchstaben sein. Ein 8er-Paket könnte dann für ein Byte, also ein Zeichen stehen. Jede einzelne Stelle an der CLK 1 ist, wäre somit ein Bit. CS wäre dann eine Art Separator zwischen den einzelnen Zeichen und MISO würde die Wert der zu lesenden Bits enthalten.  Also könnte man den Code auslesen, wenn man an jeder CLK-Stelle den Wert von MISO liest und an jeder CS-Stelle die vorangegangenen 8 gelesenen Bits zu einem Zeichen zusammenfasst. 

Jetzt musste ich nur noch den Aufbau dieses Dateiformats verstehen, um ein passendes Script dafür zu schreiben. Geholfen hat mir dabei vorallem diese Seite: https://zipcpu.com/blog/2017/07/31/vcd.html, hier wird gut erklärt, was einzelne Zeilen in einer vcd Datei bedeuten. Damit konnte ich ein Script schreiben, das die Flag aus der Datei ausliest:

```python
#! /bin/python3

characters = []
character = []

f = open('door.pulseview.vcd','r')
l = f.readline().strip()

# init values
while ( l != '$end'):
	if (l[-1] == '!'):
		CS = l[0]	# separates characters
	if (l[-1] == '""'):
		CLK = l[0]	# defines when to read MISO
	if (l[-1] == '#'):
		MISO = l[0]	# single bit of a character
	l = f.readline().strip()

while l:
	if (l[-1] == '#'):	# change bit value
		MISO = l[0]
	if ((l[-1] == '"') and (l[0]=='1')):	# read MISO bit to character
		character.append(MISO)
	if ((l[-1] == '!') and (l[0]=='1')):	# read character
		if character:
			c = chr(int(''.join(character),2))
			characters.append(c)
			character = []
	l = f.readline().strip()

f.close()

flag = ''.join(characters)
print(flag)
```