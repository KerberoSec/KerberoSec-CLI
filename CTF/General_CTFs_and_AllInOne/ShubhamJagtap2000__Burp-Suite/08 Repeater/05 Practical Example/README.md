# Practical : Example

- Repeater is best suited for the kind of task where we need to send the same request numerous times, usually with small changes in between requests. For example, we may wish to manually test for an `SQL Injection` vulnerability, attempt to bypass a web application firewall filter, or simply add or change parameters in a form submission.

- For now, let's start with an extremely simple example: using Repeater to alter the headers of a request we send to a target.

  1. Capture a request to `http://MACHINE_IP/` in the Proxy and send it to Repeater.
  2. Send the request once from Repeater: you should see the HTML source code for the page you requested in the response tab.

- Try viewing this in one of the other view options (e.g. Rendered).

  3. Using Inspector (or manually, if you prefer), add a header called `FlagAuthorised` and set it to have a value of `True`. e.g.:

  ![Screenshot (815)](https://user-images.githubusercontent.com/63872951/182872811-5e83c714-7167-4b44-9add-172dde6ec3de.png)

- Send the request. What is the flag you receive?
```
THM{Yzg2MWI2ZDhlYzdlNGFiZTUzZTIzMzVi}
```
