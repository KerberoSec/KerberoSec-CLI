# Bandit Level 0

The goal of this level is to login to the game using ssh.

The standard syntax for ssh is `ssh user@domain -p port`.  We can log in to the server using the username `bandit0` and port `2220`.

After we connect to the server, we need to see which files are in the folder. To do this we use the `ls` command, which will list all files and directories in the current directory.

Once we run the command `ls`, we get output showing us there is a file called `readme`. We now need to open the file `readme`. For this we can use the command `cat` which is short for "concatenate", and can be used to print files to the terminal.
> `cat readme`

The command reveals the password: `NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL`
