
# Commited

The challenge can be solved with a couple of simple git commands:

1. List branches:

```bash
$ git branch
```

2. Switch to branch ***dbint***

```bash
$ git checkout dbint
```

3. Display commit history and make each entry's length 1 line:

```bash
$ git log --pretty=oneline
```

```
4e16af9349ed8eaa4a29decd82a7f1f9886a32db (HEAD -> dbint) Reminder Added.
c56c470a2a9dfb5cfbd54cd614a9fdb1644412b5 Oops
3a8cc16f919b8ac43651d68dceacbb28ebb9b625 DB check
6e1ea88319ae84175bfe953b7791ec695e1ca004 Note added
9ecdc566de145f5c13da74673fa3432773692502 Database management features added.
26bcf1aa99094bf2fb4c9685b528a55838698fbe Create database logic added
b0eda7db60a1cb0aea86f053816a1bfb7e2d6c67 Connecting to db logic added
441daaaa600aef8021f273c8c66404d5283ed83e Initial Project.
```

Interesting. There's a commit with message "Oops". Which probably means, something
was accidentally commited right before the "Oops" commit.

4. Let's select this commit

```bash
$ git checkout 3a8cc16f919b8ac43651d68dceacbb28ebb9b625
```

Now just print the ***main.py*** file and browse through its contents!
