
# Challenge: Straba

**Scenario:**  
Note: The challenge solution does not involve finding any people/locations from the visuals of the picture. You can treat all the pictures as if they are all AI generated. (A few pictures turned out to be real, this is not part of the solution. The author has been bonked with a stick for their crimes.)

We are looking for the location of some soldiers. We have received a tip-off that they use Straba to post their runs. However, Straba has a policy of not disclosing any information, so we have to see if we can find something ourselves. Go to [straba.hkn](http://straba.hkn) and see if you can find anything in the images.

The flag is the name of the city near the military base they are at.

Example flag: DDC{roskilde}

**NOTE:**  
Create a user and find the VPN and Browser LABs on Campfire Labs.

---

## Step-by-Step Writeup (Linux Terminal)

1. **Access the Website and Download the Images**

   - Visit the website:
     ```bash
     xdg-open http://straba.hkn
     ```
   - Download all images from the website manually or using a tool like `wget`.

2. **Inspect the Downloaded Files**

   - Once downloaded, navigate to the directory containing the images:
     ```bash
     cd /path/to/straba_images
     ls -la
     ```
   - Identify the images available for analysis.

3. **Analyze Images with exiftool**

   - Use `exiftool` to inspect the metadata of the images. For example, inspect one image:
     ```bash
     exiftool loeber1.e8895b9ead42a2daa61c.jpg
     ```
   - This command displays all metadata fields of the specified image.

4. **Locate the Coordinates in the Metadata**

   - In the metadata output, locate the coordinate fields:
     ```
     Latitude  : 55.2378708
     Longitude : 9.2462231
     ```
   - These coordinates point to a specific location.

5. **Determine the Location Using Google Maps**

   - Open Google Maps with the coordinates:
     ```bash
     xdg-open "https://www.google.com/maps?q=55.2378708,9.2462231"
     ```
   - Upon inspection, the closest city to the military base is **Skrydstrup**.

6. **Retrieve the Flag**

   - The flag is the name of the city near the military base:
     ```
     DDC{Skrydstrup}
     ```

7. **Conclusion**

   - By analyzing the metadata from the image `loeber1.e8895b9ead42a2daa61c.jpg`, you found the coordinates leading to Skrydstrup.
   - **Flag:** `DDC{Skrydstrup}`

---

## Key Takeaways

- **Image Downloading:** Tools like `wget` or manual downloads can be used to retrieve images from a website.  
- **Metadata Analysis:** `exiftool` is an essential tool for extracting metadata, such as GPS coordinates, from image files.  
- **Location Mapping:** Using extracted coordinates with Google Maps can help determine physical locations related to a challenge.

This approach ensures you methodically analyze provided images, extract critical metadata, and determine the correct location to solve the challenge.
