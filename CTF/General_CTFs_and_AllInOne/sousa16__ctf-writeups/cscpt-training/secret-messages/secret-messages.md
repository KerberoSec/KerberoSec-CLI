## Secret Messages

[Link to challenge](https://training.cybersecuritychallenge.pt/challenges#Secret%20Messages-32)

Write-up:

1. After analyzing some different requests: like note creation with file upload, etc. -
we see that it's possible for us to download the files uploaded in the notes.
Altering that GET request, we can access different files in the challenge.

2. By the responses to the requests, we can see that it is an Nginx server. After some
research, I learned that the nginx config files are in /etc/nginx. <br>

    `GET /download/file?id=../../etc/nginx/conf.d/default.conf HTTP/1.1` <br>

    This shows us there's a hidden endpoint: **/mys3cr3t4pi/**

3. Accessing this endpoint shows us we can try SQLi:
    ```json
    {
        "MESSAGE": "Use the /statistics endpont to get statistics on the notes. Or send a username to get his notes \"/statistics?user=username\""
    }
    ```

4. Attempting `GET /mys3cr3t4pi/statistics?user=sousa' OR '1'='1` shows us all users' notes,
and one includes the flag: **CSCPT{I Think they are reading our secret messages}**