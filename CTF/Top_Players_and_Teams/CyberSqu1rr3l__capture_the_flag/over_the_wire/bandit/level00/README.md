```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _      __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |    /  \  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  | // | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  \__/  
```
The Bandit wargame from OverTheWire [^1] is aimed at absolute beginners; and it is the
recommended starting point to learn Unix/Linux basics with OverTheWire. This game is
organized in levels, where after finishing each level we are given information on how to
start the next level.
The goal of this first level [^2] is, to log into the game using SSH. The host to which
we need to connect is `bandit.labs.overthewire.org`, on port `2220`. The username is
*bandit0* and the password is also *bandit0*. Once logged in, go to the *Level 1* page to
find out how to beat Level 1.

Solution
-----------------------------------------------------------------------------------------
At first, we try to login via `ssh bandit0@bandit.labs.overthewire.org -p 2220` but since
we are not being asked for a password due to too many SSH keys on our device, that are
tried first, we have to force a password-only authentication method instead.

```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no bandit0@bandit.labs.overthewire.org -p 2220
```

With this and the provided password, we are allowed to login and can browse the home
directory for the next challenge.

[^1]: https://overthewire.org/wargames/bandit/
[^2]: https://overthewire.org/wargames/bandit/bandit0.html
