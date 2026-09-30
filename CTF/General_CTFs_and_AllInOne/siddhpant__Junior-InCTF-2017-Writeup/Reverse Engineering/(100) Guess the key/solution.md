# Guess the key

Catagory | Points | Players solved
---------|--------|---------------
Reverse Engineering | 5 | ???

## Description

???

## Solution

Well, I played with the program and found out it just checks the first character, and then tried some characters and stumbled upon the flag with the input `*`. Wildcard huh? Also the file's name is `single.out`! A single character was needed.

The amusing thing is that when no input is given, it just blurts out the flag with changed case. So it just changes the case of letters when `*` is provided as input. Didn't bother to disassemble it, too much work and also the challenge name contains the word "Guess". :stuck_out_tongue:

![Change of cases heh](https://raw.githubusercontent.com/siddhpant/Junior-InCTF-2017-Writeup/63bf739aefced324bc92a7050303e6974448ba2a/Reverse%20Engineering/(100)%20Guess%20the%20key/lol.png)

Flag == inctf{NewBiE_ReVErSe_EngIneEr}

(Fun fact :- It doesn't contains the 'j' in "inctfj".)
