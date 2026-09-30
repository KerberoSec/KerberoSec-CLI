## Slippy

Write-up:

1. We are given a Dockerfile and the source code. The web app shows us our Session ID
and a button that takes us to `/upload`, where we can upload a zip file.

2. Uploading a zip file allows us to download the files inside that zip. The download 
request is `GET /files/filename`.

3. By creating a symlink named `passwd` pointing to `/etc/passwd` and adding it to a zip file,
we are able to access `etc/passwd` after downloading the zip contents:
   ```bash
    ln -s /etc/passwd passwd
    zip --symlinks evil.zip passwd
   ```

4. Now that we know we can retrieve files using symlinks, we just need to find where the flag is. 
The Dockerfile shows us it's in a randomly generated directory. We can also get
SESSION_SECRET by revealing `.env`. Now we have both SESSION_SECRET and SESSION_ID (for our user), which
is displayed in the web application.

   **Note: This was as far as I got during the competition. The rest of this write-up was
   written after looking at other solutions, for learning purposes.** 

5. Next, use the symlink trick again to read `server.js` and extract the `SESSION_ID` 
used by the session store (for the `develop` user). This is needed to forge a valid session cookie.

6. There is a `connect.sid` cookie, which corresponds to `<SESSION_ID>.<SIGNATURE>`.
With both the `SESSION_SECRET` and `SESSION_ID` (for the `develop` user), we can
compute the HMAC signature and create a forged `connect.sid` cookie. 
This involves base64-encoding the signature and URL-encoding the result.

7. Using the forged cookie to access the `/debug/files` endpoint, we can pass a 
crafted `session_id` parameter (such as `../../../../../../../`) to list all folders, 
including the randomly named flag directory.

8. Finally, upload another ZIP file with a symlink named `flag` pointing to `/{flag_folder}/flag.txt`. 
Download this file to retrieve the flag and complete the challenge. The solve script
for this challenge is `slippy.py`