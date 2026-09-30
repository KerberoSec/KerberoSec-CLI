# Bandit Level 0 -> 1

## Goal

Log into the game using SSH and retrieve the password for level 1.

## Key Concept

Basic SSH connection and reading files.

## Solution

Connect to the server:

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
```

Password for bandit0 is `bandit0` (given on the website).

Once logged in, read the readme file:

```bash
cat readme
```
