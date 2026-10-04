## Challenge 🧩

A cursed spell has altered a scroll, changing key letters. Replace the haunted letter with a random one to break the curse!

Given a string, a letter in the string and a random letter, replace all instances of the first letter with the latter.

```
Example

Input

Input String: Test me
Replace: e
Replace with: K

Output

TKst mK
```

## Solution 🕵️‍♂️

```python
n = input()
to_replace = input()
replace_with = input()

answer = n.replace(to_replace,replace_with)

print(answer)
```

## Flag 🚩

`HTB{g0tTa_r3pLacE_th3_sTR1nG!!_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}`
