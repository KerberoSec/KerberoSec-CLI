```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  / _ \ 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 \__ / 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|/_/
```
The password for the next level is stored in a file readme in the homedirectory.
Unfortunately, someone has modified `.bashrc` to log you out when you log in with SSH.

Solution
----------------------------------------------------------------------------------------
Before, `.bashrc` can log us out, we can first pipe a command into SSH and thus view the
contents of the `readme` file.
```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no \
  bandit18@bandit.labs.overthewire.org -p 2220 "ls; cat readme"
```
This way, we were able to spot the contents of the home directory with the `readme` file
and then already print its contents with the password.

[^1]: https://overthewire.org/wargames/bandit/bandit19.html
