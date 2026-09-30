```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%...............%%%%..
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%..............%%..%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%...............%%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%..%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%...........%%%%..
........................................................................................................
```
Find the password for the user *natas8* to log in at
`http://natas8.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
For this level, we want to have a look at the source code again, because it reveals a
crucial hint on where to find the password for *natas8*. Namely, the password can be
found under `/etc/natas_webpass/natas8`. However, we can not simply append this to the
URL bar because this site does not operate on root level. Rather, we want to think about
the purpose of the *home* and *about* buttons on the front page. If we click on them, we
can observe the URL bar to change with the body `/index.php?page=home`, which is a direct
link to another page. So, we try to change this *page* payload to the password file.
```
http://natas7.natas.labs.overthewire.org/index.php?page=/etc/natas_webpass/natas8
```
And indeed, we were able to obtain the password this way because the page value is
responsible for redirecting the page according to `index.php`.

[^1]: https://overthewire.org/wargames/natas/natas8.html
