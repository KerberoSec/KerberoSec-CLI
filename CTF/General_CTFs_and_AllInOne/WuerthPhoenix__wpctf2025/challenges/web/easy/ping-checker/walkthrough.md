# PingChecker Pro (by @DOLO & @TELU)

## Challenge

The challenge presents a network diagnostic tool with input filtering.
The application executes ping commands with security restrictions to prevent command injection.

The application performs command execution:
```bash
ping -c 4 $hostname
```

To retrieve the flag, the attacker must bypass input filters and perform system enumeration.

## The Bug

The application implements blacklist-based filtering but misses single ampersand (`&`) for background execution.

Common injection methods are blocked:
- `;` (semicolon)
- `&&` (double ampersand)  
- `||` (logical OR)
- `|` (pipe)
- `$()` (command substitution)
- Backticks
- Newline characters (all variants)
- Common file reading commands

However, single `&` for background execution remains unfiltered.

## From Command Injection to Flag

### Idea

With single `&`, commands execute in background parallel to ping:
```bash
ping -c 4 127.0.0.1 & whoami
```

Since common file readers are blocked, alternative commands like `grep`, `sort`, and `awk` must be used.

### Some Problems

- Multiple security filters block obvious attack vectors
- File reading commands are restricted
- Flag is split across multiple files requiring enumeration
- Discovery path must be found through application hints

### Exploitation

The flag is split into two parts across different locations:

1. **Discovery Phase**: HTML comments reveal initial path after successful ping
2. **Part 1 Extraction**: Configuration file contains first part and references to second location
3. **Part 2 Extraction**: Base64-encoded data must be identified and decoded

```bash
# Test injection
127.0.0.1 & whoami

# Enumerate discovered path
127.0.0.1 & ls /var/backups

# Extract configuration
127.0.0.1 & grep . /var/backups/system.conf

# Follow references to find second part
127.0.0.1 & grep . /opt/logs/data.log

# Decode and combine parts
```

### Key Observations

- HTML source contains developer comments (visible only after successful ping)
- Configuration files use variable references requiring analysis
- Base64 encoding requires recognition without explicit labels
- Multiple decoy files require proper enumeration

## Flag

`WPCTF{mult1_st3p_c0mm4nd_1nj3ct10n_r3qu1r3s_cr34t1v1ty}`