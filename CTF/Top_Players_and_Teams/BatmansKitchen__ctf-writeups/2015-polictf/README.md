# PoliCTF 2015 3DOGES2 400

Unfortunately I wasn't able to solve this problem during the competition...

First glance through the code it's using TripleDES to encrypt data

Digging around the code a bit, I found this part of the code particularly interesting, especially with the comment...

```go
func muchSecurity(key []byte) []byte {
    var tripleDOGESKey []byte

    secondKey := make([]byte, 16)
    copy(secondKey, key)
    for i := 8; i < 16; i++ {
        // Let's be sure it is enough complex. Complex is good, a friend told us so.
        key[i] = (secondKey[i] & 0x3c) | (suchSubstitution[(secondKey[i] >> 2) & 0x0f] << 6)
        key[i] |= (key[i] >> 3) & 0x03
        key[i] |= ((key[i] >> 4) ^ key[i]) << 7
    }

    // EDE2 is required.
    tripleDOGESKey = append(tripleDOGESKey, key[:8]...)
    return append(tripleDOGESKey, key[:16]...)
}
```

OK, let's figure out how Complex is "good" then. I'll skip the math here. 

But suppose you have a byte represented by WXABCDYZ, where each alphabet represents a binary digit.

Then after the "Complex" transformation, we get (B^C)(suchSubstitution[ABCD])ABCDBC. 

Tada~ now we just shrinked our keyspace by a half, instead of having 8 bits of entropy, we have 4 for each byte for the last 8 bytes. 

But that's still not enough for us to break the code. Since we have no idea of the first 8 bytes

Then I went online to look for golang example of using TripleDES, here's what I found 
    
```go
func main() {
    // NewTripleDESCipher can also be used when EDE2 is required by
    // duplicating the first 8 bytes of the 16-byte key.
    ede2Key := []byte("example key 1234")

    var tripleDESKey []byte
    tripleDESKey = append(tripleDESKey, ede2Key[:16]...)
    tripleDESKey = append(tripleDESKey, ede2Key[:8]...)

    _, err := des.NewTripleDESCipher(tripleDESKey)
    if err != nil {
	    panic(err)
    }

    // See crypto/cipher for how to use a cipher.Block for encryption and
    // decryption.
}
```

Hm...This looks a bit different than the one above, the key it uses is constructed by key[:16] + key[:8], but the one we got is constructed by key[:8] + key[:16].

I wonder what's the difference here... 

Then I realized that EDE stands for Encrypt-Decrypt-Encrypt...

Wait a minute! that means they are using the same key for the first round of encryption and decryption! Such wow! 

This means it's just a single round DES with half of the keyspace! 

Great! now we only have 32 bits of entropy, it's bruteforceable! 

Then I quickly wrote a python script to bruteforce it. 

(Unfortunately, my script requires at least 32G of RAM...due to python's ittertools.products storing all the data..., 

and yeah I used a 40 core AWS instance, it took me 30 minutes to solve it)

Here's my script

```python
from Crypto.Cipher import DES
from pwn import *
import itertools
import multiprocessing
CORE = 39

def crunchnumber(key):
key = "".join(i for i in key)
for i in keys:
    trykey = key + i
	c = DES.new(trykey, DES.MODE_CBC, iv)
	cipher_verify = c.encrypt(plain)
	assert(len(cipher_verify) == len(cipher1))
	if (cipher_verify == cipher1):
	    print trykey.encode("hex")
	    with open("key.txt", "a") as f:
		f.write(trykey.encode("hex") + "\n")
	    print "Found it!"
	    return 1
    return 0

def process(datas):
    pool = multiprocessing.Pool(processes=CORE)
    result = pool.map(crunchnumber, itertools.product(datas, repeat = 7))

sub = [0,1,1,0,1,0,0,1,0,1,0,0,1,1,0,1]

def f(a):
    a = (a & 0x3c) | sub[(a>>2)&0xf] << 6
    a |= ((a >> 3) & 0x03)
    a |= ((a >> 4) ^ a) << 7
    a &= 0xff
    return a

plain = "\nWelcome! Wanna talk with John? Follow the instructions to get a Secure\xe2\x84\xa2 Channel.\n"
keys = []
for i in range(0,256):
    temp = chr(f(i))
    if temp not in keys:
	keys.append(temp)
assert(len(keys) == 16)
plain = plain + (8 - len(plain) % 8) * "\x00"
r = remote('doges.polictf.it', 80)
r.recvline()
r.recvline()
cipher1 = r.recvline().strip().strip('\x00')
cipher1 = cipher1.decode("hex")
iv = cipher1[:8]
cipher1 = cipher1[8:]
r.recvline()
r.recvline()
cipher2 = r.recvline().strip().strip('\x00')
cipher2 = cipher2.decode("hex")
r.close()
print keys
process(keys)
with open("key.txt", "rb") as f:
    realkey = f.readline().strip() 
assert(len(realkey) == 16)
realkey = realkey.decode("hex")
realkey = crunchnumber(realkey)
iv = cipher2[:8]
cipher2 = cipher2[8:]
c = DES.new(realkey, DES.MODE_CBC, iv)
m2 = c.decrypt(cipher2)
print m2
```

The DES key is "20a9643bad20f2ad" encoded in hex

We are able to find out the superkey the challenge is encrypting, which is "Root superpassword", entering that into the program

We got the flag!!!!

```
Flag: flag{!wow-such-flag-much-crypto-amazing}
```
