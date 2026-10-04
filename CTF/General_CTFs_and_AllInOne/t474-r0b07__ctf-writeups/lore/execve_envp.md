# `> [LORE : EXECVE: EL TERCER ARGUMENTO]`

```
syscall:      execve(const char *path, char *const argv[], char *const envp[])
argumento:    envp[]: el array de variables de entorno del proceso hijo
documentado:  POSIX.1 · man 2 execve
olvidado por: casi todos
```

---

`execve` tiene tres argumentos.

El primero es el binario a ejecutar.
El segundo es el array de argumentos: `argv`.
El tercero es el array de variables de entorno: `envp`.

La mayoría de los programadores conoce los dos primeros.
El tercero existe desde siempre.
Y desde siempre se ignora.

Cuando ejecutas un programa desde la shell,
el entorno se hereda automáticamente.
Todo lo que está en `env` pasa al proceso hijo sin que nadie lo decida conscientemente.
Es el comportamiento por defecto.
Es conveniente.
Y es exactamente lo que algunos binarios asumen como invariante.

```c
// lo que pasa cuando ejecutas desde la shell:
execve("/narnia/narnia10", args, environ);  // environ = entorno heredado

// lo que puedes hacer tú:
char *env[] = { NULL };
execve("/narnia/narnia10", args, env);      // entorno vacío. cero variables.
```

Un proceso que nace con `envp = NULL`
no tiene `PATH`, no tiene `HOME`, no tiene `TERM`.
No tiene nada de lo que el sistema puso ahí.
Tampoco tiene lo que el atacante puso ahí.
Pero tampoco tiene lo que el programador asumió que siempre estaría.

`getenv("CUALQUIER_VARIABLE")` devuelve `NULL`.
Siempre. Sin excepción.
Porque el entorno está vacío.

El filtro que busca variables prohibidas
no encuentra nada.
No porque las variables no sean peligrosas.
Sino porque el proceso nació sin memoria.

```c
// la validación del programador:
if(getenv("BAD_ENV_VARIABLE") != NULL){
    exit(1);
}
// con envp=NULL → getenv devuelve NULL → el if no se activa → el programa continúa
```

Lo que `execve` permite no es una vulnerabilidad.
Es una funcionalidad documentada en POSIX desde los años 70.
El error no está en la syscall.
Está en asumir que el entorno es un dato confiable.

```txt
referenciado en: narnia10
concepto derivado: environment sanitization · execve wrapper · context injection
```

---

> *"The environment is not a constant.
>  It is whatever the parent decided to give you."*
