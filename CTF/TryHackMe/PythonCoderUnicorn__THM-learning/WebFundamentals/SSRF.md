
# SSRF 

SSRF stands for _Server-Side Request Forgery_. It's a vulnerability that allows a malicious user to cause the webserver to make an additional or edited HTTP request to the resource of the attacker's choosing.

2 types 
- regular SSRF where data is returned to the attacker's screen
-  Blind SSRF vulnerability where an SSRF occurs, but no information is returned to the attacker's screen

### Impact 
- unauth access
- access to customer/ org data
- scale to internal networks
- reveal auth tokens/ credentials 

1. hacker request: `http:/api.website.thm/stock?url=` + `http:/api.website.thm/api/user`
2. website request: `http:/api.website.thm/api/user`
3. API server returns user data to website instead of stock info
4. website returns user data to hacker

---

1. hacker request: `http:/api.website.thm/stock?url=` + `/../user`
2. website request: `http:/api.website.thm/stock/../user`
3. API server returns user data not stock info
4. website returns user data to hacker

---

1. hacker request: `http:/api.website.thm/stock?server=` + `api.website.thm/api/user&x=&id=123`
2. website request: `http:/api.website.thm/api/user?x=.website.thm/api/stock/item?id=123`
3. API server returns user data not stock info
4. website returns user data to hacker

---

1. hacker request: `http:/api.website.thm/stock?url=` + `http:/hacker-domain.thm`
2. website request: `http:/api.website.thm/api/user`  breaks request
3. APU server does not return user data to website
4. website request: data from `hacker-domain.thm` is used revealing API key

&x=

## FINDING SSRF

- full url:  website.thm/form?server=http:/server.website.thm/store

- hidden in HTML form
```
<form>
  <input type="hidden" name='sever' value='http:/server.website.thm/store'>
</form>
```

- partial url:  website.thm/form?server=api
- path of url:  website.thm/form?dst=/forms/contact
- 

## DEFENCE FOR SSRF

- deny list  
- approve list

A Deny List is where all requests are accepted apart from resources specified in a list or matching a particular pattern

Attackers can bypass a Deny List by using alternative localhost references such as 0, 0.0.0.0, 0000, 127.1, `127.*.*.*`, 2130706433, 017700000001 or subdomains that have a DNS record which resolves to the IP Address 127.0.0.1 such as 127.0.0.1.nip.io.

An allow list is where all requests get denied unless they appear on a list or match a particular pattern

- parameter must begin with https:/website.thm.

attacker could quickly circumvent this rule by creating a subdomain on an attacker's domain name, such as https:/website.thm.attackers-domain.thm. The application logic would now allow this input and let an attacker control the internal HTTP request.

## Open Redirect

If the above bypasses do not work, there is one more trick up the attacker's sleeve, the open redirect.

An open redirect is an endpoint on the server where the website visitor gets automatically redirected to another website address

- https:/website.thm/link?url=https:/tryhackme.com

- `/private  => error message`

```
https:/x.x.x.x.p.thmlabs.com 
/customers/new-account-page   allows for avatars 

click on avatar, right click inspect source
change input value to "private" , update avatar => errors
change input value to "x/../private", update avatar , no errors

https:/x.x.x.x.p.thmlabs.com/customers/new-account-page?success=/private
```

