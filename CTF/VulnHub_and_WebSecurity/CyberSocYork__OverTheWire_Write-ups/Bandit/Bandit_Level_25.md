# Bandit Level 25

In this level we are given a private ssh key and told to login to `bandit26`. We are also told that the shell for `bandit26` is not `/bin/bash`.

We can ssh into bandit26 using `ssh bandit26@localhost -i bandit26.sshkey -p 2220`

This shell prints ascii-art of the word `bandit26` and then exits.

Using out shell on the user `bandit25` we can read the `/etc/passwd` file, which is where user's custom shells are stored.

Reading `/usr/bin/showtext` might help.

```sh
#!/bin/sh

export TERM=linux

more ~/text.txt
exit 0
```

Reading this script, we can tell that it displays some text using the `more` command before exiting. The `more` command is used to make a large amount of text pageable (scrollable) if the screen is not big enough to display it. If we reduce the size of the screen enough so that `more` pages the text we will not be instantly kicked out.

We can have `more` copy the text into vim for us by pressing `v`. As we are now in vim we can open the password file.
> `:edit /etc/bandit_pass/bandit26`

This reveals the password: `c7GvcKlw9mC7aUQaPx7nwFstuAIBw1o1`
