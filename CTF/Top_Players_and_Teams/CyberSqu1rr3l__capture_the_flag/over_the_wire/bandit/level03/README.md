```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   |__`. 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   |_ | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |__.'
```
The password for the next level is stored in a file called `--spaces in this filename--`
located in the home directory. [^1]

Solution
-----------------------------------------------------------------------------------------
Since the file name starts with a `--` double hyphen, many built-in utility commands,
including `cat` interpret the following as an option or flag to set. They fail for that
reason, because there is no such option and it is our goal to escape that kind of
behaviour, or tell the command not to interpret options at all. There are multiple ways
to do this; we could, for example, use the input pipe again with
`cat < "--spaces in this filename--"` or use `cat -- "--spaces in this filename--"` to
mark the end of options to parse for `cat`. Alternatively, we could have also provided
the local path to the file with `cat ./--spaces\ in\ this\ filename--`. Either way, we
have been given the password for *bandit3* by now.

[^1]: https://overthewire.org/wargames/bandit/bandit3.html
