# QFilter

**Category:** Pwn  ·  **Flag:** `ASIS{m337_7h3_br4nd_n3w_QJS_4ll0c470r_334811b53075}`

## Challenge Description

QFilter is a modified [QuickJS-ng](https://github.com/quickjs-ng/quickjs)
interpreter that adds a custom JavaScript array method,
`Array.prototype.customFilter`. The container is small:

- `qjs`: the modified QuickJS-ng interpreter.
- `run.py`: reads one JavaScript program and runs it with a three-second limit.
- `/readflag`: a setuid helper that reads the otherwise protected flag.
- `flag.txt`: unreadable directly by the `pwn` user.

The service (see `Dockerfile`) exposes the interpreter over `socat` on port
1337 and executes attacker-supplied JavaScript.

## Initial Analysis

The binary has the usual modern protections: PIE, NX, stack canaries, and full
RELRO. It ships with symbols and debug information, which makes locating the
custom code trivial:

```bash
nm -an qjs | grep customFilter
# 00000000000b034d t js_array_customFilter
```

On this build a QuickJS `JSValue` is 16 bytes: an 8-byte payload (integer or
pointer) followed by an 8-byte tag. Useful tags: `0` = integer, `-1` = object,
`-7` = string. Objects and strings are reference counted; native code must
`JS_DupValue` before retaining a copy and `JS_FreeValue` afterwards.

## Vulnerability / Core Concept

`js_array_customFilter` is a **use-after-free** driven by two mistakes:

```c
JSValue customFilter(JSContext *ctx, JSValueConst this_val,
                     int argc, JSValueConst *argv) {
    JSObject *array = JS_VALUE_GET_OBJ(this_val);
    uint32_t length = array->u.array.count;
    JSValue *values = array->u.array.values;   // cached raw pointer

    bool is_obj = values[0].tag == JS_TAG_OBJECT;  // checks ONLY element 0

    for (uint32_t i = 0; i < length; i++) {
        JSValue value = values[i];
        if (is_obj) JS_DupValue(ctx, value);
        JSValue result = JS_Call(ctx, argv[0], JS_UNDEFINED, 1, &value);
        JS_FreeValue(ctx, value);
        JS_FreeValue(ctx, result);
    }
    return JS_UNDEFINED;
}
```

1. **A raw element pointer survives a callback.** `values` is cached before the
   loop. The attacker-controlled callback can `push()` enough elements to force
   the array to reallocate its backing store, freeing the old buffer. Every
   later iteration reads freed memory.
2. **One element decides lifetime rules for the whole array.** `is_obj` is
   derived from element zero's tag and reused for all elements. Starting an
   array with an integer (`[0, refCountedValue, ...]`) makes `is_obj` false,
   so later reference-counted values are freed without a matching dup.

This yields **type confusion through allocator reuse**: a freed string's storage
can be reclaimed by a different object type while QuickJS still treats it as a
string.

## Exploitation

Full exploit in `exploit.js`; `solve.py` sends it to the service. The chain:

1. **Make a string dangle** (`uafString`): free a JS string while a variable
   still references it, then reclaim the slot.
2. **Leak PIE.** A dangling 15-byte string (alloc size `0x38`) is reclaimed by a
   resizable `JSArrayBuffer`. Reading "string bytes" at offset 8 leaks its
   `realloc_func` (`js_array_buffer_realloc` at `0xe860a`):
   ```javascript
   let b = new ArrayBuffer(0x100, {maxByteLength: 0x100});
   pie = leakedRealloc - 0xe860a;
   ```
3. **Leak heap.** A dangling 31-byte string (alloc size `0x48`) is reclaimed by
   an `ArrayBuffer`'s `JSObject`, leaking its `JSArrayBuffer` metadata pointer
   (`aux`).
4. **Deliver a fake `JSValue`** (`deliver`): spray `ArrayBuffer` data blocks
   (2,500 allocations) over freed `0x80` array backing storage, each carrying a
   forged value in slot 1. `customFilter` then hands the callback an arbitrary
   `JSValue` with a chosen tag (`-7` string / `-1` object).
5. **Build arbitrary read.** Forge a `JS_CLASS_ARRAY_BUFFER` object plus a fake
   `JSArrayBuffer` in controlled writable data; changing its data pointer and
   requesting a `Uint8Array` yields a byte view of any address:
   ```javascript
   function viewAt(address, size = 0x100) {
     w64(control, FAKE_AUX + 0x10, address);
     return new Uint8Array(fakeObject, 0, size);
   }
   ```
6. **Find a real `JSContext`** by walking objects: real ArrayBuffer → shape →
   prototype → property table → an existing `JS_CLASS_C_FUNCTION` (class 12) →
   its realm pointer at offset `0x30`.
7. **Forge a native function** backed by `js_os_exec` and call it:
   ```javascript
   control.fill(0);
   w16(control, 0x12, 12);              // JS_CLASS_C_FUNCTION
   w64(control, 0x30, ctx);             // real realm / context
   w64(control, 0x38, pie + 0x20438n);  // js_os_exec
   Reflect.apply(fakeFunc, undefined, [['/readflag'], {block: true}]);
   ```
   `block: true` makes QuickJS wait for `/readflag` to print the flag before
   GC touches the forged structures.

Run locally / remotely:

```bash
./solve.py 127.0.0.1 1337        # local (Dockerfile builds the target)
./solve.py <HOST> <PORT>         # remote
```

Remote output:

```text
[+] realloc 0x560d1513d60a pie 0x560d15055000 aux loops 1
[+] aux 0x560d1e8976c0 object loops 3
...
[+] fake callable: function
ASIS{m337_7h3_br4nd_n3w_QJS_4ll0c470r_334811b53075}
```

> Note: the included `flag.txt` in the original container held `ASIS{^test-flag^}`,
> a local placeholder. The real flag is below.

## Flag

`ASIS{m337_7h3_br4nd_n3w_QJS_4ll0c470r_334811b53075}`

## Key Takeaways

- Native engine code must never retain a raw pointer to array storage across a
  call back into attacker-controlled JavaScript: the callback can resize the
  array, run getters, or trigger GC.
- Reference counts must be taken per-value based on each value's own tag, not on
  a single "representative" element.
- Reusing the engine's own `js_os_exec` as a forged C-function avoids any need
  to leak libc or build a ROP chain: it already has the correct generic native
  calling convention.
