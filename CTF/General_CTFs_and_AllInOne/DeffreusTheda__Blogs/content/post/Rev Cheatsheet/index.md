---
title: CTF Cheatsheet
slug: ctf-cheatsheet
date: 2026-09-29
description: An ever-growing (hopefully) cheatsheet for mostly rev-eng CTF
categories:
  - Blog
---
When there's an item named "Effie's," then I have made a script for it. You can see them [here](https://github.com/DeffreusTheda/unix-bin). They can just be a shortcut or an analysis script.

# Reverse Engineering

- A (bad) general script for analyzing binaries
	- Effie's: `re`

## By Type of Challenge

- Constraint solver/certain flag checkers
	- [Z3](https://github.com/Z3Prover/z3): The Z3 Theorem Prover.
	- Effie's: `mkz3`

# Utilities

- URL encoding and decoding
	- Effie's: `urld`, `urle`
	- https://www.urlencoder.org/
- [ripgrep](https://github.com/BurntSushi/ripgrep): ripgrep recursively searches directories for a regex pattern while respecting your gitignore

# By Format

- `.img`
	- [volatility3](https://github.com/volatilityfoundation/volatility): An advanced memory forensics framework
- `.zip`
	- Effie's: 

# By Tech Stack

- [WebAssembly](https://webassembly.org/)
	- [wabt](https://github.com/WebAssembly/wabt): The WebAssembly Binary Toolkit.

