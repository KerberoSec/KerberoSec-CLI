# Options

# 1. User Options

- There are **four** main sub-sections of the User options tab:

    - **The Connections sub-tab** allow us to control how Burp makes connections to targets. For example, we can set a proxy for Burp Suite to connect through; this is very useful if we want to use Burp Suite through a network pivot.
    - **The TLS sub-tab** allows us to enable and disable various TLS (Transport Layer Security) options, as well as giving us a place to upload client certificates should a web app require us to use one for connections.
    - **The Display** allows us to change how Burp Suite looks. The options here include things like changing the font and scale, as well as setting the theme for the framework (e.g. dark mode) and configuring various options to do with the rendering engine in Repeater.
    - **The Misc sub-tab** contains a wide variety of settings, including the keybinding table (HotKeys), which allowing us to view and alter the keyboard shortcuts used by Burp Suite. Familiarising yourself with these settings would be advisable, as using the keybinds can speed up your workflow massively.

  ![Screenshot (795)](https://user-images.githubusercontent.com/63872951/182176247-db31bbc1-5d47-4ec2-a409-c25e61e5c247.png)

# 2. Project Options

- There are **five** sub-tabs here:

    - **Connections** holds many of the same options as the equivalent section of the User options tab: these can be used to override the application-wide settings. For example, it is possible to set a proxy for just the project, overriding any proxy settings that you set in the User options tab. There are a few differences between this sub-tab and that of the User options, however. For example, the **"Hostname Resolution"** option (allowing you to map domains to IPs directly within Burp Suite) can be very handy: as can the **"Out-of-Scope Requests"** settings, which enable  us to determine whether Burp will send requests to anything you aren't explicitly targeting (more on this later!).
    - **The HTTP sub-tab** defines how Burp handles various aspects of the HTTP protocol: for example, whether it follows redirects or how to handle unusual response codes.
    - **TLS** allows us to override application-wide TLS options, as well as showing us a list of public server certificates for sites that we have visited.
    - **The Sessions tab** provides us with options for handling sessions. It allows us to define how Burp obtains, saves, and uses session cookies that it receives from target sites. It also allows us to define macros which we can use to automate things such as logging into web applications (giving us an instant authenticated session, assuming we have valid credentials).
    - **The Misc sub-tab** has fewer options than in the equivalent tab for the "User options" section. Many of the options here are also only available if you have access to Burp Pro (such as those configuring Collaborator). That said, there are a couple of options related to logging and the embedded browser (which we will look at in a couple of tasks) that are well worth perusing.

# Answer the questions below

1. In which Project options sub-tab can you find reference to a "Cookie jar"?
```
Sessions
```
2. In which User options sub-tab can you change the Burp Suite update behaviour?
```
Misc
```
3. What is the name of the section within the User options "Misc" sub-tab which allows you to change the Burp Suite keybindings?
```
HotKeys
```
4. If we have uploaded Client-Side TLS certificates in the User options tab, can we override these on a per-project basis (Aye/Nay)?
```
Aye
```
