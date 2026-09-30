```
   .-'''-.    ____    .--.   .--.    ___    _ .-------.       ____       
  / _     \ .'  __ `. |  | _/  /   .'   |  | ||  _ _   \    .'  __ `.     
 (`' )/`--'/   '  \  \| (`' ) /    |   .'  | || ( ' )  |   /   '  \  \    
(_ o _).   |___|  /  ||(_ ()_)     .'  '_  | ||(_ o _) /   |___|  /  |    
 (_,_). '.    _.-`   || (_,_)   __ '   ( \.-.|| (_,_).' __    _.-`   |   
.---.  \  :.'   _    ||  |\ \  |  |' (`. _` /||  |\ \  |  |.'   _    |    
\    `-'  ||  _( )_  ||  | \ `'   /| (_ (_) _)|  | \ `'   /|  _( )_  |    
 \       / \ (_ o _) /|  |  \    /  \ /  . \ /|  |  \    / \ (_ o _) /    
  `-...-'   '.(_,_).' `--'   `'-'    ``-'`-'' ''-'   `'-'   '.(_,_).'  
```
Use a variety of OSINT techniques to solve this room created by the OSINT Dojo. [^1]

What username does the attacker go by?
-----------------------------------------------------------------------------------------
We download the image from the link [^2] with `wget` and then proceed to retrieve the 
image's metadata information with `exiftool sakurapwnedletter.svg`. Therefore, we obtain
the following metadata.

```
ExifTool Version Number         : 11.88
File Name                       : sakurapwnedletter.svg
Directory                       : .
File Size                       : 830 kB
File Modification Date/Time     : 2023:10:19 13:48:10+02:00
<--snip-->
Version                         : 0.92.5 (2060ec1f9f, 2020-04-08)
Docname                         : pwnedletter.svg
Export-filename                 : /home/SakuraSnowAngelAiko/Desktop/pwnedletter.png
Export-xdpi                     : 96
Export-ydpi                     : 96
Metadata ID                     : metadata5
Work Format                     : image/svg+xml
Work Type                       : http://purl.org/dc/dcmitype/StillImage
```
With this, we can assume that the attacker's username was leaked in the home directory
file path.

What is the full email address used by the attacker?
-----------------------------------------------------------------------------------------
A quick query, with the username obtained in the previous task, in the search engine of
our choice reveals the attacker's Twitter and GitHub accounts.

> https://twitter.com/sakuraloveraiko<br>
> https://github.com/sakurasnowangelaiko

After browsing the GitHub profile, the attacker's public key can be found in the *PGP*
[^3] repository. This key may contain valuable information, which can be extracted as
follows.

```
$ gpg --list-packets sakurasnowangelaiko_publickey.txt
# off=0 ctb=99 tag=6 hlen=3 plen=397
:public key packet:
	version 4, algo 1, created 1611377670, expires 0
	pkey[0]: [3072 bits]
	pkey[1]: [17 bits]
	keyid: ECDD0FD294110450
# off=400 ctb=b4 tag=13 hlen=2 plen=32
:user ID packet: "SakuraSnowAngel83@protonmail.com"
<--snip-->
```
And indeed, here we can observe the full email address used by the attacker in the user
identification.

What is the attacker's full real name?
-----------------------------------------------------------------------------------------
After browsing the attacker's Twitter profile a little bit, we stumble upon this
post [^4]. Concluding from the additional username *AikoAbe3*, we can easily assume the
full real name of the attacker.

What cryptocurrency do they own a cryptocurrency wallet for?
-----------------------------------------------------------------------------------------
The following tasks are introduced in a way that makes us suspicious to investigate old
GitHub commits further.
And indeed, the `miningscript` in the *ETH* repository has been updated to
obfuscate the attacker's leaked ethermine credentials from a previous commit [^5].
The attacker thus has an account on the specified mining pool for the cryptocurrency
*Ethereum*.

What is the attacker's cryptocurrency wallet address?
-----------------------------------------------------------------------------------------
The same GitHub commit from the previous solution, also contains the attacker's wallet
address specified as a hexadecimal number.

What mining pool did the attacker receive payments from on January 23, 2021 UTC?
-----------------------------------------------------------------------------------------
For this task, we can utilize *Etherscan*, an online ethereum blockchain explorer, to
search for payments from *01/23/2021* to the wallet address [^6] as found in the previous
task. The mining pool of the only transaction that was found through this filtering,
is *Ethermine*, which we could already spot in the old GitHub commit.

What other cryptocurrency did the attacker exchange with using their
cryptocurrency wallet?
-----------------------------------------------------------------------------------------
For this question, we once again use *Etherscan* but this time set the asset to *not ETH*
in order to filter out the *Ethereum* transactions. Therefore, we can find out, that the
attacker additionally exchanged *Tether USD* with this wallet address.

What is the attacker's current Twitter handle?
-----------------------------------------------------------------------------------------
The attacker's current Twitter handle was already found in preparation of task two.

[Legacy] What is the URL for the location where the attacker saved their WiFi SSIDs and
passwords?
-----------------------------------------------------------------------------------------
The attacker posted some hints in their Twitter profile which suggest that accessing the
deep web and pasting the encrypted links in Deep Paste is useful. After finding the
encrypted URL with the MD5 code from the Twitter post, Deep Paste results in the onion
website [^7] URL. In the current version of the room, Deep Paste does not exist anymore
and the question was removed as well.

What is the BSSID for the attacker's Home WiFi?
-----------------------------------------------------------------------------------------
This task requires the usage of *Wigle Net* [^8] to search for the BSSID in the advanced 
general search with the network name *DK1F-G*. Therefore, we can observe exactly one
network with the exact same match and copy the listed BSSID identifier.

What airport is closest to the location the attacker shared a photo from prior to getting
on their flight?
-----------------------------------------------------------------------------------------
In the center of the image we can observe the characteristic Washington Monument and thus 
conclude that it was taken in the Washington, D.C. range. Further, the only eligible 
airport is the Ronald Reagan Washington National Airport with the IATA code *DCA*.

What airport did the attacker have their last layover in?
-----------------------------------------------------------------------------------------
The attacker posted a picture of the 'Sakura Lounge' by 'JAL' airlines and captioned it 
with the last layover before reaching home. After searching for this lounge in a search 
engine of our choice, it appears, that the Tokyo Haneda airport is the only airport that 
has such a lounge. Finally, the IATA airport code is *HND*.

What lake can be seen in the map shared by the attacker as they were on their
final flight home?
-----------------------------------------------------------------------------------------
The lake *Inawashiro* has the characteristic location between the start and end 
airport and it's shape matches the aerial view from the Twitter post very closely.

What city does the attacker likely consider "home"?
-----------------------------------------------------------------------------------------
For this final task, we once again rely on the information retrieved from the task with 
`wigle.net` and locate the home WiFi on the map. The attacker's home WiFi is therefore 
located in *Hirosaki*.

[^1]: https://tryhackme.com/room/sakura
[^2]: https://raw.githubusercontent.com/OsintDojo/public/3f178408909bc1aae7ea2f51126984a8813b0901/sakurapwnedletter.svg
[^3]: https://github.com/sakurasnowangelaiko/PGP
[^4]: https://twitter.com/SakuraLoverAiko/status/1355364359090757635
[^5]: https://github.com/sakurasnowangelaiko/ETH/commit/5d83f7bb37c2048bb5b9eb29bb95ec1603c40135
[^6]: https://etherscan.io/advanced-filter?fadd=0xa102397dbeeBeFD8cD2F73A89122fCdB53abB6ef&tadd=0xa102397dbeeBeFD8cD2F73A89122fCdB53abB6ef&txntype=0&age=2021-01-23%7e2021-01-23
[^7]: http://deepv2w7p33xa4pwxzwi2ps4j62gfxpyp44ezjbmpttxz3owlsp4ljid.onion/show.php?md5=b2b37b3c106eb3f86e2340a3050968e2
[^8]: https://wigle.net/
