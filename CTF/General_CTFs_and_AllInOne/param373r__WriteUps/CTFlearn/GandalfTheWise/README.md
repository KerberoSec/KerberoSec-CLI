# GandalfTheWise
## About

### General Information

__Challenge Description__: Extract the flag from the Gandalf.jpg file. You may need to write a quick script to solve this.

__Challege Category__: FORENSICS

__Challenge Difficulty__: Easy

__Skills__: Observational, Python Scripting

__Tools__: strings, xxd, base64

Download the file [here.](https://ctflearn.com/challenge/download/936)

## Solution

The challenge says we might need to code a script for that. Alright, let's first view the strings inside the image. 

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/GandalfTheWise/1.png)

We found 3 comments, out of which 1 seems to be a base64 cipher. Let's decrypt it. 

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/GandalfTheWise/2.png)

I tried this as the flag... But that wasn't correct... So I started to wonder if this is a hint to the flag. Hmm... XORing the other 2 comments? Now the challenge here is not converting the 2 strings to hexdump and then xoring each byte... We first gotta base64 decrypt the cipher, and create a hexdump of the decoded strings, then finally we gotta xor the dumps, and decode the final hex string to ascii flag.

So now that we know about it. Let's accomplish this task.

Open vim let's implement the first logic, i.e decode base64 and encode into the hexdump of both the files

This can be established, by writing these 2 lines of code.

```python
dumpx = <comment2>.decode('base64').encode('hex')
dumpy = <comment3>.decode('base64').encode('hex')
```

Now that we have the dumps in this format we gotta xor these hex strings, now the challenge here for me was... That how to tell these strings are hexdumps and not strings, because the interpreter will by default view this as strings. So I went to a bit of googling, and found this method of first converting the strings into _base-16 integers_ and then convert it into hex value. Later it came out to be this...

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/GandalfTheWise/3.png) 

This value is hex dump... and contains '0x' and 'L' at the ends... we gotta strip that off and we can do that by ```rstrip()```ing and ```lstrip()```ing the ends.

So finally after doing these operations we will get out ```flag_dump```. 

```python
flag_dump = hex(int(dumpx,16) ^ int(dumpy,16)).lstrip('0x').rstrip('L') # Converting into the base-16 int to convert in hex of the flag, and finally stripping the ends.
```

Now we can finally get the flag by ```print```ing after decoding the hex dump.

So the finaly script would be...

```python
x="xD6kfO2UrE5SnLQ6WgESK4kvD/Y/rDJPXNU45k/p"
y="h2riEIj13iAp29VUPmB+TadtZppdw3AuO7JRiDyU"

dumpx = x.decode('base64').encode('hex')
dumpy = y.decode('base64').encode('hex')

flag_dump = hex(int(dumpx,16) ^ int(dumpy,16)).rstrip("L").lstrip("0x")

print flag_dump.decode('hex')
```
Now when you run the script your output would be...

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/GandalfTheWise/4.png)

__Flag__: CTFlearn{Gandalf.BilboBaggins}

