# QR Code
## About

### General Information

__Challenge Description__: Do you remember something known as QR Code? Simple.

__Challege Category__: MISC

__Challenge Difficulty__: Easy

__Skills__: Basic Cipher Knowledge
Download the file [here.](https://mega.nz/file/eGYlFa5Z#8mbiqg3kosk93qJCP-DBxIilHH2rf7iIVY-kpwyrx-0)

## Solution

It's a QR code given to us... Simple, we just got to scan it, to reveal the flag. Goto this [site](https://online-barcode-reader.inliteresearch.com/), select the option QR code, and upload the QR Code to that site.

![Image1](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/QR%20Code/1.png)  
![Image2](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/QR%20Code/2.png)

By analyzing it, I can tell it is a base64 cipher. Just decode it [here](https://www.base64decode.org/). Now it gave us another cipher. Analyzing... Aah, ROT13 cipher. Let's decrypt it [here](https://cryptii.com/pipes/caesar-cipher).

![Image3](https://github.com/iParamjotSingh/WriteUps/blob/master/CTFlearn/QR%20Code/3.png)

__Flag__: n0_body_f0rget_qr_code
