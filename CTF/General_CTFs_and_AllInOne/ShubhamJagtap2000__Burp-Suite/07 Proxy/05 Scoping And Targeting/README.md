# Scoping And Targeting

- It can get extremely tedious having Burp capturing all of our traffic. When it logs everything (including traffic to sites we aren't targeting), it muddies up logs we may later wish to send to clients. In short, allowing Burp to capture everything can quickly become a massive pain.

- What's the solution? **Scoping**.

- Setting a scope for the project allows us to define what gets proxied and logged. We can restrict Burp Suite to only target the web application(s) that we want to test. The easiest way to do this is by switching over to the **"Target"** tab, right-clicking our target from our list on the left, then choosing **"Add To Scope"**. 

- Burp will then ask us whether we want to stop logging anything which isn't in scope: most of the time we want to choose **"yes"** here.

  ![Screenshot (806)](https://user-images.githubusercontent.com/63872951/182321754-3ff6defb-69dd-45fa-9446-353fafa3711b.png)

- We can now check our scope by switching to the **"Scope"** sub-tab.

- The Scope sub-tab allows us to control what we are targeting by either Including or Excluding domains / IPs. This is a very powerful section, so it's well worth taking the time to get accustomed to using it.

#

- We just chose to disable logging for out of scope traffic, but the proxy will still be intercepting everything. To turn this off, we need to go into the Proxy Options sub-tab and select `"And URL Is in target scope"` from the Intercept Client Requests section:
  
  ![Screenshot (807)](https://user-images.githubusercontent.com/63872951/182322267-6ee44182-051c-4f62-bbac-ebdbac8f5e3f.png)

- With this option selected, the proxy will completely ignore anything that isn't in the scope, vastly cleaning up the traffic coming through Burp.
