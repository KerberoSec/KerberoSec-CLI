![image1](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image1.png)
[![TryHackMe](https://img.shields.io/badge/TryHackMe-1abc9c?style=flat-square&logo=tryhackme&logoColor=white)](https://tryhackme.com/room/corridor)

# Corridor: IDOR Walkthrough

As you go through the site you can see that each door goes to a different room. But each room has a closed off room as shown.

![image2](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image2.png)

Each room corresponds with a hash value like this: Starting from left to right.
 - [![Door Badge](https://img.shields.io/badge/Door_1:-c4ca4238a0b923820dcc509a6f75849b-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_2:-c81e728d9d4c2f636f067f89cc14862c-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_3:-eccbc87e4b5ce2fe28308fd9f2a7baf3-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_4:-a87ff679a2f3e71d9181a67b7542122c-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_5:-e4da3b7fbbce2345d7772b0674a318d5-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_6:-1679091c5a880faf6fb5e6087eb1b2dc-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Center_Door:-8f14e45fceea167a5a36dedd4bea2543-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_8:-c51ce410c124a10e0db5e4b97fc2af39-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_9:-c20ad4d76fe97759aa27a0c99bff6710-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_10:-6512bd43d9caa6e02c990b0a82652dca-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_11:-d3d9446802a44259755d38e6d163e820-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_12:-45c48cce2e2d7fbdea1afc51c7c6ad26-blue)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_13:-c9f0f895fb98ab9159f51fd0297e236d-blue)](https://shields.io/)

Now we have to figure out what this all means and what this information can be used for in a hacker mind set. We can try changing a character and see if we get any results on the webpage. Changing a couple characters on this string for example, `8f14e45fceea167a5a36dedd4bea2543` to `8f14e45fceea167a5a36dedd4bea2577` would respond with:

> Not Found: The requested URL was not found on the server. If you entered the URL manually, please check your spelling and try again. 

With this information we can see that adding random numbers to the string will not respond with anything interesting. If we are looking into the source code, we can see the same results.

![image3](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image3.png)

![image4](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image4.png)

The source code is still showing only a total of 13 doors as well. After digging around I was able to find this as well.

![image5](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image5.png)

This was showing a SHA384 encryption. So maybe the rest of the doors are also using some sort of encryption method as well. Doing some Googleing on encryption and hashing. I was able to find this link here  [Hashes](https://hashes.com/en/tools/hash_identifier).

We can submit the hash values into the search bar in Hash Type Identifier and see what we come up with.

![image6](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image6.png)

After finding out it is using a MD5 encryption we can start using that with the doors and see what the results would be. I was able to go back to the home page of Hashes.com and search my results for Door 13. The results came back with `c9f0f895fb98ab9159f51fd0297e236d:8`. This would mean that each door is using a MD5 encryption the result in a single digit. This would mean that each single digit would corresponds to an MD5 hash.

So, let's submit each door and see what numbers correspond to what MD5 hash.
 - [![Door Badge](https://img.shields.io/badge/Door_1:-c4ca4238a0b923820dcc509a6f75849b:1-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_2:-c81e728d9d4c2f636f067f89cc14862c:2-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_3:-eccbc87e4b5ce2fe28308fd9f2a7baf3:3-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_4:-a87ff679a2f3e71d9181a67b7542122c:4-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_5:-e4da3b7fbbce2345d7772b0674a318d5:5-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_6:-1679091c5a880faf6fb5e6087eb1b2dc:6-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Center_Door:-8f14e45fceea167a5a36dedd4bea2543:7-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_8:-c51ce410c124a10e0db5e4b97fc2af39:8-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_9:-c20ad4d76fe97759aa27a0c99bff6710:9-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_10:-6512bd43d9caa6e02c990b0a82652dca:10-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_11:-d3d9446802a44259755d38e6d163e820:11-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_12:-45c48cce2e2d7fbdea1afc51c7c6ad26:12-red)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_13:-c9f0f895fb98ab9159f51fd0297e236d:13-red)](https://shields.io/)

Now that we have done that the next this is to find out what number beyond 1: 13 can we use to access a different room. The two numbers we can use is 14 and 0. We would need to add those numbers to a MD5 Hash in order to get their value. I would use the terminal on Linux in order to get a MD5 value with the string of values.

![image7](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image7.png)

Now that we came up with the same hash value as Door 1 we can now use different values to see what MD5 Hash values we come up with like 0 and 14.

![image8](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image8.png)

 - [![Door Badge](https://img.shields.io/badge/Door_0:-45c48cce2e2d7fbdea1afc51c7c6ad26:0-orange)](https://shields.io/)
 - [![Door Badge](https://img.shields.io/badge/Door_14:-aab3238922bcc25a6f606eb525ffdc56:14-orange)](https://shields.io/)

Now that we have done that, we can test it against the site and see what we come up with.

![image9](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image9.png)

I came back with a 404 not found message for room 14. Next, we will try room 0 and see what pops up.

![image10](https://github.com/visionthex/IDOR-Walkthrough/blob/main/Images/image10.png)

We finally found the Flag for the room exercise. From here you would submit the flag and complete the room. This was a great exercise to learn at the same time be able to figure out how to do a write up for this room as well.

I would like to give thanks to [![John Hammond](https://img.shields.io/badge/John%20Hammond-1abc9c?style=flat-square)](https://www.linkedin.com/in/johnhammond010/) for created this room.

