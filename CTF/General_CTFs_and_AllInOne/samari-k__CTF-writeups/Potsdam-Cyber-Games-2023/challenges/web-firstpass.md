# First Pass

> I once used FirstPass to store all my flags. Unfortunately, I forgot my password, which was a flag too. Can you help me recover my flags?

Diese Challenge gehört zu denen, die mir am meisten Spaß gemacht haben und bei denen ich am meisten gelernt habe. Das ist keine typische Web-Challenge. Zumindest kommt sie ohne Webserver aus. Stattdessen kriegen wir ein Commandline Interface zu einem Passwort-Manager-Tool.

Gleich zu Beginn kriegen wir hier wichtige Informationen: Das Tool basiert auf Python3 und SQLite. Es gibt die Tabellen `user`, `credential` und `share` und offensichtlich gibt es eine alte Tabelle mit weiteren Daten, die noch nicht in die genannten Tabellen eingefügt wurden.

Als erstes bietet sich hier an, den Login mit einer einfachen SQL-Injection zu umgehen, da ich weder einen Benutzernamen noch ein Passwort kenne.

`help` gibt folgende Informationen zu den vorhandenen Optionen:

```
Available commands:

show <id>: Show the password for the credential with identifier id.
share <id>: View and change the users that are allowed to see the credential with identifier id. You can only share credentials you own.
delete <id>: Delete the credential with the identifier id. You can only delete credentials you own.
new: Create a new credential.
help: Show this help text.
quit: Exit the application.
```

Am interessantesten: neben `show` - ist hier erstmal `share`. Denn `share 4` zeigt uns alle vorhandenen Benutzer an:

So können wir uns mit einer ähnlichen Taktik wie zu Beginn unter jedem einzelnen Benutzernamen anmelden und die gespeicherten Passwörter lesen. Bei einem der Benutzerkonten findet man dann auch die erste Flag. Ich verrate hier nicht, bei welchem, weil sich ein Blick auf jeden einzelnen wirklich lohnt, hier steckt viel Liebe zum Detail drin. Ich empfehle auf jeden Fall einen Login als `bruce';--` oder `randall';--`!

Als nächstes woltle ich die Passwörter der Benutzer:innen rausfinden. Die Optionen `show`, `share` und `delete` scheinen offenbar nicht angreifbar zu sein, dort gibt es immer eine Fehlermeldung, sobald die Eingabe keine Dezimalzahl ist. Aber `new` bietet die Möglichkeit, Freitext einzugeben. Also habe mich ein wenig mit `UNION SELECT` vertraut gemacht und mit dieser Option herumgespielt. Ein erfolgreicher neuer Eintrag sah so aus:

```
[show <id>], [share <id>], [delete <id>], [new], [help], or [quit]? new

Create a new credential
Name: neu
Password: ') UNION SELECT * from user;--
```

Diese Injection hat dafür gesorgt, dass in jedem Benutzer-Account nun ein Eintrag mit seinem Benutzer-Passwort steht. Hierunter findet man die zweite Flag.

Die dritte Flag war für mich etwas schwieriger zu finden und der Weg dorthin hat mir viel beigebracht. Ich dachte mir, dass es etwas mit der Tabelle zu tun haben muss, deren Inhalt noch nicht komplett in da neue Schema übertragen wurde. Nur wie finde ich den Tabellen-Namen raus?

Hier kommt [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/SQL%20Injection/SQLite%20Injection.md) hilfreich ins Spiel:

`') UNION SELECT tbl_name FROM sqlite_schema where type='table' AND name NOT LIKE 'sqlite_%';--`

Aber oh nein: `Something went wrong: SELECTs to the left and right of UNION do not have the same number of result columns`

Wieviele Spalten hat denn unsere Tabelle? Drei Vermutlich. Den Eintrag über die Ownerschaft, den Namen des Eintrags und das eingetragene Passwort. Wenn die Injection klappen soll, muss ich also drei Spalten Auswählen. Und wenn ich den neuen Eintrag dann auch sehen will, muss die erste Spalte die Benutzer-ID des Benutzers sein, unter dessen Namen ich aktuell angemeldet bin. Alsod er nächste Versuch:

`') UNION SELECT '0', tbl_name, tbl_name FROM sqlite_schema where type='table' AND name NOT LIKE 'sqlite_%';--`

Und siehe da, ein Erfolg:

Die alte Tabelle heißt also `passwords_legacy_backup_backup`. Von hier dachte ich wird es einfach:

Mist. Also muss ich rausfinden, wie die Spalten-Namen der Tabelle lauten. Dabei hat wieder [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/SQL%20Injection/SQLite%20Injection.md) geholfen. Hier wieder darauf achten, dass die erste Spalte die ID des aktuellen Benutzers beinhaltet, um die Einträge auch lesen zu können:

`') UNION SELECT '0', sql, sql FROM sqlite_master WHERE type!='meta' AND sql NOT NULL AND name ='passwords_legacy_backup_backup';--`

Da haben wir die Spalten-Namen. Und mit: `') UNION SELECT '0', username_or_note, shared_passphrase FROM passwords_legacy_backup_backup;--` kriegen wir dann Zugriff auf alle Einträge der alten Tabelle und können dort die letzte Flag finden.

Das hat richtig Spaß gemacht!

![](https://imgs.xkcd.com/comics/password_strength.png)
[xkcd.com/936/](https://xkcd.com/936/)
