# HTTP in detail

This room is part of the **How The Web Works** module available under the Pre-Security path.

You can access the room here: <a href="https://tryhackme.com/room/httpindetail">HTTP in detail</a>

## Task 1: What is HTTP(S)?
* HyperText Transfer Protocol (HTTP):-
  1. Developed by Tim Berners-Lee between 1989-1991.
  2. It is a set of rules used for communicating with web servers for transmitting of webpage data.
* HyperText Transfer Protocol Secure (HTTPS):-
  1. HTTPS is the secure version of HTTP.
  2. HTTPS data is encrypted so it not only stops people from seeing the data you are receiving and sending, but also makes sure that you are talking to the correct web server.

Q.) What does HTTP stand for?

A.) **HyperText Transfer Protocol**

Q.) What does the S in HTTPS stand for?

A.) **Secure**

Q.) On the mock webpage on the right there is an issue, once you've found it, click on it. What is the challenge flag?

This webpage is not secure, so click on the **lock** symbol.

A.) **THM{INVALID_HTTP_CERT}**

## Task 2: Requests and Responses
* When we access a website, your browser will need to make requests to a web server for assets.
* Before that, we need to tell the browser specifically how and where to access these resources and this is where URLs will help.
* **Uniform Resource Locator (URL)**- A URL is predominantly an instruction on how to access a resource on the internet.

* Let's look at some of its features:-
  1. **Scheme**: This instructs on what protocol to use for accessing the resource such as HTTP, HTTPS, FTP.
  2. **User**: Some services require authentication to log in, username and a password.
  3. **Host**: The domain name or IP address of the server you wish to access.
  4. **Port**: The Port that you are going to connect to, usually 80 for HTTP and 443 for HTTPS.
  5. **Path**: The file name or location of the resource you are trying to access.
  6. **Query** **String**: Extra bits of information that can be sent to the requested path.
  7. **Fragment**: This is a reference to a location on the actual page requested.

### HTTP Request

* Line 1 is the request sending the GET method and telling that we are using HTTP protocol version 1.1
* Line 2 tells the web server we want the website tryhackme.com
* Line 3 tells the web server we are using Firefox version 87 Browser.
* Line 4 tells the web server that the webpage that referred us to this one.

### HTTP Response

* Line 1 tells us the protocol used (HTTP) followed by a HTTP Status code, in this case "200 OK" which tells us the request has been completed successfully.
* Line 2 tells us the web server software and version number.
* Line 3 tells us the current date, time and time zone of the server.
* Line 4 gives us the **Content-Type** header which tells us what sort of information is going to be sent.
* Line 5 gives the **Content-Length** which tells us how long the response is.

Q.) What HTTP protocol is being used in the above example?

A.) **HTTP/1.1**

Q.) What response header tells the browser how much data to expect?

A.) **Content-Length**

## Task 3: HTTP Methods
* HTTP methods are a way for the client to show their intended action when making an HTTP Request:-
  1. **GET**: This is used for getting information from a web server.
  2. **POST**: This is used for submitting data to the web server and potentially creating new records.
  3. **PUT**: This is used for submitting data to a web server to update information.
  4. **DELETE**: This is used for deleting information/records from a web server.

Q.) What method would be used to create a new user account?

A.) **POST**

Q.) What method would be used to update your email address?

A.) **PUT**

Q.) What method would be used to remove a picture you've uploaded to your account?

A.) **DELETE**

Q.) What method would be used to view a news article?

A.) **GET**

## Task 4: HTTP Status Codes
* Ranges:-
  1. **100-199: Information Response**: These tell the client that the first part of request has been accepted and they should continue the request.
  2. **200-299: Success**: These are used to tell the client their request was successful
  3. **300-399: Redirection**: These redirect the client's request to another resource.
  4. **400-499: Client Errors**: These inform the client that there was an error with their request.
  5. **500-599: Server Errors**: These are reserved for errors on the server side.

* Common Status Codes:-
  1. **200: OK**: The request was completed successfully.
  2. **201: Created**: A resource has been created.
  3. **301: Moved Permanently**: This redirects the browser to a new webpage or tells search engines that the page has been moved.
  4. **302: Found**: This is similar to 301, but the change is temporary.
  5. **400: Bad Request**: This tells us that something was either wrong or missing with the request.
  6. **401: Not Authorized**: You are not allowed to view this resource until you have authorized, likely with a username and password.
  7. **403: Forbidden**: You do not have permission to view this resource whether you are logged in or not.
  8. **404: Page Not Found**: The resource does not exist.
  9. **405: Method Not Allowed**: This resource does not allow this method request.
  10. **500: Internal Service Error**: The server has encountered some kind of error.
  11. **503: Service Unavailable**: The server cannot handle your request as it's either overloaded or down for maintenance.

Q.) What response code might you receive if you've created a new user or blog post article?

A.) **201**

Q.) What response code might you receive if you've tried to access a page that doesn't exist?

A.) **404**

Q.) What response code might you receive if the web server cannot access its database and the applic
ation crashes?

A.) **503**

Q.) What response code might you receive if you try to edit your profile without logging in first?

A.) **401**

## Task 5: Headers
* Headers are additional bits of data you can send to the web server when making requests.
* Common Request Headers:-
  1. Host: Specifies the host you want to access.
  2. User-Agent: This is your browser software and version number.
  3. Content-Length: Specifies how much data to expect in the web request.
  4. Accept-Encoding: Tells the web server what types of compression methods the browser supports.
  5. Cookie: Data sent to the server to help remember your information.
* Common Response Headers:-
  1. Set-Cookie: Information to store which gets sent back to the web server.
  2. Cache-Control: How long to store the content of the response in the browser's cache.
  3. Content-Type: This tells the client what type of data is being returned.
  4. Content-Encoding: What method has been used to compress the data.

Q.) What header tells the web server what browser is being used?

A.) **User-Agent**

Q.) What header tells the browser what type of data is being returned?

A.) **Content-Type**

Q.) What header tells the web server which website is being requested?

A.) **Host**

## Task 6: Cookies
* Cookies are pieces of data that is stored on your computer.
* They are saved when you receive a "Set-Cookie" header and then every further request you make, you'll send the cookie data back to the web server.
* Since HTTP is stateless, cookies can be used to remind the web server who you are.
* Let's look at an example of a cookie

* The client requests the webpage from http://cookies.thm

* The server responds back with a simple webpage with a form asking for the users name.

* The client sends back the form with the name set to adam.

* The server responds with a Set-Cookie header telling the client to save the data name=adam

* On the next and every further request the clients sends the cookie data back to the server.

* The server then sees the cookie data and instead of displaying the form it displays a welcome back message instead.

Q.) Which header is used to save cookies to your computer?

A.) **Set-Cookie**

## Task 7: Making Requests

Q.) Make a GET request to /room

A.) **THM{YOU'RE_IN_THE_ROOM}**

Q.) Make a GET request to /blog and using the gear icon set the id parameter to 1 in the URL field

A.) **THM{YOU_FOUND_THE_BLOG}**

Q.) Make a DELETE request to /user/1

**A.) THM{USER_IS_DELETED}**

Q.) Make a PUT request to /user/2 with the username parameter set to admin

A.) **THM{USER_HAS_UPDATED}**

Q.) POST the username of thm and a password of letmein to /login

A.) **THM{HTTP_REQUEST_MATTER}**
