# Artemis

Author: [roerohan](https://github.com/roerohan)

This is another `file` challenge.

# Requirements

- Linux `file` command.
- HTML

# Source

- [Artemis](./Artemis)

# Exploitation

When you run `file` on the `Artemis` file, you see it's a `rar` file.

```
$ file Artemis 
Artemis: RAR archive data, v5
```

Now, when you extract this compressed file, you get a folder `artemis_fichiers` and a file [`artemis.htm`](./artemis.htm). When you analyze that file, you may find:

```html
valign="center">*[Image: c]**[Image: b]**[Image: r]**[Image: h]**[Image: space]**[Image: t]**[Image: h]**[Image: space]**[Image: a]**[Image: r]**[Image: t]**[Image: m]**[Image: i]**[Image: s]*<img src="artemis_fichiers/SPACE.GIF" 
```

Notice the `alt`s of all the image tag. They spell out the flag. So you can write them down sequencially:
```
c b r h space t h space a r t m i s space f o w l space s r i s e e e e e space b y space o i n space c o l f r space e
```

Now, place the `e`s in the correct places, replace the `space`s with `_`s (underscores), and add `{...}`. The flag is:

```
cbrh{the_artemis_fowl_series_by_eoin_colfer}
```
