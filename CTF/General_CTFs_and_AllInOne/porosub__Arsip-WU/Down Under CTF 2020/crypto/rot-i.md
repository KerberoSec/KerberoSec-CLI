Diberikan ciphertext seperti berikut,

    Ypw'zj zwufpp hwu txadjkcq dtbtyu kqkwxrbvu! Mbz cjzg kv IAJBO{ndldie_al_aqk_jjrnsxee}. Xzi utj gnn olkd qgq ftk ykaqe uei mbz ocrt qi ynlu, etrm mff'n wij bf wlny mjcj :).

Setelah mencoba-coba dan melihat nama soal sebagai hint, maka ini hanya cipher rotation yang tiap rotasinya diatur pada variabel looping i. Semisal di karakter pertama maka rot-0, kedua rot-1, ketiga rot-2, dst. hingga panjang ciphertext. Berikut solvernya,

```py
import string
charsetLower = string.ascii_lowercase
charsetUpper = string.ascii_uppercase

excl = "' }{!:),._"

cipher = "Ypw'zj zwufpp hwu txadjkcq dtbtyu kqkwxrbvu! Mbz cjzg kv IAJBO{ndldie_al_aqk_jjrnsxee}. Xzi utj gnn olkd qgq ftk ykaqe uei mbz ocrt qi ynlu, etrm mff'n wij bf wlny mjcj :)."

plain = ""
for i in range(len(cipher)):
    if (cipher[i] not in excl):
        if (cipher[i].isupper()):
            plain += charsetUpper[(charsetUpper.find(cipher[i]) - i) % len(charsetUpper)]
        elif (cipher[i].islower()):
            plain += charsetLower[(charsetLower.find(cipher[i]) - i) % len(charsetLower)]
    else:
        plain += cipher[i]

print(plain)
```

<details>
<summary>Tekan untuk melihat flag</summary>

    DUCTF{crypto_is_fun_kjqlptzy}

</details>
