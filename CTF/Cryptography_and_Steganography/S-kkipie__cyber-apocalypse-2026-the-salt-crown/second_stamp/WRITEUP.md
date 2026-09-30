# Second Stamp: HackTheBox (Blockchain / Sui Move)

> "…one disputed mark has passed every inspection. A strange pattern beneath its
> fresh groove does not match the current design… some claims are being judged by
> entirely different rules."

**Flag:** `HTB{w1th_gr34t_upgr4d34b1l1ty_c0m3s_gr34t_cr0ss-v3rs10n_r1sk_688e84033cdf2d439a53cb852fe810f0}`

**Resuelto** con `solve/solve.mjs`. Clave de acceso: el fullnode expone la API
**gRPC `sui.rpc.v2` (h2c) en el puerto web**; el JSON-RPC está deshabilitado (ver §7).

---

## 1. Estructura del reto

Paquetes Move (Sui):

| Paquete | Rol |
|---------|-----|
| `claim_marks` | 3 monedas: `PALE_WAX` (WAX, 18 dec), `GOLD_FLECK` (GOLD, 6 dec), `CLAIM_MARK` (LP, 9 dec) |
| `old_counter::pool` | AMM "viejo" (bins). Reserva sembrada: 1e18 WAX / 2.5e9 GOLD |
| `travel_counter::pool` | AMM "de viajes" (sqrt-price/liquidity). Reserva: 14e18 WAX / 55e9 GOLD |
| `witness_oracle::oracle` | Oráculo de precio, `price_e6 = 2_500_000_000` |
| `sharehouse` **v1 / v2 / v3** | El vault, publicado 3 veces como *upgrades* del mismo paquete |
| `second_stamp::setup` | `DisputedMark` + condición de victoria `is_solved()` |

El servidor siembra: `old_counter` (1e18/2.5e9), `travel_counter` (14e18/55e9),
buffer del sharehouse (2e16/1e6) y da al jugador 1e15 WAX + 1e6 GOLD vía `claim()`.

## 2. Condición de victoria: `sources/setup.move::is_solved`

```
sender == player && claimed &&
  buffer_a,fee_a,old_a,travel_a  <= 25_000_000_000_000_000   (2.5e16)   // WAX
  buffer_b,fee_b,old_b,travel_b  <= 100_000_000              (1e8)      // GOLD
```

Es decir: **drenar** el buffer del sharehouse, las comisiones de protocolo y las
reservas de ambos AMM por debajo de esos límites, siendo el `player`, tras `claim()`.

## 3. La vulnerabilidad

### 3a. Confusión de versiones (el "different rules" del enunciado)

`sharehouse::versioned`:

```move
const SUPPORTED_VERSION: u64 = 3;              // (=1 en v1, =2 en v2)
public fun assert_supported(v: &Versioned) {
    assert!(v.version <= SUPPORTED_VERSION, EUnsupportedVersion);   // <=  , no ==
}
```

- El guard usa **`<=`** (cota superior), no `==`.
- El objeto `Versioned.version` se crea en `1` y **nunca se migra** (ningún módulo
  llama a `set_version`).
- v1/v2/v3 son *upgrades* del mismo paquete ⇒ comparten identidad de tipos y operan
  sobre los mismos objetos compartidos.

Resultado: con `version == 1`, **los tres paquetes de lógica pasan el guard**
(`1<=1`, `1<=2`, `1<=3`). El patrón correcto sería `assert!(version == SUPPORTED)` +
migración en cada upgrade, para dejar fuera la lógica vieja. Aquí la lógica vieja (v1)
sigue siendo invocable. *"A strange pattern beneath its fresh groove does not match
the current design."*

### 3b. LP infravalorado (reservas reales ≫ valor contabilizado)

El AUM (denominador para acuñar LP) se calcula con valores **contables** minúsculos:

- `old_counter`: la posición "vale" `principal + fee` ≈ 8.7e16 WAX (y bajo v1 colapsa
  a `(1e12, 1)` porque `quote_bin_from_price(2.5e9)=101 > upper_bin=100`).
- `travel_counter`: `amounts_from_liquidity(liquidity=1e6, …)` = **166 666 WAX + 1e6 GOLD**.

…mientras que las **reservas reales** de los pools son 1e18/2.5e9 y 14e18/55e9.
El retiro (`remove_liquidity_by_percent` / `remove_share`) paga `reserva_real * LP/total`.
⇒ cada LP se puede canjear por ~100-200× lo que costó acuñarlo.

Además, la **contabilidad v1 ignora por completo el `travel_counter`** (no existía en
v1) y colapsa la posición `old_counter`, minimizando el AUM ⇒ maximizando el LP
acuñado por depósito. *"a thin gold fleck links it to travel claims."*

## 4. El exploit

Un único PTB que mezcla paquetes (v1 para depositar, v3 para retirar):

```
claim()                                        // fondos de inicio + claimed=true
repetir 4 veces:
  v1::accounting::refresh_aum(...)             // AUM minúsculo (denominador bajo)
  lp = v1::accounting::deposit(house, wax, gold)  // acuña LP enorme
  r  = v3::withdraw::new_withdraw_cert(house, lp)  // perfil 3
  v3::withdraw::process_old_counter(r, oldPool)    // saca reserva old_counter
  v3::withdraw::withdraw_travel_counter(r, travelPool)  // saca reserva travel_counter
  v3::withdraw::collect_position_fees(r, oldPool, travelPool)
  v3::withdraw::collect_position_rewards(r, oldPool, travelPool)
  v3::withdraw::process_buffer(r)              // saca parte del buffer
  (wax, gold) = v3::withdraw::complete_withdraw(r)
transfer (wax, gold) -> player
```

Cada ciclo nuestra fracción de LP crece y las reservas caen geométricamente. Los
depósitos inflan el buffer, pero al converger `f→1` el buffer restante `(1-f)·(buffer+depósito)`
también queda por debajo del límite. Las comisiones de protocolo permanecen en 0
(`protocol_fee_bps = 0`).

## 5. Validación (simulación de aritmética entera exacta: `solve/sim.py`)

```
cycle 1: old=(9.29e17,2.32e9) tr=(1.31e19,5.15e10) buf=(2.84e16,2.38e7) -> faltan varios
cycle 2: old=(1.42e16,3.55e7) tr=(2.00e17,7.86e8)  buf=(1.52e16,5.68e7) -> falta travel
cycle 3: old=(1.44e13,35882)  tr=(2.02e14,795226)  buf=(1.50e16,5.73e7) -> *** OK ***
```

**3 ciclos** bastan; el script usa **4** por margen (4-6 ciclos verificados OK).

## 6. Ejecución

```
cd second_stamp/solve
npm install    # @mysten/sui @protobuf-ts/grpc-transport @grpc/grpc-js
node solve.mjs # /api/instance -> construye el PTB -> ejecuta por gRPC -> /api/instance/check
```

`solve.mjs`:
- deriva el keypair de `playerPrivateKey` (reproduce exactamente el `playerAddress`),
- pre-resuelve TODOS los inputs (initialSharedVersion de cada objeto compartido,
  moneda de gas, gas price) y **construye el PTB offline** (`tx.build()` sin cliente),
- firma y ejecuta vía `transactionExecutionService.executeTransaction`,
- hace `POST /api/instance/check` e imprime `🚩 FLAG:`.

## 7. Acceso al RPC: la parte no obvia (gRPC, no JSON-RPC)

El deployment reporta `rpcUrl = http://<IP>:<PUERTO_WEB>` (mismo puerto que la UI, y
además es **cosmético**: el servidor lo arma con el header `Host` de la petición). Ese
puerto, por Caddy, sirve solo: SPA estática (GET) + control-plane
(`/api/health`, `/api/instance[/start|stop|restart|check]`). **Todo `POST` JSON-RPC →
404 "Cannot POST /"** (curl, SDK `@mysten/sui`, headers sui-client, HTTP/1.0, fuzz de
~408 rutas, escaneo de los 65535 puertos del host). El JSON-RPC está **deshabilitado**.

La pista real: el puerto habla **HTTP/2 cleartext (h2c)**. Probando gRPC:

```
POST /sui.rpc.v2.LedgerService/GetServiceInfo   (content-type: application/grpc, h2c)
  -> HTTP/2 200, grpc-status: 0
```

⇒ el fullnode expone la **API gRPC `sui.rpc.v2`** en el mismo puerto. Detalles:
- Cliente: `SuiGrpcClient` de `@mysten/sui/grpc`, pero con transporte **gRPC crudo**
  (`@protobuf-ts/grpc-transport` + `@grpc/grpc-js`, `ChannelCredentials.createInsecure()`
  para h2c). El transporte gRPC-Web por defecto del SDK NO sirve aquí.
- El cliente gRPC **no resuelve transacciones** (`tx.build({client})` lanza
  "Transaction resolution is not supported with the GRPC client") ⇒ hay que
  pre-resolver todo y hacer `tx.build()` offline.
- Skew de proto: el `read_mask` por defecto del SDK usa rutas que este servidor
  rechaza (`invalid read_mask path: transaction.transaction` / `transaction.effects`).
  Solución: llamar al servicio crudo con `read_mask` mínimo (`transaction.digest`).

## 8. Ficheros

- `solve/solve.mjs`: exploit final (gRPC + PTB claim + 4 ciclos deposit-v1/withdraw-v3)
- `solve/sim.py`: simulación de la aritmética que valida el drenaje
- `solve/scan.py`, `solve/find_rpc.py`, `solve/pfuzz.py`: recon (mapeo de puertos/rutas)
