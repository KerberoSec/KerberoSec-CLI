# Pitchfork Attack

- After [Sniper](https://github.com/ShubhamJagtap2000/Burp-Suite/tree/main/10%20Attacks/01%20Sniper), [Battering RAM](https://github.com/ShubhamJagtap2000/Burp-Suite/tree/main/10%20Attacks/02%20Battering%20RAM) Pitchfork is the attack type you are most likely to use. 

- It may help to think of Pitchfork as being like having numerous Snipers running simultaneously. 

- Where Sniper uses one payload set (which it uses on ***every position simultaneously***), Pitchfork uses `one payload set per position` (up to a <ins>maximum of 20</ins>) and iterates through them `all at once`.

- This type of attack can take a little time to get your head around, so let's use our bruteforce example from before, but this time we need `two` wordlists:

    - Our first wordlist will be usernames. It contains three entries: `joel, harriet, alex`.
    - Let's say that Joel, Harriet, and Alex have had their passwords leaked: we know that Joel's password is `J03l`, Harriet's password is `Emma1815`, and Alex's password is `Sk1ll`.

- We can use these `two` lists to perform a pitchfork attack on the login form from before. 

- The process for carrying out this attack will not be covered in this task, but you will get plenty of opportunities to perform attacks like this later!

- When using Intruder in pitchfork mode, the requests made would look something like this:

|Request Number| Request Body|
|--|--|
|1|username=joel&password=J03l|
|2|username=harriet&password=Emma1815|
|3|username=alex&password=Sk1ll|

- See how Pitchfork takes the first item from each list and puts them into the request, `one per position`? 

- It then repeats this for the ***next request:*** taking the second item from each list and substituting it into the template. Intruder will keep doing this until one (or all) of the lists run out. 
- Ideally, our **payload sets should be identical lengths** when working in Pitchfork, as Intruder will `stop` testing as soon as one of the lists is complete. 
- For example, if we have two lists, one with `100` lines and one with `90` lines, Intruder will only make 90 requests, and the final `ten` items in the first list will not get tested.

- This attack type is exceptionally useful when forming things like credential stuffing attacks (we have just encountered a small-scale version of this). 

# Answer the questions below

What is the maximum number of payload sets we can load into Intruder in Pitchfork mode?
```
20
```
