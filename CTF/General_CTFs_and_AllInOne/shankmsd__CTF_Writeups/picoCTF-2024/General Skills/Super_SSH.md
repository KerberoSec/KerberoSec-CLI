## Challenge 🧩

Using a Secure Shell (SSH) is going to be pretty important.
Can you ssh as ctf-player to titan.picoctf.net at port XXXXX to get the flag?
You'll also need the password XXXXXXXX. If asked, accept the fingerprint with yes.

If your device doesn't have a shell, you can use: <https://webshell.picoctf.org> </br>
If you're not sure what a shell is, check out our Primer: <https://primer.picoctf.com/#_the_shell>

Author: JEFFERY JOHN</br>
Points: 25

Hints:

1. <https://linux.die.net/man/1/ssh>
2. You can try logging in 'as' someone with <user>@titan.picoctf.net
3. How could you specify the port?
4. Remember, passwords are hidden when typed into the shell

## Solution 🕵️‍♂️

```bash
┌──(user㉿shell)-[~]
└─$ ssh ctf-player@titan.picoctf.net -p XXXXX
Are you sure want to continue connecting(yes/no[fingerprint])? yes
ctf-player@titan.picoctf.net's password:
Welcome ctf-player, here's your flag: picoCTF{s3cur3_c0nn3ct10n_xxxxxxxx}
```

## Flag 🚩

`picoCTF{s3cur3_c0nn3ct10n_xxxxxxxx}`
