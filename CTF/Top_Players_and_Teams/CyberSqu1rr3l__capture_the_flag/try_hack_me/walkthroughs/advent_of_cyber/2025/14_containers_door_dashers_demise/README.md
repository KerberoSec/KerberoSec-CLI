```
▞▀▖      ▐     ▗                  ▛▀▖         ▛▀▖      ▌        ▝▌   ▛▀▖       ▗       
▌  ▞▀▖▛▀▖▜▀ ▝▀▖▄ ▛▀▖▞▀▖▙▀▖▞▀▘ ▄▄▖ ▌ ▌▞▀▖▞▀▖▙▀▖▌ ▌▝▀▖▞▀▘▛▀▖▞▀▖▙▀▖▝▞▀▘ ▌ ▌▞▀▖▛▚▀▖▄ ▞▀▘▞▀▖
▌ ▖▌ ▌▌ ▌▐ ▖▞▀▌▐ ▌ ▌▛▀ ▌  ▝▀▖     ▌ ▌▌ ▌▌ ▌▌  ▌ ▌▞▀▌▝▀▖▌ ▌▛▀ ▌   ▝▀▖ ▌ ▌▛▀ ▌▐ ▌▐ ▝▀▖▛▀ 
▝▀ ▝▀ ▘ ▘ ▀ ▝▀▘▀▘▘ ▘▝▀▘▘  ▀▀      ▀▀ ▝▀ ▝▀ ▘  ▀▀ ▝▀▘▀▀ ▘ ▘▝▀▘▘   ▀▀  ▀▀ ▝▀▘▘▝ ▘▀▘▀▀ ▝▀▘
```
In this THM room, we learn about container security for Docker with runtime concepts and
common container escape/privilege-escalation vectors. [^1]

What exact command lists running Docker containers?
-----------------------------------------------------------------------------------------
In order to check which services are running with Docker, we can run the `docker ps`
command on th etarget machine. Therefore, we can see that the main `app.py` runs on the
port 5001 so we visit this site `http://<TARGET_IP_ADDRESS>:5001` in the attack machine's
browser. This website has been hijacked by the Bunnies of King Malhare to be the Easter
Bunny's Delivery Service. We can look around a bit and discover a mysterious Easter egg
button on the lower right edge of the website.

What file is used to define the instructions for building a Docker image?
-----------------------------------------------------------------------------------------
The file used to define instructions for building a Docker image is called a *Dockerfile*
which is a plain text file. In it there is a series of instructions that define the
base image, install dependencies, file copying, set environments and commands to run.

What's the flag?
-----------------------------------------------------------------------------------------
Upon investigating the running processes in Docker again, we get suspicious of the
*uptime-checker* container again and access it with `docker exec -it uptime-checker sh`.
In here, we can then check the socket access rights with `ls -la /var/run/docker.sock`
and inn contrast to the goal of *Enhanced Container Isolation* (ECI), we are able to
access the Docker socket by default. We can now attempt a privilege escalation attack
by running `docker ps` again, and confirm that we are able to perform Docker commands
and interact with the API. The Docker Escape attack can now be further strung by accesing
the *deployer* container with `docker exec -it deployer bash`.

After successfully logging in to the *deployer* container, we can go to the root folder
and discover the flag. In here, we can also discover a recovery script which allows us
to revert the state of the hijacked website.
Finally, to restore the original form of the website we can run the recovery script
`./recovery_script.sh` in the deployer root directory.

Bonus Question: There is a secret code contained within the news site running on port
5002; this code also happens to be the password for the deployer user.
-----------------------------------------------------------------------------------------
For this, we can navigate to the website `http://<TARGET_IP_ADDRESS>:5002` and by reading
the news article, we notice the different colored words *Deploy*, *Master* and *2025!*.
And, it turns out that by concatenating them together, we get the secret code and the
password for the deployer user.

[^1]: https://tryhackme.com/room/container-security-aoc2025-z0x3v6n9m2
