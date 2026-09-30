## HV19.H4 Hidden Four

### Solution

This hidden challenge was released along with day 14. After solving the challenge of day 14, I noticed that the flag has a very weird format and seems to contain a regex:

```
HV19{s@@jSfx4gPcvtiwxPCagrtQ@,y^p-za-oPQ^a-z\x20\n^&&s[(.)(..)][\2\1]g;s%4(...)%"p$1t"%ee}
```

Another thing that caught my attention, was the sentence `Only perl can parse Perl!` in the data section of the perl script. Maybe, the whole flag is also a heavily obfuscated perl script. I pasted the flag in a file and executed it:

```
manuel@LAPTOP-A4T7BTE7:/mnt/c/Users/zamet/hackvent-2019/Hidden 04$ perl test.pl 
Squ4ring the Circle
```

**Flag:** HV19{Squ4ring the Circle}
