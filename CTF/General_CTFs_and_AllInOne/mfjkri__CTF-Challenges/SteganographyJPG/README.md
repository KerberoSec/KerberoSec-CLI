# Challenge Guide | Difficulty: Hard

## Requirements:

- Reading of file using HEX Editor
- Some knowledge of file markers (JPG image marker + trailer)

This challenge is **`Part 2`** to a series of challenges:

1. MetadataForensic : flag@179369
2. **SteganographyJPG** : flag@singaporezoo
3. OSINTGitHistory : flag@notsohiddenanymore

---

## Steps:

1.  Use a `Hex editor` to view the binary data of `alamak.jpg`.

    I will be using a Hex Editor called [Bless](https://github.com/bwrsandman/Bless).

    ```bash
    $ bless alamak.jpg
    ```

    *[Image: Bless Editor]*

2.  Find for JPG image hex markers.

    JPEG files (compressed images) start with an `image marker` which always contains the marker code hex values:

         FF D8 FF

    In our case, we have 2 matches for the marker ode `FF D8 FF`.
    Once at the start of the file and near the middle of the file This signifies that there might be actually two jpg instead of one.

    *[Image: First JPG Marker]*
    *[Image: Second JPG Marker]*

3.  Confirm this by finding JPG end signature.

    JPEG files have a `trailer` to signify the end of the file since, it does not have the length of file embedded.

        FF D9

    In our case, we indeed have 2 matches for this trailer, one found right before the second `FF D8 FF`.

    *[Image: First JPG Trailer]*
    *[Image: Second JPG Trailer]*

4.  Remove from first image marker to first trailer.

    *[Image: Remove First JPG]*

5.  Save the new file.

    The flag is found in the new image.

        flag@singaporezoo

    *[Image: Flag]*
