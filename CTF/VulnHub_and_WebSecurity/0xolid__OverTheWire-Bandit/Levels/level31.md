# Bandit Level 31

> There is a git repository at `ssh://bandit31-git@bandit.labs.overthewire.org/home/bandit31-git/repo` via the port `2220`. The password for the user `bandit31-git` is the same as for the user `bandit31`.

## Login

```shell
ssh bandit31@bandit.labs.overthewire.org -p 2220

fb5S2xb7bRyFmAvQYQGEqsbhVyJqhnDy
```

## Solution

In your machine you have to clone the repo on port 2220 and the password is the same.

```shell
git clone ssh://bandit31-git@bandit.labs.overthewire.org:2220/home/bandit31-git/repo
```

```shell
cd repo
```

```shell
cat README.md
```

```text
This time your task is to push a file to the remote repository.

Details:
    File name: key.txt
    Content: 'May I come in?'
    Branch: master
```

So we have to push a file to the remote repository.

```shell
echo "May I come in?" > key.txt
```

```shell
git add key.txt
```

```text
The following paths are ignored by one of your .gitignore files:
key.txt
hint: Use -f if you really want to add them.
hint: Disable this message with "git config set advice.addIgnoredFile false"
```

So the `.gitignore` stop us from add the file.

```shell
cat .gitignore
```

```text
*.txt
```

We have to add `-f` parameter to force it.

```shell
git add key.txt -f
```

Then commit it.

```shell
git commit -a
```

Then push it.

```shell
git push -u origin master
```

```text
3O9RfhqyAlVBEZpVb6LYStshZoqoSx5K
```

