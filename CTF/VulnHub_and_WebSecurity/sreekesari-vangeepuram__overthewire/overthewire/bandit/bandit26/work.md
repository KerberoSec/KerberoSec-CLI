Simple VI stuff!
![Bandit26](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit26/level26-%3Elevel27.png)

Let's see what we have to do:
```
  1   _                     _ _ _   ___   __                                                                                            
  2  | |                   | (_) | |__ \ / /
  3  | |__   __ _ _ __   __| |_| |_   ) / /_
  4  | '_ \ / _` | '_ \ / _` | | __| / / '_ \
~
~                                                                           
:set shell=/bin/bash
```
There's a parameter called `shell` in `vi`, to access the shell from the `vi-shell`!
Since the shell is set to `/usr/bin/showtext`, we've changed it to `/bin/bash`.

```
  1   _                     _ _ _   ___   __
  2  | |                   | (_) | |__ \ / /
  3  | |__   __ _ _ __   __| |_| |_   ) / /_
  4  | '_ \ / _` | '_ \ / _` | | __| / / '_ \
~ 
~
:shell
[No write since last change]
bandit26@bandit:~$ ls
bandit27-do  text.txt
bandit26@bandit:~$ ./bandit27-do 
Run a command as another user.
  Example: ./bandit27-do id
bandit26@bandit:~$ ./bandit27-do cat /etc/bandit_pass/bandit27
3ba3118a22e93127a4ed485be72ef5ea
bandit26@bandit:~$
```
Finally, got it!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `3ba3118a22e93127a4ed485be72ef5ea` to log into the remote-machine as `bandit27`.

**Warning: Please, first try Level 27 -> Level 28! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
