```
______                 _____                 _ _ _   _
| ___ \               /  __ \               | (_) | (_)                
| |_/ /__ _  ___ ___  | /  \/ ___  _ __   __| |_| |_ _  ___  _ __  ___ 
|    // _` |/ __/ _ \ | |    / _ \| '_ \ / _` | | __| |/ _ \| '_ \/ __|
| |\ \ (_| | (_|  __/ | \__/\ (_) | | | | (_| | | |_| | (_) | | | \__ \
\_| \_\__,_|\___\___|  \____/\___/|_| |_|\__,_|_|\__|_|\___/|_| |_|___/
```
In this TryHackMe walkthrough room, we learn about race conditions and how they affect
web application security. [^1]

Question 1
-----------------------------------------------------------------------------------------
**What would an instruction booklet on how to make an origami crane resemble in computer
terms?**

In the multi-threading introduction we have been intruduced to the terms *program*,
*process* and *thread*. One of these three concepts defines a set of instructions to
achieve a specific task which would match to the origami booklet analogy.

Question 2
-----------------------------------------------------------------------------------------
**What is the name of the state where a process is waiting for an I/O event?**

We have learned that processes hop between different states. First, they launch in the
*ready* state to run once given CPU time and then they move to the *running* state. This
happens quickly, so that most processes spend the most time in a *waiting* state pending
for I/O event changes.

Question 3
-----------------------------------------------------------------------------------------
**Does the presented Python script guarantee which thread will reach 100% first?**

We have seen that running the Python script multiple times results in different outcomes.
In the first attempt, the second thread reaches completion first, while in another
attempt, the first thread reaches completion first.

Question 4
-----------------------------------------------------------------------------------------
**In the second execution of the Python script, what is the name of the thread that
reached 100% first?**

In the second execution, we could see that the first thread reaches completion before the
second one does.

Question 5
-----------------------------------------------------------------------------------------
**How many states did the original state diagram of “validating and conducting money
transfer” have?**

The example of transferring money to another accound progresses through three steps.
First, the user clicks on the "Confirm Transfer" button, then the application queries the
database to confirm that the account balance can cover the transfer amount, to which the
database responds. In this idealistic scenario, there are only *two* states, either the
amount is sent or it is not sent.

Question 6
-----------------------------------------------------------------------------------------
**How many states did the updated state diagram of “validating and conducting money
transfer” have?**

The two states are too simplistic, instead we want to add an intermediate state to check
the account balance in between the other states. This way, we will have *three* states to
depict the money transfer procedure.

Question 7
-----------------------------------------------------------------------------------------
**How many states did the final state diagram of “validating coupon codes and applying
discounts” have?**

Depending on how sophisticated the application becomes, we can have *five* states to
further classify the validity, constraints checks and recalculating the new amount. We
can now discover that an easy procedure, such as checking the balance before sending
money, takes a certain amount of time during which race conditions can occur.

Question 8
-----------------------------------------------------------------------------------------
**You need to get either of the accounts to get more than $100 of credit to get the flag.
What is the flag that you obtained?**

Upon logging in to the web application with one of the given credentials, we are prompted
with a phone credit transfer dashboard. It is our objective now, to check if this system
is suspectible to a race condition vulnerability. For this, the *Burp Suite Proxy* is of
use, where we can intercept requests sent to the web application. By trying to open a
browser, we are prompted with an error that tells us, that the OS does not support Burp
Suite's browser running without a sandbox. So, we navigate to the settings and click on
"Burp's browser" in the tools tab to "Allow Burp's browser to run without a sandbox" and
open the browser again. While the intercept is off, we can now proceed to logging in
again and then turn on the intercept. Next, we want to click on the *Pay & Recharge*
button to make a transaction to the other account, to which we are still logged in, in
our non-intercepted browser, i.e. Firefox. We start with a small amount, e.g. $1 and
watch the current balance change from $8.12 to a higher amount. In the intercepted POST
request, we can now see the details with the target phone number and the transfer amount
as follows. The goal is not to exploit a race condition vulnerability with this.
```url
targetPhoneNumber=%28077%29+9999-1337&confirmTargetPhoneNumber=%28077%29+9999-1337&amount=1
```
First, we send the POST request that was not yet forwarded to the *Repeater* and then
duplicate it in a tab group created for this purpose. Next, we want to send this group in
parallel, not in sequence since we want to target race conditions and not client-side
desync vectors or multi-step processes. [^2] Since the request uses *HTTP/1.1* to send
the data, th repeater uses last-byte synchronization, where multiple requests are sent
over concurrent connections, but the last byte of each request in the group is withheld.
Having done, this we can now see our account go into a negative balance while the other
one goes up to $29.99. Since we aim for a credit of $100, this race condition exploit
did not exceed it's expectations and we try again. However, since our account is in a
negative balance now, we have to log in to the other account and transact money to our
negative balance account. This time, we transact $2 each in 100 parallel requests, which
results in a new balance of $292.99 and the flag printed in the header of the other
account's dashboard.

Question 9
-----------------------------------------------------------------------------------------
**What flag did you obtain after getting an account’s balance above $1000?**

At first, we log in to Rasser Cond's account on our non-intercepted Firefox browser and
recognize the balance of $100 which we aim to increase through race condition
exploitation. Then, in the intercepted Chrome browser, we log in with Zavodni Stav's
credentials and also discover a balance of $100. We move to the transfer page for our
favorite contact, Rasser Cond, and start with the amount $10. Instead of redirecting
this POST request, we now send it to the *Repeater* and duplicate it in a group for the
maximum amount of 100. All those requests in the group can now be sent in parallel, upon
which the target account gains a balance of over $733, yet not $1000. Since our victim
account, lost some money on the way (it didn't reach below zero yet), we repeat the same
procedure with the third account. Warunki Wyscigu's account still has a balance of $100,
inviting us to use it for another race condition exploitation. This time, we intercept
the POST request in Burp Suite again but send $20 each and create 100 duplicates in the
groups tab of the repeater. Upon sending all the requests in the group in parallel, we
are able to get a balance higher than a thousand dollars paired with the flag.

[^1]: https://tryhackme.com/room/raceconditionsattacks
[^2]: https://portswigger.net/burp/documentation/desktop/tools/repeater/send-group
