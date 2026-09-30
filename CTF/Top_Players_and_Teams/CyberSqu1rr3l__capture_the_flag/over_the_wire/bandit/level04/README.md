```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     _  _   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   | || |  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `._  _| 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|    |_|
```
The password for the next level is stored in a hidden file in the `inhere` directory. [^1]

Solution
----------------------------------------------------------------------------------------
First, we move to the specified directory with `cd inhere/` and then list all its
contents with `ls -a`. This way, we have found a hidden file `...Hiding-From-You` which
we can open with a simple `cat ...Hiding-From-You` command. This has given us the
password for the *bandit4* user via SSH on the server.

[^1]: https://overthewire.org/wargames/bandit/bandit4.html
