# Withered Registry

| Field | Details |
|-------|---------|
| **Challenge** | Withered Registry |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Secure Coding |
| **Flag** | `HTB{h0us3_0f_3mb3rs_4nd_4sh_25e31844d0486234e2a173082a100db2}` |

---

## Overview

A "patch the vuln" secure-coding challenge built as a mock Git-hosting site
(`SecureCoding` platform). The repo `administrator/core_application` holds a Go
backend for a medieval-flavored "Registry" app: houses, scribes, decrees, and
crown writs: plus an Android field-client APK. The task: find the real
authorization bug, patch it on a `developer` branch, and push. A bot reviews
the diff, and once a patch is accepted it goes through automated hard-score
testing (build, functionality, security) against the live instance. Passing
both the soft-score minimums and a full hard score unlocks `/flag`.

```
Access:
  http://[IP]:[PORT]/           SecureCoding repo browser (commits, PRs, README)
  http://[IP]:[PORT]/app/       the running Withered Registry app
  http://[IP]:[PORT]/flag       scoring + flag endpoint
  git clone http://htb_developer:HTBDeveloperPassword@[IP]:[PORT]/git/core_application.git
```

## Recon

Cloning the repo gives a Go service under `registry-backend/`:

```
registry-backend/
|-- cmd/registry/       # entry point
|-- internal/config/    # runtime configuration
|-- internal/server/    # HTTP, session, signing, and authorization logic
|-- internal/store/     # SQLite data access
```

The story frames it directly: a "forbidden recognition" (crown standing) shows
up against House Ash-Vault with no authorized hand admitting they invoked it.
That maps onto one workflow in the code: `POST /rite/recognise`, which raises
a house to crown standing: the exact action a "false lineage" attacker would
want.

### The request-signing layer

Requests from the Android field client are signed with an HMAC carried in
`X-Slate-Ts` / `X-Slate-Seal` headers (`internal/server/signing.go`):

```go
canonical = ts "\n" METHOD "\n" path "\n" hex(sha256(body))
seal      = hex(hmac_sha256(SLATE_KEY, canonical))
```

`verifySeal` correctly checks staleness and does a constant-time `hmac.Equal`
compare: this part is solid on its own. The interesting question is *what*
that signature is being trusted to authorize.

### The authorization gap

`internal/server/routes.go`: `handleRecognise`:

```go
func (s *Server) handleRecognise(w http.ResponseWriter, r *http.Request) {
	if !s.requireSlate(w, r) {
		return
	}

	var body recogniseRequest
	if r.Body != nil {
		_ = json.NewDecoder(r.Body).Decode(&body)
	}
	house := targetHouse(r, &body) // query param, else JSON body

	p, _ := principalFrom(r)
	writ, err := s.store.GrantCrownWrit(house, p.Username)
	...
```

Compare this to every other house-scoped handler in the same file
(`handleDecrees`, `handleDecree`), which all call:

```go
if !ownsHouse(p, house) { ... 403 ... }
```

`handleRecognise` skips that check entirely. The only two gates are
`requireSession` (any logged-in scribe) and `requireSlate` (any request
carrying a valid HMAC signature). Neither restricts *which* house the caller
can recognise: `house` comes straight from a client-controlled `house_id`
(query string or JSON body).

`internal/store/store.go` even says so out loud:

```go
// GrantCrownWrit raises a house to crown standing and records the writ. The
// caller is responsible for deciding whether the grant is authorized; this
// method only performs the write once that decision has been made.
```

The caller never makes that decision. Any authenticated scribe: from any
house: who can produce a valid slate seal can call `/rite/recognise` with
`house_id=ashvault` and grant House Ash-Vault crown standing, with the writ
recorded as `granted_by` themselves. The slate key is meant to be recovered
from the distributed APK (`registry.apk`, referenced in the README as "the
Android field client"), which is exactly the kind of asset a low-privileged
actor (Vaultrune, in the story) would extract and reuse.

Existing tests only ever exercised the *legitimate* path: a scribe
recognising their own house, so the missing cross-house check had no
coverage at all.

## Patch attempt #1: ownership check (rejected)

The obvious first fix: keep the request-supplied `house_id`, but check the
caller actually owns it, exactly like the decree handlers do:

```go
p, _ := principalFrom(r)
if !ownsHouse(p, house) {
	writeJSON(w, http.StatusForbidden, map[string]string{
		"error": "a scribe may only seal a crown writ for the house they serve",
	})
	return
}
```

The review bot rejected this one:

> "the privileged action is still scoped using a house identifier derived
> from request input. That keeps the trust boundary in the wrong place...
> Rework the flow so the target house is derived from the authenticated
> principal (server-side), and treat the client seal as an
> integrity/anti-tamper requirement rather than the deciding factor for
> authority."

Fair callout: an ownership check bolted onto attacker-controlled input is
still one missed code path away from the same bug reappearing (e.g. a second
request channel reading `house_id` from a path param later on). The trust
boundary should never let the request decide *what* is being authorized,
only carry proof the request is intact.

## Patch attempt #2: derive scope from the session (accepted)

Drop `house_id` from the handler entirely. The target house is always the
one already bound to the caller's verified session:

```go
func (s *Server) handleRecognise(w http.ResponseWriter, r *http.Request) {
	if !s.requireSlate(w, r) {
		return
	}

	p, ok := principalFrom(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "a scribe session is required",
		})
		return
	}
	house := houseOf(p)

	writ, err := s.store.GrantCrownWrit(house, p.Username)
	...
```

Now the slate seal only proves the request came from an intact, un-tampered
field-slate call (integrity), while *authority* comes solely from the
session the relay itself issued at login: a value no request parameter can
influence. Added a regression test asserting that a requested
`house_id=ashvault` (query **and** body) from a `rookhold` scribe's session
is silently ignored and the writ still lands on `rookhold`.

```
$ go test ./...
ok  	git.witheredregistry.realm/registry/internal/server	0.53s
```

## Submission

```
git checkout -b developer
git add internal/server/routes.go internal/server/server_test.go
git commit -m "Derive crown recognition target from the session, not request input"
git push -u origin developer
```

Pushing to `developer` auto-opens a PR, reviewed by the SecureCoding bot:

> "Scope is now derived from the authenticated principal rather than any
> client-controlled field, which closes the cross-scope grant risk and
> aligns with the intended trust model. The slate seal remains a required
> anti-tamper gate, but no longer drives authorization."

PR accepted → hard-score testing kicks off automatically → `HARD CORE TESTING
HAS SUCCESSFULLY PASSED!`.

```
$ curl -s http://[IP]:[PORT]/flag
{
  "STATUS": "SOLVED",
  "FLAG": "HTB{h0us3_0f_3mb3rs_4nd_4sh_25e31844d0486234e2a173082a100db2}",
  "MESSAGE": "Congratulations on getting the flag!",
  "HARD_SCORE": 60,
  "SOFT_SCORE": {"code_quality": 14, "security_reasoning": 13, "patch_correctness": 9}
}
```

## Key takeaways

- **Request-signature verification is not authorization.** A valid HMAC over
  the request proves the caller possesses a key (integrity/authenticity of
  the message): it says nothing about whether the *content* of that message
  (an arbitrary `house_id`) should be trusted for a privileged decision.
- **Authorization scope should come from server-owned state, never client
  input**, even when that input is protected by an ownership check. An
  `ownsHouse(p, house)` guard bolted onto a request-supplied `house` still
  leaves the trust boundary one refactor away from silently reopening (a new
  route, a new input channel reading the same field). Deriving the scope
  directly from the session removes the class of bug rather than one
  instance of it.
- **A doc comment admitting the gap is a signal, not a mitigation.**
  `GrantCrownWrit`'s comment ("the caller is responsible for deciding
  whether the grant is authorized") correctly named the missing control: the bug was that no caller actually implemented it.
