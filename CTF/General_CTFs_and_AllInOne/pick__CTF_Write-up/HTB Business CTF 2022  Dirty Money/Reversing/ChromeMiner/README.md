# ChromeMiner
  - [1. Challenge Details](#1-challenge-details)
      * [Challenge Category](#challenge-category)
      * [Challenge Points](#challenge-points)
      * [CTF Date](#ctf-date)
  - [2. Solution Write-up](#2-solution-write-up)
## 1. Challenge Details 
Discurd has filed a DMCA violation regarding a popular browser extension claiming to be conducting VIP giveaways on the company's product. The addon store has since taken down the extension to prevent any potential browser cryptomining malware from being distributed in the marketplace. Could you investigate what the 'Discurd Nitro Giveaway' addon does exactly?

#### Challenge Category
Reversing

#### Challenge Points
325: (easy)

#### CTF Date
07/15/2022: 07/17/2022

## 2. Solution Write-up

1. The zip file we downloaded contains a file with the extension '.crx'. Quick Google search tells us that this is a _Chrome extension file_. 
2. We can visit [Ezyzip.com](https://www.ezyzip.com/open-extract-crx-file.html) to view the contents of the extension.
3. The extracted contents can be viewed in [Extracted](Extracted/)
4. Investigating these files background.js seems to contain a sort of cipher. The file is also using Javascript obfuscation which can be made readable by using [dcode.fr](https://www.dcode.fr/javascript-unobfuscator). Deobfuscated file can be viewed [deobfuscated_background.js](deobfuscated_background.js/)
5. In order to determine the way the strings are built I have created a python script. [ChromeMiner.py](ChromeMiner.py/)
6. Next we get a series of partial words, a clue saying ```_NOT_THE_SECRET_```, an encryption method, and a long hexadecimal string.
![alt text](https://i.imgur.com/aJKpnm7.png)

Looking through the other text for hints on what this string might be, I was able to spot this.
  
"name AES-CBC" => Probably means that the string is encrypted with AES-CBC
  
If we goto [devglan.com](https://www.devglan.com/online-tools/aes-encryption-decryption) we can see options to encrypt and decrypt with AES-ECB and AES-CBC

We can enter the encrypted string to be decrypted.
Select Hex as the "Input Text Format" because this is a hexadecimal string 
![alt text](https://i.imgur.com/aIveRWB.png)
Ref: [boxentriq.com](https://www.boxentriq.com/code-breaking/cipher-identifier)

Next we can select "CBC" as the Cipher Mode of Decryption

Lastly we need to enter a key. Looking through the generated text again, ```_NOT_THE_SECRET_``` is generated twice. I decided to try this as my key and was suprised to see this as a result.
![alt text](https://i.imgur.com/05kBqnX.png)

Looking at the end of the decrypted text I was able to tell that this was the correct string that needed to be decrypted. A little more playing around with and I remembered that it was generated twice. So I decided to fill out the IV field with ```_NOT_THE_SECRET_``` as well.

![alt_text](https://i.imgur.com/H9SPHyU.png)

Voila! Our flag is ```HTB{__mY_vRy_owN_CHR0me_M1N3R__}```

