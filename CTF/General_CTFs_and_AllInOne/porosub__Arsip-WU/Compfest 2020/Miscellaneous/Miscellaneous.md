# Miscellaneous

## Daftar isi : 
| Forensik  |
| ------------- |
| [Lost My Source 2](#1-lost-my-source-2-896-pts)|

## 1. Lost My Source 2 (896 pts)
### Soal :  

This time I make a simple program (and put the flag there) with python and build it as a standalone with PyInstaller, but my friend just accidentally erased the source code (again)!

Alternate download link:
https://drive.google.com/file/d/1_nqm8G7Xszzy1h24g7HnOYCCQXFDXuCp/view?usp=sharing

### Pembahasan :  
Terdapat file main yang merupakan file ELF yang dibuat dengan PyInstaller. Saya awalnya mencoba Pyinstxtractor untuk mengekstrak isi file hasil build Pyinstaller. Namun ternyata tidak bisa. Setelah mencari di [artikel](https://pyinstaller.readthedocs.io/en/stable/advanced-topics.html) ternyata terdapat [archive_viewer](https://github.com/pyinstaller/pyinstaller/blob/develop/archive_viewer.py) yang sudah disediakan pyinstaller.

```bash
$ python3 py-archive_viewer.py main
pos, length, uncompressed, iscompressed, type, name
[(0, 245, 312, 1, 'm', 'struct'),
 (245, 1108, 1818, 1, 'm', 'pyimod01_os_path'),
 (1353, 4344, 9340, 1, 'm', 'pyimod02_archive'),
 (5697, 7365, 18639, 1, 'm', 'pyimod03_importers'),
 (13062, 1849, 4157, 1, 's', 'pyiboot01_bootstrap'),
 (14911, 405, 570, 1, 's', 'main'),
 (15316, 8245, 22040, 1, 'b', '_bz2.cpython-36m-x86_64-linux-gnu.so'),
 (23561, 102465, 149808, 1, 'b', '_codecs_cn.cpython-36m-x86_64-linux-gnu.so'),
 (126026, 35789, 158032, 1, 'b', '_codecs_hk.cpython-36m-x86_64-linux-gnu.so'),
 (161815, 9816, 26928, 1, 'b','_codecs_iso2022.cpython-36m-x86_64-linux-gnu.so'),
 (171631, 97279, 272688, 1, 'b', '_codecs_jp.cpython-36m-x86_64-linux-gnu.so'),
 (268910, 78895, 137520, 1, 'b', '_codecs_kr.cpython-36m-x86_64-linux-gnu.so'),
 (347805, 63580, 112944, 1, 'b', '_codecs_tw.cpython-36m-x86_64-linux-gnu.so'),
 (411385, 10713, 29752, 1, 'b', '_hashlib.cpython-36m-x86_64-linux-gnu.so'),
 (422098, 13752, 33592, 1, 'b', '_lzma.cpython-36m-x86_64-linux-gnu.so'),
 (435850, 24136, 56600, 1, 'b', '_multibytecodec.cpython-36m-x86_64-linux-gnu.so'),
 (459986, 2042, 6280, 1, 'b', '_opcode.cpython-36m-x86_64-linux-gnu.so'),
 (462028, 45394, 120088, 1, 'b', '_ssl.cpython-36m-x86_64-linux-gnu.so'),
 (507422, 30120, 66728, 1, 'b', 'libbz2.so.1.0'),
 (537542, 1297187, 2917216, 1, 'b', 'libcrypto.so.1.1'),
 (1834729, 70921, 202880, 1, 'b', 'libexpat.so.1'),
 (1905650, 79560, 153984, 1, 'b', 'liblzma.so.5'),
 (1985210, 1823471, 4683728, 1, 'b', 'libpython3.6m.so.1.0'),
 (3808681, 126584, 294632, 1, 'b', 'libreadline.so.7'),
 (3935265, 230870, 577312, 1, 'b', 'libssl.so.1.1'),
 (4166135, 64264, 170784, 1, 'b', 'libtinfo.so.5'),
 (4230399, 60099, 116960, 1, 'b', 'libz.so.1'),
 (4290498, 11321, 31752, 1, 'b', 'readline.cpython-36m-x86_64-linux-gnu.so'),
 (4301819, 4690, 15368, 1, 'b', 'resource.cpython-36m-x86_64-linux-gnu.so'),
 (4306509, 8303, 24968, 1, 'b', 'termios.cpython-36m-x86_64-linux-gnu.so'),
 (4314812, 207043, 771132, 1, 'x', 'base_library.zip'),
 (4521855, 1140763, 1140763, 0, 'z', 'PYZ-00.pyz')]
 ? x
 extract name? main
 to filename? flag
 ? q
 ```
Dari struktur di atas ekstrak main (disimpan dengan nama file : flag) dan hasilnya :
```bash
$ strings flag
e	e	e
Nz'COMPFEST12{my_fri3nd_s4ys_s0rry_888144}
main.py
getFlag
range
print
list
append
join
strr
<module>
```
<details>
<summary>Tekan untuk melihat flag</summary>
COMPFEST12{my_fri3nd_s4ys_s0rry_888144}
</details>
