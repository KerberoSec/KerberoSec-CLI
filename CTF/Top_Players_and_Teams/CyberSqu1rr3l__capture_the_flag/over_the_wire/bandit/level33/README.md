```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __   __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   |__`.|__`. 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   |_ | |_ | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |__.'|__.'
```
After all this git stuff, it’s time for another escape. Good luck! [^1]

Solution
----------------------------------------------------------------------------------------
Upon logging in to the *bandit32* user via SSH, we are greeted with the *UPPERCASE*
shell. Which turns all our lower-case commands into upper-case, thus rendering all our
commands unuseful to bash, which is case-sensitive, in contrast to the Windows Command
Prompt or Powershell, for example. However, there is a trick, that we can use to spawn
another shell, with `$0`. This launches a shell without the upper-case restrictions and
so we can execute `cat /etc/bandit_pass/bandit33` to retrieve the password for the next
level.

[^1]: https://overthewire.org/wargames/bandit/bandit33.html
