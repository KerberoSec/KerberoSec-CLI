# Natas Level 14 -> 15

## Goal

Find the password for natas15.

## Key Concept

SQL Injection

## Solution

The server performs a SQL query to authenticate users without validating input:
```php
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\"";
```

This vulnerability allows us to perform SQL injection. By injecting `" OR 1=1 -- ` into the username field, we can bypass authentication:
- The `"` closes the username string
- `OR 1=1` makes the condition always true
- `-- ` comments out the rest of the query (including the password check)

Additionally, the server has a debug mode that can be activated with a query parameter:
```php
if(array_key_exists("debug", $_GET)) {
    echo "Executing query: $query<br>";
}
```
This is useful for seeing the exact query being executed. We can activate it by adding `params = {"debug": 1}` to our request.

### Implementation note

The space after the `--` is crucial: without it, the SQL comment won't work properly!

`solve.py`

```bash
uv run natas/level14/solve.py
```
