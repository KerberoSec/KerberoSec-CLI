# Verify

## Description

People keep trying to trick my players with imitation flags. I want to make sure they get the real thing! I'm going to provide the SHA-256 hash and a decrypt script to help you know that my flags are legitimate.
You can download the challenge files here:
[challenge.zip](https://artifacts.picoctf.net/c_rhea/21/challenge.zip)

## Solution

after extracting the file, go to the files directory in your terminal and run this command:

Mac:

```shell
shasum -a 256 * | grep 3ad37ed6c5ab81d31e4c94ae611e0adf2e9e3e6bee55804ebc7f386283e366a4
```

Linux:

```shell
sha256sum * | grep 3ad37ed6c5ab81d31e4c94ae611e0adf2e9e3e6bee55804ebc7f386283e366a4
```

basically, you are calculating the hash of all the files and returning the one that matches your valid hash using grep.

To decrypt the file once you've verified the hash, run ```./decrypt.sh files/<file>```.
