# TryHackMe Pre Security: Module 3: How The Web Works
## DNS
DNS, Domain Name System, is  how website names are translated into IP addresses so that it's easy for us humans to type into a web browser and connect to.

`Google.com` for example, would be the domain name which allows us to access google through a web browser.

### Domain Hierarchy 
A domain name is structured as a hierarchy which looks like a tree, pictured below. Each section is separated by a "." and is read from right to left on the name. 

<img width="50%" height="50%" alt="Domain Hierarchy" src="https://github.com/user-attachments/assets/b26b58e1-6286-4274-87d6-0a14f8a5f27b" />

When you look up a website on a computer, the computer reads from the very right to the left of each section, asking the server of that respective section for the IP of each level. 

#### Root Domain
This is the top of the DNS hierarchy. 

All domains technically end with a "." at the end of it although hidden by web browsers and operating systems. So `Google.com` is actually `Google.com.` with an implicit "." at the end.

That "." at the end is the root domain. It doesn't contain any website data in itself. However it redirects traffic towards the Top-Level Domain(Explained below).

This root domain is needed because it lets the system know that this is the absolute end of the domain sequence and prevents the device from looking for further extensions. 
#### Top-Level Domain(TLD)
This is the `.com` or `.gov`, etc part of the domain. There are two types of TLDs. Each one is as it sounds: Generic and country.

* Generic Top Level(gTLD) : `.com`(com for Commercial), `.org`(org for organization), `.edu`(edu for education), etc. 
* Country Code Top Level Domain(ccTLD): Geographic TLDs. ex `.ca`(Canada)
#### Second-Level Domain
These are the unique website names. For example, `google.com` = "google" is the Second Level Domain.

There is a limit of only 63 characters here. Only a-z, 0-9, and hyphens can be used (Cannot start or end with a hyphen nor can it have consecutive hyphens).
#### Subdomain
From the perspective of the user visiting the website, it's kind of like visiting a separate website. 

However, it's the same domain name on the DNS server. 

It acts like a new building on a campus.

Example: `tryhackme.com` would be the regular domain name. But `admin.tryhackme.com` would be like a separate web server for admins on the tryhackme site. 

It has the same limitations of characters as the Second-Level Domain.

On top of this though. ypu can stack multiple subdomains on top of each other like `jupiter.servers.tryhackme.com`

However, the entire domain can't be more than 253 characters.

### DNS record Types
If we imagine a DNS server to be a spreadsheet, each cell in that spreadsheet is a domain name for a website. Those cells are called "records". However, each cell doesn’t **have** to be a website name. 

There are different "types" of records that exist within the DNS. Here are some commond kinds:

#### A Records
Points to an IPv4 IP address.
#### AAAA Record
Points to an IPv6 IP address.
#### CNAME Record
This points to a different domain name and thus the IP address associated with that separate domain name.

For example, say `google.com` is an A type record resolved to the IP address: `192.0.2.1`

`admin.google.com` can be pointed towards `google.com` and that same IP address associated with the `google.com` domain name. 

This way, if the server or IP of google.com is changed, you don't have to go to each subdomain connected to it and individuallly change the IP address/server of each subdomain.

Since each subdomain points towards that main domain, everything will be updated all at one time. 
#### MX Record
This stands for "Mail Exchanger" 

This points a domain towards a server that's handling the emails.

For example, if someone has an email `Stanley@tryhackme.com` and someone sends an email to this account, the DNS server will then look at the records for the MX record of this domain to direct traffic towardss.

So in this case as an example, it would point to Outlook that's handling the emails. So the MX record would say: `mail.protection.outlook.com`

Outlook gets the email and sees that its for `Stanley@tryhackme.com` and sends it to the inbox matched to that respective account. 

(There are also priority values which directs directs traffic towards the next server if the previous one is down)
#### TXT Record
This stands for "text". As it sounds, it allows the domain owner to attach any free text onto that record like a sort of sticky note. 

They were originally used as notes readable to humans. However, now they function more for things like **domain owner verification** or **email security**.

For example: If I own a domain and want to use a third party service for that domain, that third party will need to verify I actually own the domain before they let me use it.

So in doing so, they may send a random string of text that I will then paste as a TXT record for the domain. That verifies to them that I own the domain and things can now proceed. 

It's also important for **email security**

The protocol used for sending emails(Called "Simple Mail Transfer Protocol", "SMPT") has no verification check to authenticate if the user sending the email is actually using that email.

Technically, any person could send an email using any "sender" address, pretending to be anyone in the world. 

Receiving email servers use TXT records to prevent this. So anyone using an email address with their own domain name will be protected against others attempting to spoof their account when the receiving server's protocol checks(via TXT records) for authenticity fails.

Three main frameworks used:

* __Sender Policy Framework(SPF)__: Lists all authorized IP addresses allowed to send emails on behalf of this domain
* __DomainKeys Identified Mail(DKIM)__: Uses a private key stored on email servers to generate a signature which has to match mathematically to the public key stored on the TXT record in order to be authenticated
* __Domain-Based Message Authentication, Reporting, and Conformance(DMARC)__: It tells the server what to do if SPF or DKIM fails. 
### What happens when you make a request.
When a device requests a website, it goes through a series of steps to translate the domain into the IP address. It looks as follows:

<img width="50%" height="50%" alt="DNS Request" src="https://github.com/user-attachments/assets/135fdb1f-b541-483d-8a77-a3a13584fd5f" />

#### 1.) Local Check
This checks your local cache on your device to see if it remembers the address. If yes, then you don't need anymore steps!

If no, then it sends a request to the "Recursive" DNS Server.
#### 2.) Recursive DNS Server
This server is usually provided by the ISP. It checks it's own local cache and if found, it returns the result back to your computer! 

If not, it makes a request to the "Root" DNS Server.
#### 3.) Root DNS Server
This server does not have any DNS information in regards to the IP address, on it's own. However, it's job is to redirect us to the TLD of our DNS request.

If `tryhackme.com` for example, it will send us to the respective `.com` TLD Server.
#### 4.) TLD Server
This server's job is to point us toward the "Authoritative" server, also called the Nameserver because it stores the actual DNS records and associated IP addresses, etc.

There will usually be multiple nameservers as redundancy in case one fails. 

#### 5.) Authoritative Server or Nameserver
As stated above, these store the DNS records. 

Depending on the record type, the DNS record is sent back to the recursive DNS server, where a copy will be stored in it's local cache for future use, then sent back to the original device requesting the domain. 

DNS records all come with a Time To Live(TTL) value which represents how long it will live in the local cache before it "expires" and you'd have to look it up again. 

___
#### Quick lab
We can use a DNS lookup tool at home on our devices via the respective terminals on our operating systems. 

The command format looks like:

`nslookup -type+[RECORD_TYPE] [DOMAIN]`

Windows uses a single "-" while linux & macs uses two dashes: "--" but they also accept windows styles.
___
## HTTP in Detail
**HyperText Transfer Protocol(HTTP)** is the protocol(**Port 80**) used to get or send data from a web server. 

**HyperText Transfer Protocol Secure(HTTPS)** is the exact same protocol(**Port 443**) as HTTP but wrapped in encryption to ensure data sent is secure. On top of this, it also ensures that the website we are visiting is in fact the website it claims to be. It authenticates the site for our assurance. 

HTTPS uses the protocol "Secure Sockets Layer/Transport Layer Security"(SSL/TLS) to **authenticate** the website and then to **encrypt** the data. 
### Requests and Responses
#### Parts of a URL(Uniform Resource Locator)
Pictured below are the segments of a URL. (All the parts of the URL do not have to be in use)

<img width="50%" height="50%" alt="URL" src="https://github.com/user-attachments/assets/748a62cd-a1d6-45c8-956e-ff7f172c678b" />

**Scheme:** This is the protocol used to access the website like http, https, FTP(File Transfer Protocol), etc. This always ends with `://` or sometimes just `:`

**User:** If there is a log in used on the website: the username/password can be here or added here. However in modern times, this is no longer the case as it's a security nightmare. 

**Host:** The domain or IP of the server 

**Port:** The port we are connecting to. If the port is omitted in the URL, then it defaults to the port for the scheme within the URL(HTTPS = port 443 for example).

**Path:** The file name/location of the exact data we are requesting

**Query String:** This always starts with a "?" and is what gives further information to obtain more specific pieces of data on the server. It has A format that looks like this: `?[PARAMETE]=[VALUE]&[MORE PARAMETERS]=[VALUE]`. You can continue adding more values with the `&` symbol. 

**Fragment:** This always starts with `#` and links you to certain spots on that exact webpage you are on. No loading or new information is needed from the server. It only allows you to jump to spots within a page you are already on unless the link itself is to a new page. 

#### Making a Request
When we type a URL into a browser, our browser converts it into a raw text block to send it over the network and make the request.

It would look like this:

```
GET / HTTP/1.1

Host: tryhackme.com
User-Agent: Mozilla/5.0 Firefox/87.0
Referer: https://tryhackme.com/

```

* The first line("Request Line" is the `GET` method along with the HTTP protocol version 1.1. The rest of the data are **headers** and are as follows:
* The `host` is the website we want to access. 
* The `User-Agent` is the web browser we are using. In this case, it is Firefox version 87.
* The `Referer` is the web page that referred us to this website.
* In addition to these headers, there's also a common header: `Accept-Encoding`, which tells the server what kind of data compression methods our web browser accepts as well as `cookie` which is just stored information(explained more further below)
* Lastly, these HTTP request **always** ends with a blank line which tells the server that our request is finished in regards to headers.

#### HTTP Response
After making the request to the server, the response we get back will look like this:

```
HTTP/1.1 200 OK

Server: nginx/1.15.8
Date: Fri, 09 Apr 2021 13:34:03 GMT
Content-Type: text/html
Content-Length: 98

<html>
<head>
    <title>TryHackMe</title>
</head>
<body>
    Welcome To TryHackMe.com
</body>
</html>

```

* HTTP/1.1 is again, version 1.1 of the HTTP protocol. `200 OK` is the **HTTP Status Code** which tells us whether the request failed or succeeded and why(Explained more below)
  
**Response Headers:**

* Server: The software the web server is running. In this case, its nginx, version 1.15.8
* Date.
* Content-Type: What kind of file is being delivered here(HTML, files, images, pdf, etc)
* Content Length: The size of the response is so we know if data is missing
* As always, the blank line confirms the end of the HTTP response in which the data of the body will start after

Aside from these headers, common response headers include:
* Set-Cookie: This Stores information that would later automatically be sent back to the server by the browser in future requests(Cookies explained more further down)
* Cache-Control: This defines the caching policy in regards to who can cache, how it's cached, as well as when it expires and needs to be revalidated/re-requested again
* Content-Encoding: The data compression method used by the server. 

Lastly, the body is the actual data sent back that we requested in it's raw form. In this case, it is HTML coded website data

#### HTTP Status Codes
Types of Status codes:
* `1xx`(Informational) = The request was received and is currently in process(Rarely seen)
* `2xx`(Success) = Everything is good
* `3xx`(Redirection) = What we requested moved somewhere else and we need to be redirected to a different URL
* `4xx`(Client Error) = We made a mistake on our end
* `5xx`(Server Error) = The server crashed or something happened on their end

Common Status Codes:
* `200 OK` = All good. Successful
* `201 Created` = Data has been created in response to what we requested
* `301 Moved Permanently` = The URL was permanently moved to a different one
* `302 Found` = The URL was only temporarily moved
* `400 Bad Request` = Something is either wrong or missing in our request.
* `401 Not Authorized` = We're not allowed to visit this page unless we have been authorized in like through a log-in for example.
* `403 Forbidden` = You have specifically been blocked from visiting this page
* `405 Method Not Allowed` = The specific method we used is not allowed for this specific resource/URL end point
* `404 Page Not Found` = The URL entered does not exist.
* `500 Internal Server Error` = The server has some error that it is unable to handle currently
* `503 Service Unavailable` = The server is currently down.

#### HTTP Methods
These are how we tell the server what actions we want to do when making a request. The most common request methods are:

* `GET` Request: How we obtain data from the server.
* `POST` Request: How we submit data TO the server
* `PUT` Request: How we replace data with new data
* `PATCH` Request: How we modify part of an existing piece of data without replacing the whole thing. 
* `DELETE` Request: How we remove data from the server

#### Cookies 
Small pieces of saved information that is stored in the browser and automatically sent to the web server with subsequent HTTP requests. Here's a good illustration from TryHackMe's course:

<img width="75%" height="75%" alt="Cookie" src="https://github.com/user-attachments/assets/e38df8dc-c66e-4016-aaeb-b473826d1314" />

Essentially:

1) HTTP Request
2) Respond with server asking for data
3) User inputs data
4) The web server saves that data as a cookie via `Set-Cookie`
5) The browser has that data stored as `Cookie` and automatically sends it back to the server with each request to which the server may use.

The cookie usually isn't a readable text string but a "token" which hides the actual cookie behind it's value.

## How Websites Work
Here is a quick visual in how we obtain data when we visit a website:

<img width="75%" height="75%" alt="Website" src="https://github.com/user-attachments/assets/1802249b-de66-497b-951e-f14fe7129729" />

In essence, our browser connects to the device hosting the website through the internet when we make a request. The server then responds to our device, through the internet, with data that our browser "converts" to render what we see on our end.

**Front End:** Our browser rendering a website

**Back End:** Server side which processes our HTTP requests and responds 

### Coding Websites

Websites use 3 core coding languages:

* HyperText Markup Language(HTML): Makes the body of the website
* Cascading Style Sheets(CSS): Styles the websites
* JavaScript: Adds complex functions to websites and makes it a lot more interactive

I'm already familiar with HTML, CSS, & JavaScript so there's no need to go over the entire language here.

But the course went over how to create an HTML document as well as the concept of tags, classes, IDs, adding images, etc. It also went over Javascript quickly as well as linking it to the HTML document within that HTML code via `<script> </script>` or linking it in externally as a separate file.

### Sensitive Data Exposure

Sometimes a website may have data within the source code that we were not supposed to see or have access to as a user requesting the website.

Sometimes they forget to remove it, or properly protect/hide the information and thus is made available for all tosee just by looking at the source code.

For example, in the TryHackMe's lab, we were able to see login credentials hidden within the HTML code:

<img width="100%" height="100%" alt="Unsecure" src="https://github.com/user-attachments/assets/18d475fe-9c02-4bd0-843b-39b8c0608f21" />

### HTML Injection
My study into the Security+ certification will go more into these types of attacks.

But in essence, this is just injecting code into a website which allows for our input of text which then allows for so many vectors of malicious attacks.

Here's an example of how that works:

<img width="80%" height="80%" alt="Injection" src="https://github.com/user-attachments/assets/e7754d31-5908-483a-b93a-eab5da0c0233" />

This usually happens on poorly made websites or sites that accidentally forget to secure input fields, but this shows why its so important to properly validate and sanitize user inputs into a website server to ensure it's not rendered as code. 

## Putting it all Together

All put together, requesting a website will look like this behind the scenes:

<img width="80%" height="80%" alt="Overview" src="https://github.com/user-attachments/assets/e66fa792-bf31-4be2-9f4e-573bda842ae8" />

1) We request the website on our web browser using the domain name
2) Our devices finds the IP address of that server using DNS
3) We're connected to the website via the HTTP protocol which has us requesting data and the server responding with data
4) Our browser then converts the code sent by the response into viewable content for us to see and interact with

### Load Balancers

This is how servers balance high amounts of traffic to a web server. 

A web server will usually have multiple servers in case one goes down. A load balancer helps to direct traffic towards the different servers to manage traffic in case one gets too overloaded or fails.

This is important because servers can crash or overload when there's too many requests.

There are multiple algorithms load balancers' use to manage traffic. TryHackMe covered 2:

**Round-Robin:** Which sends requests sequentially down the list of servers(Server 1 -> Server 2- > Server 3 -> etc)

**Weighted Round-Robin:** Sends requests to each server which are weighted on their current capacity to handle requests. 

There is also "Least Connections" which has traffic directs towards the server that's currently handling the least amount of requests.

The Load Balancer also performs **"Health Checks"** which periodically checks each server to see if it's still working without a problem. If not, it stops sending requests to that server until it passes a separate health check.

### Content Delivery Networks(CDN)
Rather than having all the data from a website be sent from one origin server, static parts of that web server and other pieces of data/cache can be stored on data servers all around the world.

When we do this, anyone all around the world can have faster and more reliable access to that content as the data will be sent to them from the hosting server closest to them.

In effect, it also cuts down traffic to the main server and can act as a buffer towards attacks designed to overload a server. 

### Databases
These are the devices that store data which can be called upon and used by the web server. 

All types of data can be stored here from simple text files to videos, and more. Personal and confidential data can also be store here which is crucial to protect.
### Web Application Firewall(WAF)
This operates on layer 7 of the OSI model and is the firewall of web servers.

It filters IP addresses or incoming HTTP requests that appear to be malicious. If so, then the request is dropped and never sent to the server or the IP(s) are blocked.  

---
### How Web Servers Work
The devices which hosts these sites use software to handle the requests and utilize the HTTP protocol.

Most common web server softwares include:
* Apache
* Nginx
* Internet Information Services(IIS)
* NodeJS

The web server delivers files from it's device called "root directory" which is defined in their software settings.

Ex:

NGINX & Apache have the same default location of `/var/www/html` in Linux. Thus requesting: `http://www.example.com/picture.jpg` would have the hosting device send the file `/var/www/html/picture.jpg` from it's local storage on it's device. 

**Virtual Hosts:** Virtual hosts is how **one** device can host multiple different websites with different domain names using the same exact IP address and device.

### Static vs Dynamic Content
Static Content: Content that never changes. These are stuff like pictures, html code, files, etc that remain the same and are stored on the server with no changes that happen to them

Dynamic Content: These are content that could change with different requests. An example would be the homepage of a blog that shows different blog posts depending on which blog entry is most recent. 

These dynamic changes occur on the backend using programming/scripting languages. 

Examples of coding languages used:

* Python
* Java
* Ruby
* PHP
* etc

(I currently already have experience with Python and Java)

These coding languages would be on the backend code not the front end source code. They're executed only on the server's end while the output is sent to the front end.
