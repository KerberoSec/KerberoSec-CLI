# Hacking Around the World

We are presented with a page that leads to a `text/meme` page with a meme youtube video. 

As the video was long, I did not watch it. 

Taking a look at the request, we notice that every time we visit the page for the first time, a `passport` cookie was set. This cookie has a validity of 5 minutes.

As the title and challenge description states, you need to hack 'around the world'.

So the first thing I tried was to set an `X-Forwarded-For` header, which lets me 'spoof' my origin IP.

We get a response that states something like:    

```
1/10 countries:    
EU - Stockholm
```

and it sets a new cookie.

Using the new cookie and changing the `X-Forwarded-For` header to another IP, we get:    

```
2/10 countries: 
EU - Stockholm
US - Mountain View
```

And then we just do it 10 times and the flag will be returned in the curl response. 
