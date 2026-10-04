# Bandit Level 29

In this level we are asked to clone a git repo with `git clone ssh://bandit29-git@localhost:2220/home/bandit29-git/repo` to find the password.

Looking in the `README` file we see a message saying that passwords aren't allowed in `production`.

This message implies that there is somewhere where passwords are allowed. We can use the command `git branch` to show us the list of all branches in the repo.
The command git show-branch is used to show branches and with the `-a` argument can show all possible branches

Running `git branch -a` shows us that there are two other branches:

- dev
- sploits-dev

We can change which branch we're on with the command `git checkout`.
> `git checkout dev`

Now, if we look at the `README` file we see the password is present: `xbhV3HpNGlTIdnjUrdAlPzc2L6y9EOnS`
