# Battering RAM Attack

- Like [Sniper](https://github.com/ShubhamJagtap2000/Burp-Suite/tree/main/10%20Attacks/01%20Sniper), Battering ram takes `one set` of payloads (e.g. one wordlist). 

- Unlike Sniper, the Battering ram puts the `same payload in every position` rather than in each position in turn.

- Let's use the same wordlist and example request as we did in the last task to illustrate this.

  ![image](https://user-images.githubusercontent.com/63872951/188081312-d0f729b3-9cc7-4d48-bf0e-8063f09afc19.png)

- If we use Battering ram to attack this, [Intruder](https://github.com/ShubhamJagtap2000/Burp-Suite/tree/main/09%20Intruder) will take each payload and substitute it into every position at once.

- With the `two positions` that we have above, Intruder would use the `three words` from before (burp, suite, and intruder) to make three requests:

|Request Number| Request Body|
|--|--|
|1|username=burp&password=burp|
|2|username=suite&password=suite|
|3|username=intruder&password=intruder|

- As can be seen in the table, each item in our list of payloads gets put into every position for each request. 

- True to the name, Battering ram just throws payloads at the target to see what sticks.

# Answer the questions below

1. As a hypothetical question: you need to perform a Battering Ram Intruder attack on the example request above.

If you have a wordlist with two words in it (admin and Guest) and the positions in the request template look like this:
username=§pentester§&password=§Expl01ted§

What would the body parameters of the first request that Burp Suite sends be?
```
username=admin&password=admin
```
