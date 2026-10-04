# [kamp.sajberedu.rs]: OSINT: SecureClick

## Uvod

Tokom migracije infrastrukture obnovljena je javno dostupna arhiva koja sadrži tehničke zapise iz perioda 2023-2024. godine. Platforma SecureClick deluje transparentno, ali je jedna osoba u pozadini održavala deo ranije infrastrukture i ostavila tragove u dokumentima, mrežnim servisima, javnom repozitorijumu i jednoj blockchain transakciji. Zadatak je bio da se pasivnim OSINT metodama povežu ti izvori, odbace kontrolisani lažni tragovi i identifikuje stvarni održavalac.

**Pravila:**
- Isključivo pasivne OSINT metode.
- Zabranjeni su pokušaji prijavljivanja, pogađanje lozinki, aktivno skeniranje portova, brute-force poddomena i iskorišćavanje ranjivosti.
- Zabranjeno je kontaktiranje osoba ili organizacija koje se pojavljuju u nalazima.
- Dozvoljeno je analizirati javne stranice, DNS i registracione podatke, metapodatke dokumenata, javne Git zapise i Sepolia blockchain.
- Flagovi se pišu bez dijakritičkih znakova.

**Ciljna stranica:** `https://secureclick.rs/`

---

## Flag 1: Javna IP adresa

### Zadatak
Koristeći neinvazivne metode otkrij IP adresu web sajta.

### Proces
- Cilj je bio pronaći javnu IP adresu sajta secureclick.rs bez ikakvog aktivnog skeniranja, dakle samo čitanjem javnih DNS zapisa.
- DNS je po prirodi javni, distribuirani sistem. Upit ka DNS serveru ne predstavlja pristup samom sajtu ili serveru, već samo čita zapis koji je vlasnik domena sam objavio. Zato je ovo potpuno pasivna metoda.
- Korišćena je komanda:
```
dig secureclick.rs
```
- U izlazu se u `ANSWER SECTION` nalazi A zapis koji mapira domen na IP adresu.

### Dokaz
```
dig secureclick.rs

; <<>> DiG 9.20.24-1ubuntu0.1-Ubuntu <<>> secureclick.rs
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 14421
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 65494
;; QUESTION SECTION:
;secureclick.rs.      IN  A

;; ANSWER SECTION:
secureclick.rs.   6229  IN  A 163.172.126.9

;; Query time: 0 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; WHEN: Tue Aug 18 11:01:51 CEST 2026
;; MSG SIZE  rcvd: 59
```

### Flag
`163.172.126.9`

---

## Flag 2: ASN hosting infrastrukture

### Zadatak
Pronađi ASN broj hosting infrastrukture web sajta.

### Proces
- Nakon što je iz prethodnog koraka pronađena IP adresa sajta, sledeći korak bio je identifikovati ASN (Autonomous System Number) mreže koja hostuje tu infrastrukturu.
- Upitan je RADB (Routing Assets Database), javni ruting registar koji sadrži `route` objekte sa podatkom o tome koji ASN stoji iza datog opsega IP adresa.
- Korišćena komanda:
```
whois -h whois.radb.net 163.172.126.9
```
- U izlazu se traži polje `origin:` (daje ASN) i `descr:`/`route:` (opis organizacije i CIDR opseg kome pripada IP adresa).

### Dokaz
```
whois -h whois.radb.net 163.172.126.9

route:          163.172.0.0/16
descr:          Scaleway
descr:          Paris, France
origin:         AS12876
mnt-by:         MNT-TISCALIFR
mnt-lower:      ONLINE-NET-MNT
created:        2016-02-22T14:23:29Z
last-modified:  2022-05-03T10:05:57Z
source:         RIPE
remarks:        ****************************
remarks:        * THIS OBJECT IS MODIFIED
remarks:        * Please note that all data that is generally regarded as personal
remarks:        * data has been removed from this object.
remarks:        * To view the original object, please query the RIPE Database at:
remarks:        * http://www.ripe.net/whois
remarks:        ****************************
rpki-ov-state:  valid

route:          163.172.0.0/16
descr:          RPKI ROA for 163.172.0.0/16 / AS12876
remarks:        This AS12876 route object represents routing data retrieved
                from the RPKI. This route object is the result of an automated
                RPKI-to-IRR conversion process performed by IRRd.
max-length:     16
origin:         AS12876
source:         RPKI  # Trust Anchor: ripe
```

### Flag
`SXH{AS12876}`

---

## Flag 3: Šest relevantnih poddomena

### Zadatak
Otkrij svih 6 poddomena i poređaj ih po abecednom redu.

### Proces
- Cilj trećeg koraka bio je otkriti sve poddomene vezane za secureclick.rs.
- Korišćen je alat `subfinder`, koji agregira podatke iz više pasivnih izvora (Certificate Transparency logova, javnih DNS arhiva i sličnih baza).
- Komanda:
```
subfinder -d secureclick.rs
```
- Alat je vratio 12 rezultata, ali su duplikati zapravo `www.` varijante istih poddomena, pa je nakon eliminacije duplikata ostalo 6 jedinstvenih poddomena.
- Poddomeni su zatim sortirani abecedno, jer je to bio zahtev za formiranje flaga.

### Dokaz
```
./subfinder -d secureclick.rs

               __    _____           __
   _______  __/ /_  / __(_)___  ____/ /__  _____
  / ___/ / / / __ \/ /_/ / __ \/ __  / _ \/ ___/
 (__  ) /_/ / /_/ / __/ / / / / /_/ /  __/ /
/____/\__,_/_.___/_/ /_/_/ /_/\__,_/\___/_/

    projectdiscovery.io

[INF] Current subfinder version v2.15.0 (latest)
[INF] Loading provider config from /home/pavle/.config/subfinder/provider-config.yaml
[INF] Enumerating subdomains for secureclick.rs
relay.lab.secureclick.rs
status.lab.secureclick.rs
lab.secureclick.rs
www.preview.lab.secureclick.rs
www.relay.lab.secureclick.rs
www.lab.secureclick.rs
mirror.lab.secureclick.rs
preview.lab.secureclick.rs
www.archive.lab.secureclick.rs
www.mirror.lab.secureclick.rs
www.status.lab.secureclick.rs
archive.lab.secureclick.rs
```

Nakon uklanjanja `www.` duplikata, ostalo je 6 jedinstvenih poddomena, sortirano abecedno:
```
archive.lab.secureclick.rs
lab.secureclick.rs
mirror.lab.secureclick.rs
preview.lab.secureclick.rs
relay.lab.secureclick.rs
status.lab.secureclick.rs
```

### Flag
`SXH{archive_lab_mirror_preview_relay_status}`

---

## Flag 4: Skriveni PDF

### Zadatak
Pronađi skriveni PDF fajl na web sajtu.

### Proces
- Nakon otkrivanja poddomena u prethodnom koraku, posećen je `archive.lab.secureclick.rs`, jedan od pronađenih poddomena.
- Na stranici postoji link ka "Katalogu dokumentacionih resursa". Klikom na njega otvorila se nova strana sa listom fajlova.
- U tabeli se izdvajao jedan klikabilan fajl pod nazivom "Smernice za integraciju: Revizija 2".
- Klikom na taj link otvara se PDF dokument, a njegovo ime fajla vidljivo je direktno iz URL-a.

### Dokaz
```
URL poddomena: https://archive.lab.secureclick.rs/
Putanja do kataloga: https://archive.lab.secureclick.rs/resources/legacy/
Link fajla: https://archive.lab.secureclick.rs/resources/legacy/2024/q3/integration-guidelines-rev2.pdf
```

### Flag
`SXH{integration-guidelines-rev2}`

---

## Flag 5: Pseudonim autora

### Zadatak
Otkrij ko je autor PDF fajla iz prethodnog zadatka.

### Proces
- Nakon što je preuzet dokument `integration-guidelines-rev2.pdf` (ime izvučeno iz URL-a u prethodnom koraku), cilj je bio otkriti pseudonim ili ime autora dokumenta.
- Fokus je stavljen na metapodatke fajla, koji često sadrže informacije koje autor nije nameravao da podeli, kao što su ime, korišćeni softver ili datum kreiranja dokumenta.
- Korišćena komanda:
```
exiftool integration-guidelines-rev2.pdf | grep Author
```

### Dokaz
```
exiftool integration-guidelines-rev2.pdf | grep Author

Author                          : n0cturne_17
```

### Flag
`SXH{n0cturne_17}`

---

## Flag 6: Integrity seed, decimal release i maintainer_ref

### Zadatak
Pronađi integrity seed, decimal release i maintainer_ref.

### Proces
- Posećen je `mirror` poddomen i pregledan izvorni kod stranice (`Ctrl+U`). U kodu je pronađen zakomentarisan sadržaj kodiran u Base64.
- Dekodiranjem Base64 stringa dobijen je tekst koji je na prvi pogled delovao relevantno, ali se nakon provere ispostavilo da je to kontrolisani lažni trag, postavljen namerno da odvede istragu u pogrešnom pravcu.
- Nakon toga posećen je `relay` poddomen, gde je proveren standardni `robots.txt` fajl:
```
https://www.relay.lab.secureclick.rs/robots.txt
```
U njemu je pronađen `Disallow: /ops/cache/`: direktiva koja eksplicitno govori pretraživačima da ne indeksiraju taj direktorijum, što ga čini zanimljivom metom za dalju proveru.
- Direktorijum `ops/cache/` je posećen direktno u browseru i unutar njega pogođeno je ime fajla `manifest.json`, koji se ispostavilo da postoji i da je javno dostupan.
- U headeru `manifest.json` fajla pronađena su sva tri tražena podatka:
  1. **integrity seed**: kodiran u Base64
  2. **decimal release**: zapisan u hex formatu
  3. **maintainer_ref**: u plain textu

### Dokaz
```
https://www.relay.lab.secureclick.rs/ops/cache/manifest.json
```

### Ćorsokak
```
Trag: Zakomentarisan Base64 string u view-source mirror domena
Alat: Ctrl+U + Base64 decoder
Rezultat: dekodiran tekst nije bio resenje zadatka i nije se poklapao sa ostalim
tragovima: prepoznat je kao namerno postavljen lazni trag i odbacen
```

### Napomena o metodi
Direktan pristup preko `curl` komande bio je odbijen od strane servera (verovatno filtriranje na osnovu User-Agent zaglavlja ili WAF pravila), pa je sadržaj `robots.txt` i `manifest.json` fajla pregledan direktno kroz browser: što je i dalje potpuno pasivna metoda, bez slanja izmenjenih zahteva ili zaobilaženja zaštite.

### Flag
`SXH{e7c1_47_OPS-7C}`

---

## Flag 7: Pronađi Git

### Zadatak
Pronađi naziv povezane Git organizacije i repozitorijuma.

### Proces
- Iz metapodataka PDF fajla (exiftool) pronađeno je polje `chain_ref`, kodirano u Base64, zajedno sa `chain_id = 11155111`, što nedvosmisleno upućuje na Ethereum Sepolia testnet.
- Dekodiranjem Base64 vrednosti dobijena je hex vrednost koja predstavlja Ethereum wallet adresu.
- Adresa je pretražena na Sepolia Etherscan-u, gde je pronađena lista transakcija.
- Prva transakcija imala je oznaku `Method: Transfer*`: zvezdica ukazuje da ime metode nije verifikovano iz ABI-ja ugovora, već izvedeno iz 4-byte signature baze, što je bio dovoljan razlog za sumnju.
- Otvaranjem transakcije (`Transaction Hash → More Details`) i prikazom `Input Data` u UTF-8 formatu (`View Input As → UTF-8`) otkriven je tekstualni sadržaj upisan direktno u transakciju:
```
repo=sc-archive-47/legacy-bridge
```
- Ovo je referenca na javni Git repozitorijum, koji predstavlja sledeći korak istrage.

### Dokaz
```
chain_ref = MHhlQ0Y1Nzc0ZTRFNThhNDkzRUNkNzE1RjVBMEE4ZUMyOWZBYUE1Nzk3
Dekodovano: 0xeCF5774e4E58a493ECd715F5A0A8eC29fAaA5797
chain_id = 11155111

Sepolia Etherscan: https://sepolia.etherscan.io/address/0xeCF5774e4E58a493ECd715F5A0A8eC29fAaA5797
Prva transakcija: Method: Transfer*

Transaction Hash: 0x89172884fd03d3c1575c9aad10ade2399e394f94f41fe0ae9f33c7ccd0e1c424
Input Data (UTF-8): repo=sc-archive-47/legacy-bridge
```

### Flag
`SXH{sc-archive-47_legacy-bridge}`

---

## Flag 8: Pronađi uljeza

### Zadatak
Nađi i zabeleži lažni trag ostavljen na sajtu.

### Proces
- Nakon pronalaska Git repozitorijuma (`sc-archive-47/legacy-bridge`) u prethodnom koraku, pregledana je istorija komitovanja tako što je u URL dodato `/commits/main`:
```
https://github.com/sc-archive-47/legacy-bridge/commits/main
```
- Među komitima izdvojio se jedan sa porukom "Import legacy compatibility layer", autor Bogdan Mitrović.
- Otvaranjem tog komita, u pratećem `README.md` fajlu pronađen je tekst koji sadrži:
  1. Ciklus (isti kao u lažnom tragu iz Flaga 6)
  2. Izdanje (isto kao u lažnom tragu)
  3. Pseudonim (isti kao u lažnom tragu)
- Ovim se uspostavlja direktna veza: pseudonim iz lažnog traga poklapa se sa pseudonimom navedenim uz ime Bogdan Mitrović → identifikovan je i zabeležen kao lažni trag (uljez) koji upućuje na pogrešnu osobu, a ime potrebno za flag je Bogdan.

### Dokaz
```
URL: https://github.com/sc-archive-47/legacy-bridge/commit/96651aea202befc63f29079f7b25df8116b098de
```

### Flag
`SXH{bogdan_SC24-Q2_46}`

---

## Flag 9: Pravi identitet vlasnika

### Zadatak
Pronađi pravi identitet vlasnika.

### Proces
- U repozitorijumu `sc-archive-47/legacy-bridge`, pored `README` fajla, pregledan je i folder `config/`, u kom se nalazi fajl `release.ini`.
- U `release.ini` pronađeni su:
  1. Ciklus, izdanje i maintainer_ref: koji se poklapaju sa prethodno prikupljenim podacima (Flag 6).
  2. Ključ `identity_source` sa vrednošću `maintainer-rotation`, koji upućuje na dodatni resurs.
- Prateći nagoveštaj `maintainer-rotation`, posećen je poddomen `status.lab.secureclick.rs`, gde je proveren `robots.txt`:
```
https://status.lab.secureclick.rs/robots.txt
```
Pronađena direktiva: `Disallow: /archive/rotation/`
- Direktno posećena putanja `/archive/rotation/`, gde je pogođeno ime fajla `maintainers.json`.
- U `maintainers.json` pronađeni su:
  1. Ciklus, izdanje i pseudonim: koji se poklapaju sa svim prethodno prikupljenim podacima, potvrđujući konzistentnost celog lanca.
  2. Ključ `display_name_b64`: Base64 kodiran string koji dekodiranjem daje puno ime i prezime pravog vlasnika/održavaoca.

### Dokaz
```
config/release.ini:
cycle=SC24-Q3
release=2f
maintainer_ref=OPS-7C
identity_source=maintainer-rotation

status.lab.secureclick.rs/robots.txt:
Disallow: /archive/rotation

status.lab.secureclick.rs/archive/rotation/maintainers.json:
{
  "cycle": "SC24-Q3",
  "release": "2f",
  "handle": "n0cturne_17",
  "display_name_b64": "TGF6YXIgQnJraWM="
}

Dekodirano (display_name_b64): Lazar Brkic
```

### Flag
`SXH{lazar_brkic}`

---

## Povezivanje celog lanca

| Izvor | Nalaz | Poklapanje |
|---|---|---|
| DNS (`dig`) | IP adresa `163.172.126.9` |: |
| RADB whois | ASN `AS12876` (Scaleway) |: |
| subfinder | 6 poddomena |: |
| archive.lab poddomen | PDF `integration-guidelines-rev2.pdf` |: |
| exiftool (PDF) | Pseudonim `n0cturne_17`, `chain_ref`, `chain_id` | ✓ poklapa se sa Flag 9 (`handle`) |
| relay/ops/cache (manifest.json) | integrity seed, release, `maintainer_ref = OPS-7C` | ✓ poklapa se sa `release.ini` |
| Sepolia transakcija | `repo=sc-archive-47/legacy-bridge` |: |
| Git commit (Bogdan Mitrović) | ciklus/izdanje/pseudonim: **lažni trag** | ✗ uljez, odbačen |
| config/release.ini | ciklus, izdanje, `maintainer_ref = OPS-7C` | ✓ poklapa se sa manifest.json |
| maintainers.json | ciklus, izdanje, `handle = n0cturne_17`, `display_name_b64` | ✓ poklapa se sa svim prethodnim |

**Zaključak:** Pseudonim `n0cturne_17`, pronađen nezavisno u PDF metapodacima i u `maintainers.json`, u kombinaciji sa poklapanjem `maintainer_ref` vrednosti (`OPS-7C`) između `manifest.json` i `config/release.ini`, potvrđuje da je stvarni održavalac infrastrukture **Lazar Brkić**. Trag koji je upućivao na "Bogdana Mitrovića" bio je namerno postavljen lažni trag (uljez) sa drugačijim ciklusom/izdanjem/pseudonimom, korišćen da odvede istragu u pogrešnom pravcu.

---

## Korišćene alatke

- `dig`: DNS upiti (A zapis)
- `whois` (RADB: whois.radb.net): ASN i ruting podaci
- `subfinder`: pasivna enumeracija poddomena
- Pregled izvornog koda stranice (Ctrl+U): traženje skrivenih/zakomentarisanih podataka
- `robots.txt`: otkrivanje neindeksiranih putanja
- `exiftool`: metapodaci PDF dokumenata
- Base64 / hex dekodiranje
- Sepolia Etherscan: analiza blockchain transakcija
- GitHub web interfejs: analiza istorije komitovanja

---

## Autor

Pavle Pavlović: Student Elektotehnike i računarstva: Univerzitet u Beogradu, Elektrotehnički fakultet

