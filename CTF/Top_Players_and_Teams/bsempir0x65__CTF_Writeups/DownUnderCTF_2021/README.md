# General Skills Quiz

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/General%20Skills%20Quiz.JPG" alt="General Skills Quiz" width="50%" height="50%">

 As with every Challenge you face in life you start at the beginning. Therefor we came up with the following plan:

- [ ] Figure out what to do
- [ ] Execute the exploit
- [ ] Drink something <g-emoji class="g-emoji" alias="tada" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji>

According to the hint we shall answer some easy questions so we started a netcat session as described and see what happens.
Disclaimer: Never connect to something you don't know. So maybe not the best habbit to have. But what could possible go wrong <g-emoji class="g-emoji" alias="australia" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f1e6-1f1fa.png">🇦🇺</g-emoji>

After realizing it doesn't download a virus directly we started the game manually. We managed to reach step 4 before the connection got closed. We received:

> Welcome to the DUCTF Classroom! Cyber School is now in session!
> Press enter when you are ready to start your 30 seconds timer for the quiz... 
> Woops the time is always ticking...
> Answer this maths question: 1+1=?
> 2
> Well I see you are not a bludger then.
> 
> Decode this hex string and provide me the original number (base 10): 0xde
> 222
> You're better than a dog's breakfast at least.
> 
> Decode this hex string and provide me the original ASCII letter: 4d
> M
> Come on this isn't hard yakka
> 
> Decode this URL encoded string and provide me the original ASCII symbols: %21%2A%2B

After playing the games a few more times, we realized that:
* The timer at the beginning was no joke 

\(Yes we were sure that we don't drop the connection on our side\)
* The given values were randomly generated
* Manually solving the task is not humanly possible and our mate Kratos was not available <img src="https://upload.wikimedia.org/wikipedia/en/6/60/Kratos_PS4.jpg" alt="Kratos" width="4%" height="4%">

Now we thought the goal is to answer all questions to get the flag. So we needed someone who is smarter and faster than we are and since kratos was still not available <audio controls> <source src="https://upload.wikimedia.org/wikipedia/commons/3/35/Sad_Trombone-Joe_Lamb-665429450.ogg" type="audio/ogg"></audio>

we settled for the next best thing.  <g-emoji class="g-emoji" alias="computer" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4bb.png">💻</g-emoji>

But First let us to the best thing:

- [x] Figure out what to do

Fells so good to cross things from lists, i mean to complete the first step.

So based on our google researches and experience with other ctf writeups from the past, we decided to use our favorite <g-emoji class="g-emoji" alias="snake" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f40d.png">🐍</g-emoji> called Py-thron and the frame work [pwntools](https://docs.pwntools.com/en/stable/) Note: pwntools is <u>not</u> installed by default in kali

```python
#!/usr/bin/python3

from pwn import *
```
<b>Find the full script under solve.py</b>

We found as always all our answers on github to get started with pwntools [tutorial](https://github.com/Gallopsled/pwntools-tutorial/blob/master/tubes.md) to initialize a session and get a basic understanding how the framework works. So let us extend the script.
```python
io = remote('pwn-2021.duc.tf', 31905)
```
Based on the first trys we saw that every instruction ends with a ":" followed by the variable to work on. To reflect this behaviour we filtered for the variable by doing this:
```python
test = io.recvuntil(": ")

print(test)

test = io.recvline()

print(test[:-1])
```
Note: Yes we used a lot of prints cause no one told us that there is an interactive command for the remote object.

At this stage we were able to receive the messages from the server so our structure for sending messages is:
```python
io.sendline(variable) 
```
With this toolkit we were able to play the game via the script and could start to get the next questions. But before that please have a look into the code snipet for the initial steps (Yes we like our work):
```python
#answer for Answer this maths question: 1+1=?
io.sendline("2")
#Decode this hex string and provide me the original number (base 10):
hexvar = int(test[:-1],0)
print(hexvar)
hexvar2 = str(hexvar)
print(hexvar2)
io.sendline(hexvar2)
#decode this hex string and provide me the original ASCII letter:
hexascii = (test[:-1]).decode("ascii")
print(hexascii)
hexasciibyte = bytes.fromhex(hexascii)
print(hexasciibyte)
hexascii_string = hexasciibyte.decode("ASCII") #Yes nested functions are not our friends thank you, LOL
print(hexascii_string)
io.sendline(hexascii_string)
#Decode this URL encoded string and provide me the original ASCII symbols: 
url = urldecode(test[:-1].decode("utf-8"))
print(url)
io.sendline(url)
```
So finally we reached our first new questions.
```python
#Decode this base64 string and provide me the plaintext: "
varbase64 = b64d(test[:-1].decode("utf-8"))
print (varbase64)
io.sendline(varbase64)
#Encode this plaintext string and provide me the Base64:
varbase64encode = b64e(test[:-1])
print(varbase64encode)
io.sendline(varbase64encode)
#Decode this rot13 string and provide me the plaintext:
rot13var = codecs.encode(test[:-1].decode("utf-8"), 'rot_13')
print(rot13var)
io.sendline(rot13var)
#Encode this plaintext string and provide me the ROT13 equilavent:
rot13var2 = codecs.encode(test[:-1].decode("utf-8"), 'rot_13') #Listen and repeat, cause the alphabet i use has 26 characters
print(rot13var2)
io.sendline(rot13var2)
#Decode this binary string and provide me the original number (base 10):
bitvar = int(test[:-1],2) #Beware binary use as a base log2
print(bitvar)
io.sendline(str(bitvar))
#Encode this number and provide me the binary equivalent:
binvar = bin(int(test[:-1],0))
print(binvar)
io.sendline(binvar)
#Final Question, what is the best CTF competition in the universe?
io.sendline("DUCTF") #Not sure if you just could use any string
```
- [x] Execute the exploit

Another one from the list. <g-emoji class="g-emoji" alias="laughing" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f606.png">😆</g-emoji> So this time our exploit script did not printed out the next step so we were wondering what happend. Probably we reached the end of the journey and instead of searching for the next colon we searched for the end of a flag with }.
```python
test = io.recvuntil("}")
print(test)
```
With this last snippet we finally got our flag. Wohoo 2 hours later and a crash course in python + pwntools brought as our nice flag:
```
Bloody Ripper! Here is the grand prize!\n\n\n\n   .^.\n  (( ))\n   |#|_______________________________\n   |#||##############################|\n   |#||##############################|\n   |#||##############################|\n   |#||##############################|\n   |#||########DOWNUNDERCTF##########|\n   |#||########(DUCTF 2021)##########|\n   |#||##############################|\n   |#||##############################|\n   |#||##############################|\n   |#||##############################|\n   |#|'------------------------------'\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|\n   |#|  DUCTF{you_aced_the_quiz!_have_a_gold_star_champion}
```
Hmmmmm yeah we still did not know that there was an interactive command. So here is the nice version:
```
Bloody Ripper! Here is the grand prize!

   .^.
  (( ))
   |#|_______________________________
   |#||##############################|
   |#||##############################|
   |#||##############################|
   |#||##############################|
   |#||########DOWNUNDERCTF##########|
   |#||########(DUCTF 2021)##########|
   |#||##############################|
   |#||##############################|
   |#||##############################|
   |#||##############################|
   |#|'------------------------------'
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|
   |#|  DUCTF{you_aced_the_quiz!_have_a_gold_star_champion}"
```
- [x] Drink something <g-emoji class="g-emoji" alias="tada" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji>
After this struggle our first clear and fresh water

### Lessons Learned

This journey made us realized that on our skill page 2 points in programming and 1 point in google was not the best start for. So our dwarf needs to get back in his cave to start learning more <g-emoji class="g-emoji" alias="snake" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f40d.png">🐍</g-emoji>. Side Note: Gandalf went missing.
Hopefully our first writeup may help someone to level up and make this world a safer place. ROFL

# Bad Bucket

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/Bad%20bucket.JPG" alt="General Skills Quiz" width="50%" height="50%">

Our next Journey brings us to the cloud. Based on the hint we were offered a new webside which is under construction is our next step. So with all links sent to us in a black box from a guy called Blue Alder lets check it out.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/Bad_Bucket_index.png" alt="General Skills Quiz" width="50%" height="50%">

 Looking into the site we saw lots of buckets. Also the beep sound was actually working and in its own way different. Checking with the Developer Tools of my browser of choice also didn't reveal any useful information to us. But we saw that we were not redirected and had a direct link to a index.html file so we checked out the classic /admin folder. And we got this:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/bad_bucket_admin.png" alt="General Skills Quiz" width="50%" height="50%">

 So we saw its "who could have guessed" a public bucket in the google cloud. So we then checked the index of the bucket by kicking out the static link to index.html to see the root of the bucket. It's like the always say:" Kick out what doesn't pay any rent!".

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/bad_bucket_root.png" alt="General Skills Quiz" width="50%" height="50%">

So we saw an interesting file under contents which indicates us that we are on the wrong track cause its not a flag :laughing:.
We opened [.notaflag](https://storage.googleapis.com/the-bad-bucket-ductf/buckets/.notaflag) nevertheless and found our flag:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/bad_bucket_flag.png" alt="General Skills Quiz" width="50%" height="50%">

# No Strings

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/no%20strings.JPG" alt="General Skills Quiz" width="50%" height="50%">

So by now we established a trust between us and DownUnderCTF so we made the given binary executable. 
Disclaimer: Never execute to something you don't know. So maybe not the best habbit to have. But what could possible go wrong <g-emoji class="g-emoji" alias="australia" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f1e6-1f1fa.png">🇦🇺</g-emoji>
The programm just asks us in the command window "flag?" and waits for input. Whatever we provide resulted into the output "wrong!" so we started our favorite decompiler [ghidra](https://ghidra-sre.org/). Not sure if its a good but the one we have atleast a bit of experience.
So we let ghidra analyze the binary and just started to scroll over the decompiled code snippets. Usually we do that to get a feeling how long the programm is but directly saw something interesting.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/no_strings_ghidra.png" alt="General Skills Quiz" width="50%" height="50%">

Our attention was caught directly from this interesting Reference. So we tried it and got the solution. At this point we had no clue why it was there and for what it is intended, but it makes it quite easy if not to many imports are used for a file. 
Afterwards we checked the main function and saw a reference to a array with the name flag which had as during runtime as content the flag.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/no_strings_ghidra_main.png" alt="General Skills Quiz" width="50%" height="50%">

 So we tried to understand the background of the routine for checking if the input matches the flag. Within 5 minutes it was to tuff to realize the function other than to check that if you type something different than the content of the flag array you receive "wrong!". Maybe check other writeups for help here. LOL

# Who goes there?

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/Who%20goes%20there.JPG" alt="General Skills Quiz" width="50%" height="50%">

 This time we went to the Open source intelegence area and starts with the important part again (task lists are so anti agial):
- [ ] Read the Disclaimer
- [ ] Figure out what to do
- [ ] Drink something <g-emoji class="g-emoji" alias="tada" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji>

So after a quick read we realized that calling the police in Australia will not bring us any benefit for the challenge so 
- [x] Read the Disclaimer
First one down.

We saw that an domain was given in the Quest for our journey trough the Internet. We also saw that the format of the Flag started with +61 which gave us the impression that we probably have to find a phone number. So how is a phone number linked to an domain ? In multiple ways so lets our Epic begin ( ᐛ )و.

So we first started to check the ripe entry for the domain by making a whois query for 646f776e756e646572.xyz. There are multiple ways to do it we usually just use [ping.eu](https://ping.eu/). After a quick query we got the following:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/who_goes_there_ping.png" alt="General Skills Quiz" width="50%" height="50%">

We saw that our first Sprint (￣∠ ￣ )ﾉ did not went well and the contacts were truncated. So we continued our Epic knowing full well we could end up in a Saga. So we had the idea to check the whois query from the actual registrant provider because sometimes these systems have more information. So we now try this bold move to keep our Epic alive ヽ(#ﾟДﾟ)ﾉ┌┛.
Atleast we got this information from our query so we opened [whois.namecheap.com](http://whois.namecheap.com/), which actually took ages to respond ( ｰ̀εｰ́ ).
It was pure luck we had a search engine and found out that the actual whois link from namecheap is [https://www.namecheap.com/domains/whois/](https://www.namecheap.com/domains/whois/). Seems that not everyone keeps up the docu, so we know they are one of us.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/who_goes_there_namecheap.png" alt="General Skills Quiz" width="50%" height="50%">

So lets see what comes out of our bold move ... hmm as we can see we got more informations now (*^▽^*) . When we check the Number of the Registrant it matches the beginning of the format of the flag and :boom: we got the intel. Luckely we did not had to form an alliance for this Story/journey and were able to close the Epic and return to our guild to enjoy our story with our fellers.
Back at the tavern we realized we brought value in the world and crossed our next step:
- [x] Figure out what to do

Happily we ordered 

- [x] Drink something <g-emoji class="g-emoji" alias="tada" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji>

and listen to our favorite spotify model while we wait for our next story to sprint/chase after.

P.S: We could also make an Offer on namecheap which probably none could have declined.

# The Introduction

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2021/img/the_introduction.png" alt="General Skills Quiz" width="50%" height="50%">

https://user-images.githubusercontent.com/87261585/136456472-b33a124c-1fd1-4d53-963f-a41100a5b599.mp4

<video width="75%" height="75%" controls>
  <source src="https://user-images.githubusercontent.com/87261585/136456472-b33a124c-1fd1-4d53-963f-a41100a5b599.mp4" type="video/mp4">
  https://user-images.githubusercontent.com/87261585/136456472-b33a124c-1fd1-4d53-963f-a41100a5b599.mp4
</video>

---

So these are our first writeups and the next step is becoming something with cyber cyber.
Along the way while we created all this we also did the following:
- [x] Create github Repo for the future
- [x] Set the repo to use github pages
- [ ] Understand how github pages works
So for the last part we are not the best with web design but maybe in the future we can figure this out too. ;)
