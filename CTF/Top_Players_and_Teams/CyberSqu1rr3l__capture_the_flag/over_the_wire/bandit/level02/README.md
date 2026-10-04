```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___| 
```
The password for the next level is stored in a file called `-` located in the home
directory. [^1]

Solution
-----------------------------------------------------------------------------------------
The `-` character is a popular conventions to refer to *stdin* or *stdout*, so it only
makes sense that the shell thinks we want to provide an option after the command `cat -`.
That is why we have to take input from a stream and redirect the `-` file to the cat
command. By redirecting the input for `cat` command with the input pipe `<`, the file
`-` is already assumed to be a file. We can therefore use `cat < -` to view the solution
password and exit the shell session to login as *bandit2* with the new password.
Alternatively, we could have also provided the local path with `cat ./-` to view the
file here.

[^1]: https://overthewire.org/wargames/bandit/bandit2.html
