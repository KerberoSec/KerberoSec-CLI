# Bandit Level 3

The password for the next level is stored in a hidden file in the `inhere` directory.

First we need to enter the `inhere` folder.  To do this, we use the command `cd` which stands for "change directory".
> `cd inhere`

Once we enter the `inhere` directory, we use `ls` to list the files and no files are found. This is because the file is hidden, as it begins with a `.`. To show these files, we need to use the argument `-a` (or `--all`) to show all files including the hidden files.
> `ls -a`
> `ls --all`

Once we run this command we suddenly see the file `.hidden`.

Opening this file reveals the password: `2EW7BBsr6aMMoJ2HjW067dm8EgX26xNe`.
