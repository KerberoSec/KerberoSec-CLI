# Temp Files (python, exploitation)

## Usage

~~~
usage: temp_files.py [-h] [-p PORT] [-v]

Simple File Storage

optional arguments:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  The port to serve the python interpreter on.
  -v, --verbose         Enable debug messages
~~~

## Vulnerability

Insecure temporary file usage. Users can overwrite temporary files from other threads. Since the version option writes a command to a file and then executes it, a user can overwrite the version command with an arbitrary commmand.

## Setup

~~~
pip install -r requirements.txt
~~~

Give the `temp_files.py` file to competitors. Run the program on an accessible server. Give the competitors the IP and port the challenge is running on.

This should be docker'd or run as a user that has no write access to any of the challenge files or flag.

## Solution

Check solution.py

## Demo

~~~bash
nc badsectorlabs.com 35003
~~~

