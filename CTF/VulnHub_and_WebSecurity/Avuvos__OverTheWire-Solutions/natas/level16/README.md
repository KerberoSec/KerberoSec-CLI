# Natas Level 16 -> 17

## Goal

Find the password for natas17.

## Key Concept

Blind Command Injection via command substitution.

## Solution

Similar to [level 10](../level10), certain characters are blocked:

```php
if(preg_match('/[;|&`\'"]/',$key)) {
    print "Input contains an illegal character!";
}
```

Additionally, our input is trapped inside quotes:

```php
passthru("grep -i \"$key\" dictionary.txt");
```

However, we can still use `$` and `()` for command substitution.

For example, if we enter `secure`:
```
insecure
secure
secured
securely
...
```

But if we enter `secure$(echo d)`, we only get:
```
secured
```

We know the password is at `/etc/natas_webpass/natas17`, so we can use `grep -l` (which prints matching filenames instead of content) inside command substitution to create a blind oracle.

The approach is similar to [level 15](../level15)'s blind attack:

1. Use `grep -l ^a /etc/natas_webpass/natas17` inside command substitution
2. If `a` is the first character, it returns the filename `/etc/natas_webpass/natas17`
3. This gets concatenated with `secured`, making the search term `secured/etc/natas_webpass/natas17`
4. This yields no results (no word contains that string)
5. If `a` is NOT the first character, `grep -l` returns empty, so we search for just `secured`, which yields results

So: **no results = character matches**, **results = character doesn't match**.

We build the password character by character using `^a`, `^ab`, `^abc`, etc.

`solve.py`

```bash
uv run natas/level16/solve.py
```
