
# ECOWAS CTF 2026: Human Error Chain (Misc)

We are given three files: `incident_report.pdf`, `slack_export.json`, and an encrypted archive `backup.zip`. The flag format is `EcowasCTF{{typo_shift}_{zip_content}_{trust_user}}`.

First, we identify the files:
```

ls
file *

```
The ZIP is encrypted, the PDF is a report, and the JSON is a Slack export.

Next, we inspect the Slack data:
```

cat slack_export.json | jq . | tee slack.txt

```
We notice multiple suggested passwords such as `Spring2024!` and `W1nter2023#`, along with contradictions (especially about MFA). However, one user, **Priya**, repeatedly states that the PDF is the authoritative source (“stick to the document”, “the PDF is authoritative”). This indicates that Slack contains misleading information and only Priya is trustworthy.

We then move to the PDF:
```

pdftotext incident_report.pdf pdf.txt
cat pdf.txt

```
The output is broken (cut words), meaning the PDF content is not directly extractable. Checking further:
```

strings -a incident_report.pdf

```
We find `/Filter /FlateDecode`, indicating compressed content. We therefore decompress the PDF streams manually:

```

python3 - <<'PY'
import re, zlib
data = open("incident_report.pdf","rb").read()
streams = re.findall(rb"stream\r?\n(.*?)\r?\nendstream", data, re.S)
for s in streams:
print(zlib.decompress(s).decode("latin1", errors="replace"))
PY

```

From the decompressed content, we extract key information:
- Case ID: `ECOWAS-IR-447` → `IR447`
- Encoded integrity token: `GOTZX`
- Cipher rule: `C = (P - s) mod 26` → `P = (C + s) mod 26`
- Several intentional typos in the text

The typos are:
```

teh
recieve
authntication
occured
seperate

```

The PDF explains that `s` is derived from the starting position (1-based) of each typo in the document. We extract the visible text and compute positions correctly:

```

python3 - <<'PY'
import re
from string import ascii_uppercase

raw = open("pdf_streams.txt").read()
texts = re.findall(r"((.*?))\s*Tj", raw)
body = "\n".join(t.replace(r"(", "(").replace(r")", ")") for t in texts)
body_before = body.split("Decode procedure")[0]

typos = ["teh","recieve","authntication","occured","seperate"]
positions = [re.search(r"\b"+t+r"\b", body_before).start()+1 for t in typos]

cipher = "GOTZX"
token = ""

for c,pos in zip(cipher,positions):
s = pos % 26 or 26
token += ascii_uppercase[(ascii_uppercase.index(c)+s)%26]

print(token)
PY

```

This yields:
```

TRUST

```

From Slack (Priya’s reliable message), the ZIP password format is:
```

TOKEN + "_" + CASEID

```

So the password is:
```

TRUST_IR447

```

We extract the archive:
```

rm -rf out
7z x backup.zip -pTRUST_IR447 -oout
find out -type f -exec cat {} ;

```

This gives:
```

L3AK_C0r3

```

Finally, for `trust_user`, we rely on Slack analysis: Priya is the only consistent and reliable source throughout the conversation.

```

priya_ops

```

Putting everything together:
```

EcowasCTF{TRUST_L3AK_C0r3_priya_ops}

```

This challenge highlights the importance of identifying trustworthy sources, performing PDF forensics on compressed content, and applying custom crypto logic based on contextual clues (typos). While tools like `qpdf` or `pdftoppm` could simplify PDF extraction, the core reasoning (typos → positions → decoding) remains essential.
```
