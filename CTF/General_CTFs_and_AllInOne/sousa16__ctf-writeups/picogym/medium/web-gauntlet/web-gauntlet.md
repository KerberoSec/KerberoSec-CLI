## Web Gauntlet

[Link to challenge](https://play.picoctf.org/practice/challenge/88)

Write-up:

1. Attempting to login as `admin:admin` shows us the query used by the request:
`SELECT * FROM users WHERE username='admin' AND password='admin'`

2. Attempting `admin:'` credentials triggers an error that shows us that SQLite3 is being used.

3. `admin:'+OR+1=1--` triggers the filters. We can anaylze the `filter.php` page to
see that what triggered the filter was the `OR` keyword.

4. Using username `admin'-- ` worked. On to round 2.

5. Checking `filter.php` shows us that `-- ` won't work anymore. However, we can use
a multiline comment in the username to bypass that: `admin'/*`. On to round 3.

6. The same payload works for round 3, since multiline comments aren't blocked.
On to round 4.

7. Checking `filter.php` shows us the word `admin` is blocked. We can rebuild the word
using concatenation: `ad'||'min'/*`. On to round 5.

8. The same payload works for the last round, and we get the flag: **picoCTF{y0u_m4d3_1t_79a0ddc6}**