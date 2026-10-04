# Bandit Level 19

In this level we are told to use the set-uid binary to get the password to the next level.

A set-uid (or suid) binary runs as the user that owns it, even if it is executed by a different user. This binary is owned by the user `bandit20` and so it will run as that user.

Executing the binary with no arguments, as we are instructed to do, gives us this:

This program runs any command we give it as the user `bandit20`. We can therefore use it to open `/etc/bandit_pass/bandit20`, which reveals the password: `VxCazJaVykI6W36BkBU0mJTCM8rR95XT`
