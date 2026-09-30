### Problem Statement
```txt
Can you look at the data in this binary: "static"? This "BASH script" might help!
```

---

Simply executing the bash script yeilds the following output:

```console
$ bash ltdis.sh
Attempting disassembly of  ...
objdump: 'a.out': No such file
objdump: section '.text' mentioned in a -j option, but not found in any input file
Disassembly failed!
Usage: ltdis.sh <program-file>
Bye!
```
It generates a grabage file `.ltdis_x86_64.txt` which we can simply delete.

As stated in the script output, we need to pass in the name of the second file, i.e. `static`.

```console
# Removing the grabage file:
$ rm .ltdis.x86_64.txt

$ bash ltdis.sh static
Attempting disassembly of static ...
Disassembly successful! Available at: static.ltdis.x86_64.txt
Ripping strings from binary with file offsets...
Any strings found in static have been written to static.ltdis.strings.txt with file offset
```

Now, we can search for the flag in each. The `grep` command is useful for this:

```console
$ grep "picoCTF" static.ltdis.x86_64.txt
$ grep "picoCTF" static.ltdis.strings.txt
   1020 picoCTF{d15a5m_t34s3r_1e6a7731}
```

And there we have it :)

---

#### Flag
    picoCTF{d15a5m_t34s3r_1e6a7731}

Link to the challenge: [Static ain't always noise](https://play.picoctf.org/practice/challenge/163)
