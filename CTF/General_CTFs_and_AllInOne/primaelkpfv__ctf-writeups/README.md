# 🏆 CTF Writeups: 80+ Challenges Résolus

[![Repo Badge](https://img.shields.io/badge/GitHub-CTF%20Writeups-red?logo=github&style=flat-square)](https://github.com/primaelkpfv/ctf-writeups)
[![Challenges](https://img.shields.io/badge/Challenges-80%2B-brightgreen?style=flat-square)](.)
[![CryptoHack](https://img.shields.io/badge/CryptoHack-Top%205%25-gold?style=flat-square)](https://cryptohack.org)
[![CTF ESAIP](https://img.shields.io/badge/CTF%20ESAIP%202025-🥉%20Top%203-orange?style=flat-square)](.)

> Ma collection complète de writeups CTF avec solutions détaillées, explications et code pour challenges de cryptographie, forensique, réseau et web.

---

## 🎯 Statistiques globales

<details open>
<summary><b>📊 Tracker de défis</b>: Vue d'ensemble complète</summary>

```
┌──────────────────────────────────────────────────────────┐
│         CTF CHALLENGES STATISTICS                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📈 TOTAL RÉSOLU: 80+ challenges (100% taux réussite)  │
│                                                          │
│  🏆 CLASSEMENTS                                         │
│  ├─ CryptoHack        : 45/45 ✅  (Top 5% mondial)    │
│  ├─ Root-Me           : 20/50 ⏳  (40% complet)       │
│  ├─ TryHackMe         : 10/30 ⏳  (33% complet)       │
│  ├─ HackTheBox        : 5/15  ⏳  (33% complet)       │
│  └─ CTF ESAIP 2025    : 🥉       (Top 3 forensique)  │
│                                                          │
│  💪 DOMAINES DE FORCE                                  │
│  ├─ Cryptographie avancée      : ⭐⭐⭐⭐⭐ Expert    │
│  ├─ Forensique mémoire         : ⭐⭐⭐⭐⭐ Expert    │
│  ├─ Analyse réseau             : ⭐⭐⭐⭐  Avancé    │
│  ├─ Reverse engineering         : ⭐⭐⭐   Confirmé   │
│  └─ Web exploitation           : ⭐⭐    Débutant   │
│                                                          │
│  🔬 CATÉGORIES                                          │
│  ├─ Cryptographie  : 35 challenges ✓                  │
│  ├─ Forensique     : 15 challenges ✓                  │
│  ├─ Réseau         : 18 challenges ✓                  │
│  ├─ Web            : 7 challenges  ✓                  │
│  ├─ Stéganographie : 5 challenges  ✓                  │
│  └─ Misc           : 5 challenges  ✓                  │
│                                                          │
│  📅 ÉVOLUTION                                           │
│  2023 Q1 : 10 challenges 🌱                           │
│  2023 Q4 : 30 challenges 📈                           │
│  2024 Q2 : 60 challenges 📊                           │
│  2025 Q1 : 80+ challenges 🚀 (traj. 150+ fin 2025)  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

</details>

---

## 🔐 Cryptographie: Top domaine

### CryptoHack: RSA & ECC Mastery

```
✅ RSA Starter (10 pts): Factorisation n triviale
✅ Modular Arithmetic (15 pts): Théorème Chinois Restes
✅ Padding Oracle (40 pts): CBC mode exploitation
✅ Diffie-Hellman (30 pts): Man-in-the-Middle attack
✅ Digital Signatures (25 pts): Forge DSA signature
✅ Lattice Cryptography (35 pts): LLL algorithm
✅ + 33 autres challenges...
```

**Technique phare** : Attaque padding oracle
```python
def padding_oracle_attack(ciphertext, iv, oracle):
    """
    Décrypter AES-CBC sans clé via analyse padding valide.
    - Pour chaque byte : 256 tentatives max
    - Manipulation IV provoque changement plaintext
    - Oracle révèle si padding valide → détermine byte
    """
    # Pseudo-code du concept
    for block_idx in range(len(ciphertext) // 16):
        for byte_pos in range(15, -1, -1):
            for guess in range(256):
                modified_iv = modify_byte(iv, byte_pos, guess)
                if oracle(modified_iv + ciphertext[:block_idx*16]):
                    plaintext[byte_pos] = guess XOR padding_byte
```

---

## 🔍 Forensique: Mémoire & disque

### CTF ESAIP 2025: Lost in Memory (🥉 Top 3)

```
Challenge : Image mémoire Windows contenant credentials exfiltrés

Résolution :
1. Identifier profil Volatility  ✓
2. Lister processus suspects     ✓ (stealer.exe PID 4892)
3. Dump processus malveillant    ✓
4. Extraire credentials via strings    ✓
5. Analyse réseau (connexions sortantes) ✓
6. IOC : Flag found in memory = {m3m0ry_f0r3ns1cs_m4st3r_2025}

Commandes clés :
- vol.py windows.pslist | grep -v system
- vol.py windows.dumpfiles --pid 4892
- strings dump_*.raw | grep -i password
- vol.py windows.netstat
```

---

## 🌐 Réseau & Traffic Analysis

### PCAP Mystery: DNS Tunneling

```
Challenge : Retrouver données exfiltrées via DNS

Technique découverte :
- Sous-domaines encodeent données en base64
- Champ subdomain exploité comme canal covert
- Exemple : aGVsbG8ud29ybGQ=.attacker.com
- Décode en "hello.world"

Résolution :
tshark -r pcap.capture -Y "dns.qry.type == 1" \
  -T fields -e dns.qry.name | \
  awk -F. "{print $1}" | base64 -d
```

---

## 📁 Structure du repo

```
ctf-writeups/
├── cryptography/
│   ├── cryptohack/
│   │   ├── rsa-challenges.md
│   │   ├── ecc-challenges.md
│   │   ├── padding-oracle.md
│   │   └── diffie-hellman.md
│   └── root-me/
│       └── crypto-writeups.md
├── forensics/
│   ├── volatility-memory-analysis.md
│   ├── autopsy-disk-analysis.md
│   ├── ctf-esaip-2025-writeup.md
│   └── pcap-reconstruction.md
├── network/
│   ├── dns-tunneling.md
│   ├── packet-crafting.md
│   └── protocol-analysis.md
├── web/
│   └── sql-injection-xss.md
├── scripts/
│   ├── crypto_toolkit.py
│   ├── volatility-automation.sh
│   └── packet-analyzer.py
└── README.md (vous êtes ici)
```

---

## 🎓 Comment apprendre ?

1. **Commencer par CryptoHack**: Concepts fondamentaux interactifs
2. **Puis Root-Me**: Challenges progressifs (douleur augmente!)
3. **TryHackMe**: Chemins guidés par domaine
4. **Enfin HackTheBox / CTF ESAIP**: Challenges réalistes

---

## 🔗 Ressources

- 🌐 [CryptoHack.org](https://cryptohack.org/)
- 🌐 [Root-Me.org](https://www.root-me.org/)
- 🌐 [TryHackMe.com](https://tryhackme.com/)
- 🌐 [HackTheBox.com](https://www.hackthebox.com/)
- 📚 [PicoCTF Primer](https://picoctf.org/)

---

<p align="center">
  <b>Made with 🏆 for CTF Competitors</b>
</p>
