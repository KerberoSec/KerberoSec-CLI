# :smirk_cat: Over the Wire: Wargames
[![Build Status](https://travis-ci.com/facevedom/over-the-wire.svg?branch=master)](https://travis-ci.com/facevedom/over-the-wire)

My scripts to solve [Wargames from Over the Wire](http://overthewire.org/wargames/).

Run the script, or pull/build and run the Docker container.

## Sample
This is what output looks like

*[Image: sample output]*

## Requirements
- When running the main script manually
  - Bash
  - Sshpass
- When using  Docker
  - Docker  

## Usage

#### Manually :metal:
```
cd 1-Bandit
chmod +x *.sh
./hack_away.sh
```

#### With Docker :whale2:
You have two alternatives:

- Pulling public pre-built image
```bash
docker pull facevedom/over-the-wire
```

- Building from Dockerfile
```bash
docker build -t facevedom/over-the-wire .
```

Then, simply run the container
```bash
docker run facevedom/over-the-wire
```