# Description

One of the employees at your company has their computer infected by malware! Turns out every time they try to switch on the computer, it shuts down right after they log in. The story given by the employee is as follows:
They installed software using an installer they downloaded online
They ran the installed software but it seemed to do nothing
Now every time they bootup and login to their computer, a black command prompt screen quickly opens and closes and their computer shuts down instantly.
See if you can find evidence for the each of these events and retrieve the flag (split into 3 pieces) from the correct logs!
Download the Windows Log file here

# Solution

The first method is going to be an unintended solution, but this first script can apply to both methods. The following script basically converts the evtx into a more easily readable xml file all in one place:

```
import os
import sys
from Evtx.Evtx import Evtx

def parse_evtx_file(file_name):
    file_path = os.path.join(os.getcwd(), file_name)
    
    with Evtx(file_path) as log, open("ouput.xml", "w", encoding="utf-8") as out_file:
        for record in log.records():
            out_file.write(record.xml() + "\n")
    print("Parsing complete. Output saved to ouput.xml")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 script.py <filename>")
        sys.exit(1)
    
    file_name = sys.argv[1]
    parse_evtx_file(file_name)
```

Now that all the information is in `output.xml` you can look through the events and try to understand the logic behind the challenge, or... just search for the base64 strings. There is a lot of text so here is a script that tries its best to find relevant base64:

```
import base64
import re
import sys

def is_valid_base64(s):
    try:
        decoded = base64.b64decode(s, validate=True).decode('utf-8')
        if re.search(r'[\x00-\x08\x0B-\x1F]', decoded):
            return False
        return True
    except Exception:
        return False

def find_base64_in_file(file_path):
    base64_pattern = re.compile(r'([A-Za-z0-9+/=]{20,})')
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        for line in file:
            matches = base64_pattern.findall(line)
            for match in matches:
                if is_valid_base64(match):
                    decoded_text = base64.b64decode(match).decode('utf-8', errors='ignore')
                    print(f"Encoded: {match}\nDecoded: {decoded_text}\n")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 base64_scanner.py <filename>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    find_base64_in_file(file_path)
```

Once you get the output of that script it's pretty easy to see which base64 segments correspond to the flag and put it into [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)) to get the answer. Here are relevant pieces extracted from the base64 extraction script:

Encoded: cGljb0NURntFdjNudF92aTN3djNyXw==
Decoded: picoCTF{Ev3nt_vi3wv3r_

Encoded: MXNfYV9wcjN0dHlfdXMzZnVsXw==
Decoded: 1s_a_pr3tty_us3ful_

Encoded: dDAwbF84MWJhM2ZlOX0=
Decoded: t00l_81b...}

Now for the more logical way of finding the flag you would look based on the EVENT IDs and data from the events. If you are Windows then you can just open the evtx file in the default application otherwise you can used the parsed data from the first script and it should have the same effect.

Here are the relevant event IDs that correspond to the flag:
Event ID 1033
Event ID 4657
Event ID 1074

If you are opening this in the Event Viewer on Windows then on the right side you can see Filter Current Log to filter based on the event ID.

First, for the event ID of 1033 the one logged at 7/15/2024 10:55:57 AM with Totally_Legit_Software as the product has this description, and the base64 can also be seen in the details under event data:

Windows Installer installed the product. Product Name: Totally_Legit_Software. Product Version: 1.3.3.7. Product Language: 0. Manufacturer: cGljb0NURntFdjNudF92aTN3djNyXw==. Installation success or error status: 0.

Just from the start of the base64 being `cGljb` you can tell that it is picoCTF as the start but you can also use [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)) or another way to decode the base64.

Next event ID 4657 logged at 7/15/2024 10:56:19 AM with Totally_Legit_Software shows:

Object Value Name:	Immediate Shutdown (MXNfYV9wcjN0dHlfdXMzZnVsXw==)

Lastly, event ID 1074 logged at 7/15/2024 12:02:35 PM:

Shutdown Type: shutdown
Comment: dDAwbF84MWJhM2ZlOX0=

All of these base64 values put together give the flag. Keep in mind there are multiple different areas where the base64 is shown for different event id's as can be seen if you look through the output of evtx script.

Flag: `picoCTF{Ev3nt_vi3wv3r_1s_a_pr3tty_us3ful_t00l_81b...}`