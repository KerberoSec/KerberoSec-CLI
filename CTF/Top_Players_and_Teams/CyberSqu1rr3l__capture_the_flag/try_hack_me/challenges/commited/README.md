```
  ______   ______   .___  ___. .___  ___.  __  .___________. _______  _______  
 /      | /  __  \  |   \/   | |   \/   | |  | |           ||   ____||       \ 
|  ,----'|  |  |  | |  \  /  | |  \  /  | |  | `---|  |----`|  |__   |  .--.  |
|  |     |  |  |  | |  |\/|  | |  |\/|  | |  |     |  |     |   __|  |  |  |  |
|  `----.|  `--'  | |  |  |  | |  |  |  | |  |     |  |     |  |____ |  '--'  |
 \______| \______/  |__|  |__| |__|  |__| |__|     |__|     |_______||_______/ 
```
One of our developers accidentally committed some sensitive code to our GitHub
repository. Well, at least, that is what they told us... the problem is, we don't 
remember what or where! Can you track down what we accidentally committed? [^1]

Discover the flag in the repository!
-----------------------------------------------------------------------------------------
From the task description, we already know that there was some sensitive information
commited under `/home/ubuntu/commited` and after unzipping teh file, we can use the
command `git log` and `git branch` to get a basic understanding of the repositiory.
After switching to the *dbint* branch with `get checkout dbint`, we discover a suspicious
command "Oops" and check it out with `git checkout <HASH_ID>` the hash ID of that commit.
But since we can't discover any flags here whatsover, we check out one previous commit
and discover the *password* flag in several methods of `main.py`.

[^1]: https://tryhackme.com/room/committed
