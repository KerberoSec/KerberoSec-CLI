### Let's go on an adventure!: Reconnaissance

Navigated to:

Customer Feedback -> submitted a review

About Us -> downloaded terms of use from /ftp/legal.md, saw my review in the feedback 
slideshow

Photo Wall -> photos stored in /assets/public/images/uploads

Question 1: What's the admin's email address?

method: the product reviews show the user's email address

answer: `admin@juice-sh.op`

Question 2: What parameter is used for searching?

method: use the search bar and look at the url change

answer: q

Question 3: What show does Jim reference in his review?

method: Jim's review mentions a replicator, a google search shows it comes from star trek

answer: Star Trek

### Inject the juice: SQL Injection

Question 1: Log into the admin account!

method: send login request through login page with any credentials, intercept with burpsuite 
and change the email to `' or 1=1--`.

`'` closes the query, `or` returns true if either side is true; `1=1` is true and `--` is an 
SQL comment tag, removing any other restrictions from the SQL query

answer: 32a5e0f21372bcc1000a6088b93b458e41f0e02a

Question 2: Log into the bender account!

method: send login request with `bender@juice-sh.op`, intercept with burpsuite and change the
email filled value to `bender@juice-sh.op'--`.

The `'` closes the SQL query and the `--` comments out any other restrictions loggin us in 
as bender

answer: fb364762a3c102b2db932069c0e6b78e738d4066

### Who broke my lock?!: Broken Authentication

Question 1: Brute force the admin account!

method: intercept a login request using the admin email and any password. Send the request 
to the Intruder and replace the password value with `§§`. Load best1150.txt from seclists 
as the payloads and start the attack. The password is `admin123`

answer: c2110d06dc6f81c67cd8099ff0ba601241f1ac0e

Question 2: Reset Jim's password!

method: attempt to reset Jim's password, security question is `Your siblings middle name`. 
Jim mentioned Star Trek in a review so google Jim Star Trek. Wiki page for James T Kirk 
comes up, and his brother's middle name is Samuel. Reset his password using the answer to 
the security question

answer: 094fbc9b48e525150ba97d05b942bbf114987257

### AH! Don't look!: Sensitive Data Exposure

Question 1: Access the confidential document!

method: the About Us page has a link to download the terms of use from an ftp folder. THe ftp folder is public and allows us to download the file `acquisitions.md`

answer: edf9281222395a1c5fee9b89e32175f1ccf50c5b

Question 2: Log into MC SafeSearch's account!

method: MC SafeSearch tells us his password is Mr. Noodles with the vowels replaced with digits. Log into his account with `mc.safesearch@juice-sh.op:Mr. N00dles`

answer: 66bdcffad9e698fd534003fbb3cc7e2b7b55d7f0

Question 3: Download the backup file!

method: In the ftp folder there is a backup file `package.json.bak`. We can only download 
pdf and md files so we need use a poison null byte (`%2500`) to trick the server like this:
`http://10.10.129.168/ftp/package.json.bak%2500.md`

answer: bfc1e6b4a16579e85e06fee4c36ff8c02fb13795

### Who's flying this thing?: Broken Access Control

Question 1: Access the Admin page!

method: Using the debugger find a file called `main-es2015.js`, anvigate to that page and 
search it for `admin`. Look for `path: 'administration'`, this hints to a page called 
`/#/administration`. Log in to the admin account using the brute forced credentials from the Broken Authentication section and navigate to the administration page.

answer: 946a799363226a24822008503f5d1324536629a0

Question 2: View another user's shopping basket!

method: Logged in as admin navigate to your basket. Intercept the request and forward them 
on until you see the `GET /rest/basket/1` request. Change the 1 to another number to view 
another user's basket.

answer: 41b997a36cc33fbe4f0ba018474e19ae5ce52121

Question 3: Remove all 5 star reviews!

method: Navigate to the administration page logged in as admin and remove the 5 star reviews

answer: 50c97bcce0b895e446d61c83a21df371ac2266ef

### Where did that come from?: XSS

Question 1: Perform a DOM XSS!

method: Use an iframe element with a javascript alert tag 
<iframe src="javascript:alert(`xss`)"> and paste it into the search bar. Also knows as an
XFS (Cross Frame Scripting)

answer: 9aaf4bbea5c30d00a1f5bbcfce4db6d4b0efe0bf

Question 2: Perform a persistent XSS!

method: Logged in as admin logout and intercept the logout request. Add the header 
`True-Client_IP` with a value of <iframe src="javascript:alert(`xss`)">. When we log back
in as admin and check the last log in ip our alert will be displayed

answer: 149aa8ce13d7a4a8a931472308e269c94dc5f156

Question 3: Perform a reflected XSS!

method: Logged in as admin, navigate to Order history and click on the Truck icon. In the 
url we can see the query to the track-result page with an id field. Replace the id with 
<iframe src="javascript:alert(`xss`)"> and refresh the page to trigger the alert

answer: 23cefee1527bde039295b2616eeb29e1edc660a0

### flags

error handling: 169940f83378cc420ae4fdeb9c1f73631a2baee6
password strnegth: c2110d06dc6f81c67cd8099ff0ba601241f1ac0e
login admin: 32a5e0f21372bcc1000a6088b93b458e41f0e02a