# CSIRT-MU Writeups

This page contains CTF writeups and blog posts created by the CSIRT-MU Threat Management team. All content is provided "as is" for educational purposes only.

Feel free to contribute by submitting pull requests with new writeups or improvements to existing ones.

## Mirror

The branch `publish` is automatically mirrored to [https://github.com/CSIRT-MU/writeups](https://github.com/CSIRT-MU/writeups).

Merge from master to publish to trigger the mirroring.

## MR Workflow

## Team review

This first MR is used to review the content, styling etc.

1. Create a new branch (e.g. `dev`) from `master` for your changes.
2. Push your changes to the `dev` branch.
3. Create a Pull Request from `dev` to `master`.

## Team lead acknowledgment

After merge, the team lead reviews and acknowledges that the post can be published publicly.

1. Create MR from `master` to `publish`.
2. Team lead reviews and merges the MR to `publish`.

## Deploy

```bash
poetry install
poetry run mkdocs build -d public
python -m http.server --directory public 8000
```

## Content

Markdown documents should have the following metadata at the top:
```
---
authors:
    - <author name>
date: <DD-MM-YYYY>
---
```