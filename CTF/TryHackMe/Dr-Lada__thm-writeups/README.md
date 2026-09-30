# TryHackMe Writeups

Personal TryHackMe writeups focused on **methodology, detection, and remediation**: not just how a box was rooted, but why each technique worked and how it would be caught and fixed on the blue-team side.

> **Flags are redacted** (`THM{REDACTED}`). Each writeup documents the full path so you can reproduce the steps and recover flags on your own instance. If you're actively working a room, try it independently before reading.

---

## Index

| Room | Difficulty | Category | Key Techniques | Writeup |
|------|-----------|----------|----------------|---------|
| Byte Lotus: Poolside | Medium | Boot2Root / Web | NoSQL injection, EJS SSTI, Node inspector abuse, `disk` group privesc | [writeup](./byte-lotus/writeup.md) |
| CryptoCabana | Medium | Cloud (Azure) | Leaked SAS token, storage enumeration, service-principal credentials, Key Vault secret versioning | [writeup](./cryptocabana/writeup.md) |

---

## Structure

Each room lives in its own folder:

```
room-name/
├── writeup.md
└── screenshots/      (optional)
```

Every writeup follows the same skeleton:

1. **Recon**: scanning and enumeration
2. **Exploitation**: each stage of the chain, with the *why* behind each technique
3. **Attack chain**: a compact diagram of the full path
4. **Defensive takeaways**: how each step would be detected (blue-team mapping)
5. **Remediation**: how each finding should be fixed

A blank [`TEMPLATE.md`](./TEMPLATE.md) is provided to keep writeups consistent.

---

## Disclaimer

These writeups are for educational purposes and cover rooms already released on [TryHackMe](https://tryhackme.com). All testing was performed in authorized lab environments. No real-world infrastructure, credentials, or private data appears in this repository.
