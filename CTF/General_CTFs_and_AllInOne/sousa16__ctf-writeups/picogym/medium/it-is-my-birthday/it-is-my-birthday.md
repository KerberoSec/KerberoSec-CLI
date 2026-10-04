## It is my Birthday

[Link to challenge](https://play.picoctf.org/practice/challenge/109)

Write-up:

1. I was sort of familiar with hash collisions already. A hash collision is when 
a hash function generates the same hash value for two different inputs. In this 
challenge, we need to create two different PDFs with the same MD5 hash value.

2. After some research, I found the following [tool](https://github.com/corkami/collisions)
that allows the user to create MD5 hash collisions. There's actually an `examples`
directory that contains two collision PDFs (both in `/files`), which solve the 
challenge and get us the flag: **picoCTF{c0ngr4ts_u_r_1nv1t3d_73b0c8ad}**