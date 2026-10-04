## HV19.10 Guess what

The flag is right, of course

### Resources

`HV19.09-guess.zip`

### Solution (Version 3)

The challenge contains a 64-Bit ELF file. When running the file, we get prompted for a password. My first guess was to try some static analysis with IDA, but the overall structure of the binary is quite complex. It seems like during runtime, it decrypts some strings in memory and uses the output as part of `exec` calls. Unfortunately, I had some issues while debugging, so I tried to perform some basic dynamic analysis with `ltrace`.

`ltrace -o log.txt ./guess3`

While examining the output file, I found some very interesting entries:

```
strcpy(0x16291a8, "=")                                                                                                                     = 0x16291a8
__ctype_b_loc()                                                                                                                            = 0x7f2de02806d0
memset(0x1634e88, '\337', 64)                                                                                                              = 0x1634e88
strcpy(0x1634009, "HV19{Sh3ll_0bfuscat10n_1s_fut1l3"...)                                                                                   = 0x1634009
strchr("HV19{Sh3ll_0bfuscat10n_1s_fut1l3"..., '$')                                                                                         = nil
memset(0x1634e88, '\317', 64)                                                                                                              = 0x1634e88
memset(0x1634888, '\337', 36)                                                                                                              = 0x1634888
strcpy(0x1634888, ""HV19{Sh3ll_0bfuscat10n_1s_fut1l"...)                                                                                   = 0x1634888
__ctype_b_loc()                                                                                                                            = 0x7f2de02806d0
strcpy(0x16291c8, "]")                                                                                                                     = 0x16291c8
__ctype_b_loc()
```

This already looks like a flag, so why not just append some trailing `}` and hope this works :)

**Flag:** HV19{Sh3ll_0bfuscat10n_1s_fut1l3}
