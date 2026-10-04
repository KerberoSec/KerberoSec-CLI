# The Admin's New Credentials

## Description

You have been given a task to access the admin panel of a web application to exfiltrate a secret. However, you do not have any credentials to authenticate yourself with. Can you manage to access the secret without them?

## Challenge

This challenge is a web application written in C. It has only three endpoints: One that shows the
challenge page, one that returns the flag and a second one that can generate a valid client
certificate. The third one is a red herring and does not help you in any way, but it shows the
player how a client certificate can be generated.

The player can use the `Dockerfile` or `Makefile` to build and run the challenge locally. There is
a logger built in that will allow the user to more easily follow the controllflow through the
application.

The actual error lies in the implementation of the `verify_callback` function. We are using it
"to log client credentials", however we are not returning the correct value. The function should
return `1` if the verification was successful and `0` otherwise. However, we are always returning
`1`, which means that any client certificate will be accepted, even if it is self-signed or
invalid. This means that an attacker can generate their own client certificate and use it to access
the admin panel.

To generate the correct client certificate, you can use openssl. As long as the specified CN
(common name) is "admin", the certificate will be accepted.

```bash
openssl req -x509 -newkey rsa:2048 -keyout fake_admin.pem -out fake_admin.pem -days 365 -nodes -subj "/C=US/ST=Fake/L=Exploit/O=Attacker/CN=admin"
```

After we have generated the certificate, we can use curl to access the admin panel and retrieve the flag.

```bash
curl --cert fake_admin.pem -k https://<CHALLENGE_URL>:<PORT>/admin/flag
```
