```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __  ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   /  |/ __| 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_  `7 | ,_ \ 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___|  |_|\___/
```
The password for the next level can be retrieved by submitting the password of the
current level to port 30001 on localhost using SSL/TLS encryption. In case we are
getting the *DONE*, *RENEGOTIATING* or *KEYUPDATE* keywords, it is best to read the
*CONNECTED COMMANDS* section in the manpage. [^1]

Solution
----------------------------------------------------------------------------------------
Once again, we pipe the password for this level into OpenSSL and connect to localhost
on port 30001 with a generic SSL/TLS client. Note, that we don't want to close the
connection immediately after sending input, but rather wait for a response with the
flag `-ign_eof`. Further, we can supress error output with `2>/dev/null` to only print
the real response.

```bash
cat /etc/bandit_pass/bandit15 | openssl s_client -connect localhost:30001 -ign_eof
```

[^1]: https://overthewire.org/wargames/bandit/bandit16.html
