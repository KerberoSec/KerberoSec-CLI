# overflow5 (C, exploitation)

## Usage

Ubuntu:

~~~
./setup_ubuntu.sh
~~~

Other Linux:

~~~
Modify the ubuntu_setup.sh to fit your distro. Good luck!
~~~

## Vulnerability

Really bad coding practices/trusting user input. The binary uses `gets()` and has no compile time protections.

## Setup

After running the setup script, give the username, password, and server IP/hostname to competitors.

## Solution

Check solution.txt

## Demo

~~~bash
ssh -p 36000 overflow5@badsectorlabs.com
Password: overflow
~~~

