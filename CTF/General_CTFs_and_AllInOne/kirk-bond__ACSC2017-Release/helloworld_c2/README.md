# Hello World C 2 (C, exploitation)

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

Trusting user input. The suid\_c\_wrapper will take anything as the second arg as long as it doesn't have a space in it and pass it to a system call as root. Exploitation is trivial if your bash fu is good enough.

## Setup

After running the setup script, give the username, password, and server IP/hostname to competitors.

## Solution

Check solution.sh

## Demo

~~~bash
ssh -p 35000 helloworld-c2@badsectorlabs.com
Password: helloworld
~~~

