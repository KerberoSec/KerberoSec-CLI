<!-- Links -->
[bmac]: https://buymeacoffee.com/zh11f
[trakteer]: https://trakteer.id/zh11f

# Caesar Cipher Tools
![PyPI: Python Version](https://img.shields.io/pypi/pyversions/3?style=for-the-badge&logo=python&logoColor=%23e5e500&labelColor=%231f1f1f&color=%23306998
)
[![GitHub Release](https://img.shields.io/github/v/release/zhiif/caesar-cipher-tools?style=for-the-badge&logo=linux&logoColor=white&labelColor=%231f1f1f&color=%23ffcc33)
](https://github.com/zhiif/caesar-cipher-tools/releases)
[![GitHub Release](https://custom-icon-badges.demolab.com/github/v/release/zhiif/caesar-cipher-tools?filter=v1.0.0-exe-beta&style=for-the-badge&logo=icons8-windows-11&logoColor=white&label=Pre-release&labelColor=%231f1f1f&color=%23004fe1)](https://github.com/zhiif/caesar-cipher-tools/releases/tag/v1.0.0-exe-beta)
[![GitHub License](https://custom-icon-badges.demolab.com/github/license/zhiif/caesar-cipher-tools?style=for-the-badge&logo=law&logoColor=white&labelColor=%231f1f1f&color=khaki)](https://github.com/zhiif/caesar-cipher-tools?tab=GPL-3.0-1-ov-file)
[![GitHub last commit](https://custom-icon-badges.demolab.com/github/last-commit/zhiif/caesar-cipher-tools%2Fmaster?style=for-the-badge&logo=git-commit&labelColor=%231f1f1f&color=%23ff1100)](https://github.com/zhiif/caesar-cipher-tools/commits/)

*[Image: scrcpy]*

This is a tool used to `encrypt` and `decrypt` Caesar's cipher text. This tool can run on `Linux, termux, and Windows`. For now, we have released the Python version which you can git clone. currently, we are developing the exe version, which later you only need to download the exe file without having to install all the requirements.

## Contents
- [Description](#description)
- [Requirements](#requirements)
- [Installation](#installation)
- [Use](#use)
- [Previews](#previews)
##

### Description
This tool has the function of encrypting and decrypting the Caesar cipher text. Make sure you have met all the requirements

### Requirements
> [!IMPORTANT]
>: `git` to clone the repository
>: This tool run on `Python3`. Install it if you don't have it.
>: Root privilege (for `Linux` users)
##### Installation git
```bash
# linux/termux
apt install git

# windows
Visit the official Git site for installation instructions.
```
> [!TIP]
> Download [`git`](https://git-scm.com/download/win) for windows

##### Installation Python3
```bash
#linux/termux
apt install python3

#windows
Download from the official website or the Microsoft Store.
```
> [!TIP]
> Download [`Python`](https://www.python.org/downloads/windows/) for windows

### Installation
#### Linux/termux
```bash
# Clone repository
git clone https://github.com/zhiif/caesar-cipher-tools.git

# Go to the directory.
cd caesar-cipher-tools

# See directory contents.
ls

# Grant file permissions
chmod +x caesar
```

> [!TIP]
> If you are using `Linux`, log in as `root user`, or Add `sudo` at the beginning of the command, except for `cd caesar-cipher-tools`.
#### Windows
```bash
# Clone repository
git clone https://github.com/zhiif/caesar-cipher-tools.git

# Go to the directory.
cd caesar-cipher-tools

# See directory contents.
dir
```
> [!TIP]
> If you using `windows` Make sure you have met all the [`requirements`](#requirements)
### Use
 The execution is quite simple. Just type the following command:
```bash
# Linux/termux
./caesar

# windows
sh caesar
```

### Previews
|Encrypt|Decrypt|
|--|--|
|![img](https://github.com/zhiif/asset/blob/main/asset/encrypt.gif)|![img](https://github.com/zhiif/asset/blob/main/asset/decrypt.gif)|
