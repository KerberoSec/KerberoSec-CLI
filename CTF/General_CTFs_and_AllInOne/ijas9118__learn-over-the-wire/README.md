# ⚔️ OverTheWire Wargames: Learning Journey

![Platform](https://img.shields.io/badge/Platform-OverTheWire-000000?style=for-the-badge&logo=linux)
![Wargame](https://img.shields.io/badge/Wargame-Bandit-red?style=for-the-badge)
![Progress](https://img.shields.io/badge/Progress-Level_12_Complete-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

Welcome to my repository documenting the solutions and key learnings from the **OverTheWire Bandit** wargames. This project serves as a revision guide for mastering fundamental Linux commands, security principles, and terminal-based puzzle solving.

---

## 🛠️ My Local Workflow

To keep the learning process efficient and safe, I follow a specific local setup:

1.  **Credential Management**: Passwords for each level are stored locally in a `passwords/bandit/` directory.
2.  **Security**: The password folder is added to the `.gitignore` to prevent any accidental leakage to public repositories.
3.  **Non-Interactive Login**: Using `sshpass` combined with the locally stored credentials allows for instant connection without manual entry.

```bash
# Connecting to Level 12 for example:
sshpass -p $(cat passwords/bandit/lvl12) ssh bandit12@bandit.labs.overthewire.org -p 2220
```

---

## 🗺️ Progress Map: Bandit

| Level Range | Core Concepts | Documentation |
| :--- | :--- | :--- |
| **00 → 12** | SSH, Find, Grep, Base64, ROT13, Compression | [Bandit Level Docs](./01-bandit/) |

---

## 🗂️ Project Structure

```text
learn-overthewire/
├── .gitignore              # Protects our local passwords
├── LICENSE                 # Repository license
├── 01-bandit/              # Individual level walkthroughs
│   ├── level-00.md
│   ├── ...
│   └── level-12.md
└── passwords/              # (Gitignored) Local credential storage
```

---

## 📄 License

This repository is licensed under the **MIT License**. For full details, see the [LICENSE](./LICENSE) file.

---

> [!NOTE]
> This repository is meant to be a revision tool. If you are a beginner, try solving the levels first before referring to these notes to maximize your learning.
