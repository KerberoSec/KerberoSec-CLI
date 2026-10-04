# Bandit Level 9

In this level the password is stored in the file `data.txt` in one of the only human readable strings, beginning with several `=` characters.

Although this file has the extension `.txt`, it is binary data. To extract the password we will use the command `strings`. This goes through a binary file and outputs all printable characters in the file. As most of these are just sequences of symbols, we need to narrow down the search somewhat. We therefore `grep` for `==`.
> `strings data.txt | grep "=="`

Once the command runs we get the output:

This reveals the password: `G7w8LIi6J3kTb8A7j9LgrywtEUlyyp6s`
