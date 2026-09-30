# HTB Lost Modulus writeup

The  script encrypts the flag using RSA. The source code reveal the private key used and the private key is 3. The choice of private key(e) is too small. The encrypted flag, hex(flag)^3, is smaller than the modulus. Therefore, the encrypted flag can be decrypted by computing hex(encrypted_flag)^(1/3)
