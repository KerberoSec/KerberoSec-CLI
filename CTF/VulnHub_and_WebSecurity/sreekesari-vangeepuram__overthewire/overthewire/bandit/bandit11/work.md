Oh my god! It seems level by level it's getting simpler...
![Bandit11](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit11/level11-%3Elevel12.png)

So, what's this is about? Let's see;
```
bandit11@bandit:~$ ls
data.txt
bandit11@bandit:~$ cat data.txt 
Gur cnffjbeq vf 5Gr8L4qetPEsPk8htqjhRK8XSP6x2RHh
bandit11@bandit:~$ cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
The password is 5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu
bandit11@bandit:~$
```
What's that `tr` thing?
```
Usage: tr [OPTION]... SET1 [SET2]
Translate, squeeze, and/or delete characters from standard input,
writing to standard output.

  -c, -C, --complement    use the complement of SET1
  -d, --delete            delete characters in SET1, do not translate
  -s, --squeeze-repeats   replace each sequence of a repeated character
                            that is listed in the last specified SET,
                            with a single occurrence of that character
  -t, --truncate-set1     first truncate SET1 to length of SET2
      --help     display this help and exit
      --version  output version information and exit

SETs are specified as strings of characters.  Most represent themselves.
Interpreted sequences are:

  \NNN            character with octal value NNN (1 to 3 octal digits)
  \\              backslash
  \a              audible BEL
  \b              backspace
  \f              form feed
  \n              new line
  \r              return
  \t              horizontal tab
  \v              vertical tab
  CHAR1-CHAR2     all characters from CHAR1 to CHAR2 in ascending order
  [CHAR*]         in SET2, copies of CHAR until length of SET1
  [CHAR*REPEAT]   REPEAT copies of CHAR, REPEAT octal if starting with 0
  [:alnum:]       all letters and digits
  [:alpha:]       all letters
  [:blank:]       all horizontal whitespace
  [:cntrl:]       all control characters
  [:digit:]       all digits
  [:graph:]       all printable characters, not including space
  [:lower:]       all lower case letters
  [:print:]       all printable characters, including space
  [:punct:]       all punctuation characters
  [:space:]       all horizontal or vertical whitespace
  [:upper:]       all upper case letters
  [:xdigit:]      all hexadecimal digits
  [=CHAR=]        all characters which are equivalent to CHAR

Translation occurs if -d is not given and both SET1 and SET2 appear.
-t may be used only when translating.  SET2 is extended to length of
SET1 by repeating its last character as necessary.  Excess characters
of SET2 are ignored.  Only [:lower:] and [:upper:] are guaranteed to
expand in ascending order; used in SET2 while translating, they may
only be used in pairs to specify case conversion.  -s uses the last
specified SET, and occurs after translation or deletion.

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/tr>
or available locally via: info '(coreutils) tr invocation'
```
So, translator -> tr, translates the phase-1 into phase2 as `tr <phase-1> <phase-2>`.
It's a really powerfull tool.

But how do we know that here `phase-1='A-Za-z'` and `phase-2='N-ZA-Mn-za-m'`?

Since, we have the hint from the challenge statement as:
`The password for the next level is stored in the file data.txt, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions` 

Rotated by 13 positions?

ROT-13 is a Substitution Cipher which is very common in Cryptology.
We shift the positions of each character is our text[plaintext] to form the cipher-text.

Checkout my repo at: `https://github.com/sreekesari-vangeepuram/ROT13-Substitution-Cipher`
This is a simple Python Application, which encrypts & decrypts the data in a file with ROT13-Cipher.
Hope you understand it better, with it's help!

So, hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `5Te8Y4drgCRfCx8ugdwuEX8KFC6k2EUu` to log into the remote-machine as `bandit12`.

**Warning: Please, first try Level 12 -> Level 13! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
