```
.%%..%%...%%%%...%%%%%%...%%%%....%%%%...........%%......%%%%%%..%%..%%..%%%%%%..%%..............%%..%%.
.%%%.%%..%%..%%....%%....%%..%%..%%..............%%......%%......%%..%%..%%......%%..............%%..%%.
.%%.%%%..%%%%%%....%%....%%%%%%...%%%%...........%%......%%%%....%%..%%..%%%%....%%..............%%%%%%.
.%%..%%..%%..%%....%%....%%..%%......%%..........%%......%%.......%%%%...%%......%%..................%%.
.%%..%%..%%..%%....%%....%%..%%...%%%%...........%%%%%%..%%%%%%....%%....%%%%%%..%%%%%%..............%%.
........................................................................................................
```
Find the password for the user *natas4* to log in at
`http://natas4.natas.labs.overthewire.org` for the next level. [^1]

Solution
-----------------------------------------------------------------------------------------
This level's website tells us that there is nothing on this page, and if we investigate
the page's source code under the URL
`view-source:http://natas3.natas.labs.overthewire.org/`, we can discover a comment, that
not even Google will find any information. This makes us suspicious, that web site
information is hidden from search engine crawlers. So, in turn, we look up the 
`robots.txt` file which gives us the clue, that the `/s3cr3t/` is of limits for crawlers
potentially due to sensitive information. And indeed, after checking out that folder, we
discover yet another `users.txt` file with the password for *natas4* stored in it.

[^1]: https://overthewire.org/wargames/natas/natas4.html
