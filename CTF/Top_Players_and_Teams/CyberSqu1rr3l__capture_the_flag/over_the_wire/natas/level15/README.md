```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%....%%%%%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%....%%.....
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%.....%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%........%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%..%%%%%..
..............................................................................................................
```
Find the password for the user *natas15* to log in at
`http://natas15.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
In this *natas14* website, we are promtped with a classic username and password login.
So, we can investigate the source code and suspect a SQL injection might be sufficient
enough to break out of the password verification command.
```sql
SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\"
```
We start by providing the username *natas14* and the password
`test" OR 1=1` which already gives us more information.

> Warning: mysqli_num_rows() expects parameter 1 to be mysqli_result, bool given in
> /var/www/natas/natas14/index.php on line 24
>
> Access denied!

So, we were prevented from logging in because the of a query number check. Further, a
few lines above that, we discover an if block to `array_key_exists("debug", $_GET)`
which allows a query to be executed when there is a GET request. We thus change the URL
to `http://natas14.natas.labs.overthewire.org/index.php?debug=` but can't notice a
visible change or more debugging information. Then, we revisit our SQLi and notice that
we might not have handled the `"` usage well. So, we try again, with the password
`test" OR "1"="1` and *natas14* and are allowed to log in to see the next level's
password.

[^1]: https://overthewire.org/wargames/natas/natas15.html
