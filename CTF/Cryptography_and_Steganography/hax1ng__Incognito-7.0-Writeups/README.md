<div align="center">

```
██╗███╗   ██╗ ██████╗ ██████╗  ██████╗ ███╗   ██╗██╗████████╗ ██████╗      ███████╗ ██████╗
██║████╗  ██║██╔════╝██╔═══██╗██╔════╝ ████╗  ██║██║╚══██╔══╝██╔═══██╗     ╚════██║██╔═══██╗
██║██╔██╗ ██║██║     ██║   ██║██║  ███╗██╔██╗ ██║██║   ██║   ██║   ██║         ██╔╝██║   ██║
██║██║╚██╗██║██║     ██║   ██║██║   ██║██║╚██╗██║██║   ██║   ██║   ██║        ██╔╝ ██║   ██║
██║██║ ╚████║╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║██║   ██║   ╚██████╔╝        ██║  ╚██████╔╝
╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═╝   ╚═╝    ╚═════╝        ╚═╝   ╚═════╝
```

# Incognito 7.0: CTF Writeups

**Organized by IIIT Lucknow · April 2026**

![Challenges Solved](https://img.shields.io/badge/Challenges%20Solved-13-brightgreen?style=for-the-badge)
![Categories](https://img.shields.io/badge/Categories-6-blue?style=for-the-badge)
![CTF](https://img.shields.io/badge/CTF-Incognito%207.0-purple?style=for-the-badge)

</div>

---

## Overview

This repo contains writeups for every challenge we solved at **Incognito 7.0**, the annual CTF hosted by IIIT Lucknow. Each writeup covers the full solve path: recon, the vulnerability or trick, the exploit, and key takeaways. Solve scripts are included where applicable so you can reproduce the solution yourself.

Flag format: `IIITL{...}`

---

## Solved Challenges

### Cryptography

| Challenge | Difficulty | Flag | Writeup |
|-----------|-----------|------|---------|
| Look Out | Medium | `IIITL{this_was_annoying_lol_79823979735}` | [writeup](crypto/Look_Out/writeup.md) |

---

### Forensics

| Challenge | Difficulty | Flag | Writeup |
|-----------|-----------|------|---------|
| Dead OS | 400 pts | `IIITL{53r10u5ly!!_U_R3v1v3d_1t}` | [writeup](forensics/Dead_OS/writeup.md) |
| El Camino del Elegido | Medium | `iiitl{1h3re_i5_4lways_4_p41h_w4i1ing_t0_b3_d1scov3red}` | [writeup](forensics/El_Camino_del_Elegido/writeup.md) |
| 7 8 8.1 10 11 | Medium | `IIITL{4nd_Y0u_Th0ught_W1nd0w5_W@5_N0_Fun}` | [writeup](forensics/Seven_Eight_81_10_11/writeup.md) |
| The Silent Handshake | Medium | `IIITL{f0r3n51c5_4nd_n37w0rk1n6_4r3_fun}` | [writeup](forensics/The_Silent_Handshake/writeup.md) |

---

### Miscellaneous

| Challenge | Difficulty | Flag | Writeup |
|-----------|-----------|------|---------|
| 300 | Easy | `IIITL{k1nda_ea5y_1t_w4s_br0_6767}` | [writeup](misc/300/writeup.md) |
| Entropy | Medium | `IIITL{K4l31d05c0p3_M4z3_M4573r_9921_n0_3y35_2535abf3befa}` | [writeup](misc/Entropy/writeup.md) |
| Grawlix | Medium | `IIITL{C4lv1nb4ll_57r34m_0v3r104d_8762_n0_5l33p_4c1eb8edac59}` | [writeup](misc/Grawlix/writeup.md) |
| Hodgepodge | Medium | `iiitl{d39end3nc3_15_n0t_4lway5_64d_4nd_p13as3_c0m3_back}` | [writeup](misc/Hodgepodge/writeup.md) |
| Never Gonna Give You The Flag | Easy | `IIITL{r1ck_45t13y_15_l3g3nd}` | [writeup](misc/Never_Gonna_Give_You_The_Flag/writeup.md) |
| Rosetta Gauntlet | Hard | `IIITL{N0_M0R3_S3CR3T5!!!}` | [writeup](misc/Rosetta_Gauntlet/writeup.md) |
| Thunder-Blaze | Medium | `IIITL{C_15_41w4y5_f4573r_7h4n_py7h0n_ec0175769fed}` | [writeup](misc/Thunder_Blaze/writeup.md) |

---

### OSINT

| Challenge | Difficulty | Flag | Writeup |
|-----------|-----------|------|---------|
| Astley Offset | Easy | `IIITL{d1dnt_r1ckr0113d_y0u_h4rD}` | [writeup](osint/Astley_Offset/writeup.md) |
| Musk-e-teers | 300 pts | `IIITL{N0T_G0NN4_H4T3_051NT?}` | [writeup](osint/Musk_e_teers/writeup.md) |

---

### Pwn

| Challenge | Difficulty | Flag | Writeup |
|-----------|-----------|------|---------|
| The Asymptote | Hard | `IIITL{4cc355_ch3ck_p4553d_bu7_f1l3_5w4pp3d_110411185393}` | [writeup](pwn/The_Asymptote/writeup.md) |

---

### Reversing

| Challenge | Difficulty | Flag | Writeup |
|-----------|-----------|------|---------|
| Scheduler | Hard | `IIITL{pr10r1ty_b005t_4ct1v4t3d_52194357123987345}` | [writeup](rev/Scheduler/writeup.md) |

---

## Repository Structure

```
.
├── crypto/
│   └── Look_Out/           writeup.md · solve.py
├── forensics/
│   ├── Dead_OS/             writeup.md · solve.py
│   ├── El_Camino_del_Elegido/  writeup.md
│   ├── Seven_Eight_81_10_11/   writeup.md
│   └── The_Silent_Handshake/   writeup.md · solve.py
├── misc/
│   ├── 300/                 writeup.md
│   ├── Entropy/             writeup.md · solve.py
│   ├── Grawlix/             writeup.md · solve.py
│   ├── Hodgepodge/          writeup.md · solve.py
│   ├── Never_Gonna_Give_You_The_Flag/  writeup.md
│   ├── Rosetta_Gauntlet/    writeup.md · solve.py
│   └── Thunder_Blaze/       writeup.md · solve.py
├── osint/
│   ├── Astley_Offset/       writeup.md
│   └── Musk_e_teers/        writeup.md
├── pwn/
│   └── The_Asymptote/       writeup.md
└── rev/
    └── Scheduler/           writeup.md
```

---

<div align="center">

*Writeups authored during Incognito 7.0 · April 2026*

</div>
