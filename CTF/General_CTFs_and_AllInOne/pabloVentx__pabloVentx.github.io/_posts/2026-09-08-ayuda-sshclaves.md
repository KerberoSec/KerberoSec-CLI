---
layout: single
title: Ganar Persistencia en SSH
excerpt: "En este Post, enseñare a como podemos llegar a ganar persistencia en un servidor ssh, con solamente la clave publica o privada."
date: 2026-09-08
classes: wide
header:
  teaser: /assets/images/htb-writeup-shocker/
  teaser_home_page: true
  icon: /assets/images/
categories:
  - Web-documentation
  - Pentesting
tags:
  - Persistencia
  - SSH
  - SSHclaves
---

Siempre hemos tenido esa duda de como funcionan las claves de ssh ya sea publica o privada, como se generan o como podemos llegar a abusar de estas y que efectos cruciales pueden llegar a tener desde el punto de vista tecnico. A continuación listare 2 formas de las que podemos abusar:

### UTILIZAR CLAVE PRIVADA OBJETIVO EN MÁQUINA ATACANTE
Si tenemos acceso de lectura al directorio <span style="color:lightblue">.ssh</span> de un usuario específico, por ejemplo <span style="color:lightblue">/home/user/.ssh/</span> o <span style="color:lightblue">/usuario/.ssh/</span>, podríamos encontrar allí su <span style="color:lightyellow">clave privada</span>, comúnmente almacenada como <span style="color:gold">id_rsa</span>.

Si logramos leer o bajarnos el archivo <span style="color:gold">id_rsa</span> objetivo, podemos traerlo a nuestra máquina y usarlo para iniciar sesión como ese usuario en el servidor ssh.

Por ejemplo, si bajamos la clave privada a nuestra máquina, podemos hacer lo siguiente:
```bash
# Dar permisos de WR al archivo como dueño.
chmod 600 id_rsa

# Nos conectamos al servidor usando la clave privada del objetivo
ssh user@IP -i id_rsa
```

>Es importante ejecutar el comando chmod 600 id_rsa en la clave privada después de copiarla, para asegurar que solo el propietario del archivo tenga permisos de lectura y escritura. Si los permisos de la clave privada son demasiado permisivos (por ejemplo, si otros usuarios pueden leerla), el propio servidor SSH rechazará su uso por razones de seguridad.

### PASAR CLAVE PÚBLICA ATACANTE A MÁQUINA OBJETIVO

| COMANDO    | FLAG  | DESCRIPCIÓN                                                                    |
| ---------- | ----- | ------------------------------------------------------------------------------ |
| ssh-keygen | -t    | Le indicamos el tipo de clave, recomendado "rsa" cifrado y compatible con todo |
| ssh-keygen | -b    | tamaño de la clave, recomendado para servidores "4096".                        |
| ssh-keygen | -f -R | Eliminar Host de confianza (conocido) y se indica el host a borrar(ip).        |

Estándar de generar llaves:
```bash
ssh-keygen -t rsa -b 4096 -f id_rsa
```

En caso de necesitar borrar el servidor host del ssh victima desde 0 a nivel de acceso en local, ante cualquier error:
```bash
ssh-keygen -f '/home/usuario/.ssh/known_hosts' -R 'IP_servidor_a_borrar'
```

Si tenemos acceso de escritura al directorio <span style="color:lightblue">.ssh</span> de un usuario, por ejemplo <span style="color:lightblue">/home/user/.ssh/</span>, podemos colocar nuestra propia <span style="color:lightyellow">clave pública</span> en el archivo ==authorized_keys== de ese usuario. Esta técnica es común para obtener persistencia para el acceso SSH después de haber conseguido un shell como ese usuario.

Es importante tener en cuenta que la configuración actual de SSH no permite aceptar claves que hayan sido escritas por otros usuarios. Por eso, esta técnica solo funcionará si ya tenemos control sobre ese usuario, es decir, si ya tenemos una shell/sesión activa como él.

Primero, en nuestra máquina, generamos un nuevo par de claves con **ssh-keygen**:

```bash
ssh-keygen -t rsa -b 4096 -f id_rsa
```

Esto nos genera dos archivos de llaves:

**id_rsa** → la clave privada, que usaremos con **ssh** <span style="color:yellow">-i</span>

**id_rsa.pub** → la clave pública, que debemos copiar a la máquina remota.

Una vez copiada el código de **id_rsa.pub**, en la máquina remota la agregamos al archivo **authorized_keys** del usuario al que queremos acceder. Por ejemplo:

```bash
# Meter el código de la llave publica directamente.
echo "clave_publica_codigo" >> /usuario/.ssh/authorized_keys
```

O abusar de una mala configuración de algún servidor cual tengamos acceso a dicha ruta subir directamente el **authorized_keys** con **permisos 600**:

Con esto, el servidor permitirá que iniciemos sesión como ese usuario usando la clave privada nuestra generada previamente:

```bash
ssh user@IP -i id_rsa
```

Este método es una forma efectiva de mantener acceso persistente como ese usuario vía SSH, siempre que ya tengamos permisos para modificar su archivo **authorized_keys** o sustituirlo.

