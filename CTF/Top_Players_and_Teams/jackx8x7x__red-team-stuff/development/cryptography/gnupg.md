# GnuPG

## Overview

### Keypair

A user has a primary keypair and _zero or more additional subordinate keypairs_ in PGP. The primary and subordinate keypairs are bundled to facilitate key management and the bundle can often be considered simply as one _keypair_.

Primary and subordinate private keys are protected by a passphrase.

A primary key must be capable of making signatures.

{% embed url="https://gnupg.org/gph/en/manual.html#AEN26" %}

### Options

_Long_ options can be put into file `~/.gnupg/gpg.conf`.

### Files

* `~/.gnupg/pubring.kbx`
* `~/.gnupg/trustdb.gpg`
* `~/.gnupg/gpg.conf`

## Key Management

### Keypair

A key is associated with a user ID which is constructed by `gpg`, from Real Name, Comment and Email Address in this form:

`Heinrich Heine (Der Dichter) heinrichh@duesseldorf.de`

We can list keys from the configured public keyrings, if no keys are specified.

```bash
$ gpg --list-keys
```

We can use the option `--gen-key` to generate a new primary keypair, which must be capable of making signatures; thus only three options are available:

{% tabs %}
{% tab title="Option1" %}
In this option, `gpg` creates two keypairs.

* A DSA keypair is the primary keypair usable only for making signatures.
* An ElGamal subordinate keypair is also created for encryption.
{% endtab %}

{% tab title="Option2" %}
Creates only a DSA keypair.
{% endtab %}

{% tab title="Option4" %}
In this option, `gpg` creates a single ElGamal keypair usable for signatures and encryption.
{% endtab %}
{% endtabs %}

It is possible to add additional subkeys for encryption and signing later.

```bash
$ gpg --gen-key
```

{% embed url="https://gnupg.org/gph/en/manual.html#MANAGEMENT" %}

### Revocation Certificate

A revocation certificate can be published to notify others that the public key should no longer be used when:

* passphrase forgotten
* the private key is compromised
* the private key is lost

> The certificate should not be accessed by others since anybody can publish the revocation certificate and render the corresponding public key useless.

We can generate a revocation certificate for the primary public key using the option `--gen-revoke`:

```bash
$ gpg --output revoke.asc --gen-revoke <key_specifier>
$ gpg --output revoke.asc --gen-revoke tartar@example.com
```

The key specifier will be

* the key ID of your primary keypair
* any part of a user ID that identifies your keypair.

### Key Exchange

As `--gen-revoke` option, we can export the key by specifying the key ID or any part of the user ID.

```bash
$ gpg --output alice.gpg --export <key_specifier>
$ gpg --armor --export tartar
```

We can import key using `--import`.

```bash
$ gpg --import someone.gpg
```

### Output

`gpg` supports a command-line option `--armor` that causes output to be generated in an ASCII-armored format for most `gpg` output.

## Cryptography Operations

With `pgp`, we can encrypt, sign, or verify the corresponding given files. Here're some examples listed in the manpage `GPG(1)`.

<pre class="language-bash" data-overflow="wrap"><code class="lang-bash"># sign and encrypt for user Bob
<strong>$ gpg --sign --encrypt --recipient Bob file
</strong><strong>$ gpg -se -r Bob file
</strong><strong>
</strong><strong># make a cleartext signature
</strong>$ gpg --clear-sign file

# make a detached signature
$ gpg --sign --detach-sign file
$ gpg -sb file

# make a detached signature with the key 0x12345678
$ gpg -u 0x12345678 -sb file

# Verify the signature of the file but do not output the data unless requested. The second form is used for detached signatures, where sigfile is the detached signature (either ASCII armored or binary) and datafile are the signed data; if this is not given, the name of the file holding the signed data is constructed by cutting off the extension (".asc" or ".sig") of sigfile or by asking the user for the filename. If the option --output is also used the signed data is written to the file specified by that option; use: to write the signed data to stdout.
$ gpg --verify pgpfile gpg --verify sigfile [datafile]
</code></pre>
