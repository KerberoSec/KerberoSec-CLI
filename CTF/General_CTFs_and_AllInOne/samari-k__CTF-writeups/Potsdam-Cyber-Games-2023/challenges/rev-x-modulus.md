# X-Tales: Modulus

> A friend of mine found some new credentials, which are apparently the same ones as with the X Tales Starter challenge 
> At a first glance, this looks like an easy challenge in `/challenge` as well, but this time it seems there is one additional hurdle...

In Ghidra geöffnet sieht man, dass das Programm erst überprüft, ob die Environment Variable `SOME_KEY` gesetzt ist. Der Inhalt dieser Variablen ist alelrding irrelevant für die Challenge. Es wird anschließend der beim Start der CHallenge übergebene Key überprüft. Dazu wird die Funktion `atoi()` genutzt: welche aus den ersten Zeichen eines Strings ein Integer macht, solange es sich bei den Zeichen um Zahlen handelt. Dieser Integer-Wert wird mit 485 (`ox1e5`) verglichen und bei Gleichheit die Flag ausgegeben. Der zu übergebene Key ist also `485`.

