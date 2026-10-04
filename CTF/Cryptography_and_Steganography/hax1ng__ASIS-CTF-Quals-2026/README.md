# ASIS CTF Quals 2026: Writeups

Solutions, exploits, and writeups for challenges we solved during **ASIS CTF Quals 2026**.

- **Event:** ASIS CTF Quals 2026
- **Dates:** Sat, 29 Aug 2026 10:00 EDT: Sun, 30 Aug 2026 10:00 EDT (24h)
- **Author:** trefor
- **Challenges solved:** 28 across 6 categories

Each challenge lives in `<category>/<challenge>/` with a self-contained `README.md`
writeup plus the final solve scripts, exploits, and essential challenge artifacts.
Large provided binaries and captures are omitted for size; where that matters, the
writeup says so. Live infrastructure hosts, IPs, session tokens, and cookies have
been redacted throughout.

## Solved Challenges

### Crypto
| Challenge | Writeup | Flag |
|---|---|---|
| Hackel | [writeup](crypto/hackel/README.md) | `ASIS{sEm1d!r3c7_gr0uP_pr3S3nt4T10n____k3y___r3C0verY_4TtacK!!}` |
| Headache | [writeup](crypto/headache/README.md) | `ASIS{c0uPleD_n0nL1n3Ar_Dynam!c5_R3c0vEry_v1A_p0l3s_&_l34st_squ4r3s!!}` |
| Pancake | [writeup](crypto/pancake/README.md) | `ASIS{paNc4kE_v3_Lo5t_!t5_n4mE_8Ut___n0T___iTs_89uG!}` |
| Sultan | [writeup](crypto/sultan/README.md) | `ASIS{cORrup7_qu0ruM_rEu5e_!n_l4sT_ASIS_CTF!!}` |
| Less is More | [writeup](crypto/less-is-more/README.md) | `ASIS{iZ_1tEr4t10n_5k1p_m4ke5_n0_1nn0c3nT_r3sPonse!!!?}` |

### Hardware
| Challenge | Writeup | Flag |
|---|---|---|
| Grey Line | [writeup](hardware/grey-line/README.md) | `ASIS{gr3yl1n3_d0ppl3r}` |
| OutOfPhase | [writeup](hardware/out-of-phase/README.md) | `ASIS{R0t4t3dC4rri3rs_m1uAF0HBNhEJ4YJAUDQPhCNe2uk8vtY8mYVYg}` |
| Silent Carrier | [writeup](hardware/silent-carrier/README.md) | `ASIS{N0_K3Y_N0_V01C3}` |

### Misc
| Challenge | Writeup | Flag |
|---|---|---|
| Mic Check | [writeup](misc/mic-check/README.md) | `ASIS{f4r3w3ll_cl4ss1c_h3ll0_unc3rt41n_3r4!}` |

### Pwn
| Challenge | Writeup | Flag |
|---|---|---|
| QFilter | [writeup](pwn/qfilter/README.md) | `ASIS{m337_7h3_br4nd_n3w_QJS_4ll0c470r_334811b53075}` |
| Arena Snapshots | [writeup](pwn/arena-snapshots/README.md) | `ASIS{SN4PSH07_SL33P_R0LB4CK_R3P347_b027d27dc0834f9f}` |
| Dead Letter | [writeup](pwn/dead-letter/README.md) | `ASIS{5bde7fad6ec7676208a5d225f4230997ef81f0af}` |
| Signal Race | [writeup](pwn/signal-race/README.md) | `ASIS{8d88aebc6d193672f1e3a2ddced7bc58b2769d1f}` |
| Revenant Buddy | [writeup](pwn/revenant-buddy/README.md) | `ASIS{8bf2fd2a3f7eecec5f5fab1861e51c579975ba45}` |

### Reversing
| Challenge | Writeup | Flag |
|---|---|---|
| ASIS Arch | [writeup](rev/asis-arch/README.md) | `ASIS{M1ddL3_3nd14n_N1bbL35_M4k3_Q3MU_D122y!}` |
| Atarude | [writeup](rev/atarude/README.md) | `ASIS{_iZ_c0p1eD_m4sk5_m4Ke_3Ven_Spl!c3s_vAn1sh!!?}` |
| Beyond the Fourth Wall | [writeup](rev/beyond-the-fourth-wall/README.md) | `ASIS{ioccc_g1v3s_c00l_1d34s}` |
| Collector | [writeup](rev/collector/README.md) | `ASIS{e6a680925dfd79e36}` |
| LeakMeAk | [writeup](rev/leak-me-ak/README.md) | `ASIS{haaducrcplmekhylrozcxyxzuizs}` |
| Lesh | [writeup](rev/lesh/README.md) | `ASIS{BorrowM3y0urEyess_!!!!}` |
| Mousa | [writeup](rev/mousa/README.md) | `ASIS{tr!An9ulat3D_m1tM______b1gG3r_N0nLin3aR_spac3S!!!?}` |
| NEON RE:GENESIS | [writeup](rev/neon/README.md) | `ASIS{3v3ryth1ng_th4t_h4s_4_b3g1nn1ng_h4s_4n_3nd}` |

### Web
| Challenge | Writeup | Flag |
|---|---|---|
| 2048 | [writeup](web/2048/README.md) | `ASIS{t0McAT_was_Th3_KEY}` |
| Another Baby Web | [writeup](web/another-baby-web/README.md) | `ASIS{Baby_w3b_cha!!3nGe_$$$}` |
| Interdimensional Ledger | [writeup](web/interdimensional-ledger/README.md) | `ASIS{N0w_Th4t_Wa$nT_HaRd!}` |
| Profile | [writeup](web/profile/README.md) | `ASIS{as!S_1n_T3lC0_fr0MN_oW}` |
| Proxy Dough | [writeup](web/proxy-dough/README.md) | `ASIS{802ab2a8f0f435759ad6d1dfe8999de0}` |
| The Lottery Race | [writeup](web/the-lottery-race/README.md) | `ASIS{h4shId5_!5_n0T_5aF3!!!!!}` |

## Notable Solves

- **NEON RE:GENESIS** *(rev)*: a 14 MB AArch64 self-extracting game hiding its flag behind a
  custom cartridge VM, a 7-room puzzle, and three nested AES-256-GCM layers. Inverting two
  64-bit ARX hashes backwards from the target recovers the exact replay sequence without brute force.
- **Profile** *(web)*: a "QR code" that turns out to be a full GSMA RSP / SGP.22 eSIM
  provisioning server; the intended solve extracts a test eUICC identity hidden in HTML comments
  and assembles the flag from phonebook contacts across profile slots.
- **2048** *(web)*: Tomcat Tribes fail-open cluster deserialization (CVE-2026-34486) turned into RCE.
- **Silent Carrier** *(hardware)*: DMR / AMBE voice recovery from an RF capture, with the flag
  hidden in Morse inside the decoded audio.

## Repository Layout

```
<category>/<challenge>/
├── README.md        # the writeup
├── solve.py         # final solve / exploit (name varies)
└── ...              # essential source, artifacts, helper tools
```

## Disclaimer

All material here targets intentionally vulnerable challenges built for ASIS CTF Quals 2026 and is
published for educational purposes. Infrastructure details have been redacted.
