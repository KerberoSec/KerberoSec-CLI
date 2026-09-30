# Cyber Haiku (python, exploitation)

## Usage

~~~
usage: cyber_haiku.py [-h] [-p PORT] [-v]

Cyber Haiku Generator 9000

optional arguments:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  The port to serve the Cyber Haiku challenge on.
  -v, --verbose         Enable debug messages
~~~

## Vulnerability

Trusting user input. The user can supply information that is used as an object's member, which is referenced by the code later. Because of this, the user can supply a string that will reference the flag. 

## Setup

Give the code to competitors with a null'd FLAG variable. Run the program on an accessible server. Give the competitors the IP and port the challenge is running on.

## Solution

Check solution.sh

## Demo

~~~bash
nc badsectorlabs.com 35001
~~~

