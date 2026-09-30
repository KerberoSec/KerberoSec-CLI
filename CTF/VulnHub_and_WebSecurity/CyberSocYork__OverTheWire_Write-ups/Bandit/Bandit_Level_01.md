# Bandit Level 1

The password for the next level is located in a file called `-` located in the home directory.

Due to the fact that the filename is `-`, the `cat` command interprets this as an argument, and doesn't do what we expect.  To mitigate this, we have to specify that it is a file in this directory by prepending `./` to the filename.
> `cat ./-`

This works, opening the file successfully, revealing the password: `rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi`
