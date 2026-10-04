# Challenge: PW Crack 2
**Category:** General Skills | **Difficulty:** Easy | **Author:** LT 'syreal' Jones

## Challenge Description
"Can you crack the password to get the flag? Download the password checker here and you'll need the encrypted flag in the same directory too."

This challenge involves performing static analysis on a Python script to reverse a simple character-encoding obfuscation used for password protection.

## Analysis & Solution
The challenge provides two files: the Python script `level2.py` and the encrypted data `level2.flag.txt.enc`. By examining the source code of `level2.py`, we can identify the authentication mechanism.

The function `level_2_pw_check()` contains the following conditional statement:
```python
if( user_pw == chr(0x34) + chr(0x65) + chr(0x63) + chr(0x39) ):
```

The `chr()` function in Python returns the string representing a character whose Unicode code point is the integer passed to it. We can decode the hexadecimal values to find the required password:
* `chr(0x34)` evaluates to **4**.
* `chr(0x65)` evaluates to **e**.
* `chr(0x63)` evaluates to **c**.
* `chr(0x39)` evaluates to **9**.

The combined password is **`4ec9`**.

### Execution Step
I executed the script using `python3 level2.py`. When prompted for the password, I entered `4ec9`. The script validated the input, called the `str_xor` function to decrypt `level2.flag.txt.enc`, and printed the flag.
<div align="center">
  *[Image: PW Crack 2 Execution]*
  <br>
  <em>Figure 1: Executing level2.py and providing the decoded password to reveal the flag.</em>
</div>

## 🚩 Final Flag
<details>
  <summary>Click to reveal the flag</summary>

`picoCTF{tr45h_51ng1ng_9701e681}`
</details>

## Key Takeaways
* **Static Analysis:** Reading the source code often reveals the exact logic used for authentication, making it easier to bypass simple checks.
* **Obfuscation vs. Security:** Replacing plain text with hexadecimal character codes (obfuscation) does not provide actual security; it only slightly hinders human readability.
* **Python REPL:** You can quickly solve these challenges by pasting the password logic directly into a Python interpreter to see the output.
