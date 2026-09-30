```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __   ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   |__`.(_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   |_ | / /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |__.'|___| 
```
There is a git repository at
`ssh://bandit31-git@bandit.labs.overthewire.org/home/bandit31-git/repo` via the port
*2220*. The password for the user *bandit31-git* is the same as for the user *bandit31*.
From our local machine, not the *OverTheWire* machine, we are instructed to clone the
repository and find the password for the next level. [^1]

Solution
----------------------------------------------------------------------------------------
Having solved the previous levels, we already know how to clone this repository and
proceed as follows.

```bash
GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no -p 2220' \
git clone ssh://bandit31-git@bandit.labs.overthewire.org:2220/home/bandit31-git/repo
```
In the *README* file, we are instructed to push a file to the remote repository with the
file name `key.txt` and the content "May I come in?" on the branch *master*. So, we
create a file with `touch key.txt` and then enter the expected content in `vim`.
However, when trying to commit our change and pushing it, we are informed that there is
nothing to commit. This tells us to inspect the `.gitignore` file and indeed, it does
prohibit any text file from being pushed. So, we additionally delete this line and try
to push our changes once more.

```bash
GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no -p 2220' \
git push origin master
```
Note, that we have to preceed the `git add -A` and `git commit -m` with the same
*GIT_SSH_COMMAND* configuration before pushing it to the *master* branch. Having done
this, with our current level's password, we are rewarded with the next level's
password in the remote SSH message.

[^1]: https://overthewire.org/wargames/bandit/bandit32.html
