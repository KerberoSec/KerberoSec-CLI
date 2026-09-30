```                     
    //   ) )          //   ) )  / /    /|    / / /__  ___/ 
   //   / / / __     ((        / /    //|   / /    / /     
  //   / / //   ) )    \\     / /    // |  / /    / /      
 //   / / //   / /       ) ) / /    //  | / /    / /       
((___/ / //   / / ((___ / /_/ /___ //   |/ /    / /
```
Are you able to use open source intelligence to solve this challenge? [^1]

What is this user's avatar of?
-----------------------------------------------------------------------------------------
Upon downloading the task file, we are presented with the classic Windows XP background.
We can now obtain the author of the image with `exiftool -xmp:author:all -a
WindowsXP.jpg`, which is *OWoodflint*. Next, we search for the username in a search
engine of our choice and retrieve the user's twitter account. [^2] We can see, that their
profile picture features a *cat*.

What city is this person in?
-----------------------------------------------------------------------------------------
The target published their unique *BSSID* address in this Twitter post. [^3] Since a
BSSID is the router's MAC address, this is sensitive information that can reveal a
person's physical location with the web tool `wigle.net`. [^4] We enter the BSSID
`B4:5D:50:AA:86:41` in the basic search of `wigle.net` and discover its location in
*London*.

What is the SSID of the WAP he connected to?
-----------------------------------------------------------------------------------------
This builds up on the previous query in `wigle.net` and for this question, we need to
zoom in very closely to view the SSID network name. Alternatively, it is possible to use
the advanced network search and enter the BSSID there. Therefore, the SSID is assigned to
the name *UnileverWiFi* on the Charles II street.

What is his personal email address?
-----------------------------------------------------------------------------------------
A quick google search of the username additionally provides us with the target's GitHub
account. [^5] In the *README* of the repository, they revealed their email address to be
`OWoodflint@gmail.com`.

What site did you find his email address on?
-----------------------------------------------------------------------------------------
The email address was discovered on *GitHub*. [^5]

Where has he gone on holiday?
-----------------------------------------------------------------------------------------
Alongside the Twitter account and GitHub profile, the target also maintains a blog on
WordPress. [^6] Here, they state that they are on vacation in *New York*.

What is the person's password?
-----------------------------------------------------------------------------------------
The hint tells us to check the website's source code which will then reveal the target's
password for us after searching for the content. If we do as instructed, we see that the
content on the website contains an additional `pennYDr0pper.!` password field.

[^1]: https://tryhackme.com/room/ohsint
[^2]: https://twitter.com/OWoodflint
[^3]: https://x.com/OWoodflint/status/1102220421091463168
[^4]: https://wigle.net/
[^5]: https://github.com/OWoodfl1nt/people_finder
[^6]: https://oliverwoodflint.wordpress.com/author/owoodflint/
