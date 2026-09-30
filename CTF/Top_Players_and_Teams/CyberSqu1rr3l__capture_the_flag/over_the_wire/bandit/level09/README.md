```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   / _ \ 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  \__ / 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  /_/
```
The password for the next level is stored in the file `data.txt` and is the only line of
text that occurs only once. [^1]

Solution
----------------------------------------------------------------------------------------
With `cat data.txt | sort | uniq -u` we first sort all the lines in the file and then
print only those lines that appear exactly once. Since `uniq` only works on adjacent
lines, we first had to sort them alphabetically first. This way, we were able to remove
all duplicates and show only single occurences; in this case only the password line.

[^1]: https://overthewire.org/wargames/bandit/bandit9.html
