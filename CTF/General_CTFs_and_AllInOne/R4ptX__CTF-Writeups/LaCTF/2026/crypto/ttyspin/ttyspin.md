# Ttyspin
We are given a tetris game that runs over SSH. The game has a save/load system protected by a MAC. Our goal is to load a winning board that is impossible to achieve by actually playing the game, and get the flag
### The MAC System
The game uses SHA-256 to create a checksum for save files:
```python
def make_checksum(username, save_code):
    assert len(SECRET) == 40
    return hashlib.sha256((SECRET + username + save_code).strip()).hexdigest()
```
This is a classic `hash(secret || message)` construction and it is vulnerable to LEA(Length Extension Attack).
When you export a game, the board state is turned into a string:
```
CurrentPiece|HoldPiece|NextBlocks|Queue|Board(200 chars)
```
- `CurrentPiece` - one letter (T, J, L, S, Z, O, I)
- `HoldPiece` - one letter or space (no hold)
- `NextBlocks` - 4 letters (next pieces in line)
- `Queue` - remaining pieces in the bag
- `Board` - 200 characters, space = empty, letter = block
### Username Limit
The server limits the username to 32 bytes in `game.py`:
```python
username = sys.stdin.buffer.readline()[:-1]
if len(username) > 32:
    print("Username too long!")
    exit()
```
This is the key constraint: our forged username(original data + SHA-256 padding) must fit in 32 bytes. That is why we need the save prefix to be as short as possible.
### The Winning Board
The game checks if the board matches a specific pattern. This board is impossible to create by playing tetris normally. If the board matches, the flag is printed.
```python
hashlib.sha256((SECRET + username + save_code).strip()).hexdigest()
```
The `.strip()` removes trailing whitespace. An empty board is 200 spaces, and `.strip()` removes all of them. This makes the hashed message very short: perfect for our attack.
### Length Extension Attack
SHA-256 uses the Merkle-Damgard construction. If we know `SHA256(secret || message)` and the length of `secret || message`, we can compute:
```
SHA256(secret || message || padding || extension)
```
without knowing the secret.
### Hashpumpy
There is a Python library called `hashpumpy` that does length extension attacks automatically:
```python
import hashpumpy
forged_hash, forged_msg = hashpumpy.hashpump(known_checksum, known_data, extension, secret_length)
```
However, `hashpumpy` only works with older Python versions (3.9 and below) and fails to build on modern systems. So I implemented the SHA-256 compression function and length extension manually using only the standard library(`struct`).
## The Attack Plan
**Why do we need an empty board?** The board is 200 characters. If there are pieces on the board,  the stripped save would be 200 bytes, and the username (stripped data + padding) would be 210+ bytes: way over the 32-byte limit.
With an empty board, `.strip()` removes all 200 spaces, leaving only the short prefix like `"L|O|IJLS|ZOT|"`(14 bytes). Then username = 14 + 10 bytes padding = 24 bytes $\leq$ 32. 
Getting an empty board requires `score > 0`. So we need to place pieces and then clear full lines to clean the board completely.
### Step 1. Get a valid save with empty board
Connect to the server with an empty username. Start a new game. We need score $>$ 0 to export and I didn't find anything more adequate than to actually play and try to clear the field :).
This [video](https://www.youtube.com/watch?v=JFaw4TlarNo) helped so much 
After getting the clear board we export it and get this:
```
Save (base64): THxPfElKTFN8Wk9UfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg
Checksum: ece6ab20ad0e926300331d11b11c1dfa08c5a4418998b0f6582897f4ba00170b
```
After `.strip()` the last part(board) is empty

### Step 2. Calculate the padding
SHA-256 padding for a message of length L:
- Add `\x80`
- Add zero bytes until position 56 (mod 64)
- Add message length in bits as 8-byte big-endian
Original hashed message: `SECRET(40) + "L|O|IJLS|ZOT|"(14)` = 54 bytes
```
Padding = \x80 + \x00 * 1 + \x00\x00\x00\x00\x00\x00\x01\xb0
```
Total padding: 10 bytes. Padded message: 64 bytes
### Step 3. Build the winning save
```python
winning_save = "T| |TJLS|Z|" + winning_board_string
```
### Step 4. Forge the hash
Using the known checksum as SHA-256 internal state, we continue hashing the winning save data:
```
forged_hash = sha256_extend(
    known_hash = "ece6ab20ad0e926300331d11b11c1dfa08c5a4418998b0f6582897f4ba00170b",
    original_length = 54,
    extension = winning_save_stripped
)
```
### Step 5. Build the data
For the import, we need:
```
SHA256((SECRET + username_new + save_new).strip()) == checksum
```
We set:
- `username_new` = `"L|O|IJLS|ZOT|"` + SHA-256 padding (14 + 10 = **24 bytes** ≤ 32)
- `save_new` = base64(winning_save_full)
- `checksum` = forged_hash
When the server computes the mac:
```
(SECRET + username_new + winning_save_full).strip()
= SECRET + "L|O|IJLS|ZOT|" + padding + winning_save_stripped = forged_hash
```
### Step 6. Send to server
The forged username contains raw bytes (`\x80`, `\x00`, etc) that can't be typed manually in a terminal. We use `paramiko` to send them over ssh.
## Exploit
```python
import struct
import base64

save_code_b64 = b"THxPfElKTFN8Wk9UfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg"
known_checksum = "ece6ab20ad0e926300331d11b11c1dfa08c5a4418998b0f6582897f4ba00170b"

# SHA-256 implementation for length extension
K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]

def rr(x, n):
    return ((x >> n) | (x << (32 - n))) & 0xFFFFFFFF

def sha256_compress(state, block):
    assert len(block) == 64
    w = list(struct.unpack('>16L', block))
    for i in range(16, 64):
        s0 = rr(w[i-15], 7) ^ rr(w[i-15], 18) ^ (w[i-15] >> 3)
        s1 = rr(w[i-2], 17) ^ rr(w[i-2], 19) ^ (w[i-2] >> 10)
        w.append((w[i-16] + s0 + w[i-7] + s1) & 0xFFFFFFFF)
    a, b, c, d, e, f, g, h = state
    for i in range(64):
        S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)
        ch = (e & f) ^ (~e & 0xFFFFFFFF & g)
        temp1 = (h + S1 + ch + K[i] + w[i]) & 0xFFFFFFFF
        S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)
        maj = (a & b) ^ (a & c) ^ (b & c)
        temp2 = (S0 + maj) & 0xFFFFFFFF
        h, g, f, e, d, c, b, a = g, f, e, (d + temp1) & 0xFFFFFFFF, c, b, a, (temp1 + temp2) & 0xFFFFFFFF
    return tuple((s + x) & 0xFFFFFFFF for s, x in zip(state, (a, b, c, d, e, f, g, h)))

def sha256_padding(msg_len):
    bit_len = msg_len * 8
    padding = b'\x80'
    padding += b'\x00' * ((55 - msg_len % 64) % 64)
    padding += struct.pack('>Q', bit_len)
    return padding

def sha256_extend(known_hash_hex, known_msg_len, extension):
    state = struct.unpack('>8L', bytes.fromhex(known_hash_hex))
    padded_len = known_msg_len + len(sha256_padding(known_msg_len))
    total_len = padded_len + len(extension)
    msg = extension + sha256_padding(total_len)
    for i in range(0, len(msg), 64):
        block = msg[i:i+64]
        if len(block) == 64:
            state = sha256_compress(state, block)
    return struct.pack('>8L', *state).hex()

# exploit
block_type_text = ["T", "J", "L", "S", "Z", "O", "I"]
winning_board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 6, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 7, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 7, 0, 0, 0, 0, 0],
    [0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
    [0, 0, 6, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    [5, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

board_str = ""
for row in winning_board:
    for tile in row:
        if tile == 0:
            board_str += " "
        else:
            board_str += block_type_text[tile - 1]

winning_save_raw = "T| |||" + board_str
winning_save_bytes = winning_save_raw.encode()
winning_save_stripped = winning_save_raw.rstrip().encode()

# Length Extension Attack
save_code_raw = base64.b64decode(save_code_b64).rstrip()

original_msg_len = 40 + len(save_code_raw)
original_padding = sha256_padding(original_msg_len)
forged_hash = sha256_extend(known_checksum, original_msg_len, winning_save_stripped)

# Send via ssh
import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("chall.lac.tf", port=32123, username="ttyspin", password="ttyspin")
channel = client.invoke_shell(term='xterm-256color', width=120, height=40)

def recv_all(ch, timeout=1):
    data = b""
    start = time.time()
    while time.time() - start < timeout:
        if ch.recv_ready():
            data += ch.recv(4096)
            start = time.time()
        time.sleep(0.1)
    return data

# Send username
recv_all(channel)
channel.sendall(save_code_raw + original_padding + b"\n")

# Send save code
recv_all(channel)
channel.sendall(base64.b64encode(winning_save_bytes) + b"\n")

# Send checksum
recv_all(channel)
channel.sendall(forged_hash.encode() + b"\n")

# Read flag
out = recv_all(channel, timeout=10)
print(out.decode(errors='ignore'))
channel.close()
client.close()
```
## Flag
`lactf{T3rM1n4L_g4mE5_R_a_Pa1N_2e075ab9ae6ae098}`
