```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|
```
The password for the next level is stored in a file called *readme* located in the home
directory. Use this password to log into bandit1 using SSH. Whenever we find a password
for a level, we use SSH on port 2220 to log into that level and continue the game. [^1]

Solution
-----------------------------------------------------------------------------------------
The hint already told us, that there is a *readme* file in our home directory, and indeed
after listing all the files with `ls`, we can discover it. So, we print its contents with
`cat readme` and are prompted with a message containing the password to the next level.
With this, we can `exit` the current session and log in via `ssh` with the username
*bandit1* and the copied password.

[^1]: https://overthewire.org/wargames/bandit/bandit1.html
