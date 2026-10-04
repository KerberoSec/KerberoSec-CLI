# Invoice Without a Bank

**Category:** Junior Crypto (Forensics-ish) **Points:** 112 **Author:** @vvanuss

## TL;DR

Dig through a pile of `.eml` files, find the fake bank invoice email, grab the PDF attachment name and the subject ID, slap 'em together.

```
grodno{Vl6s3kCIKaUvwaUAeY.pdf_6ZFYeMmltso}
```

## The Setup

We're handed a zip full of `.eml` files: basically a mailbox dump:

```bash
unzip Invoice\ Without\ a\ Bank.zip
cd invoice-without-a-bank
ls emails/
```

Ten sample emails, presumably one of them is our phishing target dressed up as a "banking notification" with a PDF invoice attached.

## Finding the Email

The prompt tells us the subject line follows the pattern `Fatura Emitida - <id>` ("Invoice Issued" in Portuguese). Easiest move: just grep for it across all the emails.

```bash
grep -l "Fatura Emitida" emails/*.eml
```

```
emails/sample-717.eml
```

One hit. That's our email.

## Pulling the Subject ID

```bash
grep -i "^Subject:" emails/sample-717.eml
```

```
Subject: Fatura Emitida - 6ZFYeMmltso
```

Nice and plain, no MIME encoding to fight with. ID is `6ZFYeMmltso`.

## Pulling the Attachment Filename

```bash
grep -i "filename" emails/sample-717.eml
```

```
filename="Vl6s3kCIKaUvwaUAeY.pdf"
```

Since these phishing kits love to hide malicious extensions behind unicode tricks (RTL overrides, lookalike chars, etc.), it's worth double-checking with Python instead of trusting a raw grep on a possibly-encoded header:

```bash
python3 -c "
import email
msg = email.message_from_file(open('emails/sample-717.eml'))
for part in msg.walk():
    fn = part.get_filename()
    if fn:
        print(repr(fn))
"
```

```
'Vl6s3kCIKaUvwaUAeY.pdf'
```

Clean: no hidden characters, it really is just a `.pdf`. Good, no extra tricks to untangle here.

## Assembling the Flag

Format is `grodno{filename_subjectid}`, so:

```
grodno{Vl6s3kCIKaUvwaUAeY.pdf_6ZFYeMmltso}
```

Submitted, correct. ✅

## Takeaways

- When a challenge gives you a mailbox dump, `grep -l` on a distinctive phrase is usually faster than opening every file by hand.
- Always sanity-check attachment filenames with something that shows raw repr: phishing attachments love unicode tricks to disguise real extensions, even if this particular sample didn't use any.
