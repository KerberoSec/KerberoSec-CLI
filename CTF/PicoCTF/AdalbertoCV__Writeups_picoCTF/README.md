# Writeups: picoCTF & OverTheWire Bandit

Documentación de **~160 retos de seguridad informática** resueltos durante el curso de **Seguridad en Redes** de la Licenciatura en Ingeniería de Software (Universidad Autónoma de Zacatecas), más los retos del concurso interno de 2023.

Cada writeup registra el proceso completo: descripción del reto, pistas disponibles, razonamiento, comandos ejecutados y bandera obtenida. No son soluciones copiadas: son la bitácora de cómo se llegó a cada una.

---

## Categorías cubiertas

| Categoría | Retos | Temas |
|---|---:|---|
| **Web Exploitation** | 23 | Manipulación de cookies, inyección SQL, bypass de validación en cliente, JWT (`JaWT`), `robots.txt`, verbos HTTP, LFI |
| **Cryptography** | 20 | Cifrados clásicos (César, Vigenère, sustitución), codificación en bases, RSA, criptoanálisis de frecuencia |
| **Forensics** | 22 | Análisis de PCAP con Wireshark, esteganografía, metadatos EXIF, carving de archivos, recuperación de datos |
| **Reverse Engineering** | 19 | Desensamblado con Ghidra y `objdump`, análisis de binarios ELF, decompilación, análisis de bytecode |
| **Binary Exploitation** | 10 | Desbordamiento de búfer, sobrescritura de variables, format strings, análisis de stack |
| **Bandit (OverTheWire)** | 35 | Niveles 0-34: fundamentos de Linux, permisos, SSH, `find`, `grep`, compresión, `nc`, `openssl`, cron, git |
| **General Skills** | 23 | Herramientas de línea de comandos, conversión de bases, scripting en Python, `netcat`, `strings` |

---

## Estructura del repositorio

```
.
├── retos/
│   ├── primer-parcial/          # Retos introductorios de General Skills
│   │   ├── 2019/                #   picoCTF 2019: warm-ups, bases, grep, pipes
│   │   ├── 2021/                #   picoCTF 2021: netcat, wireshark, ssh
│   │   ├── 2022/                #   picoCTF 2022: Python, PW Crack, codebook
│   │   └── Plantilla.md         #   Plantilla base de los writeups
│   ├── segundo-parcial/
│   │   ├── retos-web/           #   Explotación web
│   │   └── retos-forensic/      #   Análisis forense
│   ├── tercer-parcial/
│   │   ├── retos-binary/        #   Binary exploitation
│   │   ├── retos-crypto/        #   Criptografía
│   │   └── retos-reversing/     #   Ingeniería inversa
│   ├── retos-bandit/            # OverTheWire Bandit, niveles 0-34
│   ├── retos-web/               # Web exploitation (compilado general)
│   ├── retos-Crypto/            # Criptografía (compilado general)
│   ├── retos-Forensic/          # Forense (compilado general)
│   ├── retos-RE/                # Ingeniería inversa (compilado general)
│   └── retos-Binary-Exploitation/
└── Concurso/                    # Retos del concurso interno 2023 (14 retos)
```

---

## Formato de cada writeup

Todos los archivos siguen la misma plantilla, lo que hace el repositorio consultable de un vistazo:

```markdown
# Nombre del reto

# Descripción
Enunciado original y URL o archivo del reto.

# Pistas
Pistas oficiales disponibles.

# Solución
Razonamiento paso a paso, comandos ejecutados y salidas relevantes.

# Bandera
picoCTF{...}
```

---

## Cómo navegarlo

Los archivos son Markdown plano, así que se leen directamente en GitHub. El repositorio se escribió originalmente como una bóveda de **Obsidian**, por lo que también puede abrirse con esa herramienta para navegar con enlaces internos y búsqueda global.

---

## Aviso

Este material es documentación educativa de retos públicos de [picoCTF](https://picoctf.org/) y [OverTheWire Bandit](https://overthewire.org/wargames/bandit/), plataformas diseñadas explícitamente para el aprendizaje de seguridad ofensiva. Las banderas incluidas corresponden a ediciones ya concluidas.

Si estás resolviendo estos retos por tu cuenta, te recomiendo intentarlos antes de leer la solución: el valor está en el proceso.

---

## Autor

**Adalberto Cerrillo Vázquez**: Ingeniería de Software, Universidad Autónoma de Zacatecas.
