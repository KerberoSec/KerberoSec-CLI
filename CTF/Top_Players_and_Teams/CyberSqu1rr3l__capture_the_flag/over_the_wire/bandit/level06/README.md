```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _      ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |    / __| 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  | ,_ \ 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  \___/
```
The next password is stored in a file somewhere under the `inhere`
directory and has all of the following properties. [^1]

- human-readable
- 1033 bytes in size
- not executable

Solution
----------------------------------------------------------------------------------------
After the `cd inhere` operation, we want to find files with exactly 1033 bytes in
characters in the current directory. This can be done with the `find -size 1033c`
command, resulting in only one file in our case. So, we can print its contents with the
`cat ./maybehere07/.file2` command and discover the password to the next level. In this
example the provided command was already enough for us to pin it down to only file, but
to be more specific to the provided criteria, we could have also used the command
`find \! -executable -size 1033c`, to include a search for non executable files as well.

[^1]: https://overthewire.org/wargames/bandit/bandit6.html
