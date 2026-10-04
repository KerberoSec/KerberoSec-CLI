```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  /  \  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / / // | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___\__/
```
To gain access to the next level, use the *setuid* binary in the home directory. Execute
it without arguments to find out how to use it. The password for this level can be found
in the usual place `/etc/bandit_pass`, after using the setuid binary. [^1]

Solution
----------------------------------------------------------------------------------------
First, we execute the `./bandit20-do` *setuid* binary and find out that it can be used
to execute commands as the level 20 user by appending the command. So, it comes natural
to us, to run `./bandit20-do cat /etc/bandit_pass/bandit20` which prints the password
for the next level.

[^1]: https://overthewire.org/wargames/bandit/bandit20.html
