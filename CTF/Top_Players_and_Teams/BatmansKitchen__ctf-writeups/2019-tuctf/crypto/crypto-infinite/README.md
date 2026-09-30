# Crypto Infinite

This challenge was more programming than crypto. After connecting to the challenge
we're presented with an introductory message, "Level 0", and the prompt "Give me text:"

After sending a line of uppercase text, the service would return the message
"<the text we sent> encrypted is <a space-delineated series of characters>".
The service would then present us with some ciphertext to decrypt.

After sending the service a few test plaintexts and inspecting the corresponding
ciphertexts, it became apparent that level 0 was simply just a substitution cipher.
Since it allows us to send any plaintext, breaking this is trivial: we can send
it the entire alphabet, and get the corresponding substitutions.

After asking us to decrypt 50 ciphertexts, the service gives us a congratulatory
message and announces level 1. Aside from the substitutions changing, I couldn't
tell how level 1 was any different than level 0, and solved it with the same
approach. In fact, the same code that solved level 0 solved all levels up to 5.

On level 5, things got trickier. A single plaintext character no longer mapped
to a single ciphertext string. This could be demonstrated by sending the same
character repeated multiple times consecutively.
```
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA encrypted is |- [.] [ |- [.] |- > [] |-
[.] [ |- [.] |- > [] |- [.] [ |- [.] |- > [] |- [.] [ |- [.] |- > [] |- [.] [ |-
[.] |- > []
```
If you play around with line breaks, a clear pattern emerges:
```
|- [.] [ |- [.] |- > []
|- [.] [ |- [.] |- > []
|- [.] [ |- [.] |- > []
...
```
This is a repeated-key substitution cipher. We can break it with basically the
same method as the regular substition cipher: send it the alphabet to get the
code. Since the keylength was eight characters, we could send 'A' repeated eight
times, followed by 'B' repeated eight times, etc.

Level 6 was the most difficult cipher to break. Treating it like a substitution
cipher didn't work, but sending a line of repeated characters returned a line of
corresponding substitutions. After some trial and error, we realized it was still
a substitution cipher, but with a permutation step at the end: all the characters
got shuffled around. After writing an unshuffler, this problem was once again
reduced to solving substitutions.

The remaining levels were just more of the same: more substitutions and
permutations. The code for the final solution is in `solve.py`.
