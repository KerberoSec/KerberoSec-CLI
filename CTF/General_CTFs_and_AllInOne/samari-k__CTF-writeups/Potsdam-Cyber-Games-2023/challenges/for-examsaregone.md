# Exams Are Gone

> Professor Sleepless had a long night. In the morning, he realizes that he fell asleep on the keyboard and accidentally formatted his USB stick with all the exams. All the exams are gone! 📄 Can you help him? His cat and he are disconsolate. 🐱😟

Wir bekommen ein Datenträger-Image, das sich nicht (ohne Weiteres) mounten lässt. Da ein Hinweis in der Challenge-Beschreibugn auf `testdisk` verweist, ist das also der naheliegendste Versuch. Gestartet mit `testdisk usb-image.img`  kann man sich bis zur Analyse durchklicken. Dort findet man nach dem "Quick Search" dann eine Partition die mit "EXAMS" betitelt ist. Das sieht richtig aus.

Nach einem "Deeper Search"  lassen sich die auf der Partition befindlichen Dateien mit mit der Taste "P" auflisten.  

Dann noch "a" um alle Dateien auszuwählen und "C" um sie zu kopieren. Bei `exams.zip.enc` handelt es sich offensichtlich um eine verschlüsselte zip Datei. Die PASSWORD.TXT Datei enthält die erste Flag und ein openssl Kommando: `openssl enc -d -aes-256-ctr -nosalt -pbkdf2 -k 8b88ecf5e759`. Hierbei handelt es sich um ein Kommando zum Entschlüsseln einer Datei (`enc -d`) und den zugehörigen Parametern. Wenn man diesem Kommando noch eine Eingabedatei (`-in exams.zip.enc`) und eine Ausgabedatei (`-out exams.zip`) hinzufügt, erhält man die entschlüsselte zip Datei.

Jetzt haben wir Zugriff auf eine Datei namens `exam.md` die ein paar merkwürdige Pseudo-Klausurfragen enthält. Von denen die letzte die Relevante ist:

```
Please decode the following poem from z85:

q/un&aAg+kB0a[ewftx8A+PDmB0b4twPGyfmRcyIzE<@6A:-D?efFvzv{%EbB0b1cB7YSfB7D)frcJ4#v}YN]xcqq8x(4&wayMyavpK7:AWL]Jxlv{0wH[f/zY&O4v@C)?aARgtBsXLCzEWZjAcbV4ayPd#aARsewg!h@l31e<xK#DiA=kx6aARpqz/]Yaay/t2wGUA0wftubBy/IA3pwlzB0b18v}/)}wPw]mwN/:(BAn#QCwhejazC.mx>Ia3edbx{y&r*0x(mMazdN^fvp%d)aztF1wmYT3w].*baAImfxML^js7#+&aAIsj
[... gekürzt ...]
```

Laut [Wikipedia](https://en.wikipedia.org/wiki/Ascii85) Ist Z85 eine base85 Variante. Hier kann [Cyberchef](https://gchq.github.io/CyberChef) behilflich sein. Als Recipe "From Base85" auswählen, bei Alphabet"Z85" auswählen und das "Z" aus "All-zero group char" entfernen.

Zum Vorschein kommt neben der zweiten Flag ein interessantes Gedicht über Katzen Hacker, Text Encoding und Flags. Es klingt, als wäre es von ChatGPT verfasst.