# Krypton Level 4
## Part I
Enter the following command in your Terminal :

```bash
find / -name krypton4 -type f
cd /krypton/krypton3/
cat /krypton/krypton3/krypton4
# KSVVW BGSJD SVSIS VXBMN YQUUK BNWCU ANMJS
mkdir /tmp/reda2
cp -r krypton3 /tmp/reda2
cd /tmp/reda2/krypton3
```

#### Using Bash
```bash
vim script.sh
#!/bin/bash
# This script help to count the frequency of each letter in a found file
str="A B C D E F G H I J K L M N O P Q R S T U V W X Y Z"
read name_found

for (( i=0; i<${#str}; i++ )) ; do
    tr -cd "${str:$i:1}" < $name_found | wc -c
done
# [ESC] + :wq
```
```bash
./script.sh > res1.txt
# Enter found1
tr '\n' ' ' < res1.txt  | sed 's/\ $//g' > res11.txt
...
```
#### Using Python
```python 
# vim frequency.py
from collections import Counter
import sys

text_found = ""

for name_found in sys.argv[1:]:
    found       = open(name_found)
    text_found  += found.read()

count_text  = Counter(text_found)
print(count_text)
```
```bash
python frequency.py found1 found2 found3
# Counter({' ': 704, 'S': 456, 'Q': 340, 'J': 301, 'U': 257, 'B': 246, 'N': 240, 'C': 227, 'G': 227, 'D': 210, 'Z': 132, 'V': 130, 'W': 129, 'M': 86, 'Y': 84, 'T': 75, 'X': 71, 'K': 67, 'E': 64, 'L': 60, 'A': 55, 'F': 28, 'I': 19, 'O': 12, 'H': 4, 'R': 4, 'P': 2})
```

![FrequencyLetters](https://www.101computing.net/wp/wp-content/uploads/frequency-analysis-english-language.png)

```
Ciphertext    : A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Plaintext     : B O I H G K N Q V T W Y U R X Z A J E M S L D F P C
```
```bash
cat krypton4 | tr "A-Z" "BOIHGKNQVTWYURXZAJEMSLDFPC"
#WELLD ONETH ELEVE LFOUR PASSW ORDIS BRUTE
```
Try to use the online tool [quipqiup](https://www.quipqiup.com/) to figure out the text in each found$i file. (or the key file like in the capture.)
![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Krypton/Captures/Capture.PNG)

## Part II
The ***host*** to which you need to connect is *krypton.labs.overthewire.org*, on ***port*** 2231. The ***username*** is *krypton4* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/edit/main/Krypton/Level4.md#part-i).
```bash
ssh krypton.labs.overthewire.org -p 2231 -l krypton4
# OR ssh krypton4@krypton.labs.overthewire.org -p 2231
# password: BRUTE
```
