# Bandit Wargame Solutions

This repository contains my personal solutions to the OverTheWire Bandit wargame challenges.

## How to Login

You can connect to any Bandit level using SSH directly or with the custom `bandit` executable.
The password for level 0 is **`bandit0`**.

### Using SSH

To log in to level 0:

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
```

### Using the Custom Executable

Alternatively, use the `bandit` script to connect easily:

```bash
./bandit 0
```

This will connect you to the corresponding level without typing the full SSH command.

## Structure

- Each level is in its own folder named `bandit<X>`, where `<X>` is the level number.
- Inside each folder:
  - `cmd` - the command(s) used to solve the level.
  - `password` - the password for the next level.

## Usage

Work through the levels in order, using the commands stored in each folder to progress.

---

Made for personal use and reference.
