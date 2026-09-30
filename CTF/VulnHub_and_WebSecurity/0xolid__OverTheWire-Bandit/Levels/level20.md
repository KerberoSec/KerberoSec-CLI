# Bandit Level 20

> There is a setuid binary in the homedirectory that does the following: it makes a connection to localhost on the port you specify as a commandline argument. It then reads a line of text from the connection and compares it to the password in the previous level (bandit20). If the password is correct, it will transmit the password for the next level (bandit21).

## Login

```shell
ssh bandit20@bandit.labs.overthewire.org -p 2220

0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
```

## Solution

```shell
ls -lah
```

```shell
./suconnect
```

```text
Usage: ./suconnect <portnumber>
This program will connect to the given port on localhost using TCP. 
If it receives the correct password from the other side, the next password is transmitted back.
```

Here we need to use `netcat` to create a listening server, to receive the password from the script.
We have to add `&` to make the process run in the background, so we can run another commands.

```shell
echo "0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO" | nc -l 1234 &
```

```shell
./suconnect 1234
```

```text
Read: 0qXahG8ZjOVMN9Ghs7iOWsCfZyXOUbYO
Password matches, sending next password

EeoULMCra2q0dSkYj561DX7s1CpBuOBt
```

