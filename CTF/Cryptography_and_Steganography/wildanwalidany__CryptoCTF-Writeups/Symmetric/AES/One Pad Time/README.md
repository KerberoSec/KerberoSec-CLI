# One Pad Time

Platform: TCPIPCTF 2023

## Description

> At the wrong place at the wrong time
>*(Author: Wrth)*

two files were attached:
`one_pad_time.py`

## Solution

We know from the source code of the challenge that the padding is done after the encryption. So the plaintext doesn't need any padding to go through the encryption. This means that the plaintext is multiple of 16 (AES block size). The ciphertext then padded to 16 bytes using pkcs7(default). The pkcs7 padding works like this:

![pkcs7](https://tlseminar.github.io/images/paddingoracle/padding.png)

PKCS7 padding adds bytes to the end of the plaintext in such a way that each byte added contains the value of the total number of bytes added. Because the ciphertext has correct padding of 16 bytes, when we pad again the added bytes will 16 bytes of `0x10`.

The hint given was ciphertext xor'ed with the key. So we can retrieve the key back by xor-ing it back with the known plaintext that is the padding at the back. Finally we can get the original ciphertext by xor-ing it with the key and use the key to decrypt the ciphertext.

TODO: retrieve the key
`solver`:

**flag:** `TCP1P{why_did_the_chicken_cross_the_road?To_ponder_the_meaning_of_life_on_the_other_side_only_to_realize_that_the_road_itself_was_an_arbitrary_construct_with_no_inherent_purpose_and_that_true_enlightenment_could_only_be_found_within_its_own_existence_1234}`
