```
      (o)__(o)\\  //       ))   \\\  ///    (o)__(o)               ))          \\\    ///       
   wWw(__  __)(o)(o)  wWw (Oo)-.((O)(O)) wWw(__  __)          wWw (Oo)-.   /)  ((O)  (O)) wWw   
   (O)_ (  )  ||  ||  (O)_ | (_))| \ ||  (O)_ (  )            (O)_ | (_))(o)(O) | \  / |  (O)_  
  .' __) )(   |(__)| .' __)|  .' ||\\|| .' __) )(            .' __)|  .'  //\\  ||\\//|| .' __) 
 (  _)  (  )  /.--.\(  _)  )|\\  || \ |(  _)  (  )          (  _)  )|\\  |(__)| || \/ ||(  _)   
  `.__)  )/  -'    `-`.__)(/  \) ||  || `.__)  )/            )/   (/  \) /,-. | ||    || `.__)  
        (                  )    (_/  \_)      (             (      )    -'   ''(_/    \_)
```
Find the (supposed to be) confidential data in this ethernet frame. [^1]

Solution
-----------------------------------------------------------------------------------------
After downloading the challenge file `ch12.txt` we want to convert the hex dump into
human-readable ASCII text. For this, we upload the file to *CyberChef* [^2] and select
the *from hex* operation. This way, we are able to get the following output with what
seems to be the *Base64*-encoded authorization header. We can finally easily decrypt the
Base64 encoding with `base64 -d`.
```
<--snip-->
Authorization: Basic Y29uZmk6ZGVudGlhbA==
User-Agent: InsaneBrowser
Host: www.myipv6.org
Accept: */*
```

[^1]: https://www.root-me.org/en/Challenges/Network/ETHERNET-frame
[^2]: https://cyberchef.org/
