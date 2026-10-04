# Contributing

## Scope

This repository publishes **sanitized, public-safe security notes and writeups**.

Contributions should improve clarity, correctness, structure, taxonomy, metadata, sanitization, and publication safety.
This repository is **not** a place for posting raw target data, private engagement details, full exploit chains, secrets, credentials, or unsanitized operational material.

## Core rules

- Keep changes minimal and reviewable.
- Preserve the repository's public-safe publishing boundary.
- Prefer methodology, defensive framing, and reproducible explanation over raw operational detail.
- Do not add real target identifiers, secrets, credentials, private infrastructure details, or personally identifying information.
- Use repository placeholders consistently, such as `TARGET_IP`, `example.com`, `USER_A`, and other documented safe-writing conventions.
- Do not expand a note in ways that turn it into a step-by-step offensive guide beyond repository scope.

## Acceptable contribution types

- Content corrections
- Clarity improvements
- Structure and taxonomy improvements
- Broken link or outdated reference fixes
- Sanitization improvements
- Placeholder consistency fixes
- Metadata and front matter cleanup
- Documentation improvements for repository policy or workflow

## Not acceptable here

- Third-party vulnerability disclosure
- Requests for exploit development
- Raw lab dumps without sanitization
- Full challenge solutions where publication would conflict with platform rules
- Sensitive screenshots, logs, IPs, domains, usernames, paths, tokens, or identifiers
- Changes unrelated to the repository's public documentation purpose

## Before opening a pull request

Please check the following:

- The change fits the repository's publication boundary.
- The note remains sanitized after the change.
- Placeholder names are consistent.
- Front matter and taxonomy remain valid.
- The change is narrowly scoped and easy to review.

## Pull request expectations

A good pull request should include:

- What was changed
- Why the change is needed
- Which files or note families are affected
- Whether sanitization or placeholder handling was touched
- Whether taxonomy, metadata, or structure was changed

## Style expectations

- Keep language precise and technical.
- Prefer minimal edits over broad rewrites unless a structural change is explicitly intended.
- Keep repository conventions intact for naming, front matter, placeholders, and note organization.
