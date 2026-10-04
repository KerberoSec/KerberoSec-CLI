```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%......%%...
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.............%%%.....%%%...
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%......%%...
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..............%%......%%...
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%........%%%%%%..%%%%%%.
..............................................................................................................
```
Find the password for the user *natas11* to log in at
`http://natas11.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
This level's website has fixed the bug from the previous level *natas9* by filtering
certain characters. And indeed, in the source code, we can now see that the `;` and `&`
command seperation symbols in bash are blocked from the `grep`.

```php
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    if(preg_match('/[;|&]/',$key)) {
        print "Input contains an illegal character!";
    } else {
        passthru("grep -i $key dictionary.txt");
    }
}
```
However, we can still use the wildcards `.` and `*` to list every entry in a file
with `.* cat /etc/natas_webpass/natas11`, which lists every line in the passwords and
dictionary file because we did not filter anything.

[^1]: https://overthewire.org/wargames/natas/natas11.html
