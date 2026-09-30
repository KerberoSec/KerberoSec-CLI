# The Far Orchard: HackTheBox (Blockchain / ZK · halo2 + EVM)

> "…wear every approved face, claim all eight seals, and force the Orchard's
> judgment to collapse in public. Eight Far-Seals are about to be honored."

**Flag:** `HTB{d4m4s_f4r_s34ls_br0k3_b3n34th_g0ld_l34v3s_66389d4cfaf57f7f59d10f7b643bbcc6}`

**Resuelto** con `release/run.sh` (forja 8 pruebas ZK con `target/release/solve`, obtiene 8
firmas del validador vía `/api/verify`, y llama `honorSeal` 8 veces con `driver/honor.mjs`).

---

## 1. Estructura del reto

Híbrido **ZK (halo2, Rust) + EVM (Solidity/foundry)**:

| Componente | Rol |
|-----------|-----|
| `setup/src/FarOrchard.sol` | ERC-721. `honorSeal(sealId, nullifier, sig)` mintea un Far-Seal si `sig` es una firma EIP-712 del `validatorSigner` sobre `Honor(msg.sender, sealId, nullifier)`, con `nullifier` fresco. |
| `setup/src/Setup.sol` | `isSolved()` ⇔ los 8 seals honrados (`honoredCount==8 && honoredBitmap==0xff`). |
| `src/circuit.rs` | `FarOrchardCircuit` (halo2, curva Pallas): prueba de pertenencia Merkle de una clave + nullifier. |
| `src/verifier.rs` | verifica la prueba (k=13, IPA sobre Vesta). |
| `src/merkle.rs` | árbol Merkle sinsemilla (referencia off-circuit) + formato de serialización de la prueba. |
| servicio web (privado) | `/api/verify {proof, seal_id}` → verifica la prueba y devuelve un **recibo firmado** por el validador. |

**Flujo previsto:** demostrar en ZK que conoces la `sk` de la hoja `seal_id` del árbol
⇒ el validador firma `Honor(tu_wallet, seal_id, nullifier)` ⇒ llamas `honorSeal`.
Hay 8 hojas (8 claves secretas aleatorias) = 8 Far-Seals. **No** conocemos ninguna `sk`.

## 2. La vulnerabilidad: base variable sin anclar (`InsecureUnanchoredBase`)

El circuito (`src/circuit.rs`):

```rust
let g_d = NonIdentityPoint::new(ecc_chip, .., self.g_d)?;   // g_d = TESTIGO LIBRE
let sk_scalar = ScalarVar::from_base(ecc_chip, .., &sk_cell)?;
let (pk, _) = g_d.mul(.., sk_scalar)?;                       // pk = [sk]·g_d   (base VARIABLE)
let nullifier = nullifier_base.mul(.., sk_cell)?;           // nf = [sk]·NullifierK (= [sk]·G)
let nf_x = nullifier.extract_p();  // == public[1]
let leaf = pk.extract_p();         // hoja del árbol
// root(leaf, path, pos) == public[0] ;  leaf == public[2]
```

Dos fallos combinados:

1. **`g_d` es un testigo privado sin restringir.** En un esquema correcto (Orchard/Zcash)
   `pk = [sk]·G` con base FIJA, o `g_d` sería público. Aquí el probador elige `g_d`
   libremente. El chip ECC además se construye con
   `CircuitVersion::InsecureUnanchoredBase` ("base NOT anchored: vulnerable to forging").

2. **La hoja es `pk.x`**, y las x de las 8 hojas son **públicas** (`GET /api/info`).

Consecuencia: para cualquier hoja objetivo con x-coord `x_i` conocida, sin saber la `sk`:
- reconstruyo el punto `P_i = (x_i, √(x_i³+5))` (Pallas: `y²=x³+5`),
- elijo un escalar `s` cualquiera (de un `sk` pequeño en el campo base) y pongo
  **`g_d = [s⁻¹]·P_i`**,
- entonces `pk = [s]·g_d = P_i` ⇒ `leaf = P_i.x = x_i` → **pertenencia forjada**.
- El nullifier `= [s]·G` es libre; con `sk` distinto por seal → 8 nullifiers distintos
  (evita el `nullifierUsed` on-chain).

Detalle clave que hace consistente el cálculo off-circuit: **ambos** productos usan el
mismo `s`. La multiplicación de base variable usa
`ScalarVar::from_base = pallas::Scalar::from_repr(sk.to_repr())`, y como el campo escalar
de Pallas es mayor que el base, todo `sk` cabe; eso es exactamente lo que hace
`merkle::derive_nullifier`. *"some claims are being judged by entirely different rules."*

## 3. El exploit

`src/bin/solve.rs`: por cada seal `i` (0..7):

```
sk_i = i+2                          # pequeño, distinto, no nulo
s_i  = Scalar::from_repr(sk_i)
P_i  = punto con x = pk_x_i         # de /api/info
g_d  = [s_i⁻¹]·P_i                  # ⇒ pk = P_i, leaf = pk_x_i
nf_i = ([s_i]·G).x                  # nullifier (distinto por seal)
path = MerkleTree(8 hojas conocidas).path(i)
create_proof(circuit{sk_i, g_d, path, pos=i}, public=[root, nf_i, pk_x_i])
verify_proof(...)                   # auto-verificación local
```

Comprobación de cordura: reconstruyo el árbol con las 8 hojas de `/api/info` y **su raíz
coincide con `merkle_root`** del servidor (confirma orden/endianness/hash sinsemilla).

Luego, por cada seal: `POST /api/verify {proof, seal_id}` → recibo
`{claimant, nullifier, signature}` (firma EIP-712 del validador) → `honorSeal(seal_id,
nullifier, sig)` desde la wallet del jugador.

Resultado: `honoredCount=8`, `honoredBitmap=11111111`, `isSolved=true`.

## 4. Ejecución

```
cd release
cargo build --release --bin solve        # halo2 (una vez)
(cd driver && npm install)                # ethers
./run.sh                                  # launch → info → forja → verify → honorSeal → flag
```

El árbol Merkle y el `validatorSigner` están **fijos entre lanzamientos** (horneados en la
imagen); sólo cambian cadena/wallet/contratos. Las pruebas no dependen de la wallet
(el recibo firmado sí la ata), así que se pueden regenerar en segundos por instancia.

## 5. API del reto (storybook UI en `IP:PORT`)

- `POST /api/launch` → `RPC_URL (/rpc/<uuid>)`, `PRIVKEY`, `SETUP_CONTRACT_ADDR`, `WALLET_ADDR`, `uuid`.
- `GET /api/info` → `merkle_root`, `merkle_leaves[{index,pk_x,seal_id}]`, `orchard_address`, `validator_signer`.
- `POST /api/verify {proof, seal_id}` → recibo firmado. **`proof` va en hex SIN `0x`** (el
  backend hace `hex::decode` directo). Sesión **atada por cookie** (usar cookie jar).
- `POST /rpc/<uuid>` → JSON-RPC EVM. **No soporta batch** → ethers con `{ batchMaxCount: 1 }`.
- `GET /api/flag` → flag cuando `isSolved()`.

## 6. Ficheros

- `release/src/bin/solve.rs`: forjador de las 8 pruebas ZK (el exploit).
- `release/driver/honor.mjs`: envía `honorSeal` x8 (ethers) y comprueba `isSolved`.
- `release/run.sh`: orquestación end-to-end.
