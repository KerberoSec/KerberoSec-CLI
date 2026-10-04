
# ***KaffeeSec: SoMeSINT***

## *Story*

**Background Information:**

You are Aleks Juulut, a private eye based out of Greenland. You don't usually work 
digitally, but have recently discovered OSINT techniques to make that aspect of your job 
much easier. You were recently hired by a mysterious person under the moniker "H" to 
investigate a suspected cheater, named Thomas Straussman. 

After a brief phone-call with his wife, Francesca Hodgerint, you've learned that he's 
been acting suspicious lately, but she isn't sure exactly what he could be doing wrong. 
She wants you to investigate him and report back anything you find. Unfortunately, 
you're out of the country on a family emergency and cannot get back to Greenland to meet 
the deadline of the investigation, so you're going to have to do all of it digitally. 
Good luck! 

-  Who hired you?

> ks{H}

- Who are you investigating? (ks{firstname lastname})

> ks{Thomas Straussman}

---

## *Let's get started!!*

How exciting! Through talking to people who know Thomas, you've found out that he has a 
very guessable online handle: `tstraussman`. With this handle, we can find his social 
media accounts, and start off this room.

The overall process for finding information from social media accounts starts with 
finding the social media accounts themselves. Finding social media accounts from names 
or emails can be automated through a process called enumeration. This is usually done 
with CLI tools or scripts, but you can get similar effects with google dorking. Here is 
a guide on google dorking, it's great reading material before you attempt this task and 
also includes a cheat-sheet that comes in handy.

The author tells us that only Twitter and Reddit are in scope, so let's find the
account with dorks:

```
tstraussman inurl:twitter || inurl:reddit
```

- What is Thomas' favorite holiday?

After snooping around on Reddit, we find [this page](https://www.reddit.com/user/Tstraussman/comments/kh1pzg/big_thank_you/).

There's a piece of code that I couldn't figure out. But when you find [Twitter account](https://twitter.com/TStraussman), you'll see his status:

```
Buddha used to say "Peace comes from within, not from without". But for me it comes from X-mas
```

> christmass

- What is Thomas' birth date?

Pay attension to the card on the left of "Happy birthday" post on Reddit.

> 12-20-1990

- What is Thomas' fiancee's Twitter handle?

Find his wife in "Followers"

> @FHodgelink

- What is Thomas' background picture of?

> buddha

---

## *Spider... what?*

- What was the source module used to find these accounts?

> sfp_accounts

- Check the shadowban API. What is the value of "search"?

Well it's supposed to be here: https://shadowban.eu/.api/tstraussman
By I guess it just doesn't work anymore. I just found the screenshot 
of it on the web.

> ks{1346173539712380929}

--- 

## *Connections, connections..*

Get in his wife's account.

- Where did Thomas and his fiancee vacation to?

Find a post with the word "vacation" and use reverse image lookup

> koblenz, germany

- When is Francesca's Mother's birthday? (without the year)

> December 25th

- What is the name of their cat?

> Gotank

- What show does Francesca like to watch?

> 90 day fiance

---

## *Turn back the clock!!*

Using Reddit's old site, navigate to Thomas' profile. Right click anywhere on the page 
and click on Wayback machine --> All Versions. You will see a calendar that shows all of 
the saved versions of the site, click through and take a look at each saved version (in 
this case there should be none).

So it hasn't been saved yet... Nothing out of the ordinary, right?

Next, go to Thomas' birthday post. Repeat the steps to find the first version of the 
site and..... Voila!

We've discovered a coworker, which is another source of intel for us! But the question 
is... how much intel?

- What is the name of Thomas' coworker?

In Wayback Machine, input this url: https://old.reddit.com/user/Tstraussman/comments/kh1pzg/big_thank_you/
And click on saved version, dated 21 December, 2020.

> Hans Minik

- Where does his coworker live?

His Reddit profile

> Nuuk, Greenland

- What is the paste ID for the link we found? (flag format)

Checkout Hans's Reddit profile on March 23, 2021. There's a "Disappointed 2 Electric
Boogaloo" link:

https://web.archive.org/web/20210323231456/https://ghostbin.com/paste/ww4ju

> ks{ww4ju}

- Password for the next link? (flag format)

> ks{1qaz2wsx}

- What is the name of Thomas' mistress?

Visit the pastebin from the previous post in the wayback machine. Append the password
to the end of the link

> Emilia Moller

- What is Thomas' Email address?

> straussmanthom@mail.com
