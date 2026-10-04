# Challenge Name:
 [* RSA101*](https://cybertalents.com/challenges/cryptography/rsa101)
 
# Challenge Description
we received a message from our agent but we don't know how to use our key to read the message 

Link: [https://hubchallenges.s3-eu-west-1.amazonaws.com/crypto/RSA101.zip](https://hubchallenges.s3-eu-west-1.amazonaws.com/crypto/RSA101.zip)

## Answer
* Download the zip file and unzip it
```sh
unzip RSA101.zip
```
* It contain cipher text and RSA private key so let's decrypt it using openssl
```sh
openssl rsautl -decrypt -in cipher -out flag.txt -inkey key.pem
```
* Open the decrypted file 
```sh
cat flag.txt
```
* You got the Flag

 ## The Flag
 > flag{RSA_nice_try}
