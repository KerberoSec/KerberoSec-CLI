---
title: OSINT 003 hackmyvm challenge
description: 
date: 2026-02-27 23:46:21+0000
categories:
    - hackmyvm.eu
tags:
    - hackmyvm.eu
---

Who is she?

Flag format: HMV{namelastname}

Ex: HMV{johnwick}

***
*[Image: given]*

use any image reverse site
- https://picdetective.com
- https://tineye.com/
- https://images.google.com/
- https://yandex.com/images/search

*[Image: reverse search image]*

*[Image: pinterest]*

- https://www.insonoro.com/noticia/57213/homenaje-a-gata-cattana-con-una-exhibicion-de-grafitis-en-la-ciudad-de-granada

- found spanish article
- granada city paid tribute to passed away singer Gata Cattana
> HMV{GataCattana}

- to dig bit deeper i wanted to find exact coordinate of mural
- i stumbled upon this site
- https://peskpesk.com/gata-catana-23/

*[Image: article https://peskpesk.com/gata-catana-23/]*

- upon walking bit on street view

*[Image: street view]*

> coordinates: 37.207969337342355, -3.620627541034744

- i also wanted to know time when mural was painted and by whom

*[Image: comparing old streetview footage]*

- i found yt video in same spanish article

*[Image: footage for video]*

*[Image: on same article mentioned above]*

- on  site image name was `20170324-gata2.jpg`
- exiftool does not reveal anything
- which means 24 march 2017
- using shadow map we can estimate when this artist was painting mural

*[Image: google bird eye view]*

- red marks location of mural
- shade is in side of wall

*[Image: shadow map]*

- so it should be around 4 pm: 6 pm in evening 
