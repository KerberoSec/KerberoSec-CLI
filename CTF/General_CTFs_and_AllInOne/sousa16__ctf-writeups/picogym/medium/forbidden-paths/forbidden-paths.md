## Forbiden Paths

[Link to challenge](https://play.picoctf.org/practice/challenge/270)

Write-up:

1. We know we are at /usr/share/nginx/html/ and the flag is at /flag.txt. 
Since the website is blocking absolute paths, we use ../../../flag.txt to
retrieve the flag: **picoCTF{7h3_p47h_70_5ucc355_e5fe3d4d}**