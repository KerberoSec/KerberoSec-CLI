# `/lore/lou_montulli.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: antes de este texto, creías que las cookies
             eran un problema de privacidad moderno.
             después: vas a ver quién las inventó y por qué.
```

---

En 1994,
un programador de 23 años en Netscape Communications
necesitaba resolver un problema técnico simple.

Su nombre era **Lou Montulli**.

El problema: los servidores web no tenían memoria.
Cada vez que visitabas una página,
el servidor no sabía si ya habías estado antes.

El carrito de compras de una tienda online
olvidaba lo que habías puesto adentro
cada vez que cambiabas de página.

---

## `> cat la_solucion.txt`

Montulli inventó un mecanismo para darle memoria al servidor.

Un pequeño archivo de texto guardado en tu navegador.
El servidor lo escribía. El navegador lo guardaba.
La próxima visita, el navegador lo devolvía.

Lo llamó **cookie**.
Por las *magic cookies* de Unix.
Identificadores que los programas se pasaban entre sí
para mantener contexto.

```bash
$ echo $INTENCION_ORIGINAL
> recordar el carrito de compras
> mantener sesión iniciada
> personalizar preferencias del usuario
```

Era una solución elegante a un problema real.
No había intención maliciosa.
No había modelo de negocio oculto.

Era ingeniería.

---

## `> cat el_momento.txt`

El problema fue lo que vino después.

En 1996, los navegadores empezaron a aceptar cookies
de dominios distintos al que visitabas.

```
visitás: tienda.com
tienda.com carga: anuncio de adserver.com
adserver.com escribe su propia cookie en tu navegador
la próxima vez que visitás otro sitio con adserver.com: adserver.com ya sabe quién sos
```

Montulli no diseñó eso.
Pero tampoco nadie lo detuvo.

El mecanismo que inventó para recordar tu carrito
se convirtió en la infraestructura del rastreo masivo entre dominios.

---

## `> cat el_error.txt`

No fue un error de código.
Fue un error de anticipación.

```diff
- nadie imaginó que la web crecería así
- nadie anticipó el modelo publicitario que dominaría internet
- nadie pensó que "recordar el carrito" se convertiría en "rastrear todo"
+ el mecanismo era neutral
+ el uso no lo fue
```

Montulli en 2013, en una entrevista:
*"Si hubiera sabido lo que iba a pasar,
habría diseñado algo diferente."*

La tecnología no tiene moral.
La moral la ponen quienes la usan.

---

## `> cat el_resultado.txt`

Las cookies de terceros se convirtieron en
la columna vertebral de la industria publicitaria digital.

```
CADENA:
cookie de terceros
    → perfil de comportamiento
        → subasta en tiempo real (RTB)
            → anuncio personalizado
                → tú, el producto
```

En 2020, Google anunció que eliminaría las cookies de terceros en Chrome.
En 2024, dio marcha atrás.

El negocio era demasiado grande para tocarlo.

---

## `> echo $CONEXION`

```
$ cat /lore/accept_all_cookies.md | grep "contrato"
> firmaste un contrato que nunca te mostraron

$ whoami
> lou_montulli no firmó ese contrato
> tú tampoco te lo ofrecieron
> simplemente empezó a ejecutarse
```

El banner de cookies no es un aviso de privacidad.
Es la versión legal de algo que lleva treinta años funcionando
sin pedirte permiso.

---

## `> echo $REFERENCIA`

```
Montulli, Lou. (1994). Cookie specification.
Netscape Communications. RFC original.

Kristol, D. (2001). HTTP Cookies: Standards, Privacy, and Politics.
ACM Transactions on Internet Technology.

// buscá la entrevista de Montulli en 2013.
// léela completa.
// después vuelve y dime si la tecnología es neutral.
```

---

```
████████████████████████████████████████
█                                      █
█   1nv3nt0 un4 h3rr4m13nt4.          █
█                                      █
█   0tr0s 1nv3nt4r0n 3l us0.          █
█                                      █
█   t0d0s 4c3pt4r0n l4s c00k13s.      █
█                                      █
████████████████████████████████████████
```

`// los bits menos significativos son los que más dicen.`

`→ github.com/t474-r0b07`

---
<!-- 0x4d 0x4f 0x4e 0x54 0x55 0x4c 0x4c 0x49 // 3l_qu3_1nv3nt0_3l_c4rr1t0 -->
