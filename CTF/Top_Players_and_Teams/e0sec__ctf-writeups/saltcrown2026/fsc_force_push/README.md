# crownspire-deploy: git object forensics writeup

**Category:** Forensics
**Flag:** `HTB{th3_r3l1qu4ry_n3v3r_f0rg3ts}`

## Challenge summary

The challenge provides a zip archive containing a git repository, `crownspire-deploy`: a
Python CLI tool for signing and publishing manifests to a service called the "reliquary."
The goal is to recover a leaked credential that was committed to the repo at some point in
its history and treated as if it had been erased.

## Initial recon

Unzipping the archive and inspecting the repo shows a normal-looking commit history: CLI
scaffolding, HMAC signing logic, tests, CI config, and docs, culminating in a small security
cleanup near the end of the log:

```
7ae3842 docs: creds come from CI secret store / local .env only
4c92bf1 chore: gitignore .env and *.creds so keys never land in git again
7440b30 deploy.sh: load creds from env, retry once on 403
```

That commit message is the tell: `.gitignore .env and *.creds so keys never land in git
again` implies keys *had* landed in git before this point. Ignoring a file only stops it
from being tracked going forward: it does nothing to the blobs already written into
`.git/objects` from earlier commits.

```bash
git log --all --oneline
git log --all --diff-filter=A --name-only -- '*.env' '*.creds'
```

No commit ever added a file literally named `.env` under that path in any tree, so the
leak isn't sitting in the current (or any past) commit history as a tracked file. That rules
out `git log -p` / `git show` on tracked paths and points toward history that was rewritten
or a file that was committed and then removed in a way that dropped it from every tree, but
not from the object store.

## Recovering the dangling object

Git never truly deletes a blob just because no commit points to it anymore: the raw object
stays in `.git/objects` until an explicit garbage collection (`git gc --prune`) removes it.
Deleted-and-gitignored files are a classic source of these unreferenced ("dangling") blobs.

Approach: walk every loose object in `.git/objects`, filter to blobs, and grep each one's
content for the flag format directly: rather than relying on `git fsck --unreachable` or
trusting any specific commit to reference it.

```bash
for obj in $(find .git/objects -type f | sed 's#.git/objects/##; s#/##'); do
  type=$(git cat-file -t "$obj" 2>/dev/null)
  if [ "$type" = "blob" ]; then
    git cat-file -p "$obj" 2>/dev/null | grep -l "HTB{" /dev/stdin >/dev/null 2>&1 \
      && echo "FOUND in $obj"
  fi
done
```

This immediately turns up a hit:

```
FOUND in 12b14971d38c09ee73fed80613951dfdd3562291
```

Confirming it's genuinely dangling: not referenced by any tree in any commit on any
branch:

```bash
for c in $(git rev-list --all); do
  git ls-tree -r "$c" 2>/dev/null | grep -q 12b14971 && echo "referenced in $c"
done
# (no output: the blob is unreachable from every commit)
```

## The leaked object

```bash
git cat-file -p 12b14971d38c09ee73fed80613951dfdd3562291
```

```
# Crownspire reliquary -- production warden's key. DO NOT COMMIT.
RELIQUARY_ENDPOINT=https://reliquary.crownspire.valyssar:9000
RELIQUARY_BUCKET=crownspire-reliquary-prod
AWS_ACCESS_KEY_ID=AKIACROWNSPIRE7WARD3N
AWS_SECRET_ACCESS_KEY=HTB{th3_r3l1qu4ry_n3v3r_f0rg3ts}
WARDEN_SIGNING_KEY=astrael-relic-sigil-2f9c
```

This is the original `.env` file, committed at some point before the `4c92bf1` gitignore
cleanup, later removed from tracking, but its blob content is still sitting untouched in
the object store, fully recoverable by hash.

## Flag

```
HTB{th3_r3l1qu4ry_n3v3r_f0rg3ts}
```

## Root cause & takeaway

`git rm` / deletion + `.gitignore` only affects future commits and the working tree; it
does not scrub history or the object database. Any blob ever committed remains recoverable
via its SHA: whether reachable from a branch tip, buried in earlier history, or fully
dangling: until the repository owner runs an explicit `git gc --prune=now` (and even then,
anyone who already cloned the repo keeps a full copy of the object). The only real fix for a
committed secret is rotation, not `.gitignore`.
