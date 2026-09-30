# HackTheBox Challenges: Comprehensive Index

> Master index of all HackTheBox challenges organized by category with writeup links, difficulty ratings, and key techniques.

---

## Categories Overview

| Category | Count | Path | Key Skills |
|----------|-------|------|------------|
| [Web](#web-challenges) | 75+ | [`challenges/web/`](web/) | XSS, SQLi, SSTI, SSRF, Deserialization, JWT |
| [Crypto](#crypto-challenges) | 93+ | [`challenges/crypto/`](crypto/) | RSA, AES, ECC, Padding Oracle, Custom Ciphers |
| [Forensics](#forensics-challenges) | 33+ | [`challenges/forensics/`](forensics/) | Memory, Disk, Network, Log Analysis |
| [Reversing](#reversing-challenges) | 44+ | [`challenges/reversing/`](reversing/) | x86/x64, ARM, .NET, Java, Obfuscation |
| [Pwn](#pwn-challenges) | 61+ | [`challenges/pwn/`](pwn/) | Stack/Heap, ROP, Format String, Use-After-Free |
| [Mobile](#mobile-challenges) | 10+ | [`challenges/mobile/`](mobile/) | APK Reversing, Frida, Smali, Root Detection |
| [Hardware](#hardware-challenges) | 11+ | [`challenges/hardware/`](hardware/) | UART, SPI, I2C, Firmware, Signal Analysis |
| [OSINT](#osint-challenges) | 12+ | [`challenges/osint/`](osint/) | Geolocation, Social Media, Image Metadata |
| [Misc](#misc-challenges) | 35+ | [`challenges/misc/`](misc/) | Scripting, Logic, Encoding, Pyjail |
| [Stego](#steganography-challenges) | 12+ | [`challenges/stego/`](stego/) | LSB, Steghide, Audio, Image Analysis |
| [Blockchain](#blockchain-challenges) | 10+ | [`challenges/blockchain/`](blockchain/) | Solidity, Smart Contracts, DeFi |
| [AI/ML](#aiml-challenges) | 5+ | [`challenges/ai-ml/`](ai-ml/) | Adversarial ML, Model Exploitation, Prompt Injection |

---

## Web Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Trapped Source | Very Easy | Client-Side Source Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/trapped-source/) |
| 2 | Templated | Very Easy | Jinja2 SSTI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/templated/) |
| 3 | Flag Command | Very Easy | API Exploitation, Command Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/flag-command/) |
| 4 | looking glass | Easy | SSTI, Command Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/looking-glass/) |
| 5 | Gunship | Easy | Prototype Pollution, AST Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/gunship/) |
| 6 | Toxic | Easy | PHP Deserialization, Log Poisoning | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/toxic/) |
| 7 | sanitize | Easy | NoSQL Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/sanitize/) |
| 8 | baby auth | Easy | Authentication Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-auth/) |
| 9 | LoveTok | Easy | PHP Code Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/lovetok/) |
| 10 | TimeKORP | Easy | PHP Time Injection, Command Injection | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-web-challenge-timekorp-writeup-e03cc2f08d70) |
| 11 | KORP Terminal | Easy | SQL Injection, Hashcat | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/korp-terminal/) |
| 12 | Neonify | Easy | Ruby SSTI, Regex Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/neonify/) |
| 13 | Slippy | Easy | Python Tar Slip, Path Traversal | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/slippy/) |
| 14 | Full Stack Conf | Easy | Source Code Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/full-stack-conf/) |
| 15 | CurlAsAService | Easy | SSRF, curl Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/curlasaservice/) |
| 16 | Wild Goose Hunt | Easy | NoSQL Injection, Regex Extraction | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/wild-goose-hunt/) |
| 17 | E.Tree | Easy | XPath Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/e.tree/) |
| 18 | CandyVault | Easy | NoSQL Injection (MongoDB) | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/candyvault/) |
| 19 | SpookTastic | Easy | XSS, Bot Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/spooktastic/) |
| 20 | Saturn | Easy | Path Traversal | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/saturn/) |
| 21 | HTBank | Easy | Race Condition, Integer Overflow | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/htbank/) |
| 22 | Watersnake | Easy | Java Deserialization, SnakeYAML | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/watersnake/) |
| 23 | Lazy Ballot | Easy | SQL Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/lazy-ballot/) |
| 24 | emoji voting | Easy | SQL Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/emoji-voting/) |
| 25 | ProxyAsAService | Easy | SSRF, Proxy Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/proxyasaservice/) |
| 26 | baby interdimensional internet | Easy | Python Code Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-interdimensional-internet/) |
| 27 | baby ninja jinja | Easy | Jinja2 SSTI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-ninja-jinja/) |
| 28 | baby CachedView | Easy | SSRF | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-cachedview/) |
| 29 | baby website rick | Easy | Source Code Analysis, Cookies | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-website-rick/) |
| 30 | baby todo or not todo | Easy | IDOR, API Abuse | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-todo-or-not-todo/) |
| 31 | Intergalactic Post | Easy | SQL Injection (SQLite) | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/intergalactic-post/) |
| 32 | BlinkerFluids | Easy | HTML Injection, RCE via PDF | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/blinkerfluids/) |
| 33 | Juggling facts | Easy | PHP Type Juggling | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/juggling-facts/) |
| 34 | Spookifier | Easy | Jinja2/Mako SSTI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/spookifier/) |
| 35 | Red Island | Easy | SSRF via Image URL | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/red-island/) |
| 36 | Mutation Lab | Easy | CSS Injection, Session Forgery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/mutation-lab/) |
| 37 | Amidst Us | Easy | Python Pickle Deserialization | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/amidst-us/) |
| 38 | Diogenes' Rage | Easy | Race Condition, Coupon Abuse | [MadDevs](https://maddevs.io/writeups/hackthebox-diogenes-rage/) |
| 39 | Weather App | Easy | SSRF, SQL Injection | [s-3ntinel](https://s-3ntinel.github.io/hackthebox/challenges/web/weather_app/weather_app.html) |
| 40 | Insomnia | Medium | Authentication Bypass, Logic Flaw | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/insomnia/) |
| 41 | jscalc | Medium | JavaScript Sandbox Escape | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/jscalc/) |
| 42 | OnlyHacks | Medium | SQL Injection, IDOR | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/onlyhacks/) |
| 43 | Breaking Bank | Medium | JWT Exploitation, Race Condition | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/breaking-bank/) |
| 44 | wafwaf | Medium | WAF Bypass, SQL Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/wafwaf/) |
| 45 | GhostlyTemplates | Medium | Go Template Injection, SSTI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/ghostlytemplates/) |
| 46 | PumpkinSpice | Medium | SSTI, Python Template Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/pumpkinspice/) |
| 47 | Spellbound Servants | Medium | Deserialization, PHP Object Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/spellbound-servants/) |
| 48 | HauntMart | Medium | SSRF, Internal Service Access | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/hauntmart/) |
| 49 | 0xBOverchunked | Medium | HTTP Chunked Encoding, SQLi WAF Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/0xboverchunked/) |
| 50 | Percetron | Medium | ML Model Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/percetron/) |
| 51 | Testimonial | Medium | gRPC Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/testimonial/) |
| 52 | Horror Feeds | Medium | SQL Injection, XSS | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/horror-feeds/) |
| 53 | baby nginxatsu | Medium | Nginx Misconfiguration, LFI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-nginxatsu/) |
| 54 | Spiky Tamagotchi | Medium | SQL Injection, Session Hijack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/spiky-tamagotchi/) |
| 55 | Kryptos Support | Medium | XSS, Cookie Stealing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/kryptos-support/) |
| 56 | baby breaking grad | Medium | Prototype Pollution | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-breaking-grad/) |
| 57 | Orbital | Medium | SQL Injection, LFI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/orbital/) |
| 58 | Passman | Medium | GraphQL Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/passman/) |
| 59 | BatchCraft Potions | Medium | Batch Script Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/batchcraft-potions/) |
| 60 | baby WAFfles order | Medium | XXE Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-waffles-order/) |
| 61 | Cursed Secret Party | Medium | Stored XSS, CSP Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/cursed-secret-party/) |
| 62 | baby BoneChewerCon | Medium | SSTI, Sandbox Escape | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/baby-bonechewercon/) |
| 63 | RenderQuest | Medium | Go SSTI, Template Injection | [Medium: Tanish](https://medium.com/@tanish.saxena26/hackthebox-renderquest-cf6c493d7b83) |
| 64 | Labyrinth Linguist | Medium | Apache Velocity SSTI, CVE-2020-13936 | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-web-challenge-labyrinth-linguist-a67d5005abe0) |
| 65 | CDNio | Hard | CDN Bypass, Cache Poisoning | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/cdnio/) |
| 66 | NeoVault | Hard | Neo4j Injection, Cypher Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/neovault/) |
| 67 | PDFy | Hard | PDF Generation SSRF | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/pdfy/) |
| 68 | AbuseHumanDB | Hard | XSS Chain, Bot Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/abusehumandb/) |
| 69 | ExpressionalRebel | Hard | Regex ReDoS, Expression Injection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/expressionalrebel/) |
| 70 | TrapTrack | Hard | Gopher SSRF, Redis Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/traptrack/) |
| 71 | Spybug | Hard | API Key Leak, Stored XSS | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/spybug/) |
| 72 | Didactic Octo Paddles | Hard | JWT None Algorithm, SSTI | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/didactic-octo-paddles/) |
| 73 | The Magic Informer | Hard | SQL Injection, Prototype Pollution | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/the-magic-informer/) |
| 74 | Letter Dispair | Hard | XSS, SSRF Chain | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/letter-dispair/) |
| 75 | Userland City | Hard | Complex Multi-Stage Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/web/userland-city/) |

---

## Crypto Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Ancient Encodings | Very Easy | Base Encoding, Hex Encoding | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/ancient-encodings/) |
| 2 | Weak RSA | Very Easy | RSA Small Key, Factorization | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/weak-rsa/) |
| 3 | Android-in-the-middle | Very Easy | Diffie-Hellman MITM | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/android-in-the-middle/) |
| 4 | sekur julius | Easy | Caesar Cipher Variant | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/sekur-julius/) |
| 5 | Classic, yet complicated! | Easy | Classical Cipher, Substitution | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/classic-yet-complicated/) |
| 6 | Jenny From The Block | Easy | Hash Length Extension, Block Cipher | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/jenny-from-the-block/) |
| 7 | Down the Rabinhole | Easy | Rabin Cryptosystem | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/down-the-rabinhole/) |
| 8 | How The Columns Have Turned | Easy | Columnar Transposition | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/how-the-columns-have-turned/) |
| 9 | Dynastic | Easy | Custom Cipher, Python Scripting | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-crypto-challenge-dynastic-writeup-0e03ba6cd432) |
| 10 | The Three-Eyed Oracle | Easy | AES ECB Oracle Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/the-three-eyed-oracle/) |
| 11 | Space Pirates | Easy | Shamir's Secret Sharing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/space-pirates/) |
| 12 | One Step Closer | Easy | RSA Related Message Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/one-step-closer/) |
| 13 | Infinite Descent | Easy | RSA, Continued Fractions | [GitHub](https://github.com/tilznit/htb_crypto_Infinite_Descent) |
| 14 | Brainy's Cipher | Easy | Custom Cipher Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/brainys-cipher/) |
| 15 | Gonna-Lift-Em-All | Easy | Diffie-Hellman Key Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/gonna-lift-em-all/) |
| 16 | SPG | Easy | Secure Password Generator Weakness | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/spg/) |
| 17 | Symbols | Easy | Symbol Substitution Cipher | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/symbols/) |
| 18 | I'm gRoot | Easy | Merkle Tree, Hash Collision | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/im-groot/) |
| 19 | Iced Tea | Easy | TEA Cipher, Block Cipher | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/iced-tea/) |
| 20 | Perfect Synchronization | Easy | AES ECB, Frequency Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/perfect-synchronization/) |
| 21 | Flippin Bank | Medium | AES CBC Bit Flipping | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/flippin-bank/) |
| 22 | Initialization | Medium | AES Initialization Vector Leak | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/initialization/) |
| 23 | MSS | Medium | Secret Sharing Scheme Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/mss/) |
| 24 | Mayday Mayday | Medium | RSA CRT Fault Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/mayday-mayday/) |
| 25 | Roulette | Medium | PRNG Prediction | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/roulette/) |
| 26 | TurboCipher | Medium | Custom Block Cipher Weakness | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/turbocipher/) |
| 27 | CryptoConundrum | Medium | Multi-Stage Decryption | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/cryptoconundrum/) |
| 28 | BFD56 | Medium | Blowfish Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/bfd56/) |
| 29 | RLotto | Medium | PRNG Seed Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/rlotto/) |
| 30 | Zombie Rolled | Medium | XOR + Custom Cipher | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/zombie-rolled/) |
| 31 | Interception | Medium | MITM Key Exchange | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/interception/) |
| 32 | Vitrium Stash | Medium | Custom Encryption Scheme | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/vitrium-stash/) |
| 33 | Rookie Mistake | Medium | RSA Common Factor Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/rookie-mistake/) |
| 34 | Partial Tenacity | Medium | RSA Partial Key Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/partial-tenacity/) |
| 35 | Arranged | Medium | RSA Lattice Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/arranged/) |
| 36 | Tsayaki | Medium | AES CTR Nonce Reuse | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/tsayaki/) |
| 37 | Waiting List | Medium | Digital Signature Forgery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/waiting-list/) |
| 38 | Composition | Medium | Mathematical Composition | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/composition/) |
| 39 | Fibopadcci | Medium | Fibonacci Padding Oracle | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/fibopadcci/) |
| 40 | I know Mag1k | Medium | Magic Number Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/i-know-mag1k/) |
| 41 | Homomurphy's Law | Medium | Homomorphic Encryption Weakness | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/homomurphys-law/) |
| 42 | signup | Medium | Signature Forgery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/signup/) |
| 43 | Oracle Leaks | Medium | Padding Oracle Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/oracle-leaks/) |
| 44 | Lost Modulus | Medium | RSA Modulus Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/lost-modulus/) |
| 45 | Living with Elegance | Medium | Elliptic Curve Cryptography | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/living-with-elegance/) |
| 46 | Blessed | Medium | RSA Oracle Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/blessed/) |
| 47 | Quadratic Points | Medium | ECC Quadratic Residue | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/quadratic-points/) |
| 48 | Not that random | Medium | LCG/PRNG State Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/not-that-random/) |
| 49 | Bloom Bloom | Medium | Bloom Filter Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/bloom-bloom/) |
| 50 | Protein Cookies 2 | Medium | Cookie Crypto Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/protein-cookies-2/) |
| 51 | Secure Signing | Medium | DSA/ECDSA Nonce Reuse | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/secure-signing/) |
| 52 | Clutch | Medium | Lattice-Based Crypto Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/clutch/) |
| 53 | baby quick maffs | Medium | Simplified Math Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/quick-maffs/) |
| 54 | binary basis | Medium | Binary Number Theory | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/binary-basis/) |
| 55 | brevi moduli | Medium | Short RSA Modulus | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/brevi-moduli/) |
| 56 | alphascii clashing | Medium | ASCII Hash Collision | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/alphascii-clashing/) |
| 57 | sugar free candies | Medium | Weak Custom Cipher | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/sugar-free-candies/) |
| 58 | Hash the Filesystem | Medium | Filesystem Hash Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/hash-the-filesystem/) |
| 59 | Find Marher's Secret | Medium | Mathematical Secret Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/find-marhers-secret/) |
| 60 | Lost Modulus Again | Hard | RSA Advanced Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/lost-modulus-again/) |
| 61 | Digital Safety Annex | Hard | Digital Signature Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/digital-safety-annex/) |
| 62 | Traces | Hard | Side-Channel Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/traces/) |
| 63 | Twin Oracles | Hard | Dual Oracle Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/twin-oracles/) |
| 64 | Verilicious | Hard | Verification Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/verilicious/) |
| 65 | Copperbox | Hard | Coppersmith's Attack (RSA) | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/copperbox/) |
| 66 | Mind In The Clouds | Hard | Cloud Crypto Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/mind-in-the-clouds/) |
| 67 | secure source | Hard | Source Code Crypto Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/secure-source/) |
| 68 | read before you sign | Hard | Signature Scheme Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/read-before-you-sign/) |
| 69 | hybrid unifier | Hard | Hybrid Encryption Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/hybrid-unifier/) |
| 70 | Signing Factory | Hard | Signature Factory Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/signing-factory/) |
| 71 | Converging Visions | Hard | ECC Point Convergence | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/converging-visions/) |
| 72 | Biased Heritage | Hard | Biased Nonce Attack (HNP) | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/biased-heritage/) |
| 73 | Elliptic Labyrinth | Hard | ECC Invalid Curve Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/elliptic-labyrinth/) |
| 74 | Colliding Heritage | Hard | Hash Collision Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/colliding-heritage/) |
| 75 | Inside The Matrix | Hard | Matrix-Based Crypto | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/inside-the-matrix/) |
| 76 | Multipage Recyclings | Hard | AES Key Schedule Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/multipage-recyclings/) |
| 77 | TwoForOne | Hard | Signature Forgery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/twoforone/) |
| 78 | LunaCrypt | Hard | Custom Crypto Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/lunacrypt/) |
| 79 | 400curves | Hard | ECC Multi-Curve Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/400curves/) |
| 80 | RsaCtfTool | Hard | RSA Multi-Attack Automation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/rsactftool/) |
| 81 | Nuclear Sale | Hard | Nuclear-Themed Crypto | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/nuclear-sale/) |
| 82 | Optimus Prime | Hard | Large Prime Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/optimus-prime/) |
| 83 | AbraCryptabra | Hard | Multi-Layer Decryption | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/abracryptabra/) |
| 84 | quick maffs | Hard | Fast Math Crypto Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/quick-maffs/) |
| 85 | Ebola Virus | Hard | Virus-Themed Crypto | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/ebola-virus/) |
| 86 | ElElGamal | Hard | ElGamal Signature Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/elelgamal/) |
| 87 | Infinite Knapsack | Hard | Knapsack Problem Attack | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/infinite-knapsack/) |
| 88 | AESWCM | Hard | AES Weak Counter Mode | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/aeswcm/) |
| 89 | Bank-er-smith | Hard | Banking Crypto Flaw | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/bank-er-smith/) |
| 90 | AHS512 | Hard | Custom Hash Function | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/ahs512/) |
| 91 | Spooky RSA | Hard | Multi-Prime RSA | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/spooky-rsa/) |
| 92 | Fast Carmichael | Hard | Carmichael Number Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/fast-carmichael/) |
| 93 | BBGun06 | Hard | BB84 Quantum Crypto | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/crypto/bbgun06/) |

---

## Forensics Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Illumination | Very Easy | Git History Analysis, Token Recovery | [Medium: Nouf](https://enaljammaz.medium.com/hackthebox-forensics-challenge-illumination-walkthrough-f6b032b01211) |
| 2 | An unusual sighting | Very Easy | SSH/Bash Log Analysis | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-forensics-an-unusual-sighting-writeup-ba20a80a09db) |
| 3 | Urgent | Very Easy | Phishing Email Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/urgent/) |
| 4 | Alien Cradle | Very Easy | PowerShell Script Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/alien-cradle/) |
| 5 | Extraterrestrial Persistence | Very Easy | Cron Job / Persistence Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/extraterrestrial-persistence/) |
| 6 | Wrong Spooky Season | Easy | PCAP Analysis, Reverse Shell Detection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/wrong-spooky-season/) |
| 7 | Halloween Invitation | Easy | Macro Analysis, VBA Malware | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/halloween-invitation/) |
| 8 | POOF | Easy | Log Analysis, Incident Timeline | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/poof/) |
| 9 | Downgrade | Easy | Windows Event Log Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/downgrade/) |
| 10 | Fake News | Easy | Web Forensics, Source Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/fake-news/) |
| 11 | Lure | Easy | Malicious Document Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/lure/) |
| 12 | Chase | Easy | PCAP Analysis, Wireshark | [Medium: Josh](https://0xect0.medium.com/hackthebox-chase-forensics-challenge-writeup-eebf72d6051f) |
| 13 | Phreaky | Easy | PCAP Analysis, Data Extraction | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-forensics-phreaky-writeup-9fde5c245f75) |
| 14 | Export | Easy | Memory Forensics (.raw), Volatility | [Medium: Josh](https://0xect0.medium.com/hackthebox-export-forensics-challenge-writeup-1cbb6c0be4fd) |
| 15 | Insider | Easy | Linux Filesystem Forensics | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/insider/) |
| 16 | Free Services | Easy | Malicious Email Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/free-services/) |
| 17 | Packet Cyclone | Easy | PCAP + Sigma Rules | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/packet-cyclone/) |
| 18 | Automation | Easy | PowerShell Script Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/automation/) |
| 19 | Keep Tryin' | Easy | Email Forensics, MIME Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/keep-tryin/) |
| 20 | Perseverance | Easy | WMI Persistence Detection | [HTB Blog](https://www.hackthebox.com/blog/perseverance-biz-ctf-2022-forensics-writeup) |
| 21 | Reminiscent | Easy | Memory Forensics, Volatility | [DFIR Blog](https://www.thedigitalforensics.com/blog/hack-the-box-reminiscent) |
| 22 | MarketDump | Medium | Network Forensics, Data Leak | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/marketdump/) |
| 23 | Relic Maps | Medium | Malicious Macro, HTA Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/relic-maps/) |
| 24 | Event Horizon | Medium | Windows .evtx Analysis | [Medium: SecurityNoodle](https://securitynoodle.medium.com/hackthebox-event-horizon-forensics-challenge-writeup-b32839a3307d) |
| 25 | No Place To Hide | Medium | Network Traffic Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/no-place-to-hide/) |
| 26 | Logger | Medium | Keylogger Forensics | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/logger/) |
| 27 | Peel Back The Layers | Medium | Docker Image Forensics | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/peel-back-the-layers/) |
| 28 | Deadly Arthropod | Medium | C2 Traffic Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/deadly-arthropod/) |
| 29 | Artifact Of Dangerous Sighting | Medium | Windows Artifact Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/artifact-of-dangerous-sighting/) |
| 30 | Valhalloween | Hard | Complex Incident Forensics | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/valhalloween/) |
| 31 | Interstellar C2 | Hard | C2 Communication Decryption | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/interstellar-c2/) |
| 32 | Scripts and Formulas | Hard | Excel Macro Forensics | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/scripts-and-formulas/) |
| 33 | Red Miners | Hard | Cryptominer Forensics | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/forensics/red-miners/) |

---

## Reversing Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Baby RE | Very Easy | Basic x64 Disassembly | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/baby-re/) |
| 2 | WIDE | Very Easy | Wide String Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/wide/) |
| 3 | Find The Easy Pass | Very Easy | .NET Decompilation | [SecJuice](https://www.secjuice.com/htb-find-the-secret-flag-reversing-challenge/) |
| 4 | Impossible Password | Very Easy | String Comparison Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/impossible-password/) |
| 5 | Shattered Tablet | Very Easy | Basic Static Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/shattered-tablet/) |
| 6 | LootStash | Very Easy | Basic String Analysis | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-reversing-challenge-lootstash-93885622734e) |
| 7 | Rebuilding | Easy | Binary Reconstruction | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/rebuilding/) |
| 8 | Teleport | Easy | Binary Protocol Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/teleport/) |
| 9 | Snakecode | Easy | Python Bytecode Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/snakecode/) |
| 10 | You Cant C Me | Easy | C Binary Obfuscation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/you-cant-c-me/) |
| 11 | Baby Crypt | Easy | Basic Crypto Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/baby-crypt/) |
| 12 | Hunting License | Easy | License Key Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/hunting-license/) |
| 13 | Ouija | Easy | Ouija-Themed Binary | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/ouija/) |
| 14 | Secured Transfer | Easy | Protocol Reverse Engineering | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/secured-transfer/) |
| 15 | Ransom | Easy | Ransomware Key Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/ransom/) |
| 16 | Anti Flag | Easy | Anti-Debug Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/anti-flag/) |
| 17 | Potion Master | Easy | Game Logic Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/potion-master/) |
| 18 | Curse Breaker | Easy | Encryption Algorithm Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/curse-breaker/) |
| 19 | SpellBrewery | Easy | String Array Decoding | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/spellbrewery/) |
| 20 | Bypass | Easy | .NET Auth Bypass (dnSpy) | [Medium](https://medium.com/swlh/hack-the-boxdwriteup-rev-1-a94282cb0c63) |
| 21 | Exatlon | Easy | UPX Packed Binary | [Medium: bigkahuna](https://medium.com/@sturu/hackthebox-exatlon-reversing-challenge-writeup-a98243ed5c36) |
| 22 | Spooky License | Easy | Angr Symbolic Execution | [Medium: 0x00](https://nier0x00.medium.com/spooky-license-reversing-challenge-hackthebox-writeup-d0cd20459f29) |
| 23 | Up a Stream | Easy | Data Stream Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/up-a-stream/) |
| 24 | RiseFromTheDead | Easy | Zombie-Themed Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/risefromthedead/) |
| 25 | Snake | Easy | Python Game Reversing | [Medium: Tarun](https://medium.com/@Tarun.N/htb-snake-challenge-walk-through-for-noobs-2475ea7a38ab) |
| 26 | Hissss | Medium | Python Compiled Binary (.pyc) | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/hissss/) |
| 27 | Headache | Medium | Anti-Analysis Techniques | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/headache/) |
| 28 | The Vault | Medium | Multi-Layer Protection | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/the-vault/) |
| 29 | IRCware | Medium | IRC Bot Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/ircware/) |
| 30 | Eat the Cake! | Medium | Obfuscated Binary | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/eat-the-cake/) |
| 31 | Alien Saboteaur | Medium | Custom VM Bytecode | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/alien-saboteaur/) |
| 32 | ChromeMiner | Medium | Browser Extension Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/chromeminer/) |
| 33 | Sekure Decrypt | Medium | Decryption Routine Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/sekure-decrypt/) |
| 34 | RetoRetro | Medium | Retro Binary Analysis | [Medium: f0xtty](https://medium.com/@f0xtty/en-hackthebox-retoretro-reversing-challenge-writeup-9db06d6ace2e) |
| 35 | Encryption Bot | Medium | Bot Logic Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/encryption-bot/) |
| 36 | Tear or Dear | Medium | Conditional Logic Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/tear-or-dear/) |
| 37 | FlagCasino | Medium | PRNG Seed Recovery | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/flagcasino/) |
| 38 | Golfer: Part 1 | Medium | Code Golf Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/golfer---part-1/) |
| 39 | SpookyPass | Hard | Password Verification Bypass | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/spookypass/) |
| 40 | Graverobber | Hard | Complex Binary Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/graverobber/) |
| 41 | CryptOfTheUndead | Hard | Encryption Algorithm Reversing | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/cryptoftheundead/) |
| 42 | Hubbub | Hard | Complex Obfuscation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/hubbub/) |
| 43 | BinCrypt Breaker | Hard | Custom Crypto Binary | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/bincrypt-breaker/) |
| 44 | ReRop | Hard | ROP Chain Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/reversing/rerop/) |

---

## Pwn Challenges

Full list of 61 pwn challenges: see [pwn/README.md](pwn/README.md) or browse [7Rocky Pwn Index](https://7rocky.github.io/en/ctf/htb-challenges/pwn/).

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Getting Started | Very Easy | Stack Buffer Overflow Basics | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-pwn-challenge-getting-started-54acc706afa7) |
| 2 | Questionnaire | Very Easy | Binary Security Quiz | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/questionnaire/) |
| 3 | Space pirate: Entrypoint | Very Easy | Buffer Overflow, Basic ROP | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/space/) |
| 4 | Space pirate: Going Deeper | Very Easy | Stack Overflow, ROP | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/space/) |
| 5 | Vault-breaker | Very Easy | Basic Binary Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/vault-breaker/) |
| 6 | Reg | Easy | Buffer Overflow, ret2win | [Blackfell](https://blackfell.net/technical/labs/HTB-pwn-reg/) |
| 7 | Jeeves | Easy | Format String, ret2win | [JayBailey](https://jaybailey216.com/pwn-challenge-jeeves/) |
| 8 | Void | Easy | ret2libc, Stack Pivot | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-pwn-challenge-void-writeup-cee6bdb6c07d) |
| 9 | Ropme | Easy | Return-Oriented Programming | [Medium: Gabriel](https://medium.com/@gabriel.pirjolescu/pwn-hack-the-box-ropme-write-up-b40179cf5573) |
| 10 | Labyrinth | Easy | Stack Overflow, Maze Logic | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-pwn-challenge-labyrinth-1ee7c0305713) |
| 11-22 | Fleet Management, Blacksmith, HTB Console, Entity, Leet Test, Format, Bat Computer, Space pirate: Retribution, No Return, Spooky Time, Shooting star, Great Old Talisman | Easy | Various Stack/Format Exploits | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/great-old-talisman/) |
| 23-41 | Hellhound, Old Bridge, Trick or Deal, Space, Spellbook, Sacred Scrolls: Revenge, Optimistic, PwnShop, CRSid, Finale, Nightmare, Math Door, Control Room, FileStorage, Auth-or-out, echoland, Robot Factory, Bon-nie-appetit, knote | Medium | Heap/Format String/Advanced | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/auth-or-out/) |
| 42-60 | Zombiedote, Zombienator, Antidote, Dragon Army, Sound of Silence, Maze of Mist, Kernel Adventures: Part 1, Lesson, Nowhere to go, Oxidized ROP, Pixel Audio, Hunting, Regularity, Picture Magic, Sick ROP, Dead or Alive, Fake Snake, Ancient Interface | Hard | Heap/Kernel/Advanced ROP | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/ancient-interface/) |
| 61 | Dream Diary: Chapter 3 | Insane | tcache Poisoning, Heap Feng Shui | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/dream-diary-chapter-3/) |

---

## Mobile Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | APKey | Very Easy | APK Analysis, Smali Code, JADX | [Medium: 0xk3r0](https://medium.com/@0xk3r0/hackthebox-apkey-mobile-challenge-6e3cf5647c2d) |
| 2 | APKrypt | Easy | APK Decompilation, Key Recovery | [CSbyGB GitBook](https://csbygb.gitbook.io/pentips/writeups/htbtracks/htb-intro-to-android-exploitation-track) |
| 3 | Don't Overreact | Easy | React Native Reversing, Hardcoded Secrets | [CSbyGB GitBook](https://csbygb.gitbook.io/pentips/writeups/htbtracks/htb-intro-to-android-exploitation-track) |
| 4 | Cat | Easy | Android Backup (.ab) Analysis | [Medium: Danish](https://danishzia.medium.com/hack-the-box-cat-challenge-write-up-914e0877f68d) |
| 5 | SeeTheSharpFlag | Easy | Xamarin/.NET Mobile Reversing | [CSbyGB GitBook](https://csbygb.gitbook.io/pentips/writeups/htbtracks/htb-intro-to-android-exploitation-track) |
| 6 | SAW | Easy | Android Smali Patching | [Hackplayers](https://github.com/Hackplayers/hackthebox-writeups/blob/master/challenges/mobile/htb-mobile-saw-writeup.pdf) |
| 7 | Pinned | Medium | Certificate Pinning Bypass, Frida | [CSbyGB GitBook](https://csbygb.gitbook.io/pentips/writeups/htbtracks/htb-intro-to-android-exploitation-track) |
| 8 | Manager | Medium | Android Password Manager Vuln | [Medium: xProtagonist](https://medium.com/@xprotagonist_/manager-hackthebox-intro-to-android-exploitation-track-by-xprotagonist-7e1ac22fd79a) |
| 9 | Anchored | Medium | Android App Anchoring Bypass | [CSbyGB GitBook](https://csbygb.gitbook.io/pentips/writeups/htbtracks/htb-intro-to-android-exploitation-track) |
| 10 | Cryptohorrific | Medium | Mobile Crypto Exploitation | [Medium: Sanket](https://medium.com/@sanketkumkar77/cryptohorrific-hack-the-box-challenge-writeup-857caf1def0f) |

---

## Hardware Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Photon Lockdown | Very Easy | Firmware Extraction, Binwalk | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/photon-lockdown/) |
| 2 | HM74 | Very Easy | Hamming Error-Correcting Codes | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/hm74/) |
| 3 | Gawk | Easy | Logic Analyzer, SPI Protocol | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/gawk/) |
| 4 | Unique | Easy | UART Communication Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/unique/) |
| 5 | Walkie Hackie | Easy | Radio Frequency Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/walkie-hackie/) |
| 6 | Secure Digital | Easy | SD Card / SPI Protocol Decode | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/secure-digital/) |
| 7 | Mini Line | Medium | Line Protocol Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/mini-line/) |
| 8 | VHDLock | Medium | VHDL Hardware Description Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/hardware/vhdlock/) |
| 9 | Debugging Interface | Easy | UART Debugging, Serial Comms | [Medium: Justus](https://justus-njogu.medium.com/debugging-interface-challenge-hack-the-box-walk-through-e529c467d3da) |
| 10 | Debug | Easy | Hardware Debug Interface | [Medium: Rahul](https://medium.com/@rahulhoysala07/hack-the-box-hardware-challenge-debug-writeup-3889089897ef) |
| 11 | The Needle | Easy | Linux Firmware Analysis | [Motasem Notes](http://motasem-notes.net/hardware-hacking-p3-linux-firmware-analysis-hackthebox-the-needle/) |

---

## OSINT Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Easy Phish | Very Easy | DNS, SPF/DMARC Records | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/osint/easy-phish/) |
| 2 | Infiltration | Easy | LinkedIn, Instagram Recon | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/osint/infiltration/) |
| 3 | Missing in Action | Easy | LinkedIn, Twitter, Google Dorks | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/osint/missing-in-action/) |
| 4 | Money Flowz | Medium | Reddit, Ropsten Ethereum Chain | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/osint/money-flowz/) |
| 5 | Monstrosity | Medium | Twitter API, Geolocation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/osint/monstrosity/) |
| 6 | Various Easy OSINT | Easy | Multi-Source OSINT | [Medium: Vinayak](https://vinayakagrawal95.medium.com/easy-osint-challenges-hack-the-box-3bb3da3f186d) |
| 7 | Various Medium OSINT | Medium | Advanced OSINT Techniques | [Medium: Vinayak](https://vinayakagrawal95.medium.com/medium-osint-challenges-writeup-hack-the-box-a170fa2b4fa) |
| 8-14 | Cyber Apocalypse 2025 OSINT (7 challenges) | Various | Geolocation, Social Media, Public Records | [Medium: Carson](https://blog.carsonshaffer.me/hack-the-box-cyber-apocalypse-ctf-2025-osint-writeup-c5ab878b700c) |

---

## Misc Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Emdee five for life | Very Easy | MD5 Hashing, Python Scripting | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/emdee-five-for-life/) |
| 2 | The secret of a Queen | Very Easy | Mary Queen of Scots Cipher | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/the-secret-of-a-queen/) |
| 3 | Compressor | Easy | Compression/Archive Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/compressor/) |
| 4 | 0ld is g0ld | Easy | PDF Password Cracking | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/0ld-is-g0ld/) |
| 5 | fs0ciety | Easy | Mr. Robot Themed, File Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/fs0ciety/) |
| 6 | Da Vinci | Easy | Steganography + Logic | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/da-vinci/) |
| 7 | Hackerman | Easy | Strings, Basic Steg | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/hackerman/) |
| 8 | BitsNBytes | Easy | Binary Analysis, Image Comparison | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/bitsnbytes/) |
| 9 | Art | Easy | ASCII Art Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/art/) |
| 10 | Milkshake | Easy | Data Transformation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/milkshake/) |
| 11 | M0rsarchive | Easy | Morse Code, Nested Archives | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/m0rsarchive/) |
| 12 | Pusheen Loves Graphs | Easy | Graph Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/pusheen-loves-graphs/) |
| 13 | misDIRection | Easy | Directory Structure Analysis | [Medium: Nouf](https://enaljammaz.medium.com/hackthebox-misc-challenge-misdirection-walkthrough-4ec8b7c4cac5) |
| 14 | Chainsmoker | Easy | Chain Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/chainsmoker/) |
| 15 | Hidden Path | Easy | Node.js Source Code Analysis | [MadDevs](https://maddevs.io/writeups/hackthebox-hidden-path/) |
| 16 | Eternal Loop | Medium | Infinite Loop/Archive Puzzle | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/eternal-loop/) |
| 17 | ExploitedStream | Medium | Stream Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/exploitedstream/) |
| 18 | Tree of Danger | Medium | Tree Structure Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/tree-of-danger/) |
| 19 | Path of Survival | Medium | Pathfinding Algorithm | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/path-of-survival/) |
| 20 | Pickle Panic | Medium | Python Pickle Deserialization | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/pickle-panic/) |
| 21 | Query | Medium | Database Query Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/query/) |
| 22 | Type Exception | Medium | Type System Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/type-exception/) |
| 23 | Canvas | Medium | Canvas Drawing Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/canvas/) |
| 24 | Fentastic Moves | Medium | Chess/Game Logic | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/fentastic-moves/) |
| 25 | Locked Away | Medium | Lock Picking Logic | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/locked-away/) |
| 26 | Branching Tactics | Medium | Git Branch Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/branching-tactics/) |
| 27 | A Nightmare On Math Street | Medium | Math-Based Scripting | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/pwn/nightmare/) |
| 28 | SecretRezipe | Hard | Recipe-Themed Complex Logic | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/secretrezipe/) |
| 29 | Computational Recruiting | Hard | Algorithm Challenge | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/computational-recruiting/) |
| 30 | Man In The Middle | Hard | MITM Network Analysis | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/man-in-the-middle/) |
| 31 | Replacement | Hard | Data Replacement Logic | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/replacement/) |
| 32 | Deterministic | Hard | Deterministic Computation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/deterministic/) |
| 33 | Triangles | Hard | Geometric Math Challenge | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/triangles/) |
| 34 | Bashic Calculator | Hard | Bash Scripting Exploitation | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/bashic-calculator/) |
| 35 | Quantum Artifact | Hard | Quantum-Themed Challenge | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/misc/quantum-artifact/) |

---

## Steganography Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Forest | Easy | Image Steg, Steghide, Brightness | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 2 | Digital Cube | Easy | Image Analysis, Pixel Manipulation | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 3 | Retro | Easy | Retro Image Steg | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 4 | Pusheen Loves Graphs | Easy | Graph-Based Steganography | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 5 | Hackerman | Easy | Steghide, rockyou Wordlist | [Art0fHack](https://art0fhack.blogspot.com/2018/08/stego-hackerman-htb.html) |
| 6 | Widescreen | Easy | Steg Solver | [Hackplayers](https://github.com/Hackplayers/hackthebox-writeups/tree/master/challenges/stego) |
| 7 | Image Processing 101 | Easy | Basic Image Processing | [HTB Forum](https://forum.hackthebox.com/t/stego-image-processing-101/1940) |
| 8 | Unprintable | Medium | Non-Printable Characters | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 9 | Not Art | Medium | Art-Based Steganography | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 10 | BitsNBytes | Medium | Image Comparison, ImageMagick | [HTB Forum](https://forum.hackthebox.com/t/stego-challenge-bitsnbytes-write-up-by-alamot/1636) |
| 11 | Massacre | Hard | Complex Multi-Layer Steg | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |
| 12 | Senseless Behaviour | Hard | Behavioral Analysis Steg | [z00mik GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) |

---

## Blockchain Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Survival of the Fittest | Very Easy | Smart Contract Interaction, cast | [InfoSec Writeups](https://infosecwriteups.com/hackthebox-survival-of-the-fittest-blockchain-challenge-writeup-e7302c787d20) |
| 2 | Russian Roulette | Very Easy | Block Hash Manipulation | [Forbytten](https://forbytten.gitlab.io/blog/htb-cyber-apocalypse-writeups-2024/russian-roulette/) |
| 3 | Lucky Faucet | Easy | Integer Overflow, Solidity | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/blockchain/lucky-faucet/) |
| 4 | Funds Secured | Easy | Incorrect Parameter Verification | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/blockchain/funds-secured/) |
| 5 | Magic Vault | Easy | Private Storage Read, Block Mechanics | [Medium: 0x-professor](https://0x-professor.medium.com/magic-vault-hackthebox-blockchain-challenge-writeup-078f6c1ed87d) |
| 6 | Distract and Destroy | Easy | Smart Contract Logic Exploit | [GitHub: KanakSasak](https://github.com/KanakSasak/HTB-Blockchain) |
| 7 | Confidentiality | Medium | ERC-721, ECDSA Signature Malleability | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/blockchain/confidentiality/) |
| 8 | Honor Among Thieves | Medium | Multi-Contract Exploitation | [GitHub: KanakSasak](https://github.com/KanakSasak/HTB-Blockchain) |
| 9 | Art of Deception | Medium | Smart Contract Deception | [Medium: Nikhil](https://medium.com/@nikhilmemane09/htb-cyber-apocalypse-2023-owning-smart-contracts-art-of-deception-f3348897d5c5) |
| 10 | University CTF 2024 Blockchain | Various | Multiple Smart Contract Challenges | [Medium: Nafiz](https://medium.com/@muhammadnafiz2017/hack-the-box-university-ctf-2024-blockchain-challenges-writeup-1787e97f0fff) |

---

## AI/ML Challenges

| # | Challenge | Difficulty | Key Techniques | Writeup |
|---|-----------|-----------|----------------|---------|
| 1 | Sigma Technology | Easy | Adversarial Machine Learning | [7Rocky](https://7rocky.github.io/en/ctf/htb-challenges/ai---ml/sigma-technology/) |
| 2 | AI Space | Easy | Multidimensional Scaling, Data Analysis | [1337Sheets](https://www.1337sheets.com/p/hack-the-box-challenge-ai-space-ml-writeup) |
| 3 | Prometheon | Medium | Multi-Stage Prompt Injection, LLM Bypass | [Medium: Paragbhosale](https://medium.com/@paragbhosale9440/htb-prometheon-exploiting-alignment-boundaries-in-ai-via-prompt-injection-5a195e16a256) |
| 4 | External Affairs | Medium | AI Travel Screening Bypass, Prompt Injection | [hack-lab-256](https://hack-lab-256.com/en/ai-llm-prompt-injection/1680/) |
| 5 | FullHouse (Lab) | Medium | AI Bypass and Exploitation | [HTB Blog](https://www.hackthebox.com/blog/fullhouse-ai-lab) |

---

## Key Writeup Collections

| Source | URL | Coverage |
|--------|-----|----------|
| 7Rocky | [7rocky.github.io](https://7rocky.github.io/en/ctf/htb-challenges/) | 350+ challenges across all categories |
| Hackplayers | [GitHub](https://github.com/Hackplayers/hackthebox-writeups) | Web, Crypto, Forensics, Mobile, Stego, OSINT |
| Rishitsaiya | [GitHub](https://github.com/rishitsaiya/HackTheBox-Challenges) | Crypto, Web, OSINT, Forensics, Reversing |
| z00mik | [GitHub](https://github.com/z00mik/Stego-Challenges-HackTheBox-Write-Ups) | 8 Stego challenges |
| KanakSasak | [GitHub](https://github.com/KanakSasak/HTB-Blockchain) | Blockchain challenges |
| CSbyGB | [GitBook](https://csbygb.gitbook.io/pentips/writeups/htbtracks/htb-intro-to-android-exploitation-track) | Mobile/Android challenges |
| Esther7171 | [GitHub](https://github.com/Esther7171/HackTheBox-Writeups-Walkthroughs) | Multi-category writeups |
| 0xRick | [Blog](https://0xrick.github.io/categories/) | Multi-category writeups |
| zweilosec | [GitBook](https://zweilosec.gitbook.io/htb-writeups) | Machines and Challenges |

## Difficulty Distribution

- **Very Easy**: Great for absolute beginners, teaches fundamentals
- **Easy**: Requires basic understanding of the category
- **Medium**: Solid understanding and creative thinking needed
- **Hard**: Competition-level challenges with complex attack chains
- **Insane**: Expert-level, often requiring novel techniques
