- [Forensics here we come](#forensics-here-we-come)
- [Authors mistake](#authors-mistake)
- [Find location](#find-location)
- [What is SHA1 checksum of image file blk0\_mmcblk0.bin?](#what-is-sha1-checksum-of-image-file-blk0_mmcblk0bin)
- [What is the name of the largest partition?](#what-is-the-name-of-the-largest-partition)
- [What is the brand (vendor) of phone?](#what-is-the-brand-vendor-of-phone)
- [What is the model of phone?](#what-is-the-model-of-phone)
- [What is the IMEI number of the phone?](#what-is-the-imei-number-of-the-phone)
- [What is the SIM card number (ICCID) used on the phone?](#what-is-the-sim-card-number-iccid-used-on-the-phone)
- [What is a name of audio file which is related with rifles and their price?](#what-is-a-name-of-audio-file-which-is-related-with-rifles-and-their-price)
- [What is a name of video file which is related with tanks?](#what-is-a-name-of-video-file-which-is-related-with-tanks)
- [What email address is setup on com.android.email service?](#what-email-address-is-setup-on-comandroidemail-service)
- [What is a Name of device user?](#what-is-a-name-of-device-user)
- [What is a Username of telegram messenger?](#what-is-a-username-of-telegram-messenger)
- [Find the contact related to Russia?](#find-the-contact-related-to-russia)
- [Find the contact related to Belarus?](#find-the-contact-related-to-belarus)
- [What was the Bluetooth MAC Address of the device?](#what-was-the-bluetooth-mac-address-of-the-device)
- [What is the name of WhatsApp user which has phone number +37062166565?](#what-is-the-name-of-whatsapp-user-which-has-phone-number-37062166565)
- [Based on the analysis of the video file 20221015\_173902.mp4, please provide the GPS coordinates of the possible place, where video was recorded?](#based-on-the-analysis-of-the-video-file-20221015_173902mp4-please-provide-the-gps-coordinates-of-the-possible-place-where-video-was-recorded)
- [Own Opinion](#own-opinion)

# <a name="Forensics here we come"></a>Forensics here we come

So basically, we didn't really follow a structured approach to the CTF and instead focused mostly on the Forensics tasks. This write-up is more like a diary entry of what we did and what we found. We can't really say in which order we tackled the tasks, so you might want to use the search function if you're looking for something specific. Hopefully, our experience will help someone out there!

So we started the ctf by looking in the first Forensic task and saw a little story tied to it + an image file + a recommended tool set by the creators of the CTF for reference this was the provided tool set:

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/ctf_tool_set.png" alt="ctf_tool_set" width="50%" height="50%">

So the funny part is that we didn't actually use any of the tools provided during the task ヽ(o＾▽＾o)ノ. We found that [Autopsy](https://www.autopsy.com/) pretty much had everything built-in that the different tools provided. However, we really appreciate the fact that the creator of the CTF provided a basic tool set that can be used to solve all the questions. Thanks for that! We also used a [Flare VM](https://github.com/mandiant/flare-vm) as our base, so we were well-prepared.

Then we saw that the other questions to forensics were all connected to the image and the image is 2.6 gig big which took a bit of time for us, so we let it run and went to the first OSINT question

# <a name="Authors mistake"></a>Authors mistake

Here we got a link provided to a pinterest pic and the hint that the flag was already published. We had a look into the pic and saw that the author has uploaded multiple pics. On the last one you could see that the pic had a comment, with the flag in it.[pinterest](https://www.pinterest.com/pin/964051863962640008/) Flag: VU{179d9afbd6a5a817ca2765ab958ba9d8ec95eb7c}

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/pinterest_pic.png" alt="pinterest_pic" width="75%" height="75%">

A quick and nice challenge.

# <a name="Find location"></a>Find location

In the next one we got a pic and the goal to find the flag in the location of the pic.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/Location.jpeg" alt="Location" width="75%" height="75%">

You can see here an location in the pic, which probably should be the bait that you actually try to find that location which you see in the pic (＃￣ω￣).
What we did was to use the tool [exiftool](https://exiftool.org/) to check the meta data of the pic which most of the time has a location information in it.

```console
└─$ exiftool *  
ExifTool Version Number         : 12.55
File Name                       : Location.jpeg
Directory                       : .
File Size                       : 253 kB
File Modification Date/Time     : 2023:02:25 17:23:27+01:00
File Access Date/Time           : 2023:02:25 17:23:27+01:00
File Inode Change Date/Time     : 2023:02:25 17:23:27+01:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : None
X Resolution                    : 1
Y Resolution                    : 1
XMP Toolkit                     : FILE
Location                        : VU{d5bc0961009b25633293206cde4ca1e0}
Profile CMM Type                : 
Profile Version                 : 4.3.0
Profile Class                   : Display Device Profile
Color Space Data                : RGB
Profile Connection Space        : XYZ
Profile Date Time               : 0000:00:00 00:00:00
Profile File Signature          : acsp
Primary Platform                : Unknown ()
CMM Flags                       : Not Embedded, Independent
```

Boom there it was already in plain text VU{d5bc0961009b25633293206cde4ca1e0}. Next points cashed in.

# <a name="What is SHA1 checksum of image file blk0_mmcblk0.bin?"></a>What is SHA1 checksum of image file blk0_mmcblk0.bin?

By now the image file was on our system, which means we could start the first question. There are lots and lots of ways to solve this question but we just used the tools we already have on the Flare VM, which in our case was [hashmyfiles](https://www.nirsoft.net/utils/hash_my_files.html). It took a bit but the result was as expected with all the hashes you could ask:

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_hash.png" alt="phone_hash" width="75%" height="75%">

As you can see the SHA1 hash is **5377521a476be72837053390b24bc167d8f9182c**

Little nice start to any investigation to ensure you have an unmodified file and nothing broke during the transmission.

# <a name="What is the name of the largest partition?"></a>What is the name of the largest partition?

We then loaded up the image into Autopsy using the default settings and plugins for an phone image. Next we sorted the different partitions based on their sector sizes to get the biggest one:

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/partition_size.png" alt="partition_size" width="75%" height="75%">

Which brings us **userdata** as the searched one.

# <a name="What is the brand (vendor) of phone?"></a>What is the brand (vendor) of phone?

For the brand (vendor) of the phone we looked into the metadata which had the brand under the table Owner:

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/metadata.png" alt="metadata" width="75%" height="75%">

Funny when we tried "Samsung" as the solution we were told that this is wrong (╥﹏╥) <img class="emoji" title=":trollface:" alt=":trollface:" src="https://github.githubassets.com/images/icons/emoji/trollface.png" width="20" height="20" align="absmiddle">. Next we tried "samsung" which then was right (⊙.⊙(☉̃ₒ☉)⊙.⊙). We learned that we probably found the solution in not the intended way ?? Whatever Flag: **samsung**

# <a name="What is the model of phone?"></a>What is the model of phone?

For the model of the phone we had to search a bit. With some help of the internet we found out that this kind of information should be within the build.prop file found under /system/build.prop. There should be a field called ro.product.model which has the model of the phone. By the way these small things took lots of time to find. So funny enough for us were the easy ones the tuff ones, cause we had no clue where to look at first.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_model.png" alt="phone_model" width="75%" height="75%">

And we got it **SM-G530FZ**. Also we found the right way probably to find the vendor cause samsung was written there in lower cases.

# <a name="What is the IMEI number of the phone?"></a>What is the IMEI number of the phone?

Again we had no clue where to look at. So this time we just used the search function of Autopsy in the hope that IMEI is a used phrase also within the phone. You know developer using not some weird names for the stuff <img class="emoji" alt="v" src="https://github.githubassets.com/images/icons/emoji/unicode/270c.png" width="20" height="20">.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_imei.png" alt="phone_imei" width="75%" height="75%">

Voila (◕‿◕). The searched number was found in a random appearing cfg file from a random tool ??? Probably not the way it was intended to be found but we have to admit it worked. Based on our search there should be a file called nv_data.bin which should have that information, but we assumed that image was prepared so that it is not to easy to find stuff.

Flag: **351705072369910**

# <a name="What is the SIM card number (ICCID) used on the phone?"></a>What is the SIM card number (ICCID) used on the phone?

We used the same trick and searched for ICCID. No luck this time, cause we only found some logs hinting that there is an ICCID number existing. We remembered then that within that image some parts might be lowercase and some are uppercase when we look back at the brand question. So we then used "iccid" as a search term and viola <img class="emoji" title=":bowtie:" alt=":bowtie:" src="https://github.githubassets.com/images/icons/emoji/bowtie.png" width="20" height="20" align="absmiddle">:

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_iccid.png" alt="phone_iccid" width="75%" height="75%">

So we found in the /userdata/data/com.android.phone/shared_prefs/com.android.phone_preferences.xml the field key_iccid with the number **89370038009021791031** which was luckily the right one. In an actual investigation we would have no clue if that would be the searched one so we had a little advantage in this ctf.

# <a name="What is a name of audio file which is related with rifles and their price?"></a>What is a name of audio file which is related with rifles and their price?

This one was quite simple with Autopsy and probably way harder with the recommended FTK Imager viewer. We just searched for any audio file by Mime type which resulted in only 4 files and are probably not part of the OS itself. We tried them out and the 4.th one was the right one. Yeah we tried it out cause extracting them just to hear if it the right one takes longer than copying 4 values and see which one is right (͠≖ ͜ʖ͠≖)👌.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_audio_rifle.png" alt="phone_audio_rifle" width="75%" height="75%">

So the right one was **4_5956573053423979339.ogg**. By the way the 188 ones in the vorbis folder are probably the sounds from the OS itself.

# <a name="What is a name of video file which is related with tanks?"></a>What is a name of video file which is related with tanks?

Same idea as before. Instead of audio files we were looking for video files. This time we had again 4 to look into and the hint that we are searching for the one regarding tanks.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_tank_video.png" alt="phone_tank_video" width="75%" height="75%">

So these 2 for example were way easier for us then to find for example the ICCID number. Oh and of course **tanks.mp4** was the right one.

# <a name="What email address is setup on com.android.email service?"></a>What email address is setup on com.android.email service?

Okay this time the question is what account was set in the email app. We also got the hint that it is set in com.android.email and went therefor straight to /userdata/data/com.android.email and found the com.android.email_preferences.xml under shared_prefs. Which is probably the config file for the email client. Yeah we went there based on our previous searches where we already found these kind of folder structure.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_email_search.png" alt="phone_email_search" width="75%" height="75%">

There we found the used email **Joohnnycash7@gmail.com** ヽ(o＾▽＾o)ノ.

# <a name="What is a Name of device user?"></a>What is a Name of device user?

So by now our time for the event kind of run out and our 2 to 3 hours we had were kind of close to an end. So we decided to do the once we know quickly and for sure so we catch some more points  ( ͡❛ ‿‿͡❛ ).

Up until now i did not understood what a device user is. I thought it is the user presented when you set up your android device. So like with the multiple accounts. But it seems the linux representations of your current account to be ????? Whatever. This one was a long one for us cause we did not had really a clue other than what we found before. 

So after some searching around in the net, there should be something called accounts.db which contains the local configure accounts and could have the account. It was not there but we found the mail address johnsilver2598@gmail.com. When we used that to search further, we found the Accountdata.pb in /data/com.google.android.googlequicksearchbox/files/AccountData.pb which had the display name for that account (i think it is the display name). "John Silver" was the next used to search further. That lead us to /data/com.google.android.apps.dynamite/databases/user_accounts/johnsilver2598@gmail.com/dynamite.db containing interesting names again.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_john.png" alt="phone_john" width="75%" height="75%">

So we found **John** which was wrong. But we remembered and tried **john** which then was correct (ｰ ｰ;) <img class="emoji" title=":rage1:" alt=":rage1:" src="https://github.githubassets.com/images/icons/emoji/rage1.png" width="20" height="20" align="absmiddle">. So that was definitely not the right way to find that account. We were only able to pull that off cause it were only 5 accounts existing on that device and the whats app acc and the signal acc were for sure wrong. So not to many traces to search for which made it possible.

Once we had john we searched with that and which lead us to /userdata/system/users/0.xml which contained the local device user again with uppercase John but that would probably the right place to search instead our weird journey with some luck that the dynamite app stores that information's.

# <a name="What is a Username of telegram messenger?"></a>What is a Username of telegram messenger?

So that was quite easy cause of the tasks before we already found the accounts.db which not only had the email accounts also the other ones for the other applications.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_telegram.png" alt="phone_telegram" width="75%" height="75%">

So the account was **5719323092**. Maybe this one was way easier cause by now we were familiar with the image.

# <a name="Find the contact related to Russia?"></a>Find the contact related to Russia?

This time we needed to find the contact related to Russia. This was then with the support of the built in queries by Autopsy quite easy. We went to the contacts taps found the 14 contacts on the device and saw the whatsapp accounts within the wa.db file located in /data/com.whatsapp/databases/wa.db. From there we just needed to find the one associated with Russia.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_account_ru.png" alt="phone_account_ru" width="75%" height="75%">

Which in this case was **+74010724513**.

# <a name="Find the contact related to Belarus?"></a>Find the contact related to Belarus?

exact same thing as with [Find the contact related to Russia](https://github.com/bsempir0x65/CTF_Writeups/tree/main/VU_Cyberthon_2023#find-the-contact-related-to-russia).

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_account_ru.png" alt="phone_account_bl" width="75%" height="75%">

This time it was **+3751548766197**.

# <a name="What was the Bluetooth MAC Address of the device?"></a>What was the Bluetooth MAC Address of the device?

So we used our OSINT skills to figure out that this information should be in a file called bt_config.xml. Which regarding to other tips before was actually present on the image. Once found it was a piece of cake.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_bt.png" alt="phone_bt" width="75%" height="75%">

The ID according to the file is **e0:99:71:8e:05:d0** but the expected solution is in uppercase **E0:99:71:8E:05:D0**. No clue why this keeps happening.

We were very near to the end of the event so last ones were reaaally quick ones <img class="emoji" alt="runner" src="https://github.githubassets.com/images/icons/emoji/unicode/1f3c3.png" width="20" height="20">. 

# <a name="What is the name of WhatsApp user which has phone number +37062166565?"></a>What is the name of WhatsApp user which has phone number +37062166565?

Yeah we already had the wa.db open so that was also quite quick.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_account_ru.png" alt="phone_account_bl" width="75%" height="75%">

After a quick look we saw that the account was named **Marcus**.

# <a name="Based on the analysis of the video file 20221015_173902.mp4, please provide the GPS coordinates of the possible place, where video was recorded?"></a>Based on the analysis of the video file 20221015_173902.mp4, please provide the GPS coordinates of the possible place, where video was recorded?

As we already had the video files thanks to Autopsy easy and quick for access we extracted the mentioned file 20221015_173902.mp4. We then used as before the exiftool to get the GPS Data:

```console
GPS Latitude                    : 54 deg 49' 34.68" N
GPS Longitude                   : 25 deg 24' 29.88" E
```

So with that we only had to convert them in decimal which we did thanks to the us government on [converter](https://www.fcc.gov/media/radio/dms-decimal).

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/VU_Cyberthon_2023/img/phone_gps.png" alt="phone_gps" width="75%" height="75%">

Result:
Latitude: 54.8263  Longitude: 25.4083

Flag: **54.8263, 25.4083**

That was the last one we had finished in time.

# <a name="Own Opinion"></a>Own Opinion

We really liked this CTF cause it has kind of one case guiding you trough an investigation. So we could have scored a bit better if we would have had more time ;-). But that is the usual case you always have. Other than that i would suggest to the creators to convert the input first to lower case before checking or something like that cause it can be quite confusing if you have the solution but the first letter of a word was in capital and then not correct. Thank you VU Cyberthon team for this nice event.

helper found after the event:

https://cts-forensics.com/reports/20-5550_Web.pdf
https://github.com/daffainfo/ctf-writeup/tree/main/VU%20CYBERTHON%202023/What%20tank%20specs%20the%20user%20was%20looking%20for
