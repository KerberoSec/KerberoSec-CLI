```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __  __  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  |/  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 |`7 | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_| |_|
```
The password for the next level is stored in the file `data.txt`, which contains base64
encoded data. [^1]

Solution
----------------------------------------------------------------------------------------
Already pre-installed on most Linux systems, we can use the *base64* command to decode
the message easily with `base64 -d data.txt`, revealing the password to us.

[^1]: https://overthewire.org/wargames/bandit/bandit11.html
