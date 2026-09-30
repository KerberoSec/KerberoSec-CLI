```
PPPP  H   H  OOO  TTTTT  OOO  N   N       L      OOO   CCC  K   K DDDD   OOO  W   W N   N 
P   P H   H O   O   T   O   O NN  N       L     O   O C   C K  K  D   D O   O W   W NN  N 
PPPP  HHHHH O   O   T   O   O N N N       L     O   O C     KKK   D   D O   O W W W N N N 
P     H   H O   O   T   O   O N  NN       L     O   O C   C K  K  D   D O   O W W W N  NN 
P     H   H  OOO    T    OOO  N   N       LLLLL  OOO   CCC  K   K DDDD   OOO   W W  N   N 
```
We have located the adversary's location and must now secure access to their Optical
Network Terminal to disable their internet connection. Fortunately, we have obtained a
copy of the device's firmware, which is suspected to contain hardcoded credentials. [^1]

Can you extract the password from it?
-----------------------------------------------------------------------------------------
First, we verify that the downloaded ZIP file has the correct SHA-256 check sum with the
`sha256sum -c` command. Then, we extract the ZIP archive with the given password and are
given three files, in the `ONT/` folder. Using the `file` command, we can now find out
that there are two text files, containing a firmware and hardware version number and a
*SquashFS* filesystem `rootfs`. Then, we research how to mount such a filesystem and see
that we can either use the `squashfuse` [^2] or `mount` [^3] command as follows:
```bash
mkdir /tmp/rootfs-squash                                                      
sudo mount --type="squashfs" --options="loop" --source="rootfs" --target="/tmp/rootfs-squash"
```
After browsing the filesystem manually for a while, we decide to search for the guessed
flag with `grep -rI "HTB*"` and thus get a hit in the file `etc/config_default.xml` with
the flag value for the "SUSER_PASSWORD" name. Finally, we can unmount the SquashFS
filesystem as we don't need it anymore: `sudo umount --type="squashfs" /tmp/rootfs-squash`

[^1]: https://app.hackthebox.com/challenges/Photon%2520Lockdown?tab=play_challenge
[^2]: https://man.archlinux.org/man/squashfuse.1.en
[^3]: https://www.baeldung.com/linux/squashfs-filesystem-mount
