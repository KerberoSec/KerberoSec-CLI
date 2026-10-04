# SpookyPass Writeup

> Category : Reversing

> All the coolest ghosts in town are going to a Haunted Houseparty: can you prove you deserve to get in?

## Solution

```shell
wget -O spooky "https://labs.hackthebox.com/api/v4/challenge/download/806?auth_user_id=3179731&expires=1788531902&signature=24749d975d12713ae3ee018fdafb8ec2a42fe50d713d9f54514cbc51c9ec0d82"
```

```shell
unzip spooky
hackthebox
```

```shell
cd rev_spookypass
```

```shell
file pass
```

```text
pass: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3008217772cc2426c643d69b80a96c715490dd91, for GNU/Linux 4.4.0, not stripped
```

```shell
./pass
```

We need a password to enter.

```shell
strings pass
```

```text
Before we let you in, you'll need to give us the password: 
s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
```

That's it.

```shell
./pass
s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
```

```text
HTB{un0bfu5c4t3d_5tr1ng5}
```

