# ctfterminal

A hacker-flavored terminal viewer for upcoming CTF events, powered by [ctftime.org](https://ctftime.org/api/).

```
        __    _____  __  .__                                .__  .__ 
  _____/  |__/ ____\/  |_|__| _____   ____             ____ |  | |__|
_/ ___\   __\   __\\   __\  |/     \_/ __ \   ______ _/ ___\|  | |  |
\  \___|  |  |  |   |  | |  |  Y Y  \  ___/  /_____/ \  \___|  |_|  |
 \___  >__|  |__|   |__| |__|__|_|  /\___  >          \___  >____/__|
     \/                           \/     \/               \/         
```

---

## Screenshots

**Interactive mode**: browse upcoming CTFs in a color-coded table with a live prompt:

*[Image: Interactive mode]*

**CTF detail view**: full event information with keyboard navigation hints:

*[Image: CTF detail]*

---

## Install

> Requires **Python 3.12+**

### With `uv` (recommended)

```bash
git clone https://github.com/Aerex0/ctftime-cli
cd ctftime-cli
uv sync
uv run ctftime-cli.py
```

### With `pip`

```bash
git clone https://github.com/Aerex0/ctftime-cli
cd ctftime-cli
pip install requests rich
python ctftime-cli.py
```

### Add to PATH (create a command to run from anywhere)

```bash
chmod +x ctftime-cli.py

# symlink into your PATH (adjust the path as needed)
ln -s "$(pwd)/ctftime-cli.py" ~/.local/bin/ctftime
```

---

## Usage

```
ctftime                          # table of next 20 CTFs in next 30 days
ctftime -i                       # interactive browse mode
ctftime -n 50 -d 60              # next 50 CTFs in 60 days
ctftime --detail 3               # full detail view for event #3
ctftime --jeopardy               # Jeopardy-only filter
ctftime --ad                     # Attack-Defense only
ctftime --min-weight 25          # only CTFs with weight ≥ 25
ctftime --urls                   # include CTFtime URLs in table
ctftime --no-banner              # suppress the ASCII art banner
```

---

## Interactive Mode (`-i`)

When launched with `-i`, ctfterminal enters a live prompt loop after showing the table.

### Main prompt

| Command | Action |
|---------|--------|
| `<num>` | Open detail view for event #num |
| `o<num>` | Open event #num in browser (`xdg-open`) |
| `r` | Refresh & re-fetch events from CTFtime |
| `h` / `?` | Show help |
| `q` | Quit |

### Detail view (inside an event)

Once you open an event, you can navigate between events without going back to the list:

| Key | Action |
|-----|--------|
| `n` / `j` / Enter | Next event |
| `p` / `k` / `b` | Previous event |
| `<num>` | Jump to event #num |
| `o<num>` | Open event #num in browser |
| `q` | Back to event list |

---

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `-n`, `--limit N` | `20` | Max events to fetch |
| `-d`, `--days N` | `30` | Look-ahead window in days |
| `-i`, `--interactive` | off | Browse events interactively |
| `--detail N` |: | Show full detail for event #N and exit |
| `--urls` | off | Show CTFtime URLs column in the table |
| `--jeopardy` | off | Filter to Jeopardy format only |
| `--ad` | off | Filter to Attack-Defense format only |
| `--min-weight F` | `0.0` | Minimum CTFtime weight score |
| `--no-banner` | off | Suppress the ASCII banner |

> `--jeopardy` and `--ad` are mutually exclusive.

---

## Weight Tiers

Event weights are colour-coded based on CTFtime's 0-100 scale:

| Colour | Tier | Range |
|--------|------|-------|
| 🔴 Bold Red | High | ≥ 50 |
| 🟡 Bold Yellow | Medium | 20: 49 |
| 🟢 Green | Low | 1: 19 |
| ⬛ Dim | Unrated | 0 |

---

## Requirements

- Python **3.12+**
- [`rich`](https://github.com/Textualize/rich): terminal rendering
- [`requests`](https://docs.python-requests.org/): HTTP client

---

## Project Structure

```
ctftime-terminal/
├── ctftime-cli.py   # main script (all-in-one)
├── assets/
│   ├── interactive-mode.png
│   └── ctf-details.png
├── pyproject.toml        # project metadata & dependencies
├── uv.lock               # locked dependency versions
└── README.md
```

---

## Notes

- Uses the [CTFtime public API](https://ctftime.org/api/): no authentication required.
- CTFtime asks that you don't build site clones with their data. This is a personal CLI tool.
- All times are shown in your **local timezone**.