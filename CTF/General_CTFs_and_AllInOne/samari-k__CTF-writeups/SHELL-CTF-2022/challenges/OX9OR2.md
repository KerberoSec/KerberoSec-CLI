# OX9OR2

Category: Crypto

---

We got an encrypted message und the encryption function.

So this script generates the encryted file out of a key file and a message file.
Here we can see that the key needs to have a length of 9 and is alphanumeric and that "SHELL" is part of the message.

As xor is reversible, it's easy to write a decryption script on base of the encryption script. I actually just changed some variable names.

But now I still need the key. As we know the flag starts either with `SHELL{` or `SHELLCTF{` and the latter has a length of nine, I decided to use that information to get the key.

The generated key looks a bit strange but I gave it a try.

Nope, that was'n it. Close, but not yet there. So I had to just get a first part of the key and guess the other part (which was pretty straight forward).

That looked good though and was the right flag.
