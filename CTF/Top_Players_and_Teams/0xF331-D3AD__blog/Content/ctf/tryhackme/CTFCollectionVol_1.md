https://0xf331-d3ad.github.io/blog/#/ctf/tryhackme/# CTF Collection Vol. 1

## *What does the base said?*

> `echo VEhNe2p1NTdfZDNjMGQzXzdoM19iNDUzfQ== | base64 -d`

## *Meta meta*

> `exiftool Findme.jpg`

And look at the 'Owner Name'

## *Mon, are we going to be okay?*

> `steghide extract -sf Extinction.jpg`

And just press ***Enter*** in password prompt. You'll be presented with a note:

> `cat Final_message.txt`

## *Erm... Magick*

> Right after the question there's a flag, written in white color.

## *QRrrrr*

You can use [WebQR](https://webqr.com/): just upload an image and grab that flag!

## *Reverse it or read it?*

> `strings hello.hello | grep -o -e '.\{7,\}'`

## *Another decoding stuff*

Go to [CyberChef](https://cyberchef.org/) and select 'Magic' as recipe.
The 'base58' decoding option will show up (And the flag right next to it)

## *Left or right*

For this one use a [Ceasar decoder](https://www.dcode.fr/caesar-cipher) and bruteforce 
it. Under +19 (or -7) you'll finf the answer

## *Make a comment*

Open the devtools and find the comment.

## *Can you fix it?*

Just open the file with hex editor and replace first 4 bytes with these:

> 89 50 4e 47

After that, open the image with an image viewer and you'll see the flag

## *Read it*

This one was pretty hard to find, consider using the next google dork:

> `inurl:"reddit.com" &  intitle:"tryhackme" & intext:"thm"`

## *Spin my head*

This is ***Brainfuck***: an esoteric programming language.
Paste the code in [this interpreter](https://www.dcode.fr/brainfuck-language)

## *An exclusive*

The cipher is obviously XOR. Use this code if you're stuck:

```python
def main():
    string = '44585d6b2368737c65252166234f20626d'
    key = '1010101010101010101010101010101010'

    decodedHex = hex(int(string, 16) ^ int(key, 16))[2:]
    print(bytes.fromhex(decodedHex).decode('utf-8'))

if __name__ == "__main__":
    main()
```

## *Binary walk*

Extract files:

> `binwalk -e hell.jpg`

Navigate to ***./_hell.jpg.extracted*** and `cat hello_there.txt`

## *Darkness*

> `stegoveritas dark.png`

Open ***results/dark.png_Blue_1.png*** file.

## *A sounding QR*

1. Use the site that we used in the previous QR task to retrieve the soundcloud url
2. Listen this tape

## *Dig up the past!*

Use the Wayback Machine!

## *Uncrackable!*

Ok, we have a ciphertext and the first part of plaintext. Use [Dcode](https://www.dcode.fr/vigenere-cipher)
to get the key. After that, paste the ciphertext with the key to [Boxentriq](https://www.boxentriq.com/code-breaking/vigenere-cipher)

## *Small bases*

1. Dec -> Hex [Rapidtables](https://www.rapidtables.com/convert/number/decimal-to-hex.html)
2. Hex -> Ascii [Rapidtables](https://www.rapidtables.com/convert/number/hex-to-ascii.html)

## *Read the packet*

Fire up Wireshark, filter ***http*** and click on ***Follow HTTP stream***
