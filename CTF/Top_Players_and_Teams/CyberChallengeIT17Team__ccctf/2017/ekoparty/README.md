# [EKOPARTY CTF 2017](https://ctf.ekoparty.org/)
## Web
### SecureFile
We have the code that handles the uploads in this site.  
We need to find the name of the file.  
The first eight bytes of `uniqid()` are the POSIX time.  
Solution source code can be found in `securefile.py`

## Reversing
### Rhapsody
It is an ELF 64-bit executable.  
At 0x401378 we see a lot of conditional jumps with a repeating pattern:
```
0x00401394      b800000000     mov eax, 0
0x00401399      e8e2f8ffff     call fcn.00400c80    // call a function
0x0040139e      85c0           test eax, eax
0x004013a0      750a           jne 0x4013ac         // stop if it returns 0
```

Each function compares one character from input with one character in the range [0x4a2739-0x4a275d].  
We get the flag writing down each character in call order 
### MobCipher
We are asked to dump a flag from an .apk file.  
Unzipping the file we see that it is a cordova/ionic app.  
We look for the flag searching for the string `EKO`.
We find these lines in `assets/www/build/main.js`
```javascript
        ...
        this.cipherflag = 'sdvejusrskmgmwpzwyznsrhbcivhhtkski';
        this.falseflag = 'EKO{this is not the flag}';
        ...
        this.plainflag = 'EKO{' + result + '}';
        ...
        ... [rootParams]="{\'p1\': \'Eko2017Passphrase\'" ...
```
Looking at the source code we see the decryption function used and guess that:
- the encrypted flag is `sdvejusrskmgmwpzwyznsrhbcivhhtkski`
- decryption key is `Eko2017Passphrase`

Solution source code can be found in `mobchiper.js`
