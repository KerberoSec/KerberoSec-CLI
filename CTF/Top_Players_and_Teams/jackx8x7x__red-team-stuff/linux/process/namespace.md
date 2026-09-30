# Namespace

## Overview

A namespace wraps a global system resource in an abstraction that makes it appear to the processes within the namespace that _they have their own isolated instance of the global resource_.

{% embed url="https://man7.org/linux/man-pages/man7/namespaces.7.html" %}

## API

### System Calls

We can use various system calls to create, or join a new, or an existing namespace.

{% tabs %}
{% tab title="clone(2)" %}
The `clone`(2) system call creates a new process.

If the flags argument of the call specifies one or more of the `CLONE_NEW*` flags listed below, then _new namespaces are created_ for each flag, and _the child process is made a member of those namespaces._
{% endtab %}

{% tab title="setns(2)" %}
The `setns`(2) system call allows the calling process to join an _existing_ namespace.

The namespace to join is specified via a file descriptor that refers to one of the `/proc/[pid]/ns` files described below.
{% endtab %}

{% tab title="unshare(2)" %}
The `unshare`(2) system call _moves the calling process to a new namespace_.

If the flags argument of the call specifies one or more of the `CLONE_NEW*` flags listed below, then new namespaces are created for each flag, and the calling process is made a member of those namespaces.Various ioctl(2) operations can be used to discover information about namespaces. These operations are described in ioctl\_ns(2).Various ioctl(2) operations can be used to discover information about namespaces. These operations are described in ioctl\_ns(2).
{% endtab %}

{% tab title="ioctl(2)" %}
Various `ioctl`(2) operations can be used to discover information about namespaces. These operations are described in `ioctl_ns`(2).
{% endtab %}
{% endtabs %}

### The \`proc\` Filesystem

The kernel assigns each process a symbolic link per namespace kind in `/proc/<PID>/ns/`. Since Linux 3.8, these files appear as symbolic links.

If two processes are in the same namespace, then the device IDs and inode numbers of their `/proc/<pid>/ns/xxx` symbolic links will be the same. We can check this using the `stat.st_dev` and `stat.st_ino` fields returned by stat(2).

We can use `readlink` to read the content of the symbolic link:

```bash
$ readlink /proc/$$/ns/uts
uts:[4026531838]
```

## Namespace Types

<table><thead><tr><th width="111">Type</th><th width="188">Flag used in APIs</th><th width="221">Man Page</th><th width="192">Isolates</th></tr></thead><tbody><tr><td>Cgroup</td><td><code>CLONE_NEWCGROUP</code></td><td><code>cgroup_namespaces</code></td><td>Cgroup root directory</td></tr><tr><td>IPC</td><td><code>CLONE_NEWIPC</code></td><td><code>ipc_namespaces</code></td><td>System V IPC, POSIX message queues</td></tr><tr><td>Network</td><td><code>CLONE_NEWNET</code></td><td><code>network_namespaces</code></td><td>Network devices, stacks, ports, etc.</td></tr><tr><td>Mount</td><td><code>CLONE_NEWNS</code></td><td><code>mount_namespaces</code></td><td>Mount points</td></tr><tr><td>PID</td><td><code>CLONE_NEWPID</code></td><td><code>pid_namespaces</code></td><td>Process IDs</td></tr><tr><td>Time</td><td><code>CLONE_NEWTIME</code></td><td><code>time_namespaces</code></td><td>Boot and monotonic clocks</td></tr><tr><td>User</td><td><code>CLONE_NEWUSER</code></td><td><code>user_namespaces</code></td><td>User and group IDs</td></tr><tr><td>UTS</td><td><code>CLONE_NEWUTS</code></td><td><code>uts_namespaces</code></td><td>Hostname and NIS domain name</td></tr></tbody></table>
