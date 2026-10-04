# 🔐 (Problem Set 1) "2Warm" Challenge

### Challenge Description:
- Category: **General Skills**
- Difficulty: **EASY**
- Write-up Date: **5/26/2026**

<img width="945" height="225" alt="image" src="https://github.com/user-attachments/assets/b8d7cc54-ddca-4fce-9174-179379340bf0" />

---
### 💡 Solution:

We are given the decimal number `42` (base 10, or normal number) and asked to just convert it into binary.

> Binary only uses 1s and 0s.
>
> Binary also uses powers of 2 for each place (thats why its called base 2) → ... 64, 32, 16, 8, 4, 2, 1

First step, we find the biggest power of 2 that is less than or equal to our given number `42`

lets start with 64 → too big because 64 is greater than `42` ❌

after 64 is 32, so we do 32 next. → 32 is less than 42! ✔️ 

> Since 32 works, we start with 32! 

Second step, we subtract 32 from 42 → `42 - 32` = 10

> We mark 32 as used! → that becomes `1` in binary.

Third step, we find the next biggest power that is less than or equal to 10.

... that would be 8! (8 < 10, and 16 would not work) ✔️

> Since 8 works, we start with 8!

Subtract 8 from 10 → `10 - 8` = 2

> we mark 8 as used! → that becomes `1` in binary, then since we skipped 16, it becomes `0` in binary.

Fourth step, we find the next biggest power that is less than or equal to 2.

... that would be 2! (2 <= 2, and 4 would not work) ✔️

> Since 2 works, we start with 2!

Subtract 2 from 2 → `2 - 2` = 0.

> We mark 2 as used! → that becomes `1` in binary, then since we skipped 4, it becomes `0` in binary.

We're done since we at 0. Anything not used becomes 0. 

Final step, we just fill out all the place values:
```
32 16 8 4 2 1
 1  0 1 0 1 0
```

Yay! Answer: 42 (base 10 or decimal) → 101010 (base 2 or binary)

Now, since we have the final conversion, the hint says to wrap it using `picoCTF{ text }`.

So the **final flag** is: `picoCTF{101010}`! 🎉

> copy and paste (or manually type) the final flag into the submission area to complete the challenge.

