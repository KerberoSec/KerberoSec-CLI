# Challenge Name:
 [*G&P List*](https://cybertalents.com/challenges/forensics/gp-list)
 
# Challenge Description
Just Open the File and Capture the flag . Submission in MD5

Link: [https://s3-eu-west-1.amazonaws.com/talentchallenges/Forensics/G%26P+lists.docx](https://s3-eu-west-1.amazonaws.com/talentchallenges/Forensics/G%26P+lists.docx)

## Answer
* Download the file and use **file tool** to know its type
```sh
file G\&P+lists.docx
```
* Notice that it is a microsoft word file run successfuly on libreoffice
* Lets extract its content
```sh
unzip G\&P+lists.docx
ls
```
* There is a file called 'Flag.txt' open it
```sh
cat Flag.txt
```
* You got the Flag

 ## The Flag
 > 877c1fa0445adaedc5365d9c139c5219
