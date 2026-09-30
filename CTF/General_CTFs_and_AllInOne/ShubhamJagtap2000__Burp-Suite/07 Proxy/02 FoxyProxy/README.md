# Connecting Through Proxy

Download Link: **[FoxyProxy Basic for Mozilla](https://addons.mozilla.org/en-US/firefox/addon/foxyproxy-basic/)**

- The Burp Proxy works by opening a web interface on **127.0.0.1:8080** (by default). 

- As implied by the fact that this is a "proxy", we need to redirect all of our browser traffic through this port before we can start intercepting it with Burp. 
- We can do this by altering our browser settings or, more commonly, by using a Firefox browser extension called `FoxyProxy`. **[FoxyProxy](https://getfoxyproxy.org/)** allows us to save proxy profiles, meaning we can quickly and easily switch to our "Burp Suite" profile in a matter of clicks, then disable the proxy just as easily.

- There are two versions of FoxyProxy: **Basic and Standard**. Both versions allow you to change your proxy settings on the fly; however, 

- **FoxyProxy Standard** gives you a lot more control over what traffic gets sent through the proxy. For example, it will allow you to set pattern matching rules to determine whether a request should be proxied or not: this is more complicated than the simple proxy offered by **FoxyProxy Basic**.

# Configuring Our First Proxy

- There are no default configurations, so let's click on the **"Options"** button to create our Burp Proxy config.

- This will open a new browser tab with the FoxyProxy options page:
  
  ![Screenshot (799)](https://user-images.githubusercontent.com/63872951/182314707-551996e8-d733-4091-87f4-a5db863d5fbd.png)

- Click on the **"Add"** button and fill in the following values:

    - **Title**: Burp (or anything else you prefer)
    - **Proxy IP**: 127.0.0.1
    - **Port**: 8080
    
- Now, click **"Save"**

- When you click on the FoxyProxy icon at the `top of the screen`, you will see that that there is a configuration available for Burp:

  ![Screenshot (800)](https://user-images.githubusercontent.com/63872951/182315245-9f903dda-c29a-4d59-a213-f25025053895.png)

- If we click on the "Burp" config, our browser will start directing all of our traffic through **127.0.0.1:8080**. 

**Be warned:** If Burp Suite is not running, your browser will not be able to make any requests when this config is activated!

- Activate this config now: the icon in the menu should change to indicate that we have a proxy running.
- The FoxyProxy icon when we have a proxy selected: If we click on the "Burp" config, our browser will start directing all of our traffic through 127.0.0.1:8080. Be warned: if Burp Suite is not running, your browser will not be able to make any requests when this config is activated!

- Activate this config now: the icon in the menu should change to indicate that we have a proxy running.

- Next, switch over to Burp Suite and make sure the Intercept is On:

  ![Screenshot (801)](https://user-images.githubusercontent.com/63872951/182315940-9e17b314-d80e-4288-9c70-1289d385f859.png)

- Go to any website. Your browser should hang, and your proxy will populate with the **request headers**.

#### Congratulations, you just intercepted your first request!

- From here, you can choose to `forward or drop` the request. Alternatively, you could send it to another tool or perform any number of other actions by right-clicking on the request and selecting an option from the right-click menu.

# Answer the questions below

Read through the options in the right-click menu.

1. There is one particularly useful option that allows you to intercept and modify the response to your request.

What is this option?

Note: The option is in a dropdown sub-menu.
```
Response to this request
```

