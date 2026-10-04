# Tux!

### Prompt

The flag is hidden inside the Penguin! Solve this challenge before solving my 100 point Scope challenge which uses similar techniques as this one.\
\
https://ctflearn.com/challenge/download/973

### Approach

- Viewed metadata of the attached file 'Tux.jpg' using exiftool to find this string as a comment.
  > ICAgICAgUGFzc3dvcmQ6IExpbnV4MTIzNDUK.
- Decoding this from base64 gives us 
  > Password: Linux12345
- This made me suspect that a password protected file was embedded in the image file. Ran binwalk on the file to confirm.
  ```
  DECIMAL       HEXADECIMAL     DESCRIPTION
  --------------------------------------------------------------------------------
  0             0x0             JPEG image data, JFIF standard 1.01
  5488          0x1570          Zip archive data, encrypted at least v1.0 to extract, compressed size: 39, uncompressed size: 27, name: flag
  5679          0x162F          End of Zip archive, footer length: 22
- Extracted the embedded files by running
  > binwalk -dd='.*' Tux.jpg

- Attempted to unzip newly extracted file, but it was password protected. Used the password obtained earlier, to succesfully extract a text file with the flag.

- Flag Obtained : CTFlearn{Linux_Is_Awesome}

