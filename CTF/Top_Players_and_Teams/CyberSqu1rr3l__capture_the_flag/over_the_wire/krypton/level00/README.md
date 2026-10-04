```
  ___    _                   _                _                 __  _ 
 / _ \  | |_____   _____    | |   __ _  ___ _| | __ _ _   _ __ _\ \| |
| | | | | / _ \ \ / / _ \   | |  / _` |/ _ \__ |/ _` | | | |__` |\ ` |
| |_| | | \__  \ V /\__  |__| | | | | | (_) || | (_| | |_| |  | |/ . |
 \___/  |_|___/ \_/ |___/_____| |_| |_|\___/__/ \__, | .__/   |_/_/|_|
                                                   |_|\___|
```
Welcome to Krypton. The first level is easy, as the following string encodes the
password using Base64: *S1JZUFRPTklTR1JFQVQ=*

Use this password to log in to `krypton.labs.overthewire.org` with the username
*krypton1* using SSH on port *2231*. Note, that we can find the files for other levels
in `/krypton/`. [^1]

Solution
----------------------------------------------------------------------------------------
We can simply decode the string using `echo 'S1JZUFRPTklTR1JFQVQ=' | base64 -d` and then
connect via SSH with the username on port 2231 and enforce password authentication with
the thus retrieved password after Base64 decoding.

```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no krypton1@krypton.labs.overthewire.org -p 2231
```

[^1]: https://overthewire.org/wargames/krypton/krypton0.html
