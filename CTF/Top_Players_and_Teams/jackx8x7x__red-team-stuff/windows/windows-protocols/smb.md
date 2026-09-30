# SMB

## SMB

Server Message Block, a _stateful_ protocol defines extensions to the existing Common Internet File System (CIFS) protocol by introducing new flags, extended requests and responses, and new Information Levels.

SMB can be used for Files, printers, or serial port sharing.

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb/7c30a2a0-9c9a-423b-9982-7a49979af7d4" %}

### Extensions

Extensions to the CIFS protocol include:

* TCP transport support besides SMB transport.

### Session

Clients establish a session with a server and use that session to make a variety of requests to access:

* files
* printers
* inter-process communication (IPC) mechanisms, such as named pipes

### Commands

A set of SMB messages that are exchanged to perform an operation.

An SMB command is typically identified by a unique _command code_ in the _message headers._

## SMBv2/3

These protocols, or _dialects_, borrow and extend concepts from the Server Message Block (SMB) Version 1.0 Protocol

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/5606ad47-5ee0-437a-817e-70c366052962" %}

### Extensions

Refer to [MS-SMB2: Overview](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-smb2/4287490c-602c-41c0-a23e-140a1f137832) to see a list of extensions to SMBv1.

## Relationship to Other Protocols

### Overview

Information about protocols used by the SMB or use SMB.

 (1) (1).png>)

{% embed url="https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/06451bf2-578a-4b9d-94c0-8ce531bf14c4" %}

### Authentication

The SMB 2 Protocol uses _Simple and Protected GSS-API Negotiation (SPNEGO)_, as described in [\[MS-AUTHSOD\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/953d700a-57cb-4cf7-b0c3-a64f34581cc9) section [2.1.2.3.1](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-authsod/6b954906-f7d3-4bfc-b00f-b73ba7cf200b) and specified in [\[RFC4178\]](https://go.microsoft.com/fwlink/?LinkId=90461) and [\[MS-SPNG\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-spng/f377a379-c24f-4a0f-a3eb-0d835389e28a), which in turn can rely on

* the Kerberos Protocol Extensions (as specified in [\[MS-KILE\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-kile/2a32282e-dd48-4ad9-a542-609804b02cc9)) or
* the NT LAN Manager (NTLM) Authentication Protocol (as specified in [\[MS-NLMP\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-nlmp/b38c36ed-2804-4868-a9ff-8dd3182128e4)).

### The Server Service Remote

Refer to [\[MS-SRVS\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-srvs/8993db36-03d3-4602-aad0-0fdd503a4e08).

### Remote Procedure Call (RPC)

The Remote Procedure Call Protocol Extensions, as specified in [\[MS-RPCE\]](https://learn.microsoft.com/en-us/openspecs/windows\_protocols/ms-rpce/290c38b1-92fe-4229-91e6-4fc376610c15), define an RPC over SMB Protocol or SMB 2 Protocol sequence that can use SMB 2 Protocol named pipes as its underlying transport.

### Distributed File System (DFS)

## Enumeration

We can use commands or packages like `smbclient`, `crackmapexec`, or `impakcet,` etc. to enumerate SMB services in a Windows network environment.

### Null Session Authentication

We can use `smbclient` to test if null session authentication is enabled:

```bash
$ smbclient -N -L '\\host\'
```

### File Sharing

Use \`smbclient\` to download files recursively:

```bash
$ smbclient -N \\\\coder.htb\\Development
smb: \> mask ""
smb: \> recurse
smb: \> prompt
smb: \> mget *
```

## Impacket

We try to understand the SMB protocols by inspecting the Impacket example modules.

