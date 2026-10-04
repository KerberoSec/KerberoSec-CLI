```
.s5SSSs.                                                                                                   
      SS. .s5SSSs.  .s    s.  .s5SSSs. s.  .s5SSSs.  .s5SSSs.  .s    s.  .s5SSSSs. s.  .s5SSSs.  .s        
sS    `:;       SS.       SS.          SS.       SS.       SS.       SS.    SSS    SS.       SS.           
SS        sS    S%S sSs.  S%S sS       S%S sS    S%S sS    `:; sSs.  S%S    S%S    S%S sS    S%S sS        
SS        SS    S%S SS `S.S%S SSSs.    S%S SS    S%S SSSs.     SS `S.S%S    S%S    S%S SSSs. S%S SS        
SS        SS    S%S SS  `sS%S SS       S%S SS    S%S SS        SS  `sS%S    S%S    S%S SS    S%S SS        
SS        SS    `:; SS    `:; SS       `:; SS    `:; SS        SS    `:;    `:;    `:; SS    `:; SS        
SS    ;,. SS    ;,. SS    ;,. SS       ;,. SS    ;,. SS    ;,. SS    ;,.    ;,.    ;,. SS    ;,. SS    ;,. 
`:;;;;;:' `:;;;;;:' :;    ;:' :;       ;:' ;;;;;;;:' `:;;;;;:' :;    ;:'    ;:'    ;:' :;    ;:' `:;;;;;:' 
```
In this THM room, we got our hands on a confidential case file from some self-declared
"black hat hackers" and it looks like they have a secret invite code. [^1]

Uncover and scan the QR code to retrieve the flag!
-----------------------------------------------------------------------------------------
The file that contains a secret invite code within a QR code is located in the directory
`/home/ubuntu/confidential/` and is called "Repdf.pdf". It is noticeable, how this PDF
has a QR code with an exclamation marker on top of it. It should be our goal now to
separate the overlying obfuscation image from the QR code. And for that, we can rely on
the `pdfimages` tool to split the PDF file into multiple images, e.g. with the command
`pdfimages -all Repdf.pdf image`.
This results in three images `image-000.png`, `image-001.png` and `image-002.png`, with
the later two being excalamation marker graphics and the first one being the undisclosed
document. Finally, we can open the confidential file `image-000.png` and scan the raw,
secret QR code with our phone to get prompted with the flag.

[^1]: https://tryhackme.com/room/confidential
