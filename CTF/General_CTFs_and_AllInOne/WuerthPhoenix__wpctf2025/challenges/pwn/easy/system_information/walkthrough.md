# System Information

You have gained access to a inventory tool that lets you retrieve system information from a remote
machine, however the flag is still hidden behind a login prompt. Can you find a way to bypass the
login and retrieve the flag?

*Hint:* Connect to the service using netcat `nc <ip> <port>`

# Challenge

The player has only access to the remote service with a repl through netcat. When running the `?`
command, the player can see a list of available commands, which includes the command `flag`. The
command info does provide some information to the user, but is at last a red herring. When running
the `flag` command, they can notice that the command will echo the password provided by the user.
With some more testing, the player can find that they actually control the format string with the
password.

# Solution

Once the user has found out that they can provide the repl a format string, it's just a matter of
printing the variables from the stack, until something useful is returned. After a few iterations,
you have a command that looks something like `flag %s %s %s %s %s %s`. With that the repl prints
a variable from the stack, in the test case `my-password-d673d535a433ca237562c19b0d565052`, which
is stored on the  stack to validate the password. With that information, we can finally retrieve
the flag from service and solve the challenge.
