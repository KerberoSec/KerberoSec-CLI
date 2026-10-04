
## CyberGame očami hráča: čo mi dala kybernetická súťaž a čo môže dať vašim študentom

O CyberGame sa dá rozprávať z mnohých strán. Ja vám poviem, aké to je hrať. Na tohtoročnom CyberGame som skončil na 8. mieste v slovenskom poradí a prednáška je osobnou výpoveďou o tom, čo ma do súťaže dostalo, čo ma tam držalo, kde som narazil na strop a čo som objavil až v záverečných kolách. Pozrieme sa aj na to, ako generatívna AI mení dynamiku súťaže: nie ako hrozba, ale ako nová premenná, s ktorou musia rátať hráči aj tvorcovia výziev. Ak hľadáte inšpiráciu pre svojich študentov alebo sami zvažujete vyskúšať niečo podobné, táto prednáška je pre vás.

📄 Prednáška (PDF): https://github.com/e0sec/ctf-writeups/blob/main/ossconf/ctf_talk_slovak.pdf  
📄 Prednáška (PPTX): https://github.com/e0sec/ctf-writeups/blob/main/ossconf/ctf_talk_sk.pptx  
📄 Runsheet (PDF: ENG): https://github.com/e0sec/ctf-writeups/blob/main/ossconf/ctf-talk-runsheet.pdf

---

## Hacking seminár a organizované riešenie kryptografických hlavolamov: materiály na workshop

Na seminári uvediem účastníkov do sveta fenoménov známych pod skratkou CTF (Capture The Flag) a ARG (Alternate Reality Games), ktoré hravou formou sprostredkúvajú vedomosti z oblasti kryptografie a počítačovej bezpečnosti. Súčasťou seminára bude možnosť si takéto hádanky priamo vyskúšať, teda ponoriť sa do procesu analýzy a následného nájdenia tzv. flagu (vlajky), ktorá je v tomto svete dôkazom úspechu. Konzultovať postup riešenia a otázky klásť mi môžete a ja sa na ne budem snažiť odpovedať. Pre tých, ktorí si budú chcieť oddýchnuť od počítača bude pripravený aj vzrušujúci hands-on v podobe „lock-picking“ kútika, kde si môžete vyskúšať otváranie zámku bez kľúča tzv. nedeštruktívnymi metódami. Všetko v etickom rámci najmä so snahou upozorniť na bezpečnostné nedostatky bežne používaných systémov.

**Doba trvania:** 60-75 minút

---

## 🎮 CTF a ARG hry

### Ae27ff ARG
🔗 https://ae27ff.com/about.php

Séria ARG hádaniek postavená na steganografii a vyšetrovaní, inšpirovaná legendárnym Python Challenge. Beží od roku 2015 a úlohy postupne pribúdajú na obtiažnosti: od jednoduchých šifier až po pokročilé skrývacie techniky. Ideálna ukážka toho, ako môže vyzerať „alternate reality game“ zameraná na lúštenie.

### Kyberbezpečnostná hra: Fakt alebo Mýtus (CSIRT.sk)
🔗 https://csirt.sk/kyberbezpecnostna-hra.html

Interaktívna kvízová hra od Vládnej jednotky CSIRT.sk, v ktorej si formou „fakt alebo mýtus“ otestujete svoje znalosti kyberbezpečnosti a spoznáte služby, ktoré CSIRT.sk poskytuje. Vhodná ako ľahký úvod pre menej skúsených účastníkov.

### Cybersecurity Game (Siemens Education)
🔗 https://cybersecuritygame.co.uk/

Vzdelávacia hra od Siemensu určená najmä pre mladších študentov (11: 14 rokov), ktorá učí základy šifrovania na príklade Caesarovej šifry. Súčasťou je aj záverečný kvíz a súbor doplnkových materiálov pre učiteľov. Dobrý príklad toho, ako sa dá kybernetická bezpečnosť učiť aj úplných začiatočníkov.

### Cyber Games UK
🔗 https://cybergamesuk.com/

Platforma organizácie The Cyber Trust ponúkajúca celú sériu hier a aktivít zameraných na rozvoj zručností v kyberbezpečnosti (napr. portál CyberLand, textová simulácia rizikovej komunikácie či kvízy o online bezpečnosti). Obsahuje aj hotové vyučovacie plány pre pedagógov.

---

## 🛠️ Nástroje na riešenie CTF hádaniek

- **CyberChef**: https://gchq.github.io/CyberChef/: „švajčiarsky nožík“ pre kódovanie/dekódovanie, šifrovanie, hashovanie a analýzu dát priamo v prehliadači. Nástroj číslo jeden pri riešení CTF challengov.
- **Aperisolve**: https://www.aperisolve.com/: online nástroj na steganografickú analýzu obrázkov (LSB analýza, metadáta, extrakcia skrytých súborov a pod.).
- **Boxentriq**: https://www.boxentriq.com/: zbierka nástrojov na identifikáciu a lúštenie rôznych typov šifier a kódov.
- **dCode**: https://www.dcode.fr/en: rozsiahla databáza online lúštičov a solverov pre stovky šifier, kódov a hlavolamov.

---

## 🔓 Lockpicking: ako sa naučiť otvárať zámky bez kľúča

Nasledujúce zdroje slúžia výhradne na vzdelávacie a etické účely (tzv. locksport): teda na precvičovanie na vlastných zámkoch a pochopenie ich slabín, nie na neoprávnené vniknutie.

### MIT Guide to Lock Picking
🔗 https://archive.org/details/mit-guide-to-lock-picking-v05/mode/2up

Klasický a voľne dostupný úvodný text (autor „Ted the Tool“), ktorý zrozumiteľne vysvetľuje princípy valcových zámkov (pin tumbler) a základnú techniku „single pin picking“. Skvelý štart pre každého, kto sa chce dozvedieť, ako zámok skutočne funguje zvnútra.

### LockWiki
🔗 https://www.lockwiki.com/

Komunitne budovaná encyklopédia o zámkoch, nástrojoch a technikách otvárania: vhodná ako referenčná príručka pre začiatočníkov aj pokročilých.

### r/lockpicking (Reddit)
🔗 https://www.reddit.com/r/lockpicking/

Aktívna komunita nadšencov locksportu, kde nájdete rady pre začiatočníkov, odporúčania na prvé sady pickov a diskusie o technikách.

### Art of Lock Picking: Beginner's Guide
🔗 https://www.art-of-lockpicking.com/how-to-pick-a-lock-guide/

Moderný, prehľadný sprievodca s animáciami vysvetľujúci princíp „single pin picking“ krok za krokom, vrátane odporúčaní na výber prvej sady nástrojov.

### LockPickingLawyer (YouTube)
🔗 https://www.youtube.com/@lockpickinglawyer

Jeden z najznámejších a najsledovanejších tvorcov obsahu o locksporte na svete. Na svojom kanáli nedeštruktívne otvára stovky komerčných zámkov a zrozumiteľne vysvetľuje, prečo a ako konkrétna konštrukcia zlyháva: výborný zdroj na pochopenie reálnych bezpečnostných slabín bežných zámkov.

### TOOOL: The Open Organisation Of Lockpickers
🔗 https://toool.us/

Medzinárodná nezisková organizácia (pôvodom z Holandska) venujúca sa etickému locksportu a vzdelávaniu verejnosti o zámkových systémoch. Organizuje bezplatné stretnutia, prevádzkuje tzv. „Lockpick Villages“ na konferenciách ako DEF CON či HOPE a publikuje množstvo výučbových materiálov, vrátane prehľadu legislatívy týkajúcej sa lockpickingu.

### LockNoob (YouTube)
🔗 https://www.youtube.com/@LockNoob

Britský tvorca obsahu zameraný najmä na začínajúcich a mierne pokročilých lockpickerov. Na rozdiel od čisto demonštračných kanálov sa Ash (LockNoob) sústreďuje na vysvetľovanie techník krok za krokom vrátane európskych typov zámkov (na rozdiel od bežných amerických), recenzií nástrojov aj výroby vlastných pickov.

### LPU Belt Explorer (LockPickers United)
🔗 https://lpubelts.com/

Databáza takmer 900 zámkov zoradených podľa tzv. „belt rankingu“: komunitného systému hodnotenia obtiažnosti zámkov (podobne ako pásy v bojových umeniach). Skvelý nástroj na to, aby si si vedel systematicky vybrať zámky zodpovedajúce tvojej aktuálnej úrovni a postupne sa zlepšovať.

### Praktická kniha: Practical Lock Picking: Deviant Ollam
🔗 https://shop.elsevier.com/books/practical-lock-picking/ollam/978-1-59749-989-7

Jedna z najuznávanejších učebníc lockpickingu, napísaná Deviantom Ollamom, dlhoročným lektorom fyzickej bezpečnosti a členom vedenia TOOOL v USA. Kniha sa sústreďuje priamo na potreby penetračných testerov a bezpečnostných profesionálov: vysvetľuje princípy valcových a lamelových zámkov, techniky pickovania aj rýchle metódy vstupu (shimming, bumping, bypass).

### Kniha: Locksport: A Hacker's Guide to Lockpicking, Impressioning, and Safe Cracking
🔗 https://nostarch.com/locksport

Rozsiahla (416-stranová) učebnica od piatich šampiónov locksportu (Jos Weyers, Matt Burrough, Walter Belgers, BandEAtoZ, Nigel Tolley), vydaná No Starch Press. Okrem klasického pickovania valcových a lamelových zámkov pokrýva aj impressioning (výrobu funkčného kľúča odtlačením) a manipuláciu bezpečnostných skriňových zámkov: vrátane prípravy na súťaže.

---

*Materiál pripravil e1 pre workshop „CyberGame očami hráča“.*
