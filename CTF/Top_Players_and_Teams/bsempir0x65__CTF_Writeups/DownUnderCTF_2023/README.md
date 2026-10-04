# <a name="DUCTF"></a>DUCTF

We came back to DUCTF once again, 'cause we had good memory's last time about it and it fitted our time schedule. We also try to write some solutions down for the Contest but we know that we will probably only repeat what you can already find on the excellent [github](https://github.com/DownUnderCTF/Challenges_2023_Public) from DUCTF. So we hope one or two of you like our version even it is kinda late to publish. 

P.S: Just so you know we are so late that we can't even make screenshots of the original challenges anymore (≧▽≦).

# <a name="blinkybill"></a>blinkybill

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/blinkybill_1.png" alt="Blinky Bill" width="75%" height="75%">

In this challenge we got a sound file provided which we think has the theme song of a kids tv show called "The Adventures of Blinky Bill" and some weird beeping noises when you listen to it. In the past we had similar tasks, so we assumed that the beeping noise is some morse code. Together with [audacity](https://www.audacityteam.org/) we tried to filter out the morse code.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/blinkybill_2.png" alt="Blinky Bill" width="75%" height="75%">

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/blinkybill_3.png" alt="Blinky Bill" width="75%" height="75%">

So to figure out where you need to cut out frequencies we used the frequencies analysis tool of audacity at around 752HZ. We then tried to use an online tool to find the different characters but we failed. Probably our resulting sound file was not good enough so we did the rest by hand and used [cyberchef](https://gchq.github.io/CyberChef/#recipe=From_Morse_Code('Space','Line%20feed')&input=LS4uLgouLS4KLi4KLS4KLS0uCi0uLi4KLi0KLS4tLgotLi0KLQouLi4uCi4KLQouLS4KLgouCi4uLg) to make some words out of it for us (｡•̀ᴗ-)✧:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/blinkybill_4.png" alt="Blinky Bill" width="75%" height="75%">

> -...
> .-.
> ..
> -.
> --.
> -...
> .-
> -.-.
> -.-
> -
> ....
> .
> -
> .-.
> .
> .
> ...

Flag: DUCTF{BRINGBACKTHETREES} 

Nice little challenge in which we had some hassling with the tools

# <a name="bridgetsback"></a>bridgetsback

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/bridgetsback_1.png" alt="bridgets back" width="75%" height="75%">

In this challenge we got a pic of a bridge and the question where this pic was taken. So for this you can either ask chatgpt or [google lens](https://www.google.com/imghp?hl=en)

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/bridgetsback_2.png" alt="bridgets back" width="75%" height="75%">

to tell you that it is a pic of the golden gate bridge. For us it was really tough to say from which side the pic was taken but somehow ChatGPT knew it was taken from the north side of the bridge 'cause you can see San francisco in it (?!?). We then recognized that you can see a curve of the road so it must be taken behind that. We checked on [google maps](https://www.google.com/maps/place/Golden+Gate+Bridge/@37.8323174,-122.4806974,16z/data=!4m6!3m5!1s0x808586deffffffc3:0xcded139783705759!8m2!3d37.8199286!4d-122.4782551!16zL20vMDM1cDM?entry=ttu) for some places which might fit for a traveler. We found a place called H. Dana Bowers Rest Area & Vista Point: Northbound and tried it with the hints on how to put in the flag and voila ヽ(ヅ)ノ there we have it.

Flag: DUCTF{H._Dana_Bowers_Memorial_Vista_Point}

A nice little challenge actually (o^^)o(^^o).

# <a name="comeacroppa"></a>comeacroppa

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/comeacroppa_1.png" alt="comeacroppa" width="75%" height="75%">

To be fair we had no clue what to do in a meaningful way to solve this challenge. We are not familiar with the suburbs in australia and based on the pic we got we did not see anything which might help us. We asked first ChatGPT first, which failed. It just explains to us what it can see. DUUUHA so only things we already knew. So we tried google lens again.

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/comeacroppa_2.png" alt="comeacroppa" width="75%" height="75%">

It focused then automatically its search on the house you can see on the right side of the pic and boom there is a pic on a [museums webpage](https://tours.maldonmuseum.com.au/index.php/mobile/walks/9#site.47) which looks the same. It randomly had an address on it and we tried that as a flag.

Flag: DUCTF{Maldon} 

And it was correct. No clue what was the intended way, but we take that without having any clue. I mean even the signs on the pic we had were not really on the google pic, but luckily no one else built such a house and put it on the net.

# <a name="eightfivefourfive"></a>eightfivefourfive

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/eightfivefourfive_1.png" alt="eightfivefourfive" width="75%" height="75%">

So this one was basically a check if everything works, by executing the contract. For that we used the tool [remix](https://remix.ethereum.org/#lang=en&optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.19+commit.7dd6d404.js) and you need to ensure that you use version 0.8.19. Next you needed to put all the info from the challenge in the tool and execute readTheStringHere() first to get the string you need for the function solve_the_challenge which then sets the challenge to "issolved", so that you get the flag. Here a little pic where you put what:

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/eightfivefourfive_2.png" alt="eightfivefourfive" width="75%" height="75%">

FLAG: DUCTF{I_can_connect_to_8545_pretty_epic:)}

Nice little challenge ╰(°∇≦*)╮.

# <a name="excellentvista"></a>excellentvista

 <img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/excellentvista_1.png" alt="excellentvista" width="75%" height="75%">

So for this challenge we got another pic with the hints in the challenge that we should "EXAMINE" it for its position. So we used a tool called [exiftool](https://exiftool.org/) to read out the meta information of the pic. It had the coordinates baked in:

```console
└─$ exiftool ExcellentVista.jpg 
ExifTool Version Number         : 12.57
File Name                       : ExcellentVista.jpg
Directory                       : .
File Size                       : 2.7 MB
File Modification Date/Time     : 2023:09:02 21:26:54+02:00
File Access Date/Time           : 2023:09:18 20:57:55+02:00
File Inode Change Date/Time     : 2023:09:02 21:27:16+02:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
Exif Byte Order                 : Big-endian (Motorola, MM)
X Resolution                    : 72
Y Resolution                    : 72
Resolution Unit                 : inches
Y Cb Cr Positioning             : Centered
Date/Time Original              : 2023:08:31 22:58:56
Create Date                     : 2023:08:31 22:58:56
Sub Sec Time Original           : 00
Sub Sec Time Digitized          : 00
GPS Version ID                  : 2.3.0.0
GPS Latitude Ref                : South
GPS Longitude Ref               : East
GPS Altitude Ref                : Above Sea Level
GPS Speed Ref                   : km/h
GPS Speed                       : 0
GPS Img Direction Ref           : True North
GPS Img Direction               : 122.5013812
GPS Dest Bearing Ref            : True North
GPS Dest Bearing                : 122.5013812
GPS Horizontal Positioning Error: 6.055886243 m
Padding                         : (Binary data 2060 bytes, use -b option to extract)
About                           : uuid:faf5bdd5-ba3d-11da-ad31-d33d75182f1b
Image Width                     : 4032
Image Height                    : 3024
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 4032x3024
Megapixels                      : 12.2
Create Date                     : 2023:08:31 22:58:56.00
Date/Time Original              : 2023:08:31 22:58:56.00
GPS Altitude                    : 70.5 m Above Sea Level
GPS Latitude                    : 29 deg 30' 34.33" S
GPS Longitude                   : 153 deg 21' 34.46" E
GPS Position                    : 29 deg 30' 34.33" S, 153 deg 21' 34.46" E
```

As you can see the Latitude and Longitude is there and when we put that into [google maps](https://www.google.com/maps/place/29%C2%B030'34.3%22S+153%C2%B021'34.5%22E/@-29.5503423,153.3447416,17z/data=!4m4!3m3!8m2!3d-29.5095278!4d153.3595833?entry=ttu) we get a nice place which next to it has a little lookout to make nice pictures from. Which brings us the flag.

Flag: DUCTF{Durrangan_Lookout} 

# <a name="faraday"></a>faraday

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/faraday_1.png" alt="faraday" width="75%" height="75%">

This one was really tough for us. So we got an api presented in which we can check whether a phone number is in a certain radius present around a given location or not. Based on the challenge description we knew which phone number is searched and a rough area where we need to search for it. So we checked the state of Victoria and one of the bigger city if we already have a hit. We did for melbourne, Gotcha ♥（ﾉ´∀`）. We gradually tried to do it by hand and saw that this will not work out. So we built a script:

```python
import requests
import numpy as np

#141 - 149

#-34,2 - 38,5

latitude = -37.8140
longitude = 144.9633

for lat in np.arange(-36.4700, -34.2000, 0.01):
    for long in np.arange(146.4000, 146.4600, 0.01):

        url = 'https://osint-faraday-9e36cbd6acad.2023.ductf.dev/verify'
        myobj = {
            "device": {
            "phoneNumber": "+61491578888"
            },
            "area": {
            "areaType": "Circle",
            "center": {
                "latitude": lat,
                "longitude": long
            },
            "radius": 2000
            },
            "maxAge": 120
        }

        response = requests.post(url, json = myobj)
        print("lat:", lat, "long:", long)

        # Store JSON data in API_Data
        API_Data = response.json()
        
        # Print json data using loop
        for key in API_Data:
            if key == "verificationResult":
                if API_Data[key] == 'TRUE':
                    print(key,":", API_Data[key]) 
                    print("latitude:", lat, "longitude:", long)
```

You can see we know some things. The longitude is between 141: 149 and the latitude is between -34,2: -38,5. So what the script does is take the input and check if we have a hit. If so, write out the coordinates for it. Unfortunately we do not have the logic implemented to automatically search the right cords, you have to decrease the range of the script by hand otherwise it will take forever. But once we had the script it took maybe 10 minutes to find the outer rim of the circle. Which brought us [here](https://www.google.com/maps/place/36%C2%B028'12.0%22S+146%C2%B025'48.0%22E/@-36.4662037,146.4115249,13z/data=!4m4!3m3!8m2!3d-36.47!4d146.43?entry=ttu).

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/faraday_2.png" alt="faraday" width="75%" height="75%">

So based the fact that only one city was visible we tried it out and had the flag.

Flag: DUCTF{milawa}

♡＼(￣▽￣)／♡ We have to admit that there are probably way better solutions out there which change the radius and the arrays automatically based on the findings. But yeah we have it this way and maybe this helps someone else.

# <a name="helpless"></a>helpless

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/helpless_1.png" alt="helpless" width="75%" height="75%">

For this challenge we connected to the given server via ssh and got the help prompt from python. It took us a bit to figure out what to do, but eventually we opened some help files for some functions of python and recognized that all of them were opened with less. So we then checked the net if you can open files once you are in [less, which you can](https://superuser.com/questions/347760/less-command-with-multiple-files-how-to-navigate-to-next-previous).

So once we had that it was a quick win. You open any help file like "TRUE" and then use ":e" to open a different file like /home/ductf/flag.txt and get the flag.

FLAG: DUCTF{sometimes_less_is_more}

# <a name="welcome"></a>welcome

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/welcome_1.png" alt="welcome" width="75%" height="75%">

We remembered that one from the last time we participated in DUCTF. But if this is the first time you can easily figure out that the file extension .aplusplus leads to the [website](https://aussieplusplus.vercel.app/#code). You then just need to take the example let it rotate via button "upsidedown" and then copy the script we got from the author.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/welcome_2.png" alt="welcome" width="75%" height="75%">

We really like that challenge and hope to see it again next year and !MAte Flag: DUCTF{1ts-5oCl0ck_5om3wh3rE}

# <a name="X"></a>X

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/x_1.png" alt="x" width="75%" height="75%">

Based on the challenge name we saw some new tweets from DownUnderCTF on Twitter/X for [example](https://twitter.com/DownUnderCTF/status/1697304493409337835). All these posts had at least one pic with a portion of the Flag. Once you put all together you get:

Flag: DUCTF{ThanksEl0nWeCantCall1tTheTW1tterFl4gN0w}

# <a name="proxed"></a>proxed

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/proxed_1.png" alt="proxed" width="75%" height="75%">

We got an application presented by the author. When you have a closer look you can see here

```go
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		xff := r.Header.Values("X-Forwarded-For")

		ip := strings.Split(r.RemoteAddr, ":")[0]

		if xff != nil {
			ips := strings.Split(xff[len(xff)-1], ", ")
			ip = ips[len(ips)-1]
			ip = strings.TrimSpace(ip)
		}

		if ip != "31.33.33.7" {
			message := fmt.Sprintf("untrusted IP: %s", ip)
			http.Error(w, message, http.StatusForbidden)
			return
		} else {
			w.Write([]byte(os.Getenv("FLAG")))
```

that if we have the ip "31.33.33.7" we get the flag. Interesting if the header has the value "X-Forwarded-For" set it takes these as the RemoteAddr. So we set the header to the required IP and (-‿◦☀) got the flag. You can either edit via https://addons.mozilla.org/en-US/firefox/addon/x-forwarded-for-injector/ or directly via setting it in firefox:

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/proxed_2.png" alt="proxed" width="75%" height="75%">

Flag: Flag: DUCTF{17_533m5_w3_f0rg07_70_pr0x}

# <a name="recap"></a>recap

It was a bit of a rush to write all this and there are probably way better solutions. But we love to see the effort from the guys downunder for the itsec community to create the event and encourage others to share knowledge so we try to do the same and had a good time with it. Hope others join in as well and congrats to the winner of the Write up prizes, see you next time.

<img src="https://raw.githubusercontent.com/bsempir0x65/CTF_Writeups/main/DownUnderCTF_2023/img/progress2.png" alt="progress" width="75%" height="75%">