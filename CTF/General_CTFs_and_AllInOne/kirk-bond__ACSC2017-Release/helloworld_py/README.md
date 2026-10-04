# Hello World Py (python, exploitation)

## Usage

Ubuntu:

~~~
./ubuntu_setup.sh
~~~

Other Linux:

~~~
Modify the ubuntu_setup.sh to fit your distro. Good luck!
~~~

## Vulnerability

Bad permissions. The `log.py` file is user writable and is imported by the `helloworld.py` script. When `helloworld.py` is run as root, the user can modify `log.py` with a malicious log function which will execute arbitrary commands as root.

## Setup

After running the setup script, give the username, password, and server IP/hostname to competitors.

## Solution

Check solution.sh

## Demo

~~~bash
ssh -p 35000 helloworld-py@badsectorlabs.com
Password: helloworld
~~~

