# Hello World C (C, exploitation)

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

Trusting user input. The suid\_c\_wrapper will take anything as the second arg and pass it to a system call as root. Exploitation is trivial.

## Setup

After running the setup script, give the username, password, and server IP/hostname to competitors.

## Solution

Check solution.sh

## Demo

~~~bash
ssh -p 35000 helloworld-c@badsectorlabs.com
Password: helloworld
~~~

