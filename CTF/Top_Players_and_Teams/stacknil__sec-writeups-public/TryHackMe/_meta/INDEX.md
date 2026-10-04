# TryHackMe Index (Topic-first)

Use this page as the topic-first directory for the public TryHackMe corpus.

> Goal: turn many rooms into a searchable skills catalog.
> Notes are written for learning and reusability, not for copying steps.
> Sensitive identifiers are sanitized (`TARGET_IP`, `USER_A`, `example.com`).

## Quick navigation

- [Metadata hub](README.md)
- [Tag taxonomy](TAGS.md)
- [Room template](TEMPLATE_room.md)
- [Taxonomy closure](../../docs/taxonomy-closure.md)

## How this tree is organized

Primary axis:

- topic/domain folder

Secondary axis:

- path/series in front matter (`path:`)

That means the folder tree stays subject-first, while series or curriculum context lives in metadata.

## Browse by topic

| Topic | Focus |
| --- | --- |
| `00-foundations` | CLI, Linux/Windows basics, networking basics, learning-meta |
| `10-web` | HTTP fundamentals, web enumeration, auth/session, web vulnerabilities concepts |
| `20-linux` | Linux enumeration, privilege escalation patterns, services |
| `30-windows` | Windows basics, AD basics, Windows enumeration and privesc patterns |
| `40-networking` | scanning, routing, DNS, common protocols, traffic-analysis basics |
| `50-crypto` | crypto fundamentals in CTF-style or concept-note form |
| `60-forensics` | file, PCAP, and memory fundamentals |
| `70-cloud` | cloud fundamentals, IAM concepts, container basics |
| `80-blue-team` | logging, detection ideas, triage, and IR workflows |
| `90-events` | AoC and other time-bounded event notes |

## Add a new room

1. Create the note path under the right topic:
   - `TryHackMe/<topic>/<room-slug>/README.md`
2. Copy [TEMPLATE_room.md](TEMPLATE_room.md) into the new file.
3. Fill the required front matter:
   - `room`, `path`, `domain`, `skills`, `status`, `date`
4. Verify tags against [TAGS.md](TAGS.md).
5. Add one row to the example catalog below if you want to extend the maintained index examples.

## Room Catalog Examples

| Room | Topic | Path/Series | Status | Key patterns learned | Link |
| --- | --- | --- | --- | --- | --- |
| (example) Linux Fundamentals Part 1 | `00-foundations/linux-fundamentals` | `LinuxFundamentals` | done | basic fs + permissions mental model | `../00-foundations/linux-fundamentals/linux-fundamentals-part-1/` |
| (example) Command Line | `00-foundations/command-line` | `Command Line` | done | pipes + redirection + grep patterns | `../00-foundations/command-line/command-line/` |
| (example) How The Web Works | `10-web/how-the-web-works` | `HowTheWebWorks` | wip | HTTP request lifecycle, headers | `../10-web/how-the-web-works/how-the-web-works/` |
| (example) Network Fundamentals | `40-networking/network-fundamentals` | `Network-Fundamentals` | wip | TCP handshake, DNS flow | `../40-networking/network-fundamentals/network-fundamentals/` |
| (example) Windows Fundamentals | `30-windows/windows-fundamentals` | `WindowsFundamentals` | todo | account model, services | `../30-windows/windows-fundamentals/windows-fundamentals/` |
| (example) THM AoC 2025 | `90-events/thm-aoc-2025` | `THM AoC 2025` | wip | daily small patterns | `../90-events/thm-aoc-2025/` |

## Indexing rules

- Use room slugs in folder names (`kebab-case`).
- Keep “Key patterns learned” to one or two short phrases.
- If a note is mostly CLI recipes, place it under `00-foundations/command-line/`.
- Keep the public tree topic-first; do not turn folders into course-timetable mirrors.
