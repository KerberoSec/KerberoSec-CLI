```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%%%%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.................%%..
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%................%%...
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%...............%%....
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%..........%%.....
........................................................................................................
```
Find the password for the user *natas7* to log in at
`http://natas7.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
In the *natas6* web site, we are prompted with an input bar to enter a secret and submit
the query. We are also able to view the source code under
`http://natas6.natas.labs.overthewire.org/index-source.html` which contains an include to
the `includes/secret.inc` which we then try to open. To our surprise, we are able to view
the page and have a look at it's source code. In there, we can discover the `$secret`
which we can copy and enter into the input bar from before, thus revealing the password
for *natas7* to us.

[^1]: https://overthewire.org/wargames/natas/natas7.html
