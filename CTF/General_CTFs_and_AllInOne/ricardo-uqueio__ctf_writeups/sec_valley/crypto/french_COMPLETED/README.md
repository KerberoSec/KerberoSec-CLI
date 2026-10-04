**Challenge:** french<br>
**Level 2**<br>
**Score**: 10 <br>
**Category:** crypto<br><br>
**Description**<br>
 Haha, tu n'y arriveras jamais... this old french men thinks he can troll us. He sends messages and messages again. Show him that you are awesome by breaking the message. Hint: Flag content should be lowercase.

Link: https://github.com/SecurityValley/PublicCTFChallenges/tree/master/crypto/french

**Solution**<br>
I first used [dcode.fr's cipher identifier tool](https://www.dcode.fr/cipher-identifier) to identify the cipher being used. 

`Vigenere Cipher` is the analyzer's top suggestion, so I then used their [vigenere cipher tool](https://www.dcode.fr/vigenere-cipher) which not only allows to decrypt the cipher, but also allows the selection of the plaintext language (the challenge name seems to suggest that it might be in French).

After decrypting, the plaintext, just like the cipher, contains words that are not space separated. It's just a matter of searching for the correct keyword to find the flag.

Since the flag should not be capitalized and still has to be formatted before submitting, I made this cool bash script that converts it to lowercase and correctly formats it for submission:

`echo 'THEFLAGFOUND' | tr A-Z a-z | sed 's/\(.*\)/SecVal\{\1\}/'`

So cool :)

