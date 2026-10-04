# Hello

> Your professor accidentally dropped this file alongside your homework assignment in moodle. But it only prints some text. There must be more to it...

Die Datei, von der in der Challenge-Beschreibung die Rede ist, heißt `exe`. Dass es sich dabei allerdings nicht um eine EXE handelt, zeigt `file exe`: `exe: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, no section header`

Es ist also eine ELF. Ausgeführt schreibt sie `Hello :-)`. Das bringt uns noch nicht weiter, also habe ich nach den `strings` in der Datei geschaut. In denen taucht `--keep-going` auf. Ein Hinweis? In Ghidra ließ sich die Datei jedenfalls nicht sinnvoll anzeigen, irgendwas schien hier nicht zu stimmen.

Bei meiner Recherche bin ich darauf gestoßen, dass `--keep-going` eine Option für `make` ist, was mir hier aber nicht weiter hilft. Ein Hinweis einer Kommilitonin hwar, es doch nochmal mit `file` zu versuchen. Und tatsächlich zeigt auch die Manpage von `file` an: `--keep-going   don't stop at the first match`. 

`file exe --kep-going` hat dann den nächsten Hinweis geliefert: `DOS/MBR boot sector`. Eine erstaunlich oft erfolgreiche Taktik, wenn ich bei einer Challenge etwas finde aber von dort nicht weiter komme, ist das Gefundene in einem CTF Kontext zu suchen. Eine Google Suche nach "DOS/MBR boot sector CTF" liefert als ersten Treffer auch direkt ein passendes Writeup: https://ctftime.org/writeup/31391. Wir brauchen also einen Emulator für die Datei und `qemu` scheint dafür prima zu sein.

`qemu-system-x86_64 exe` startet dann tatsächlich auch eine Maschine deren Output einen QR-Code darstellt.

Mit dem Handy gescannt, enthält der Code die Flag.