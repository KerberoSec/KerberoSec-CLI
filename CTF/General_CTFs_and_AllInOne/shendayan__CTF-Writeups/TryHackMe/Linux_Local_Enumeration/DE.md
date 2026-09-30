# Linux: Local Enumeration

*[Image: Image]*

In diesem Writeup geht es um den Raum Linux: Local Enumeration auf [TryHackMe](https://tryhackme.com/room/lle) von [Swafox](https://tryhackme.com/p/Swafox).
Ziel des Raums ist es, Techniken und Ansätze zu vermitteln, was man nach einer erfolgreichen Reverse-Shell tun kann.

Den Inhalt des Raumes beschreibt Swafox wie folgt:
- Unit 1: Stabilizing the shell

	Exploring a way to transform a reverse shell into a stable bash or ssh shell.
- Unit 2: Basic enumaration

	Enumerate OS and the most common files to identify possible security flaws.
- Unit 3: /etc

	Understand the purpose and sensitivity of files under /etc directory.
- Unit 4: Important files

	Learn to find files, containing potentially valuable information.
- Unit 6: Enumeration scripts

	Automate the process by running multiple community-created enumeration scripts.

## Verwendete Techniken
````
- perl
- ssh
- uname
- find
- grep
````

## Task 2: Unit 1: tty

Eine netcat-Shell ist immer ziemlich instabil und kann durch kleine (Tipp-)Fehler schnell versehentlich beendet werden.
Dass nicht alle Befehle in einer nc-shell funktionieren (z.B. su oder sudo), ist ein weiterer Grund die Shell zu "upgraden".

Da ein einfaches ````/bin/bash```` leider in den meisten Fällen nicht funktioniert, ist es sinnvoll die gängigen Programmiersprachen durchzuprobieren.

Ich verwende den angegebenen Python-oneliner selbst sehr oft in CTF's: 

````python3 -c 'import pty; pty.spawn("/bin/bash")'````

Das ist eine sehr einfache Möglichkeit, die Shell zu einer "interaktiven Shell" upzugraden.

Question 1: How would you execute /bin/bash with perl? 

Answer: ````perl -e 'exec "/bin/bash";'````

## Task 3: Unit 1: ssh

Die beste Shell bekommt man natürlich über SSH. Hier braucht man aber entweder eine Username:Password-Kombination, einen Eintrag in der "authorized keys"-Datei, oder den privaten SSH-Key eines Users.
Den privaten Schlüssel findet man in Linux-Systemen meistens im Verzeichnis ````/home/$USER/.ssh/````.
Sobald man sich diese Datei auf seinen Rechner kopiert hat, kann man mit folgendem Befehl auch ohne ein Passwort eine SSH-Verbindung aufbauen:
````ssh user@ip -i keyfile````

Question 1: Where can you usually find the id_rsa file? (User = user) 

Answer: /home/user/.ssh/id_rsa

Question 2: Is there an id_rsa file on the box? (yay/nay)

Answer: nay

## Task 4: Unit 2: Basic enumeration

Bei jeder Maschine, in die man (auf welche Art auch immer) hereingekommen ist, ist es sinnvoll sich erst einmal etwas umzuschauen, um festzustellen womit man es eigentlich zu tun hat.

Der erste Befehl hierzu wäre ````uname -a````. 
Die Ausgabe sieht auf meinem System so aus:

````Linux PT 5.4.0-54-generic #60-Ubuntu SMP Fri Nov 6 10:37:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux````

Sie setzt sich wie folgt zusammen:
- Name des Betriebssystems (Linux)
- Hostname (PT)
- Kernel Release (5.4.0-54-generic)
- Kernel Version (#60-Ubuntu SMP mit Datum der Installation)
- Architektur der Maschine (x86_64)
- Architektur des Prozessors (x86_64)
- Architektur der Hardware-Plattform (x86_64)
- OS (GNU/Linux)

Danach sollte man sich anschauen, wie es mit den Bash-Dateien aussieht. Auch hier kann man nützliche Informationen herausziehen.

````.bash_profile````, ````.bashrc```` und ````.bash_history```` sind hier die Objekte der Wahl.

Question 1: How would you print machine hardware name only?

Answer: uname -m

Question 2: Where can you find bash history?

Answer: ~/.bash_history

Question 3: What's the flag?

Answer: thm{clear_the_history}

## Task 5: Unit 3: /etc

Im Verzeichnis /etc liegen quasi die Kronjuwelen einer Linux-Maschine. Primär geht es hier um die beiden Dateien ````/etc/passwd```` und ````/etc/shadow````.

Bei einer normalen Installation von Linux, ist die passwd-Datei für alle Nutzer des Systems lesbar. Auf shadow trifft das allerdings nicht zu, da sich in dieser Datei die gehashten Passwörter aller Nutzer befinden.

Question 1: Can you read /etc/passwd on the box? (yay/nay)

Answer: yay

## Task 6: Unit 4: Find command and interesting files

Interessante Dateien muss man auf einem System oft suchen. Unter Linux wird nicht gesucht, sondern gefunden: mit dem find-Befehl.

Die Fragen dieses Tasks werden mit folgenden Befehlen beantwortet:
````find / -type f -name "*.bak" 2>/dev/null```` und ````find / -type f -name "*.conf" 2>/dev/null````.

Question 1: What's the password you found? 

Answer: THMSkidyPass

Question 2: Did you find a flag?

Answer: thm{conf_file}

## Task 7: Unit 4: SUID

Dateien, welche ein gesetztes SUID-Bit haben, lassen sich mit den Rechten des Dateibesitzers ausführen. Für ein CTF sind dementsprechend natürlich die Dateien interessant, die root gehören und das SUID-Bit gesetzt haben um mit root-Rechten eine Datei auszuführen.

Auch diese Dateien lassen sich mit dem find-Befehl anzeigen: ````find / -perm -u=s -type f 2>/dev/null```` 
-u=s kann auch ersetzt werden durch "/4000", es hat die selben Auswirkungen auf die Suche.

Question 1: Which SUID binary has a way to escalate your privileges on the box? 

Answer: grep

Question 2:  What's the payload you can use to read /etc/shadow with this SUID?

Answer: grep '' /etc/shadow

## Weiterführende Links

- [Static Binaries](https://github.com/andrew-d/static-binaries) 
- [Upgrading simple shells to fully interactive tty](https://blog.ropnop.com/upgrading-simple-shells-to-fully-interactive-ttys)
- [Most common Linux file extensions](https://lauraliparulo.altervista.org/most-common-linux-file-extensions/)
- [GTFO Bins mit SUID Filter](https://gtfobins.github.io/#+SUID)
- [LinPEAS](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS)
- [LinEnum](https://github.com/rebootuser/LinEnum)

Ich hoffe mit diesem Walkthrough war es kein Problem mehr, diesen Raum zu bewältigen.

Danke für's Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
