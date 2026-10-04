# OverTheWire Wargames Solutions
[![Bandit](https://img.shields.io/badge/Bandit-34%2F34-success?style=flat-square)](bandit/)
[![Krypton](https://img.shields.io/badge/Krypton-6%2F7-yellow?style=flat-square)](krypton/)
[![Natas](https://img.shields.io/badge/Natas-17%2F34-orange?style=flat-square)](natas/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg?style=flat-square)](https://www.python.org/downloads/)

Educational writeups and automated Python solvers for [OverTheWire](https://overthewire.org/wargames/) wargames.

## About

This repository contains structured solutions for various OverTheWire wargames.

Each level has its own README that explains the underlying concepts and techniques rather than just providing answers.

**Krypton** and **Natas** feature fully automated Python solvers. Each script automatically retrieves the password for the next level.

## Repository structure (quick map)
- `bandit/`: Markdown walkthroughs (`level00.md` … `level33.md`)
- `krypton/`: Per-level solvers + crypto helpers in `krypton/lib/`
- `natas/`: Per-level solvers + session utilities in `natas/lib/`

## Running the Solvers

The **Krypton** and **Natas** solvers are fully automatic. Simply run the script and it will output the password for the next level:

```bash
# Krypton (Cryptography)
uv run krypton/level00/solve.py

# Natas (Web Security)
uv run natas/level00/solve.py
```

Each game directory contains its own README with detailed setup instructions and connection information.

## Ethical Notice

These solutions are for educational purposes only.

For most games, passwords and sensitive credentials are replaced with placeholders (e.g., `<password_level_X>`). For Krypton, early “passwords” are typically non-sensitive puzzle strings and may be included as-is.

Do not:
- Share actual passwords publicly
- Use these techniques against systems you do not own
- Skip the learning process by copying solutions without understanding

The goal is to learn security concepts, not to collect flags.

## Games Covered

| Game                | Description               | Progress    |
|---------------------|---------------------------|-------------|
| [Bandit](bandit/)   | Linux command line basics | **34 / 34** ✅ |
| [Krypton](krypton/) | Cryptography              | **6 / 7**  🟡 |
| [Natas](natas/)     | Web security              | **17 / 34** 🟠|

## License

Licensed under the MIT License. See `LICENSE`.
