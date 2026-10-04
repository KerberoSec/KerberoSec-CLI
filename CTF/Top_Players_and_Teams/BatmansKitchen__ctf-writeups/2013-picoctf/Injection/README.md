# Injection

* Problem:

  Use the Loading Bay Control System to get the admin key! [Problem](https://2013.picoctf.com/problems/injection/)

  Hint: The SQL query being performed is something a lot like SELECT username,hash FROM pwtable WHERE username= your_input 

* Solution:

  This is a sql injection, enter query string `1' or '1' = '1`
This will get all entries in the database, check for admin

* Answer:

  bad_code_and_databases_is_no_fun

