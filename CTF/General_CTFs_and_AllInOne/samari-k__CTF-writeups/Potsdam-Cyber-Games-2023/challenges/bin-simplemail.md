# Simple Mail Sending

> I discovered this Simple Mail Sending service in our uni. Apparently, it allows me to format my emails, but something feels wrong. Can you check whether there is a way to become admin?

Hierbei handelt es sich um ein Programm, das einem die eingegebenen (Mail-)Daten in einem bestimmten auswählbaren Format zurück gibt (aber nicht tatsächlich absendet).

Interessant scheint: bei einem lokalen Test: die Variante 3: Custom Format. Diese versucht eine Flag aus den Environment Variablen zu laden.

In Ghidra geöffnet, fällt noch eine weitere interessante Stelle in der main-Funktion auf. Hier muss offensichtlich eine Variable im Laufe der `send_mail()` Aufrufe überschrieben werden.

Innerhalbt der `send_mail()` Funktion sieht der Custom Format Teil wie folgt aus. Die interessante Funktion ist hier `show_digest()`.

Die Funktion `show_digest()` (s.u.) lädt die Flag. Der augegebene "digest" besteht dann aus zwei Teilen, getrennt von einem Doppelpunkt (`putchar(0x3a)`). Im ersten Teil (1) stehen die ersten (relevanten) 8 Zeichen des Custom Formats und der zweite Teil (2) ist eine zeichenweise XOR-Verknüpfung des Custom Formats mit der Flag.

Mit diesem Wissen lässt sich ein Script schreiben, das aus jedem beliebigen Digest die Flag rekonstruiert.

`undigest.py`
```python
#! /bin/python3

import sys

if (len(sys.argv) != 2):
	print(f'Usage: {sys.argv[0]} <digest>')

else:
	digest = sys.argv[1]

	custom_format_hex = digest.split(':')[0]
	custom_format = ''
	j = 0
	for i,c in enumerate(custom_format_hex):
		if (i % 2 == 0):
			hex_value = '0x' + custom_format_hex[i:i+2]
			char = chr(int(hex_value,16))
			custom_format += char

	not_yet_flag = digest.split(':')[1]
	flag = ''
	j = 0
	for i,c in enumerate(not_yet_flag):
		if (i % 2 == 0):
			hex_value = '0x' + not_yet_flag[i:i+2]
			c_xor = custom_format[j%8]
			j += 1
			c_flag = chr(int(hex_value,16) ^ ord(c_xor))
			flag += c_flag

	print(flag)
```

Die erste Flag ist ein deutlicher Hinweis darauf, wie man an die zweite Flag kommt. Leider bin ich hieran gescheitert.