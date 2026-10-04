## **What is authentication?**

Authentication is the process of verifying the identity of a user or client.

Authentication is the process of checking you are the user you said to be. Authorization is the process of validating you have access for the process.

Poor code or logic makes an attacker to bypass authentication mechanism → “Broken Authentication”

High-privileged user access can’t be exploited in public websites. But once you have low-user acc for the website, which normal people shouldn’t have, then you able to do privilege-escalation on your access.

TIP : Occasionally, responses contain email addresses of high-privileged users, such as administrators or IT support.

If a login page asks for username and password, first we can do username bruteforce by using burp-intruder. Check each request, and response for each username that is bruteforced. Response, and length may vary for proper username when compared to other response

Similarly some times in response there will be a message like “invalid username or password.” and for correct username there will be a typo here or no fullstop. 

### **Username enumeration via response timing:**

In some poorly-configured backend systems ip-address might be fetched from user-controlled headers like  “ X-Forwarded-For “

```bash
client_ip = request.headers.get("X-Forwarded-For") or request.remote_addr
```

There by we can use this header in our burp → X-Forwarded-For : 1 or X-Forwarded-For: some proper ip. Which will allow us to brute-force a login page even after our ip gets blocked due to multiple wrong attempts.

After that we have two-parameters username, and password. If some-how you think you gave proper username, and need to find password. Some misconfigured servers will first check username alone. If username itself is wrong, it’ll throw invalid username, password. But if username is correct, then it’ll check password, you can observer it in burp-repeater. Where you can give proper username and long wrong password, which keeps increasing the response time again and again.

So for this first find username using brute-force use two payloads which runs parallely for ip and username in burp-intruder **Pitchfork attack.** Find the username which took long time, and use it to find password. Right password will have proper response code.

## **Flawed brute-force protection**

Most common ways of preventing brute-force attacks are:

- Locking the account that the remote user is trying to access if they make too many failed login attempts
- Blocking the remote user's IP address if they make too many login attempts in quick succession

Some misconfigured servers, will block ip if it tries to login using wrong information for multiple times. But it’ll reset it once , the ip logged in successfully. **Means we can try to log-in another user for 5 times then login using our credential.  This helps in brute-forcing.**

Tip:

Click  **Resource pool** to open the **Resource pool** side panel, then add the attack to a resource pool with **Maximum concurrent requests** set to `1`. By only sending one request at a time, you can ensure that your login attempts are sent to the server in the correct order.

# Account Locking :

| Concept | Explanation |
| --- | --- |
| **Account Locking** | Blocks brute-force by locking accounts after repeated failed attempts. |
| **Vulnerability 1** | Server messages can leak valid usernames (enumeration). |
| **Vulnerability 2** | Can be bypassed by trying only a few passwords per account across many users (spread attack). |
| **Vulnerability 3** | Doesn’t stop credential stuffing since each login is only attempted once per account. |

### **Account Enumeration Risk:**

 If an attacker tries to login multiple times, using multiple accounts, like each account 5 times, and for one account he gets “Account locked” error and for other he gets “Invalid information”, then he can understand  that one account’s username is proper.

### Attacking *Any* Account, Not a Specific One :

An attacker needs only one account, even if [user1@gmail.com](mailto:user1@gmail.com) is locked, he can try with user2@gmail.com, as long as he wants to get into the system.

### Credential Stuff:

From security breach many datas are leaked across multiple websites. Attacker can get that username:password from leaked data and use it here. As many people use common credentials across website and also attacker won’t be blocked by the system as he uses one username and one password only one time.

So to find username by this Account Lock, we can have a set of usernames and need to try each usernames 4-5 times, for this we use clusterbomb attack, which is like 

```bash
for username in usernames:

	for time in times:

		try username-givenpassword
```

`username=§invalid-username§&password=example§§` → null payload in end for repeating purpose

By this either status/response/length will vary from rest. From there find username

Then using bruteforce we can find password

| Concept | Explanation |
| --- | --- |
| **User Rate Limiting** | Blocks IP after too many requests; better than account lock but bypassable |
| **Bypass Techniques** | IP spoofing, header tampering, multiple guesses per request |
| **HTTP Basic Auth** | Sends base64(user:pass) in every request; insecure, outdated |
| **Main Risks** | MITM, no brute-force defense, CSRF vulnerable |
| **Security Advice** | Use secure auth methods with proper session handling, rate limits, MFA |

In old servers, each request sends username & password for even getting some static content from the website. By MITM attacks we can get the credentials and use it in other login panels.
