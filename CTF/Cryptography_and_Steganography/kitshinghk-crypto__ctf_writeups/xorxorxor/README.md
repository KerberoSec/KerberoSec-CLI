# HTB xorxorxor writeup

The challenge has 2 files: the encryption python script and its program output 
The encryption script simply XOR encrypted the flag and output it to a file.
The output file has the following content:
```
Flag: 134af6e1297bc4a96f6a87fe046684e8047084ee046d84c5282dd7ef292dc9
```

We know the flag begins with "HTB{". So the key probably begins with
"H" XOR 0x13, "T" XOR 0x4a, "B" XOR 0xF6, "{" XOR 0xE1
The flag can be obtained by decrypting the file output using the above key. The key length is 4.
