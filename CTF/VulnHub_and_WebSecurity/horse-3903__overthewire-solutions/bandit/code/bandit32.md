# Bandit 32 Solution

### Steps

1. **Break out of the Uppercase Shell**
   - Reference to normal shell with `$0`
     ```bash
     WELCOME TO THE UPPERCASE SHELL
     >> $0
     ```

2. **Get current profile**
   - Find current profile with `whoami`
     ```bash
     $ whoami
     bandit33
     ```

3. **Retrieve the password**
   - Find current password for bandit33 in `/etc/bandit_pass`
     ```bash
     $ cat /etc/bandit_pass/bandit33
     odHo63fHiFqcWWJG9rLiLDtPm45KzUKy
     ```