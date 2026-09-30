# JWT: Introduction 

Here we go again. we have got a login page and there is also a feature for `guest` login. As the challenge name suggestes, we need to access the admin panel to get the `flag` i.e. `password`, 

So, I just logged in as guest to figure out the request and responce. 

<img  alt="image" src="https://github.com/user-attachments/assets/92c53262-1ca7-4c73-9ac7-c8b2eb5760b7" />

steps: 
1. I already set up the `JWT Editor` extension in my burp, in order to play with tokens. 
2. I just grab the request for `guest` login. and its seems like the `username` we have is `guest`, I tried to change it to `admin` but no luck. 
3. There also you can see the `HS256` algorithm used, I tried to change it to `none` .
   
<img alt="image" src="https://github.com/user-attachments/assets/e145d585-09e2-4730-a37d-acbcbc46fd80" />

And wallah, we got the admin access. 

<img alt="image" src="https://github.com/user-attachments/assets/e145d585-09e2-4730-a37d-acbcbc46fd80" />

The password is `S1gn4tuR3_v3r1f1c4t10N_1S_1MP0Rt4n7`
