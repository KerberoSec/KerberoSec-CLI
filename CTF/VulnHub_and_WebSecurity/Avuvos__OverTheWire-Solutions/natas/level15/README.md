# Natas Level 15 -> 16

## Goal

Find the password for natas16.

## Key Concept

Blind SQL Injection

## Solution

Unlike [level 14](../level14), we cannot bypass authentication by returning all rows. Instead, the server provides binary feedback based on whether our query matches any rows:
```php
if(mysqli_num_rows($res) > 0) {
    echo "This user exists.<br>";
} else {
    echo "This user doesn't exist.<br>";
}
```

The base query is:
```php
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
```

The table definition is also provided:
```php
/*
CREATE TABLE `users` (
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL
);
*/
```

This reveals that the `users` table has a `password` column. We can manipulate the SQL query to check if the password for `natas16` matches certain patterns.

The strategy is to build the password character by character using the server's feedback. For example, if we query:
```
natas16" AND BINARY password LIKE 'a%' --
```
and receive "This user exists", we know the password starts with 'a'. We then continue with 'aa', 'ab', etc., until we find the next character.

Since the password character set is finite (lowercase, uppercase, and digits), we can brute force each character position systematically.

### Implementation note

We use `BINARY` in the SQL query to ensure case-sensitive matching, which is important since passwords are case-sensitive. The brute force iterates through all possible characters (`string.ascii_letters + string.digits`) for each position until no match is found, indicating we've reached the end of the password.

`solve.py`

```bash
uv run natas/level15/solve.py
```
