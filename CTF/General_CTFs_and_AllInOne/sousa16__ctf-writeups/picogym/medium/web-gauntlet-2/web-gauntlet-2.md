## Web Gauntlet 2

[Link to challenge](https://play.picoctf.org/practice/challenge/174)

Write-up:

1. We can check `filter.php` to see what filters are being used. Building from the
first Web Gauntlet challenge, we see that we can no longer use comments nor `;` to
break from expressions: we need to use the `password` field.

2. We can attempt to make the `password` field an expression that always evaluates
to True, like `'a' IS NOT 'b'`. We attempt credentials `ad'||'min:a' IS NOT 'b`, 
which solves the challenge and gets us the flag: **picoCTF{0n3_m0r3_t1m3_b55c7a5682db6cb0192b28772d4f4131}**