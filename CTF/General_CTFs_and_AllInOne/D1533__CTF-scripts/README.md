## CTF Scripts

This repository contains solution scripts for CTF challenges from various platforms and competitions.

## Contents

## CryptoPals

| Challenge                                                                             | Set   | Script                                            |
|---------------------------------------------------------------------------------------|-------|---------------------------------------------------|
| 01. Convert hex to base64                                                             | Set 1 |`challenge_01.py` |
| 02. Fixed XOR                                                                         | Set 1 |`challenge_02.py` |
| 03. Single-byte XOR cipher                                                            | Set 1 |`challenge_03.py` |
| 04. Detect single-character XOR                                                       | Set 1 |`challenge_04.py` |
| 05. Implement repeating-key XOR                                                       | Set 1 |`challenge_05.py` |
| 06. Break repeating-key XOR                                                           | Set 1 |`challenge_06.py` |
| 07. AES in ECB mode                                                                   | Set 1 |`challenge_07.py` |
| 08. Detect AES in ECB mode                                                            | Set 1 |`challenge_08.py` |
| 09. Implement PKCS#7 padding                                                          | Set 2 |`challenge_09.py` |
| 10. Implement CBC mode                                                                | Set 2 |`challenge_10.py` |
| 11. An ECB/CBC detection oracle                                                       | Set 2 |`challenge_11.py` |
| 12. Byte-at-a-time ECB decryption (Simple)                                            | Set 2 |`challenge_12.py` |
| 13. ECB cut-and-paste                                                                 | Set 2 |`challenge_13.py` |
| 14. Byte-at-a-time ECB decryption (Harder)                                            | Set 2 |`challenge_14.py` |
| 15. PKCS#7 padding validation                                                         | Set 2 |`challenge_15.py` |
| 16. CBC bitflipping attacks                                                           | Set 2 |`challenge_16.py` |
| 17. The CBC Padding oracle                                                            | Set 3 |`challenge_17.py` |
| 18. Implement CTR, the stream cipher mode                                             | Set 3 |`challenge_18.py` |
| 33. Implement Diffie-Hellman                                                          | Set 5 |`challenge_33.py` |
| 34. Implement a MITM key-fixing attack on DH with parameter injection                 | Set 5 |`challenge_34.py` |
| 35. Implement DH with negotiated groups, and break with malicious "g"                 | Set 5 |`challenge_35.py` |
| 36. Implement Secure Remote Password (SRP)                                            | Set 5 |`challenge_36.py` |
| 37. Break SRP with a zero key                                                         | Set 5 |`challenge_37.py` |
| 39. Implement RSA                                                                     | Set 5 |`challenge_39.py` |
| 40. Implement an E=3 RSA Broadcast attack                                             | Set 5 |`challenge_40.py` |
| 41. Implement unpadded message recovery oracle                                        | Set 6 |`challenge_41.py` |
| 42. Bleichenbacher's e=3 RSA Attack                                                   | Set 6 |`challenge_42.py` |
| 43. DSA key recovery from nonce                                                       | Set 6 |`challenge_43.py` |
| 44. DSA nonce recovery from repeated nonce                                            | Set 6 |`challenge_44.py` |
| 45. DSA parameter tampering                                                           | Set 6 |`challenge_45.py` |
| 46. RSA parity oracle                                                                 | Set 6 |`challenge_46.py` |

---

## Hack The Box 

### Crypto

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| Alpashcii Clashing    | crypto   | `alphascii_clashing.py`              | MD5 hash collision                                                |
| Ancient Encodings     | crypto   | `ancient_encodings.py`                | Base64, hex encodings                                             |
| Android in the Middle | crypto   | `android_in_the_middle.py`        | Diffie-Hellman, choosen public key attack                         |
| Arranged              | crypto   | `arranged.py`                                  | ECC, small subgroup discrete log                                  |
| Baby quick maffs      | crypto   | `baby_quick_maffs.py`                  | Modular arithmetic, equation manipulation                         |
| Binary basis          | crypto   | `binary_basis.py`                          | RSA, Multiple primes encoding                                     |
| Brainy's Cipher       | crypto   | `brainys_cipher.py`                      | RSA, Chinese Remainder Theorem                                    |
| Brevi Moduli          | crypto   | `brevi_moduli.py`                          | RSA, Small modulus factorization                                  |
| Composition           | crypto   | `composition.py`                            | ECC, RSA, AES, CRT, fermat factorization, curve parameter recovery| 
| Digital Safety Annex  | crypto   | `digital_safety_annex.py`          | DSA, Nonce $k$ brute force                                        |
| Fast Carmichael       | crypto   | `fast_carmichael.py`                    | Carmichael numbers, find the paper challenge                      |
| Flippin Bank          | crypto   | `flippin_bank.py`                          | AES, flipping bit attack                                          |
| Gonna lift em all     | crypto   | `gonna_lift_em_all.py`                | ElGamal, implementation flaw                                      |
| Hidden Handshake      | crypto   | `hidden_handshake.py`                  | AES CTR, known plaintext attack                                   |
| Infinite Descent      | crypto   | `infinite_descent.py`                  | RSA, fermat prime factorization                                   |
| Initialization        | crypto   | `initialization.py`                      | AES CTR, known plaintext attack                                   |
| Lost Key              | crypto   | `lostkey.py`                                    | ECC, curve parameters recovery, Pohlig-Hellman                    |
| Lost Modulus          | crypto   | `lost_modulus.py`                          | RSA, small exponent without message padding                       |
| Lost Modulus Again    | crypto   | `lost_modulus_again.py`              | RSA, Coppersmith's short pad attack                               |
| LunaCrypt             | crypto   | `lunacrypt.py`                                | Custom cipher, reverse bitwise operations                         |
| Nuclear Sale          | crypto   | `nuclear_sale.py`                          | .pcap analysis                                                    |
| Optimus Prime         | crypto   | `optimus_prime.py`                        | RSA, shared prime on different keys, GCD attack                   |
| Quadratic Points      | crypto   | `quadratic_points.py`                  | Integer polynomial coefficients recovery, ECC discrete log, CRT   |
| RLotto                | crypto   | `rlotto.py`                                      | PRNG, time seed                                                   |
| Rookie Mistake        | crypto   | `rookie_mistake.py`                      | RSA, implementation fault                                         |
| RsaCtfTool            | crypto   | `rsa_ctf_tool.py`                          | RSA, AES, Euler totient function properties                       |
| Secure Signing        | crypto   | `secure_signing.py`                      | SHA256, byte at a time oracle attack                              |
| Sekur Julius          | crypto   | `sekur_julius.py`                          | Caesar cipher brute force                                         |
| SPG                   | crypto   | `spg.py`                                            | AES, weak random key recovery                                     |
| Spooky RSA            | crypto   | `spooky_rsa.py`                              | RSA, encrypted prime, GCD attack                                  |
| Sugar Free Candies    | crypto   | `sugar_free_candies.py`              | Integer equation system                                           |
| Symbols               | crypto   | `symbols.py`                                    | Legendre symbol                                                   |
| Two for One           | crypto   | `two_for_one.py`                            | RSA, polynomial gcd, Franklin-reiter attack                       |
| Weak RSA              | crypto   | `weak_rsa.py`                                  | RSA, small $d$, Wiener Attack                                     |

### Pwn

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| Assemblers Avenge     | pwn      | `assemblers_avenge.py`                   | Shellcode                                                         |
| Bad grades            | pwn      | `bad_grades.py`                                 | Libc addr leakage, ROP, stack aligment, float encoding            |                                       
| Bat Computer          | pwn      | `bat_computer.py`                             | ret2shellcode                                                     |             
| Blacksmith            | pwn      | `blacksmith.py`                                 | shellcode                                                         |
| Blessing              | pwn      | `blessing.py`                                     | heap, malloc abuse                                                |
| El Mundo              | pwn      | `el_mundo.py`                                     | ret2win noob tutorial                                             |
| El Teteo              | pwn      | `el_teteo.py`                                     | shellcode                                                         |
| Entity                | pwn      | `entity.py`                                         | C code understanding (union, int to bytes)                        |
| Fleet Management      | pwn      | `fleet_management.py`                     | Shellcode, seccomp sandbox                                        |
| Format                | pwn      | `format.py`                                         | Format String, malloc hook, PIE leak, libc leak, libc version identification |
| Getting Started       | pwn      | `getting_started.py`                       | Buffer Overflow tutorial                                          |
| Great Old Talisman    | pwn      | `great_old_talisman.py`                 | GOT overwrite                                                     |
| Hellhound             | pwn      | `hellhound.py`                                   | Heap, house of spirit, fake heap chunk construction               |
| Hunting               | pwn      | `hunting.py`                                       | egg hunting, shellcode x86                                        |
| HTB Console           | pwn      | `htb_console.py`                               | ROP                                                               |
| Jeeves                | pwn      | `jeeves.py`                                         | Buffer Overflow                                                   |
| Laconic               | pwn      | `laconic.py`                                       | SROP                                                              |
| Leet Test             | pwn      | `leet_test.py`                                   | Format string, stack read, global write                           |
| Mathematricks         | pwn      | `mathematricks.py`                           | Integer overflow                                                  |
| Nightmare             | pwn      | `nightmare.py`                                   | Format string, PIE leak, libc leak, GOT overwrite                 |
| Optimistic            | pwn      | `optimistic.py`                                 | ret2shellcode, constrained shellcode                              |
| Power Greed           | pwn      | `power_greed.py`                               | ROP, ret2libc                                                     |
| Que onda              | pwn      | `que_onda.py`                                     | pwntools noob tutorial                                            |
| Quack Quack           | pwn      | `quack_quack.py`                               | printf canary leak, ret2win                                       |
| Racecar               | pwn      | `racecar.py`                                       | Format string, leak stack                                         |
| Reconstruction        | pwn      | `reconstruction.py`                         | shellcode                                                         |
| Reg                   | pwn      | `reg.py`                                               | Buffer Overflow                                                   |
| Regularity            | pwn      | `regularity.py`                                 | ret2reg/ret2shellcode                                             |
| Rocket Blaster XXX    | pwn      | `rocket_blaster_xxx.py`                 | ROP, stack alignment                                              |
| Shooting star         | pwn      | `shooting_star.py`                           | ROP, libc leak, ret2libc, libc version identification             |
| Sick ROP              | pwn      | `sick_rop.py`                                     | Sigreturn-Oriented Programming (SROP)                             |
| Sound of Silence      | pwn      | `sound_of_silence.py`                     | Buffer Overflow                                                   |
| Space                 | pwn      | `space.py`                                           | x86 Shellcode, limited shellcode size                             |
| Space pirate: Entrypoint|pwn     | `space_pirate_entrypoint.py`       | Format strings, write to stack variable                           |
| Space pirate: Going Deeper| pwn  | `space_pirate_going_deeper.py`   | Buffer Overflow                                                   |
| Space pirate: Retribution| pwn    | `space_pirate_retribution.py`    | PIE leak, libc leak, ROP, ret2libc                                |
| Spooky Time           | pwn      | `spooky_time.py`                               | PIE leak, libc leak, GOT overwrite                                |
| Trick or Deal         | pwn      | `trick_or_deal.py`                           | PIE leak, heap, UAF (Use-After-Free)                              |
| Vault-breaker         | pwn      | `vault_breaker.py`                           | strcpy, null byte ending string, byte at a time                   |
| Void                  | pwn      | `void.py`                                             | ret2dlresolve                                                     |
| What does the f say?  | pwn      | `what_does_the_f_say.py`               | Format string, ROP, PIE leak, libc leak, canary leak, libc version identification|
| Writing on the Wall   | pwn      | writing_on_the_wall                  | Null byte ending strings                                          |

---

## PicoCTF

### PicoCTF-2019

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| 13                    | crypto   | `13.py`                             | rot13                                                             |
| b00tle3gRSA2          | crypto   | `b00tl3gRSA2.py`           | wiener attack                                                     |
| b00tl3gRSA3           | crypto   | `b00tl3gRSA3.py`           | RSA, multiple primes key                                          |
| caesar                | crypto   | `caesar.py`                     | Caesar brute force                                                |
| john_pollard          | crypto   | `john_pollard.py`         | RSA, small N                                                      |
| miniRSA               | crypto   | `mini_rsa.py`                 | RSA, no padding, small message                                    | 
| rsa-pop-quiz          | crypto   | `rsa_pop_quiz.py`         | RSA quiz                                                          | 
| The Numbers           | crypto   | `the_numbers.py`           | Substitution cipher                                               | 

### PicoCTF-2021

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| Dachshund Attacks     | crypto   | `dachshund_attacks.py`| Wiener attack                                                    |
| Easy Peasy            | crypto   | `easy_peasy.py`             | One Time Pad                                                      |
| Mini RSA              | crypto   | `mini_rsa.py`                 | RSA, no padding, small message                                    |
| Mod 26                | crypto   | `mod26.py`                       | Rot13                                                             |
| No Padding, No Problem| crypto   | `no_padding_no_problem.py`| RSA, chosen ciphertext attack, decription oracle         | 

### PicoCTF-2022

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| basic-mod1            | crypto   | `basic_mod1.py`             | Modular arithmetic                                                |
| basic-mod2            | crypto   | `basic_mod2.py`             | Modular arithmetic                                                |
| NSA Backdoor          | crypto   | `nsa_backdoor.py`         | Pohlig Hellman, Chinese Remainder Theorem                         |
| Sequences             | crypto   | `sequences.py`               | Linear Algebra, Secuences                                         |
| Sum-O-Primes          | crypto   | `sum_o_primes.py`         | RSA, p+q leak                                                     | 
| transposition-trial   | crypto   | `transposition_trial.py`| Transposition cipher                                         | 
| Very Smooth           | crypto   | `very_smooth.py`           | RSA, Pollard's p-1 algorithm                                      | 
| Vigenere              | crypto   | `vigenere.py`                 | Vigenere cipher                                                   | 

### PicoCTF-2023

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| rotation              | crypto   | `rotation.py`                 | Caesar brute force                                                |
| SRA                   | crypto   | `sra.py`                           | RSA, $$N,\ \phi(N)$$ recover                                       |

### PicoCTF-2024

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| C3                    | crypto   | `c3.py`                             | Substitution cipher                                               |                                                                   |
| interencdec           | crypto   | `interencdec.py`           | Multiple encoding, caesar brute force                             |

### PicoCTF-2026

| Challenge             | Category | Script                                                                 | Topics                                                            |
|-----------------------|----------|------------------------------------------------------------------------|-------------------------------------------------------------------|
| ClusterRSA            | crypto   | `cluster_rsa.py`           | RSA, multiple primes                                              |
| cryptomaze            | crypto   | `cryptomaze.py`             | Linear Feedback Shift Register, AES                               |
| Related Messages      | crypto   | `related_messages.py` | RSA, Franklin Reiter Attack                                       |
| Shared Secrets        | crypto   | `shared_secrets.py`     | Diffie Hellman Key Echange, private key leak                      |
| Sum-O-Primes          | crypto   | `shift_registers.py`   | Linear Feedback Shift Register                                    | 
| Small Trouble         | crypto   | `small_trouble.py`       | Wiener attack                                                     | 
| StegoRSA              | crypto   | `stego_rsa.py`               | RSA, Steganography                                                | 
| Timestamped Secrets   | crypto   | `timestamped_secrets.py`| AES, timestamp key                                           | 

---

### ECSC 2023 (Norway)
| Challenge             | Category | Script                                                                                         | Topics                                    |
|-----------------------|----------|------------------------------------------------------------------------------------------------|-------------------------------------------|
| RRSSAA                | crypto   | `rrssaa.py`                                                        | RSA, Chinese remainder theorem            |
| WOTS Up               | crypto   | `wots_up.py`                                                      | Hash, Sha256, custom signature scheme     |
| WOTS Up 2             | crypto   | `wots_up_2.py`                                                  | Hash, Sha256, custom signature scheme     |

### HackTM CTF
| Challenge             | Category | Script                                                                                         | Topics                                    |
|-----------------------|----------|------------------------------------------------------------------------------------------------|-------------------------------------------|
| d-phi-enc             | crypto   | `d_phi_enc.py`                                                 | RSA, equation manipulation                |

## TAMUctf 2026

| Challenge             | Category | Script                                                                                         | Topics                                    |
|-----------------------|----------|------------------------------------------------------------------------------------------------|-------------------------------------------|
| Abnormal Ellipse      | crypto   | `abnormal_ellipse.py`                | ECC. Smart Attack.                        |
| Hidden Log Factoring  | crypto   | `hidden_log_factoring.py`    | RSA. Pohlig-Hellman. Factor $N$ from $d$. |
