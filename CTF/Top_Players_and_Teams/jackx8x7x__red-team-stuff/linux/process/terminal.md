# Terminal

## Overview

### History

Historically, users accessed a UNIX system using a terminal connected via a serial line (an RS-232 connection).

On early UNIX systems, the terminal lines connected to the system were represented by character devices with names of the form /dev/tty_n_.

## Job Control

The protocol for allowing a user to move between multiple _process groups_ (or _jobs_) within a single _login session_.

{% embed url="https://www.gnu.org/software/libc/manual/html_node/Job-Control.html" %}

### Process Group

#### Jobs

The processes belonging to a single command are called a _process group_ or _job_, e.g., command like:

```bash
$ grep -vE '^ *($|#)' /etc/ssh/sshd_config | less &
[1] 3308
 
[1]+  Stopped                 grep --color=auto -vE '^ *($|#)' /etc/ssh/sshd_config | less
$ ps -H -o sid,pgid,tpgid,ppid,pid,cmd
    SID    PGID   TPGID    PPID     PID CMD
   3298    3298    3315    3165    3298 /bin/bash
   3298    3307    3315    3298    3307   grep --color=auto -vE ^ *($|#) /etc/ssh/sshd_config
   3298    3307    3315    3298    3308   less
   3298    3315    3315    3298    3315   ps -H -o sid,pgid,tpgid,ppid,pid,cmd

```

Processes can be put in another process group using the `setpgid` function, _provided the process group belongs to the same session._

#### Foreground Job

The shell can give unlimited access to the controlling terminal to only one process group at a time. This is called the _foreground job_ on that controlling terminal

#### Background Job

Other process groups managed by the shell that are executing without such access to the terminal are called _background jobs_.

#### Orphaned Process Group

Process groups that continue running even after the session leader has terminated are marked as _orphaned process groups_.

When a process group becomes an orphan, its processes are sent a `SIGHUP` signal.

### Session&#x20;

Usually, new sessions are created by

* the system login program
* process disconnecting from its controlling terminal _when it calls `setsid`_ to become the leader of a new session

### Controlling Terminal

> A shell that supports job control must arrange to control _which job can use the terminal_ at any time. Otherwise there might be multiple jobs trying to read from the terminal at once, and confusion about which process should receive the input typed by the user.
>
>
>
> [28.1 Concepts of Job Control (The GNU Library)](https://www.gnu.org/software/libc/manual/html\_node/Concepts-of-Job-Control.html)

One of the attributes of a process. Child processes created with `fork` inherit this attribute from its parent.

A session leader that has control of a terminal is called the _controlling process_ of that terminal.

## API

### POSIX termios

### Linux ioctl

{% embed url="https://man7.org/linux/man-pages/man2/ioctl_tty.2.html" %}

## Pseudo-terminal Interface

The way programs like `xterm` and `emacs` implement their terminal emulation functionality.

{% embed url="https://www.gnu.org/software/libc/manual/html_node/Pseudo_002dTerminals.html" %}

### Slave

The slave end of the pseudoterminal provides an interface that _behaves exactly like a classical terminal_ for processes expecting to be connected to a terminal.

### Master

Anything that is written on the master end by applications such as

* network login services (`ssh(1)`, `rlogin(1)`, `telnet(1)`)\
  _data read from the pseudoterminal master is sent across the network to a client program that is connected to a terminal or terminal emulator_
* terminal emulators,\
  _data read from the pseudoterminal master is interpreted by the emulators in the same way a real terminal would interpret the data_
* `script(1)`,
* `screen(1)`, and
* `expect(1)`

is provided to the process on the slave end as though it was input typed on a terminal.

Represented by the device file `/dev/ptmx` is a character file with major number 5 and minor number 2.

### The GNU Library API

```c
#include <stdio.h>
#include <unistd.h>
#include <pty.h>

int main()
{   
    int master, slave;
    pid_t child;
    ssize_t c;
    char buf[1024];

    child = forkpty(&master, NULL, NULL, NULL);
    if (child == -1)
        return -1;
    else if (child == 0) {
        printf("[c] hi\n");
    } else {
        printf("[p] master: %u\n", master);
        c = read(master, buf, sizeof(buf));
        printf("[p] read %u bytes from master end:\n", c);
        fflush(stdout);
        write(1, buf, c);
        puts("");
        return 0;
    }
}
```

```bash
$ gcc pty.c -lutil
$ ./a.out
[p] master: 3
[p] read 8 bytes from master end:
[c] hi
```

## Python

### tty

```python
import tty

print(tty.tcgetattr(0))
```

### Pseudo-terminal

#### Usage

We can use the function `spawn` of the Python standard library `pty` to open a new pseudo-terminal, spawn a new process, and connect its control terminal to the slave end.

```python
import pty

pty.spawn("/bin/bash")
```

{% embed url="https://docs.python.org/3/library/pty.html#pty.spawn" %}
Python documentation: pty
{% endembed %}

```bash
$ tty
/dev/pts/0
$ python -c 'import pty;pty.spawn("/bin/bash")'
$ tty
/dev/pts/1
```

#### Implementation

From the source code, we can see [that](https://github.com/python/cpython/blob/main/Lib/pty.py#L193) the `pty.spawn` function will call a function named `fork` which will call `os.forkpty` internally to create a new process and a new pair of pseudo-terminal.

```python
    pid, master_fd = fork()
    if pid == CHILD:
        os.execlp(argv[0], *argv)
```

The new child process [will call](https://github.com/python/cpython/blob/main/Lib/pty.py#L101) `os.setsid()` to become the process group leader.

```python
def fork():
...
    try:
        pid, fd = os.forkpty()
    except (AttributeError, OSError):
        pass
    else:
        if pid == CHILD:
            try:
                os.setsid()
...
        return pid, fd
```

From the implementation of `os.forkpty` found in [`cpython/Modules/posixmodule.c`](https://github.com/python/cpython/blob/main/Modules/posixmodule.c#L8338), we can see that it [calls](https://github.com/python/cpython/blob/main/Modules/posixmodule.c#L8359) `forkpty(3)` to setup the pseudo-terminal.

```c
    pid = forkpty(&master_fd, NULL, NULL, NULL);
    ...
    return Py_BuildValue("(Ni)", PyLong_FromPid(pid), master_fd);
```

After getting the original terminal attributes with [`tcgetattr`](https://docs.python.org/3/library/termios.html#termios.tcgetattr) and putting stdin _in raw mode_, as the [code](https://github.com/python/cpython/blob/main/Lib/pty.py#L199):

```python
    try:
        mode = tcgetattr(STDIN_FILENO)
        setraw(STDIN_FILENO)
```

the function `pty.spawn` will then pass data between master and slave ends in [a loop](https://github.com/python/cpython/blob/main/Lib/pty.py#L205), the parent read input from its stdin and then write it back into the master end:&#x20;

{% code title="cpython/Lib/pty.py" %}
```bash
def _copy(master_fd, master_read=_read, stdin_read=_read):
    ...
    if os.get_blocking(master_fd):
        # If we write more than tty/ndisc is willing to buffer, we may block
        # indefinitely. So we set master_fd to non-blocking temporarily during
        # the copy operation.
        os.set_blocking(master_fd, False)
        try:
            _copy(master_fd, master_read=master_read, stdin_read=stdin_read)
        finally:
            # restore blocking mode for backwards compatibility
            os.set_blocking(master_fd, True)
        return
    high_waterlevel = 4096
    stdin_avail = master_fd != STDIN_FILENO
    stdout_avail = master_fd != STDOUT_FILENO
    i_buf = b''
    o_buf = b''
    while 1:
        rfds = []
        wfds = []
        if stdin_avail and len(i_buf) < high_waterlevel:
            rfds.append(STDIN_FILENO)
        if stdout_avail and len(o_buf) < high_waterlevel:
            rfds.append(master_fd)
        if stdout_avail and len(o_buf) > 0:
            wfds.append(STDOUT_FILENO)
        if len(i_buf) > 0:
            wfds.append(master_fd)

        rfds, wfds, _xfds = select(rfds, wfds, [])
...
        if master_fd in wfds:
            n = os.write(master_fd, i_buf)
            i_buf = i_buf[n:]

        if stdin_avail and STDIN_FILENO in rfds:
            data = stdin_read(STDIN_FILENO)
            if not data:
                stdin_avail = False
            else:
                i_buf += data
```
{% endcode %}

On the other hand, the parent receives the child's output from the master end and then writes it back to its stdout.

```python
        if STDOUT_FILENO in wfds:
            try:
                n = os.write(STDOUT_FILENO, o_buf)
                o_buf = o_buf[n:]
            except OSError:
                stdout_avail = False

        if master_fd in rfds:
            # Some OSes signal EOF by returning an empty byte string,
            # some throw OSErrors.
            try:
                data = master_read(master_fd)
            except OSError:
                data = b""
            if not data:  # Reached EOF.
                return    # Assume the child process has exited and is
                          # unreachable, so we clean up.
            o_buf += data
```

We can use `strace` to trace pseudo-terminal-related system calls invoked by Python and see that how the input data are read from and write to the master end.

{% code overflow="wrap" %}
```bash
$ strace -o pty.strace python3 -c 'import pty;pty.spawn("/bin/bash");'
$ cat pty.strace
...
openat(AT_FDCWD, "/dev/ptmx", O_RDWR)   = 3
ioctl(3, TIOCGPTN, [1])                 = 0
ioctl(3, TIOCSPTLCK, [0])               = 0
ioctl(3, TIOCGPTPEER, 0x102)            = 4
clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f609f731a10) = 17666
close(4)                                = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
ioctl(0, SNDCTL_TMR_CONTINUE or TCSETSF, {B38400 -opost -isig -icanon -echo ...}) = 0
ioctl(0, TCGETS, {B38400 -opost -isig -icanon -echo ...}) = 0
select(4, [0 3], [], [], NULL)          = 1 (in [3])
read(3, "\33[?2004h\33[1;32m\342\224\200[\33[1;34msg-ded"..., 1024) = 209
write(1, "\33[?2004h\33[1;32m\342\224\200[\33[1;34msg-ded"..., 209) = 209
select(4, [0 3], [], [], NULL)          = 1 (in [0])
read(0, "l", 1024)                      = 1
write(3, "l", 1)                        = 1
select(4, [0 3], [], [], NULL)          = 1 (in [3])
read(3, "l", 1024)                      = 1
write(1, "l", 1)                        = 1
select(4, [0 3], [], [], NULL)          = 1 (in [0])
read(0, "s", 1024)                      = 1
write(3, "s", 1)                        = 1
select(4, [0 3], [], [], NULL)          = 1 (in [3])
read(3, "s", 1024)                      = 1
write(1, "s", 1)                        = 1
select(4, [0 3], [], [], NULL)          = 1 (in [0])
read(0, ";", 1024)                      = 1
write(3, ";", 1)                        = 1
select(4, [0 3], [], [], NULL)          = 1 (in [3])
read(3, ";", 1024)                      = 1
write(1, ";", 1)                        = 1
select(4, [0 3], [], [], NULL)          = 1 (in [0])
read(0, "d", 1024)                      = 1
```
{% endcode %}

## Internal

UART driver, which manages the physical transmission of bytes, line discipline instance and TTY driver (`drivers/char/tty_io.c`) are referred to as a _TTY device._

{% embed url="https://docs.kernel.org/driver-api/tty/index.html" %}

### TTY Line Discipline

Every character received by the kernel (both from devices and users) is passed through a preselected [TTY Line Discipline](https://docs.kernel.org/driver-api/tty/tty\_ldisc.html).

TTY line discipline process all incoming and outgoing character from/to a tty device in two modes:

* canonical mode providing an editing buffer and editing commands likes backspace, erase word, clear line, and reprint
* raw mode

{% embed url="https://docs.kernel.org/driver-api/tty/tty_ldisc.html" %}

The default discipline providing line editing is called N\_TTY which is implemented in `drivers/char/n_tty.c`.

### TTY Driver

### Characters Handling

2 queues exist for handling input characters:

* from the terminal device to the reading processes
* output characters transmitted from processes to the terminal

If terminal echoing is enabled, then the terminal driver automatically appends a copy of any input character to the end of the output queue, so that input characters are also output on the terminal.

### Reference

{% embed url="https://www.linusakesson.net/programming/tty/" %}
