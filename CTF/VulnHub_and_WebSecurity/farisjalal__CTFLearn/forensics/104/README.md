# Git Is Good

### Prompt

The flag used to be there. But then I redacted it. Good Luck. 

https://mega.nz/#!3CwDFZpJ!Jjr55hfJQJ5-jspnyrnVtqBkMHGJrd6Nn_QqM7iXEuc

### Approach

- Extracted the provided zip file to find 'flag.txt' with the contents
  > flag{REDACTED}

- The question clearly seemed git related, so I ran 
  > git log

  just to check if the directory was a local git repo, and it was.

- As the prompt suggests, the file 'flag.txt' used to have the actual flag, but was changed. This means that the commit history should probably have a record of the actual flag.

- Ran
  > git log -p -2

  to view the change logs for the last 2 commits. This reveals the actual flag.

- Flag obtained : ```flag{protect_your_git}```
