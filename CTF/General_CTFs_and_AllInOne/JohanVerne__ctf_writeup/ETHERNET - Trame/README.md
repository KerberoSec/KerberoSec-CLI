# ETHERNET: Trame

## Challenge

Find the (supposed to be) confidential data in this ethernet frame.

## Solution

On convertit les données hex en ascii avec https://www.rapidtables.com/convert/number/hex-to-ascii.html, puis on convertit la valeur du chanp "Authorization", qui est en base64, en text avec https://v2.cryptii.com/base64/text

## Flag

confi:dential
