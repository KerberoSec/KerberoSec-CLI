# Challenge Name:
 [*Postbase*](https://cybertalents.com/challenges/cryptography/postbase)
 
# Challenge Description
We got this letters and numbers and don't understand them. Can you? R[corrupted]BR3tCNDUzXzYxWDdZXzRSfQ==

## Answer
* The equal sign implies that we have a base64 encode, but there are some bits that are corrupted
* Calculate how many char in this code, it will be 26(without corrupted;) but base64 encoding must be multiple  of 4 so there are 2 letters missing
* By using Brute Force we can write a bash script to generate all possible code
```sh
#!/bin/bash

alpha="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"

for i1 in {0..63}
do
        for i2 in {0..63}
        do      
                echo R${alpha:$i1:1}${alpha:$i2:1}BR3tCNDUzXzYxWDdZXzRSfQ== >> list.txt
        done
done
```
* Execute this script to generate our list to decode them in the next step
```sh
bash script.sh
```
* Use base64 tool in Linux to decode all the list we have generated previously
```sh
base64 -d list.txt
```
* You got the Flag!!

 ## The Flag
 > FLAG{B453_61X7Y_4R}  
