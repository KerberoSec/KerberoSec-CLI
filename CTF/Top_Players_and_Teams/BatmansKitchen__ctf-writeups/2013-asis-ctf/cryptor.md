# Cryptor

## The Given
We have found the cryptor source code. Decrypt the file.

```c++
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

using namespace std;
int bitXor(int, int);

int main(int argc, char **argv)
{
    srand(time(NULL));
    char *path=new char[30];
    if(argc > 1)
        path = argv[1];
    else
    {
        printf("\nenter file\n");
        scanf("%s",path);
    }
    int g = rand() % 512 + 32;
    int n = rand() % g;
    int mask = rand() % 256;
    FILE *inFile = fopen(path, "rb");
    FILE *outFile = fopen(strcat(path, "_Crypted"), "wb");
    if(inFile == NULL || outFile == NULL)
    {
        printf("Error\ncant read/write file\n");
        return 1;
    }
    unsigned char H, L;
    unsigned char *readBuffer = new unsigned char[g], *writeBuffer = new unsigned char[g];
    while(!feof(inFile))
    {
        int len = fread(readBuffer, 1, g, inFile);
        if(len < g)
            fwrite(readBuffer , 1 , len , outFile);
        else
        {
            for(int i = 0 ; i < g ; i++)
            {
                int nIndex = i + n;
                int pIndex = i - n;
                if(nIndex >= g) 
                    nIndex -= g;
                if(nIndex < 0) 
                    nIndex += g;
                if(pIndex >= g) 
                    pIndex -= g;
                if(pIndex < 0) 
                    pIndex += g;
                H = readBuffer[nIndex] / 16;
                L = readBuffer[pIndex] % 16;
                writeBuffer[i] = bitXor(16 * H + L, mask);
            }
            fwrite(writeBuffer , 1 , g , outFile);
        }
    }
    fclose (inFile);
    fclose (outFile);
    printf("\nsave decryption code: %d.%d.%d\n", g, n, mask);
    return 0;
}

int bitXor(int x, int y)
{
    int a = x & y;
    int b = ~x & ~y;
    int z = ~a & ~b;
    return z;
}
```

Also included is a file named "flag.png_Crypted".

## Analysis
Looks like we choose a random key here:
```c++
int g = rand() % 512 + 32;
int n = rand() % g;
int mask = rand() % 256;
```
First impression: there are about `512 * 512 * 256 = 2^26` possible keys,
which is a tiny search space.

Here is where we do the actual encryption:
```c++
unsigned char H, L;
unsigned char *readBuffer = new unsigned char[g], *writeBuffer = new unsigned char[g];
while(!feof(inFile))
{
    int len = fread(readBuffer, 1, g, inFile);
    if(len < g)
        fwrite(readBuffer , 1 , len , outFile);
    else
    {
        for(int i = 0 ; i < g ; i++)
        {
            int nIndex = i + n;
            int pIndex = i - n;
            if(nIndex >= g) 
                nIndex -= g;
            if(nIndex < 0) 
                nIndex += g;
            if(pIndex >= g) 
                pIndex -= g;
            if(pIndex < 0) 
                pIndex += g;
            H = readBuffer[nIndex] / 16;
            L = readBuffer[pIndex] % 16;
            writeBuffer[i] = bitXor(16 * H + L, mask);
        }
        fwrite(writeBuffer , 1 , g , outFile);
    }
}
```
So `g` is used as a block length, `n` is used as an offset, and `mask` is used
as a mask. The way this code is written, it's kind of hard to see where bits
are going in all of that arithmetic, so let's simplify it a bit.

First, let's look at these lines:
```c++
int nIndex = i + n;
if(nIndex >= g) 
    nIndex -= g;
if(nIndex < 0) 
    nIndex += g;
```

The index `i` loops over the block, and we're adding the offset `n` to index
later into the block. The if statements make sure that we wrap around instead
of running off the end of the block. I find it easier to read as
```c++
int nIndex = (i + n) % g;
```
Similarly,
```c++
int pIndex = (i - n) % g;
```

H and L are being grabbed from those offset bytes. But dividing by 16 is the
same as bit shifting right by 4 bits, and modding by 16 is the same as masking
away everything but the lowest order 4 bits, so we can reason better about
where the bits are going if we write it as
```c++
H = readBuffer[nIndex] >> 4;
L = readBuffer[pIndex] % 0xf;
```

In the same vein, we can rewrite `16 * H + L` as `H << 4 | L`.

The bitXor function is literally just a bitwise xor, so I have no clue why that
is a function. Rewrite it as
```c++
writeBuffer[i] = (H << 4 | L) ^ mask;
```

Here's what we have now:
```c++
unsigned char H, L;
unsigned char *readBuffer = new unsigned char[g], *writeBuffer = new unsigned char[g];
while(!feof(inFile))
{
    int len = fread(readBuffer, 1, g, inFile);
    if(len < g)
        fwrite(readBuffer , 1 , len , outFile);
    else
    {
        for(int i = 0 ; i < g ; i++)
        {
            int nIndex = (i + n) % g;
            int pIndex = (i - n) % g;
            H = readBuffer[nIndex] >> 4;
            L = readBuffer[pIndex] & 0xf;
            writeBuffer[i] = (H << 4 | L) ^ mask;
        }
        fwrite(writeBuffer , 1 , g , outFile);
    }
}
```

Great. It looks like each byte of ciphertext is made of the high-order bits of
a later byte and the low-order bits of an earlier byte (modulo `g`). Everything
is processed as blocks of g at a time, and the leftovers are kept as plaintext.

Now let's break it.

First we figure out how decryption works. Notice that each byte of plaintext is
"sampled" twice: once for its high bits and once for its low bits. For example,
the low bits of `p[0]` are found at `c[n]` and the high bits are in `c[g - n]`,
masked with the mask. So
`p[i] = ((c[(i - n) % g] >> 4) << 4) | (c[(i + n) % g] & 0xff)`.

The code for the decryption therefore looks like this:
```python
import sys

read = [ord(c) for c in open('flag.png_Crypted').read()]
blocks = [read[i * g:(i + 1) * g] for i in range(len(read) / g)]
write = [0] * g
for block in blocks:
    for i in range(g):
        nIndex = (i - n) % g
        pIndex = (i + n) % g
        H = block[nIndex] >> 4
        L = block[pIndex] & 0xf
        write[i] = (H << 4 | L) ^ mask
    sys.stdout.write(''.join(chr(c) for c in write))
sys.stdout.write(''.join(chr(c) for c in read[g * (len(read) / g):]))
```

Now we just need to find the key (g, n, mask). This is made easier by knowning
something about the plaintext: it is a PNG, which has the header
"\x89\x50\x4e\x47". This gives us a very fast test to brute force the key.
```python
read = [ord(c) for c in open('flag.png_Crypted').read()]
write = [0, 0, 0, 0]
for g in range(32, 512 + 32):
    for n in range(g):
        for mask in range(256):
            for i in range(4):
                nIndex = (i - n) % g
                pIndex = (i + n) % g
                H = read[nIndex] >> 4
                L = read[pIndex] & 0xf
                write[i] = (H << 4 | L) ^ mask
            if write == [0x89, 0x50, 0x4e, 0x47]:
                print g, n, mask
```

Once we have the key, we just plug it into the decryption code, and we indeed
get a PNG.

*[Image: Decrypted Flag]*

Open it up, and it's the flag
`ASIS_449e435e4c40dfa726f11b83a07b5471`.
