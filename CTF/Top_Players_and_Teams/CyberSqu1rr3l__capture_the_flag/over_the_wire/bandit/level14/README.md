```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __  _  _   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  || || |  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 |`._  _| 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|   |_|
```
The password for the next level is stored in `/etc/bandit_pass/bandit14` and can only
be read by user *bandit14*. For this level, you don’t get the next password, but you
get a private SSH key that can be used to log into the next level. Look at the commands
that logged you into previous bandit levels, and find out how to use the key for this
level. [^1]

Solution
----------------------------------------------------------------------------------------
Upon logging in to the server, we are given a hint and a a private SSH key. In the hint,
we are informed that the current version of OverTheWire prevents logging in from one
level to another via localhost, so our previous solution does not work anymore with
`ssh bandit14@localhost -i sshkey.private`. Instead, we want to copy the
`sshkey.private` to our computer and and modify the permisions with `chmod 600
sshkey.private`. With that, we can then log in to the new level.

```bash
ssh -i sshkey.private -o IdentitiesOnly=yes -p 2220 bandit14@bandit.labs.overthewire.org
```
Upon logging in to the new level, we can finally check the contents of the
`cat /etc/bandit_pass/bandit14` file to get the password for this level.

[^1]: https://overthewire.org/wargames/bandit/bandit14.html
