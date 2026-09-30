# Kiosk PC

> These PCs spooking around, being used by everyone. Maybe there is something interesting on it?

Hier kriegen wir einen Remote Desktop Zugriff auf einen PC. Ein erster Blick auf die Berechtigungen des Benutzers zeigt, dass der Benutzer `abc` jegliche Kommandos ohne Passworteingabe als root User ausführen kann.

Ein zweiter Blick in die zuletzt ausgeführten Kommandos zeigt einen interessanten `curl` Aufruf dessen Output an `bash` weitergereicht wurde.

Den genau so auszuführen, terminiert die Maschine und startet die Instanz neu. Merkwürdig. Vielleicht sollte man wirklich nicht einfach etwas ausführen, von dem man nicht weiß, was es macht. Also habe ich mir den Output des `curl` Aufrufs angeschaut, ohne ihn an `bash` weiterzureichen.

Ah ja, kein Wunder, dass die Maschine ausgegangen ist. Der Kommentar über die Flag hat mich allerdings länger verwundert, als mir lieb ist. Ich habe im root Verzeichnis keine flag gefunden. Nach einiger Verzweiflung kam der rettende Hinweis von einem Kommilitonen: "Überlege mal, wo du den Hinweis gefunden hast!"

Der Aufruf von `curl http://web/flag` liefert "301 Moved Permanently" zurück. Ganz nah dran also. Mit `-L` kann man `curl` anweisen, redirects zu folgen. `curl -L http://web/flag` liefert dann die flag.