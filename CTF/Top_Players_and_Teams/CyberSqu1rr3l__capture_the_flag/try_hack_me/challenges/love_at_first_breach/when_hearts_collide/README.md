```
 _     _             _    ,                      __     _  _        
' )   //            ' )  /            _/_       /  )   // //     /  
 / / //_  _  ____    /--/ _  __.  __  /  _     /   __ // // o __/ _ 
(_(_// /_</_/ / <_  /  (_</_(_/|_/ (_<__/_)_  (__/(_)</_</_<_(_/_</_
```
Matchmaker is a playful, hash-powered experience that pairs you with your ideal dog by
comparing MD5 fingerprints. Upload a photo, let the hash chemistry do its thing, and
watch the site reveal whether your vibe already matches one of our curated pups. The
algorithm is completely transparent, making every match feel like a wink from fate
instead of random swipes. [^1]

What is the flag obtained by finding your one true dog?
-----------------------------------------------------------------------------------------
Upon opening the matchmaker website, we start by browsing a random match and discover the
picture's file name to be `00795a8b-fb58-47c0-91be-af068ddc71b4.jpg` and upon downloading
it, the `md5sum` results in `a15ec1ecaef0eac2d8a9be79d1d51296`. It is our goal now, to
demonstrate that the MD5 encryption can be broken by generating two different files that
produce the same MD5 hash in a chosen prefix-collision attack. Note, that it is
practically not doable to set the MD5 value of a file to a specific one or predict the
outcome in any way. However, it is possible to create two binary files with the same MD5
hash or to slightly change files and get a new hash. So, we research for collision
attacks on the MD5 hash and discover the tool `fastcoll` [^3]. The proposed algorithm
improves the discovery of two-block collisions for the hash function of MD5 [^2]. We
learn that MD5 is a 128-bit cryptographic hash function that processes data in 512-bit
blocks. Due to structural weaknesses in its compression function, practical collision
attacks exist, in which two distinct files produce the same MD5 hash. With `fastcoll`
we now want to produce two files that start with the same chosen content but diverge
later.

First, we clone the repository [^3] and familiarize ourselves with the provided docker
instructions. Then, we create an *input* file with a sample text in it and run the
following Docker command in the cloned repository:

```bash
$ docker run --rm -it -v $PWD:/work -w /work -u $(id -u):$(id -g) \
  brimstone/fastcoll --prefixfile input -o msg1.bin msg2.bin
```
This command starts an interactive terminal, mounts the current directory into the
container, sets the working directory and removes the container after the collision pair
was generated. This way, we have two binary files `msg1.bin` and `msg2.bin` which should
have the same `md5sum` now. After verifying that the files are different, yet have the
same MD5 hash, we upload one after another to the Matchmaker website and are rewarded
with the flag. To our surprise, the website did not check the file properties for an
image but allowed binary files.

[^1]: https://tryhackme.com/room/lafb2026e1
[^2]: https://marc-stevens.nl/research/hashclash/fastcoll.pdf
[^3]: https://github.com/brimstone/fastcoll
