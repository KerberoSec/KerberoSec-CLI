# Saimese Cybersecurity Network (SCN)    

A modern, GitHub-native cybersecurity education platform featuring TryHackMe walkthroughs and security news.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Git
- GitHub account

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/saimese-cybersecurity-network.git
cd saimese-cybersecurity-network

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:4321` to see your site!

## 📁 Project Structure

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navigation.astro    # Site navigation
│   │   ├── Footer.astro        # Site footer
│   │   └── Comments.astro      # Giscus comments
│   ├── content/
│   │   ├── config.ts           # Content collections config
│   │   ├── walkthroughs/       # TryHackMe walkthroughs
│   │   │   └── *.md
│   │   └── news/               # Security news articles
│   │       └── *.md
│   ├── layouts/
│   │   └── BaseLayout.astro    # Base page layout
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── walkthroughs/
│   │   │   ├── index.astro     # Walkthroughs list
│   │   │   └── [slug].astro    # Individual walkthrough
│   │   └── news/
│   │       ├── index.astro     # News list
│   │       └── [slug].astro    # Individual article
│   └── styles/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## ✍️ Adding Content

### Creating a New Walkthrough

1. Create a new `.md` file in `src/content/walkthroughs/`
2. Add frontmatter metadata:

```markdown
---
title: "TryHackMe: Room Name"
date: 2026-01-26
tags: [linux, web, privesc]
difficulty: Medium
description: "Brief description of the room"
---

## Your content here...
```

3. Write your walkthrough in Markdown
4. Commit and push: the site will auto-deploy!

### Creating a News Article

1. Create a new `.md` file in `src/content/news/`
2. Add frontmatter metadata:

```markdown
---
title: "Your Article Title"
date: 2026-01-26
tags: [malware, breaches, tools]
summary: "Brief summary of the article"
author: "Your Name"
---

## Your content here...
```

3. Write your article in Markdown
4. Commit and push!

## 💬 Setting Up Comments (Giscus)

1. Enable **GitHub Discussions** in your repository settings
2. Visit [giscus.app](https://giscus.app/)
3. Enter your repository name
4. Configure your preferences
5. Copy the generated values
6. Update `src/components/Comments.astro` with:
   - `data-repo`
   - `data-repo-id`
   - `data-category-id`

## 🚀 Deployment

### GitHub Pages Setup

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Push to the `main` branch
4. GitHub Actions will automatically build and deploy your site

### Custom Domain (Optional)

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Update `site` in `astro.config.mjs`

## 🎨 Customization

### Colors

Edit `tailwind.config.mjs` to customize the color scheme:

```javascript
colors: {
  cyber: {
    dark: '#0a0e27',
    accent: '#00ff88',
    // ... add your colors
  },
}
```

### Styling

Global styles are in `src/layouts/BaseLayout.astro`. Component-specific styles are within each `.astro` file.

## 🛠️ Commands

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Install dependencies                              |
| `npm run dev`          | Start local dev server at `localhost:4321`        |
| `npm run build`        | Build production site to `./dist/`                |
| `npm run preview`      | Preview build locally before deploying            |

## 📚 Tech Stack

- **Framework:** [Astro](https://astro.build)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Syntax Highlighting:** Shiki (built-in)
- **Comments:** [Giscus](https://giscus.app)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔐 Security Notice

This platform is for **educational purposes only**. All walkthroughs and techniques should be used ethically and legally. Always obtain proper authorization before testing security tools.

---

Built with ❤️ for the cybersecurity community
