## Challenge 🧩

Operator, can you decode this telegram for me? The commander sent it from across enemy lines with my next orders, but it doesn't seem to be using any code book I know of and certainly isn't using any commencement word. Maybe you can figure it out?

HINT: Pemberton was a Confederate general who used the Vigenère cipher.

## Solution 🕵️‍♂️

After translating the morse code

```text
RETRIEVE USE A CODE WE GENERALS TRUE REST VERSION IT HAVE AMERICAN FLAG OF OF APPEARS INTERCEPTED TELEGRAPH SOLDIER ENEMY BE CIPHER TO BACON THE TO PEMBERTON MESSAGE{EOYFPIJPIYBGYNSVSDRPTMIYBJXSEC} ALLIES
```

By using the hint we can solve scrambled word using `MANCHESTERBLUFFCOMPLETEVICTORY` as Key

```text
RETRIEVE USE A CODE WE GENERALS TRUE REST VERSION IT HAVE AMERICAN FLAG OF OF APPEARS INTERCEPTED TELEGRAPH SOLDIER ENEMY BE CIPHER TO BACON THE TO PEMBERTON MESSAGE{SOLDIERWEHAVEINTERCEPTEDTHEENE} ALLIES
```

Rearranging based on guess

```text
SOLDIER WE HAVE INTERCEPTED THE ENEMY TELEGRAPH
THE INTERCEPTED MESSAGE APPEARS TO BE OF ALLIES AMERICAN PEMBERTON GENERALS CIPHER CODE, USE IT!
WE MUST RETRIEVE TRUE VERSION OF IT.
BACON
FLAG{}
```

Did try to submit the `SOLDIERWEHAVEINTERCEPTEDTHEENE` as the flag but it didn't work, So submitted Vigenère Cipher key.

`Tool Used: dCode/vigenere-cipher`

### References

> `en.wikisource.org/wiki/Encrypted_message_to_John_Pemberton,_1863-07-04` </br>
> `cryptiana.web.fc2.com/code/civilwar4.htm`

## Flag 🚩

`FLAG{MANCHESTERBLUFFCOMPLETEVICTORY}`
