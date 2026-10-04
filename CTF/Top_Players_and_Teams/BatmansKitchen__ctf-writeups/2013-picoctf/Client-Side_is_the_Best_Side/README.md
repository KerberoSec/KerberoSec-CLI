# Client-Side is the Best Side

* Problem:

  Luckily the ship has a [web-based authentication system](https://2013.picoctf.com/problems/clientside.html)! Hmm…even though you don't know the password, I bet you can still get in!

* Solution:

  Viewing the source code, we can see that there's a function called verify that will verify if our input is valid. However, it also gives out information to us the URI it is heading if the password is correct, so we can directly head to the subdomain URI and get the key, without even typing in the password. 

* Answser: 

  cl13nt_s1d3_1s_w0rst_s1d3

