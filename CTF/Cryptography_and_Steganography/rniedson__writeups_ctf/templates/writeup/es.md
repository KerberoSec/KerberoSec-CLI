---
# Título del writeup tal como aparecerá en el sitio.
title: 'Nombre del Desafío: Writeup completo'

# Resumen de 1-2 frases (aparece en la tarjeta del listado, en <meta description> y al compartir).
description: 'Resumen corto de la vulnerabilidad y de la solución.'

# Nombre del CTF/plataforma que organizó el desafío (aparece como filtro "Organizadora").
event: 'Nombre del CTF'

# Categoría: debe ser exactamente uno de estos valores (en inglés, minúscula):
# web | pwn | reverse | crypto | forensics | misc | osint | hardware
category: 'web'

# Subcategoría: opcional, texto libre. Es la clase de vulnerabilidad específica dentro de la
# categoría (aparece agrupada por categoría en el filtro lateral: Web > IDOR, Web > XXE, Pwn > ROP...).
# Usa un nombre corto y reconocible: IDOR, XXE, SSTI, JWT, Path Traversal, Buffer Overflow,
# Format String, Heap Exploitation, RSA, etc. Si no aplica, borra esta línea.
subcategory: 'IDOR'

# Dificultad: opcional. Si no aplica, borra esta línea.
# easy | medium | hard
difficulty: 'easy'

# Etiquetas libres (aparecen como filtro "Tema" y como #hashtags al pie del writeup).
# Usa kebab-case, sin tildes: sql-injection, jwt, race-condition, etc.
tags:
  - etiqueta-uno
  - etiqueta-dos

# Fecha de publicación (formato AAAA-MM-DD). Ordena el listado y aparece como filtro "Mes".
pubDate: 2026-01-01

# Opcional: inclúyela solo si el writeup se actualiza después de publicado.
# updatedDate: 2026-01-05

# Tu nombre (aparece en la tarjeta, en la parte superior del writeup y en el filtro "Autor"). Obligatorio.
author: 'Tu Nombre'

# true oculta el writeup del sitio (listado, RSS, sitemap) sin borrar el archivo: # útil para escribir poco a poco antes de publicar. Cámbialo a false cuando termines.
draft: true
---

> [!NOTE/Sobre el desafío]
> **Plataforma:** Nombre del CTF
> **Categoría:** Web · **Dificultad:** Easy · **Puntos:** 100
> **Vulnerabilidades:** enuméralas aquí, en una frase
> **Flag:** `FLAG{...}` (o "dinámica: cambia en cada instancia", si aplica)

Un párrafo corto de apertura: para quién es este writeup, qué va a entender el lector al final.

---

## 1. Contexto

Explica qué es el desafío, qué hace la aplicación/binario/servicio, y qué ofrece el objetivo antes
de cualquier explotación.

## 2. Reconocimiento

Cómo mapeaste el objetivo: endpoints, funcionalidades, código fuente disponible, banners, etc.
Muestra comandos y salidas reales en bloques de código.

```bash
comando-que-ejecutaste --con-flags
```

## 3. Encontrando la vulnerabilidad

El razonamiento hasta identificar el fallo. Si tiene sentido, separa las hipótesis probadas
(incluidas las que no funcionaron: eso ayuda a quien está aprendiendo).

> [!TIP/Una idea clave]
> Usa este tipo de bloque para destacar un insight clave que el lector no puede perderse. Otros
> tipos disponibles: `[!NOTE]` (información de apoyo), `[!IMPORTANT]` (punto crucial), `[!WARNING]`
> y `[!CAUTION]` (advertencias). Puedes darle un título propio como arriba (`[!TIP/Título aquí]`).

## 4. Explotación

El payload/exploit paso a paso, con los comandos y el resultado de cada etapa.

```json
{
  "ejemplo": "de payload o respuesta de la API"
}
```

## 5. Capturando la flag

Cómo se obtuvo la flag y cuál es el resultado final (puedes ocultar la flag real y mostrar solo el
formato, si la plataforma pide confidencialidad).

## 6. Lecciones

Qué queda como aprendizaje general: la causa raíz de la vulnerabilidad y cómo podría evitarse.

---

_Writeup del desafío [Nombre del Desafío] ([Nombre del CTF] · Categoría · Dificultad)._
