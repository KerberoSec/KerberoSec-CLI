## Challenge 🧩

We use our alphabet too frequently, let's try an alternative one

## Solution 🕵️‍♂️

Frequency analysis relies on the fact that in any language, certain letters occur more frequently than others. In English, for example, 'E' is the most common letter, followed by 'T', 'A', 'O', etc. By identifying the most frequent letters in the ciphertext, we can make educated guesses about the key.

After Analyzing for frequency of each letters </br>
V = 75, </br>
P = 72, </br>
S = 44

Since 'E' is the most common letter in English, We can assume V is likely to be a substitution of E and P is likely to be a substitution of T .

Based on this substitution used for each letters
SIBZVAUDRTCNGQEMKOFPLJXYHW

After decrypting

```text
THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. THIS TEXT IS A PANGRAM, WHICH MEANS THAT IT CONTAINS ALL 26 LETTERS OF THE ENGLISH ALPHABET. THIS MAKES IT IDEAL FOR FREQUENCY ANALYSIS, AS THE CRYPTANALYST CAN COMPARE THE FREQUENCY OF LETTERS IN THE CIPHERTEXT TO THE KNOWN FREQUENCY OF LETTERS IN THE ENGLISH LANGUAGE. FOR EXAMPLE, THE MOST COMMON LETTER IN THE ENGLISH LANGUAGE IS E. IF THE MOST COMMON LETTER IN THE CIPHERTEXT IS X, THEN THE CRYPTANALYST CAN ASSUME THAT X IS LIKELY TO BE A SUBSTITUTION FOR E. OTHER COMMON LETTERS IN THE ENGLISH LANGUAGE INCLUDE T, A, O, I, N, S, AND H. THE CRYPTANALYST CAN USE THIS INFORMATION TO MAKE EDUCATED GUESSES ABOUT THE OTHER SUBSTITUTIONS IN THE CIPHERTEXT.

FLAG{NOW_IVE_LEARNED_MY_ABCS}
```

`Tool Used: dCode/monoalphabetic-substitution`

## Flag 🚩

`FLAG{NOW_IVE_LEARNED_MY_ABCS}`
