# Javascript: Obfuscation 3

We got another JS obfuscation chall, Here I got `\x35\x35\x2c\x35\x36\x2c\x35\x34\x2c\x37\x39\x2c\x31\x31\x35\x2c\x36\x39\x2c\x31\x31\x34\x2c\x31\x31\x36\x2c\x31\x30\x37\x2c\x34\x39\x2c\x35\x30` this in source code. 

And The pattern seems to be of hex like 
`\x35 = 0x35 = 53 in decimal = 5`

Here we can use concole: 
```const layer1 = "\x35\x35\x2c\x35\x36\x2c\x35\x34\x2c\x37\x39\x2c\x31\x31\x35\x2c\x36\x39\x2c\x31\x31\x34\x2c\x31\x31\x36\x2c\x31\x30\x37\x2c\x34\x39\x2c\x35\x30";
console.log("Layer 1 result:", layer1);
```
<img  alt="image" src="https://github.com/user-attachments/assets/41cefbc0-1c8a-4c5b-9931-71dab85ec11f" />

after converting all the hex, we got something like `55,56,54,79,115,69,114,116,107,49,50`

now, lets use ansci decoding. 
```
const charCodes = "55,56,54,79,115,69,114,116,107,49,50";
const decoded = charCodes.split(',').map(code => String.fromCharCode(code)).join('');
console.log("Final result:", decoded);
```
<img alt="image" src="https://github.com/user-attachments/assets/b9074bf0-56b8-4c71-80e4-51713ea2febd" />

Now, we got the password: 786OsErtk12

