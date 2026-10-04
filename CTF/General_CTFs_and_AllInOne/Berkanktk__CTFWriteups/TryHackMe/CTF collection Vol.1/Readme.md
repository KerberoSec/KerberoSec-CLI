# Inclusion writeup
[Link to the CTF on TryHackMe](https://tryhackme.com/room/ctfcollectionvol1)

# Information about the CTF
> Sharpening up your CTF skill with the collection. The first volume is designed for beginner.

# How to solve it
## Task 1) What does the base said?
Use Cyberchef (Base64)

## Task 2) Meta meta
`exiftool Findme.jpg`

## Task 3) Mon, are we going to be okay?
`steghide extract -sf Extinction.jpg`

## Task 4) Erm......Magick
Well, the flag is in the challenge description

## Task 5) QRrrrr
`sudo apt-get install zbar-tools`   
`zbarimg QR.png`

## Task 6) Reverse it or read it?
`strings hello.hello | grep THM`

## Task 7) Another decoding stuff
Use Cyberchef (Base58)

## Task 8) Left or right 
Use Cyberchef (Rot13: amount = 7)

## Task 9) Make a comment
Check html comment for the challenge 

## Task 10) Can you fix it?
`hexeditor spoil.png`  
PNG magic header: 89 50 4E 47  
Hit save and open picture

## Task 11) Read it
Go on google and search for:
`Some hidden flag inside Tryhackme social account. site:reddit.com`

## Task 12) Spin my head
Its brainfuck, no seriously:D

Use a Brainfuck compiler like:
https://copy.sh/brainfuck/

## Task 13) An exclusive!
XOR these two strings  
S1: 44585d6b2368737c65252166234f20626d

S2: 1010101010101010101010101010101010

This website can be used for this task:   
https://xor.pw/#

## Task 14) Binary walk
Download the file and run these commands:  
`binwalk -e hell.jpg`

`cd _hell.jpg.extracted`

`cat hello_there.txt`

## Task 15) Darkness
Download stegsolve  
`wget http://www.caesum.com/handbook/Stegsolve.jar -O stegsolve.jar`

Make it an executable  
`chmod +x stegsolve.jar`

Create a new directory named "/bin"  
`mkdir bin`

Move stegsovle.jar into "/bin"  
`mv stegsolve.jar bin`

Move dark.png into "/bin"   
`mv dark.png bin`

Change directory into bin   
`cd bin`

Run the stegsolve.jar  
`java -jar stegsolve.jar`

Open (or hit "O") -> dark.png -> Open

Move left until you see "Gray bits"
## Task 16) A sounding QR
Go into this site and upload the qr  
https://zxing.org/w/decode.jspx

Hit send and go to the "Parsed Result" to listen for the sound.

## Task 17) Dig up the past
Use the Wayback machine: https://web.archive.org

Enter the url and go to the date to find the snapshot.

Scroll down until you see the flag

## Task 18) Uncrackable!
Use cyberchef (Vigenére Decode)

I tried the key thm, since this always occur in the flag. So maybe you should try too.

## Task 19) Small bases
Open terminal and write:
```console
> n = 581695969015253365094191591547859387620042736036246486373595515576333693
> h = hex(n)[2:]
> bytearray.fromhex(h).decode()
```

## Task 20) Read the packet
Download and open the pcap file

File -> Export Objects -> HTTP -> flag.txt -> save

Then open the file to see the flag