# Leviathan Level 6 → 7

## Objective
Find the password for leviathan7

## Approach
Found `leviathan6` binary requiring a 4-digit PIN.
Wrote a bash brute force loop iterating 0000 to 9999.
Script checked output for absence of "Wrong" string.
Found correct PIN: 7123: spawned leviathan7 shell.

## Commands Used
```bash
ls -la
./leviathan6 <4 digit code>
for i in {0000..9999}; do
  output=$(./leviathan6 $i 2>&1)
  if [[ ! "$output" =~ "Wrong" ]]; then
    echo "Found the PIN: $i"
    ./leviathan6 $i
    break
  fi
done
cat /etc/leviathan_pass/leviathan7
```

## What I Learned
- Bash loops can brute force numeric PINs efficiently
- Process substitution captures command output for comparison
- 4-digit PINs have only 10000 combinations: easily brute forced
- Always automate repetitive tasks with bash scripting
