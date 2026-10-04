# Cache Me Outside

> 🚧 In Progress 🚧

This challenge gives us a binary called `heapedit`, a Makefile and a libc dylib. Reading through the
Makefile we the build recipe.

```
gcc -Xlinker -rpath=./ -Wall -m64 -pedantic -no-pie --std=gnu99 -o heapedit heapedit.c
```

The `-Xlinker` option gives the next argument to the linker. `rpath` defines the path to look for when
loading dynamic libraries, which is just set to the current directory.

Trying to run the binary however we run into this:

```fish
➜ work (master) ./heapedit --help
Inconsistency detected by ld.so: dl-call-libc-early-init.c: 37: _dl_call_libc_early_init: Assertion `sym != NULL' failed!
```

This is odd, and reading through some other writeups this doesn't seem to be the intended behavior
either.

I'm not entirely sure why this happens?? It seems to be due to conflicting glibc versions _somewhere_,
but I don't understand how that works since we're trying to _load_ a custom libc.

The most progress I could make was to try an older version of `ld-linux`. My system is using a
bleeding-edge kernel so that could be why.
