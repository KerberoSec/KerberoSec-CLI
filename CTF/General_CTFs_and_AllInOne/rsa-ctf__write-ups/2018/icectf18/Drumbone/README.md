# Drumbone: Steganography

**Author:** Kaushik S Kalmady

```
I joined a couple of hacking channels on IRC and I started recieving these strange messages. 
Someone sent me this image.
Can you figure out if there's anything suspicous hidden in it?
```
*[Image: drumbone]*

This is a poster from the TV Show Mr. Robot. We tried to see if it was relevant, but obviously found nothing.

We tried all the basic tools -`strings` `binwalk` `exiftool`- to no avail. It seemed like a harmless PNG image.
We even went through the hexdump using `hexedit` and still found nothing useful.

I finally fired up [stegsolve](https://www.wechall.net/forum/show/thread/527/Stegsolve_1.3/page-1) as started analysing the panels that it shows us.
`$ java -jar Stegsolve.jar`
*[Image: drumbone-1]*

The Blue Panel 0 seemed interesting.
*[Image: drumbone-2]*

Seemed like a QR code so I wanted to invert it and confirm. You can use `Analyse > Stereogram Solver`
*[Image: drumbone-3]*

I just save the image and scan the QR code to get the flag.
*[Image: qr]*

## Flag
> IceCTF{Elliot_has_been_mapping_bits_all_day}
