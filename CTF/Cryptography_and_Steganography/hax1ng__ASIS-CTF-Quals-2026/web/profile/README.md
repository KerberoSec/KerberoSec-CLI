# Profile

**Category:** Web  ·  **Difficulty:** Hard  ·  **Flag:** `ASIS{as!S_1n_T3lC0_fr0MN_oW}`

## Challenge Description

The endpoint serves a single HTML page showing an SVG QR code and the ASIS logo: nothing else visible. Prompt: *"Still got an old phone lurking in your rig?"*
Scanning the QR gives a **GSMA eSIM LPA activation code**:

```
LPA:1$dpp.REDACTED$
```

- `LPA:1`: Local Profile Assistant v1
- `dpp.REDACTED`: the SM-DP+ server (eSIM profile delivery, SGP.22 RSP)
- trailing `$`: empty `matchingId`

So the challenge is GSMA Remote SIM Provisioning (SGP.22 / ES9+). See `qr.png`
and `index.html`.

## Initial Analysis

Feeding the SM-DP+ garbage returns full Twisted Python tracebacks pointing at
`/opt/pysim/osmo-smdpp.py`: Osmocom pySim's demo SM-DP+ server, which is open
source. It exposes the three ES9+ download steps under `/gsma/rsp2/es9plus/`:
`initiateAuthentication`, `authenticateClient`, `getBoundProfilePackage`.

The RSP trust model requires the eUICC cert chain
(`CERT.EUICC → CERT.EUM → CI`) to root to a CI the server trusts. Probing the
`serverCertificate` reveals a **custom private CI**:

```
CI PKID: f4a93f8ca68c25e1210297a178c12703e0683d59
CI name: "rprofile Test CI"   (NIST P-256)
```

Not any public GSMA root. This is where several dead ends live:

- **Official SGP.26 test certs** (`sgp26v3.zip`) → rejected (error `8.8.4`).
- **Spoofing the AKI** to point at the real CI PKID (`gen_chain.py`) → rejected;
  the server verifies the actual signature chain, not just the AKI field.
- **osmo-smdpp hardcoded BSP keys** (`\x00*16`, `\x11*16`, `\x22*16`) exist, but
  you must pass authentication first to reach the download step.

## Vulnerability / Core Concept

**The valid identity was hidden in the HTML source the whole time.** The page
contains three `<!-- // test-euicc : BASE64 -->` comments (plus many decoys).
One decodes to a full test eUICC identity:

```json
{"eid":"89000000000000000000000000000042",
 "key_pem":"-----BEGIN PRIVATE KEY-----...",
 "cert_euicc_der_b64":"...","cert_eum_der_b64":"...","cert_ci_der_b64":"..."}
```

i.e. the EID, the eUICC private EC key, and the full chain: all signed by the
server's custom `rprofile Test CI`. The "old phone lurking in your rig" *is* the
test eUICC. **Critical catch:** the PKI **rotates on a schedule**, so the
identity must be re-extracted immediately before use or auth fails with `8.8.4`.

Decoys engineered to burn time: two invalid `test-euicc` blobs, a fake EID, a
fake ICCID, a wrong CI hint, retired/foreign LPA endpoints, and a fake
`matchingId` `RPROFILE44O2` (letter O vs digit 0).

## Exploitation

The provided test identity certs (part of the puzzle, kept here) are in `certs/`
(`SK_EUICC_ECDSA_NIST.pem`, `CERT_EUICC/EUM/CI_ECDSA_NIST.der`).

**1. Extract the identity from the page** (`refresh()` in `dl_all.py`): fetch the
page, regex out each `test-euicc : BASE64`, and keep the one that JSON-decodes.

**2. Run the ES9+ handshake** for a `matchingId` (`get_frag()` in `dl_all.py`):

- `initiateAuthentication`: send `euiccChallenge` + `euiccInfo1`, get
  `serverSigned1` + `transactionId`.
- `authenticateClient`: build and ECDSA-sign `EuiccSigned1` (transaction id,
  server challenge, `matchingId`, deviceInfo), send with the eUICC + EUM certs.
- `getBoundProfilePackage`: generate an ephemeral EC key, sign `EUICCSigned2`
  with its one-time public key; server returns the `boundProfilePackage`.

**3. Decrypt + parse** with pySim's `BoundProfilePackage.decode()` → a SAIP 2.3
`UPP`. Walk the filesystem to `EF.ADN` (phonebook, path `5F3A/4F67`) and read
the first 32-byte record's contact name.

**4. Enumerate matchingIds** (`scan.py`): probe `RPROFILE0000..0063`, treating
error `8.2.6` as "not found". `RPROFILE0000..0006` exist.

**5. Download all profiles and assemble** (`dl_all.py`, refresh right before the
burst because certs rotate). The first phonebook contact per profile:

| matchingId | First contact |
|---|---|
| RPROFILE0000 | `test contact` (decoy) |
| RPROFILE0001 | `ASIS{` |
| RPROFILE0002 | `as!S_` |
| RPROFILE0003 | `1n_T3` |
| RPROFILE0004 | `lC0_f` |
| RPROFILE0005 | `r0MN_` |
| RPROFILE0006 | `oW}` |

Concatenating profiles 1-6 gives the flag.

```
$ python dl_all.py
...
ASSEMBLED(1-6): ASIS{as!S_1n_T3lC0_fr0MN_oW}
```

## Flag

`ASIS{as!S_1n_T3lC0_fr0MN_oW}`

## Key Takeaways

- A "look at the source" move dressed up in an eSIM/GSMA RSP domain: the whole
  valid eUICC identity was sitting in HTML comments.
- Rotating test PKI adds real timing pressure: refresh credentials right before
  every use.
- Splitting the flag across 7 profiles forces working auth per download; a single
  captured session can't be replayed.
- Tools: `pySim` (`pySim.esim.*` for SGP.22 ASN.1), `cryptography` (EC/ECDH/cert
  parsing), `requests`.
