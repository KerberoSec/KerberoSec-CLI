# PWNlemetry

## The Challenge

You are an intelligence operative. Yesterday you intercepted a shredded slip of
paper from a courier who works for TeleMetrics, Inc., a glossy startup that
sells “smart telemetry” agents to datacenters. Inside the courier’s garbage you
found a USB stick and a single note: “PWNlemetry: reliable agent. Deploy
widely. Heartbeat to HQ.”

You loaded the stick and discovered a single binary. It looks legitimate: a
monitoring agent that can run as a client or a server. But you know how these
things go: companies that collect telemetry sometimes collect more than they
say. Your analysts believe TeleMetrics is quietly harvesting host inventories
from its clients and keeping them on centralized servers. If you can get the
list of monitored hosts from one of these servers, you might learn where
they’ve been deployed and what they’re watching.

Your mission, if you accept it: obtain the list of all monitored hosts from the
running PWNlemetry service.

## Description

The challenge binary is a telemetry agent that can run in either client or
server mode. The client collects system information and sends it to the server,
which stores the data. The information is collected through a text-based
connection. Various commands can be sent to the server:

- REGISTER: register a new host to the service
- UPDATE: add a new data point for a registered host
- EDIT: modify the hostname of a registered host
- VIEW: inspect the data for a registered host
- DUMP: retrieve the list of all registered hosts and their data
- PING: pong

## Quick root-cause summary

Using the `checksec` utility from pwntools, we can start to understand what we
are analyzing:

```bash
checksec pwnlemetry
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    SHSTK:      Enabled
    IBT:        Enabled
    Stripped:   No
```

The binary is a 64-bit ELF compiled without PIE, with full RELRO and stack
canaries enabled. The lack of PIE means that the binary and its functions will
be loaded at a fixed address, which simplifies exploitation.

Using tools like Ghidra to decompile and analyze binaries, we can start
understanding the functionalities of it. Diving into the code, we can
spot the `monitors` global variable, probably used to store the registered
hosts in the heap, inferred by the use of dynamic memory allocation functions
(i.e. `malloc`) in the `add_host` function, discovering also that the length of
this structure is 0x78 (120) bytes.

Identifying more usage of this variable, we can reconstruct the structure used
to store the host information, by looking at the offsets used to access the
fields:

- at offset 0x00: a string, probably the hostname (64 bytes)
- at offset 0x40: a function pointer (8 bytes)
- at offset 0x48: a string, used when checking the host token (32 bytes)
- at offset 0x68: a double (8 bytes)
- at offset 0x70: a double (8 bytes)

Also, in the `add_host` routine we can spot that the function pointer is set to
the address of the `get_host_view` function, used to print the host information
when the `VIEW` command is used.

Reconstructing the structure in C, we have:

```c
struct monitor {
  char hostname[64];              // hostname
  void (*fn)(char *,
             struct monitor *);   // function pointer
  char token[32];                 // registration token (hex)
  double field1;                  // data
  double field2;                  // data
};
```

Continuing the analysis, we can look into the `EDIT` command handler, which
allows modifying the hostname of a registered host. Here we can spot that the
application reads user input into a fixed-size buffer of 64 bytes (the size of
the hostname field), but it doesn't check the length of the input, leading to a
classic buffer overflow vulnerability. This allows an attacker to overwrite
the `print_fn` function pointer with an arbitrary address, without requiring any
address leak or bypassing ASLR since the binary is compiled without PIE.
The challenge now is to find a suitable function to redirect execution to when
the `print_fn` function pointer is called.

```c
void get_host_view(char *buf, struct Host *h);
```

Luckily, the binary includes a `read_admin_token` function that writes to a
buffer the administrative token (content of `ADMIN_TOKEN` environment variable)
used to access privileged information, which almost shares the same signature as
the `print_fn` function pointer.

```c
void read_admin_token(char *buf);
```

Since the calling convention on x86_64 passes the first argument in `rdi`, when
the `print_fn` function pointer is called, the first argument (a buffer) will be
correctly set. We can safely acknowledge and ignore the other argument since
`read_admin_token` only requires the first.

By overwriting the `print_fn` pointer with the address of `read_admin_token`,
we can trick the server into calling this function and thus giving us the
administrative token. This token can then be used to retrieve the flag via the
`DUMP` command.
