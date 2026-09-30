#containers 

- https://tryhackme.com/room/introtocontainerisation
- the module before Intro to Docker

containerization is the process of packaging an application and the necessary resources (such as libraries and packages) required into one package named a container.

Containerization platforms remove this headache by packaging the dependencies together and “isolating”

3 containers on single computer
```
physical_computer
  computer_OS_host
    Docker_engine
	     L container1/
	         L app1
	         L enviro
	     L container2/
	         L app2
	         L enviro
	     L container3/
	         L app3
	         L enviro
```

---
What is the name of the kernel feature that allows for processes to use resources of the Operating System without being able to interact with other processes?
- namespace 

In a **normal** configuration, can other containers interact with each other? (yay/nay)
- nay
---

Docker is a relatively hassle-free, extensive and open source containerization platform. The Docker ecosystem allows applications (images) to be deployed, managed and shared with ease

Docker is a smart choice for running applications, published images shared and end user just pulls (downloads) the image and run it with Docker

Docker Engine = API that runs on host OS, communicates CPU, RAM, networking, disk

Docker engine allows:
- connect containers together, web app and other container for database
- export and import apps (images)
- transfer files between OS and container

Docker uses YAML

---
What does an application become when it is published using Docker? Format: An xxxxx (fill in the x's)
- an image
  
What is the abbreviation of the programming syntax language that Docker uses?
- yaml
---

Originally created by Solomon Hykes in 2013
Docker started as an internal project for dotCloud (a PaaS provider), where it was then showcased in PyCon in 2013 and then quickly made open-source.

containerization's original concepts started in 1979 with Unix V7

Docker = free, compatible, efficient & minimal

minimal Ubuntu is 100MB stored 1x and used multiple times 
VM Ubuntu is 1GB fresh install

Docker documentation: https://docs.docker.com/

Docker images have instructions how the container should be built
- can be updated, shared, exported, uploaded public / private
- DockerHub and GitHub
- Better security, knowing exactly what runs within a container can reduce the risk of unnecessary packages becoming vulnerable and posing a security risk.
- cheaper to run, less power , a few containers on $5 cloud provider VPS (no hardware, less memory, disk space)

---

Namespaces essentially segregate system resources such as processes, files and memory away from other namespaces.

every process running in Linux is assigned
- namespace
- process id (PID)

Processes can only "see" other processes that are in the same namespace
- `PID 0` started when system boots then increments
- `ps aux` shows running processes

```
App
Container OS (minimal)
Container engine
Physical machine OS
Physical machine
```

- ` THM{APPLICATION_SHIPPED} `

