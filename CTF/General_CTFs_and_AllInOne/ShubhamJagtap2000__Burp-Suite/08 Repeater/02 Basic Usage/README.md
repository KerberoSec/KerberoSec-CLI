# Basic Usage

- Whilst we can craft requests by hand, it would be much more common to simply capture a request in the Proxy, then send that through to Repeater for **editing/resending**.

- With a request captured in the proxy, we can send to repeater either by right-clicking on the request and choosing **"Send to Repeater"** or by pressing `Ctrl + R`.

- Switching back to Repeater, we can see that our request is now available:

  ![Screenshot (809)](https://user-images.githubusercontent.com/63872951/182771733-83b2be43-f99d-4d00-b5af-63dc5dae4e46.png)

- The target and Inspector elements are now also showing information; however, we do not yet have a response. When we click the `"Send"` button, the Response section quickly populates:

  ![Screenshot (810)](https://user-images.githubusercontent.com/63872951/182771973-0dcd3864-1803-401e-9c59-5795a49ddb2d.png)

- If we want to change anything about the request, we can simply type in the Request window and press `"Send"` again; this will update the Response on the right. For example, changing the `"Connection"` header to open rather than close results in a response `"Connection"` header with a value of keep-alive:

  ![Screenshot (811)](https://user-images.githubusercontent.com/63872951/182772157-d70f7116-7a18-4778-abd1-7a2d4d0dea54.png)
