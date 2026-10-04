# Container

## Overview

A restricted runtime environment _for a set of processes_ as a lighter-weight alternative, called operating system level virtualization, to the virtual machine for the services isolation purpose.

It's possible to create containers manually, although tools, like docker and LXC, exist for tasks of creating and managing containers effectively.

## Docker

### History

The first versions of Docker were built on LXC.

### Overlay Filesystems

The Linux kernel module `OverlayFS` layers two directories on a single Linux host and presents them as a single directory.

> In rootless mode, Podman uses the FUSE version of the overlay filesystem.

{% embed url="https://docs.docker.com/storage/storagedriver/overlayfs-driver/" %}

### Networking

Docker first creates a new network interface (_usually docker0_) on the host.

When a container is created, Docker will create a virtual interface, as a link between two network interfaces one of which lies in the new namespace, on the host.
