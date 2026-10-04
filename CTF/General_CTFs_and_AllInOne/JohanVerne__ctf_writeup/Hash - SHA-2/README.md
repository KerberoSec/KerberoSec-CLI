# Hash: SHA-2

## Challenge

This hash was stolen during a session interception on a critical application, errors may have occurred during transmission. No crack attempt has resulted so far; hash format seems unknown. Find the corresponding plaintext.

The answer is the SHA-1 of this password.

## Solution

En mettant le hash dans le site https://md5decrypt.net/en/Sha256/, on obtient l'erreur "One or several hashes doesn't seem to be valid."

D'après [ce site](https://crypto.stackexchange.com/questions/54231/is-there-a-way-to-tell-if-a-given-string-is-a-sha256-hash), le hash sha256 devrait avoir des valeurs de digits comprisent dans les intervales 0-9 ou a-f.
En supprimant la valeur 'k' du hash, on peut le décrypter et obtenir la valeur 4dM1n
On calcule son sha1 avec https://md5decrypt.net/en/Sha1/

## Flag

a7c9d5a37201c08c5b7b156173bea5ec2063edf9
