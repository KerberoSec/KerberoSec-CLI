# Many Encode
Points: 300

### Description
I was messing around with python encoding methods, using the base64 library, but I lost my password. Please help:

343234333433353434363762353733343639353435663638333035373566343433303635373335663534363833313335356634383334373035303435366533663764

## My Approach
1. I wrote a python script to decode the given string.
2. I used `bytes.fromhex` to convert the hex string to bytes.
3. Then I used `decode` function to decode the bytes to string.
4. I ran an infinite loop to decode the given string multiple times.
5. I used this script to decode the string and got the flag.

   ![image](https://github.com/sr-tamim/bearcatCTF-writeup/assets/86656406/2f7a9026-a471-4060-b44a-7315794180e2)

7. The python script is as follows:
```python
import base64

encoded_string = "343234333433353434363762353733343639353435663638333035373566343433303635373335663534363833313335356634383334373035303435366533663764"

print("Encoded string:", encoded_string)

# Convert the encoded string to bytes
encoded_bytes = bytes.fromhex(encoded_string)

decoded_bytes = encoded_bytes
decoded_string = ""

# infinite loop to decode the bytes until an exception occurs
while True:
    try:
        # Decode the bytes
        decoded_string = decoded_bytes.decode('utf-8')
        # set the decoded string to the base64 decoded bytes
        decoded_bytes = bytes.fromhex(decoded_string)
    except:
        # If an exception occurs, break the loop
        break

print("Decoded string:", decoded_string)
```
