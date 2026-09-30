# Other

### This file contains writeups for the easier cryptography challenges that have fairly short solutions.

## **Contents**

- [basic-mod1](#basic-mod1---100-pts)
- [basic-mod2](#basic-mod2---100-pts)
- [credstuff](#credstuff---100-pts)
- [morse-code](#morse-code---100-pts)
- [rail-fence](#rail-fence---100-pts)
- [substitution0](#substitution0---100-pts)
- [substitution1](#substitution1---100-pts)
- [substitution2](#substitution2---100-pts)
- [transposition-trial](#substitution2---100-pts)
- [Vigenere](#vigenere---100-pts)

---

# basic-mod1: 100 pts

> We found this weird message being passed around on the servers, we think we have a working decrpytion scheme.
> Download the message here.
> Take each number mod 37 and map it to the following character set: 0-25 is the alphabet (uppercase), 26-35 are the decimal digits, and 36 is an underscore.
> Wrap your decrypted message in the picoCTF flag format (i.e. `picoCTF{decrypted_message}`)

"mod" is short for "modulus", also known as the remainder operator, typically the `%` operator. `x % y` returns the remainder when `x` is divided by `y`. For example, `17 % 3 == 2`.

## Solution

The message:

```py
91 322 57 124 40 406 272 147 239 285 353 272 77 110 296 262 299 323 255 337 150 102
```

Just follow the instructions. Let's write a Python script to speed it up:

```py
import string
message = "91 322 57 124 40 406 272 147 239 285 353 272 77 110 296 262 299 323 255 337 150 102"
alphabet = string.ascii_lowercase + string.digits + "_"
FLAG = "picoCTF{"
for i in message.split():
    FLAG += alphabet[int(i) % 37]
FLAG += "}"
print("Flag:", FLAG)
```

## Flag

> `picoCTF{r0und_n_r0und_add17ec2}`

---

# basic-mod2: 100 pts

> A new modular challenge!
> Download the message here.
> Take each number mod 41 and find the modular inverse for the result. Then map to the following character set: 1-26 are the alphabet, 27-36 are the decimal digits, and 37 is an underscore.
> Wrap your decrypted message in the picoCTF flag format (i.e. `picoCTF{decrypted_message}`)

The modular inverse `B` of `A mod C` is the value of `B` such that `A * B mod C == 1`.

## Solution

Follow the instructions and write a script. One thing to be careful of here is that instead of the indexes going from 0-36 as in basic-mod1, the indexes go from 1 to 37 here. The modular inverse of `A mod C` can be calculated with `pow(A, -1, C)` in Python.

```py
import string
message = "104 290 356 313 262 337 354 229 146 297 118 373 221 359 338 321 288 79 214 277 131 190 377"
alphabet = string.ascii_lowercase + string.digits + "_"
FLAG = "picoCTF{"
for i in message.split():
    FLAG += alphabet[pow(int(i), -1, 41) - 1]
FLAG += "}"
print("Flag:", FLAG)
```

## Flag

> `picoCTF{1nv3r53ly_h4rd_8a05d939}`

---

# credstuff: 100 pts

> We found a leak of a blackmarket website's login credentials. Can you find the password of the user `cultiris` and successfully decrypt it?
> Download the leak here.
> The first user in usernames.txt corresponds to the first password in passwords.txt. The second user corresponds to the second password, and so on.

## Solution

After downloading and decompressing the TAR file, we find two files, `usernames.txt` and `passwords.txt`.

Let's find the line `'cultiris'` appears at in the usernames file:

```r
...
376     affectedruby
377     femininebouquet
378     cultiris
379     satisfieddecide
380     snowboardcompany
...
```

Line 378 in the passwords file reads:

```
cvpbPGS{P7e1S_54I35_71Z3}
```

This is strange, because all the other passwords appear to be base-58 encoding. Doesn't matter though, we have what looks like a rot-13 encoded flag.

If you couldn't tell that it is rot-13, you can either brute-force the substitution, or if you looked closer at the usernames file, you will find a hint:

```r
...
202     shadesearly
203     deeplyparty
204     pico
205     coursemuster
206     adidasbib
...
```

The username `pico` appears in the file. It's corresponding password is `pICo7rYpiCoU51N6PicOr0t13`, which says "try using rot13" in 1337.

On a totally random note, username 165 is `picoiscool`, but its password is just another meaningless base58 password.

Anyways, simply use rot13 to decrypt the flag.

## Flag

> `picoctf{c7r1f_54v35_71m3}`

---

# morse-code: 100 pts

> Morse code is well known. Can you decrypt this?
> Download the file here.
> Wrap your answer with picoCTF{}, put underscores in place of pauses, and use all lowercase.

## Solution

You can use an [online decoder](https://databorder.com/transfer/morse-sound-receiver/) that allows you to upload a file for decrypting. Unfortunately, the online decoders may not be consistent or accurate with their outputs.

I wrote a script to translate the bytes of the file to morse code then to text.
(Scipy's Wavfile had some trouble reading the file, so I did it manually)

```py
MORSE = { 'a':'.-', 'b':'-...', 'c':'-.-.', 'd':'-..', 'e':'.', 'f':'..-.', 'g':'--.', 'h':'....', 'i':'..', 'j':'.---', 'k':'-.-', 'l':'.-..', 'm':'--', 'n':'-.', 'o':'---', 'p':'.--.', 'q':'--.-', 'r':'.-.', 's':'...', 't':'-', 'u':'..-', 'v':'...-', 'w':'.--', 'x':'-..-', 'y':'-.--', 'z':'--..', '1':'.----', '2':'..---', '3':'...--', '4':'....-', '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.', '0':'-----'}
FLAG = "picoCTF{"

file = open("morse_chal.wav", "rb").read()
file = file.split(b"\x00"*60000)
for word in file:
    word = word.split(b"\x00"*30000)
    for letter in word:
        letter = letter.split(b"\x00"*6000)
        coded = ''
        for beep in letter:
            if 5000 < len(beep) < 18000:
                coded += '.'
            elif len(beep) > 23000:
                coded += "-"
        letter = list(MORSE.keys())[list(MORSE
            .values()).index(coded)]
        FLAG += letter
    FLAG += "_"

FLAG = FLAG[:-1] + "}"

print("Flag:", FLAG)
```

## Flag

> `picoCTF{wh47_h47h_90d_w20u9h7}`

---

# rail-fence: 100 pts

> A type of transposition cipher is the rail fence cipher, which is described [here](https://en.wikipedia.org/wiki/Rail_fence_cipher). Here is one such cipher encrypted using the rail fence with 4 rails. Can you decrypt it?
> Download the message here.
> Put the decoded message in the picoCTF flag format, `picoCTF{decoded_message}`.

It's not a bad idea to read the linked article to understand how rail cipher works; it's not too complicated or anything.

## Solution

As with most easy cryptography challenges, an [online decoder](https://cryptii.com/pipes/rail-fence-cipher) will probably suffice.

I took the challenge to script the decrypting process:

```py
MESSAGE = "Ta _7N6DDDhlg:W3D_H3C31N__0D3ef sHR053F38N43D0F i33___NA"
LEN = len(MESSAGE)
RAILS = 4
BLOCKSIZE = 2 * RAILS - 2
BLOCKS = LEN // BLOCKSIZE
EXTRA = BLOCKS % RAILS

rail_cipher = [BLOCKS] * RAILS
rail_cipher[0] = rail_cipher[-1] = BLOCKS

if EXTRA >= RAILS:
    rail_cipher[-1] += 1
elif EXTRA >= 1:
    rail_cipher[0] += 1

for i in range(1, RAILS - 1):
    rail_cipher[i] = 2 * BLOCKS
    if BLOCKSIZE - 1 <= EXTRA:
        rail_cipher[i] += 2
    elif i <= EXTRA:
        rail_cipher[i] += 1

position = 0
for c, i in enumerate(rail_cipher):
    rail_cipher[c] = MESSAGE[position:position + i]
    position += i

FLAG = ""
c1 = 0
c2 = 0
for i in range(BLOCKS + 1):
    try:
        FLAG += rail_cipher[0][c1]
        for j in rail_cipher[1:-1]:
            FLAG += j[c2]
        FLAG += rail_cipher[-1][c1]
        c2 += 1
        rail_cipher.reverse()
        for j in rail_cipher[1:-1]:
            FLAG += j[c2]
        rail_cipher.reverse()
        c1 += 1
        c2 += 1
    except:
        break

print(FLAG)
```

The message decrypts to `The flag is: WH3R3_D035_7H3_F3NC3_8361N_4ND_3ND_D00AFDD3`.

## Flag

> `picoCTF{WH3R3_D035_7H3_F3NC3_8361N_4ND_3ND_D00AFDD3}`

---

# substitution0: 100 pts

> A message has come in but it seems to be all scrambled. Luckily it seems to have the key at the beginning. Can you crack this substitution cipher?

## Solution

As the challenge the decryption alphabet is given at the top of the message: `VOUHMJLTESZCDKWIXNQYFAPGBR`. You can use an [online decoder](https://www.dcode.fr/monoalphabetic-substitution):

```
Hereupon Legrand arose, with a grave and stately air, and brought me the beetle from a glass case in which it was enclosed. It was a beautiful scarabaeus, and, at that time, unknown to naturalists--of course a great prize in a scientific point of view. There were two round black spots near one extremity of the back, and a long one near the other. The scales were exceedingly hard and glossy, with all the appearance of burnished gold. The weight of the insect was very remarkable, and, taking all things into consideration, I could hardly blame jupiter for his opinion respecting it. The flag is: picoCTF{5UB5717U710N_3V0LU710N_357BF9FF}
```

## Flag

> `picoCTF{5UB5717U710N_3V0LU710N_357BF9FF}`

---

# substitution1: 100 pts

> A second message has come in the mail, and it seems almost identical to the first one. Maybe the same thing will work again.

## Solution

This time, the decryption alphabet is not provided. Instead, we can implement a frequency attack. A frequency attack is where one analyzes the number of occurences of certain letters to try to map them back to their original letter. In English, certain letters such as `e` and `t` tend to occur more often than others, while other letters such as `q` and `x` are rarer.

Fortunately, there are many [online decoders](https://www.dcode.fr/monoalphabetic-substitution) that implement frequency attacks for substition ciphers. The decoders may not always be 100% correct: read the decrypted message and see if any letters "stand out" as incorrect. For example, the "Q" in the flag is often incorrectly substituted as "J".

They decryption alphabet turns out to be:

```
FEQNVGIBXLUWAJCPKDRSYZOHTM
```

The decrypted message:

```
CTFs (short for capture the flag) are a type of computer security competition. contestants are presented with a set of challenges which test their creativity, technical (and googling) skills, and problem-solving ability. challenges usually cover a number of categories, and when solved, each yields a string (called a flag) which is submitted to an online scoring service. ctfs are a great way to learn a wide array of computer security skills in a safe, legal environment, and are hosted and played by many security groups around the world for fun and practice. for this problem, the flag is: picoCTF{FR3QU3NCY_4774CK5_4R3_C001_6E0659FB}
```

## Flag

> `picoCTF{FR3QU3NCY_4774CK5_4R3_C001_6E0659FB}`

---

# substitution2: 100 pts

> It seems that another encrypted message has been intercepted. The encryptor seems to have learned their lesson though and now there isn't any punctuation! Can you still crack the cipher?

## Solution

An online decoder will still work for this challenge.

The decryption alphabet:

```
JQWZNXPGCYOBVUSLMAITKERFDH
```

The decrypted message:

```
thereexistseveralotherwellestablishedhighschoolcomputersecuritycompetitionsincludingcyberpatriotanduscyberchallengethesecompetitionsfocusprimarilyonsystemsadministrationfundamentalswhichareveryusefulandmarketableskillshoweverwebelievetheproperpurposeofahighschoolcomputersecuritycompetitionisnotonlytoteachvaluableskillsbutalsotogetstudentsinterestedinandexcitedaboutcomputersciencedefensivecompetitionsareoftenlaboriousaffairsandcomedowntorunningchecklistsandexecutingconfigscriptsoffenseontheotherhandisheavilyfocusedonexplorationandimprovisationandoftenhaselementsofplaywebelieveacompetitiontouchingontheoffensiveelementsofcomputersecurityisthereforeabettervehiclefortechevangelismtostudentsinamericanhighschoolsfurtherwebelievethatanunderstandingofoffensivetechnijuesisessentialformountinganeffectivedefenseandthatthetoolsandconfigurationfocusencounteredindefensivecompetitionsdoesnotleadstudentstoknowtheirenemyaseffectivelyasteachingthemtoactivelythinklikeanattackerpicoctfisanoffensivelyorientedhighschoolcomputersecuritycompetitionthatseekstogenerateinterestincomputerscienceamonghighschoolersteachingthemenoughaboutcomputersecuritytopijuetheircuriositymotivatingthemtoexploreontheirownandenablingthemtobetterdefendtheirmachinestheflagispicoCTF{N6R4M_4N41Y515_15_73D10U5_42EA1770}
```

## Flag

> `picoCTF{N6R4M_4N41Y515_15_73D10U5_42EA1770}`

---

# transposition-trial: 100 pts

> Our data got corrupted on the way here. Luckily, nothing got replaced, but every block of 3 got scrambled around! The first word seems to be three letters long, maybe you can use that to recover the rest of the message.

## Solution

The message:

```
heTfl g as iicpCTo{7F4NRP051N5_16_35P3X51N3_V9AAB1F8}7
```

The first three letters clearly forms the word "The". So the general transposition is (third letter) + (first and second letter). Let's script it:

```py
MESSAGE = "heTfl g as iicpCTo{7F4NRP051N5_16_35P3X51N3_V9AAB1F8}7"

FLAG = ""
for i in range(0, len(MESSAGE), 3):
    FLAG += MESSAGE[i + 2] + MESSAGE[i:i + 2]

print(FLAG)
```

```console
$ python3 solve.py
The flag is picoCTF{7R4N5P051N6_15_3XP3N51V3_A9AFB178}
```

## Flag

> `picoCTF{7R4N5P051N6_15_3XP3N51V3_A9AFB178}`

---

# Vigenere: 100 pts

> Can you decrypt this message? Decrypt this message using this key "CYLAB".

## Solution

The [Vigenere cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher) is a famous cipher that is comprised of several Caesar shifts.

Again, this challenge is easily solvable with an [online decoder](https://www.dcode.fr/vigenere-cipher).

Below is a script:

Each character in the plaintext can be decrypted from the key and ciphertext characters algebraically:

```py
M = C - K
```

```py
import string

MESSAGE = "rgnoDVD{O0NU_WQ3_G1G3O3T3_A1AH3S_2951c89f}"
KEY = "CYLAB" * (len(MESSAGE) // 5 + 1)
FLAG = ""
c = 0
for i in MESSAGE:
    if i in string.digits + "{}_":
        FLAG += i
    else:
        if i in string.ascii_lowercase:
            alphabet = string.ascii_lowercase
            KEY = KEY.lower()
        else:
            alphabet = string.ascii_uppercase
            KEY = KEY.upper()
        FLAG += alphabet[(alphabet.index(i) - alphabet.index(KEY[c])) % 26]
        c += 1
print("Flag:", FLAG)
```

## Flag

> `picoCTF{D0NT_US3_V1G3N3R3_C1PH3R_2951a89h}`
