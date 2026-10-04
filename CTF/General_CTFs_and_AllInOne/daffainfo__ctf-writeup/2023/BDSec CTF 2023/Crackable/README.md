# Crackable?

> Is the admin password crackable?

Download the pcap file here

# How to Solve

We need look the pcap file and see the http request with filter string `Login Successful` like this

*[Image: POC 1]*

Seem there only this root user as admin then the password is `41528ac7f116e9661cf57be7cd79e1a2`

After that we just hash the following password

I use this [website](https://md5hashing.net/hash/md5)

*[Image: POC 2]*

Because the format is `BDSEC{flag}`

Then flag is

```
BDSEC{y0u_cR4cK3d_m3}
```