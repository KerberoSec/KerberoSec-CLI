# `/lore/cambridge_analytica.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: antes de este texto, creías que tus likes
             eran solo preferencias personales.
             después: vas a ver para qué se usaron.
```

---

En 2013,
una empresa llamada **Cambridge Analytica**
desarrolló una técnica para construir perfiles psicológicos
de millones de personas
usando datos públicos y semipúblicos de Facebook.

No hackearon nada.
No necesitaron.
Los datos estaban ahí.

---

## `> cat que_era.txt`

Cambridge Analytica era una firma de consultoría política
especializada en lo que llamaban **psychographic targeting**:
segmentación de audiencias basada en personalidad,
no solo en demografía.

```bash
$ cat /lore/modelo_ocean.txt

> OCEAN: modelo psicológico de cinco factores
> O: Openness        (apertura a experiencias)
> C: Conscientiousness (responsabilidad)
> E: Extraversion    (extroversión)
> A: Agreeableness   (amabilidad)
> N: Neuroticism     (neuroticismo)
```

Con suficientes datos de comportamiento digital
se puede inferir el perfil OCEAN de una persona
con mayor precisión que sus propios amigos.

Un investigador de Cambridge lo demostró en 2013.
Cambridge Analytica tomó nota.

---

## `> cat como_funcionaba.txt`

El mecanismo era simple.

Una aplicación de Facebook llamada *"This Is Your Digital Life"*
pedía acceso a los datos del usuario que la instalaba.

```
permisos solicitados:
├── perfil público
├── lista de amigos
└── likes
```

Lo que no decía:
que al instalar la app,
también recolectaba los datos de todos tus amigos
sin que ellos lo supieran
y sin que lo autorizaran.

```
270,000 usuarios instalaron la app
    → datos de 87,000,000 de perfiles recolectados
        → perfiles OCEAN construidos
            → micro-targeting político
```

Ochenta y siete millones de personas
cedieron sus datos
sin saberlo
porque un amigo hizo un test de personalidad.

---

## `> cat el_momento.txt`

En 2016,
Cambridge Analytica trabajó para la campaña de Donald Trump
y para el Brexit.

El objetivo no era convencer a nadie de cambiar de opinión.
Era más sutil:

```diff
- identificar a los indecisos con perfil específico
+ mostrarles contenido diseñado para su vulnerabilidad psicológica
- publicidad genérica para todos
+ mensaje personalizado para cada perfil OCEAN
```

No te decían lo mismo a todos.
Te decían exactamente lo que tu perfil psicológico
indicaba que necesitabas escuchar
para moverte en la dirección que querían.

---

## `> cat el_resultado.txt`

En 2018, un whistleblower llamado **Christopher Wylie**
reveló el funcionamiento interno de la empresa.

Facebook fue multado con $5,000,000,000 de dólares
por la FTC estadounidense.
Cambridge Analytica cerró.

Pero el modelo no desapareció.
El modelo se normalizó.

```
$ echo $STATUS
> psychographic targeting: estándar de la industria publicitaria
> micro-targeting político: legal en la mayoría de países
> recolección de datos de terceros vía apps: restringida pero activa
> tu perfil psicológico inferido: actualizado en tiempo real
```

---

## `> echo $CONEXION`

```
$ diff cambridge_analytica.txt manus_ai.txt

> cambridge: datos de Facebook → perfil psicológico → mensaje personalizado
> manus: comentarios de Facebook → perfil de preferencias → análisis personalizado

> cambridge: escala de millones
> manus: escala de uno

> cambridge: objetivo político
> manus: objetivo comercial

$ grep "diferencia_fundamental" resultado.txt
> ninguna estructural
> solo el precio y la escala
```

Manus no inventó nada nuevo.
Aplicó la misma lógica a escala individual
y te cobró por el servicio.

---

## `> echo $REFERENCIA`

```
Wylie, Christopher. (2019). Mindf*ck.
// el libro del whistleblower.
// léelo antes de opinar sobre privacidad digital.

Cadwalladr, Carole. (2018). The Great Hack.
// documental de Netflix.
// 90 minutos. vale cada uno.

FTC vs Facebook. (2019). Settlement $5B.
// el documento legal está público.
// léelo y busca qué cambió realmente.

// spoiler: no mucho.
```

---

```
████████████████████████████████████████
█                                      █
█   n0 t3 h4ck34r0n.                  █
█                                      █
█   t3 l3y3r0n.                       █
█                                      █
█   y us4r0n l0 qu3 3nC0ntr4r0n.      █
█                                      █
████████████████████████████████████████
```

`// los bits menos significativos son los que más dicen.`

`→ github.com/t474-r0b07`

---
<!-- 0x43 0x41 0x4d 0x42 0x52 0x49 0x44 0x47 0x45 // 3l_t3st_d3_p3rs0n4l1d4d_qu3_n0_3r4_un_t3st -->
