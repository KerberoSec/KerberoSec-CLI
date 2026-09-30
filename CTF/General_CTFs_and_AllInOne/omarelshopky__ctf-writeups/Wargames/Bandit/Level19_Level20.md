# Bandit Level 19 --> Level 20
## Level Goal
To gain access to the next level, you should use the setuid binary in the homedirectory. Execute it without arguments to find out how to use it. The password for this level can be found in the usual place (/etc/bandit_pass), after you have used the setuid binary.

## Solution

ls command show there is setuid file in home directory we can use to perform command only bandit20 has permission to do
```console
bandit19@bandit:~$ ls
bandit20-do
```

See bandit_pass folder where all pass stored using setuid binary 
```console
bandit19@bandit:~$ ./bandit20-do cat /etc/bandit_pass/bandit20
GbKksEFF4yrVs6il55v6gwY5aVje5f0j
```

## Password
> GbKksEFF4yrVs6il55v6gwY5aVje5f0j

  
