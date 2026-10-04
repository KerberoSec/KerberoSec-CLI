# Permissions Writeup

I have to admit this problem finally broke me and I had to check a writeup after the competition ended because I never did a Privilege Escalation CTF.

This said, I started by connecting to the machine using the ssh address it provided me, after looking around for a bit I concluded that only the Vim (vi) editor was accessible for me by doing `sudo -l` to check for permissions.

*[Image: image info]*

This is where I got stuck, never knew you could privesc with Vim lmao.

After checking the writeup I did `!sh` on Vim to open a shell and that's how I entered the root user.

Then it was quite simple, `ls /root` didn't show anything so I did `ls -a /root` to show the hidden files and there was a `.flag.txt`.

Opening it by doing `cat /root/.flag.txt` revealed to us `picoCTF{uS1ng_v1m_3dit0r_1cee9dcb}`.