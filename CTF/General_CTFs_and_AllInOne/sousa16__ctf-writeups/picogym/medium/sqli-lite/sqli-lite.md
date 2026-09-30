## SQLiLite

[Link to challenge](https://play.picoctf.org/practice/challenge/304)

Write-up:

1. Attempting to login as `admin:admin` shows us the SQL query used: `SELECT * FROM users WHERE name='admin' AND password='admin'`

2. Using password `' OR '1'='1` logs us in, and flag is hidden in HTML. <br>
Flag: picoCTF{L00k5_l1k3_y0u_solv3d_it_d3c660ac}