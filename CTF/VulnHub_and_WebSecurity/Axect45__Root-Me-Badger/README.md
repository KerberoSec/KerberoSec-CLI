# 🦡 Root-Me-Badger

[![License: GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)

> 🏁 **Display your Root-Me CTF progress proudly on your GitHub!**

**Root-Me-Badger** is a lightweight, open-source tool that generates a dynamic badge summarizing your progress on [Root-Me](https://www.root-me.org/), the cybersecurity and CTF platform.  
Easily embed a live badge into your GitHub profile or repo README to showcase your hacking journey.

---

## 🚀 Features

- Fetches your Root-Me stats automatically
- Retrieves your points and position in the Root-Me ladder
- Generates a dynamic badge image
- Easy to integrate into GitHub READMEs or personal websites

---

## 📸 Preview

*[Image: RootMeBadger Example]*

---

## ⚡ Quick Start

1. **Clone the repository**
   ```sh
   git clone https://github.com/Axect45/Root-Me-Badger.git
   cd root-me-badger
   ```

2. **Install dependencies**
   ```sh
   pip install -r requirements.txt
   ```

3. **Get your Root-Me User ID and API Key**
   - Go to [Root-Me Preferences](https://www.root-me.org/?page=preferences) to find your credentials.

4. **Generate your badge**
   ```sh
   python3 src/badger.py --user-id YOUR_USER_ID --api-key YOUR_API_KEY --output [OUTPUT_PATH]
   ```

---

## 📦 Integration

Embed your badge in your GitHub README:

```markdown
*[Image: RootMeBadger]*
```

---

## ✅ TODO

- [x] Fetch user stats from the [Root-Me API](https://api.www.root-me.org/)

- [ ] Generate dynamic SVG badge

- [ ] Add GitHub Action workflow example

- [ ] Add customization options (themes, layout)

- [ ] Write tests
