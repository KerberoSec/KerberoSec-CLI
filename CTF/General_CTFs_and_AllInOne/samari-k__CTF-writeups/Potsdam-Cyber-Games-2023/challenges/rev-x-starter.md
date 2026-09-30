# X-Tales: Starter

> A friend of mine found some weird credentials to an SSH-Server:
> At a first glance, this looks like an easy challenge in `/challenge`, but maybe this is only the start of a series?

Das Programm erwartet einen 20 Zeichen langen Passcode. Von diesem wird ein Hash gebildet. Wenn der Hash-Wert 511 ist, kommen wir an die Flag.

Interessant ist die Funktion `hash_pw()` in der der Hash gebildet wird. Es werden ausschließlich die letzten vier Zeichen  für die Berechnung genutzt. Genau genommen handelt es sich um die Summe der Dezimal-Werte der letzten vier Zeichen jeweils mal ihrer Entfernung zum letzten Zeichen. Daraus lässt sich nun eine Zeichenkette aus vier Zeichen bilden, deren Hash 511 ergibt. Zum Beispiel `000O`.Diese vier Zeichen kann man dann an beliebige 16 andere Zeichen anhängen und kommt an die Flag.

