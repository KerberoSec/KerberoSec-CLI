```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __  ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  || __| 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 |`._`. 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|!__.'
```
The password for the next level can be retrieved by submitting the password of the
current level to port 30000 on localhost. [^1]

Solution
----------------------------------------------------------------------------------------
We already found out the password for this level in the previous level with the command
`cat /etc/bandit_pass/bandit14` and it is our task now to copy or pipe this password
into `netcat` on localhost with the port 30000 in the following way.
```bash
cat /etc/bandit_pass/bandit14 | nc localhost 30000
```

[^1]: https://overthewire.org/wargames/bandit/bandit15.html
