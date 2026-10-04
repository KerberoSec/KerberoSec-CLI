# Personal Website

> HackHigh university students and employees all get a personal website. It can be configured via SSH. Be a nice student and configure your own website. Every user has a very easy to remember password already preconfigured. I hope you are familiar with the linux filesystem.

Alles was wir hier kriegen, ist ein SSH Endpunkt. Allerdings haben wir weder Benutzername noch Passwort. Beim Versuch, sich einfach mal ohne alles mit dem SSH Server zu verbinden, um zu schauen, ob wir nützliche Informationen aus eventuell vorhandenen Fehelrmeldungen oder einem Banner ziehen können, stößt man auf den Benutzernamen.

Ein Brute Force Angriff aus das Passwort mit `hydra -l student01337 -P /usr/share/wordlists/rockyou.txt ssh://10.65.24.67:22 -V` findet nach ungefähr 10 Minuten das dazugehörige Passwort.

Der Benutzer hat einen `website` Ordner, in dem die erste Flag zu finden ist.

Wenn man sich jetzt ein wenig umschaut auf dem Rechner, findet man einen Backups Ordner, in dem eine Datei mit Passwörtern verschiedener Studenten-Accounts liegt. Und man findet raus, dass es auf diesem Rechner einen weiteren Account neben dem eigenen gibt.

Mit `su student00042` und dem zugehörigen Passwort lässt sich nun zum anderen User switchen, der die Flag ebenfalls im website Ordner unter seinem Home Directory hat.

