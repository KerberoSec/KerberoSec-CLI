# 04: SMB Enumeration

## Purpose

Check whether the web-side clue correlates with a username or password.

## Command

```bash
smbclient -L //10.158.174.179 -N
enum4linux -a 10.158.174.179smbclient //10.158.174.179/IPC$ -U <USERNAME>
```

## Parameters

\-L\ lists shares, \-N\ attempts anonymous access and \-a\ is broad enumeration mode.

## Finding

The local drafts state that anonymous SMB testing was performed and user information was correlated through SMB enumeration. Username and password values remain placeholders.

## Analysis

The SMB username and web clue were combined before testing the panel context.

## Defense

SMB logs may show anonymous listing and IPC$ session attempts. Disable guest access and require SMB signing.
