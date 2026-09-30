
# Challenge: Shutter Trace

**Scenario:**  
You work in the police investigation department and have received an anonymous lead on a criminal case. Your chief has shared a folder containing the evidence, and your task is to uncover the identity of the person who took the photo found in the folder.

The folder (`Shutter_Trace.zip`) includes several subfolders and files related to the case. One of these folders contains an image with hidden information that reveals the photographer’s identity.  

---

## Step-by-Step Writeup (Linux Terminal)

1. **Download and Extract the Zip File**

   ```bash
   # Navigate to the directory where the ZIP file is located
   cd /path/to/downloads

   # Extract the ZIP archive
   unzip Shutter_Trace.zip -d Shutter_Trace
   ```
   - Replace `/path/to/downloads` with the actual directory where you saved `Shutter_Trace.zip`.
   - The `-d` flag specifies the destination folder (`Shutter_Trace`).

2. **Explore the Extracted Contents**

   ```bash
   cd Shutter_Trace
   ls -la
   ```
   - This will list all files and directories, including any hidden files or folders.

3. **Locate the Clue File**

   - According to the scenario, there is a file named `clue.txt` in a `Clue` folder that provides a hint.  
   - Check for the folder named `Clue`:
     ```bash
     cd Clue
     ls -la
     ```
   - Open the `clue.txt` file:
     ```bash
     cat clue.txt
     ```
   - The contents of `clue.txt` might guide you to the `Evidence_Folder` or mention something about metadata.

4. **Investigate the Evidence Folder**

   ```bash
   cd ../Evidence_Folder
   ls -la
   ```
   - You see multiple image files. One of these images may contain hidden or embedded metadata.

5. **Use exiftool to Analyze Image Metadata**

   - Install exiftool if you haven't already (on Debian/Ubuntu-based systems):
     ```bash
     sudo apt-get update
     sudo apt-get install libimage-exiftool-perl
     ```
   - Run exiftool on each image or on a specific file (for example, `super-market-8494759_1280.jpg`):
     ```bash
     exiftool super-market-8494759_1280.jpg
     ```
   - Look for any unusual fields, such as `Creator`, `Asset ID`, or custom tags.

6. **Retrieve the Flag**

   - While inspecting `super-market-8494759_1280.jpg`, you find the following metadata:
     ```
     XMP Toolkit           : Image::ExifTool 12.57
     Asset ID             : 1412353022
     Creator              : DDC{D4n13lss3n}
     Description          : Empty aisle at a supermarket - grocery shopping concepts
     ...
     ```
   - The `Creator` field reveals the hidden flag:
     ```
     DDC{D4n13lss3n}
     ```

7. **Conclusion**

   - By examining the image’s EXIF data, you have uncovered the identity of the photographer, indicated by the flag.  
   - **Flag:** `DDC{D4n13lss3n}`

---

## Key Takeaways

- **Extracting Files**: Use `unzip` to decompress archives in Linux.  
- **Navigating Directories**: Commands like `cd` and `ls -la` help you explore directories, including hidden files.  
- **Metadata Analysis**: Tools like `exiftool` can reveal hidden or embedded metadata in images, such as creator info or flags.  
- **Reading Clues**: Always check any provided clue files (e.g., `clue.txt`) to guide your investigation.

This approach ensures you systematically inspect the folders and files, culminating in analyzing the image metadata to retrieve the hidden information.
