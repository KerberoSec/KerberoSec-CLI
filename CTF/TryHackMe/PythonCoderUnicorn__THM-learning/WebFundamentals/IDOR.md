
# IDOR

_Insecure Direct Object Reference_ (IDOR)

web server receives user-supplied input to retrieve objects (files, data, documents)

too much trust on user and not validated 

- `http://online-service.thm/profile?user_id=1305` 
and you can see your information.

Encoded IDs

take the raw data and encode it
binary => ASCII 
base64 encoding 

Hashed IDs

- hashed IDs deal with encoded ones, hashed integer value
- 123 => hashed (md5)  202cb962ac59075b964b07152d234b70 

Unpredictable IDs

- excellent method of IDOR detection is to create two accounts and swap the Id numbers between them

if see another account id and logged in with different account
then valid IDOR ! 

Find IDORs

The vulnerable endpoint you're targeting may not always be something you see in the address bar. It could be content your browser loads in via an AJAX request or something that you find referenced in a JavaScript file. 

`/user/details` displaying your user information (authenticated through your session).

attack: parameter mining
`/user/details?user_id=123`

- https://x.x.x.x.p.thmlabs.com
- make account
- go to account settings, right click inspect source
- refresh page , look for `customer?id=15`, click on Response
- in the url, change id= 1 then id=3

