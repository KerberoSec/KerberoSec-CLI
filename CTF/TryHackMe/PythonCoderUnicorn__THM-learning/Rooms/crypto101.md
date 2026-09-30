
# Encryption 101

- `Ciphertext` The result of encrypting a plaintext, encrypted data
- `Cipher` A modern method of encrypting or decrypting data. 
- `Encryption` Transforming data into ciphertext, using a cipher
- `Encoding` - NOT a form of encryption, just a form of data representation like base64
- `Key` information that is needed to correctly decrypt the ciphertext and obtain the plaintext
- `Passphrase` Separate to the key, used to protect a key
- `Asymmetric encryption` Uses _different keys_ to encrypt and decrypt
- `Symmetric encryption` Uses the same key to encrypt and decrypt
- `Brute force` Attacking cryptography by trying every different password or every different key
- `Cryptanalysis` - Attacking cryptography by finding a weakness in the underlying math

- Modulus operator '%' is important to cryptography

Symmetric encryption uses the same key to encrypt and decrypt the data

- DES _data encryption standard_ from 1970s is **insecure** due to short 56-bit key size
- AES _advanced encryption standard_ in 2001 by NIST and has 128/192/256-bit keys

Asymmetric encryption uses a pair of keys (1 encrypts, 1 decrypts ), the public-private key

- RSA _Rivest-Shamir-Adleman_ public-key cryptosystem from 1970s by British Gov't Communications HQ (GCHQ) that has 2048 to 4096-bit key size
- ECC _Elliptic Curve cryptography_ of 2004 and uses 2048 to 4096-bit keys

## RSA 

RSA is based on a difficult math problem  of working out the factors of a large number, x * y = prime number (easy part) but very hard to know what 2 numbers were used to make that prime number. 

- RSA comes up on CTFs
- tools to defeat RSA CTF challenges:
- https://github.com/RsaCtfTool/RsaCtfTool
- https://github.com/ius/rsatool

The RSA key variables need to know: [p,q,m,n,e,d,c]

- `p` , `q` are large prime numbers
- `n` is product of p and q
- public key = `n` , `e`
- private key = `n` , `d`
- plaintext message `m`
- cipher encrypted message `c`

Greek letter Phi $\Phi$ is the number between 1 and n (the p * q) that are coprime.

ask friend for lock (server public key)
secret (symmetric encryption key) + instructions inside locked box
friend unlocks box with private key & reads message

## Digital Signature 

Digital signatures are a way to prove the authenticity of files, to prove who created or modified them. Using asymmetric cryptography, you produce a signature with your private key and it can be verified using your public key. As only you should have access to your private key, this proves you signed the file.

The simplest form of digital signature would be encrypting the document with your private key, and then if someone wanted to verify this signature they would decrypt it with your public key and check if the files match.

Certificates are also a key use of public key cryptography, linked to digital signatures. A common place where they’re used is for HTTPS.
The answer is certificates. The web server has a certificate that says it is the real tryhackme.com. The certificates have a chain of trust, starting with a root CA (certificate authority). Root CAs are automatically trusted by your device, OS, or browser from install. Certs below that are trusted because the Root CAs say they trust that organisation. Certificates below that are trusted because the organisation is trusted by the Root CA and so on. 

## Encryption and SSH authentication

By default, SSH is authenticated using usernames and passwords in the same way that you would log in to the physical machine.

This uses public and private keys to prove that the client is a valid and authorised user on the server. By default, SSH keys are RSA keys. You can choose which algorithm to generate, and/or add a passphrase to encrypt the SSH key. `ssh-keygen` is the program used to generate pairs of keys most of the time.

You should treat your private SSH keys like passwords. Don’t share them, they’re called private keys for a reason. If someone has your private key, they can use it to log in to servers that will accept it unless the key is encrypted.

It’s very important to mention that the passphrase to decrypt the key isn’t used to identify you to the server at all, all it does is decrypt the SSH key. The passphrase is never transmitted, and never leaves your system.

Using tools like John the Ripper, you can attack an encrypted SSH key to attempt to find the passphrase, which highlights the importance of using a secure passphrase and keeping your private key private.

When generating an SSH key to log in to a remote machine, you should generate the keys on your machine and then copy the public key over as this means the private key never exists on the target machine.

## SSH Keys

The ~/.ssh folder is the default place to store these keys for OpenSSH. The `authorized_keys` file in this directory holds public keys that are allowed to access the server if key authentication is enabled. By default on many distros, key authentication is enabled as it is more secure than using a password to authenticate. Normally for the root user, only key authentication is enabled.
Only the owner should be able to read or write to the private key (600 or stricter).

- `ssh -i keyNameHere user@host`
- ssh keys are a great way to get a reverse shell if user has login enabled
- leaving a ssh key in authorized_keys on a box can be useful backdoor

```
ssh-keygen
id_rsa
<password>
public key in id_rsa.pub
```

## key exchange

Key exchange allows 2 people/parties to establish a set of common cryptographic keys without an observer being able to get these keys. Generally, to establish common symmetric keys.

Diffie Hellman Key Exchange is used with RSA public key cryptography.
Not really a key exchange. `formula: g^a % n`

## PGP & GPG

PGP stands for Pretty Good Privacy. It’s a software that implements encryption for encrypting files, performing digital signing and more.

GnuPG or GPG is an Open Source implementation of PGP from the GNU project. You may need to use GPG to decrypt files in CTFs. With PGP/GPG, private keys can be protected with passphrases in a similar way to SSH private keys. If the key is passphrase protected, you can attempt to crack this passphrase using John The Ripper and gpg2john. The key provided in this task is not protected with a passphrase

Advanced Encryption Standard. It was a replacement for DES which had short keys and other cryptographic flaws.

1. download GPG.zip 
2. extract 2 files
3. upload files to VM
4. `gpg --import tryhackme.key`
5. `gpg -d message.gpg`

## Future

AES with 128 bit keys is also likely to be broken by quantum computers in the near future, but 256 bit AES can’t be broken as easily. Triple DES is also vulnerable to attacks from quantum computers.

The NSA recommends using RSA-3072 or better for asymmetric encryption and AES-256 or better for symmetric encryption. There are several competitions currently running for quantum safe cryptographic algorithms, and it’s likely that we will have a new encryption standard before quantum computers become a threat to RSA and AES.

## Reference

- [Wiki: Alice & Bob cryptography](https://en.wikipedia.org/wiki/Alice_and_Bob)
- [Wiki: DES encrypion](https://en.wikipedia.org/wiki/Data_Encryption_Standard)
- [Wiki: AES encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
- [Wiki: RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem))
- [Wiki: Elliptic curve](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)
- [Wiki: Diffie-Hellman key exchange](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
- [GPG man page](https://www.gnupg.org/gph/de/manual/r1023.html)
- 

