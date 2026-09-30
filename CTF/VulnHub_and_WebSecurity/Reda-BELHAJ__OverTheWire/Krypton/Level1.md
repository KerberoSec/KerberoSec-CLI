# Krypton Level 1

1. We have to decode the password using base64:
```python
import base64 
text        = "S1JZUFRPTklTR1JFQVQ="
text_deco   = text.encode("ascii") 
text_deco   = base64.b64decode(text_deco)

print(text_deco.decode("ascii") )
```
2. The ***host*** to which you need to connect is *krypton.labs.overthewire.org*, on ***port*** 2231. The ***username*** is *krypton1* and the ***password*** is *KRYPTONISGREAT*.
```bash
ssh krypton.labs.overthewire.org -p 2231 -l krypton1
# OR ssh krypton1@krypton.labs.overthewire.org -p 2231
# password: KRYPTONISGREAT
```
