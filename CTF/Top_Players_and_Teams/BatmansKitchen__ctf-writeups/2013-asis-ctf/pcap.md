# PCap

## Given

We're given a pcap file.

The pcap file.

## Observations

There were two ip addresses communicating with each other:

* 172.16.133.133
* 172.16.133.149

## TCP Conversations

There was some substantial cover traffic, but in the end, we identified
just three categories of communication that were relevant:

* TCP Stream 0: Used as a just a chat apparently between the two users
  on either end.

        172.16.133.149: hello
        172.16.133.133: I need secret key
        172.16.133.149: ok
        172.16.133.149: secret key will be sent on 6 parts
        172.16.133.149: secret key : part 1 is M)m5s6S
        172.16.133.149: did you received part 1 of secret key?
        172.16.133.133: yes please send part 2
        172.16.133.149: part 2 of secret key is ^[>@#
        172.16.133.133: I recieved part 2
        172.16.133.133: ok. please send me the other parts too
        172.16.133.149: part 3 of secret key is Q3+1
        172.16.133.149: did you received part 3?
        172.16.133.133: yes
        172.16.133.149: are you ready to receive part 4?
        172.16.133.133: yes, please send
        172.16.133.149: part 4 is 0PD.
        172.16.133.133: ok. i received part 4
        172.16.133.133: Please send me part 5
        172.16.133.149: ok
        172.16.133.149: part 5 of secret key is KE#cy
        172.16.133.133: I received part 5
        172.16.133.149: part 6 of secret key is PsvqH
        172.16.133.133: ok. I received all parts of secret key.
        172.16.133.133: Thanx

* HTTP file transfers hitting various ports, but all HTTP, and all were
  172.16.133.133 requesting files from 172.16.133.149. These all
  requested files of filenames that were md5 hashes. For example:

        GET /files/d33cf9e6230f3b8e5a0c91a0514ab476

Additionally, The ASIS organizers realized that there was a bug in
problem in that they forgot to provide two files. These were
`053dc897d3e154dd5ed27c46b738850d` and `21eae902cf5b82c7b207e963a130856d`.

* An HTTP download of an Apache index page, where the contents of the
  index page all corresponded to files downloaded in the previously
  mentioned HTTP file transfers. Interestingly, those file transfers
  used ports and web servers that weren't apache.. this seems to just be
  something meant to confuse analysts. though. I've reproduced the table
  here in an ascii format.

        Filename                            Date Last Modified      Filesize
        d33cf9e6230f3b8e5a0c91a0514ab476    24-May-2013 09:21:16    61440
        e564f66f2cf3e974887ea85028a317c6    24-May-2013 09:21:22    61440
        89799fdf064c77dad7923548140c18c5    24-May-2013 09:21:23    61440
        f6fb802feded5924fff1749b11e44c9b    24-May-2013 09:21:26    61440
        c68cc0718b8b85e62c8a671f7c81e80a    24-May-2013 09:21:33    58009
        326f79adc7ee143dcbb4cb8891a92259    24-May-2013 09:21:20    61440
        053dc897d3e154dd5ed27c46b738850d    24-May-2013 09:21:31    61440
        2aa242d4dbcb9b6378229c514af79b05    24-May-2013 09:21:24    61440
        21eae902cf5b82c7b207e963a130856d    24-May-2013 09:21:32    61440
        7356949650ccadfe1fb3a80b0db683d1    24-May-2013 09:21:26    61440
        5b6540cd89bbd12bf968e110b965a840    24-May-2013 09:21:19    61440
        40f4d5abfcdb369eeb0ac072796b7f30    24-May-2013 09:21:30    61440
        6afd1bbadfabc3da6f3b7265df75744f    24-May-2013 09:21:27    61440
        57f18f111f47eb9f7b5cdf5bd45144b0    24-May-2013 09:21:17    61440
        35639a4410f245791ce5d2945702c4dc    24-May-2013 09:21:29    61440
        1e13be50f05092e2a4e79b321c8450d4    24-May-2013 09:21:18    61440
        fe7fe85cb5a023310f251acc2993d62e    24-May-2013 09:21:25    61440
        4b87fbafcd05a39da90d69943393f79d    24-May-2013 09:21:21    61440
        189facdce68effbf99ab7263c8b87304    24-May-2013 09:21:28    61440
        255029ecf7e1a35b368ed123e2955099    24-May-2013 09:21:20    61440

## Some analysis

We noticed:

* One file, `d33cf9e6230f3b8e5a0c91a0514ab476`, had the magic number of
  a 7zip archive. It did not correctly decompress.
* One file, `c68cc0718b8b85e62c8a671f7c81e80a`, has a smaller filesize
  than the rest of the files.

We reasoned that all of these files could be blocks of a larger archive,
and that the smaller file is the trailing block at the end. Just on
speculation, we sorted the files by date last modified.

    Date Last Modified      Filename                            Filesize
    09:21:16 24-May-2013    d33cf9e6230f3b8e5a0c91a0514ab476    61440
    09:21:17 24-May-2013    57f18f111f47eb9f7b5cdf5bd45144b0    61440
    09:21:18 24-May-2013    1e13be50f05092e2a4e79b321c8450d4    61440
    09:21:19 24-May-2013    5b6540cd89bbd12bf968e110b965a840    61440
    09:21:20 24-May-2013    255029ecf7e1a35b368ed123e2955099    61440
    09:21:20 24-May-2013    326f79adc7ee143dcbb4cb8891a92259    61440
    09:21:21 24-May-2013    4b87fbafcd05a39da90d69943393f79d    61440
    09:21:22 24-May-2013    e564f66f2cf3e974887ea85028a317c6    61440
    09:21:23 24-May-2013    89799fdf064c77dad7923548140c18c5    61440
    09:21:24 24-May-2013    2aa242d4dbcb9b6378229c514af79b05    61440
    09:21:25 24-May-2013    fe7fe85cb5a023310f251acc2993d62e    61440
    09:21:26 24-May-2013    7356949650ccadfe1fb3a80b0db683d1    61440
    09:21:26 24-May-2013    f6fb802feded5924fff1749b11e44c9b    61440
    09:21:27 24-May-2013    6afd1bbadfabc3da6f3b7265df75744f    61440
    09:21:28 24-May-2013    189facdce68effbf99ab7263c8b87304    61440
    09:21:29 24-May-2013    35639a4410f245791ce5d2945702c4dc    61440
    09:21:30 24-May-2013    40f4d5abfcdb369eeb0ac072796b7f30    61440
    09:21:31 24-May-2013    053dc897d3e154dd5ed27c46b738850d    61440
    09:21:32 24-May-2013    21eae902cf5b82c7b207e963a130856d    61440
    09:21:33 24-May-2013    c68cc0718b8b85e62c8a671f7c81e80a    58009

And it totally screamed to us, since the first file listed is the one
that was marked as a 7zip archive, and the last file here is the one
with the smaller filesize.

We extracted the files from the HTTP transfers and mashed them together
and tried to decompress them. We were prompted for a password, which we
then correlated to that other tcp stream that was the conversation. From
that, we ripped the key: `M)m5s6S^[>@#Q3+10PD.KE#cyPsvqH`. The archive
successfully decompressed, and there was a TIFF image with the flag.

*[Image: Pcap Flag Image]*

We saw this and were worried that there was going to be stego in this
image at this point, but thankfully we were wrong :).

    ASIS_19f8c9dd916d8d73ba184227071debd4
