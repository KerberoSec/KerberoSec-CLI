# Krypton Level 2
## Part I
Enter the following command in your Terminal :

```bash
find / -name krypton2 -type f
cat /krypton/krypton1/krypton2
# YRIRY GJB CNFFJBEQ EBGGRA
```
#### Using Pyhton
```python
import codecs

text = "YRIRY GJB CNFFJBEQ EBGGRA"
print(codecs.encode(text, 'rot_13'))
# LEVEL TWO PASSWORD ROTTEN
```
#### Using Bash

```bash
cat /krypton/krypton1/krypton2 | tr "[a-zA-Z]" "[n-za-mN-ZA-M]"
```
## Part II
The ***host*** to which you need to connect is *krypton.labs.overthewire.org*, on ***port*** 2231. The ***username*** is *krypton2* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/edit/main/Krypton/Level2.md#part-i).
```bash
ssh krypton.labs.overthewire.org -p 2231 -l krypton2
# OR ssh krypton2@krypton.labs.overthewire.org -p 2231
# password: ROTTEN
```
