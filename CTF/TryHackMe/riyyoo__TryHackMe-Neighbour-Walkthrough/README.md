
# TryHackMe-Neighbour

A very easy ctf dealing with IDOR | 
IDOR is a broken access control vulnerability where invalidated user input can be used to perform unauthorized access to application functions.

Room link : https://tryhackme.com/room/neighbour

## Let's Solve the Challenge ---

```bash
1. First get to the login page by visiting the <IP>
```
![log](https://user-images.githubusercontent.com/119054834/204042819-8776e145-5714-4edd-b36e-f79cf526bc08.png)

```bash
2. Now as you dont have the credentials, you can view the page source or press CTRL+U to get the guest login credentials( use the guest account!(CTRL+U) ) written below the Login button.
```
![neigh1](https://user-images.githubusercontent.com/119054834/204041674-bd6115c8-0c70-4fb1-9ac7-6d31e067c907.png)

```bash
3. Now visiting the page source, you get the Guest credentials > guest:guest 
```
![neigh 2](https://user-images.githubusercontent.com/119054834/204041711-79e4ccdc-aa77-48e6-b17d-a578a9b4d8ae.png)

```bash
4. Then Getting back to the login page you put in the credentials.
```
![n3](https://user-images.githubusercontent.com/119054834/204041723-d0bb5a3e-ae81-42fe-808e-6a9ea2321a97.png)

```bash
5. yaay! Now you're a guest and the page says not to peep your neighbour’s profile. Mmmmmmm!
```
![n4](https://user-images.githubusercontent.com/119054834/204041737-0a89e8fb-5826-413a-baa6-01517282f655.png)

```bash
6. So again we can view the page source.
```
![n5](https://user-images.githubusercontent.com/119054834/204041742-22aa7ca1-beee-4e2c-b166-6191a73e2858.png)

```bash
7. And now here you got some hints for the admin page and we know we are still logged in as guest.
```
![n6](https://user-images.githubusercontent.com/119054834/204041753-68a97082-4dfd-4b29-a740-69cc95a05192.png)

```bash
8. So now as we know that this challenge is IDOR , so try to change the ‘guest’ with ‘admin’ to login as admin.
```
![n77](https://user-images.githubusercontent.com/119054834/204041769-a1feb7ab-136d-4fac-9c97-ea55909549c9.png)

```bash
9. aaaaaa! You're now logged in as admin and you have got the flag > flag{***************}
```

![nfinal](https://user-images.githubusercontent.com/119054834/204042020-fed9fbf6-2478-4dca-ba8e-8de72d43a5fc.png)

```bash
10. Now submit the flag.
```
```bash
Thus using IDOR vulnerability, we bypassed the authentication.
```

What is IDOR vulnerability ?
- Insecure direct object references are common, potentially devastating vulnerabilities resulting from broken access control in web applications. IDOR bugs allow an attacker to maliciously interact with a web application by manipulating a “direct object reference,” such as a database key, query parameter, or filename.

Hope this was helpful. thank you!

```bash
Answer the questions below :
Find the flag on your neighbor's logged in page!
-- flag{66be95c478473d91a5358f2440c7af1f}
```
