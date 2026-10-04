# QRSteganography

Encodes arbitrary data into one or more QR code PNGs and decodes them back as a form of steganography for data obfuscation.

<br>

## Quick Links

[Maldev Academy Home](https://maldevacademy.com?ref=gh)
  
[Maldev Academy Syllabus](https://maldevacademy.com/syllabus?ref=gh)

[Maldev Academy Pricing](https://maldevacademy.com/pricing?ref=gh)

<br>

## Usage

Simply compile and use [QRGenerate.exe](https://github.com/Maldev-Academy/QRSteganography/tree/main/QRGenerate) command line to encode and decode a given file using the following commands: 

```
.\QRGenerate.exe
Usage:
  QRGenerate.exe encode <input_file> <output_dir>
  QRGenerate.exe decode <input_dir>
```

> Note that the original filename is embedded in each QR chunk header and restored automatically during decoding.

<br>

## How Does it Work?

### Encoding

1. The input file is read into memory and split into chunks of up to [CHUNK_PAYLOAD_MAX](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.h#L88) bytes (derived from the Version 40 QR capacity at the [configured ECC level](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.h#L31)).
2. Each chunk is [wrapped in a binary packet](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrGenerate.c#L308) containing a 4-byte [magic signature](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.h#L81), the total chunk count, the chunk index, the original file size, and the embedded filename.
3. Each packet is encoded into a QR code using byte mode, with automatic version selection (1-40) and mask optimization for minimal penalty score.
4. The QR code is rendered to an [8bpp grayscale PNG via WIC](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrGenerate.c#L10), with each module scaled to 8x8 pixels and a 4-module quiet zone border.
5. The PNGs are written sequentially as `Qr0000.png`, `Qr0001.png`, etc.

### Decoding

1. The input directory is scanned for `Qr*.png` files. The first file is decoded to extract the total chunk count and original file size from the packet header.
2. Each PNG is loaded as [grayscale](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrGenerate.c#L215C14-L215C30), binarised using [Otsu's adaptive threshold](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1565), and scanned row-by-row for [`1:1:3:1:1` finder patterns](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1791).
3. Detected finder patterns are validated as [capstones](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1759), [grouped into grid candidates](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L2445) by [perspective projection](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1437), and refined via [iterative perspective jiggling](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1955).
4. The grid is sampled through the perspective transform, data bits are read in [zigzag order](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1127), unmasked, de-interleaved into [Reed-Solomon blocks](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1150), and error-corrected using [Berlekamp-Massey](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L825) with [Forney's algorithm](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L914).
5. The corrected payload is [parsed by mode](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrInternals.c#L1377) (numeric, alphanumeric, byte, kanji, ECI) and the chunk packet is extracted.
6. All chunks are [reassembled in order](https://github.com/Maldev-Academy/QRSteganography/blob/main/QRGenerate/QrGenerate.c#L545) by index into the original file and written to disk. The output filename is recovered from the embedded packet header.

### Chunk Packet Layout

```
[magic:4][totalChunks:4][chunkIndex:4][origSize:4][nameLen:2][name:nameLen][payload:...]
```

<br>

## Credits

The QR encode and decode implementations are based on the following projects:

- [QR-Code-generator](https://github.com/nayuki/QR-Code-generator/tree/master/c), used for QR code generation and encoding logic.
- [quirc](https://github.com/dlbeer/quirc), used for QR code detection and decoding from images.

<br>

# Demo

<img width="1540" height="848" alt="image" src="https://github.com/user-attachments/assets/f58bfaf6-ece4-44de-b8d5-52161042d224" />
