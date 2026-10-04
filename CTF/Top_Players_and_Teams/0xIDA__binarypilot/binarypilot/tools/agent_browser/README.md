# agent-browser

Browser automation CLI installed in the sandbox image. Driven by the agent
through `exec_command` (not a function tool).

- **Implementation:** sandbox CLI at
  `/home/pentester/.npm-global/bin/agent-browser`: npm package
  `agent-browser@0.26.0` (Vercel), driving Chromium directly.
- **BinaryPilot config:** `containers/Dockerfile` sets `AGENT_BROWSER_*` env
  (executable path, UA, launch args, screenshot dir).
- **Skill:** `binarypilot/skills/tooling/agent_browser.md`: **always-loaded**
  into every agent prompt by `binarypilot/agents/prompt.py:_resolve_skills`.
