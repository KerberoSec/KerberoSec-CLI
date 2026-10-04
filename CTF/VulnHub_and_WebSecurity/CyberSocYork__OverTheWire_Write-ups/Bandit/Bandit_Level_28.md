# Bandit Level 28

In this level we are asked to clone a git repo to find the password.

First, we clone the repo with `git clone ssh://bandit28-git@localhost:2220/home/bandit28-git/repo`. Looking in the `README` file we see that the password has been redacted:

This means that we need to find an older version of this file with the password still there. We can use `git log` to see the log of commits.

As we can see there is a commit with the message "fix info leak". If we look at the file before this commit was made, it may contain the password. We can look at the state of a repo at a certain commit using the command `git checkout`.
> `git checkout abcff758fa6343a0d002a1c0add1ad8c71b88534`

Now, if we look at the `README` file we see the password: `tQKvmcwNYcFS6vmPHIUSI3ShmsrQZK8S`
