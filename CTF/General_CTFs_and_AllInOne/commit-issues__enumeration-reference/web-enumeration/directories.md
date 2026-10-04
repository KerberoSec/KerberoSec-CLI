# 📁 Directory & File Enumeration

You found a web server on port 80 or 443. You opened it in your browser and saw a homepage. Most beginners stop there. The homepage is not the attack surface: everything hidden behind it is.

---

## 🧠 What is Directory Busting?

Directory busting (also called directory enumeration or content discovery) is the process of systematically guessing file and folder paths on a web server to find things that aren't linked anywhere visible.

Web servers host files and folders. Some are meant to be public. Many are not, but they're still accessible if you know to ask for them. A wordlist-based tool sends thousands of requests, one per guess, and reports back what actually exists.

Think of it like trying every room number in a hotel. Most doors won't open. But some will, and behind them you might find a maintenance closet full of master keys, a conference room with sensitive documents left on the table, or a back exit nobody told you about.

---

## 📊 HTTP Response Codes: Know These Cold

When your tool sends a request to `/admin`, the server responds with a status code. That code tells you what happened.

| Code | Name | What it means | What to do |
|---|---|---|---|
| `200` | OK | Page exists and loaded successfully | Investigate immediately |
| `301` | Moved Permanently | Content moved to a new URL: follow the redirect | Follow it |
| `302` | Found (Temporary Redirect) | Temporarily redirected | Follow it: often redirects to login |
| `401` | Unauthorized | Page exists but requires authentication | Note it: credentials needed |
| `403` | Forbidden | Page exists but you're not allowed | Note it: may be bypassable |
| `404` | Not Found | Page doesn't exist | Move on |
| `500` | Internal Server Error | Server crashed on your request | Interesting: note it |

> 💡 **403 is not a dead end.** A 403 means the server knows the page is there and is actively blocking you. That's more useful than a 404. There are bypass techniques worth trying: different HTTP methods, path manipulation, header injection.

---

## 📂 Common Directories Worth Finding

These are the paths that consistently produce findings across CTF boxes and real engagements.

| Path | Why it matters |
|---|---|
| `/admin` | Admin panel: often default credentials or unprotected |
| `/administrator` | Common CMS admin path (Joomla, etc.) |
| `/wp-admin` | WordPress admin panel |
| `/login` | Login page: check for default creds, SQLi |
| `/dashboard` | Internal dashboard: often unprotected |
| `/api` | API endpoint: check for unauthenticated access |
| `/api/v1` | Versioned API: try v1, v2, v3 |
| `/backup` | Backup files: goldmine for credentials and source code |
| `/backups` | Same |
| `/.git` | Exposed git repository: full source code disclosure |
| `/.env` | Environment file: often contains credentials and API keys |
| `/config` | Configuration files |
| `/uploads` | File upload directory: check for executable files |
| `/files` | Same |
| `/include` | PHP includes: sometimes directly accessible |
| `/phpmyadmin` | Database admin panel |
| `/robots.txt` | Explicitly lists paths the site wants hidden: always check |
| `/sitemap.xml` | Full map of site content |
| `/.htaccess` | Apache config: sometimes readable |

> 💡 **Always check `robots.txt` first.** It's a file that tells search engines what not to index: which means it's a list of things the site owner wants hidden. It's public and unprotected by design.

---

## 🔎 What To Do When You Find Something

**Found a `/admin` or `/login` page:**
- Try default credentials (admin/admin, admin/password, root/root)
- Check the page source for hints
- Run a targeted scan with Nikto
- Test for SQL injection on the login form

**Found a `/backup` or `/.git` directory:**
- Download everything you can
- `.git` repositories can be dumped with `git-dumper` to get full source code
- Backup files often contain database dumps, config files with credentials

**Found a `/.env` file:**
- Download it immediately
- It almost certainly contains database credentials, API keys, or secret tokens

**Found a `403 Forbidden`:**
- Try adding a trailing slash: `/admin/`
- Try different HTTP methods: `curl -X POST https://target.com/admin`
- Try path manipulation: `/admin/../admin/`
- Try headers: `X-Forwarded-For: 127.0.0.1`

**Found a `/uploads` directory:**
- Check if you can access files directly
- If the site has a file upload function, this is where uploaded shells land

---

## 🛠️ Tools for Directory Enumeration

| Tool | Best for | Speed |
|---|---|---|
| **gobuster** | Fast, reliable, CTF standard | ⚡ Fast |
| **feroxbuster** | Recursive scanning: finds nested directories | ⚡ Fast |
| **ffuf** | Fuzzing: highly customizable filtering | ⚡ Fast |
| **dirsearch** | Simple, beginner friendly | 🟡 Medium |
| **nikto** | Web vulnerability scanning alongside enumeration | 🟡 Medium |

Each of these tools has its own dedicated file in this reference. Start with gobuster: it's the most commonly used and easiest to get running fast.

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*