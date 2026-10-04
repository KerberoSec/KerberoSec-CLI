# Views

- Repeater offers us various ways to present the responses to our requests: these range from hex output all the way up to a fully rendered version of the page.

- We can see the available options by looking above the response box:

  ![Screenshot (812)](https://user-images.githubusercontent.com/63872951/182772529-262ea242-ef76-4956-a814-0bca72058eaa.png)

- We have four display options here:

    **1. Pretty:** This is the default option. It takes the raw response and attempts to beautify it slightly, making it easier to read.<br>
    **2. Raw:** The pure, un-beautified response from the server.<br>
    **3. Hex:** This view takes the raw response and gives us a byte view of it: especially useful if the response is a binary file.<br>
    **4. Render:** The render view renders the page as it would appear in your browser. Whilst not hugely useful given that we would usually be interested in the source code when using Repeater, this is still a neat trick.
    
#
    
- Just to the right of the view buttons is the `"Show non-printable characters"` button (\n). This button allows us to display characters that usually wouldn't show up in the Pretty or Raw views. 

- For example, every line in the response will end with the characters `\r\n`: these signify a carriage return followed by a newline and are part of how HTTP headers are interpreted.

