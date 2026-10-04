## Trickster

[Link to challenge](https://play.picoctf.org/practice/challenge/445)

Write-up:

1. First, I tried to access robots.txt, which showed me there was an instructions.txt and an uploads directory.

2. This file gives away that we need to create a payload with the PNG magic bytes at the start to get the flag. 
However, we don't know where the flag is.

3. Using CyberChef, we create a ls.png.php with the PNG Magic Bytes at the start.
We then use vim to create a payload (ls.png.php): since we are in /uploads, we use `ls ..` to see what other directories exist.
After navigating to uploads/ls.png.php, we find a HFQWKODGMIYTO.txt which seems interesting.

4. After crafting a payload to cat the file, we get the flag: ***picoCTF{c3rt!fi3d_Xp3rt_tr1ckst3r_9ae8fb17}***
