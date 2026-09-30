```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%%%%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%.................%%..
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%................%%%..
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..................%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%..........%%%%%..
........................................................................................................
```
Find the password for the user *natas3* to log in at
`http://natas3.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
Since, we are informed there is nothing on this page, we open the *Inspector Tool* in our
browser and open the `content` paragraph. In here, we can see the `files/pixel.png` entry
leading us to think, that there is a *files* folder with potentially more information.
And indeed, after appending `/files/` to the URL, we discover a `user.txt` file with the
password for *natas3*, along with other user's passwords, directly exposed.

[^1]: https://overthewire.org/wargames/natas/natas3.html
