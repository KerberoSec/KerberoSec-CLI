# Sniper Attack

- Sniper is the first and most common attack type.

- When conducting a sniper attack, we provide one set of payloads. For example, this could be a single file containing a wordlist or a range of numbers. 

- From here on out, we will refer to a list of items to be slotted into requests using the Burp Suite terminology of a `Payload Set`. **Intruder** will take each payload in a payload set and put it into each defined position in turn.

- Take a look at our example template from before:

  ![Screenshot (818)](https://user-images.githubusercontent.com/63872951/183304597-247d2eca-e895-40c8-95ba-26299b17bd87.png)

- There are two positions defined here, targeting the username and password body parameters.

- In a sniper attack, Intruder will take each position and substitute each payload into it in turn.

- For example, let's assume we have a wordlist with `three` words in it: ***`burp, suite, and intruder`***.

- With the `two` positions that we have above, Intruder would use these words to make `six` requests:

  |Request Number| Request Body|
  | -- | -- |
  |1 |username=burp&password=Expl01ted|
  |2| username=suite&password=Expl01ted|
  |3| username=intruder&password=Expl01ted|
  |4 |username=pentester&password=burp|
  |5 |username=pentester&password=suite|
  |6 |username=pentester&password=intruder|

- Notice how Intruder starts with the first position (username) and tries each of our payloads, then moves to the second position and tries the same payloads again. We can calculate the number of requests that Intruder Sniper will make as `requests = numberOfWords * numberOfPositions`.

- This quality makes Sniper very good for single-position attacks (e.g. a password bruteforce if we know the username or fuzzing for API endpoints).

# Answer the questions below

If you were using Sniper to fuzz three parameters in a request, with a wordlist containing 100 words, how many requests would Burp Suite need to send to complete the attack?
```
300
```
How many sets of payloads will Sniper accept for conducting an attack?
```
1
```
Sniper is good for attacks where we are only attacking a single parameter, aye or nay?
```
Aye
```
