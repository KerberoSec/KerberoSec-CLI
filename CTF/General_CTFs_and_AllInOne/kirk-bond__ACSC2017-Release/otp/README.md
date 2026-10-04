# OTP \[One time pad] (python, crypto)

## Usage

~~~
usage: otp.py [-h] [-p PORT] [-v]

OTP: The only unbreakable encryption

optional arguments:
  -h, --help            show this help message and exit
  -p PORT, --port PORT  The port to serve the OTP challenge on.
  -v, --verbose         Enable debug messages
~~~

## Vulnerability

Key reuse. The code gets a random key each time, but its only 512 bytes. Messages longer than 512 bytes will reuse the key. Because the plaintext is user controlled, exploitation is relatively trivial (for a crypto problem).

## Setup

Give the code to competitors with a null'd FLAG variable. Run the program on an accessible server. Give the competitors the IP and port the challenge is running on.

## Solution

Check solution.sh

## Demo

~~~bash
nc badsectorlabs.com 35002
~~~

