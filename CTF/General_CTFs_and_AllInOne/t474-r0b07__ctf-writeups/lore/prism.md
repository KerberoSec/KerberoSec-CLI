# `/lore/prism.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: antes de este texto, ECHELON era historia.
             después: vas a ver que nunca terminó.
             solo se mudó a mejores servidores.
```

---

El 6 de junio de 2013,
un periódico británico publicó documentos clasificados
de la Agencia de Seguridad Nacional de Estados Unidos.

Los documentos los filtró un contratista de la NSA
que había decidido que el público tenía derecho a saber.

Su nombre era **Edward Snowden**.
El programa se llamaba **PRISM**.

---

## `> cat que_era.txt`

PRISM no interceptaba cables.
No necesitaba satélites en órbita.
No requería estaciones en lugares remotos.

Tenía algo mejor.

```
PROVEEDORES CONFIRMADOS:
├── Microsoft     → 2007
├── Yahoo         → 2008
├── Google        → 2009
├── Facebook      → 2009
├── PalTalk       → 2009
├── YouTube       → 2010
├── Skype         → 2011
├── AOL           → 2011
└── Apple         → 2012
```

La NSA no necesitaba interceptar el tráfico.
Las empresas les daban acceso directo a los servidores.

Correos. Documentos. Fotos. Chats. Videos.
En tiempo real. Sin orden judicial individual.
Con cobertura legal bajo la Sección 702 de la FISA.

---

## `> cat como_funcionaba.txt`

El proceso era simple comparado con ECHELON.

```bash
$ request --target "usuario_sospechoso@gmail.com" \
          --authority "FISA_702" \
          --scope "all_data" \
          --notification_to_user false

> ACCESS GRANTED
> DATA STREAM: ACTIVE
```

No necesitaban hackear nada.
Tenían la llave.

Y las empresas no podían hablar de ello.
Las órdenes venían acompañadas de *gag orders*:
prohibición legal de revelar que habías recibido una solicitud.

---

## `> cat el_momento.txt`

Snowden trabajaba como contratista en Hawaii.
Tenía acceso a sistemas de la NSA e inteligencia de otros países.

Durante meses copió documentos.
Viajó a Hong Kong.
Los entregó a periodistas del Guardian y Washington Post.

Sabía lo que le esperaba.

```diff
- podría haber ignorado lo que vio
- podría haber seguido cobrando su salario
+ eligió publicar
+ dijo: "el público tiene derecho a decidir
+         si acepta esto o no"
```

El argumento era el mismo que usó Aleph One en 1996.
El conocimiento asimétrico beneficia siempre al que lo tiene.

---

## `> cat el_resultado.txt`

Los documentos de Snowden cambiaron la industria tecnológica.

El cifrado end-to-end pasó de ser una curiosidad técnica
a una característica estándar en aplicaciones de mensajería.

WhatsApp, Signal, iMessage implementaron o mejoraron E2E.
HTTPS se volvió obligatorio donde antes era opcional.
La conciencia sobre privacidad digital aumentó globalmente.

Y Snowden vive en Moscú desde 2013.
Porque ningún país aliado de Estados Unidos le ofreció asilo.

---

## `> echo $CONEXION`

```
$ diff echelon.txt prism.txt
> ECHELON: interceptar comunicaciones en tránsito
> PRISM: acceso directo a datos en reposo

> ECHELON: infraestructura física global
> PRISM: acuerdos legales con empresas privadas

> ECHELON: décadas de negación oficial
> PRISM: confirmado por documentos filtrados

$ grep "diferencia_fundamental" resultado.txt
> ninguna
> el objetivo siempre fue el mismo
```

ECHELON capturaba lo que viajaba por el aire.
PRISM capturaba lo que guardabas en la nube.

La nube no es tuya.
Nunca lo fue.

---

## `> echo $PREGUNTA`

```
$ cat /lore/dark_llm_honeypot.md | grep "producto"
> si crees que eres anónimo: > tú eres el producto

$ echo $DIFERENCIA_CON_PRISM
> ninguna estructural
> presupuesto distinto
> escala distinta
> lógica idéntica
```

Una IA gratis recolecta tus prompts.
PRISM recolectaba tus comunicaciones.
ECHELON recolectaba tus llamadas.

Investiga qué fue **XKeyscore**.
Investiga qué podía hacer un analista de la NSA con él.
Después vuelve y dime si cambiaste algo en tu comportamiento digital.

Si la respuesta es no: el sistema funciona exactamente como fue diseñado.

---

## `> echo $REFERENCIA`

```
Greenwald, Glenn. (2014). No Place to Hide.
// el libro del periodista que recibió los documentos.
// léelo antes de opinar sobre Snowden.

Snowden, Edward. (2019). Permanent Record.
// su versión. en sus palabras.

FISA Section 702. United States Code.
// el marco legal que lo hizo posible.
// sigue vigente.

// los documentos originales están en theintercept.com
// siempre estuvieron disponibles.
// la pregunta es cuántos los leyeron.
```

---

```
████████████████████████████████████████
█                                      █
█   n0 t3 h4c3345r0n.                 █
█                                      █
█   l3s d1st3 4cc3s0.                 █
█                                      █
█   s1n s4b3rl0.                      █
█                                      █
████████████████████████████████████████
```

`// los bits menos significativos son los que más dicen.`

`→ github.com/t474-r0b07`

---
<!-- 0x50 0x52 0x49 0x53 0x4d // 3l_qu3_v3s_n0_3s_t0d0 -->
