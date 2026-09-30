# Painting Explorer

> Here you will find the Painting Explorer for our University, but the free version limits the number of shown paintings. To prevent DoS attacks, the site is rate limited.

Die Seite zeigt ein paar Bilder als Slideshow an und bietet eine Suche. Die Suche scheint allerdings nichts zurückzugeben, egal welchen Suchbegriff ich eingebe.

Alsio habe ich mir die Requests in der BurpSuite angeschaut.  

Anscheinend gehen die Suchanfragen an den Api-Endpunkt `/api/v1/paintings/?search=`.
Wenn der Suchbegriff genau so in eine SQL-Abfrage übernommen wird, könnte man es mit einer SQL-Injection versuchen, um sich alle Bilder-Daten anzeigen zu lassen. `'or 1;--` wäre zum Beuspiel ein guter erster Test-Kandidat. Und voilá:

Die Flag befindet sich in einer der Bild-Informationen.