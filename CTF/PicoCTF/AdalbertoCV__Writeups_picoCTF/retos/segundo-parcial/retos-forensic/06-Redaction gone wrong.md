# Redaction gone wrong

# Descripción
Now you DON’T see me.This [report](https://artifacts.picoctf.net/c/84/Financial_Report_for_ABC_Labs.pdf) has some critical data in it, some of which have been redacted correctly, while some were not. Can you find an important key that was not redacted properly?
# Pistas
How can you be sure of the redaction?
# Solución

```bash
En este reto, el texto se encuentra oculto por un subrayado en negro, en mi caso, solo bastó con abrir el pdf, y copiar el texto dentro de el para pegarlo en un editor de texto cualquiera, entonces, se muestra el texto oculto:

Financial Report for ABC Labs, Kigali, Rwanda for the year 2021.
Breakdown - Just painted over in MS word.

Cost Benefit Analysis
Credit Debit
This is not the flag, keep looking
Expenses from the
picoCTF{C4n_Y0u_S33_m3_fully}
Redacted document.
```

# Bandera
picoCTF{C4n_Y0u_S33_m3_fully}