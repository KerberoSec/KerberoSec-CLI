The challenge gives us a large OpenSatKit archive and says incident response believes the breach entry point came from information “somewhere within this archive.” The title “Follow the leak,” and the filename `opensatkit-badpush-student.zip` both suggest that the leak may have happened through Git history

First, list the archive contents:

```
tar -tf opensatkit-badpush-student.zip
```

Among the many project files, there is a full Git repository included:

```
student/.git/
student/.git/logs/HEAD
student/.git/objects/pack/...
student/.git/refs/...
```

That means we can extract the repository and inspect its history:

```
tar -xf opensatkit-badpush-student.zip -C work/extract student/.git student/.gitignore student/README.md
cd work/extract/student
git log --oneline --decorate --all --graph -n 50
```

The log contains a very suspicious commit:

```
260db5f9 cosmos:temp lab key
035b9b27 docs: incident report for credential scrub (history rewrite)
```

The incident report also confirms the intended path:

```
git show 035b9b27:docs/INCIDENT.md
```

It says a COSMOS credential was accidentally committed and that local reflogs may still reference the old commit.

Inspecting the suspicious commit shows the modified file:

```
git show --stat --name-status 260db5f9
```

Output:

```
M cosmos/.cdskeyfile
```

Then view the leaked file from that commit:

```
git show 260db5f9:cosmos/.cdskeyfile
```

It contains:

```
# NOTE: TEMPORARY: remove before flight
CDS_KEY=ZmxhZ3s1MHJyeV9XMTVoX1czX0MwdWxkX0cwXzcwXzdoM19NMDBuXzcwZzM3aDNyfQ==
```

The value is base64.
Decoding it:

```
[System.Text.Encoding]: ASCII.GetString(
  [System.Convert]: FromBase64String(
    'ZmxhZ3s1MHJyeV9XMTVoX1czX0MwdWxkX0cwXzcwXzdoM19NMDBuXzcwZzM3aDNyfQ=='
  )
)
```

Decoded result:

```
flag{50rry_W15h_W3_C0uld_G0_70_7h3_M00n_70g37h3r}
```

