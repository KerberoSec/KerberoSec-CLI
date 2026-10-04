# 5º Hacking N Roll: Script Rules

Challenge can be found in: https://shellterlabs.com/pt/questions/5-hacking-n-roll/script-rules/

In the statement of the challenge says: "God bless this mess. Resolve this mess, please!" and give us many files with strange names, I analyzed the names, and saw that all had 40 characteres, similar to sha1. After some tests I conclude that really was sha1 and when decrypted, they formed a sequence of numbers from 0 to 663, so I did a python code that decrypted and opened the files in order, and then I got a hex text and decoded it.
KABUM, there it was the flag in middle of text, now just  score:

Here is the script:
```python
import os
import hashlib

enc_flag = ''
listaArquivos = os.listdir()

#Get content the files in order--------------------------------

for i in range(len(listaArquivos)):
    h = hashlib.sha1(bytes(str(i), 'utf-8')).hexdigest()
    for arq in listaArquivos:
        if h == arq:
            enc_flag = enc_flag + open(arq, 'r').read().strip()

#--------------------------------------------------------------

#Decode and show flag------------------------------------------

flag = bytearray.fromhex(enc_flag).decode()
print(flag)

#--------------------------------------------------------------
```

See more Write-ups in: https://www.youtube.com/watch?v=WCw8RETGDLY&list=PLlq-hlhs91wqtRtIgQRxmqvgqTDZn6Qhu

