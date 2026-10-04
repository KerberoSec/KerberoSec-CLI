#containers 

The syntax for Docker can be categorized into four main groups:

- Running a container
- Managing & Inspecting containers
- Managing Docker images
- Docker daemon stats and information

## Managing Docker Images

DOCKER PULL
- need an image (instructions)
- use Nginx image to run a web server within a container
- images have label tags (variations of the image)
- `docker image [command] --help` 

1. `docker pull <image name>:<tag>`

|   |   |   |   |
|---|---|---|---|
|**Docker Image**|**Tag**|**Command Example**|**Explanation**|
|ubuntu|latest|docker pull ubuntu<br><br>**- IS THE SAME AS -**<br><br>docker pull ubuntu:latest|This command will pull the latest version of the "ubuntu" image. If no tag is specified, Docker will assume you want the "latest" version if no tag is specified.<br><br>It is worth remembering that you do not always want the "latest". This image is quite literally the "latest" in the sense it will have the most recent changes. This could either fix or break your container.|
|ubuntu|22.04|docker pull ubuntu:22.04|This command will pull version "22.04 (Jammy)" of the "ubuntu" image.|
|ubuntu|20.04|docker pull ubuntu:20.04|This command will pull version "20.04 (Focal)" of the "ubuntu" image.|
|ubuntu|18.04|docker pull ubuntu:18.04|This command will pull version "18.04 (Bionic)" of the "ubuntu" image.|

- pull
- ls  shows `repository, tag, image ID, created, size`
- rm `docker image rm <name>:<tag>`
- build

---
- `docker pull`
- `docker image ls`
- `docker pull tryhackme`
- `docker pull tryhackme:1337`
----

## 1st container

The `docker run` creates running containers from images, command run from `Dockerfile`

- `docker run [options] <image name> [command] [args]`
- `-it` = interactive which allows interaction with container directly 
- `docker run -it helloworld /bin/bash` , success when terminal changes user account & hostname (container ID, found using `docker ps`, "root@847398473987")

common docker options
```
-d   detached mode,runs in background          docker run -d helloworld

-it  interactive shell                         docker run -it helloworld

-v   volume, mount dir or file from host to container location
        docker run -v /host/os/dir:/container/dir helloworld

-p   bind to a port on host OS to port being exposed in container
        docker run -p 80:80 webserver

-rm  remove container once finished running    docker run -rm helloworld

-name  names the container (2 rando words)     docker run --name helloworld

```

- `docker ps -a` lists all containers

---
- `docker run -it`
- `docker run -d`
- `docker run -p 80:80`
- `docker ps`
- `docker ps -a`
---

### Dockerfiles

Dockerfiles is a formatted text file which essentially serves as an instruction manual for what containers should do and ultimately assembles a Docker image.

- INSTRUCTION argument

```
FROM     sets a base image OS, must have          FROM ubuntu
RUN      execute commands                         RUN whoami

COPY     copies files from local system to working directory in container
         COPY /home/<user>/folder1/app/

WORKDIR  sets the working directory              WORKDIR /

CMD      determines what command is run when container starts
         CMD /bin/sh -c script.sh

EXPOSE   tells what port to publish container running
         EXPOSE 80        (docker run -p 80:80)
```

DOCKERFILE
- not all Linux commands will be available and may need to be installed
```
# comment

# use Ubuntu 22.004 as base OS of container
FROM ubuntu:22.04

# set working director to the root of container
WORKDIR /

# create helloworld.txt
RUN touch helloworld.txt
```

### Build Docker Container

- must have Dockerfile
- `docker build -t helloworld .`  names container 'helloworld' and located in current working directory
- `docker image ls` to see if image has been built (2 copies of images will be shown)

```
helloworld  latest  4g8279982gv 2 minutes ago  77.8MB
ubuntu      22.04   2d34hd73377 10 days ago    77.8MB
```

### Dockerfile upgrade

- as you add FROM and RUN to dockerfile it adds to build time, have as few layers as possible
- install Apache2 web server, start service at startup (1 service per container!)
- add networking EXPOSE 80

```yml
# THIS IS A COMMENT
FROM ubuntu:22.04

# Update the APT repository to ensure we get the latest version of apache2
RUN apt-get update -y 

# Install apache2
RUN apt-get install apache2 -y

# Tell the container to expose port 80 to allow us to connect to the web server
EXPOSE 80 

# Tell the container to run the apache2 service
CMD ["apache2ctl", "-D","FOREGROUND"]
```

- `docker build -t webserver . `
- `docker run -d --name webserver -p 80:80 webserver`
- go to IP address on local machine

chaining dockerfile commands is faster

```yml
FROM ubuntu:latest
RUN apt-get update -y && apt-get upgrade -y && apt-get install apache2 -y && apt-get install net-tools
```

---
- from
- run
- build
- -t
---

## Docker Compose

compose allows multiple containers (apps) to interact with each other when needed while running in isolation from another
- each app = 'micro service'
- `compose` creates all of the micro services all at once
- needs to be installed: https://docs.docker.com/compose/install/
- need `docker-compose.yml` file

compose commands

```
up      re/create/build and start containers in file   docker-compose up
start   starts prebuilt containers specified in file   docker-compose start
down    stop & delete container specified in file      docker-compose down
stop    stops containers specified in file             docker-compose stop
build   builds containers (no start) specified in file docker-compose build
```

EXAMPLE
- e-commerce website running Apache
- website uses MySQL database

manually build 2 containers
```
1. docker network create ecommerce
2. (Apache) docker run -p 80:80 --name webserver --net ecommerce webserver
3. (MySQL) docker run --name database --net ecommerce webserver
4. docker-compose up
```

efficient method
```
have docker-compose.yml file
(container 1)
docker run -name webserver -p 80:80
(container 2)
docker run --name database
```

### Dockerfile-compose

- different format than dockerfile and indentation is required in YAML

```
version    top of file, version of Compose            '3.3'
services   beginning of container mgmt                services:
<name>     actual name of container                   webserver
build      directory contains Dockerfile              ./webserver
ports      ports to be exposed                        '80:80'
volumes    lists dirs to be mounted             './home/<user>/webserver/:/var/www/html'
environment environment variable (not secure)         MYSQL_ROOT_PASSWD=hello
image      what image container being built           mysql:latest
networks   what networks container will be part of    ecommerce

```

`docker-compose.yml`

```yml
version: '3.3'
services:
  web:
    build: ./web
    networks:
      - ecommerce
    ports:
      - '80:80'

  database:
    image: mysql:latest
    networks:
      - ecommerce
    environment:
      - MYSQL_DATABASE=ecommerce
      - MYSQL_USERNAME=root
      - MYSQL_ROOT_PASSWORD=helloword
    
networks:
  ecommerce:
```

---
- up
- down
- `docker-compose.yml`
---

## Docker sockets

install Docker you also install Docker Client and Docker Server

- socket for storing message sent
- socket for storing message delivered

Docker works with both sockets (Interprocess Communication IPC)
- docker.sock 
- interact with Docker API using Postman 

---
- interprocess communication
- API
---

Connect to the machine. What is the name of the container that is currently running?
- click on tab Intro to Docker (Not the THM AttackBox)
- `docker ps -a`
- `cloudisland`

`docker run -name webserver -p 80:80`
- `docker run -d --name webserver -p 80:80 webserver` 
- ` http://x-x-x-x.p.thmlabs.com `
- ` THM{WEBSERVER_CONTAINER} `

