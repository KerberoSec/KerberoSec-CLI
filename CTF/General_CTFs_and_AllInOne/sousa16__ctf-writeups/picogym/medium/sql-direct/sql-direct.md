## SQL Direct

[Link to challenge](https://play.picoctf.org/practice/challenge/303)

Write-up:

1. `psql -h saturn.picoctf.net -p 64800 -U postgres pico` and password is `postgres`

2. `\dn` lists schemas and `\dt` lists tables: we find a `flags` table.

3. `\d flags` allows us to inspect the `flags table`. <br>
`SELECT * FROM flags` returns the flag: picoCTF{L3arN_S0m3_5qL_t0d4Y_31fd14c0}