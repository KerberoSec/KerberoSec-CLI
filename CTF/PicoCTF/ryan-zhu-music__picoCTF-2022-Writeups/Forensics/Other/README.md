# Other

### This file contains writeups for the easier forensics challenges that have fairly short solutions.

## **Contents**

- [Enhance!](#enhance---100-pts)
- [File Types](#file-types---100-pts)
- [Lookey Here](#lookey-here---100-pts)
- [Packets Primer](#packets-primer---100-pts)
- [Redaction Gone Wrong](#redaction-gone-wrong---100-pts)
- [Sleuthkit Intro](#sleuthkit-intro---100-pts)

---

# Enhance!: 100 pts

## Solution

The file is an SVG file, which is under the XML family of files, which means it is in a readable text format. Opening it in a text editor, you will see the flag is displayed in pieces at an extremely small font size. You can change the font size, or just piece the flag together in the XMl.

## Flag

> `picoCTF{3nh4nc3d_d0a757bf}`

---

# File Types: 100 pts

> This file was found among some files marked confidential but my pdf reader cannot read it, maybe yours can.

## Solution

Trying to open the PDF in a PDF reader, you find it is clearly messed up in some way. In fact, it is not even a PDF file:

```console
$ file Flag.pdf
Flag.pdf: shell archive text
```

It's a shell script! Let's run it:

```console
$ mv Flag.pdf Flag.sh
$ sh Flag.sh
x - created lock directory _sh00046.
x - extracting flag (text)
Flag.sh: 119: uudecode: not found
restore of flag failed
flag: MD5 check failed
x - removed lock directory _sh00046.
```

This part got a lot of participants frustrated or confused, as they were not sure what to do with this error. With any error, you should copy paste the exact error and search it up. In this case, our error is `uudecode: not found`.

It turns out that it needs to be [installed with the sharutils package](https://askubuntu.com/questions/232440/how-do-i-install-uudecode).

```console
$ sudo apt-get install sharutils
$ sh Flag.sh
x - created lock directory _sh00046.
x - extracting flag (text)
x - removed lock directory _sh00046.
$ ls
flag
$ file flag
flag: current ar archive
```

This is the annoying part. The rest of this solution involves unzipping the file over and over again, as it is essentially an archive inside an archive inside an archive...and so on. For each archive, search up the command to decompress it and use it (each one is different), until you reach a file that is ASCII text.

## Flag

> `picoCTF{f1len@m3_m@n1pul@t10n_f0r_0b2cur17y_950c4fee}`

---

# Lookey Here: 100 pts

> Attackers have hidden information in a very large mass of data in the past, maybe they are still doing it.

## Solution

We know the flag begins with`picoCTF{`, so we can open the file and search for that:

```console
$ cat anthem.flag.txt | grep "pico"
      we think that the men of picoCTF{gr3p_15_@w3s0m3_2116b979}

```

## Flag

> `picoCTF{gr3p_15_@w3s0m3_2116b979}`

---

# Packets Primer: 100 pts

> Download the packet capture file and use packet analysis software to find the flag.

## Solution

Open the packet capture in Wireshark. We see that there is just 1 TCP stream. Right click a packet > Follow > TCP Stream, and a window should pop up showing the flag.

## Flag

> `picoCTF{p4ck37_5h4rk_01b0a0d6}`

---

# Redaction Gone Wrong: 100 pts

> Now you DON’T see me.
> This report has some critical data in it, some of which have been redacted correctly, while some were not. Can you find an important key that was not redacted properly?

## Solution

Open the PDF in a PDF viewer/editor. Try highlighting and copy/pasting the redacted text. The last redaction is the flag.

## Flag

> `picoCTF{C4n_Y0u_S33_m3_fully}`

---

# Sleuthkit Intro: 100 pts

> Download the disk image and use mmls on it to find the size of the Linux partition. Connect to the remote checker service to check your answer and get the flag.

## Solution

Do exactly as the description instructs.

```console
$ wget https://artifacts.picoctf.net/c/114/disk.img.gz
$ gunzip disk.img.gz
$ mmls disk.img
DOS Partition Table
Offset Sector: 0
Units are in 512-byte sectors

      Slot      Start        End          Length       Description
000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)
001:  -------   0000000000   0000002047   0000002048   Unallocated
002:  000:000   0000002048   0000204799   0000202752   Linux (0x83)
```

The length is 202752. Let's send it to the checker:

```console
$ nc saturn.picoctf.net 52279
What is the size of the Linux partition in the given disk image?
Length in sectors: 202752
202752
Great work!
picoCTF{mm15_f7w!}
```

## Flag

> `picoCTF{mm15_f7w!}`
