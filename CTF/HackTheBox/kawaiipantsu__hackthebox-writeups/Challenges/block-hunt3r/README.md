# Block Hunt3r

> **Labs: Challenges**

> **Challenge difficulty: Medium**

## Challenges Labs

The Challenges available at hack the box are very well made and vary from hardware to software and contains everything you would expect to find like debugging, decoding, stegno, osint and so on.

## Challenge: Block Hunt3r

> CHALLENGE DESCRIPTION
>
> Blockchain data can't be deleted, and bad actors are using it to store blobs, we want to hunt down the user that has been uploading illegal pictures on the Ethereum Goerli testnet blockchain. We need to find one picture to use it as evidence to take him down. We know he was actively uploading pictures between 2020-07-30 and 2020-08-01.

## Dates

So first i wanted to find out the unixtime stamps for the 2 dates as it might come in handy later on if we actually find a tools to do all this for us.

I just browsed https://www.unixtimestamp.com and entered the dates and converted them to timestamps.

- 30-07-2020 00:00:00
  - Unix timestamp is 1596060000
- 01-08-2020 23:59:00
  - Unix timestamp is 1596146340

## Image magic numbers

So how do we find out if the data we extracted is image data ? Well the most common thing is to look at it with a HEX editor/dump tool and look at the first few bytes to identify the magic header. Most image formats have distinctive magic numbers.

You can browse this site etc to see what i mean: https://asecuritysite.com/forensics/magic

This is also how linux tools like ```file``` and ```binwalk``` can recognize file types, it's simply looking at the magic bytes in the start of the file.

**So what are we looking for?**
- **JP(E)G**: HEX: ```FF D8```
- **BMP**: HEX: ```42 4D```
- **GIF**: HEX: ```47 49 46 38```
- **PNG**: HEX: ```89 50 4E 47```

As we don't know the image format we have to assume it can be one of the following. These are the most common "internet" formats.

## Looking for blocks

> First of a little trap for young players, myself included :D
> When i googled for things to look at like "Find ethereum blocks from dates"
> not much came up as expected ... But i found my way on to etherscan.io and began
> to look at blocks. But yes ... the trap ... I did not read the Description in
> details and just jumped the gun!

### First ideas and attempts where futile

So what i did was all correct, just it was on the wrong "network". The **Goerli** network is the Ethereum test network. I did not know that as i'm a complete blockchain noob. So when looking at things i just assumed that the "network name" was simply just alternative entry points to the same blockchain network.

But yeah so the first blockchain addresses i found was obviously for the MainNet. And as such all my scans of that network yielded no results but a lot of files (2000+ files heh) and yes i scripted my way though it and looked at magic headers and meta data and also strings.

Finally i found my mistake and changed the network and searched for the blocks once again. I "brute forced" my way by just adjusting the url here to find what blocks i needed to for start and end.

https://goerli.etherscan.io/block/3145000

By looking at the date and changing the number up or down etc.

### The hunt for block numbers matching the date

So now i was hunting for the block numbers, i had still not looked at any tools or anything else. I just jumped the gun and began to do simple recon on Ethereum.

Ended up with the following block numbers for my START and END blocks.

- **3135000**: 486 days 18 hrs ago (Jul-30-2020 03:57:31 AM +UTC)
- **3155000**: 483 days 7 hrs ago (Aug-02-2020 03:18:39 PM +UTC)

That was pretty close to the dates and i hope that was ok. hopefully the files we needed where in that range.

So now i had all i needed. I had the ethereum block numbers now how do i look at the data ?

## Exploring Ethereum and Blobs

A quick search for "Ethereum blob search" gave me some quick choices and after a while i had settled on the following tools i wanted to use.

- **etherblob explorer**
  - So this sounded like the most promising tool that could actually search for blobs in ethereum and extract the files based on magic/binwalk etc. This was spot on !!
- **go-ethereum**
  - This is the official Ethereum Go client (cli) and the idea was to simply download the whole ethereum blockchain to the disk and look for images in it :) The command needed is ```geth```
- **web3.js + ethereum-block-by-date**
  - This also sounded good, although i would have to do coding, so more time to make it more complicated etc.
- **web3.py**
  - Just as a backup, you could also use python if we went down this path.

So the first tools i found sounded like it was all i needed so i started to look into that ...

## Etherblob Explorer

Etherblob requires a API key to use Etherscan.io web api. So i created an account and got a key. Done.

Also i found out that Ether bloc actually would accept Unix timestamps! So i did not even have to figure out myself what the block range was for those dates. I used Etherblob to show me the nearest block addresses and i was not that far off.

### Etherblob found these nearest block addresses

- Got starting block id '**3133569**'!
- Got ending block id '**3156602**'!

> Not far from mine!

As i wrote earlier i made a mistake looking at the wrong network, this also trickled down into this tool unfortunately as this scan tool took about 2 hours per run with this block range...

So my first 2 scans where both wrong. Aka wasted 4 hours !! Eeep! But hey this is what learning is all about and how to change your way of thinking and looking at OSINT. No time is really wasted when it still feels like there is progress happening.

- First scan was on wrong network (MainNet).
- Then second scan was on correct network but looked at wrong data.
- Finally i also noticed that there was multiple places to look for data
  - transactions (default)
  - addresses
  - contracts
  - block
- Also i needed to add ```-H -M``` to get better blob exploration

So i then ran Etherblob for the final time (you wish) hoping this time all was good !! This time i looked at the default transactions. But yeah i had by this time tried them all.

```bash
etherblob -k $ETHERSCAN_API_KEY -t 1596060000 1596405540 --network goerli -H -M
```

It all looked good and it started to do it's thing!
```TEXT
2021-11-28 23:30:26,807 [INFO] Creating dir for files at 'ext_1596060000-1596405540'...
2021-11-28 23:30:26,808 [INFO] Parsing blocks as timestamps...
2021-11-28 23:30:27,019 [INFO] Got starting block id '3133569'!
2021-11-28 23:30:27,230 [INFO] Got ending block id '3156602'!
2021-11-28 23:30:27,230 [INFO] Search and extract embedded files enabled...
2021-11-28 23:30:27,230 [INFO] Search and extract via file header/magic bytes enabled...
2021-11-28 23:30:27,230 [INFO] Started EtherBlobExplorer engine...
2021-11-28 23:31:27,371 [INFO] Parsed 153/23034 blocks (153 [block]/[min]), found 0 files so far...
2021-11-28 23:32:27,412 [INFO] Parsed 302/23034 blocks (149 [block]/[min]), found 0 files so far...
2021-11-28 23:33:27,816 [INFO] Parsed 452/23034 blocks (150 [block]/[min]), found 0 files so far...
```

Now i just had a bunch of files to go over.

## The sad first conclusion

Nothing worked, i got tons of files but no images amongst them. Over 10 hours used on crawling the etherscan.io api via etherblob... Found plenty of interesting strings and other recognized files.

What now? I could only conclude that it was hidden/encrypted or somehow obfuscated to some extend. As all the methods i have tried so far relied on that the data/blob was "known" via magic header or binwalk. So in a last ditch effort i tried running etherblob once more with their ```--encrypted``` option where it saves data found based on entropy points.

I was hoping that this "entropy" scanning type would then also take data that looked interesting but not necessarily made sense in terms of magic bytes/file types.

So i had made up my mind at this point, one last try with entropy/encrypted scan if that yields nothing then moving on to go-ethereum and downloading the hole blockchain and sif though the data with a simple grep etc.

## Etherblob and encrypted scan (Last attempt)

So here goes ! One last time.

```bash
etherblob -k $ETHERSCAN_API_KEY -t 1596060000 1596405540 --network goerli --encrypted -D data_encrypted
```

```TEXT
2021-11-29 12:10:42,479 [INFO] Parsing blocks as timestamps...
2021-11-29 12:10:42,960 [INFO] Got starting block id '3133569'!
2021-11-29 12:10:43,325 [INFO] Got ending block id '3156602'!
2021-11-29 12:10:43,326 [INFO] Using entropy limits of '7.0' and '8.0' for search...
2021-11-29 12:10:43,326 [INFO] Started EtherBlobExplorer engine...
2021-11-29 12:11:43,400 [INFO] Parsed 224/23034 blocks (224 [block]/[min]), found 0 files so far and 420 transactions...
...
2021-11-29 12:34:46,221 [INFO] Parsed 6162/23034 blocks (258 [block]/[min]), found 0 files so far and 15700 transactions...
```

It did actually not find any files for a long time and i was very sad. But though, let it run: what are 2 more hours in this endeavor :) After a while i saw this !

```TEXT
2021-11-29 12:44:56,217 [INFO] Found interesting file (Possible encrypted/compressed data) inside transaction '0x02ac63438cfcabbdfc774c5567e234f2ef9af653d53bed12a3fc08db090d5f15' (via entropy calc), extracted to 'data_encrypted/file_0'...
2021-11-29 12:44:56,929 [INFO] Found interesting file (Possible encrypted/compressed data) inside transaction '0x81b732f0706621ebf4f42de0d05495b91257690bf5a4314e5471ece0d3c67ac5' (via entropy calc), extracted to 'data_encrypted/file_1'...
```

It was still scanning, but i could not wait. I was to happy and began looking at the files.

```bash
$ tree -sh data_encrypted
data_encrypted
├── [2.9K]  file_0
└── [3.2K]  file_1

0 directories, 2 files
```

Yes they where actually of significant size, all i had seen before this was a lot smaller. I always thought that looking for an image i would like to see something up in the kB range!

I then tried running file on them, just to verify that they did not have any known magic numbers

```bash
$ file data_encrypted/file_0 
data_encrypted/file_0: data

$ file data_encrypted/file_1 
data_encrypted/file_1: data
```

Great ! Just as expected and also why any of the other search methods with etherblob did not find them.

I then ran the well known command ```strings``` on them to see if i could figure something out on how to approach them.

```TEXT
$ strings data_encrypted/file_*
PA#8
3Pp^
`O/ZF
GC|P81
C@iL
Bg/!PWSb@Y@
!<zN
...
...
l{*51
OQXp
IEND
```

Well ... Lot's of stuff but as most of us our brain is trained with a keen eye on finding strings that might be something.

My eyes immediately fell on the last string ```IEND``` it just sounded to valid/real. So a quick Google search and YES! I got a lot of hits related to how PNG files where build/structured.

Let's look at the beginning of each of them, if it really is a PNG image file we already know that it should contain the magic number (HEX): ```89 50 4E 47```

```bash
$ hexdump -n 8 -C data_encrypted/file_0
00000000  08 95 04 e4 70 d0 a1 a0                           |....p...|
00000008

$ hexdump -n 8 -C data_encrypted/file_1
00000000  0e 60 20 dd 11 0b 09 d2                           |.` .....|
00000008
```

At first glance, i was not correct. But if you look closer, you will notice that i seems like there have been added a ```0``` to the beginning of file_0. And that if we removed that we would actually have the magic number for a PNG !!

And looking for the ```IEND``` I found that it was located last in file_1. And as per PNG structure i now knew that this was ment to be the last part of a PNG file.

So with this info, i was pretty sure that we had a PNG image file split into 2 files and the magic number was pre-padded with a ```0``` to hide the magic number. Also there was a ```0``` at the beginning in file_1 so perhaps this was also an attempt to corrupt it.

Let's try to combine the 2 files but remove the first ```0``` in both of them first.

```bash
$ xxd -p data_encrypted/file_0 > png_start.hex

$ xxd -p data_encrypted/file_1 > png_end.hex

# EDIT the png_start.hex and png_end.hex and simply remove the first 0
# Now lets merge them

$ cat png_start.hex png_end.hex > png.hex

# Now lets make it back into a binary file (PNG file!)

$ xxd -p -r png.hex > flag.png

# Lets see if its a valid file now

$ file flag.png 
flag.png: PNG image data, 26 x 531, 8-bit/color RGBA, non-interlaced
```

YEEEEEEEEEES! I was so happy now hehe ... I opened up the flag.png file with my image viewer and there the flag was ! This was truly a great success moment heh. All there was now was to submit the flag and enjoy the many hours spend and the adventure i had undertaken.

## Conclusion

This was one hell-of-a-ride if you ask me. But it was super fun and i had a blast and an adventure! I took a lot of good learning lessons with me. Here are some of the key points divided into PROS and CONS.

**PROS**

- Learning about Ethereum blockchain
  - Understanding there are multiple blockchains
  - Making sense there is PROD / TEST etc.
  - Understanding the differences between
    - blocks
    - addresses
    - transactions
    - contracts
- Sticking to a tool when you know it should do the job
- Looking at the data you got and how it's obtained to figure out why you don't get the data you expect
- Got introduced to xxd (normally i favored hexdump)
- Refreshing up on Magic numbers, it's always nice
- The obviously "Ahh-Haa!" moments
  - Figuring out we want "unknown" data
  - Finding the magic number
  - Finding the PNG ending IEND
  - Getting etherblob to do what i wanted
- The overall OSINT experience
  - Finding dates, timestamps
  - Finding blocks from dates
  - Finding tools
  - And so on...

**CONS**

- Blockchain data is large and heavy to work with
- Benefits from working locally vs remotely (api)
- As always, my jump-the-gun problem when it comes to descriptions :)
- Time spend on the challenge (15-18 hours total over 2 days)

## BONUS Section for extra credit :)

So i now had the PNG image file with the flag string. But why stop now, let's go all in and grab the flag via OCR ! Just for the fun of it. First of it was rotated so we needed to deal with that and then feed it to gocr.

```bash
# Rotate Counter-Clockwise (ie. negative 90 degrees)
$ convert flag.png -rotate -90 flag_readable.png

# Now Let OCR do it's magic!
$ gocr flag_readable.png
_HTB{Hav1ngFuN::w1tH-th3;d@ubl3-edg3d::sw@Rd__}
```

Awwww.... So close :D I'm to lazy to begin and optimise the PNG image, could try monochrome, 1bit pallet, adjusting levels and inverting etc...

Let's just be done! Here is the flag, written down manually :)

Enjoy

## Flag

```TEXT
HTB{H4v1ngFuN::W1tH-th3;d0ubl3-edg3d::Sw0Rd$$}
```
