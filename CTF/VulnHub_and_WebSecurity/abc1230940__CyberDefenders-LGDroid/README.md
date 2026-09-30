<a name="top"></a>

<p align="center"> 
  <a href="https://www.linkedin.com/in/clarence-fong" target="_blank">
    <img width="50" height="50" alt="LinkedIn" src="https://github.com/user-attachments/assets/7ab6e12b-ca8a-4aa6-8f10-79ba89d485b5" />
  </a>
  <a href="mailto:abc1230940@gmail.com">
    <img width="50" height="50" alt="Gmail" src="https://github.com/user-attachments/assets/4e0491ce-239c-413c-b433-74a5ff48f231" />
  </a>
  <a href="https://www.instagram.com/cyberbrexel?igsh=MXNxeWJid2VxZWxxaw%3D%3D&utm_source=qr" target="_blank">
    <img width="50" height="50" alt="Instagram Old" src="https://github.com/user-attachments/assets/62e4672b-d424-4489-a204-c301040905a3" />
  </a>
  <a href="https://discordapp.com/users/cyberbrexel" target="_blank">
    <img width="50" height="50" alt="Discord" src="https://github.com/user-attachments/assets/f76173ca-fad3-4390-bca1-5c2305bc748e" />
  </a>
  <a href="https://www.reddit.com/user/abc1230940/" target="_blank">
    <img width="50" height="50" alt="Reddit" src="https://github.com/user-attachments/assets/6e9bd985-dfa3-4349-b966-4cf49362bd61" />
  </a>
</p> <br>

<h2 align="center"> CyberDefenders Write-up: LGDroid </h2>
<p align="center"> <img width="300" height="300" alt="126131-android-robot-png-download-free" src="https://github.com/user-attachments/assets/2bcb1724-ee3e-44be-be27-abab05161206" /> </p>
<h2 id="scenario"> Scenario </h2>
<p> On May 21, 2021, an intelligence agency intercepted a mobile device suspected of covert operations. The forensic team performed a full disk dump, extracting databases, logs, and application activity. Findings suggest encrypted communications, anonymous browsing, and unauthorized data transfers. Analyze extracted data to determine suspect activities, network connections, and security risks while establishing a timeline of events. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="tools-used"> Tools Used </h2>
<ol>
  <li> DB Browswer for SQLite </li>
  <li> Notepad </li>
  <li> <a href="https://www.epochconverter.com/"> Epoch Converter </a> </li>
  <li> SSIM Calculator </li>
  <li> Python </li>
  <li> Gemini </li>
</ol>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="questions"> Questions </h2>
<p> <strong> 1. What is the email address of Zoe Washburne? </strong></p>
<p> We can navigate to <strong>"LGE LM-Q725K Quick Image\Agent Data"</strong> and open contacts3.db with DB Browser for SQLite to view the acquired_contacts table. </p>
<img width="1762" height="913" alt="Screenshot 2026-07-13 152226" src="https://github.com/user-attachments/assets/d8f07e98-9067-4e6a-917d-d18ca7bd081c" />
<img width="441" height="92" alt="Screenshot 2026-07-13 152237" src="https://github.com/user-attachments/assets/768136c4-45c3-4af5-a23d-1bb1a751472d" />
<p> The email address was <strong>zoewash@0x42.null</strong>. </p>
<br>
<p> <strong> 2. What was the device's DateTime in UTC at the time of acquisition? </strong></p>
<p> We can navigate to <strong>"LGE LM-Q725K Quick Image\Live Data"</strong> and view device_datetime_utc.txt, which contains the time of acquisition. </p>
<img width="242" height="127" alt="Screenshot 2026-07-13 152604" src="https://github.com/user-attachments/assets/9a6c2ae6-fe59-4c7f-ac7d-f5d159875862" />
<p> The device's DateTime was <strong>2021-05-21 18:17</strong>. </p>
<br>
<p> <strong> 3. What time was the Tor Browser downloaded in UTC? </strong></p>
<p> We can navigate to <strong>"LGE LM-Q725K Quick Image\Agent Data"</strong> and open downloads.db with DB Browser for SQLite to view the downloads table. </p> 
<img width="1762" height="913" alt="Screenshot 2026-07-13 152947" src="https://github.com/user-attachments/assets/6ac9feb5-8d73-4911-a3cc-a91746158aa3" />
<img width="441" height="136" alt="Screenshot 2026-07-13 152956" src="https://github.com/user-attachments/assets/9d64e08f-d817-4f21-8ca6-f163f5cb0b51" />
<p> The timestamp was in Unix Epoch format, so we needed to convert it to human-readable timestamp using <a href="https://www.epochconverter.com/"> Epoch Converter</a>. </p> 
<img width="955" height="712" alt="Screenshot 2026-07-13 153452" src="https://github.com/user-attachments/assets/62424644-47af-4b55-bf18-72da8ceb880d" />
<p> The Tor browser was downloaded at <strong>2021-04-29 19:42</strong>. Tor Browser is commonly used to access the dark web by routing traffic through the Tor network to browse .onion sites. </p>
<br>
<p> <strong> 4. At what time did the phone reach a 100% charge after the last reset? </strong></p>
<p> We can navigate to <strong>"LGE LM-Q725K Quick Image\Live Data\Dumpsys Data"</strong> and view batterystats.txt, which contains the battery usage history. </p>
<img width="1636" height="107" alt="image" src="https://github.com/user-attachments/assets/26ab0e30-4f11-4a05-983a-264a52f37ae3" />
<p> As we can see the status, we identified the device reset time as 2021-05-21 13:12:19, which corresponds to when the phone was powered on without charging. </p>
<img width="485" height="115" alt="Screenshot 2026-07-13 155053" src="https://github.com/user-attachments/assets/3717b9d7-e978-49c3-bb1b-5d3989ce3674" />
<p> As we scrolled down the entity and can identify that the battery was fully charged after 5m01s459ms, which was <strong>2021-05-21 13:17</strong>. </p>
<br>
<p> <strong> 5. What is the password for the most recently connected WIFI access point? </strong> </p>
<p> In order to identify the Wi-Fi password for the AP, we unarchived the adb-data.tar and navigate to <strong>"adb-data\apps\com.android.providers.settings\k"</strong> and open com.android.providers.settings.data with Notepad to view the WI-FI configuration setting. </p>
<img width="635" height="98" alt="Screenshot 2026-07-13 160606" src="https://github.com/user-attachments/assets/b69292d3-4021-4d39-ae3e-70e25c985da6" />
<img width="568" height="468" alt="Screenshot 2026-07-13 160621" src="https://github.com/user-attachments/assets/dde25853-1ecb-4233-9625-bc88cf2e0008" />
<p> The `WifiConfiguration` XML block revealed the element `PreSharedKey` with the value <strong>ThinkingForest!</strong>, which was the password of the AP. </p>
<br>
<p> <strong> 6. What app was the user focused on at 2021-05-20 14:13:27? </strong></p>
<p> We can navigate to <strong>"LGE LM-Q725K Quick Image\Live Data"</strong> and view usage_stats.txt, which contains the application usage history. </p>
<img width="1402" height="448" alt="Screenshot 2026-07-13 161119" src="https://github.com/user-attachments/assets/9041666c-77b3-4ad9-be7b-8d192298c6ed" />
<p> The log indicated that at 2021-05-20 14:13:27, <strong>youtube</strong> was being used by the user. </p>
<br>
<p> <strong> 7. How long did the suspect watch YouTube on 2021-05-20? </strong></p>
<p> Given by the hints in this question, within the same log file we can identify the application activities by looking at the type in the entries. I did some research on the explanation for each type. </p>
<ul>
  <li> MOVE_TO_FOREGROUND: The application is active </li>
  <li> MOVE_TO_BACKGROUND: The application is closed or minimized </li>
  <li> STANDBY_BUCKET_CHANGED: The applicaiton runs in background </li>
  <li> NOTIFICATION_INTERRUPTION: Pop up a notification banner </li>
  <li> NOTIFICATION_SEEN: the banner is seen </li>
</ul>
<p> Therefore, I used cmd to filter the targeted events to determine the duration of the application used. </p>
<pre> <code lang="cmd"> type usage_stats.txt | findstr /I "youtube" | findstr /I "foreground background" </code> </pre>
<img width="1390" height="97" alt="Screenshot 2026-07-13 195610" src="https://github.com/user-attachments/assets/c904019d-88f5-4be7-b128-af42f2e350f9" />
<p> Based on the log, youtube was active from 14:13:27 to 22:47:57, which is equal to <strong>08:34</strong> long. </p>
<br>
<p> <strong> 8. What is the structural similarity metric for the image "suspicious.jpg" compared to a visually similar image taken with a mobile phone? </strong></p>
<p> I did some research on the meaning and usage of SSIM on Gemini. </p>
<img width="848" height="775" alt="Screenshot 2026-07-13 200650" src="https://github.com/user-attachments/assets/773a2a77-1d74-42f8-aca8-ac87a6231f3f" />
<p> Unlike executable code, when we transfer a picture or video via the social media or messaging applications on Android devices, they will be compressed, resulting in changing the hash value of the multimedia file. Therefore, in order to check the integrity, SSIM will be used to compare the visual similarity between two images or videos by comparing Luminance, Contrast, Structure. SSIM will output a value ranging from -1(dissimilar) to 1(identical). </p>
<p> Therefore, I asked Gemini for a python program to compare the SSIM between suspicious.jpg and the images taken with the mobile phone, which is located in a path <strong>"LGE LM-Q725K Quick Image/adb-data/shared/0/DCIM/Camera"</strong>. </p>

```python
import os
import cv2
from skimage.metrics import structural_similarity as ssim

def compare_ssim_with_folder(reference_img_path, folder_path):
    # 1. Load the reference image in grayscale
    ref_img = cv2.imread(reference_img_path, cv2.IMREAD_GRAYSCALE)
    if ref_img is None:
        raise FileNotFoundError(f"Could not load reference image from {reference_img_path}")
    
    # Store the dimensions of the reference image
    ref_height, ref_width = ref_img.shape[:2]
    
    # Supported image formats
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp')
    
    print(f"Comparing reference image with images in: {folder_path}\n")
    print(f"{'File Name':<30} | {'SSIM Score':<10}")
    print("-" * 45)
    
    # 2. Loop through the directory
    for file_name in os.listdir(folder_path):
        if file_name.lower().endswith(valid_extensions):
            file_path = os.path.join(folder_path, file_name)
            
            # Load target image in grayscale
            target_img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
            if target_img is None:
                continue
            
            # 3. SSIM requires identical dimensions; resize target if it differs
            if target_img.shape[:2] != (ref_height, ref_width):
                target_img = cv2.resize(target_img, (ref_width, ref_height), interpolation=cv2.INTER_AREA)
            
            # 4. Calculate SSIM (returns value between -1 and 1)
            score = ssim(ref_img, target_img)
            
            print(f"{file_name:<30} | {score:.4f}")

# Example Usage
if __name__ == "__main__":
    # Replace these paths with your actual paths
    REFERENCE_IMAGE = "path/to/your/reference_image.jpg"
    TARGET_FOLDER = "path/to/your/folder_of_images"
    
    compare_ssim_with_folder(REFERENCE_IMAGE, TARGET_FOLDER)
```
<p> Before running the code, make sure scikit-image and opencv-python libraries were installed. </p>
<pre> <code lang="cmd"> pip install opencv-python scikit-image </code> </pre>
<p> Run the program </p>
<pre> <code lang="cmd"> python ssim.py </code> </pre>
<img width="992" height="341" alt="Screenshot 2026-07-14 123011" src="https://github.com/user-attachments/assets/202bf37a-e257-4e14-a3f1-f9e3168785f1" />
<p> The image 20210429_151535.jpg was almost identical to suspicious.jpg with a SSIM score <strong>0.99</strong>. </p>
<p align="right">(<a href="#top">Back to Top</a>)</p>

<h2 id="reference"> Reference </h2>
<p> <a href="https://cyberdefenders.org/blueteam-ctf-challenges/achievements/abc1230940/lgdroid/"> CyberDefenders: LGDroid Lab </p>
<p> <a href="https://www.sans.org/posters/dfir-advanced-smartphone-forensics"> SANS: DFIR Advanced Smartphone Forensics </a> </p> 
<p align="right">(<a href="#top">Back to Top</a>)</p>
