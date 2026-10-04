# Obedient Cat Writeup
Very easy CTF to introduce complete begginers to the scene.

We start by getting the file in our webshell/terminal by doing:

    wget https://mercury.picoctf.net/static/0e428b2db9788d31189329bed089ce98/flag

The `wget` command downloads the file named "flag" in the link.

After that we just need to open the file, while there are many different ways to read it's contents in Linux the quickest and easiest way is by using the `cat` command that opens a file in our terminal.

So let's do `cat flag` and see what happens!

Wow! We found the flag! In your terminal you should see `picoCTF{s4n1ty_v3r1f13d_2fd6ed29}` and that's the flag to input in the picoCTF website.