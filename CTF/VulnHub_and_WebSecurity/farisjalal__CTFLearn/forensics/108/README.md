# Binwalk

### Prompt

Here is a file with another file hidden inside it. Can you extract it?
https://mega.nz/#!qbpUTYiK!-deNdQJxsQS8bTSMxeUOtpEclCI-zpK7tbJiKV0tXYY

### Approach

- Running binwalk on the image 'PurpleThing.jpeg' reveals that another hidden image has been embedded in it

- Run this command to extract the embedded files
  ```
  binwalk --dd='.*' PurpleThing.jpeg
  ```

- Opening the image reveals the flag

- Flag Obtained : ```ABCTF{T3Rm1n4l_is_C00l} ```  
