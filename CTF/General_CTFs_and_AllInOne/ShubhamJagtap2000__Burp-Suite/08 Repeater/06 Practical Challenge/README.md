# Practical : Challenge

- With your proxy **deactivated**, head over to `http://MACHINE_IP/products/` and try clicking on some of the **"See More"** links.

- Do you notice that it redirects you to a numeric endpoint `(e.g. /products/3)` when you click for more details?

- This endpoint needs to be validated to ensure that the number you try to navigate to exists and is a valid integer; however, what happens if it is not adequately validated?

  - Capture a request to one of the numeric products endpoints in the Proxy, then forward it to Repeater.

- See if you can get the server to error out with a `"500 Internal Server Error"` code by changing the number at the end of the request to extreme inputs.

  - What is the flag you receive when you cause a 500 error in the endpoint?
  ```
  THM{N2MzMzFhMTA1MmZiYjA2YWQ4M2ZmMzhl}
  ```
