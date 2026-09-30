```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __  __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  |/  \  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 | // | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|\__/
```
The password for the next level is stored in the file `data.txt` in one of the few
human-readable strings, preceded by several `=` characters. [^1]

Solution
----------------------------------------------------------------------------------------
Since the hint tells us that there are several `=` characters, we list all the strings
in the file and search for those beginning with a few equation signs as such
`strings data.txt | grep -i "=="`. This shows as the password for the next level.

[^1]: https://overthewire.org/wargames/bandit/bandit10.html
