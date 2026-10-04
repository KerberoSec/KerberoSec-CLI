Going high, right!
![Bandit19](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit19/level19-%3Elevel20.png)

Let's see what we have to do:
```
bandit19@bandit:~$ ls
bandit20-do
bandit19@bandit:~$ ./bandit20-do 
Run a command as another user.
  Example: ./bandit20-do id
bandit19@bandit:~$ ls -l ./bandit20-do 
-rwsr-x--- 1 bandit20 bandit19 7296 May  7 20:14 ./bandit20-do
bandit19@bandit:~$ ./bandit20-do cat /etc/bandit_pass/bandit20
GbKksEFF4yrVs6il55v6gwY5aVje5f0j
bandit19@bandit:~$
```
Really such simple?

Of course, it is very simple.
But the purpose of this challenge is introducing the concept : `privilege escalation`!

Did you see the file permissions of that executable file?
It have a special-bit called `s`, which potentially gets executed by the command of another-user[the owner]!

Since the password-file of bandit20 has the permissions which is can be read-only by `bandit20`, this executable helps us to mimic as a privileged-user.
Very cool, right!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `GbKksEFF4yrVs6il55v6gwY5aVje5f0j` to log into the remote-machine as `bandit20`.

**Warning: Please, first try Level 20 -> Level 21! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
