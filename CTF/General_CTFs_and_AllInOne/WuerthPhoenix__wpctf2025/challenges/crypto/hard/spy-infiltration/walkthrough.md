# Spy infiltration (by @will_i_hack)

## Description

You are a spy who has successfully infiltrated a high-tech company. Your mission is to steal a
critical password used by the company's IoT devices to communicate with their central server. This
password is the key to unlocking their secure communication network.

After weeks of covert operations, you have finally gained access to the company's configuration
software. However, the password remains hidden, encrypted within the configuration data. The
software interface provides limited access, and the encryption mechanism is designed to keep
intruders at bay.

Your task is to analyze the configuration software, exploit its vulnerabilities, and exfiltrate the
hidden password. Use your cryptographic skills and ingenuity to uncover the secret.

Can you outsmart the system and retrieve the password without being detected? The fate of your
mission depends on it.

## The Bug

The configuration is encrypted with an AES block cipher in ECB mode. The ECB mode encrypts the data
in blocks of 16 bytes each, reusing the same key for each block. This means that identical plaintext
blocks will produce identical ciphertext blocks. This could be prevented by using a more secure
mode of operation, which uses a key schedule to derive different keys for each block. Since the
user controls part of the input, they can perform a byte-at-a-time ECB decryption attack to recover
the secret, by aligning the input and the remainig unknown bytes to the end of a block and then
brute-forcing just the last byte, one at a time.

## The exploit:

First we need to determine the block size. We can do this by sending increasing lengths of input
until we find two encrypted blocks that are the same. Since AES works on 16-byte blocks, we can
start with 32 bytes of input, which is the minimum required length to guarantee two identical
blocks. However it is likely that our controlled block is not exactly aligned to 16 bytes, so we
add one byte at a time until we find two identical blocks. With that we know the padding we need to
add to align our controlled input to the end of a block.

To compare the blocks, we will encode the raw bytes as hex, then we can split off 32 characters
(16 bytes) at a time and compare the blocks. This also allows for easy printing and debugging.

```python
def get_encrypted_message(user_input: str) -> str:
    url = "http://localhost:5000"
    payload = {
        "comment": user_input,
        "baud_rate": "9600",
        "timezone": "UTC",
        "mode": "default",
    }
    resp = requests.post(f"{url}/config", json=payload)
    resp.raise_for_status()
    resp = requests.get(f"{url}/config/download")
    resp.raise_for_status()
    return resp.json().get("encrypted_config", "")

def get_blocks(msg: str) -> list[str]:
    b = b64decode(msg).hex()
    blocks: list[str] = []
    while len(b) > 32:
        blocks.append(b[:32])
        b = b[32:]
    return blocks

def find_block_size():
    user_input = "a" * 31
    for _ in range(0, 15):
        user_input += "a"
        msg = get_encrypted_message(user_input)
        b = get_blocks(msg)
        if b[2] == b[3]:
            print(f"Found matching blocks at input length {len(user_input)}")
            return len(user_input)

    raise ValueError("Block size not found")
```

The last message blocks when we have found the padding length will look something like this:

```
Block 0: d7e05cc32a271584202f26ba1a54b841
Block 1: 57c89e0ca26acc81bd1ee0268c28c776
Block 2: ceb92d853f3c366bd5504caea209fc81
Block 3: ceb92d853f3c366bd5504caea209fc81
Block 4: f4efe2437ec3194ac12f49125a1667fa
Block 5: e83a6535f3b89b2ec1b04fe2c805e3e3
Block 6: e0501644732b32ea43990cd748e43380
Block 7: d5805e5328e51e1a68094e48541105a9
Block 8: 9f25e69a38a2b1f0eeba53d9c64aa0ed
```

As you can see, blocks 2 and 3 are identical, which is a property we can exploit to brute-force the
secret one byte at a time.

After we have found our padding length, we can start brute-forcing the secret one byte at a time.
We do this by crafting our input as follows: we start with the padding to align our controlled
input to the end of a block. The next block will contain 15 known bytes (in our case a's). The last
byte will be the byte we are trying to brute-force. After that we follow with 15 more known bytes
(a's). With that, the only delta between the known block and the next is the last byte, which is
for now unknown.

When we bruteforce this, we will quickly find that the first byte we do not controll is a ',' which
is the separator between the netstrings. With that known byte we can now shift our input by one byte,
and repeat the process.

```python
from string import printable

padding_length = find_block_size() - 32#
padding = "a" * padding_length
secret = ""

for i in range(1, 16):
    user_input = "a" * (padding_length - 1)
    known_bytes = "a" * (15 + i)
    for b in printable:
        guess = known_bytes + chr(b)
        message = padding + guess + known_bytes
        msg = get_encrypted_message(message)
        if b[2] == b[3]:
            secret += chr(b)
            print(f"Found byte: {chr(b)}")
            break
```

This however gives us just the first 16 bytes of the secret. To get the rest, we need to repeat the
process, changing the strategy slightly. Since we now know the first block, we can use that, to
generate new guesses, using a buffer to align the other blocks. After every 16-byte block, we fill
our alignment buffer again, shifting our scan block by one to start reading the next block. With
this strategy we can read arbitrary many bytes after our controlled input.

```python
size = find_block_size()
padding = "a" * (size % 16)
known_buffer = "a" * 15
alignment_buffer = "a" * 15
scan_block = 3

while True:
    for c in printable_chars:
        user_controlled_input = padding + known_buffer[-15:] + c + alignment_buffer
        print(f"\rTesting character: {known_buffer[15:]}{c}", end="")
        msg = get_encrypted_message(user_controlled_input)
        sleep(0.005)
        b = get_blocks(msg)
        if b[2] == b[scan_block]:
            known_buffer += c
            if alignment_buffer == "":
                alignment_buffer = "a" * 15
                scan_block += 1
            else:
                alignment_buffer = alignment_buffer[1:]
            break
    else:
        print("No more matching character found, exiting")
        break
```

With this code we can finally recover the full secret.
