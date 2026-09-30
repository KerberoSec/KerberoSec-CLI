# Bandit 25 Solution (Second Half)

### Steps After Receiving SSH Key

1. **Receive the SSH Key**
   - Obtain the private SSH key named `bandit26.sshkey`.
     ```bash
     cat bandit26.sshkey
     ```

2. **Attempt SSH Connection**
   - Try to establish an SSH connection to the target server
     ```bash
     ssh -i bandit26.sshkey -l bandit26 -p 2220
     ```
   - Note: This connection will be closed due to the execution of `/usr/bin/showtext`

3. **Exploiting the Vulnerability**
   - As the content of `text.txt` is short, `more` doesn't enter interactive mode immediately
   - We need to resize the terminal window to trigger it

4. **Accessing Vim**
   - When `more` enters interactive mode, use `v` to open the file in Vim

5. **Escalating Privileges**
   - Within Vim, execute the following commands:
     ```vim
     :set shell=/bin/bash
     :shell
     ```
   - This sets the default shell to `/bin/bash` and spawns a shell with privileges

6. **Retrieve Password**
   - Now with a shell, you can access the password file for `bandit26`
     ```bash
     $ cat /etc/bandit_pass/bandit26
     ```
   - This command reveals the password for the next level