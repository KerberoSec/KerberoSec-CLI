```
DDDD  EEEEE BBBB  U   U  GGG   GGG  III N   N  GGG      III N   N TTTTT EEEEE RRRR  FFFFF   A    CCC  EEEEE 
D   D E     B   B U   U G     G      I  NN  N G          I  NN  N   T   E     R   R F      A A  C   C E     
D   D EEEE  BBBB  U   U G GG  G GG   I  N N N G GG       I  N N N   T   EEEE  RRRR  FFFF  AAAAA C     EEEE  
D   D E     B   B U   U G   G G   G  I  N  NN G   G      I  N  NN   T   E     R  R  F     A   A C   C E     
DDDD  EEEEE BBBB   UUU   GGG   GGG  III N   N  GGG      III N   N   T   EEEEE R   R F     A   A  CCC  EEEEE 
```
We accessed the embedded device's asynchronous serial debugging interface while it was
operational and captured some messages that were being transmitted over it. [^1]

Can you decode them?
-----------------------------------------------------------------------------------------
First, we verify that the downloaded ZIP file has the correct SHA-256 check sum with the
`sha256sum -c` command. Then, we extract the ZIP archive with the given password and are
given a ZIP archive `debugging_interface_signal.sal`, which in turn contains a JSON text
file `meta.json` and data `digital-0.bin`. After some research, we find out that this
binary data was exported using the Saleae software.

First, we attempt to read the data without having to download the proprietrary software,
but without any result. By looking at the metadata, we discover that we have version 1,
for which there exists an example [^2] for how to print the digital data with a Python
script. But this doesn't work, mainly due to the unkown, custom data type 100, probably
for the asynchronous serial debugging. Next, we also try to communicate with the API [^3]
of the Saleae Logic software but can't get to read the binary file this way. Further, we
discover the open source project Sigrok, which offers a CLI [^4] to analyze various data
types and even Saleae binary files [^5]. However, we are not sure how to integrate the
additional Saleae module [^7] as introduced in the input format [^6] article.

Finally, we download the Saleae Logic AppImage [^8] after failed attempts to read from
the binary file otherwise. Upon running the executable, we open the
`debugging_interface_signal.sal` capture and start analyzing the signals with the Async
Serial analyzer. Then, we can click on the data terminal and on the botthom, there is
the flag we've been waiting for.

[^1]: https://app.hackthebox.com/challenges/Debugging%2520Interface?tab=play_challenge
[^2]: https://support.saleae.com/getting-help/troubleshooting/technical-faq/binary-and-csv-export-formats-2025-update
[^3]: https://github.com/saleae/SaleaeSocketApi
[^4]: https://github.com/sigrokproject/sigrok-cli
[^5]: https://www.sigrok.org/wiki/Input_output_formats
[^6]: https://www.sigrok.org/wiki/File_format:Saleae
[^7]: https://sigrok.org/gitweb/?p=libsigrok.git;a=blob;f=src/input/saleae.c
[^8]: https://saleae.com/downloads
