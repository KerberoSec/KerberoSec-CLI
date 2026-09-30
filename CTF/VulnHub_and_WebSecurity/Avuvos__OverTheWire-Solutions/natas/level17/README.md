# Natas Level 17 -> 18

## Goal

Find the password for natas18.

## Key Concept

Time-based Blind SQL Injection

## Solution

Similar to [level 15](../level15), but now the output is completely suppressed:
```php
if(mysqli_num_rows($res) > 0) {
    // echo "This user exists.<br>";
} else {
    // echo "This user doesn't exist.<br>";
}
```

The base query remains the same:
```php
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
```

We can use the same approach from [level 15](../level15), targeting natas18:
```
natas18" AND BINARY password LIKE 'a%' --
```
However, without any visible feedback, we need a different way to detect successful matches. The solution is to use the `SLEEP(x)` function: if our condition is true, the response will be delayed, giving us a time-based indication of a hit.

### Implementation note

We use `IF` in combination with `COUNT(*) > 0` to check for a matching result. Uncomment the print statement to see the response time for each character match.

`solve.py`

```bash
uv run natas/level17/solve.py
```
