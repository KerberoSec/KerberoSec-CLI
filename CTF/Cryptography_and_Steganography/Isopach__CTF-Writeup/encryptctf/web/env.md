# Env
We are given yet another meme landing page with hints of 'time' and 'timing'.      
Let's check the hints on the challenge page itself:         
meme1 has paths `/home` and `/whatsthetime`             
Lets try bruteforce a number of combinations (`/`, `/static`, `/home`, `/<string>`, `/whatsthetime`)         

And we get a hit when we call the following:       
`http://104.154.106.182:6060/whatsthetime/1`         
The hint says we are not getting the correct time.           
So it seems like we might need to guess the epoch time. And epoch time of what? If I were to guess, it's the time of the server.

Let's try putting the date in.
```
curl -v http://104.154.106.182:6060/whatsthetime/`date +%s`
```

And we get the flag in the response!

<details>
  <summary>FLAG</summary>   
   
  `{"flag":"encryptCTF{v1rtualenvs_4re_c00l}"}`

</details>
