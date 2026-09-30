## XOR Starter

XOR is a bitwise operator which returns 0 if the bits are the same, and 1 otherwise. In textbooks the XOR operator is denoted by ⊕, but in most challenges and programming languages you will see the caret `^` used instead.

![[Pasted image 20251225231008.png]]

For longer binary numbers we XOR bit by bit: `0110 ^ 1010 = 1100`. We can XOR integers by first converting the integer from decimal to binary. We can XOR strings by first converting each character to the integer representing the Unicode character.  
  
Given the string `label`, XOR each character with the integer `13`. Convert these integers back to a string and submit the flag as `crypto{new_string}`.  
  
 The Python `pwntools` library has a convenient `xor()` function that can XOR together data of different types and lengths. But first, you may want to implement your own function to solve this.

Am folosit scriptu:
```
string = "label"
integer_to_xor = 13
new_string = ""

for char in string:
    # ord() gets the integer, ^ does the XOR, chr() turns it back to text
    new_char = chr(ord(char) ^ integer_to_xor)
    new_string += new_char

print(f"crypto{{{new_string}}}")
```
![[Pasted image 20251225232700.png]]

crypto{aloha}
!!!În criptografie, XOR este folosit deoarece este o operație **reversibilă**. Dacă aplici XOR din nou cu același număr (13), vei obține textul original înapoi.

---
## XOR Properties

In the last challenge, you saw how XOR worked at the level of bits. In this one, we're going to cover the properties of the XOR operation and then use them to undo a chain of operations that have encrypted a flag. Gaining an intuition for how this works will help greatly when you come to attacking real cryptosystems later, especially in the block ciphers category.  
  
There are four main properties we should consider when we solve challenges using the XOR operator  
  
$Commutative: A ⊕ B = B ⊕ A$  
$Associative: A ⊕ (B ⊕ C) = (A ⊕ B) ⊕ C$  
$Identity: A ⊕ 0 = A$  
$Self-Inverse: A ⊕ A = 0$  
  
Let's break this down. Commutative means that the order of the XOR operations is not important. Associative means that a chain of operations can be carried out without order (we do not need to worry about brackets). The identity is 0, so XOR with 0 "does nothing", and lastly something XOR'd with itself returns zero.  
  
Let's put this into practice! Below is a series of outputs where three random keys have been XOR'd together and with the flag. Use the above properties to undo the encryption in the final line to obtain the flag.  
  
```
KEY1 = a6c8b6733c9b22de7bc0253266a3867df55acde8635e19c73313  
KEY2 ^ KEY1 = 37dcb292030faa90d07eec17e3b1c6d8daf94c35d4c9191a5e1e  
KEY2 ^ KEY3 = c1545756687e7573db23aa1c3452a098b71a7fbf0fddddde5fc1  
FLAG ^ KEY1 ^ KEY3 ^ KEY2 = 04ee9855208a2cd59091d04767ae47963170d1660df7f56f5faf
```

Aceasta este o problemă clasică de logică bazată pe proprietățile operatorului XOR. Secretul pentru a rezolva astfel de "lanțuri" este să găsești o modalitate de a combina cheile astfel încât acestea să se anuleze reciproc (Self-Inverse: $A \oplus A = 0$).

Iată cum desfacem pas cu pas această criptare folosind proprietățile menționate:

### 1. Analiza datelor

Avem următoarele patru valori (le vom numi $V_1, V_2, V_3, V_4$):

- $V_1 = \text{KEY1}$
    
- $V_2 = \text{KEY2} \oplus \text{KEY1}$
    
- $V_3 = \text{KEY2} \oplus \text{KEY3}$
    
- $V_4 = \text{FLAG} \oplus \text{KEY1} \oplus \text{KEY3} \oplus \text{KEY2}$
    

### 2. Strategia de simplificare

Datorită proprietăților de **comutativitate** și **asociativitate**, putem reordona și grupa termenii oricum dorim. Scopul nostru este să obținem o expresie care să conțină doar FLAG-ul.

Dacă facem XOR între toate cele trei chei combinate ($V_1 \oplus V_2 \oplus V_3$), observăm ceva interesant:

$(\text{KEY1}) \oplus (\text{KEY2} \oplus \text{KEY1}) \oplus (\text{KEY2} \oplus \text{KEY3})$

Folosind **Self-Inverse** ($A \oplus A = 0$):

- $\text{KEY1} \oplus \text{KEY1} = 0$
    
- $\text{KEY2} \oplus \text{KEY2} = 0$
    

Rezultatul este simplu: **$\text{KEY3}$**.

### 3. Obținerea FLAG-ului

Acum că știm cum să izolăm componentele, cea mai rapidă cale este să facem XOR între toate liniile date:

$$\text{FLAG} = V_4 \oplus V_2 \oplus V_3$$crypto{x0r_i5_ass0c1at1v3}

sau solve
```
from pwn import xor
k1=bytes.fromhex('a6c8b6733c9b22de7bc0253266a3867df55acde8635e19c73313')
k2_3=bytes.fromhex('c1545756687e7573db23aa1c3452a098b71a7fbf0fddddde5fc1')
flag=bytes.fromhex('04ee9855208a2cd59091d04767ae47963170d1660df7f56f5faf')
print(xor(k1,k2_3,flag))
```

---
## Favourite byte

For the next few challenges, you'll use what you've just learned to solve some more XOR puzzles.  
  
I've hidden some data using XOR with a single byte, but that byte is a secret. Don't forget to decode from hex first.  
  
```
73626960647f6b206821204f21254f7d694f7624662065622127234f726927756d
```

Această provocare, cunoscută sub numele de **Single-Byte XOR cipher**, presupune că fiecare caracter al mesajului original a fost combinat (XOR) cu aceeași valoare secretă (o cheie formată dintr-un singur octet/byte).

Deoarece un octet are doar **256 de posibilități** (de la 0 la 255), cea mai ușoară metodă de rezolvare este **Brute Force**: încercăm toate cele 256 de chei posibile până când găsim un mesaj care are sens în limba engleză.

### Strategia de Rezolvare

1. **Decodificarea Hex:** Șirul furnizat este în format hexazecimal. Primul pas este să îl transformăm în octeți (bytes).
    
2. **Brute Force:** Rulăm o buclă de la 0 la 255.
    
3. **XOR și Verificare:** Pentru fiecare cheie, aplicăm XOR pe date și verificăm dacă rezultatul începe cu formatul cunoscut al flag-ului: `crypto{`

Cod:
```
hex_input = "73626960647f6b206821204f21254f7d694f7624662065622127234f726927756d"

# Convertim din hex în bytes
ciphertext = bytes.fromhex(hex_input)

# Încercăm toate cele 256 de chei posibile
for key in range(256):
    # Aplicăm XOR între fiecare byte din text și cheia curentă
    decrypted = "".join(chr(b ^ key) for b in ciphertext)
    
    # Căutăm formatul specific flag-ului
    if "crypto{" in decrypted:
        print(f"Cheia găsită: {key}")
        print(f"Flag: {decrypted}")
        break
```

Cheia găsită: 16 
Flag: crypto{0x10_15_my_f4v0ur173_by7e}

## You either know, XOR you don't

I've encrypted the flag with my secret key, you'll never be able to guess it.  
  
Remember the flag format and how it might help you in this challenge!  
  
```
0e0b213f26041e480b26217f27342e175d0e070a3c5b103e2526217f27342e175d0e077e263451150104
```

Această provocare este un pas înainte față de cea anterioară. Aici nu mai avem un singur număr (byte), ci o **cheie secretă mai lungă** care se repetă (Repeating-key XOR).

Secretul rezolvării stă în indiciul oferit: **"Remember the flag format"**. Știm că toate flag-urile încep cu textul `crypto{`. Putem folosi acest lucru pentru a "fura" cheia de la începutul mesajului.

---

### Pasul 1: Recuperarea cheii (Known Plaintext Attack)

Dacă știm că $Mesaj \oplus Cheie = Criptat$, atunci conform proprietăților XOR, și $Criptat \oplus Mesaj = Cheie$.
- $P$ = Plaintext (mesajul original)
    
- $K$ = Key (cheia secretă)
    
- $C$ = Ciphertext (rezultatul criptat)
    

Știm că: $P \oplus K = C$

Vom face XOR între primele caractere ale codului hex și textul `crypto{`:

1. **Transformăm primele 7 perechi hex în numere:** `0e, 0b, 21, 3f, 26, 04, 1e`.
    
2. **Facem XOR cu "crypto{":**
    
    - `0x0e ^ 'c' = 'm'`
        
    - `0x0b ^ 'r' = 'y'`
        
    - `0x21 ^ 'y' = 'X'`
        
    - `0x3f ^ 'p' = 'O'`
        
    - `0x26 ^ 't' = 'R'`
        
    - `0x04 ^ 'o' = 'k'`
        
    - `0x1e ^ '{' = 'e'`
        

Observăm că începutul cheii este **"myXORke"**. Este aproape sigur că întreaga cheie este cuvântul **"myXORkey"**.

---

### Pasul 2: Aplicarea cheii pe tot mesajul

Acum că am bănuit cheia (**myXORkey**), trebuie să o repetăm pe toată lungimea textului criptat și să facem XOR.

```
from binascii import unhexlify

# Datele de intrare
hex_data = "0e0b213f26041e480b26217f27342e175d0e070a3c5b103e2526217f27342e175d0e077e263451150104"
ciphertext = unhexlify(hex_data)

# Cheia pe care am dedus-o
key = b"myXORkey"

# Funcție pentru Repeating-key XOR
def decrypt(data, key):
    output = b""
    for i in range(len(data)):
        # i % len(key) face ca cheia sa se repete (0,1,2,3,4,5,6,7,0,1...)
        output += bytes([data[i] ^ key[i % len(key)]])
    return output

flag = decrypt(ciphertext, key)
print(flag.decode())
```

crypto{1f_y0u_Kn0w_En0uGH_y0u_Kn0w_1t_4ll}

## Lemur XOR

I've hidden two cool images by XOR with the same secret key so you can't see them!  
  
This challenge requires performing a visual XOR between the RGB bytes of the two images: not an XOR of all the data bytes of the files.

flag pic
![[flag_7ae18c704272532658c10b5faad06d74.png]]
lemur pic
![[lemur_ed66878c338e662d3473f0d98eedbd0d.png]]

This challenge is a classic application of a vulnerability known as a **"Two-Time Pad."** Because both images were encrypted using the exact same secret key via the XOR operation, the key can be eliminated by XORing the two encrypted files together.

### The Logic

In cryptography, the XOR operation ($\oplus$) has a few special properties:

1. **Self-Inverse:** $A \oplus A = 0$
    
2. **Identity:** $A \oplus 0 = A$
    
3. **Commutative/Associative:** The order doesn't matter.
    

If we represent the hidden images as $P_1$ (Lemur) and $P_2$ (Flag), and the secret key as $K$, the files you have are:

- $C_1 = P_1 \oplus K$
    
- $C_2 = P_2 \oplus K$
    

If you XOR the two encrypted images ($C_1$ and $C_2$) together, the key cancels itself out:

$$(P_1 \oplus K) \oplus (P_2 \oplus K) = P_1 \oplus P_2 \oplus (K \oplus K) = P_1 \oplus P_2 \oplus 0 = P_1 \oplus P_2$$

The result is the XOR of the two original images. Since one is likely a simple background and the other contains a flag, the flag will become clearly visible.
Am folosit scriptul: 

```
from PIL import Image
import numpy as np

# 1. Load the two encrypted images
img1 = Image.open('lemur.png').convert('RGB')
img2 = Image.open('flag.png').convert('RGB')

# 2. Convert images to numpy arrays (numerical pixel data)
data1 = np.array(img1)
data2 = np.array(img2)

# 3. Perform the bitwise XOR operation
# This cancels out the 'secret key' shared by both images
result_data = np.bitwise_xor(data1, data2)

# 4. Convert the resulting array back into an image
result_img = Image.fromarray(result_data)

# 5. Save and show the result
result_img.save('decrypted_flag.png')
result_img.show()
```

obtinem imaginea
!*[Image: alt text]*
