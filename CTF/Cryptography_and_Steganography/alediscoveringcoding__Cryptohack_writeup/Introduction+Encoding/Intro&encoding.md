## Great snakes
Modern cryptography involves code, and code involves coding. CryptoHack provides a good opportunity to sharpen your skills.  
  
Of all modern programming languages, Python 3 stands out as ideal for quickly writing cryptographic scripts and attacks. For more information about why we think Python is so great for this, please see the [FAQ](https://cryptohack.org/faq#python3).  
  
Run the attached Python script and it will output your flag.
![[great_snakes_35381fca29d68d8f3f25c9fa0a9026fb.py]]
am rulat cu python3 si am obtinut:
crypto{z3n_0f_pyth0n}

---
## ASCII
ASCII is a 7-bit encoding standard which allows the representation of text using the integers 0-127.  
  
Using the below integer array, convert the numbers to their corresponding ASCII characters to obtain a flag.  
  
`[99, 114, 121, 112, 116, 111, 123, 65, 83, 67, 73, 73, 95, 112, 114, 49, 110, 116, 52, 98, 108, 51, 125]`

Folosim scriptul:
```
numbers = [99, 114, 121, 112, 116, 111, 123, 65, 83, 67, 73, 73, 95, 112, 114, 49, 110, 116, 52, 98, 108, 51, 125]
print("".join(chr(n) for n in numbers))
```
crypto{ASCII_pr1nt4bl3}

---
## HEX

When we encrypt something the resulting ciphertext commonly has bytes which are not printable ASCII characters. If we want to share our encrypted data, it's common to encode it into something more user-friendly and portable across different systems.  
  
Hexadecimal can be used in such a way to represent ASCII strings. First each letter is converted to an ordinal number according to the ASCII table (as in the previous challenge). Then the decimal numbers are converted to base-16 numbers, otherwise known as hexadecimal. The numbers can be combined together, into one long hex string.  
  
Included below is a flag encoded as a hex string. Decode this back into bytes to get the flag.

`63727970746f7b596f755f77696c6c5f62655f776f726b696e675f776974685f6865785f737472696e67735f615f6c6f747d`

```
hex_string = "63727970746f7b6d616e795f6865785f737472696e67735f615f6c6c5f7468655f7761795f646f776e7d"
flag = bytes.fromhex(hex_string).decode('utf-8')
print(flag)
```
nu a mers codu asa ca am bagat pe net hex to ascii convertor
crypto{You_will_be_working_with_hex_strings_a_lot}

---
## Base64
Another common encoding scheme is Base64, which allows us to represent binary data as an ASCII string using an alphabet of 64 characters. One character of a Base64 string encodes 6 binary digits (bits), and so 4 characters of Base64 encode three 8-bit bytes.  
  
Base64 is most commonly used online, so binary data such as images can be easily included into HTML or CSS files.  
  
Take the below hex string, _decode_ it into bytes and then _encode_ it into Base64.

`72bca9b68fc16ac7beeb8f849dca1d8a783e8acf9679bf9269f7bf`

```
import base64
hex_input = "72bca9b68fc16ac7beeb8f849dca1d8a783e8acf9679bf9269f7bf"
# Mai întâi transformăm hex în bytes, apoi codificăm în base64
bytes_data = bytes.fromhex(hex_input)
flag = base64.b64encode(bytes_data).decode()
print(flag)
```

crypto/Base+64+Encoding+is+Web+Safe/

---
## Bytes and Big Integers

Cryptosystems like RSA works on numbers, but messages are made up of characters. How should we convert our messages into numbers so that mathematical operations can be applied?  
The most common way is to take the ordinal bytes of the message, convert them into hexadecimal, and concatenate. This can be interpreted as a base-16/hexadecimal number, and also represented in base-10/decimal.  
  
To illustrate:  
  
`message: HELLO`  
`ascii bytes: [72, 69, 76, 76, 79]`  
`hex bytes: [0x48, 0x45, 0x4c, 0x4c, 0x4f]`  
`base-16: 0x48454c4c4f`  
`base-10: 310400273487`

Convert the following integer back into a message:  
  
```
11515195063862318899931685488813747395775516287289682636499965282714637259206269
```

Am folosit varianta fara librarii
```
integer = 11515195063862318899931685488813747395775516287289682636499965282714637259206269

# 1. Convert integer to hexadecimal
hex_string = hex(integer)[2:] # [2:] removes the '0x' prefix

# 2. Convert hex back to bytes and decode to ASCII
message = bytes.fromhex(hex_string).decode()
print(message)
```

crypto{3nc0d1n6_4ll_7h3_w4y_d0wn}
