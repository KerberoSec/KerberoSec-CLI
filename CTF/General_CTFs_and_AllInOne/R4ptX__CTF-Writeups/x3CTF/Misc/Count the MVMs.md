## x3CTF is the first live team based CTF I've ever attended. One of the least solved challenges in the competition was Count the MVMs. I got first blood on the challenge, and here's how I solved it. 

Description from the organisers: 
Count all occurrences of MVM in your personalized trophy (image obtained from previous challenge). I heard AI is supreme at OCR tasks, so this should be trivial in 2025. 
<br>Initially, it seemed quite straightforward, as one could simply count the number of times it appears in the text. Well, that is how it seems until you turn down the exposure of the cert.</br>
![image](https://github.com/user-attachments/assets/787bc402-dad1-4429-adeb-c44295eb8268)
![image](https://github.com/user-attachments/assets/ec026b84-9c5a-449e-8dac-92b376e42bf6)
<p>Zoomed in, that's a lot of "MVM's".</p>

From there on, I looked at the description of the challenge. It said to use AI since it's "supreme at solving OCR tasks", but that was a bit misleading as well.
<br></br>
![image](https://github.com/user-attachments/assets/a9a990e9-8c77-47b5-937c-245753a36ba0)
<br></br>
I spent a while looking at the image, and for a second I considered counting every "MVM" that was in the certificate as the description advised the most junior member (which I'm pretty sure was me) to do. Then I realised that every repeating instance of "MVM" in the background had the exact same pixel sequence.
(upscaled for clarity)
<br></br>
![image](https://github.com/user-attachments/assets/c3117d16-c41c-43b6-8a60-57b23324490f)
<br></br>
So then I thought of writing a script to count the number of times this image repeats in the larger image using python's OpenCV library, and volia!
```python
import cv2
import numpy as np

def count_template_repeats(large_image_path, small_image_path, threshold=0.9):
    # Load the images
    large_img = cv2.imread(large_image, cv2.IMREAD_GRAYSCALE)
    small_img = cv2.imread(small_image, cv2.IMREAD_GRAYSCALE)

    # Perform template matching
    result = cv2.matchTemplate(large_img, small_img, cv2.TM_CCOEFF_NORMED)
    
    # Find locations where the match is above the threshold
    locations = np.where(result >= threshold)

    # Count how many times the template appears
    count = len(locations[0])

    return count

if __name__ == "__main__":
    large_image = 'cert.png'
    small_image = 'mvm.png'

    repeat_count = count_template_repeats(large_image, small_image)

    print(f"Repeats: {repeat_count}")
```
![image](https://github.com/user-attachments/assets/03db71f0-5fbc-4e4e-b224-f0d8de4c7dcb)
<br></br>That wasn't quite it though, because it doesn't account for the number of times "MVM" appears elsewhere. So I read through the text counted 3 more occurances of "MVM", which brings a total count of 9336.
Following the rules for the flag format, I inserted the number of occurences and the MD2 representation of that number to get the flag.
#### x3c{th3r3_4re_9336_MVMs_1n_my_c3rtif1cat3_2931355ee608d35463f2ef7847474858}
![image](https://github.com/user-attachments/assets/57a08047-4f4d-4c55-be66-fdad12909bef)
<br>Technically I also got extra brownie points per the rules.</br>
