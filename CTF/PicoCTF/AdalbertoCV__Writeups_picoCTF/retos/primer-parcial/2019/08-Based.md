# Based

# Descripción
To get truly 1337, you must understand different data encodings, such as hexadecimal or binary. Can you get the flag from this program to prove you are on the way to becoming 1337? Connect with `nc jupiter.challenges.picoctf.org 29221`.
# Pistas
I hear python can convert things.
It might help to have multiple windows open.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ nc jupiter.challenges.picoctf.org 29221
Let us see how data is stored
computer
Please give the 01100011 01101111 01101101 01110000 01110101 01110100 01100101 01110010 as a word.
...
you have 45 seconds.....

Input:
computer
Please give me the  164 145 163 164 as a word.
Input:
test
Please give me the 736f636b6574 as a word.
Input:
socket
You've beaten the challenge
Flag: picoCTF{learning_about_converting_values_00a975ff}
```

# Bandera
picoCTF{learning_about_converting_values_00a975ff}

# Referencias
Utilicé cyberchef para las conversiones:
https://gchq.github.io/CyberChef/