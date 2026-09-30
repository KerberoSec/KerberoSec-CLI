# Certificate

| 📁 Category  |  👨‍💻 Creator |
|---------------|-------------|
 Web            | Eth007

**Description:**
> As a thank you for playing our CTF, we're giving out participation certificates! Each one comes with a custom flag, but I bet you can't get the flag belonging to Eth007!
> 
> https://eth007.me/cert/

## My solution
This challenge was fairly simple, with the app being only client-side, meaning all source code we need is visible directly from the browser.

First, I clicked around the app, getting familiar with the general structure. We have a simple website where we can generate participation certificates, with a simple form to input our information. For this challenge, we don't want our participation certificate though, but the one of the challenge creator, Eth007.

The catch is, when we enter "Eth007" as the name, our certificate is redacted, and there are no signs of a flag. 

<img width="1634" height="925" alt="image" src="https://github.com/user-attachments/assets/6203675f-9685-4de0-9f5a-a2c6cc8dbc7c" />

This means that we will dig directly into the code, which fortunately is directly readable from the browser! It is simple client-side Javascript and not minified or obfuscated, so we can simply skim the code to understand how it works.

After just a bit of skimming, we can see that there is a handy function named `makeFlag`:

<img width="256" height="84" alt="makeFlag" src="https://github.com/user-attachments/assets/d224f5a5-16f2-495a-a118-83d2f153796c" />

So we can just use it straight from the browser console to generate the flag for user `Eth007`:

<img width="150" height="43" alt="image" src="https://github.com/user-attachments/assets/f1a43b87-7fe5-4f04-8f17-d8bed2788d79" />

That's the flag, so we have successfully solved the challenge! 🎉
