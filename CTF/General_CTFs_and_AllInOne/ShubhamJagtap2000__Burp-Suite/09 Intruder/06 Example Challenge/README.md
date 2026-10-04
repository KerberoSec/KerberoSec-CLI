# Continuation of Previous Task

- The home interface shows us a table of tickets: if we click on any of the rows in the table, we get redirected to a page where we can view the full ticket. Looking at the URL, we can see that these pages are numbered, e.g.:
```
http://MACHINE_IP/support/ticket/NUMBER
```

- So, what does this mean?

- The numbering means that we know the tickets aren't being identified by hard-to-guess IDs: they are simply assigned an `integer identifier`.

- What happens if we use intruder to fuzz the `/support/ticket/NUMBER`  endpoint? One of two things will happen:

    - The endpoint has been set up correctly only to allow us to view tickets that are assigned to our current user, or
    - The endpoint has not had the correct access controls set, which would allow us to read all of the existing tickets! 
    If this is the case, then a vulnerability called an `IDOR` (Insecure Direct Object References) is present.

- Let's try fuzzing this endpoint!

# Answer the questions below

Which attack type is best suited for this task?
```
Sniper
```
Configure an appropriate position and payload (the tickets are stored at values between 1 and 100), then start the attack.

You should find that at least five tickets will be returned with a status code of 200, indicating that they exist.
```
No answer needed
```
Either using the Response tab in the Attack Results window or by looking at each successful (i.e. 200 code) request manually in your browser, find the ticket that contains the flag.

What is the flag?
```
THM{MTMxNTg5NTUzMWM0OWRlYzUzMDVjMzJl}
```
