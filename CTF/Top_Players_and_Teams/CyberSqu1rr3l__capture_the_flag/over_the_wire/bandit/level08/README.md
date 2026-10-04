```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   / _ \ 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  ) _ ( 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| \___/
```
The password for the next level is stored in the file `data.txt` next to the word
*millionth*. [^1]

Solution
----------------------------------------------------------------------------------------
Having looked at the file with `less` first, we know that there are many lines with a
keyword and value that could be a password. But, we already know that only the word
*millionth* is bound to give us the correct password. So, we search for it with
`grep -i "millionth" data.txt` and succeed. Note, that this only worked because the
keyword shared the same line with the next word.

[^1]: https://overthewire.org/wargames/bandit/bandit8.html
