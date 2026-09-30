# One Line writeups for AMCOM CTF

## Forensics:

	[1.] *Meta Data* : ```strings amcom-forensics.jpg```
	[2.] *Not as simple* : ```strings notasSimple.jpg```, got base64 text which inturn used as passphrase for steghide
	[3.] *Mem-1 Copied Over*: ```volatility --plugins=volatility-plugins/ -f image.raw --profile=Win7SP1x64 clipboard```
	[4.] *Mem-2 Interesting file*: ```volatility --plugins=volatility-plugins/ -f image.raw --profile=Win7SP1x64 dumpfiles -Q 0x000000007e286550 -D .``` then we get flag image. I got the offset by using ```filescan``` plugin
	[5.] *Mem-3 Browsing History*: ```volatility --plugins=volatility-plugins/ -f image.raw --profile=Win7SP1x64 chromehistory```
	[6.] *Mem-4 Passwords*: ```volatility --plugins=volatility-plugins/ -f image.raw --profile=Win7SP1x64 hashdump``` and cracked hashes according to alphabetical order

## Cryptography:
	[1.] *To many bases*: Used online tool ```cyberchef```
	[2.] *Twisted*: Vigenere cipher with key ```AMCOM```
	[3.] *Mirror*: ciphertext is upside down. We need to put it normally and the it is ```echo "QU1DT017TTFSUk9SXyFTXzRMV0FZU19CRTRVVElGIUVTX1VTfQ==" | base64 -d```
	[4.] *The Pharaoh's lost message*: ```strings file.exe``` got morse code. Used online morse code translator. One part is plain text and remaining part is base64 encode. when we decode we get the flag.
	[5.] *Esrever*: In python, ```s = "oQfTNUSTFkQfd1TOt0XTlVQXxUQ710TD1UQ"``` to reverse it ```s[::-1]``` and then pad with `=` which is base64 encoded
	[6.] *Multiply*: It is ascii85 encoded and then it is encoded with multiple bases.
	[7.] *Hodor Hodor Hodor* : used this online decoder `https://www.dcode.fr/hodor-language`
## Web:
	[1.] *Inspector*: Source code
	[2.] *Robot*: `https://tifaccyber.xyz/robots.txt`
	[3.] *Lost Web server*: found port at 45807
	[4.] *Phishing Fiasco*: It is just Local File Inclusion. `http://35.224.214.93/index.php?file=/etc/passwd` and then `http://35.224.214.93/passwordloot.txt`

## Reverse:
	[1.] *C for Cimple*: Used `strings ancom`, got the flag

## OSINT:
	[1,] *author*: Found flag here `https://avsidhartha.weebly.com/amcom.html`. Thats just my instinct that in blog page I cound find all ctf names and when I pressed on them I got `https://avsidhartha.weebly.com/{ctfname}/html` so just tried.	
	[2.] *Records*: used the command ```dig TXT tifaccyber.xyz```
	[3.] *Way back then*: solved using the way back machine `https://archive.org/web/`
## Misc:
	[1.] *SpaceX*: used steghide and the passphrase `Elon Musk`

## Welcome:
	[1.] *Discord*: Its the heading of the #welcome channel
	[2.] *Mathology*: Answer `69`
