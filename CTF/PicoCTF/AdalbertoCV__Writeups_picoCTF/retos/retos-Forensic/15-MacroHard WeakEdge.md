#   MacroHard WeakEdge

# Descripción
I've hidden a flag in this file. Can you find it? [Forensics is fun.pptm](https://mercury.picoctf.net/static/d3dd8cd51524d9fafcccd1b7d55f85e7/Forensics%20is%20fun.pptm)
# Pistas
(None)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ ls
'Forensics is fun.pptm'   README.txt
adalh4ck1ng-picoctf@webshell:~$ binwalk 'Forensics is fun.pptm' 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Zip archive data, at least v2.0 to extract, compressed size: 674, uncompressed size: 10660, name: [Content_Types].xml
1243          0x4DB           Zip archive data, at least v2.0 to extract, compressed size: 259, uncompressed size: 738, name: _rels/.rels
2063          0x80F           Zip archive data, at least v2.0 to extract, compressed size: 951, uncompressed size: 5197, name: ppt/presentation.xml
3064          0xBF8           Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide46.xml.rels
3316          0xCF4           Zip archive data, at least v2.0 to extract, compressed size: 688, uncompressed size: 1740, name: ppt/slides/slide1.xml
4055          0xFD7           Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1681, name: ppt/slides/slide2.xml
4763          0x129B          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1681, name: ppt/slides/slide3.xml
5473          0x1561          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1682, name: ppt/slides/slide4.xml
6181          0x1825          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide5.xml
6890          0x1AEA          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1681, name: ppt/slides/slide6.xml
7597          0x1DAD          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide7.xml
8306          0x2072          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide8.xml
9015          0x2337          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide9.xml
9724          0x25FC          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide10.xml
10435         0x28C3          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide11.xml
11145         0x2B89          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1681, name: ppt/slides/slide12.xml
11854         0x2E4E          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1682, name: ppt/slides/slide13.xml
12562         0x3112          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide14.xml
13273         0x33D9          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide15.xml
13983         0x369F          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1682, name: ppt/slides/slide16.xml
14691         0x3963          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1681, name: ppt/slides/slide17.xml
15399         0x3C27          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1682, name: ppt/slides/slide18.xml
16108         0x3EEC          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide19.xml
16819         0x41B3          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1681, name: ppt/slides/slide20.xml
17529         0x4479          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide21.xml
18239         0x473F          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1681, name: ppt/slides/slide22.xml
18947         0x4A03          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide23.xml
19657         0x4CC9          Zip archive data, at least v2.0 to extract, compressed size: 660, uncompressed size: 1682, name: ppt/slides/slide24.xml
20369         0x4F91          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide25.xml
21079         0x5257          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide26.xml
21789         0x551D          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide27.xml
22500         0x57E4          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1681, name: ppt/slides/slide28.xml
23208         0x5AA8          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1681, name: ppt/slides/slide29.xml
23919         0x5D6F          Zip archive data, at least v2.0 to extract, compressed size: 660, uncompressed size: 1682, name: ppt/slides/slide30.xml
24631         0x6037          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1681, name: ppt/slides/slide31.xml
25341         0x62FD          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide32.xml
26051         0x65C3          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1681, name: ppt/slides/slide33.xml
26761         0x6889          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide34.xml
27471         0x6B4F          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1681, name: ppt/slides/slide35.xml
28182         0x6E16          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1682, name: ppt/slides/slide36.xml
28891         0x70DB          Zip archive data, at least v2.0 to extract, compressed size: 767, uncompressed size: 1916, name: ppt/slides/slide37.xml
29710         0x740E          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1682, name: ppt/slides/slide38.xml
30419         0x76D3          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide39.xml
31129         0x7999          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1681, name: ppt/slides/slide40.xml
31838         0x7C5E          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1681, name: ppt/slides/slide41.xml
32549         0x7F25          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide42.xml
33259         0x81EB          Zip archive data, at least v2.0 to extract, compressed size: 660, uncompressed size: 1682, name: ppt/slides/slide43.xml
33971         0x84B3          Zip archive data, at least v2.0 to extract, compressed size: 660, uncompressed size: 1682, name: ppt/slides/slide44.xml
34683         0x877B          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide45.xml
35394         0x8A42          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1681, name: ppt/slides/slide46.xml
36105         0x8D09          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1682, name: ppt/slides/slide47.xml
36814         0x8FCE          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1681, name: ppt/slides/slide48.xml
37524         0x9294          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1681, name: ppt/slides/slide49.xml
38234         0x955A          Zip archive data, at least v2.0 to extract, compressed size: 655, uncompressed size: 1682, name: ppt/slides/slide50.xml
38941         0x981D          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide51.xml
39652         0x9AE4          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1681, name: ppt/slides/slide52.xml
40363         0x9DAB          Zip archive data, at least v2.0 to extract, compressed size: 656, uncompressed size: 1682, name: ppt/slides/slide53.xml
41071         0xA06F          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide54.xml
41782         0xA336          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide55.xml
42493         0xA5FD          Zip archive data, at least v2.0 to extract, compressed size: 659, uncompressed size: 1682, name: ppt/slides/slide56.xml
43204         0xA8C4          Zip archive data, at least v2.0 to extract, compressed size: 658, uncompressed size: 1682, name: ppt/slides/slide57.xml
43914         0xAB8A          Zip archive data, at least v2.0 to extract, compressed size: 657, uncompressed size: 1681, name: ppt/slides/slide58.xml
44623         0xAE4F          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide47.xml.rels
44875         0xAF4B          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide48.xml.rels
45127         0xB047          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide49.xml.rels
45379         0xB143          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide50.xml.rels
45631         0xB23F          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide32.xml.rels
45883         0xB33B          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide52.xml.rels
46135         0xB437          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide53.xml.rels
46387         0xB533          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide54.xml.rels
46639         0xB62F          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide55.xml.rels
46891         0xB72B          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide56.xml.rels
47143         0xB827          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide57.xml.rels
47395         0xB923          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide58.xml.rels
47647         0xBA1F          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide51.xml.rels
47899         0xBB1B          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide13.xml.rels
48151         0xBC17          Zip archive data, at least v2.0 to extract, compressed size: 646, uncompressed size: 8783, name: ppt/_rels/presentation.xml.rels
49122         0xBFE2          Zip archive data, at least v2.0 to extract, compressed size: 192, uncompressed size: 311, name: ppt/slides/_rels/slide1.xml.rels
49376         0xC0E0          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide2.xml.rels
49627         0xC1DB          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide3.xml.rels
49878         0xC2D6          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide4.xml.rels
50129         0xC3D1          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide5.xml.rels
50380         0xC4CC          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide6.xml.rels
50631         0xC5C7          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide7.xml.rels
50882         0xC6C2          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide8.xml.rels
51133         0xC7BD          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide9.xml.rels
51384         0xC8B8          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide10.xml.rels
51636         0xC9B4          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide11.xml.rels
51888         0xCAB0          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide12.xml.rels
52140         0xCBAC          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide14.xml.rels
52392         0xCCA8          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide15.xml.rels
52644         0xCDA4          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide16.xml.rels
52896         0xCEA0          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide17.xml.rels
53148         0xCF9C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide18.xml.rels
53400         0xD098          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide19.xml.rels
53652         0xD194          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide20.xml.rels
53904         0xD290          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide21.xml.rels
54156         0xD38C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide22.xml.rels
54408         0xD488          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide23.xml.rels
54660         0xD584          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide24.xml.rels
54912         0xD680          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide25.xml.rels
55164         0xD77C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide26.xml.rels
55416         0xD878          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide27.xml.rels
55668         0xD974          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide28.xml.rels
55920         0xDA70          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide29.xml.rels
56172         0xDB6C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide30.xml.rels
56424         0xDC68          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide31.xml.rels
56676         0xDD64          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide33.xml.rels
56928         0xDE60          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide34.xml.rels
57180         0xDF5C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide35.xml.rels
57432         0xE058          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide36.xml.rels
57684         0xE154          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide37.xml.rels
57936         0xE250          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide38.xml.rels
58188         0xE34C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide39.xml.rels
58440         0xE448          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide40.xml.rels
58692         0xE544          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide41.xml.rels
58944         0xE640          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide42.xml.rels
59196         0xE73C          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide43.xml.rels
59448         0xE838          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide44.xml.rels
59700         0xE934          Zip archive data, at least v2.0 to extract, compressed size: 189, uncompressed size: 311, name: ppt/slides/_rels/slide45.xml.rels
59952         0xEA30          Zip archive data, at least v2.0 to extract, compressed size: 2063, uncompressed size: 13875, name: ppt/slideMasters/slideMaster1.xml
62078         0xF27E          Zip archive data, at least v2.0 to extract, compressed size: 1281, uncompressed size: 4678, name: ppt/slideLayouts/slideLayout1.xml
63422         0xF7BE          Zip archive data, at least v2.0 to extract, compressed size: 1104, uncompressed size: 3921, name: ppt/slideLayouts/slideLayout2.xml
64589         0xFC4D          Zip archive data, at least v2.0 to extract, compressed size: 1338, uncompressed size: 5442, name: ppt/slideLayouts/slideLayout3.xml
65990         0x101C6         Zip archive data, at least v2.0 to extract, compressed size: 1197, uncompressed size: 4975, name: ppt/slideLayouts/slideLayout4.xml
67250         0x106B2         Zip archive data, at least v2.0 to extract, compressed size: 1551, uncompressed size: 7937, name: ppt/slideLayouts/slideLayout5.xml
68864         0x10D00         Zip archive data, at least v2.0 to extract, compressed size: 983, uncompressed size: 3063, name: ppt/slideLayouts/slideLayout6.xml
69910         0x11116         Zip archive data, at least v2.0 to extract, compressed size: 902, uncompressed size: 2550, name: ppt/slideLayouts/slideLayout7.xml
70875         0x114DB         Zip archive data, at least v2.0 to extract, compressed size: 1455, uncompressed size: 5952, name: ppt/slideLayouts/slideLayout8.xml
72393         0x11AC9         Zip archive data, at least v2.0 to extract, compressed size: 1408, uncompressed size: 5899, name: ppt/slideLayouts/slideLayout9.xml
73864         0x12088         Zip archive data, at least v2.0 to extract, compressed size: 1133, uncompressed size: 3975, name: ppt/slideLayouts/slideLayout10.xml
75061         0x12535         Zip archive data, at least v2.0 to extract, compressed size: 1187, uncompressed size: 4200, name: ppt/slideLayouts/slideLayout11.xml
76312         0x12A18         Zip archive data, at least v2.0 to extract, compressed size: 277, uncompressed size: 1991, name: ppt/slideMasters/_rels/slideMaster1.xml.rels
76663         0x12B77         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout1.xml.rels
76925         0x12C7D         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout2.xml.rels
77187         0x12D83         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout3.xml.rels
77449         0x12E89         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout4.xml.rels
77711         0x12F8F         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout5.xml.rels
77973         0x13095         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout6.xml.rels
78235         0x1319B         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout7.xml.rels
78497         0x132A1         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout8.xml.rels
78759         0x133A7         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout9.xml.rels
79021         0x134AD         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout10.xml.rels
79284         0x135B4         Zip archive data, at least v2.0 to extract, compressed size: 188, uncompressed size: 311, name: ppt/slideLayouts/_rels/slideLayout11.xml.rels
79547         0x136BB         Zip archive data, at least v2.0 to extract, compressed size: 1732, uncompressed size: 8399, name: ppt/theme/theme1.xml
81329         0x13DB1         Zip archive data, at least v1.0 to extract, compressed size: 2278, uncompressed size: 2278, name: docProps/thumbnail.jpeg
83660         0x146CC         Zip archive data, at least v2.0 to extract, compressed size: 2222, uncompressed size: 7168, name: ppt/vbaProject.bin
85930         0x14FAA         Zip archive data, at least v2.0 to extract, compressed size: 397, uncompressed size: 818, name: ppt/presProps.xml
86374         0x15166         Zip archive data, at least v2.0 to extract, compressed size: 387, uncompressed size: 811, name: ppt/viewProps.xml
86808         0x15318         Zip archive data, at least v2.0 to extract, compressed size: 172, uncompressed size: 182, name: ppt/tableStyles.xml
87029         0x153F5         Zip archive data, at least v2.0 to extract, compressed size: 342, uncompressed size: 666, name: docProps/core.xml
87682         0x15682         Zip archive data, at least v2.0 to extract, compressed size: 556, uncompressed size: 3784, name: docProps/app.xml
88548         0x159E4         Zip archive data, at least v2.0 to extract, compressed size: 81, uncompressed size: 99, name: ppt/slideMasters/hidden
100071        0x186E7         End of Zip archive, footer length: 22

adalh4ck1ng-picoctf@webshell:~$ 7z x Forensics\ is\ fun.pptm 

7-Zip [64] 16.02 : Copyright (c) 1999-2016 Igor Pavlov : 2016-05-21
p7zip Version 16.02 (locale=C,Utf16=off,HugeFiles=on,64 bits,4 CPUs Intel(R) Xeon(R) Platinum 8259CL CPU @ 2.50GHz (50657),ASM,AES-NI)

Scanning the drive for archives:
1 file, 100093 bytes (98 KiB)

Extracting archive: Forensics is fun.pptm
--
Path = Forensics is fun.pptm
Type = zip
Physical Size = 100093

Everything is Ok

Files: 153
Size:       237329
Compressed: 100093
adalh4ck1ng-picoctf@webshell:~$ ls
'Forensics is fun.pptm'   README.txt  '[Content_Types].xml'   _rels   docProps   ppt
adalh4ck1ng-picoctf@webshell:~$ cd ppt/
adalh4ck1ng-picoctf@webshell:~/ppt$ ls
_rels  presProps.xml  presentation.xml  slideLayouts  slideMasters  slides  tableStyles.xml  theme  vbaProject.bin  viewProps.xml
adalh4ck1ng-picoctf@webshell:~/ppt$ cd slideMasters/
adalh4ck1ng-picoctf@webshell:~/ppt/slideMasters$ ls
_rels  hidden  slideMaster1.xml
adalh4ck1ng-picoctf@webshell:~/ppt/slideMasters$ cat hidden
Z m x h Z z o g c G l j b 0 N U R n t E M W R f d V 9 r b j B 3 X 3 B w d H N f c l 9 6 M X A 1 f Q

usando cyberchef para convertir de base 64 obtenemos la siguiente bandera:

flag: picoCTF{D1d_u_kn0w_ppts_r_z1p5}
```

# Bandera
"picoCTF{D1d_u_kn0w_ppts_r_z1p5}"
