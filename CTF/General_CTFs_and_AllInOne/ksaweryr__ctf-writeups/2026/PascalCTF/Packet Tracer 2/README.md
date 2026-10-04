# Packet Tracer 2

> No way! They released a new version of my favorite software, Cisco Packet Tracer, now completely accessible by CLI!

## Overview
Apart from the standard attachments (the program, ld and libc), provided is a file called `env` containing `"MALLOC_ARENA_MAX=1"`. This environment variable causes libc to only use a single arena even if multiple threads are used, meaning all freed chunks will go into the same bins.

The program itself is a simulator of a computer network.It allows creating hosts, routers and connections between them, and simulating sending packets between them. Each host and router has its own thread running, which creates messages about received/forwarded packets. Additionally, there is a logger thread, which waits for messages to be put in its queue and then creates log objects from them (containing a timestamp and the message). Finally, a `win` host gets created at the start with a custom thread that checks if any router is connected to it: and if so, prints the flag. However, the index of the win host is out of bounds for regular router-host connection operation, and as such the win condition cannot be satisfied directly. Lastly, there is also a simulation mode, which allows sending a packet to any host and seeing the contents of the logs afterwards.

## Info Leak
The first vulnerability is present in the host and router creation operations. In the following snippet:
```c
v3 = get_string("Enter host name: ");
v4 = safely_replace_newline(v3);
host = create_host(v4);
```
A name for host/router is read from the stdin and a new host/router with the given name is created. The implementations of `get_string` and `safely_replace_newline` are as follows:
```c
char *__cdecl get_string(const char *prompt)
{
  printf("%s", prompt);
  read(0, name, 32u);
  return name;
}

char *__cdecl safely_replace_newline(char *str)
{
  int i; // [rsp+14h] [rbp-1Ch]

  for ( i = 0; i < strlen(str); ++i )
  {
    if ( str[i] == 10 )
      str[i] = 0;
  }
  return str;
}
```
Finally, the memory layout around the global symbol `name`:
```c
.bss:0000000000009149                 align 20h
.bss:0000000000009160                 public name
.bss:0000000000009160 ; char name[32]
.bss:0000000000009160 name            db 20h dup(?)           ; DATA XREF: get_string+36↑o
.bss:0000000000009160                                         ; get_string+4F↑o
.bss:0000000000009180                 public win_host
.bss:0000000000009180 ; Host *win_host
.bss:0000000000009180 win_host        dq ?                    ; DATA XREF: setup_chall+100↑w
.bss:0000000000009180                                         ; setup_chall+107↑r ...
```
The 32 bytes of `name` are directly followed by a pointer to `win_host`. `get_string` makes it possible to fill those 32 bytes with any values (as `read` does not require a newline), and `safely_replace_newline` checks characters until the first encountered nullbyte. As such, if a name consisting of 32 non-newline characters is provided, the actual host/router name will also contain the value of `win_host`, that is the memory location where the win host is present.

## Buffer Overflow
When sending a packet in simulation mode, maximum 1024 bytes of data can be attached to it:
```c
memset(data, 0, 1024u);
printf("Enter data (max %d bytes): ", 1024);
if ( fgets(data, 1024, stdin) )
{
    newline = strchr(data, 10);
    if ( newline )
        *newline = 0;
    reset_logging();
    packet = create_packet(data, hosts[index]->interface.ip, ip_0);
    if ( !memcmp(ip_0, hosts[index]->interface.ip, 4u) )
        send_packet_direct(&hosts[index]->interface, packet);
    else
        send_packet(&hosts[index]->interface, packet);
}
```

`send_packet{,_direct}` then forwards the packet to the appropriate `Interface`'s buffer:
```c
int __cdecl send_packet(Interface *interface, Packet *packet)
{
  int index; // eax
  Interface *destination; // [rsp+10h] [rbp-10h]

  destination = interface->connected_to;
  if ( interface->connected_to && destination->is_on )
  {
    pthread_mutex_lock(&destination->buffer_mutex);
    if ( destination->packets_in_buffer <= 7 )
    {
      index = destination->index;
      destination->index = index + 1;
      destination->buffer[index] = packet;
      ++destination->packets_in_buffer;
      pthread_mutex_unlock(&destination->buffer_mutex);
      return 0;
    }
    else
    {
      pthread_mutex_unlock(&destination->buffer_mutex);
      free(packet);
      return -2;
    }
  }
  else
  {
    free(packet);
    return -1;
  }
}
```
Which eventually get's handled in `{host,router}_thread`:
```c
int __cdecl host_thread(Host *arg)
{
  size_t v1; // rax
  Packet *packet; // [rsp+28h] [rbp-448h]
  char message[1032]; // [rsp+30h] [rbp-440h] BYREF
  unsigned __int64 v5; // [rsp+438h] [rbp-38h]

  v5 = __readfsqword(0x28u);
  while ( arg->is_running )
  {
    packet = receive_packet(&arg->interface);
    if ( packet )
    {
      v1 = strlen(packet->data);
      snprintf(
        message,
        1024u,
        "[HOST %s] Received on eth0 (%u.%u.%u.%u): %u.%u.%u.%u -> %u.%u.%u.%u | %lu bytes | %s",
        arg->name,
        (unsigned __int8)arg->interface.ip[0],
        (unsigned __int8)arg->interface.ip[1],
        (unsigned __int8)arg->interface.ip[2],
        (unsigned __int8)arg->interface.ip[3],
        (unsigned __int8)packet->source_ip[0],
        (unsigned __int8)packet->source_ip[1],
        (unsigned __int8)packet->source_ip[2],
        (unsigned __int8)packet->source_ip[3],
        (unsigned __int8)packet->destination_ip[0],
        (unsigned __int8)packet->destination_ip[1],
        (unsigned __int8)packet->destination_ip[2],
        (unsigned __int8)packet->destination_ip[3],
        v1,
        packet->data);
      log_message(message);
      free(packet);
    }
    thrd_sleep(&ONE_SEC_DURATION, 0);
  }
  return 0;
}
```
And gets added to the logger thread's queue through `log_message`:
```c
int __cdecl log_message(char *message)
{
  int v2; // eax

  pthread_mutex_lock(&log_buffer.mutex);
  if ( log_buffer.queue_index <= 7 )
  {
    v2 = log_buffer.queue_index++;
    strncpy(log_buffer.queue[v2], message, 1023u);
    pthread_mutex_unlock(&log_buffer.mutex);
    return 0;
  }
  else
  {
    pthread_mutex_unlock(&log_buffer.mutex);
    return -1;
  }
}
```
Up until this point, everything is fine, as the message is always copied as at most 1024 bytes into buffers of appropriate sizes, including the finale `strncpy` to `log_buffer.queue`:
```c
00000000 struct __attribute__((aligned(8))) LogBuffer // sizeof=0x2440
00000000 {                                       // XREF: .bss:log_buffer/r
00000000     Log *logs[128];
00000400     char queue[8][1024];
00002400     pthread_mutex_t mutex;              // XREF: init_logging+17/o
00002400                                         // reset_logging+17/o ...
00002428     thrd_t thread;                      // XREF: init_logging+4E/o
00002430     bool is_running;                    // XREF: init_logging:loc_5CAA/w
00002431     bool reset;                         // XREF: reset_logging+26/w
00002431                                         // reset_logging:loc_5D61/r
00002432     // padding byte
00002433     // padding byte
00002434     int index;                          // XREF: get_log+17/r
00002434                                         // get_log+5E/r ...
00002438     int queue_index;                    // XREF: log_message+2A/r
00002438                                         // log_message:loc_5E6E/r ...
0000243C     // padding byte
0000243D     // padding byte
0000243E     // padding byte
0000243F     // padding byte
00002440 };
```
However, the next place where the message will get handled is in `log_thread`:
```c
int __cdecl log_thread(LogBuffer *arg)
{
  int i; // [rsp+10h] [rbp-20h]
  int i_0; // [rsp+14h] [rbp-1Ch]
  Log *log; // [rsp+20h] [rbp-10h]

  while ( arg->is_running )
  {
    pthread_mutex_lock(&arg->mutex);
    if ( arg->reset )
    {
      for ( i = arg->index - 1; i >= 0; --i )
      {
        free(arg->logs[i]);
        arg->logs[i] = 0;
      }
      arg->index = 0;
      for ( i_0 = 0; i_0 < arg->queue_index; ++i_0 )
        memset(arg->queue[i_0], 0, sizeof(arg->queue[i_0]));
      arg->queue_index = 0;
      arg->reset = 0;
      pthread_mutex_unlock(&arg->mutex);
    }
    else
    {
      if ( !arg->queue[0][0] )
        goto LABEL_14;
      log = get_log();
      if ( log )
      {
        strcpy(log->message, arg->queue[0]);
        log->timestamp = time(0);
        memset(arg->queue, 0, 0x400u);
        memmove(arg->queue, arg->queue[1], 0x1C00u);
        memset(arg->queue[7], 0, sizeof(arg->queue[7]));
        --arg->queue_index;
LABEL_14:
        pthread_mutex_unlock(&arg->mutex);
        thrd_sleep(&ONE_SEC_DURATION, 0);
      }
      else
      {
        pthread_mutex_unlock(&arg->mutex);
      }
    }
  }
  return 0;
}
```
where a length-unbounded `strcpy` will copy the message into a buffer created in `get_log`:
```c
Log *__cdecl get_log()
{
  int v1; // eax
  Log *log; // [rsp+0h] [rbp-10h]

  if ( log_buffer.index > 127 )
    return 0;
  log = (Log *)malloc(520u);
  if ( !log )
    exit(1);
  memset(log, 0, sizeof(Log));
  v1 = log_buffer.index++;
  log_buffer.logs[v1] = log;
  return log;
}
```
where only 520 bytes are allocated, which checks out with the definition of the `Log` structure in the attached debug info:
```c
00000000 struct Log // sizeof=0x208
00000000 {
00000000     time_t timestamp;
00000008     char message[512];
00000208 };
```
This means that by creating a message larger than 512 bytes, it is possible to get a heap buffer overflow of at most 512 bytes (without null bytes).

While it could be possible to perform tcache poisoning or an attack targeting the top chunk, like [house of tangerine](https://github.com/shellphish/how2heap/blob/master/glibc_2.39/house_of_tangerine.c), requiring bruteforcing the address of libc to get arbitrary code execution, recall that `win_host_thread` can print the flag if there exists a router that is connected to the win host:
```c
int __cdecl win_host_thread(Host *arg)
{
  int i; // [rsp+10h] [rbp-430h]
  int j; // [rsp+14h] [rbp-42Ch]
  char *flag; // [rsp+18h] [rbp-428h]

  while ( arg->is_running )
  {
    for ( i = 0; i <= 4; ++i )
    {
      if ( routers[i] )
      {
        for ( j = 0; j <= 3; ++j )
        {
          if ( (Host *)routers[i]->interfaces[j].connected_to == arg )
          {
            flag = getenv("FLAG");
            if ( !flag )
              flag = "pascalCTF{placeholder}";
            fputs(flag, stderr);
            exit(0);
          }
        }
      }
    }
    thrd_sleep(&ONE_SEC_DURATION, 0);
  }
  return 0;
}
```
Looking at the definitions of `Router` and `Interface`:
```c
00000000 struct Router // sizeof=0x2E8
00000000 {
00000000     Interface interfaces[4];
00000240     Route *routes[8];
00000280     char *name;
00000288     thrd_t thread;
00000290     bool is_running;
00000291     // padding byte
00000292     // padding byte
00000293     // padding byte
00000294     // padding byte
00000295     // padding byte
00000296     // padding byte
00000297     // padding byte
00000298     pthread_mutex_t routes_mutex;
000002C0     pthread_mutex_t interfaces_mutex;
000002E8 };

00000000 struct Interface // sizeof=0x90
00000000 {                                       // XREF: Host/r Router/r
00000000     Interface *connected_to;
00000008     Packet *buffer[8];
00000048     char is_on;
00000049     char parent_type;
0000004A     // padding byte
0000004B     // padding byte
0000004C     // padding byte
0000004D     // padding byte
0000004E     // padding byte
0000004F     // padding byte
00000050     pthread_mutex_t buffer_mutex;
00000078     char ip[4];
0000007C     char netmask[4];
00000080     void *parent;
00000088     int packets_in_buffer;
0000008C     int index;
00000090 };
```
all that is required to trigger this condition is putting the address of win host (which can be easily leaked, as shown before) as the first word in a chunk containing an allocated router. This can be achieved through careful heap grooming and a singular run of the simulation.

## Heap Grooming
The goal is to achieve the following heap layout:
```
+------------------------------------+
|                                    |
| in-use* memory (arbitrary length)  |
|                                    |
+------------------------------------+

+------------------------------------+
|                                    |
| free memory (0x420-0x6b0 bytes)    |
|                                    |
+------------------------------------+

+------------------------------------+
|                                    |
| Router object (0x300 bytes)        |
|                                    |
+------------------------------------+

+------------------------------------+
|                                    |
| in-use* memory (arbitrary length)  |
|                                    |
+------------------------------------+

+------------------------------------+
|                                    |
| top chunk                          |
|                                    |
+------------------------------------+
```
Here, "free memory" refers to a segment only containing chunks that are internally marked as free, i.e. doesn't include chunks present in tcaches or fastbins (as those are still technically used). "in-use* memory" refers to chunks that are actually in-use, present in tcaches or fastbins, or truly freed chunks of a size smaller than 0x220.

This way, when the simulation is run, the free memory segment will be used first for a `Packet` object (0x420), and then, after it's freed, for a `Log` object (0x220) bytes. The upper bound for the size of the free region stems from the fact that sometime between the allocation and freeing of the `Packet` object, a persistence chunk of 0x290 bytes is allocated (I have not managed to trace the origin of this allocation). As such, with a size between 0x420 and 0x6b0 bytes, the `Log` object will eventually end up in the initially free section.

The first idea could be to allocate and free 2 `Router` objects to create the "free memory" segment. While combined they would take up enough space, they will end up in the tcache after beeing freed. As the limit of the number of routers is 5, it's impossible to fil up the tcache corresponding to router's chunk size (the maximum size of the tcache is 7 chunks), so this approach is not valid. Fortunately, it's possible to allocate as many as 30 hosts, which is more than enough to prepare the heap.

### Heap layout when allocating a `Host`
Let's investigate the creation of a host again:
```c
v3 = get_string("Enter host name: ");
v4 = safely_replace_newline(v3);
host = create_host(v4);
hosts[index] = host;
if ( !hosts[index] )
{
    puts("Failed to create host");
    exit(1);
}
if ( start_host(hosts[index], 0) )
{
    puts("Failed to start host");
    exit(1);
}
printf("Created and started host %s\n", hosts[index]->name);
```
In `create_host`, `strdup` is called, allocating a chunk on the heap containing host's name:
```c
Host *__cdecl create_host(const char *name)
{
  Host *host; // [rsp+10h] [rbp-10h]

  host = (Host *)malloc(0xA8u);
  if ( !host )
    return 0;
  memset(host, 0, sizeof(Host));
  host->name = strdup(name);
  if ( !init_interface(&host->interface, 0, host) )
    return host;
  free(host->name);
  free(host);
  return 0;
}
```
Meanwhile, `start_host` spawns a new pthread:
```c
int __cdecl start_host(Host *host, bool is_win_host)
{
  int (__cdecl *v3)(void *); // rsi

  if ( host->is_running )
    return -2;
  host->is_running = 1;
  if ( is_win_host )
    v3 = win_host_thread;
  else
    v3 = host_thread;
  if ( !(unsigned int)thrd_create((__int64)&host->thread, (__int64)v3, (__int64)host) )
    return 0;
  host->is_running = 0;
  return -1;
}
```
As such, creating a new host allocates 3 chunks, of sizes 0xb0, 0x20 (or 0x30, if the name is longer than 16 characters) and 0x120, respectively. This can be verified by attaching a debugger after the following script switches to interactive mode:
```py
from pwn import *

context.arch = 'amd64'

e = ELF('./patched', checksec=False)

io = e.process(env={'MALLOC_ARENA_MAX': '1'})

def create_host(idx, name):
    assert 0 <= idx <= 29
    assert len(name) <= 32
    io.sendlineafter(b'choice: ', b'1')
    io.sendlineafter(b'index: ', str(idx).encode())
    io.sendafter(b'name: ', name)
    io.recvuntil(b'host ')
    return io.recvline(drop=True)

create_host(0, b'myhost\n')

io.interactive()
```

```
pwndbg> heap
[...]

Allocated chunk | PREV_INUSE
Addr: 0x55c1e368d5a0
Size: 0xb0 (with flag bits: 0xb1)

Allocated chunk | PREV_INUSE
Addr: 0x55c1e368d650
Size: 0x20 (with flag bits: 0x21)

Allocated chunk | PREV_INUSE
Addr: 0x55c1e368d670
Size: 0x120 (with flag bits: 0x121)

Top chunk | PREV_INUSE
Addr: 0x55c1e368d790
Size: 0x20870 (with flag bits: 0x20871)

pwndbg> x/s 0x55c1e368d660
0x55c1e368d660: "myhost"
```

### The matter of fastbins
While it is possible to fill up the tcaches, fastbins don't have a size limit and keep chunks "allocated". While both chunks of size 0xb0 (for `Host` objects) and 0x20 (for the names) are small enough to fit into fastbins, luckily the libc version used in this challenge (`Ubuntu GLIBC 2.39-0ubuntu8.2`) has fastbins disabled:
```
pwndbg> x/gx &global_max_fast
0x7fe530e0a1a0 <global_max_fast>:       0x0000000000000080
```
As such, when a tcache is filled, new chunks with corresponding size that are freed will be actually "freed" (and, as such, eligible to be merged with adjacent free chunks).

### Freeing pthreads
Final quirk that has to be taken into account is how glibc handles pthread cancellation. When a pthread stops, its corresponding heap chunk doesn't get freed immediatelly: instead, the last 4 pthread chunks are kept allocated for caching purposes. This can be verified by modifying the previous script slightly:
```py
...

def delete_host(idx):
    io.sendlineafter(b'choice: ', b'6')
    io.sendlineafter(b'index: ', str(idx).encode())

for i in range(7):
    create_host(i, f'host_{i}\n'.encode())

create_host(7, b'top chunk guard')

for i in range(7):
    delete_host(i)

io.interactive()
```
```
pwndbg> heap
[...]

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c5a0
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560851d9c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c650
Size: 0x20 (with flag bits: 0x21)
fd: 0x560851d9c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c670
Size: 0x120 (with flag bits: 0x121)
fd: 0x560851d9c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c790
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560d315cd82c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c840
Size: 0x20 (with flag bits: 0x21)
fd: 0x560d315cdbfc

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c860
Size: 0x120 (with flag bits: 0x121)
fd: 0x560d315cdb1c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9c980
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560d315cda3c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9ca30
Size: 0x20 (with flag bits: 0x21)
fd: 0x560d315cd5cc

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9ca50
Size: 0x120 (with flag bits: 0x121)
fd: 0x560d315cd5ec

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9cb70
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560d315cd40c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9cc20
Size: 0x20 (with flag bits: 0x21)
fd: 0x560d315cd7dc

Allocated chunk | PREV_INUSE
Addr: 0x560851d9cc40
Size: 0x120 (with flag bits: 0x121)

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9cd60
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560d315cd61c

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9ce10
Size: 0x20 (with flag bits: 0x21)
fd: 0x560d315cd1ac

Allocated chunk | PREV_INUSE
Addr: 0x560851d9ce30
Size: 0x120 (with flag bits: 0x121)

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9cf50
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560d315cd0ec

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9d000
Size: 0x20 (with flag bits: 0x21)
fd: 0x560d315cd3bd

Allocated chunk | PREV_INUSE
Addr: 0x560851d9d020
Size: 0x120 (with flag bits: 0x121)

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9d140
Size: 0xb0 (with flag bits: 0xb1)
fd: 0x560d315cd2fd

Free chunk (tcachebins) | PREV_INUSE
Addr: 0x560851d9d1f0
Size: 0x20 (with flag bits: 0x21)
fd: 0x560d315ccd8d

Allocated chunk | PREV_INUSE
Addr: 0x560851d9d210
Size: 0x120 (with flag bits: 0x121)

Allocated chunk | PREV_INUSE
Addr: 0x560851d9d330
Size: 0xb0 (with flag bits: 0xb1)

Allocated chunk | PREV_INUSE
Addr: 0x560851d9d3e0
Size: 0x20 (with flag bits: 0x21)

Allocated chunk | PREV_INUSE
Addr: 0x560851d9d400
Size: 0x120 (with flag bits: 0x121)

Top chunk | PREV_INUSE
Addr: 0x560851d9d520
Size: 0x1fae0 (with flag bits: 0x1fae1)
```
Notice how the 4 pthread objects corresponding to the last 4 freed chunks are still "allocated".

## Putting it all together
Each host uses 0xb0 + 0x20 + 0x120 = 0x1f0 bytes. To fit within the bounds defined earlier, exactly 3 consecutively created hosts must be freed with their chunks all merged into one of size 0x5d0. Finally, 7 additional hosts will need to be freed to fill up the tcaches for sizes 0xb0, 0x20 and 0x120, and 4 more hosts must be freed at the end to provide cached pthread chunks, requiring 14 host allocations. Finally, the appropriate padding for the overflow in `Log` can be found with trial and error and a debugger. The final exploit script is available in `solve.py`

## Flag
`pascalCTF{1_w15h_1t_w4s_4s_e4sy_t0_g3t_4_10_1n_n3tw0rks}`
