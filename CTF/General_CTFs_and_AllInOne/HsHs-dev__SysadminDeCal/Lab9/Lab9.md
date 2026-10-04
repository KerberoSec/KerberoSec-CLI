# Lab 9: Containers (Docker)

- What user are you logged in as by default in the container?

`root@bcc9c9af868f`

- If you start and then exit an interactive container, and then use the docker run -it ubuntu:latest command again; is it the same container? How can you tell?

No, it's not the same container.

I made a txt file then logged out, when I logged in back I didn't find it.

- Run the image you just built with no flags. What do you observe?

```bash
ERROR: docker: 'docker buildx build' requires 1 argument

Usage:  docker buildx build [OPTIONS] PATH | URL | -

Run 'docker buildx build --help' for more information
```

- Write and build a `Dockerfile` based on `ubuntu:bionic` that installs the packages `fortune` and `fortunes-min` and runs the `fortune` executable (located in `/usr/games/fortune` after you install it). Note that you won’t need to use the `-it` flags when you run the container as fortune doesn’t need `STDIN`. Submit your `Dockerfile` with this lab. Hint: if you’re having trouble writing your Dockerfile, try booting an interactive container and installing both packages. How can you translate what you did interactively to a `Dockerfile`?

- Paste the output of running docker images command after completing questions 1 and 2.

```bash
docker images
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
<none>        <none>    473bae7f8e26   8 seconds ago   129MB
missile       latest    beb684d6a974   19 hours ago    364MB
ubuntu        latest    a0e45e2ce6e6   12 days ago     78.1MB
hello-world   latest    74cc54e27dc4   3 months ago    10.1kB
```

I forgot the `-t` flag when making the `fortune` container so it was created as `none`

- While your three containerized Apache web servers are running in detached mode, paste the output of docker ps.

```bash
docker ps

CONTAINER ID   IMAGE     COMMAND              CREATED              STATUS              PORTS                                     NAMES
1562dc5f5ef2   httpd     "httpd-foreground"   About a minute ago   Up About a minute   0.0.0.0:4002->80/tcp, [::]:4002->80/tcp   goofy_dirac
dfaf2debcc38   httpd     "httpd-foreground"   About a minute ago   Up About a minute   0.0.0.0:4001->80/tcp, [::]:4001->80/tcp   stoic_tharp
76b2360d64dd   httpd     "httpd-foreground"   2 minutes ago        Up 2 minutes        0.0.0.0:4000->80/tcp, [::]:4000->80/tcp   suspicious_stonebraker
```

- Observe that in the output of docker ps, each container has an associated container ID. Explain why containers have IDs/Names rather than being named after the image, for example httpd.

ID's makes the container distinguished, becuase we can run multiple containers of one image, if all are `httpd` we won't be able to tell which is which

- Now go ahead and stop your containers. Paste the command you used to stop one of the containers.

```bash
# list the containers by their IDs
docker stop $(docker ps -q)
1562dc5f5ef2
dfaf2debcc38
76b2360d64dd
```
