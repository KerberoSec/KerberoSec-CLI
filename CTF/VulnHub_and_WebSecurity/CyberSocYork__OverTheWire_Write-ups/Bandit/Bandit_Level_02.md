# Bandit Level 2

In this challenge, the password for the next level is stored in a file called `spaces in this filename`

When trying to use the standard `cat` command `cat spaces in this filename`, it throws an error claiming that there is no file named spaces.

To work around this we place quote marks around the filename to force the `cat` command to treat it as one filename.
> `cat "spaces in this filename"`

This reveals the password: `aBZ0W5EmUfAf7kHTQeOwd8bauFJ2lAiG`
