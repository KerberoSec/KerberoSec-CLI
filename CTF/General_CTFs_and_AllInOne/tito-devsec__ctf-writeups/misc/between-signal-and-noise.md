# CTF Write-up: Between Signal and Noise

**Source:** Cyber Premier League
**Category:** Misc
**Points:** 300
**Challenge Author:** DR PROGRAMMER
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary

The challenge, titled "Between Signal and Noise," presented a scenario where a former employee, who left under unusual circumstances, hinted at a key being in "the usual place" and the rest of the information being "in the logs." Incident response had preserved artifacts from their workstation, specifically a `challenge.zip` file.

Upon extraction, the `challenge.zip` contained two files: `.config` and `log_20250225.txt`.

## Step-by-Step Solution

### Step 1: Unpack the Challenge

The initial step involved extracting the provided `challenge.zip` file. This revealed two critical files:

```bash
unzip challenge.zip
ls -la
```

**Observation:**
*   `.config` was identified as a file, not a directory, which is an unusual characteristic for a configuration item.
*   `log_20250225.txt` contained system log messages, as its name suggested.

The challenge hints suggested that the "key is in the usual place" (implying config/logs) and "the rest is in the logs" (indicating multi-layer encoding/encryption).

### Step 2: Examine the Configuration File

The content of the `.config` file was examined:

```bash
cat .config
```

**Output:**

```
# Encrypted payload (base64):
Pl8VGH1uOFBKIV1HDQNvPkAmCwEBUF4selAKEgNDUQUi
```

**Analysis:**

The output clearly indicated a Base64 encoded string. It was noted that Base64 is an encoding scheme, not an encryption method, suggesting that further encryption layers were likely present.

### Step 3: Examine the Logs

The `log_20250225.txt` file was then analyzed for clues:

```bash
cat log_20250225.txt
```

**Observations:**

*   The logs contained numerous `WARNING` lines.
*   Certain warnings included numbers and suspicious phrases, such as "_internal audit flag set by admin" and "Key rotation recommended within 7 days."

These observations, combined with the hint "The rest is in the logs," strongly suggested that the logs contained an XOR key or another secret component necessary for decryption.

### Step 4: Decode Base64 Payload

The Base64 encoded string from the `.config` file was decoded:

```bash
echo "Pl8VGH1uOFBKIV1HDQNvPkAmCwEBUF4selAKEgNDUQUi" | base64 -d
```

**Output (binary, unreadable):**

```
>_\x15\x18}n8PJ!]G\x03\x03o>@&\x0B\x01\x05\x01Q^\x06l\x00\x04\x12\x04\x03T\x05"\n
```

**Observation:**

The output was binary and unreadable, confirming the presence of another encryption layer, most likely XOR encryption, which is a common technique in CTF miscellaneous challenges.

### Step 5: Identify the XOR Key from Logs

To identify the XOR key, the `WARNING` lines in `log_20250225.txt` were carefully examined. There were 9 warning lines in total. The strategy was to extract the first letter or number from each warning line, as is often the case in such CTF challenges.

| Warning Line                                    | Key Component |
| :---------------------------------------------- | :------------ |
| Maintenance window scheduled for 02:00 UTC      | M             |
| 1 deprecated API call from 10.0.0.42            | 1             |
| ssl certificate expires in 30 days              | s             |
| cache size exceeds 80% threshold                | c             |
| 0 retries left for worker queue                 | 0             |
| _internal audit flag set by admin               | _             |
| Key rotation recommended within 7 days          | K             |
| 3 failed login attempts from 192.168.1.100      | 3             |
| yaml config parser fallback used                | y             |

Concatenating these components yielded the XOR key: `M1sc0_K3y`.

### Step 6: Decrypt the Payload

A Python script (`misc.py`) was used to perform the XOR decryption:

```python
import base64

# Base64 encoded payload
cipher = base64.b64decode("Pl8VGH1uOFBKIV1HDQNvPkAmCwEBUF4selAKEgNDUQUi")

# XOR key extracted from logs
key = b"M1sc0_K3y"

# XOR decryption
plaintext = bytes([cipher[i] ^ key[i % len(key)] for i in range(len(cipher))])

# Print the flag
print(plaintext.decode())
```

Executing the script:

```bash
python3 misc.py
```

**Output:**

```
snf{M1sc3ll4n30us_F0r3ns1cs_2025}
```

This successfully recovered the flag.

## Lessons Learned

This challenge provided valuable insights into common CTF miscellaneous forensic techniques:

*   **Log Analysis:** Logs are frequently used to hide keys, hints, or parts of a payload. Thorough examination, often focusing on unusual entries like `WARNING` messages, is crucial.
*   **Pattern Recognition:** Extracting specific characters (first letters, numbers) from log entries or other textual data is a common method for constructing keys.
*   **Multi-Layer Encoding/Encryption:** Challenges often combine multiple layers of encoding (e.g., Base64) and encryption (e.g., XOR) to obscure the flag. Identifying these layers and the correct order of operations is key.
*   **CTF Hint Interpretation:** Classic CTF hint phrasing, such as "leaving the key in the usual place" or "the rest is in the logs," directly points towards the location and nature of hidden information.

## Flag

`snf{M1sc3ll4n30us_F0r3ns1cs_2025}`
