```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ __  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  /  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / /`7 | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___||_|
```
There is a *setuid* binary in the home directory that does the following: it makes a
connection to localhost on the specified port as a commandline argument.
It then reads a line of text from the connection and compares it to the password in the
previous level. If the password is correct, it will transmit the password for the next
level. [^1]

Solution
----------------------------------------------------------------------------------------
After logging in to the service via SSH, we investigate the `./suconnect` command and
discover that the program will connect to the given port on localhost using TCP. If it
receives the correct password from the other side, the next password is transmitted
back. So, we start another terminal instance and connect to the SSH service again.
Then, we start a *netcat* instance on a random port of our choice that is not in use
and listen for incoming connections: `nc -lp 2222` Having done that, we can start the
`./suconnect 2222` executable on the same port which establishes a connection. Now, we
want to send the previous password for this level in the netcat instance and wait for a
reply with the new password.

[^1]: https://overthewire.org/wargames/bandit/bandit21.html
