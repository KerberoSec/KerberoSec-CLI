### NOTE: There is a more verbose description of the docker exploitation in the [TryHackMe Day-18](https://tryhackme.com/room/adventofcyber3)<br>
#### Here I will show you the way to solve the questions.
<hr>

## TASK-1  What command will list container images stored in your local container registry? 

```docker images``` will list all the containers.

## TASK-2 What command will allow you to save a docker image as a tar archive?

```docker save``` will allow to save the image in .tar format.

## TASK-3 What is the name of the file (including file extension) for the configuration, repository tags, and layer hash values stored in a container image?

Run these command to pull the image from ```public.ecr.aws/h0w1j9u3``` and save the image as aoc.tar and extract the file.<br>
There you will have a file named ```manifest.json``` which has all the details including configurations.

```
docker pull public.ecr.aws/h0w1j9u3/grinch-aoc:latest
docker save -o aoc.tar public.ecr.aws/h0w1j9u3/grinch-aoc:latest
tar -xvf aoc.tar
```

## TASK-4 What is the token value you found for the bonus challenge?

Once extracyed there you will find various folders named as hashes. These are the various layers. Inside a layer there you will find <b>layer.tar</b> file<br>
Extract the tar and enter inside the /root/envconsul directory. There you will find <b>config.hcl</b> file. Cat the file and grep for "token" to see the hash token value.
```cat config.hcl | grep token``` ```token = "7095b3e93005REDACTED2dd558ac11fa"```

<h3><b>That's it for Day-18. Happy Hacking!</b></h3>

