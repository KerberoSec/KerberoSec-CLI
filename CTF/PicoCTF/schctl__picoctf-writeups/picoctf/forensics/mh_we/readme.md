# MacroHard WeakEdge

Downloading the file we see that it is a `.pptm` file. PPT files are essentially big archive
files so I extracted its contents with `7zip`.

```sh
$ 7z x '../Forensics is fun.pptm'
```

Which dumps all its contents into our current directory. We can then `tree` the directory to
see if we can find anything.

```sh
$ # output shortened for brevity
$ tree -a -L 6
.
├── [Content_Types].xml
├── _rels
│   └── ...
├── docProps
│   └── ...
└── ppt
    ├── ...
    ├── slideMasters
    │   ├── ...
    │   └── hidden
    └── ...

11 directories, 153 files
```

Immediately we notice an interesting `hidden` file. `cat`ing its contents, we get a long string:

    Z m x h Z z o g c G l j b 0 N U R n t E M W R f d V 9 r b j B 3 X 3 B w d H N f c l 9 6 M X A 1 f Q

This appears to be base64 encoded. We can remove the spaces and decode it to get our flag:

    flag: picoCTF{D1d_u_kn0w_ppts_r_z1p5}
