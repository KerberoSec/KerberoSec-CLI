# X-Tales: Discussion

> Good arguments are the basis of all good discussions. At least that is written on a sheet of paper I found in the library today. Ah and there were a few credentials noted:

Ausgeführt gibt die Challenge eine Zahl abhängig von der Anzahl der übergenen Argumente und eine Zeile Text zurück.

Ein Blick auf die Datei in Ghidra zeigt, was erwartet wird:

`argc` ist die Anzahl der beim Start übergebenen Argumente. Da standardmäßig implizit der Dateiname als erstes Argument übergeben wird, ist argc immer mindestens 1. `argv` enthält alle übergenen Argumente als Strings. `argv[0]` entspricht dem Dateinamen.

Was brauchen wir, um an die Flag zu kommen?
1. `argc == 1`: es dürfen keine zusätzlichen Argumente übergeben werden.
2. `strlen(*argv) == 1`: der String an erster Stelle in argv (also der Dateiname) darf nur ein Zeichen haben
3. `**argv == '.'`: der Dateiname muss '.' lauten.

Zuerst dachte ich noch daran, einfach den Dateinamen zu ändern. Aber eine Datei in `'.'`  umzubenennen ist schlicht nicht möglich. Es muss also (zu meiner Überraschung) möglich sein, argv zu fälschen. Auf einem Recherche-Streifzug bin ich auf diesen passend Eintrag auf stackexchange gestoßen: https://unix.stackexchange.com/questions/562446/changing-argv0-from-the-command-line

Mit `exec -a` lässt sich also der übergebene Dateiname fälschen? Lässt sich das verifizieren? Auf meinem Kali lokal auf die Schnelle nicht, aber die remote Maschine hat da was:

Das ist tatsächlich genau was ich suche.

Und schön auch, dass uns direkt eine Erklärung mitgeliefert wird, wir sind ja schließlich hier umw as zu lernen:

```
The Unix call convention mandates passing the program name as first argument via argv into the program.

But as this is only a convention, it is not required to do so. As this is not known to all developers, this might lead to severe security issues like this one: https://blog.qualys.com/vulnerabilities-threat-research/2022/01/25/pwnkit-local-privilege-escalation-vulnerability-discovered-in-polkits-pkexec-cve-2021-4034
```

