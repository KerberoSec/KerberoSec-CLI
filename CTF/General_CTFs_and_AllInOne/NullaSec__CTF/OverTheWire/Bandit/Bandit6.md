### Bandit 6 → 7

**Level Goal:**  
The password for the next level is stored somewhere on the server and has all of the following properties:

- owned by user bandit7
- owned by group bandit6
- 33 bytes in size

**Commands Used:**  
- `find` → search for files by conditions
- `cat` → read the contents of a file  

**Steps:**
```bash
find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null

cat /var/lib/dpkg/info/bandit7.password
```
**Explanation:**

This problem leads us to the world of file permissions and ownership in Linux, a very important topic that will be useful for all our future CTF endeavours.

We can see who owns a file and what group it belongs to using the `ls -l` command on a directory, where the third column shows the user and the fourth shows the group that owns the file.

Since the file is somewhere on the server and we don't know where, the only option is to use `find` to find it. The solution is similar to the previous problem, but the filters are different:

- `-type f` because we are looking for a file
- `-user bandit7` to find files owned by the ‘bandit7’ user
- `-group bandit6` to find files owned by the ‘bandit6’ group
- `-size 33c` to find files of size 33 bytes

The final command looks like this `find / -type f -user bandit7 -group bandit6 -size 33c 2>/dev/null` and we added the last part because it removes all the "permission denied errors" that we get in this case, making for a cleaner result.

The command outputs `/var/lib/dpkg/info/bandit7.password` and the password for the next level is inside that file.

**Solution:**
```
morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj
```

