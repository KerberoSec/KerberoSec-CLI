# STEP 6

**Instructions:** After looking at CCTV footage, we have identified the killer to be Kaylee Ann Taylor, a 41 year old DevOps engineer at the university. Local police raided her residence, but found nobody there except her pets. Speaking to her neighbors, it turns out she left town and asked them to take care of her home for a while. So far we are investigating the house and surrounding area. Local police has taken a laptop that was left behind, this device contained a lot of files that are being looked into. However, one file on the desktop immediately stood out. So far our Red Team has not brute-forced it yet, perhaps you can have a crack at it using your knowledge of the subject? In the meantime, we’ll be checking for credit card payments, cellphone calls and local traffic cameras’. BOLO went out already and all Chicago news outlets will plaster her face on every screen possible.

Find out where Kaylee Ann Taylor is hiding.

Download the file:
https://www.dropbox.com/sh/u581lvzm2klzisw/AABd6y5KjJ2Sz53tU6mXHuD7a

# Methodology

It was pointless trying to brute force the .zip file, this CTF created by Hacktoria is an OSINT CTF, not a hacking CTF. The Hacktoria team wrote on the Hacktoria Discord Server that it would take over 22 Million years to get the password via brute force methods.
Therefore it was more of a mind game, using my brain to get inside the killer's head, and to try different words the killer would use. One post on Twitter drew my attention (see below).

<img width="596" src="https://user-images.githubusercontent.com/104733166/170837608-1307a968-5419-420a-8ff0-b3a6a48cdf25.png">

I tried various combinations, the following worked and it opened the .zip file:
```
MisterBootsCaptainFluffyMrsMittens
```
It's a great feeling when a file you have been trying to crack suddenly opens up 😈
Inside the .zip file we get the killer's flight ticket.

<img width=400 height=280 src="https://user-images.githubusercontent.com/104733166/170837789-6c4a2c69-40de-4930-90f9-312ad3b40742.jpg">
<br>
From the flight ticket, we know the killer went to Reno. I initially thought this was the end of the CTF and that the airport location had to be given as we now knew to which area the killer headed to.
But there was more...
The killer posted a photo from her Twitter account and this is the location we need to find.<br>
<br>

<img width="593" src="https://user-images.githubusercontent.com/104733166/170838015-54067e1e-ea14-4e2e-95aa-4d33ecefeda1.png">
<br>
Getting a location from this type of photo would be classed as difficult. <br>
<br>

<ins>What can we get from it?:</ins>
  <br>

- Mountains
- Very dry; probably south of Reno airport
- Posts 
- Trees
- Yellow trucks
- The photo is a screenshot from Google Streeview (We can see 2018 on the photo which shows the streetview car passed there in 2018). I tried to find information about the streeview cars activity but no website shows a record of Google Streetview cars location and date the car passed by.

I found yellow trucks used by Reno Green Landscaping, a company based in Reno, I searched their website for all their previous work, there was no photos of anything that ressembles the photo the killer posted.

If we take some time to analyze the killer's interests, she talks about Aliens a lot, seeks the truth, kills humans because she thinks they are aliens. I went all the way down to Area 51 on Google Maps but found nothing of interest. 

I went back to the Yellow trucks on the photo and concentrated all my efforts on them, found that NDOT- Nevada Department of Transportation use them https://www.dot.nv.gov <br>

<ins>Pivot</ins>: **Nevada Department of Transportation**
<br>
<br>

<img width="1909" src="https://user-images.githubusercontent.com/104733166/170838865-e5ebd865-bc71-4115-bf20-bfea6b47094a.png">
<br>
Going through all the NDOT HQ's on Google Maps, one particular location drew my attention: <br>
<br>

<img width="1894" src="https://user-images.githubusercontent.com/104733166/170838931-6d9df52e-11b2-4d1e-949a-f1fd4d42b5c8.png">
<br>
<br>

**From the above Google Maps screenshot:**
- 🟦 We can see the same posts as on the photo the killer posted
- 🟥 Space Station RV Park (This would fit with the killer's obsession with Aliens, the area also looks the same as on the photo, and the killer mentionned on Twitter that the air con was not working and that it's tiring being in a box, Space Station RV park happens to be a place for caravans: https://www.roverpass.com/c/space-station-rv-park-beatty-nv

Let's make sure it's the correct location by going into streeview.... It's a match!🎉🥳 <br>
This was huge relief and it took me over 4 days to solve.🤤

<img width="1840" src="https://user-images.githubusercontent.com/104733166/170839201-60222cfd-a439-4445-bc9c-b9dcbb76dd17.png">

---
### Flag 👽🛸👾
```
{Space Station RV Park, 400 US-95, Beatty, NV 89003, United States}
```
