# Cluster Bomb Attack

- Cluster bomb allows us to choose `multiple payload sets`: one per position, up to a **maximum** of `20`; however, whilst Pitchfork iterates through each payload set simultaneously, Cluster bomb iterates through <ins>each payload set individually</ins>, making sure that every possible combination of payloads is tested.

- Again, the best way to visualise this is with an example.

- Let's use the same wordlists as before:

   - **Usernames:** `joel, harriet, alex`
   - **Passwords:** `J03l, Emma1815, Sk1ll`

- But, this time, let's `assume` that we `don't know` which password belongs to which user. We have three users and three passwords, but we don't know how to match them up. 

- In this case, we would use a cluster bomb attack; this will try every combination of values. The request table for our username and password positions looks something like this:

|Request| Numbes Request Body|
|--|--|
|1|username=joel&password=J03l|
|2|username=harriet&password=J03l|
|3|username=alex&password=J03l|
|4|username=joel&password=Emma1815|
|5|username=harriet&password=Emma1815|
|6|username=alex&password=Emma1815|
|7|username=joel&password=Sk1ll|
|8|username=harriet&password=Sk1ll|
|9|username=alex&password=Sk1ll|

- Cluster Bomb will iterate through every combination of the provided payload sets to ensure that every possibility has been tested. 

- This attack-type can create a huge amount of traffic (equal to the number of lines in each payload set multiplied together), so be careful! 
- Equally, when using Burp Community and its Intruder rate-limiting, be aware that a Cluster Bomb attack with any moderately sized payload set will take an incredibly long time.

- That said, this is another extremely useful attack type for any kind of credential bruteforcing where a username isn't known.

#

# Answer the questions below

We have three payload sets. The first set contains 100 lines; the second contains 2 lines; and the third contains 30 lines.

How many requests will Intruder make using these payload sets in a Cluster Bomb attack?
```
6000
```

#

# Next:

- Link to the next, [Payloads](https://github.com/ShubhamJagtap2000/Burp-Suite/tree/main/09%20Intruder/04%20Payloads) section.
