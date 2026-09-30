# Bandit Level 15

In this level we need to submit the password of the current level to the server `localhost` on port `30001` using ssl.

To do this we need to use the command `openssl`. This command, with the argument `s_client`, encrypts data with ssl and then sends it to a server. We need the arguments `-host` and  `-port` to specify where we are sending the data.
> `openssl s_client -host localhost -port 30001`

Entering the password for the current level reveals the password: `JQttfApK4SeyHwDlI9SXGR50qclOAil1`
