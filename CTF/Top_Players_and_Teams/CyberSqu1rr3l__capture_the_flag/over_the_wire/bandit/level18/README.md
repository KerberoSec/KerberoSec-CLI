```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  / _ \ 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 ) _ ( 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_\___/
```
There are two files in the homedirectory, `passwords.old` and `passwords.new`. The
password for the next level is in `passwords.new` and is the only line that has been
changed between `passwords.old` and `passwords.new`.

Solution
----------------------------------------------------------------------------------------
To compare the two files, use the `diff passwords.old passwords.new` command, or to
print only the new password use:
```bash
diff --new-line-format='%L' --old-line-format='' --unchanged-line-format='' passwords.old passwords.new
```
After using this new password to log in to level 18, we see a "Byebye!" notification,
that is normal and the new task.

[^1]: https://overthewire.org/wargames/bandit/bandit18.html
