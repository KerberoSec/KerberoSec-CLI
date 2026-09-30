# Cryptography

## Hashing: Crypto 101

### What is a hash function?

A hash function is a mathematical function performed on a piece of data of any size that 
transforms it into a hash of a fixed size. It is nearly impossible to go from output to
input

### What is a hash collision?

Hash collision is when 2 different inputs give the same output. Due to the pigeonhole 
effect, collisions are not avoidable. The pigeonhole effect is basically, there are a set 
number of different output values for the hash function, but you can give it any size 
input. As there are more inputs than outputs, some of the inputs must give the same output. 
If you have 128 pigeons and 96 pigeonholes, some of the pigeons are going to have to share.

### Uses for hashing

2 main purposes in Cybersecurity:
1. Verify integrity of data
2. Storing passwords

Instead of storing passwords we can store hashes instead, when we enter our password it is 
hashed and compared with the stored value.

Salting a hash is a way of protecting against duplicate passwords and Rainbow tables. Each 
user is given a unique salt that is added to the start or end of the password before hashing

### Recognising password hashes

Unix style password hashes use a prefix, the standard format is `$format$rounds$salt$hash`

Windows passwords use NTLM, a variant of md4. They're visually identical to md4 and md5 
hashes.

On Linux hashes are stored in /etc/shadow and on Windows they're stored in the SAM

Unix style password prefixes:

Prefix : Algorithm
`$1$` : md5crypt, used in Cisco stuff and older Linux/Unix systems
`$2$, $2a$, $2b$, $2x$, $2y$` : Bcrypt (Popular for web applications)
`$6$` : sha512crypt (Default for most Linux/Unix systems)

Example hashes here:
[Hashes](https://hashcat.net/wiki/doku.php?id=example_hashes)

### Password cracking

Use GPU vs CPU, better equipped although some hashing algorithms (bcrypt) are designed so 
that hashing on a GPU is about the same speed as on CPU

Crackstation, hashes.com, hashcat and John the ripper are hash cracking tools

### Hashing for integrity checking

Integrity Checking

Hashing can be used to check that files haven't been changed. If you put the same data in, 
you always get the same data out. If even a single bit changes, the hash will change a lot. 
This means you can use it to check that files haven't been modified or to make sure that 
they have downloaded correctly. You can also use hashing to find duplicate files, if two 
pictures have the same hash then they are the same picture.

HMACs

HMAC is a method of using a cryptographic hashing function to verify the authenticity and 
integrity of data. The TryHackMe VPN uses HMAC-SHA512 for message authentication, which you 
can see in the terminal output. A HMAC can be used to ensure that the person who created 
the HMAC is who they say they are (authenticity), and that the message hasn’t been modified 
or corrupted (integrity). They use a secret key, and a hashing algorithm in order to 
produce a hash.

## John The Ripper

### Cracking basic hashes

Supply the format to john after identification of hash type with hash-identifier or 
https://hashes.com/en/tools/hash_identifier

### Cracking Windows Authentication Hashes

Modern Windows OS auth hashes use NTHash/NTLM (NT in john)

### Cracking /etc/shadow Hashes

Use `unshadow /etc/passwd /etc/shadow` to generate a string for john to crack /etc/shadow 
hashes. Can also just use the user's line from /etc/passwd and from /etc/shadow

### Single Crack Mode

Gecos fields are separated by `:` and can be found in /etc/passwd and /etc/shadow

Word mangling, building a custom wordlist from modified variations of a username (joker, 
joker1, Jok3r, j0ker, J0k3r, joker!, joker*, etc.)

Use `--single` and prepend the username to the hash separated by `:` 
`<username>:<hash>`

### Custom Rules

Wiki here: https://www.openwall.com/john/doc/RULES.shtml

Define a rule: `[List.Rules:<Rule Name Here>]`

Insert string STR at position N: AN"STR"
Append a string: Az
Prepend a string: A0
Capitalise: c

### Cracking Password Protected Zip Files

Use zip2john to generate a hash format john understands then pass the hash to john as we 
would a normal hash

`zip2john <Options> <ZipFile> > <OutputFileName>`

### Cracking Password Protected RAR Archives

Use rar2john as with zip2john

### Cracking SSH Keys with John

Use ssh2john as with rar2john and zip2john

## Encryption: Crypto 101

### Key terms

Ciphertext: the result of encrypting a plaintext; encrypted data.

Cipher: A method of encrypting or decrypting data. Modern ciphers are cryptographic, but
there are many non cryptographic ciphers like Caesar.

Plaintext: Data before encryption. Can be any file type.

Encryption: Transforming data into ciphertext, using a cipher.

Encoding: NOT a form of encryption, just a form of data representation. Immediately 
reversible.

Key: Some information that is needed to correctly decrypt the ciphertext to obtain the 
plaintext.

Passphrase: Separate to the key, a passphrase is similar to a password and is used to 
protect the key.

Asymmetric encryption: Uses different keys to encrypt and decrypt.

Symmetric encryption: Uses the same key to encrypt and decrypt.

Brute force: Attacking cryptography by trying every different password or passphrase.

Cryptanalysis: Attacking cryptography by finding a weakness in the underlying maths.

### Why is Encryption important?

Cryptography is used to protect confidentiality, ensure integrity, ensure authenticity
(CIA):

- encrypted credentials for logging in to websites/services
- SSH using an encrypted tunnel so no one can snoop on your session
- webserver authentication with certificates
- verification of downloaded data with a checksum

### Crucical Crypto Maths

Modulo operator %

Modulo is not reversible

### Types of Encryption

Symmetric encryption: Uses same key to encrypt and decrypt. Examples of symmetric 
encryption are AES and DES (Broken). These algorithms tend to be faster and use smaller 
keys (128 or 256 bit keys are common for AES, DES 56) than asymmetric encryption.

Assymetric encryption: Uses a pair of keys, one to encrypt and another to decrypt. Examples
are RSA and Elliptic Curve Cryptography. The keys are normally referred to as private and 
public. Data encrypted with the private key can be decrypted with the public and vice 
versa. Asymmetric encryption tends to be slower and uses larger keys, for example RSA 
typically uses 2048 to 4096 bit keys.

RSA and Elliptic Curve cryptography are based around different mathematically difficult 
(intractable) problems, which give them their strength.

### RSA: Rivest Shamir Adleman

Math side

Based on the mathematically difficult problem of working out the factors of a large number.
It's very quick to multiply two prime numbers but it's quite difficult to work out what 
two prime numbers multiply together to make 14351 (113 x 127)

Attacking side

Tools: https://github.com/Ganapati/RsaCtfTool https://github.com/ius/rsatool

Key variables in ctf's: p, q, m, n, e, d, c

p & q are large prime numbers
n is the product of p & q
the public key n & e, the private key n & d
c is the ciphertext and m is the plaintext message

### Establishing Keys using Asymmetric Cryptography

A common use of asymmetric cryptography is exchanging keys for symmetric encryption.

Send a symmetric encryption key signed with the server's public key which can be unlocked 
with the server's private key (keys are asymmetric)

HTTPS: Hello, Certificate Exchange, Key Exchange:

1. Hello: The handshake begins with the client sending a ClientHello message. This 
contains all the information the server needs in order to connect to the client via SSL, 
including the various cipher suites and maximum SSL version that it supports. The server 
responds with a ServerHello, which contains similar information required by the client, 
including a decision based on the client’s preferences about which cipher suite and 
version of SSL will be used.

2. Certificate Exchange: Now that contact has been established, the server has to prove 
its identity to the client. This is achieved using its SSL certificate, which is a very 
tiny bit like its passport. An SSL certificate contains various pieces of data, including 
the name of the owner, the property (eg. domain) it is attached to, the certificate’s 
public key, the digital signature and information about the certificate’s validity dates. 
The client checks that it either implicitly trusts the certificate, or that it is verified 
and trusted by one of several Certificate Authorities (CAs) that it also implicitly 
trusts. Much more about this shortly. Note that the server is also allowed to require a 
certificate to prove the client’s identity, but this typically only happens in very 
sensitive applications.

3. Key Exchange: The encryption of the actual message data exchanged by the client and 
server will be done using a symmetric algorithm, the exact nature of which was already 
agreed during the Hello phase. A symmetric algorithm uses a single key for both encryption 
and decryption, in contrast to asymmetric algorithms that require a public/private key 
pair. Both parties need to agree on this single, symmetric key, a process that is 
accomplished securely using asymmetric encryption and the server’s public/private keys.

### Digital signatures and Certificates

What's a Digital Signature?

Digital signatures are a way to prove the authenticity of files, to prove who created or 
modified them. Using asymmetric cryptography, you produce a signature with your private 
key and it can be verified using your public key. As only you should have access to your 
private key, this proves you signed the file. Digital signatures and physical signatures 
have the same value in the UK, legally.

The simplest form of digital signature would be encrypting the document with your private 
key, and then if someone wanted to verify this signature they would decrypt it with your 
public key and check if the files match.

Certificates: Prove who you are!

Certificates are also a key use of public key cryptography, linked to digital signatures. 
A common place where they’re used is for HTTPS. How does your web browser know that the 
server you’re talking to is the real tryhackme.com?

The answer is certificates. The web server has a certificate that says it is the real 
tryhackme.com. The certificates have a chain of trust, starting with a root CA (
certificate authority). Root CAs are automatically trusted by your device, OS, or browser 
from install. Certs below that are trusted because the Root CAs say they trust that 
organisation. Certificates below that are trusted because the organisation is trusted by 
the Root CA and so on. There are long chains of trust. Again, this blog post explains this 
much better than I can. https://robertheaton.com/2014/03/27/how-does-https-actually-work/

You can get your own HTTPS certificates for domains you own using Let’s Encrypt for free. 
If you run a website, it’s worth setting it up.

### SSH Authentication

- generate keys with `ssh-keygen`
- add public keys to `.ssh/authorized_keys` for ssh access

Using SSH keys to get a better shell:
Generate a key on the target machine or copy over a public key then add public key to 
`.ssh/authorized_keys` file then ssh to target with private key 

### Explaining Diffie Hellman Key Exchange

How does Diffie Hellman Key Exchange work?

Alice and Bob want to talk securely. They want to establish a common key, so they can use 
symmetric cryptography, but they don’t want to use key exchange with asymmetric 
cryptography. This is where DH Key Exchange comes in.

Alice and Bob both have secrets that they generate, let’s call these A and B. They also 
have some common material that’s public, let’s call this C.

We need to make some assumptions. Firstly, whenever we combine secrets/material it’s 
impossible or very very difficult to separate. Secondly, the order that they're combined 
in doesn’t matter.

Alice and Bob will combine their secrets with the common material, and form AC and BC. 
They will then send these to each other, and combine that with their secrets to form two 
identical keys, both ABC. Now they can use this key to communicate.

DH Key Exchange is often used alongside RSA public key cryptography, to prove the identity 
of the person you’re talking to with digital signing. This prevents someone from attacking 
the connection with a man-in-the-middle attack by pretending to be Bob.

Good visual explanation here: https://www.youtube.com/watch?v=NmM9HA2MQGI

### PGP, GPG and AES

PGP: pretty good privacy, software that implements encryption for encrypting files, 
performing digital signing and more

GPG: GnuPG or GPG is an onpen source implementation of PGP from the GNU project. You may 
need to use GPG to decrypt files in CTFs. With PGP/GPG, private keys can be protected with 
passphrases in a similar way to SSH private keys. If the key is passphrase protected, you 
can attempt to crack this passphrase using John The Ripper and gpg2john.

AES: AES sometimes called Rijndael after it's creators, stands for Advanced Encryption 
Standard. It was a replacement for DES which had short keys and other cryptographic flaws.

AES and DES both operate on blocks of data (a block is a fixed size of bits).

Video to learn more about AES: https://www.youtube.com/watch?v=O4xNJsjtN6E

### The Future: Quantum Computers and Encryption

Quantum computers will soon be a problem for many types of encryption.
Asymmetric and Quantum

While it’s unlikely we’ll have sufficiently powerful quantum computers until around 2030, 
once these exist encryption that uses RSA or Elliptical Curve Cryptography will be very 
fast to break. This is because quantum computers can very efficiently solve the 
mathematical problems that these algorithms rely on for their strength.

AES/DES and Quantum

AES with 128 bit keys is also likely to be broken by quantum computers in the near future, 
but 256 bit AES can’t be broken as easily. Triple DES is also vulnerable to attacks from 
quantum computers.

Current Recommendations

The NSA recommends using RSA-3072 or better for asymmetric encryption and AES-256 or 
better for symmetric encryption. There are several competitions currently running for 
quantum safe cryptographic algorithms, and it’s likely that we will have a new encryption 
standard before quantum computers become a threat to RSA and AES.

Learn More about Quantum Computers and Cryptography

If you’d like to learn more about this, NIST has resources that detail what the issues 
with current encryption is and the currently proposed solutions for these. 
https://doi.org/10.6028/NIST.IR.8105

I also recommend the book "Cryptography Apocalypse" By Roger A. Grimes, as this was my 
introduction to quantum computing and quantum safe cryptography.
