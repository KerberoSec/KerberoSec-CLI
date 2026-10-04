```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   |_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |_/
```
The password for the next level is stored somewhere on the server and has all of the
following properties. [^1]

- owned by user bandit7
- owned by group bandit6
- 33 bytes in size

Solution
----------------------------------------------------------------------------------------
Again, we can utilize the `find` command and search under the full directory from the
root `/` for files with 33 bytes in size owned by `-user bandit7` and `-group bandit6`.
However, we also want to make sure to ignore "Permission denied" errors that are of no
use to us by forwarding errors to `/dev/null` with the *stderr* output redirection
`2>/dev/null`.
The resulting command `find / -size 33c -group bandit6 -user bandit7 2> /dev/null`
returns only one such file that comes into question and so it is worth investigating it
further with `cat /var/lib/dpkg/info/bandit7.password`.

[^1]: https://overthewire.org/wargames/bandit/bandit7.html
