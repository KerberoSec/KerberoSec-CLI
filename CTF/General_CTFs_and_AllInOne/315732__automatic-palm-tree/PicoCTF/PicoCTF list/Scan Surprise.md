#### Description

I've gotten bored of handing out flags as text. Wouldn't it be cool if they were an image instead? You can download the challenge files here:

- [challenge.zip](https://artifacts.picoctf.net/c_atlas/3/challenge.zip)

Additional details will be available after launching your challenge instance.
### Steps:

1. Install the required libraries:
    ```bash
    pip install opencv-python pyzbar
    ```

2. Code to read a QR code:
```python
import cv2
from pyzbar.pyzbar import decode

def read_qr_code(image_path):
    # Load the image
    image = cv2.imread(image_path)

    # Decode QR codes in the image
    decoded_objects = decode(image)
    if not decoded_objects:
        print("No QR code found in the image.")
        return

    # Print data from QR codes
    for obj in decoded_objects:
        print("QR Code Data:", obj.data.decode("utf-8"))
        print("QR Code Type:", obj.type)

# Provide the path to your QR code image
image_path = "flag.png"  # Replace with your image path
read_qr_code(image_path)
```

![[Pasted image 20241130134006.png]]

```flag
picoCTF{p33k_@_b00_a81f0a35}
```
