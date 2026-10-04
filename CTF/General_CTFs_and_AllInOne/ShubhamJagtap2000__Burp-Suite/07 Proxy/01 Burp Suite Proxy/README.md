# Burp Suite Proxy

- The Burp Proxy is the most fundamental (and most important!) of the tools available in Burp Suite. It allows us to capture requests and responses between ourselves and our target. These can then be manipulated or sent to other tools for further processing before being allowed to continue to their destination.

- For example, if we make a request to https://tryhackme.com through the Burp Proxy, our request will be captured and won't be allowed to continue to the TryHackMe servers until we explicitly allow it through. We can choose to do the same with the response from the server, although this isn't active by default. This ability to intercept requests ultimately means that we can take complete control over our web traffic: an invaluable ability when it comes to testing web applications. 
- When we first open the Proxy tab, Burp gives us a bunch of useful information and background reading. This information is well worth reading through; however, the real magic happens after we capture a request:

  ![Screenshot (796)](https://user-images.githubusercontent.com/63872951/182179634-4c5e2fe8-7b4c-4a36-b7ff-48aa17aa373a.png)

- With the proxy active, a request was made to the TryHackMe website. At this point, the browser making the request will hang, and the request will appear in the Proxy tab giving us the view shown in the screenshot above. We can then choose to forward or drop the request (potentially after editing it). We can also do various other things here, such as sending the request to one of the other Burp modules, copying it as a cURL command, saving it to a file, and many others.

- When we have finished working with the Proxy, we can click the "Intercept is on" button to disable the Intercept, which will allow requests to pass through the proxy without being stopped.

# 

- Burp Suite will still (by default) be logging requests made through the proxy when the intercept is off. This can be very useful for going back and analysing prior requests, even if we didn't specifically capture them when they were made. 

- Burp will also capture and log WebSocket communication, which, again, can be exceedingly helpful when analysing a web app.
- The logs can be viewed by going to the "HTTP history" and "WebSockets history" sub-tabs:
  
  ![Screenshot (797)](https://user-images.githubusercontent.com/63872951/182180309-3f853e54-16d1-4615-8343-561a6cb5bfd6.png)
  
- It is worth noting that any requests captured here can be sent to other tools in the framework by right-clicking them and choosing "Send to...". For example, we could take a previous HTTP request that has already been proxied to the target and send it to Repeater.

#

- Finally, there are also Proxy specific options, which we can view in the "Options" sub-tab.

- These options give us a lot of control over how the proxy operates, so it is an excellent idea to familiarise yourself with these.
- For example, the proxy will not intercept server responses by default unless we explicitly ask it to on a per-request basis. We can override the default setting by selecting the "Intercept responses based on the following rules" checkbox and picking one or more rules. The "Or Request Was Intercepted" rule is good for catching responses to all requests that were intercepted by the proxy:

  ![Screenshot (798)](https://user-images.githubusercontent.com/63872951/182180973-fa92af08-1edf-4fc4-a17d-c74a78e4959d.png)

- The `And URL Is in target scope` is another very good default rule.
- Another particularly useful section of this sub-tab is the `Match and Replace` section; this allows you to perform regexes on incoming and outgoing requests. For example, you can automatically change your user agent to emulate a different web browser in outgoing requests or remove all cookies being set in incoming requests. Again, you are free to make your own rules here.

# Answer the following questions

1. Which button would we choose to send an intercepted request to the target in Burp Proxy?
```
Forward
```
2. What is the default keybind for this?
```
Ctrl+F
```
