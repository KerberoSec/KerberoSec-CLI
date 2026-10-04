# 🚀 Automatic Sync with Obsidian Git Plugin: Step by Step

Sync your Obsidian vault automatically with GitHub using the **Obsidian Git plugin** and a **GitHub Personal Access Token (PAT)**.

---

## 🛠 Step 1: Install Git on Your Computer

- Download and install Git from:  
    👉 [https://git-scm.com/](https://git-scm.com/)
    
- Verify installation by running in terminal:
    
    ```bash
    git --version
    ```
    

---

## ☁️ Step 2: Create a GitHub Repository

1. Log in to GitHub
    
2. Click **New repository**
    
3. Name it (e.g., `obsidian-vault`)
    
4. Choose **Private** or **Public**
    
5. **Do not initialize** with a README, .gitignore, or license
    
6. Click **Create repository**
    

---

## 📦 Step 3: Install & Enable Obsidian Git Plugin

1. Open Obsidian
    
2. Go to **Settings → Community Plugins**
    
3. Turn **Safe Mode** off
    
4. Click **Browse**, search for **Obsidian Git**
    
5. Click **Install**, then **Enable**
    

---

## 🧱 Step 4: Initialize Git in Your Vault

Open terminal and run:

```bash
cd /path/to/your/obsidian-vault
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "Initial sync from Obsidian"
git branch -M main
git push -u origin main
```

✅ Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repo.

---

## 🔐 Step 5: Generate a GitHub Personal Access Token (PAT)

1. Go to: **GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (Classic)**
    
2. Click **Generate new token**
    
3. Select expiration and **`repo`** scope
    
4. Click **Generate token** and copy it
    

---

## 🌐 Step 6: Configure Git Remote with PAT

In terminal:

```bash
git remote set-url origin https://YOUR_USERNAME:<TOKEN>@github.com/YOUR_USERNAME/YOUR_REPO.git
```

🔁 Example:

```bash
git remote set-url origin https://TeaneX:ghp_xxxYourTokenHerexxx@github.com/TeaneX/Learn-To-Code.git
```

---

## ⚙️ Step 7: Configure Obsidian Git for Auto Sync

In **Obsidian Settings → Obsidian Git**, enable:

- ✅ Auto pull on vault open
    
- ✅ Auto push on vault close
    
- 🕓 Auto commit interval (e.g., every 10 minutes)
    
- ✏️ Custom commit message:
    
    ```text
    Auto backup: {{date}} {{time}}
    ```
    

---

## 🔁 Step 8: Test the Automatic Sync

1. Modify a note
    
2. Wait for auto-commit & push (or manually run from Command Palette: `Obsidian Git: Commit and push`)
    
3. Check GitHub to confirm your notes appear
    

---

## 🧼Step 9 Push to GitHub Now push your local files to GitHub:

```bash
git add . 
git commit -m "Initial sync from Obsidian" 
git push -u origin main
```
---
## 🏷️ Tags
#Obsidian 

[[README]]
