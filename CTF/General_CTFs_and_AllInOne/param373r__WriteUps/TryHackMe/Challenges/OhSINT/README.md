# OhSINT
Are you able to use open source intelligence to solve this challenge on [TryHackMe](https://tryhackme.com/)
## Tasks

First of all let's see if we can find something in the metadata of the image:

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/1.png)

Let's see who this person really is by searching the name on google.

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/2.png)

We found 3 results for the user:
- Twitter Account
- Wordpress Blog
- Github Repo

### Twitter Account
From here we can extract his avatar that is, and bssid of user. 

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/3.png)

With bssid we can try to find out where this mac belongs to, and what is the SSID of this mac. So for that, we can go to the [site](https://wigle.net/) given in the hint of task #2.

![Image4](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/4.png)

__NOTE__: I know most of you coouldn't find the right area because you got to zoom out to the map until you see a purple circle marking the real location.

We found the city and SSID on that site, now moving on to further tasks.

### Github Repo

![Image5](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/5.png)
Here is where we find the email address and the city he is living in(not needing that as we already found that in the map). Also the answer to where we find the email of the user. Now let's go to the 3rd finding i.e. the wordpress blog.

### Wordpress Blog

![Image6](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/6.png)

Here we can find where he went for the vacation... Now for the password it took me time to find out... But it was clever of the maker to hide it here...

![Image7](https://github.com/iParamjotSingh/WriteUps/blob/master/TryHackMe/Challenges/OhSINT/7.png)

TADA!!! We got the password too...
