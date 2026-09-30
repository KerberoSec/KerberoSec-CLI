# X-Tales: Forgotten Function

> A friend of mine found even more credentials on the HackHigh campus! But she said I should solve the X-Tales: Starter and X-Tales Modulus challenges first.

Wird das Programm aufgerufen, gibt es folgenen Text aus und wartet dann auf eine Eingabe:
```
I forgot who was responsible for giving me access to the interesting file..
Can you perhaps find out who I should call?

My variable is 3
```

Nach einer beliebigen Eingabe kommt es zum `Segmentation fault`. Ein Blick auf den Quellcode mit Ghidra sieht so aus:

Es wird also eine Adresse als Eingabe erwartet, an der sich eine Funktion befindet, die in Zeile 17 aufgerufen wird. Tatsächlich finden sich in dem Programm einige Funktionen, zu denen hier gesprungen werden kann:

Alle i=9 Funktionen entsprechen dem selben Quellcode-Schema:
```
void function_<i>(void)

{
  penetrated = (uint)(variable == <i>);
  puts("Calling function <i>.. ");
  return;
}
```

Da wir wissen, dass die Variable 3 ist, muss die `function_3` aufgerufen werden. Laut Ghidra befindet sie sich an Adresse `0x401235`.

