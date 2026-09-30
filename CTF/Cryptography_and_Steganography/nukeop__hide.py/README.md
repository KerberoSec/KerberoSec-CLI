# hide.py
A steganographic program that encodes files in pictures.

# Installing dependencies

To install needed python libraries, just do this in the folder with requirements.txt:

`pip install -r requirements.txt`

# Usage

`hide.py [-h] -i IMAGE [-f FILE] -a ACTION [-p PASSWORD]`

"Image" specifies the image you want to decode or encode. Currently only png files are supported.
"Action" must be either encode or decode.
"File" is only required when encoding. It specifies the file you want to hide in the image.
"Password" is an optional argument that activates AES encryption. The password is transformed into a large key unique for that string of characters before encryption takes place.

# How it works

The program separates the file (any file will work) into bytes, which are then separated into 2-bit sequences. Those two bit sequences forming a byte are then used to modify the colors of the pixels of the image. Since every pixel has four channels (RGBA), and each channel uses 8 bits for its value (giving a range of 0-255), the channels are only modified by at most 3 (`11` bit sequence). In other words, no one will be able to tell the image contains any hidden data without this tool or a tool that reverse-engineers this functionality.

The program adds a small header to the beginning of the stream before encoding, which stores some metadata. While the program is under development, the size of this header may change. You can hide any file, including exe and zip. In fact it is advisable to compress your files before hiding to reduce their size, bundle many files into one package or encrypt them before hiding. If you use encryption the decoded file will be indistinguishable from random noise.

The side effect of the program is that it can also decode files out of any image, even ones that don't have any hidden data, but the result will be meaningless.

If you use "encode" the program will save a new image called `output.png` which will be the image with encoded data.
If you use "decode", the program will save the decoded data to a file called `output.xxx` where xxx is the file extension read from the header.

If you use a password, the password will be stretched and turned into a secure key via a hashing function. The key will be then used to encrypt data when encoding or decrypt it when decoding. The program needs to add a random nonce to the beginning of encrypted data to be able to decrypt it later. This does not compromise the hidden file. We're using AES symmetric encryption to protect the hidden file. There is also random noise added to the end of the data to hide the size of the hidden file. The length of this random data and the length of the hidden file are only known to those who know the password.

Be sure to use pngs with alpha channel, otherwise it won't work.
