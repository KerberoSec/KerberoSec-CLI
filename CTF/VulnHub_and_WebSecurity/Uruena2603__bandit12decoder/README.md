# bandit12decoder

> Automatización de la resolución del **nivel 12** de OverTheWire Bandit.  
> Extrae recursivamente capas comprimidas hasta revelar la **clave** y limpia los archivos intermedios.

---

## 🚀 Tabla de contenidos

- [Contexto](#-contexto)
- [Proceso seguido](#-proceso-seguido)
- [Cómo funciona `decoder.sh`](#-cómo-funciona-decodersh)
- [Conceptos aplicados](#-conceptos-aplicados)
- [Herramientas y requisitos](#-herramientas-y-requisitos)
- [Instalación y uso rápido](#-instalación-y-uso-rápido)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Ejemplo de salida](#-ejemplo-de-salida)
- [Notas y mejoras futuras](#-notas-y-mejoras-futuras)

---

## 🧩 Contexto

OverTheWire **Bandit** es un reto de seguridad/hacking ético con ejercicios prácticos de manipulación de archivos, compresión, codificación y automatización.  
En el **nivel 12**, la contraseña está oculta en `data.txt`, que es **un hexdump de un archivo repetidamente comprimido**, lo que dificulta acceder al texto plano si se hace manualmente.

---

## 🛠️ Proceso seguido

1. **Extracción remota**  
   Conexión por SSH al servidor de Bandit 12 y verificación de `data.txt` (datos binarios/hexdump).

2. **Transferencia y conversión**  
   Conversión del contenido a **Base64**, copia y pegado en un archivo local (Kali Linux).

3. **Reversión de Base64**  
   Decodificación local → archivo inicial: **`sombras.gzip`**.

4. **Descompresión recursiva (manual vs. automática)**  
   El archivo contiene **múltiples capas** (gzip, bzip2, tar, etc.). Hacerlo a mano es lento y deja muchos archivos intermedios.

5. **Automatización**  
   Se crea **`decoder.sh`** para descomprimir **recursivamente** y **limpiar** temporales, revelando la clave final.

---

## 🔄 Cómo funciona `decoder.sh`

- Usa `7z` para **listar (`7z l`)** el contenido de `sombras.gzip`, identificar el **archivo interno** y **extraer (`7z x`)**.
- En un **bucle**, intenta listar el archivo actual:
  - Si `7z` puede listarlo, se asume que es **otra capa** → se extrae y avanza al siguiente.
  - Si **no** puede listarlo, es un archivo **final de texto** → se muestra con `cat`.
- Al finalizar, elimina archivos intermedios (p. ej., `data*`) para mantener el directorio **limpio**.

> **Dependencia clave:** `7z` (paquete `p7zip-full` en Debian/Ubuntu/Kali).

---

## 📚 Conceptos aplicados

- **Compresión y descompresión:** `gzip`, `bzip2`, `tar`, `7z`.
- **Automatización con Bash:** bucles, control de flujo, captura de salidas, limpieza.
- **Procesamiento de texto/streams:** `grep`, `awk`, `cat`, tuberías.
- **Higiene del entorno:** borrado de artefactos intermedios para no dejar residuos.

---

## 🧰 Herramientas y requisitos

- **Bash** (GNU/Linux).
- **7z** (`p7zip-full`):
  ```sh
  sudo apt install p7zip-full
  ```

---

## ⚡ Instalación y uso rápido

1. Da permisos de ejecución al script:
   ```sh
   chmod +x decoder.sh
   ```
2. Ejecuta el script:
   ```sh
   ./decoder.sh
   ```
   El script imprimirá la clave final y eliminará los archivos temporales generados durante el proceso.

---

## 🗂️ Estructura del repositorio

```
.
├─ decoder.sh          # Script principal de extracción y limpieza
├─ README.md           # Documentación y contexto del reto
└─ sombras.gzip        # Archivo inicial (obtenido tras revertir Base64)
```

---

## 📝 Ejemplo de salida

*[Image: Ejemplo de ejecución: clave tapada]*

```
<clave_del_siguiente_nivel>
Done succesfully.
```
