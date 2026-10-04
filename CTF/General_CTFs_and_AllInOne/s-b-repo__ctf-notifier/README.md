# CTF Notifier

A small Linux system-tray app that notifies you when a CTF with **rewards**
(prizes, vouchers, OSCP/OffSec course bundles) is upcoming, starting soon, or
live right now, and watches pages that aren't on CTFtime (OffSec's **The
Gauntlet** and giveaways) so you catch the entry window.

## What it does

- Polls the **CTFtime JSON API** every 30 minutes (configurable) and surfaces
  every event that has a non-empty `prizes` field. Events mentioning
  `oscp`, `offsec`, `voucher`, `cert`, `scholarship`, `$`, etc. are flagged
  high-priority.
- Sends desktop notifications for: a newly-seen reward CTF, one starting within
  24 hours, and one going live.
- **Watches extra pages** (The Gauntlet, OffSec CTF/giveaway blog) and notifies
  when the page text changes and mentions registration/dates/prizes.
- Shows a **tray icon** with a live list of the next 12 reward CTFs (click to
  open), a **Check now** action, and quick links.
- Has a **full GUI browser** (`--gui`, or "Browse all CTFs" in the tray) with a
  modern **black theme + colour accents** (red = live, yellow = upcoming,
  green = has prizes, gold = OSCP/voucher/cert, cyan = site/feed):
  - **Active tab**: sortable, searchable table of **active CTFs worldwide**
    (live + upcoming; TBD-prize events kept) plus browsable **sites/feeds**
    (CTFtime, OffSec, HTB, picoCTF, pwn.college, Reddit: extend in `CONFIG["sites"]`).
  - **Archive (24h) tab**: finished events are cached to
    `~/.local/share/ctf-notifier/archive.json` and kept for 24 hours, then pruned.
  - Filter by search text, **Source** dropdown, "Rewards only", or "Live now";
    click any column header to sort; double-click a row to open it.
- Starts automatically at **login/boot** via an XDG autostart entry.

## Install

```bash
git clone https://github.com/s-b-repo/ctf-notifier.git
cd ctf-notifier
chmod +x install.sh
./install.sh
```

The installer creates a virtualenv, installs Python deps, generates the app
icon, installs the system packages needed for the tray + notifications (needs
sudo for that part), and sets up:

- a **Desktop icon** ("CTF Notifier") and an **Applications-menu entry**: double-click either to open the GUI browser, like a normal desktop app;
- a **login autostart** entry for the background tray notifier.

## Run

```bash
.venv/bin/python ctf_notifier.py              # tray (or headless fallback)
.venv/bin/python ctf_notifier.py --gui        # full global CTF browser window
.venv/bin/python ctf_notifier.py --test-notify # verify notifications work
.venv/bin/python ctf_notifier.py --once       # one poll, then exit (cron-friendly)
.venv/bin/python ctf_notifier.py --headless   # no tray, notifications only
```

## Configure

Edit the `CONFIG` block at the top of `ctf_notifier.py`:

- `poll_interval_min`: how often to poll (floored at 10 minutes).
- `lookahead_days`: how far ahead to pull events.
- `require_prizes`: `True` = only events with a prizes field; `False` = also
  catch keyword-matching titles.
- `highlight_keywords`: what gets a high-priority alert.
- `web_watch`: add any page you want monitored (name, url, keywords).

State (seen events, page hashes, logs) lives in
`~/.local/share/ctf-notifier/`.

## Notes / limitations

- "Realtime" means within the poll interval: these sources don't push, so the
  app pulls. 30 minutes is plenty for CTF schedules and is gentle on CTFtime.
- The tray icon needs an AppIndicator/StatusNotifier backend (installed by
  `install.sh`). If it's missing, the app runs **headless** and notifications
  still fire: you just won't see a tray icon.
- Page-watchers see static HTML. If a page is fully JavaScript-rendered, the
  watcher may detect little; the CTFtime feed is the reliable reward source.
- Only legitimate sources are used. No voucher-code scraping.

## Uninstall

```bash
rm -f ~/.config/autostart/ctf-notifier.desktop \
      ~/.local/share/applications/ctf-notifier.desktop \
      "$HOME/Desktop/CTF Notifier.desktop"
rm -rf ~/.local/share/ctf-notifier
# then delete the cloned repo folder (and its .venv)
```

## License

MIT: see [LICENSE](LICENSE).
