
# Sakura Room

This is yet another OSINT challenge: we have to find out everything
about hackers, using only a svg image that they left behind

---

## *TIP-OFF*

So let's begin analyzing this file. My first step would be to use `strings` command
and hope it would find something useful. After throwing styles out of the output, I
noticed some of binary code. You can filter all this code like this:

> `strings sakurapwnedletter.svg | grep -v -e 'd=".*"' | grep -e '[01]\{8,\}' -o`

After decoding it with [CyberChef](https://cyberchef.org/#recipe=From_Binary('Space',8))  we get some gibberish and a hint:

> A picture is worth 1000 words but metadata is worth far more

Since we can't get anything else out with strings, let's move on to extracting metadata.

> `exiftool sakurapwnedletter.svg`

The command gives us exif metadata, including 'Export-filename', which contains
hacker's username.

---

## *Reconnaissance*

It appears that our attacker made a fatal mistake in their operational security. They 
seem to have reused their username across other social media platforms as well. This 
should make it far easier for us to gather additional information on them by locating 
their other social media accounts.

Our first OSINT tool would be a simple browser. After entering hacker's username in a
search bar, DuckDuckGo spit out his Github and LinkedIn profiles. In his Github we find
a repository called PGP that contains a public PGP key. We can extract its UID like this:

> `gpg --show-keys pgp-key`

Turns out, the UID is his email. And his real name can be found on LinkedIn profile.

---

## *Unveil*

It seems that hacker has committed some private information about cryptocurrency
transactions to Github, but then realized his mistake and deleted it. ***Or did he..?***

Let's use a ~Time machine~ [Web Archive](https://archive.org/web/) to see, what was
in his repository before.

Ok, paste the URL of his Github and navigate to 2021 year, April.
We can see a repo called ETH which obviously stands for 'Ethereum'. In there you'll
find mining script. Jump to the first commit and you'll find all information about his 
wallet.

It's time to check hacker's transactions. Let's navigate to
[EtterChain](https://www.etherchain.org/) and search for his wallet. In the payouts
section we can find the history of his transactions:

![January23.png](https://i.postimg.cc/MZr2tL2R/January23.png)

What mining pool did the attacker receive payments from on January 23, 2021 UTC?

> Ethermine

What other cryptocurrency did the attacker exchange with using their cryptocurrency 
wallet?

Search for the wallet at [Etherscan](https://etherscan.io/txs):

![Etherscan.png](https://i.postimg.cc/3NMKSfz3/Etherscan.png)

> Theter

---

## *Taunt*

Ok, we have a screenshot of hacker taunting us:

![Taunt](https://raw.githubusercontent.com/OsintDojo/public/main/taunt.png)

The question suggests that he has changed his username, so the one in the screenshot is 
not the right one. We have to try and find posts that he has created with the old
username.

Judging from the gathered information, our hacker doesn't really care about switching his
usernames. Let's try Google dorking with the info we already got:

> `Aiko Sakura Snow Angel inurl:twitter`

This will get you the hacker's account:

> SakuraLoverAiko

Let's dive in his tweets. We'll see some MD5 hash and a hint about Access Points
and Deep Paste.

![SakuraLoverAiko](https://i.postimg.cc/BQXCtwfy/sakura-lover-aiko.png)

There's a website that allows users to share plain text through public posts ("pastes"),
it's called "Pastebin". The hacker in his tweets refers to its Dark Web equivalent,
Deep Paste.

So let's fire up Tor, then search for hidden wiki, and then try a couple of dark web 
search engines, that are listed in there. I had luck with OnionLand. Search for
DeepPaste with it, and you should find this:

![DeepPaste](https://i.postimg.cc/13Z2WgdT/deep-paste.png)

Click on the 'Deep Paste' on top and you'll be navigated to the page where you can create
pastes. Scroll down to the bottom and click on "Search Pastes..." and paste the MD5 from
Twitter. If no luck in finding it, here's a screenshot:

![Wifi-stuff](https://i.postimg.cc/0269gJcy/wifi-stuff.png)

What is the URL for the location where the attacker saved their Wi-Fi  SSIDs and passwords?

> http://depasteon6cqgrykzrgya52xglohg5ovyuyhte3ll7hzix7h5ldfqsyd.onion/show.php?md5=0a5c6e136a98a60b8a21643ce8c15a74

What is the BSSID for the attacker's Home Wi-Fi?

BSSID stands for Basic Service Set Identifier, and it’s the MAC physical address of the access point or wireless router that is used to connect to the WiFi.

Navigate to [Wigle](https://wigle.net/), create an account and use "Advanced search":

![Wigle](https://i.postimg.cc/6QxHWDKm/wigle.png)

Now paste the SSID and you'll get the answer!

> 84:AF:EC:34:FC:F8

---

## *Homebound*

What airport is closest to the location the attacker shared a photo from prior to getting on their flight?

Let's take a look at the image below:

![Monument](https://i.postimg.cc/7Lw4xzJB/monument.jpg)

Zoom in and look for some landmarks, road signs, stands, railways, nature objects.
We can see Washington Monument down the road and U.S. Capitol in the right bottom corner.
So attacker was clearly at Washington D.C.

![Location-1](https://i.postimg.cc/cLvDNn2Y/map-washington-district.png)

Quick search on Google Maps has revealed, that attacker is somewhere in the bottom area.

Next thing I did, was searching for 'Washington airport', and using locations of the
obelisc and the Capitol, I found just the right one near Long Bridge Park: Ronald Reigan
National Airport. The answer is the code for this airport, which is

> DCA

What airport did the attacker have their last layover in?

![Last layover](https://i.postimg.cc/3RqzD0WQ/last-layover.png)

This ona can be solved with a simple reverse-image lookup. Upload it to Google images
and it will show you 'Tokyo International Airport [Haneda] JAL Sakura Lounge: JAL'.
The answer is the code of this airport, which is:

> HND

What lake can be seen in the map shared by the attacker as they were on their final 
flight home?

![A Lake](https://i.postimg.cc/Fz3mrVpB/lake.jpg)

First of all, lets locate Japan with Google Maps and find this iceland on top.
That would be Sado Iceland. Next, just zoom in to the biggest lake.

> Lake Inawashiro

What city does the attacker likely consider "home"?

This one you can get from Wigle search on his home ssid

> Hirosaki
