```
▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖▗▄▄▄▖▗▄▄▖ ▗▖  ▗▖▗▄▄▄▖▗▄▄▄ ▗▄▄▄▖ ▗▄▖▗▄▄▄▖▗▄▄▄▖    ▗▖  ▗▖▗▖  ▗▖ ▗▄▖ ▗▄▄▖ 
  █  ▐▛▚▖▐▌  █  ▐▌   ▐▌ ▐▌▐▛▚▞▜▌▐▌   ▐▌  █  █  ▐▌ ▐▌ █  ▐▌       ▐▛▚▖▐▌▐▛▚▞▜▌▐▌ ▐▌▐▌ ▐▌
  █  ▐▌ ▝▜▌  █  ▐▛▀▀▘▐▛▀▚▖▐▌  ▐▌▐▛▀▀▘▐▌  █  █  ▐▛▀▜▌ █  ▐▛▀▀▘    ▐▌ ▝▜▌▐▌  ▐▌▐▛▀▜▌▐▛▀▘ 
▗▄█▄▖▐▌  ▐▌  █  ▐▙▄▄▖▐▌ ▐▌▐▌  ▐▌▐▙▄▄▖▐▙▄▄▀▗▄█▄▖▐▌ ▐▌ █  ▐▙▄▄▖    ▐▌  ▐▌▐▌  ▐▌▐▌ ▐▌▐▌   
```
Can you combine your great nmap skills with other tools to log in to this machine? [^1]                                                                                       

Find the flag with both `nmap` and `netcat`.
-----------------------------------------------------------------------------------------
First, we want to discover open ports with `nmap -sT <TARGET_IP_ADDRESS>` and thus get
the following result.
```
PORT      STATE SERVICE
22/tcp    open  ssh
2222/tcp  open  EtherNetIP-1
31337/tcp open  Elite
```
Next, we want to connect to the unkown *Elite* service with `nc <TARGET_IP_ADDRESS>
31337`. This way we discover that the `user:password` combination for a service on the
lower ports is `ubuntu:Dafdas!!/str0ng`. With this, we suspect one of the SSH services
to let us in with the credentials. But by using `ssh` repeatedly on the *22* and *2222*
ports, we are not connected. We also try out `sshpass` but can't succeed this way either.
Finally, we try to connect to SSH without any further port specification and are able to
log in. For this, we use `ssh ubuntu@<TARGET_IP_ADDRESS>`, followed by an interactive 
password prompt. Then, we go to the `/home/user` directory and discover the flag for this
challenge.

[^1]: https://tryhackme.com/room/intermediatenmap
