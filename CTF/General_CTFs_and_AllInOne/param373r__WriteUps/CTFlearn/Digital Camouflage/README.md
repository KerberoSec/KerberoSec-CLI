# Digital Camouflage
## About

### General Information

__Challenge Description__: We need to gain access to some routers. Let's try and see if we can find the password in the captured network data; Hint 1: It looks like someone logged in with their password earlier. Where would log in data be located in a network capture?; Hint 2: If you think you found the flag, but it doesn't work, consider that the data may be encrypted.

__Challege Category__: FORENSICS

__Challenge Difficulty__: Medium

__Skills__: Observational

__Tools__: Wireshark

Download the file [here.](https://mega.nz/#!XDBDRAQD!4jRcJvAhMkaVaZCOT3z3zkyHre2KHfmkbCN5lYpiEoY)

## Solution

After firing up the wireshark and opening the file in it... Let's take a moment to see what is it with this password... The hint 1 says someone recently logged into the router and now we have to find the password from the network capture. Well it's quite simple as we know the login auth usually takes place through the http protocol... So let's add the filter to http to narrow down our search.

Now let's follow the TCP stream through right clicking the first packet > Follow > TCP Stream, and go through each stream... And you will notice, a login post request to the router which gives you the user's  password in base64 format.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Digital%20Camouflage/1.png)

NOTE: Those %3Ds are HTML url-encoding corresponding to there ascii digits i.e. equal to '=' symbol. You can find a list to these url-encodings in [references](#References) section below.

Just copy the password and decode it with command ```echo "<password found>" | base64 -d```, after changing the %3D symbols with '=' symbol.

![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/Digital%20Camouflage/2.png)

__Flag__: PApdsjRTae

## References

[List of HTML Entities](https://www.w3schools.com/tags/ref_urlencode.ASP)
