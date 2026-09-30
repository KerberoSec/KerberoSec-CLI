# 🔐 (Problem Set 1) "Lets Warm Up" Challenge

### Challenge Description:
- Category: **General Skills**
- Difficulty: **EASY**
- Write-up Date: **5/25/2026**

<img width="1344" height="400" alt="Screenshot 2026-05-25 143819" src="https://github.com/user-attachments/assets/47fe51b7-5150-4264-bc45-5178bddd2236" />

---
### 💡 Solution:

First, we are given `0x70`.

> Computers store information as numbers.<br>
>
>We normally use **"decimal"** or **"base 10"**<br>(0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
>
> But computers often use **"hexadecimal"** or **"base 16"**<br>(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F)
>
> The `0x` prefix just means "hey, this number is hexadecimal" → so, `0x70` just simply means "70 in hexadecimal".
>
> In normal decimal (base 10) numbers, each digit is base 10.<br>For example: 572 → 5 hundreds, 7 tens, and 2 ones → `((5 x 100) + (7 x 10) + (2 x 1)) = 572`
>
> Hexadecimal is pretty much the same, but uses base 16 instead (so powers of 16)!<br>So lets do that to convert `0x70` into decimal.

To convert the hexadecimal `0x70` into decimal, we break the hex 70 apart into digits:<br>
Since hexadecimal is base 16 (powers of 16), we add the powers of 16 to each digit.<br>

`((7 x 16^1) + (0 x 1))`
> 7 is second digit (so multiply 7 to 16 power of 1) and 0 is first digit (so multiply 0 to 1)

`(112) + (0) = 112`

So `0x70` in hexadecimal = `112` in normal decimal!

Next, the problem asks what would that decimal would be in ASCII.

> So, what is **ASCII**?
>
> "ASCII" simply just encodes/maps/converts numbers (0-127) to letters, numbers, punctuation marks, etc)<br>
> For example: The decimal number `65` in translates to the character `A`!

Now, since `112` is between 0-127 (ASCII), we can convert it into a character.<br>

We can just look this up or by using a ASCII converter.<br>

ASCII Converter: https://www.rapidtables.com/convert/number/ascii-hex-bin-dec-converter.html<br>
> Using the website link above, just type in `112` into the "Decimal (bytes)" section, then look at the "ASCII text" section to find the final ASCII conversion!

We did it! 

`112` in decimal = `p` in ASCII text!

Now, since we have the letter, the hint says to wrap it using `picoCTF{ text }`.

So the **final flag** is: `picoCTF{p}`! 🎉

> copy and paste (or manually type) the final flag into the submission area to complete the challenge.

