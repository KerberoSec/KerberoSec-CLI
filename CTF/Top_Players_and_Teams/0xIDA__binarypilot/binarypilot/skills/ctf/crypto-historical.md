---
name: crypto-historical
description: "CTF historical cipher attacks. Lorenz SZ40/42 (Tunny) delta attack with known plaintext, ITA2/Baudot encoding, book cipher brute force. Triggers: 'lorenz cipher', 'tunny', 'ita2', 'baudot', 'book cipher', 'historical cipher', 'ww2 cipher', 'lorenz attack', 'wheel cipher', 'chi psi motor'."
---

# CTF Crypto: Historical Ciphers

Lorenz SZ40/42 (Tunny), ITA2/Baudot, book cipher.

---

## Phase 1: Lorenz SZ40/42 (Tunny) Attack

```python
# Lorenz machine: 12 wheels encrypting 5-bit ITA2/Baudot characters
# Encryption: ciphertext[i] = plaintext[i] XOR chi[i] XOR psi[i]
#
# Wheel periods:
# χ (chi): 41, 31, 29, 26, 23: advance every step
# Ψ (psi): 43, 47, 51, 53, 59: advance only when μ37=1
# μ61: period 61: advances every step, controls μ37 stepping
# μ37: period 37: advances only when μ61=1, controls Ψ stepping

CHI_PERIODS = [41, 31, 29, 26, 23]
PSI_PERIODS = [43, 47, 51, 53, 59]

def delta_attack(plaintext_bits_list, ciphertext_bits_list, num_bits):
    """Recover chi wheels via delta (Δ) method with known plaintext."""
    
    # Step 1: Get keystream from known plaintext
    key_stream = [pt ^ ct for pt, ct in zip(plaintext_bits_list, ciphertext_bits_list)]
    N = len(key_stream)
    
    # Step 2: Compute delta keystream
    # delta_k = delta_chi XOR delta_psi
    # Since psi steps only ~25% of the time, delta_k BIASES toward delta_chi
    delta_k = [key_stream[i] ^ key_stream[i+1] for i in range(N-1)]
    
    # Step 3: Recover delta_chi via majority vote at each wheel phase
    recovered_chi = []
    for bit in range(5):
        P = CHI_PERIODS[bit]
        delta_k_bit = [(delta_k[i] >> bit) & 1 for i in range(len(delta_k))]
        
        delta_chi = []
        for phase in range(P):
            vals = [delta_k_bit[i] for i in range(phase, len(delta_k_bit), P)]
            delta_chi.append(1 if sum(vals) > len(vals)/2 else 0)
        
        # Step 4: Integrate to get chi (2 candidates: start 0 or 1)
        chi_candidates = []
        for start in [0, 1]:
            chi = [start]
            for i in range(P-1):
                chi.append(chi[-1] ^ delta_chi[i])
            chi_candidates.append(chi)
        
        recovered_chi.append(chi_candidates)
    
    return recovered_chi

def brute_force_lorenz(recovered_chi, ciphertext_5bit, known_plaintext_prefix):
    """Brute force remaining wheel starting positions."""
    
    # Total candidates: 2^5 (chi starts) × 61×37 (μ positions) × 2^5 (psi starts)
    # = ~2.3M: trivially brutable
    
    from itertools import product
    
    for chi_starts in product([0, 1], repeat=5):
        # Build chi sequence using recovered wheels + start position
        # Decrypt ciphertext
        # Check if decrypted prefix matches known plaintext
        pass
```

---

## Phase 2: ITA2/Baudot Encoding

```python
# Standard ITA2 (5-bit character encoding used in Lorenz challenges):

ITA2_CODE = {
    'A': 0b00011, 'B': 0b10011, 'C': 0b01110, 'D': 0b10010,
    'E': 0b10000, 'F': 0b10110, 'G': 0b01011, 'H': 0b00101,
    'I': 0b01100, 'J': 0b11010, 'K': 0b11110, 'L': 0b01001,
    'M': 0b00111, 'N': 0b00110, 'O': 0b00011, 'P': 0b01101,
    'Q': 0b11101, 'R': 0b01010, 'S': 0b10100, 'T': 0b00001,
    'U': 0b11100, 'V': 0b01111, 'W': 0b11001, 'X': 0b10111,
    'Y': 0b10101, 'Z': 0b10001,
    ' ': 0b00100, '\n': 0b00010, '\r': 0b01000,
    # Special: LTRS=0b11111, FIGS=0b11011
}

ITA2_DECODE = {v: k for k, v in ITA2_CODE.items()}

def baudot_decode(bits_5):
    """Decode 5-bit ITA2 code to character."""
    code = int(''.join(map(str, bits_5)), 2)
    return ITA2_DECODE.get(code, f'[{code:05b}]')

def text_to_baudot(text):
    """Convert text to 5-bit ITA2 codes."""
    return [ITA2_CODE[c] for c in text.upper() if c in ITA2_CODE]

# XOR operation on 5-bit ITA2 characters:
def xor_5bit(a, b):
    return a ^ b
```

---

## Phase 3: Book Cipher Brute Force

```python
# Pattern: password = positions in book text, encoded as "steps forward"
# Given: cipher_distances (list of integer steps), reference book text
# Attack: brute force starting position, filter by valid charset

def crack_book_cipher(cipher_distances, book_text, valid_chars=None):
    """Brute force book cipher starting position."""
    if valid_chars is None:
        import string
        valid_chars = set(string.printable)
    
    candidates = []
    n = len(book_text)
    
    for start_key in range(n):
        pos = start_key
        password = []
        valid = True
        
        for dist in cipher_distances:
            pos = (pos + dist) % n
            ch = book_text[pos]
            if ch not in valid_chars:
                valid = False
                break
            password.append(ch)
        
        if valid:
            candidates.append((start_key, ''.join(password)))
    
    return candidates  # Typically 3-4 candidates out of ~56k positions

# Usage:
with open('reference_book.txt') as f:
    book = f.read()

# Cipher distances from challenge:
distances = [45, 23, 12, 67, 89, ...]  # provided by challenge

candidates = crack_book_cipher(distances, book)
for start, password in candidates:
    print(f"Start {start}: {password}")
```

---

## Phase 4: Vigenere with Known Plaintext

```python
# Known plaintext → recover key directly

def recover_vigenere_key(ciphertext, known_plaintext):
    """Recover Vigenere key from ciphertext + known plaintext pair."""
    key = []
    for ct, pt in zip(ciphertext.upper(), known_plaintext.upper()):
        if ct.isalpha() and pt.isalpha():
            key_char = chr((ord(ct) - ord(pt)) % 26 + ord('A'))
            key.append(key_char)
    
    # Find period via GCD or Kasiski on key (should be repeating):
    from math import gcd
    key_str = ''.join(key)
    
    # If key repeats, find the period:
    for period in range(1, len(key_str)//2 + 1):
        if all(key_str[i] == key_str[i % period] for i in range(len(key_str))):
            print(f"Key length {period}: {key_str[:period]}")
            return key_str[:period]
    
    return key_str

# Decrypt with known key:
def vigenere_decrypt(ciphertext, key):
    result = []
    key = key.upper()
    ki = 0
    for c in ciphertext.upper():
        if c.isalpha():
            result.append(chr((ord(c) - ord(key[ki % len(key)])) % 26 + ord('A')))
            ki += 1
        else:
            result.append(c)
    return ''.join(result)
```

---

## Phase 5: Enigma

```bash
# Enigma: if rotors/settings unknown, use bombe attack
# Tool: enigma simulator for known settings

pip install py-enigma --break-system-packages

python3 << 'EOF'
from enigma.machine import EnigmaMachine

# Configure with known settings:
machine = EnigmaMachine.from_key_sheet(
    rotors='I II III',        # rotor types
    reflector='B',             # reflector
    ring_settings=[1, 1, 1],  # ring settings
    plugboard_settings='AV BS CG DL FU HZ IN KM OW RX'  # plugboard
)

machine.set_display('AAA')  # starting position
plaintext = machine.process_text('ENIGMAISAWONDERFULCRYPTO')
print(plaintext)
EOF

# Unknown settings: use CribDrag or online bombe
# https://www.cryptomuseum.com/crypto/enigma/
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `decrypted.txt`: decrypted text
- `key.txt`: recovered key
- `flag.txt`: extracted flag

## Next Phase

→ `ctf-crypto-classic` for Vigenere/XOR techniques
→ `ctf-crypto-modern` for AES/padding oracle
