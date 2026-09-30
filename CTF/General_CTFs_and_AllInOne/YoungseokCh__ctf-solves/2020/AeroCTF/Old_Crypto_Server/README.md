# Old_Crypto_Server

* Crypto(100)

It was a simple ECB attack challenge. The description said:

> The form of the flag is `Aero{[a-f0-9][32][*]}`

And the server provides ECB encryption oracle which encrypts `input + flag` with secret key.

ECB encrypts block by block with length 16.

To get the first character, put `aaaaaaaaaaAero{X` and `aaaaaaaaaa` into the encryption oracle input and compare the result (X is guessing character, which is `a-f0-9`). If the first blocks of the outputs are same, then X is right. Therefore I got `X=5`.

To get the second character, put `aaaaaaaaaAero{5X` and `aaaaaaaaa` and do the same thing. Then I got `X=0`.

Doing this inductively, I captured `Aero{5013a76ed3b98bae1e79169b3495f47a}`.