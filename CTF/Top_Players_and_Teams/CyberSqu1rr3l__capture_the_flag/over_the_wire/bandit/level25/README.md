```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___  ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  || __| 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / / `._`. 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___|!__.'
```
A daemon is listening on port *30002* and will give us the password for *bandit25* if
given the password for *bandit24* and a secret numeric 4-digit pincode. There is no way
to retrieve the pincode except by going through all of the *10000* combinations, called
brute-forcing. We may not need to create a new connection each time. [^1]

Solution
----------------------------------------------------------------------------------------
We begin, by creating a shell script in a temporary directory, for example
`/tmp/bruteforce_four_digits.sh` and create a loop, that iterates over all four-digit
number combinations and transfers them, along with the current password, which can be
found in `cat /etc/bandit_pass/bandit24` to the daemon listening on port *30002* with
the netcat command `nc localhost 30002`. Finally, we can search for the keywords
*bandit25*, *password* or *correct* to differentiate between hits and misses, for
example with `grep -m2 "bandit25` that stops after two *bandit25* keywords were found.
Finally, we change the script's permissions to an executable and execute it which
rewards us with the next level's password.

[^1]: https://overthewire.org/wargames/bandit/bandit25.html
