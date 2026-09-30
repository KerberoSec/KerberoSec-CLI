## Challenge 🧩

I've got a box, and I just know there's a flag inside.

Author: Kkevsterrr#7469 </br>

## Solution 🕵️‍♂️

```bash
┌──(user㉿shell)-[~]
└─$ binwalk thebox

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Executable script, shebang: "/bin/sh"
837           0x345           Unix path: /usr/ucb/echo; then
872           0x368           Unix path: /usr/ucb/echo"
928           0x3A0           Unix path: /usr/xpg4/bin; then
957           0x3BD           Unix path: /usr/xpg4/bin:$PATH
1008          0x3F0           Unix path: /usr/sfw/bin; then
1042          0x412           Unix path: /usr/sfw/bin
6792          0x1A88          Unix path: /usr/local/ssl/bin:/usr/local/bin:/opt/openssl/bin"}
18817         0x4981          gzip compressed data, maximum compression, from Unix, last modified: 2024-05-10 23:29:08
11382065      0xADAD31        Zip archive data, at least v2.0 to extract, compressed size: 13049, uncompressed size: 51767, name: pip/_vendor/distlib/locators.py
11467865      0xAEFC59        Zip archive data, at least v2.0 to extract, compressed size: 81486, uncompressed size: 182784, name: pip/_vendor/distlib/t64-arm.exe
11549403      0xB03ADB        Zip archive data, at least v2.0 to extract, compressed size: 52371, uncompressed size: 108032, name: pip/_vendor/distlib/t64.exe
11601846      0xB107B6        Zip archive data, at least v2.0 to extract, compressed size: 18589, uncompressed size: 67530, name: pip/_vendor/distlib/util.py
11620497      0xB15091        Zip archive data, at least v2.0 to extract, compressed size: 6568, uncompressed size: 23747, name: pip/_vendor/distlib/version.py
11627130      0xB16A7A        Zip archive data, at least v2.0 to extract, compressed size: 46118, uncompressed size: 91648, name: pip/_vendor/distlib/w32.exe
11673315      0xB21EE3        Zip archive data, at least v2.0 to extract, compressed size: 77301, uncompressed size: 168448, name: pip/_vendor/distlib/w64-arm.exe
11750671      0xB34D0F        Zip archive data, at least v2.0 to extract, compressed size: 50510, uncompressed size: 101888, name: pip/_vendor/distlib/w64.exe
11801253      0xB412A5        Zip archive data, at least v2.0 to extract, compressed size: 10810, uncompressed size: 43958, name: pip/_vendor/distlib/wheel.py
12865349      0xC44F45        Zip archive data, at least v2.0 to extract, compressed size: 2765, uncompressed size: 9023, name: pkg_resources/_vendor/pyparsing/exceptions.py
12916438      0xC516D6        Zip archive data, at least v2.0 to extract, compressed size: 35966, uncompressed size: 65536, name: setuptools/cli-32.exe
12952465      0xC5A391        Zip archive data, at least v2.0 to extract, compressed size: 39173, uncompressed size: 74752, name: setuptools/cli-64.exe
12991699      0xC63CD3        Zip archive data, at least v2.0 to extract, compressed size: 64410, uncompressed size: 137216, name: setuptools/cli-arm64.exe
13056154      0xC7389A        Zip archive data, at least v2.0 to extract, compressed size: 35966, uncompressed size: 65536, name: setuptools/cli.exe
13100861      0xC7E73D        Zip archive data, at least v2.0 to extract, compressed size: 12167, uncompressed size: 45578, name: setuptools/dist.py
13153920      0xC8B680        Zip archive data, at least v2.0 to extract, compressed size: 39307, uncompressed size: 75264, name: setuptools/gui-64.exe
13193288      0xC95048        Zip archive data, at least v2.0 to extract, compressed size: 64584, uncompressed size: 137728, name: setuptools/gui-arm64.exe
13782965      0xD24FB5        Zip archive data, at least v2.0 to extract, compressed size: 9166, uncompressed size: 31188, name: setuptools/command/editable_wheel.py
```

Extracting the files

```bash
┌──(user㉿shell)-[~]
└─$ binwalk -e thebox
```

After analyzing the contents of `4981` archive we get `thebox.py` file.

After selecting only necessary lines of code, we get the flag.

```py
import hashlib

FLAG_PREFIX = "flag{%s}"

print(FLAG_PREFIX % hashlib.blake2b(('1234' + "nahamcon").encode("utf-8")).hexdigest()[:32])
```

## Flag 🚩

`flag{da0a0a25f5b35fbf99e3351997bfc4c8}`
