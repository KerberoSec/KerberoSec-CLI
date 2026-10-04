# Bandit Level 20

In this level we have another suid binary. This one will make a connection to localhost with a specified port. It then reads a line of text from the connection. If that line matches the password for the current level, it will print the password for the next level.

We can use netcat to host a server for our binary to connect to. This is done with the argument `-l`, in the syntax `nc -l <address> -p <port>`. To make this send text to any incoming connection we just need to pipe that text into the `nc` command. We also need to append a `&` to the end of the command to tell the shell to run it in the background. This allows us to run more commands while this one is still running.
> `echo "VxCazJaVykI6W36BkBU0mJTCM8rR95XT" | nc -l localhost 9999 &`

We can now connect to it with the `./suconnect 9999` binary. If everything was done properly, this will give us the password: `NvEJF7oVjkddltPSrdKEFOllh9V1IBcq`
