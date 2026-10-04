## 🧠 Log Hunt
**Category:** General Skills

**Files/Links Provided:** ```server.log```

**Description:**  

```
Our server seems to be leaking pieces of a secret flag in
its logs. The parts are scattered and sometimes repeated.
Can you reconstruct the original flag? Download the logs
and figure out the full flag from the fragments.
```

**Steps to Solve:**  
1. Download ```server.log```.
2. Open a terminal within the directory of the log files location.
3. Use grep to find the flag parts.
4. Reconstruct the flag using the flag parts.

**Explanation:**

This challenge provides an extremely large log file that would be impractical to parse manually. Instead, grep, a Linux command-line tool, can be used to search for specific strings within files. Knowing that the flag is in the format of ```picoCTF{}```, grep can be used to search for ```picoCTF```, revealing that each part of the flag is stored under ```INFO FLAGPART:```. Finally, using grep again, searching for ```INFO FLAGPART:```, reveals all the flag parts, which can now be concatenated into the final flag.

**Code / Commands / Images**
```bash
# -i --ignore-case
grep "picoCTF" server.log -i

# -A 1 --after-context (1 line)
grep "INFO FLAGPART:" server.log -A 1 
```
[🏠 Back to Main Page](https://github.com/Greenest-Guy/CMU-Africa-picoMini-Writeup)
