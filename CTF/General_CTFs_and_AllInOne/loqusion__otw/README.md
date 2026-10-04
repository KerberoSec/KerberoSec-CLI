# otw

##### A password manager for [OverTheWire](https://overthewire.org).

## Installation

```bash
sudo apt install ssh sshpass
git clone https://github.com/Flandre-X/otw.git
```

> **Warning:** ssh and sshpass are required to use this utility. Make sure they are accessible from `$PATH`.

### Optional

```bash
sudo apt install xclip xdg-utils
```

## Introduction

This utility saves manual typing and copy-pasting by:

1. Managing level passwords automatically
2. Generating ssh commands

## Usage

> **Warning:** otw will store passwords within the current working directory. Make sure you always run it in the same directory, or else unexpected results will ensue!

Running otw assumes that `<game>` exists within the current directory. You can create it by running `mkdir <game>`, e.g. `mkdir bandit`.

```bash
$ ./otw <game> <level>
# e.g.: ./otw bandit 3
```

Don't worry about deleting the trailing `/` if you use autocomplete! otw is smart and will figure out what you mean. Thus, the following line is equivalent:

```bash
$ ./otw <game>/ <level>
```

You can also omit `<level>`, which tells otw to use the highest level you reached (or level 0 if no level passwords are found).

```bash
$ ./otw bandit
```

To see more options, run `./otw --help`.
