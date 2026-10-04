---
title: 'Cómo publicar un writeup'
description: 'Paso a paso para agregar un nuevo writeup al sitio vía GitHub, desde la plantilla hasta que quede en línea.'
---

Este sitio se genera a partir de archivos Markdown guardados en este [repositorio de
GitHub](https://github.com/rniedson/writeups_ctf). No existe un panel de administración: publicar un
writeup es crear (o editar) archivos, enviarlos a GitHub y dejar que la automatización (GitHub
Actions) haga el resto. Cualquier persona con acceso al repositorio puede seguir esta guía.

## 1. Preparar el entorno local

Clona el repositorio (solo hace falta hacerlo una vez):

```bash
git clone git@github.com:rniedson/writeups_ctf.git
cd writeups_ctf
npm install
```

Antes de empezar un writeup nuevo, crea una branch a partir de la `main` actualizada:

```bash
git checkout main
git pull
git checkout -b writeup/nombre-del-desafio
```

## 2. Duplicar la plantilla

Los archivos de plantilla están en [`templates/writeup/`](https://github.com/rniedson/writeups_ctf/tree/main/templates/writeup): `pt.md`, `es.md`, `en.md` y una carpeta `imagens/` vacía (ese nombre en portugués se mantiene
igual en los tres idiomas: es la misma carpeta compartida por las tres traducciones). Copia esa
carpeta entera dentro de `src/content/writeups/`, con el nombre del evento y del desafío en
minúsculas y sin espacios (la ruta se convierte en parte de la URL):

```bash
mkdir -p "src/content/writeups/<evento-slug>/<desafio-slug>"
cp templates/writeup/pt.md templates/writeup/es.md templates/writeup/en.md \
   "src/content/writeups/<evento-slug>/<desafio-slug>/"
cp -r templates/writeup/imagens "src/content/writeups/<evento-slug>/<desafio-slug>/"
```

No necesitas completar los tres idiomas de una vez: puedes publicar solo `pt.md` (o `es.md`) ahora
y traducir después. Mientras una traducción no exista, el sitio muestra la versión en portugués en
esa ruta, con un aviso de "traducción pendiente".

## 3. Completar el frontmatter

Cada archivo `.md` empieza con un bloque de metadatos entre `---`. La plantilla ya trae un
comentario explicando cada campo: los principales son:

| Campo         | Qué es                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Título mostrado en el sitio                                                                                                                                                  |
| `description` | Resumen de 1-2 frases (aparece en la tarjeta y al compartir)                                                                                                                 |
| `event`       | Nombre del CTF/plataforma: se convierte en el filtro "Organizadora"                                                                                                         |
| `category`    | `web`, `pwn`, `reverse`, `crypto`, `forensics`, `misc`, `osint` o `hardware`                                                                                                 |
| `subcategory` | Clase de vulnerabilidad dentro de la categoría: texto libre, ej.: `IDOR`, `XXE`, `SSTI`, `JWT` (opcional, se convierte en el filtro "Subcategoría", agrupado por categoría) |
| `difficulty`  | `easy`, `medium` o `hard` (opcional)                                                                                                                                         |
| `tags`        | Lista libre de temas: se convierten en el filtro "Tema"                                                                                                                     |
| `pubDate`     | Fecha de publicación (`AAAA-MM-DD`)                                                                                                                                          |
| `author`      | Tu nombre: campo obligatorio, aparece en el filtro "Autor"                                                                                                                  |
| `draft`       | `true` oculta el writeup del sitio hasta que lo cambies a `false`                                                                                                            |

> [!IMPORTANT/Un frontmatter inválido rompe el build]
> Si `category` tiene un valor fuera de la lista, o falta un campo obligatorio como `author`, el
> build falla: tanto localmente (`npm run check`) como en el GitHub Actions del pull request. Así
> es como el sitio garantiza que ningún writeup mal formado llegue a producción.

## 4. Escribir el contenido

Debajo del frontmatter es Markdown normal. Algunos recursos que el sitio ya soporta:

- **Callouts**: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` o `[!CAUTION]` en la primera
  línea del bloque de cita, con título opcional (`[!TIP/Un título aquí]`).
- **Bloques de código con lenguaje** (` ```json `, ` ```bash `, etc.) obtienen resaltado de
  sintaxis, numeración de línea y botón de copiar automáticamente.
- **Imágenes** van en la carpeta `imagens/` junto al `.md` y se referencian con ruta relativa: `*[Image: texto alternativo]*`: Astro optimiza el archivo en el build.
- **Archivos para descargar** (scripts de exploit, por ejemplo) van en
  `public/writeups/<evento>/<desafio>/` y se referencian con ruta absoluta desde la raíz del sitio:
  `descargar solve.py`.

## 5. Probar localmente (recomendado)

```bash
npm run dev
```

Abre `http://localhost:4321/es/writeups/<evento-slug>/<desafio-slug>/` y revisa el resultado. Corre
también la validación completa antes de enviar:

```bash
npm run check
npm run format
npm run build
```

`npm run format` corrige el formato automáticamente (Prettier); los otros dos solo verifican.

## 6. Commit, push y pull request

```bash
git add src/content/writeups/<evento-slug>/<desafio-slug>/
git commit -m "Add writeup: <nombre del desafío>"
git push -u origin writeup/nombre-del-desafio
```

Abre un pull request en GitHub de tu branch hacia `main`. El workflow de CI corre `astro check`,
`format:check` y `build` automáticamente: si algo pasa por alto localmente pero falla ahí, el PR
muestra exactamente qué fue.

## 7. Merge y publicación automática

Después de que el PR sea aprobado y fusionado (_merge_) en `main`, el workflow `Deploy to GitHub
Pages` se dispara solo y publica el sitio actualizado: sin ningún paso manual. Sigue el progreso en
la pestaña **Actions** del repositorio; normalmente tarda menos de un minuto.

---

¿Dudas sobre la estructura del proyecto? Revisa el
[`README.md`](https://github.com/rniedson/writeups_ctf#readme) del repositorio, que tiene más
detalles técnicos sobre arquitectura, deploy y política de publicación responsable.
