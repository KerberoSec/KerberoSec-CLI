Below is a clear, shareable writeup explaining how Hatagawa II was solved (analysis, math, practical steps, solver logic with Z3, verification and mitigation). It’s written so you can paste it into a blog / GitHub README / CTF writeup.

Challenge summary (one-liner)
Hatagawa II encrypts the same 16-byte message across many runs by XORing fixed 64-bit halves with successive outputs of a 64-bit Linear Congruential Generator (LCG). Because the OTP state is reused deterministically and the left/right halves are reused as unknown constant masks, we can collect multiple ciphertexts and solve the LCG + two unknown masks using an SMT solver (Z3). From the model we reconstruct the plaintext (shown as a 16-byte hex value inside BHFlagY{...}).

What the challenge does (behavior / source highlights)
Important details from the provided source:

LCG parameters:
modulus MOD = 2**64: 1 (the code masks with & MOD).
multiplier a is chosen so that a % 8 == 5.
increment c is chosen odd (c % 2 == 1).
The Kawa.Get() returns the new x as 8 big-endian bytes.
Hata.Encrypt(msg, FFMT):
Strip() removes the formatting around the message (so encryption is done on the hex payload only).
It builds an OTP by concatenating entropy.Get() calls until length is satisfied, and XORs the message with the OTP.
Each Encrypt() invocation consumes 3 LCG outputs in Hatagawa II (this is visible from how the solver indexes states: the menu call consumes 3 states and uses two states inside the encryption).
The server prints BHFlagY{<32 hex chars>}; each capture exposes a 16-byte ciphertext as two 8-byte words.
So each sample yields two 64-bit words derived as:

W1_r = S_{3r+1} XOR M1
W2_r = S_{3r+2} XOR M2
M1 and M2 are the 8-byte halves (unknown constants) of the message in raw bytes.

Why this is solvable
The LCG is deterministic (S_{k+1} = a * S_k + c (mod 2^64)), so many captures share an underlying linear recurrence.
Each capture leaks S_{3r+1} XOR M1 and S_{3r+2} XOR M2. The unknowns are:
a, c (LCG params),
S0 (initial state seed),
M1, M2 (unknown message halves).
These unknowns are constrained by the observed XORed outputs. This is a small bit-vec system over 64-bit words: perfectly suited for an SMT solver (Z3).
Additional constraints from the generator (a % 8 == 5, c % 2 == 1) drastically reduce the solution space.
With ≥4 samples (ideally 8-12), Z3 easily finds a model satisfying all constraints; the recovered M1||M2 is the 16-byte plaintext (presented as a 32-hex string).
High-level solving approach
Collect samples: repeatedly send the Stay request to the service and save the last printed BHFlagY{...} hex payload. Each payload is a 16-byte ciphertext (hex).
Parse each hex payload into two 8-byte words: W1 and W2.
Form constraints in Z3:
Create 64-bit bitvectors for a, c, S0, M1, M2.
Build state chain S_0, S_1, ..., S_{3*n+2} with S_{i+1} = a*S_i + c (bitvec arithmetic wraps mod 2^64 automatically).
For each sample r, assert W1_r == S_{3r+1} XOR M1 and W2_r == S_{3r+2} XOR M2.
Assert a & 7 == 5 and c & 1 == 1.
Ask Z3 to solve. If satisfiable, extract values for M1 and M2.
Verify by regenerating LCG states using recovered a, c, S0 and checking observed W1/W2.
Format and print the flag as BHFlagY{<hex>}.
Why we model XORed halves instead of attempting algebraic inversion
Because M1 and M2 are unknown constants used across every capture, XOR is linear in GF(2) but the LCG recurrence is arithmetic modulo 2^64. Using an SMT solver lets us mix bitvector arithmetic constraints and bitwise operators directly and search the combined space efficiently, avoiding ad-hoc modular root-lifting or blind brute force.

Practical solver (what you were given)
You were given a robust solver that:

collects ciphertexts (get_ciphertexts),
splits each 16-byte ciphertext into two 64-bit integers,
builds an SMT model in Z3 with unknowns a, c, S0, M1, M2,
solves and verifies,
prints the recovered M1||M2 in both lower/upper hex inside BHFlagY{...} and optionally ASCII if printable.
Key function: solve_with_z3(observations): it declares BitVec("a", 64) etc., creates the chain S with S.append(a*S[i] + c) for 3*n+2 steps, adds mask constraints and the XOR equalities, then calls sol.check().

How to reproduce locally / run the provided solver
Requirements
python3 -m venv venv
source venv/bin/activate
pip install z3-solver
(If z3-solver fails on your platform, install Z3 from the Z3 website and the python bindings.)

Run the solver against the remote challenge
python3 hatagawa2_solver.py --host 34.252.33.37 --port 31183 --samples 10
--samples controls how many ciphertext captures to collect (default is 10).
The script will print progress, recovered parameters and the final plaintext hex as:
[FLAG lower]  BHFlagY{<32 hex>}
[FLAG UPPER]  BHFlagY{<32 HEX>}
If --samples is too small, the solver may return UNSAT; increase samples.
Example output (format)
[*] Collecting 10 ciphertexts from 34.252.33.37:31183
[+] Got ciphertext 1: abcd... (hex)
...
[*] Solving constraints with Z3 ...
[+] Recovered LCG params:
    a  = 0x...
    c  = 0x...
    S0 = 0x...
[+] Recovered plaintext halves:
    M1 = 0x...
    M2 = 0x...
[FLAG lower]  BHFlagY{<lowercase hex>}
[FLAG UPPER]  BHFlagY{<UPPERCASE HEX>}
Why you need ≥4 samples
The solver builds S up to 3*n+2. With fewer than ~4 samples, the system has too many degrees of freedom (a, c, S0, M1, M2) and Z3 may return UNSAT or produce an ambiguous model. Practically 8-12 is reliable and fast on modern machines.

Verification
The provided code includes verify_solution() which regenerates the LCG sequence using the recovered (a, c, S0) and compares each S_{3r+1} ^ M1 and S_{3r+2} ^ M2 against observed words. If verification fails, you should collect more ciphertexts or retry (network jitter or parsing errors can drop a sample).

Security/mitigation notes
One-time-pad must be non-reusable and truly random. Using a small deterministic generator like an LCG to produce OTP bytes is insecure.
Do not reuse same message halves across encryptions; the challenge intentionally reused M1 and M2.
Use a CSPRNG or authenticated encryption (AEAD) instead of raw XOR.
Avoid predictable formatting or leaking known plaintext at fixed positions.
Short technical appendix (Z3 model highlights)
BitVecs: Use 64-bit bitvectors for all internal variables.
State recurrence: S[i+1] = (a * S[i] + c): in Z3 a * S[i] + c auto-wraps to 64 bits.
XOR observation: BitVecVal(W1,64) == S[idx1] ^ M1.
Residue constraints: sol.add((a & 0x7) == 5) and sol.add((c & 1) == 1) as required.
Model extraction: model().eval(a).as_long() yields numeric parameter values.
Final notes / copyable writeup summary
Problem category: PRNG / OTP / Crypto
Tools used: Z3 SMT solver, Python socket, re
Why it works: reuse of LCG outputs + constant plaintext halves + known constraints on a and c.
Recommended reproducible command:
pip install z3-solver
python3 hatagawa2_solver.py --samples 10
SCRIPT SOLVE 
#!/usr/bin/env python3
# Hatagawa II: robust remote solver
# Requires: pip install z3-solver

import socket
import re
import time
import sys
import argparse
from typing import List, Tuple
from z3 import BitVec, BitVecVal, Solver, sat, Z3Exception

DEFAULT_HOST = "34.252.33.37"
DEFAULT_PORT = 31183

# Default collection size; 8-12 works well
DEFAULT_SAMPLES = 10
SOCKET_TIMEOUT = 5.0

CIPH_RE = re.compile(rb"BHFlagY\{([0-9a-fA-F]{32})\}")

def recv_all_until(sock: socket.socket, must_contain: bytes, overall_timeout: float = 5.0) -> bytes:
    sock.settimeout(SOCKET_TIMEOUT)
    end_time = time.time() + overall_timeout
    buf = b""
    while time.time() < end_time:
        try:
            chunk = sock.recv(4096)
            if not chunk:
                break
            buf += chunk
            if must_contain in buf:
                return buf
        except socket.timeout:
            pass
    return buf

def get_ciphertexts(host: str, port: int, n: int) -> List[bytes]:
    cts: List[bytes] = []
    with socket.create_connection((host, port), timeout=SOCKET_TIMEOUT) as s:
        # Read banner/menu to the initial prompt
        _ = recv_all_until(s, b">", overall_timeout=6.0)

        while len(cts) < n:
            # Send 's' (Stay)
            s.sendall(b"s\n")
            data = recv_all_until(s, b"BHFlagY{", overall_timeout=4.0)
            # It may print menu + river art again; search for last BHFlagY{...}
            matches = list(CIPH_RE.finditer(data))
            if not matches:
                # Try to receive a bit more once
                data2 = recv_all_until(s, b"BHFlagY{", overall_timeout=2.5)
                data += data2
                matches = list(CIPH_RE.finditer(data))
            if matches:
                ct_hex = matches[-1].group(1)  # last occurrence
                try:
                    ct = bytes.fromhex(ct_hex.decode())
                except ValueError:
                    print("[!] Non-hex payload encountered; continuing ...")
                    continue
                if len(ct) == 16:
                    cts.append(ct)
                    print(f"[+] Got ciphertext {len(cts)}: {ct_hex.decode()}")
            else:
                print("[!] Failed to parse ciphertext, retrying this sample...")
                # Optionally send another newline to refresh prompt
                try:
                    s.sendall(b"\n")
                except Exception:
                    pass

        # Politely walk away
        try:
            s.sendall(b"w\n")
        except Exception:
            pass
    return cts

def split64_be(b16: bytes) -> Tuple[int, int]:
    assert len(b16) == 16
    return (int.from_bytes(b16[:8], "big"), int.from_bytes(b16[8:], "big"))

def solve_with_z3(observations: List[Tuple[int, int]]) -> Tuple[int, int, int, int, int]:
    """
    observations[r] = (W1_r, W2_r) where:
      W1_r = S_{3r+1} XOR M1
      W2_r = S_{3r+2} XOR M2
    LCG: S_{k+1} = (a * S_k + c) mod 2^64
    Constraints:
      a % 8 == 5; c % 2 == 1
    Unknowns: a, c, S0 (seed), M1, M2.
    """
    n = len(observations)
    if n < 4:
        raise ValueError("Need at least 4 samples for a quick solve; collect more.")

    bv = lambda x: BitVecVal(x, 64)

    a  = BitVec("a", 64)
    c  = BitVec("c", 64)
    S0 = BitVec("S0", 64)
    M1 = BitVec("M1", 64)
    M2 = BitVec("M2", 64)

    # Build the state chain S_0 .. S_{3n+2}
    # Each menu call consumes 3 states; encryption uses states (3r+1) and (3r+2).
    S = [S0]
    for i in range(3*n + 2):
        S.append(a * S[i] + c)  # bit-vectors wrap mod 2^64 automatically

    sol = Solver()

    # Multiplier and increment constraints from challenge
    sol.add((a & bv(0x7)) == bv(5))   # a ≡ 5 (mod 8)
    sol.add((c & bv(0x1)) == bv(1))   # c odd

    # Observation constraints: ciphertext words are XOR of state and plaintext halves
    for r, (W1, W2) in enumerate(observations):
        idx1 = 3*r + 1
        idx2 = 3*r + 2
        sol.add(BitVecVal(W1, 64) == (S[idx1] ^ M1))
        sol.add(BitVecVal(W2, 64) == (S[idx2] ^ M2))

    print("[*] Solving constraints with Z3 ...")
    if sol.check() != sat:
        raise RuntimeError("Z3: UNSAT: try collecting more samples or re-run.")

    m = sol.model()
    a_val  = m.eval(a).as_long()
    c_val  = m.eval(c).as_long()
    s0_val = m.eval(S0).as_long()
    m1_val = m.eval(M1).as_long()
    m2_val = m.eval(M2).as_long()

    return a_val, c_val, s0_val, m1_val, m2_val

def verify_solution(obs: List[Tuple[int,int]], a: int, c: int, s0: int, m1: int, m2: int) -> bool:
    MOD = (1 << 64): 1
    def nxt(x): return (a * x + c) & MOD
    # regenerate S_k and check all obs
    for r, (W1, W2) in enumerate(obs):
        # states per round: S_{3r+1}, S_{3r+2}, S_{3r+3}
        # compute S_{3r+1} from S0 iteratively
        # efficient: step forward cumulatively
        pass
    # Efficient regeneration:
    S = s0
    for r, (W1, W2) in enumerate(obs):
        S = nxt(S)             # S_{3r+1}
        W1_chk = S ^ m1
        S = nxt(S)             # S_{3r+2}
        W2_chk = S ^ m2
        S = nxt(S)             # S_{3r+3} (unused)
        if (W1_chk & ((1<<64)-1)) != W1 or (W2_chk & ((1<<64)-1)) != W2:
            return False
    return True

def main():
    ap = argparse.ArgumentParser(description="Hatagawa II remote solver (LCG + OTP reuse)")
    ap.add_argument("--host", default=DEFAULT_HOST)
    ap.add_argument("--port", type=int, default=DEFAULT_PORT)
    ap.add_argument("--samples", type=int, default=DEFAULT_SAMPLES, help="ciphertexts to collect (>=4)")
    ap.add_argument("--retries", type=int, default=3, help="auto-retries if UNSAT/verification fails")
    args = ap.parse_args()

    attempts = 0
    while attempts <= args.retries:
        attempts += 1
        try:
            print(f"[*] Collecting {args.samples} ciphertexts from {args.host}:{args.port} (attempt {attempts}/{args.retries+1})")
            cts = get_ciphertexts(args.host, args.port, max(4, args.samples))
            if len(cts) < 4:
                print("[!] Not enough ciphertexts; retrying ...")
                continue

            obs = [split64_be(ct) for ct in cts]

            a_val, c_val, s0_val, m1_val, m2_val = solve_with_z3(obs)

            print(f"[+] Recovered LCG params:")
            print(f"    a  = 0x{a_val:016x}  (a % 8 = {a_val & 7})")
            print(f"    c  = 0x{c_val:016x}  (c % 2 = {c_val & 1})")
            print(f"    S0 = 0x{s0_val:016x}")
            print(f"[+] Recovered plaintext halves (big-endian 64-bit):")
            print(f"    M1 = 0x{m1_val:016x}")
            print(f"    M2 = 0x{m2_val:016x}")

            if not verify_solution(obs, a_val, c_val, s0_val, m1_val, m2_val):
                print("[!] Verification against collected samples FAILED: will retry.\n")
                continue

            # Build the 16-byte plaintext and print the actual flag
            m_bytes = m1_val.to_bytes(8, "big") + m2_val.to_bytes(8, "big")
            m_hex = m_bytes.hex()
            print("\n[FLAG lower]  BHFlagY{" + m_hex + "}")
            print("[FLAG UPPER]  BHFlagY{" + m_hex.upper() + "}")

            # optional: also show ASCII if printable (rare for this chall)
            if all(32 <= b < 127 for b in m_bytes):
                try:
                    m_ascii = m_bytes.decode("ascii")
                    print("[FLAG ascii ]  BHFlagY{" + m_ascii + "}")
                except UnicodeDecodeError:
                    pass
            return  # success; exit script

        except (Z3Exception, RuntimeError, ValueError) as e:
            print(f"[!] Solve error: {e}\n")
            # loop for retry
        except (socket.timeout, OSError) as e:
            print(f"[!] Network error: {e}\n")
            # loop for retry

    print("[x] Exhausted retries without a verified solution. Try increasing --samples or rerun.")

if __name__ == "__main__":
    main()
Expected final flag format (example):
BHFlagY{0123456789abcdef0123456789abcdef}
