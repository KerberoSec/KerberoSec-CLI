# Bandit Level 30

> There is a git repository at `ssh://bandit30-git@bandit.labs.overthewire.org/home/bandit30-git/repo` via the port `2220`. The password for the user `bandit30-git` is the same as for the user `bandit30`.

## Login

```shell
ssh bandit30@bandit.labs.overthewire.org -p 2220

qp30ex3VLz5MDG1n91YowTv4Q8l7CDZL
```

## Solution

In your machine you have to clone the repo on port 2220 and the password is the same.

```shell
git clone ssh://bandit30-git@bandit.labs.overthewire.org:2220/home/bandit30-git/repo
```

```shell
cd repo
```

```shell
cat README.md
```

```text
just an epmty file... muahaha
```

The `readme.Md` does not give us any information. Checking the git tag, we find a point in the history called `secret`.

```shell
git tag
```

```text
secret
```

```shell
git show secret
```

```text
fb5S2xb7bRyFmAvQYQGEqsbhVyJqhnDy
```

