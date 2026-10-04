# TryHackMe Meta Hub

This folder is the navigation and metadata layer for the public TryHackMe corpus.

Use it when you want to:

- browse the taxonomy
- understand how notes are organized
- find the room template
- work on front matter or repo-wide metadata consistency

## Start Here

| If you want to... | Open |
| --- | --- |
| browse canonical tags | [TAGS.md](TAGS.md) |
| understand topic-first organization | [INDEX.md](INDEX.md) |
| start a new room note | [TEMPLATE_room.md](TEMPLATE_room.md) |
| understand taxonomy governance | [../../docs/taxonomy-closure.md](../../docs/taxonomy-closure.md) |

## What Each File Does

| File | Role |
| --- | --- |
| [README.md](README.md) | `_meta` landing page and quick navigation |
| [TAGS.md](TAGS.md) | derived controlled vocabulary for front matter |
| [INDEX.md](INDEX.md) | topic-first map and indexing guidance |
| [TEMPLATE_room.md](TEMPLATE_room.md) | scaffold for new public-safe room notes |

## Topic-First Model

The TryHackMe tree is organized as a reusable skills catalog, not a course dump.

Primary axis:

- topic/domain

Secondary axis:

- path/series, stored in front matter

That means readers can browse by subject area first, then use front matter for finer retrieval.

## Writing Rules That Matter Most

- Keep public notes sanitized.
- Use canonical placeholders from [../../docs/placeholder-policy.md](../../docs/placeholder-policy.md).
- Use controlled taxonomy values from [TAGS.md](TAGS.md).
- Prefer reusable reasoning and patterns over raw command history.

## Related Repo Docs

- [../../README.md](../../README.md)
- [../../POLICY.md](../../POLICY.md)
- [../../SANITIZATION_CHECKLIST.md](../../SANITIZATION_CHECKLIST.md)
- [../../docs/README.md](../../docs/README.md)
