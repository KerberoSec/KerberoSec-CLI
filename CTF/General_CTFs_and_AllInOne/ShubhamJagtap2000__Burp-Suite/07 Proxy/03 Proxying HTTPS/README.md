# Proxying HTTPS

- Unfortunately, there's a problem. What happens if we navigate to a site with TLS enabled? For example, https://google.com/
- We get an error.

- Specifically, Firefox is telling us that the Portswigger Certificate Authority (CA) isn't authorised to secure the connection.

- Fortunately, Burp offers us an easy way around this. We need to get Firefox to trust connections secured by **Portswigger** certs, so we will manually add the CA certificate to our list of trusted certificate authorities.

- First, with the proxy activated head to http://burp/cert; this will download a file called `cacert.der`: save it somewhere on your machine.

- Next, type about:preferences into your Firefox search bar and press enter; this takes us to the FireFox settings page. Search the page for **"certificates"** and we find the option to **"View Certificates"**:

  ![Screenshot (803)](https://user-images.githubusercontent.com/63872951/182319090-2901d3c6-d9fa-4c2b-9ec4-d2c68166dd0f.png)

- Clicking the **"View Certificates"** button allows us to see all of our trusted CA certificates. We can register a new certificate for **Portswigger** by pressing `"Import"` and selecting the file that we just downloaded.

- In the menu that pops up, select **"Trust this CA to identify websites"**, then click Ok:

  ![Screenshot (804)](https://user-images.githubusercontent.com/63872951/182319478-62bc4f58-fd97-4efd-95c7-3b6019ae1a2e.png)

#### We should now be free to visit any TLS enabled sites that we wish!
