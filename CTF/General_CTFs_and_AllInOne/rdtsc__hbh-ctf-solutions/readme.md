# Hellbound Hackers CTF Solutions

This repository houses my personal solutions to
[HBH's programming challenges][challenges].

It is strongly encouraged that you do not view my solutions unless you've
already solved the relevant problems yourself.

## Background

Each challenge consists of some (typically non-static) dataset that must be
processed according to the problem statement and submitted back to the specified
URI via a `GET` or `POST` request. Assuming a correct and timely submission,
points for the specified challenge are automatically credited to your account.

Most challenges have a dataset/solution TTL of a few seconds, so performance
isn't that important.

## Prerequisites

### Session Cookies

Authentication is cookie-based. The current workflow of getting and storing
session cookies is as follows:

- Manually log in to the site,
- Open devtools and grab the `PHPSESSID` and `fusion_user` cookies,
- Save the cookie pair in `/session.json`.

Note that the `fusion_user` cookie appears to be static, so it looks like only
the `PHPSESSID` cookie will need to be updated from time to time.

Given the relatively low number of published programming challenges at the time
of this writing, automation of the above steps does not seem warranted.

### Local Environment

- Linux
- Node.js >= v10.15.3

## Development Notes

The `/session.json` file changes relatively often. In order to not pollute the
commit log, set the `assume-unchanged` bit on it after cloning:

```text
$ git update-index --assume-unchanged session.json
```

## License and Copyright

All original code is released under the [MIT license][mit], unless otherwise
specified.

All referenced product names, trademarks, logos, and images are property of
their respective owners.

[challenges]: https://www.hellboundhackers.org/challenges/timed/
              "Timed Challenges: Hellbound Hackers"

[mit]: http://opensource.org/licenses/MIT/
       "The MIT License (MIT)"
