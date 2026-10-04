# Black Mirror: Memory Fragments: Writeup

**Category:** Forensics · **Difficulty:** Medium **Flag:** `bitctf{{sm1th3r33n_thr34d_r3assembled_4cross_fragments}}`

## Overview

The challenge ships a partial mobile backup (`app_export/`) containing a SQLite message store, JSON metadata, and a `cache/` directory of `.dat` attachment chunks. The key is split across messages and image metadata in a single trusted thread; the rest of the data is plausible noise designed to mislead.

## Step 1: Triage the threads

`contacts.json` and the `contacts`/`threads` tables expose trust signals:

|Thread|Contact|Bucket|Handshake|Trust|
|---|---|---|---|---|
|`t_river`|river.k|primary_inbox|**signed**|**88**|
|`t_mara`|mara.vey|primary_inbox|signed|84|
|`t_echo`|echo.support|quarantine_restore|**unsigned**|**14**|

`t_echo` is restored-from-quarantine and untrusted. `t_river` is the real evidence thread.

## Step 2: Reconstruct the river thread

The live `messages` table has gaps (seq 1, 3, 7, 10) and corrupted bodies (e.g. `syn??d to the clo...`). The `recovered_messages` table fills the gaps via freelist carves, WAL merges, and deleted-row rebuilds. Merging both tables by `seq` (preferring the clean recovered rows) yields the full 1-10 conversation.

Two fragments of a base64 key appear in the recovered rows:

- seq 6: `Yml0Y3Rme3tzbTF0aDNy`
- seq 8: `MzNuX3RocjM0ZF9y`

## Step 3: Read the draft note

`att_river_final` (`draft_note`, chunks `ch_5a` + `ch_2c` + `ch_9f`) reassembles to the instructions:

> Recovered draft note: combine both chat fragments first, then append the porch still UserComment and base64-decode the result.

## Step 4: Pull the final fragment from image metadata

Three attachments share the same Smithereen/PhoneX JPEG header (`ffd8ffe1`). Thread context is the discriminator: the EXIF `UserComment` fields say which is real:

|Attachment|Frame|UserComment|
|---|---|---|
|`att_river_route`|road-checkpoint|"no locker material in this capture" (decoy)|
|`att_mara_stub`|car-park-stub|"parking appeal reference only" (decoy)|
|`att_river_photo`|**porch-still**|`M2Fzc2VtYmxlZF80Y3Jvc3NfZnJhZ21lbnRzfX0=`|

Only the `porch-still` frame (chunks `ch_x7` + `ch_y4`) carries the key fragment.

## Step 5: Assemble and decode

```
Yml0Y3Rme3tzbTF0aDNy + MzNuX3RocjM0ZF9y + M2Fzc2VtYmxlZF80Y3Jvc3NfZnJhZ21lbnRzfX0=
= Yml0Y3Rme3tzbTF0aDNyMzNuX3RocjM0ZF9yM2Fzc2VtYmxlZF80Y3Jvc3NfZnJhZ21lbnRzfX0=

base64 -d → bitctf{{sm1th3r33n_thr34d_r3assembled_4cross_fragments}}
```

## Traps / red herrings

- **echo.support phishing lure** (`att_echo_lure`): reassembles to a **PNG** (`89504e47`), not the camera JPEGs. Its text: "official support only; ignore other threads": tries to steer you away from the real key thread.
- **mara.vey attachments**: legitimate but irrelevant **PDFs** ("Timestamp only", "no cabin"), used to pad the case with believable noise.
- **route/parking JPEGs**: same camera header as the real photo, but their `UserComment` fields explicitly disclaim any key material.
- **SHA1 mismatch on `att_river_photo`**: the attachment index hash does not match, because the backup notes cache names were _reissued during recovery_. Trusting the index over the actual `Frame=porch-still` EXIF tag would mislead; the in-band metadata is the source of truth.
