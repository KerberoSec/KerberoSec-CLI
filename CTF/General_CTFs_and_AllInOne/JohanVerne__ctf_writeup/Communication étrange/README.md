# Communication étrange

## Challenge

On a intercepté une communication étrange qui contient des informations importantes. Pouvez-vous les retrouvez en étudiant la capture Wireshark capture.pcap ?

## Solution

Le filtre Wireshark usb.capdata ne semble renvoyer aucune donnée sur la capture.
On remarque de nombreuses interruptions USB dans la seconde moitié de la capture, avec des valeurs "HID Data" variables. Cela laisse penser à des interruptions claviers, avec HID Data représentant la valeur des touches pressées.

On extrait la colonne HID Data avec tshark : `tshark -r capture.pcap -T fields -e usbhid.data > usb_data.txt`

On emprunte enfin le script pour décoder les valeurs des touches préssées à ce site : https://infosecwriteups.com/keystroke-forensics-101-extracting-secrets-from-usb-traffic-7fdd4797d1a9

On obtient enfin le flag en plaintext

## Flag

usb_p4ck3t_c4ptur3_1s_fun
