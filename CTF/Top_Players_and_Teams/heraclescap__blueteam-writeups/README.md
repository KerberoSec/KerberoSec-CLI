# Blue Team Writeups

Mes solutions aux challenges blue team : CyberDefenders ou HackTheBox Sherlocks.

Focus : DFIR, Threat Intelligence, Malware Analysis, Network Forensics, Endpoint Detection.

## Index des writeups

| Challenge | Plateforme | Difficulté | Catégorie | Date |
|---|---|---|---|---|
| [BRabbit](https://cyberdefenders.org/blueteam-ctf-challenges/brabbit) | CyberDefenders | Medium | Threat Intel | 2026-05-31 |
| [KrakenKeylogger](https://cyberdefenders.org/blueteam-ctf-challenges/krakenkeylogger) | CyberDefenders | Medium | Endpoint Forensics | 2026-06-01 |
| [BlueSky Ransomware](https://cyberdefenders.org/blueteam-ctf-challenges/bluesky-ransomware) | CyberDefenders | Medium | Network Forensics | 2026-06-02 |
| [GetPDF](https://cyberdefenders.org/blueteam-ctf-challenges/getpdf) | CyberDefenders | Medium | Malware Analysis | 2026-06-03 |
| [Silent Breach](https://cyberdefenders.org/blueteam-ctf-challenges/silent-breach) | CyberDefenders | Medium | Endpoint Forensics | 2026-06-03 |
| [Bumblebee](https://app.hackthebox.com/sherlocks/bumblebee) | HackTheBox | Easy | DFIR | 2026-06-04 |
| [Pikaptcha](https://app.hackthebox.com/sherlocks/Pikaptcha) | HackTheBox | Easy | DFIR | 2026-06-04 |
| [Holmes 2025 2 : The Watchman's Residue](https://app.hackthebox.com/sherlocks/TheWatchmansResidue) | HackTheBox | Medium | SOC | 2026-06-07 |

## Structure du repo

```
.
├── cyberdefenders/         # CyberDefenders labs
│   ├── BRabbit/
│   ├── KrakenKeylogger/
│   ├── BlueSky/
│   ├── GetPDF/
│   └── SilentBreach/
└── hackthebox-sherlocks/   # HTB Sherlocks
    ├── Bumblebee/
    ├── Pikaptcha/
    └── WatchmansResidue/
```

Chaque writeup vit dans son propre dossier (`<plateforme>/<nom-challenge>/`) avec un `README.md` et un sous-dossier `images/` pour les captures.

## À propos

SOC analyst en alternance. J'aime la cybersécurité défensive dans ce qu'elle a de plus concret : comprendre ce qui s'est passé, comment, dans quel ordre.
Ces writeups documentent ma méthodo et mes erreurs. Pas de vulgarisation, pas de tutorial, juste ce que j'ai fait, pourquoi ça a marché ou pas, et ce que je retiens.
