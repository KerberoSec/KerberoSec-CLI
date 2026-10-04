```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   | __| 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `._`. 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| !__.'
```
The password for the next level is stored in the only human-readable file in the
`inhere` directory. If your terminal ever gets messed up, try the `reset` command. [^1]

Solution
----------------------------------------------------------------------------------------
Again, we move to the `inhere` directory and then list all the files in it with `ls -la`
which results in ten files that on first sight appear equal. So, we first want to get
some information on them with `for i in *; do file "./$i"; done` resulting in only
`./-file07` with *ASCII text*, whereas all others contain *data*. So, we print the
contents of that file with `cat ./-file07` and get lucky. Alternatively, we could have
also used `strings ./*` to discover all the human-readable text along with the password
for the next level *bandit5* in one go.

[^1]: https://overthewire.org/wargames/bandit/bandit5.html
