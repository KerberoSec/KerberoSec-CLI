# Ninja Skills

Classic `find` command exercise I say. 

## Short Summary. 

We have 10 files to find and identify the `wc`, which contains `IP` address and `shasum1`.

I found the file location using `find` command. Something like this. 

files

```jq 
8V2L bny0 c4ZX D8B3 FHl1 oiMO PFbD rmfX SRSq uqyw v2Vb X1Uy
```

```bash
find / \( -name "8V2L" -o -name "bny0" -o -name "c4ZX" -o -name "D8B3" -o -name "FHl1" -o -name "oiMO" -o -name "PFbD" -o -name "rmfX" -o -name "SRSq" -o -name "uqyw" -o -name "v2Vb" -o -name "X1Uy" \) 2>/dev/null
```

Now I found the file localtion, to find whether which file contains IP address, simply: 

```bash

grep -E '([0-9]{1,3}\.){3}[0-9]{1,3}' /mnt/c4ZX /mnt/D8B3 /var/FHl1 /opt/oiMO /opt/PFbD /media/rmfX /etc/ssh/SRSq /var/log/uqyw /home/v2Vb /X1Uy
```

To find the file which has the shasum1 of `9d54da7584015647ba052173b84d45e8007eba94`

```bash
sha1sum /mnt/c4ZX /mnt/D8B3 /var/FHl1 /opt/oiMO /opt/PFbD /media/rmfX /etc/ssh/SRSq /var/log/uqyw /home/v2Vb /X1Uy | grep "9d54da7584015647ba052173b84d45e8007eba94"

```

For executable

```bash
ls -lh /mnt/c4ZX /mnt/D8B3 /var/FHl1 /opt/oiMO /opt/PFbD /media/rmfX /etc/ssh/SRSq /var/log/uqyw /home/v2Vb /X1Uy /etc/8V2L
```

-----
