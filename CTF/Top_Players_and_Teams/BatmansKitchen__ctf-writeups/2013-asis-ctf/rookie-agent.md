# Rookie Agent

## The Given

We have intercepted this encrypted message. Since the agent who has sent it, is not a pro, we believe decrypting it would be easy. Good luck!

    6di16 ovhtm nzsls xqcjo 8fkdm tyrbn
    g4bg9 pwu9g lefmr k4bg9 ahmfm tyr4b
    g9htm 7ejcn zsbng 492cj olsxq 9glef
    mrk4b g9ahm fmtyr lsxq7 ejccj o9gle
    9gle8 fkdls xq8fk dhtmn zs7ej c8fkd
    szxbn g4bg9 pwu7e jccjo 9gle9 gle8f
    kdlsx q8fkd htmnz s6dii pufmr kipul
    sxqmt yrmty ripug nslip u9gle 7ejc8
    fkdgn sllsx qmtyr krwpo v4bg9 lsxq8
    fkdmt yr16g nsl8f kdlsx q8fkd 6dinz
    s4bg9 htmah mffmr k8fkd mtyr1 6gnsl
    8fkd8 fkdpw u8fkd htmfm rkcjo elqj8
    fkdnz slsxq cjo4b g9htm ahmff mrk8f
    kd7ej c8fkd htmnz sbng8 fkdls xq8fk
    dlsxq mtyrs zxgns l5ha1 6fmrk cjo6d
    i9gle fmrk4 bg9ah mfmty rfmrk cjoel
    qj8fk dnzsb ng8fk d6dib ng8fk d6die
    lqj8f kdlsx q8fkd 7ejc9 glefm rk4bg
    9ahmf 9gle1 6lsxq mtyrc joahm fhtm4
    bg9fm rkcjo htmah mfnzs bng8f kd8fk
    dhtm7 ejc16 9gle4 bg9ls xq4bg 96di8
    fkd16 lsxqq xvbng cjonz s8fkd 9glef
    mrk4b g9ahm fipu9 glejq vo8fk d4bg9
    6di8f kd5ha ovnzs 4bg9f mrkfm rk7ej
    ccjot y9gle 4bg96 dinzs mtyr4 bg9ls
    xq8fk dcjol sxqls xq8fk dfmrk 8fkdp
    wu4bg 9htmn zs9gl efmrk 4bg9a hmfcj
    omtyr 4bg9m tyrcj omtyr ovhtm 7ejc8
    fkdls xqfmr kcjoh tm8fk d4926 dib44
    bg907 c6di4 9229e 707c5 ha492 38107
    c6di2 705a3 49216 b43af 8381b 45a35
    ha270 3af84 bg98f kd3af 83af8 5a3b4

## Analysis

So this is a known-ciphertext (a.k.a. ciphertext-only) attack.

As standard, we always start with some recon. Hopefully, something we
see from our analysis is 'interesting' in some way that makes us pursue
further. Here's a list of what we did.

* Collapse away the newlines and spaces. There is a chance that the
  blocks of five are a reflection of the fact that this is could be a
  historical cipher, but most of the analysis we could do on this visual
  form we could do more easily on a cleaned up form.
* For n-grams, where n is 1..6, what is the used alphabet? Frequency
  analysis? Is the character usage uniform? (It totally is not)

Here is the distribution of all characters:

    f: 67    m: 56    k: 54    g: 51
    d: 48    9: 44    l: 43    8: 42
    s: 40    b: 35    r: 33    4: 32
    j: 30    t: 30    c: 29    e: 29
    h: 28    n: 26    q: 25    x: 23
    a: 21    o: 21    6: 20    i: 17
    7: 16    y: 16    z: 15    1: 10
    p: 10    3:  9    u:  9    2:  8
    5:  7    v:  6    0:  5    w:  5

Here is the distribution of all bigrams:

    8f: 36    fk: 36    kd: 36    4b: 23    bg: 23    g9: 23    fm: 20    ls: 20
    sx: 20    xq: 20    rk: 18    mr: 17    cj: 16    jo: 16    ty: 16    9g: 15
    gl: 15    le: 15    mt: 15    yr: 15    ht: 14    tm: 14    nz: 13    zs: 13
    6d: 12    di: 12    ej: 11    mf: 11    7e: 10    ah: 10    hm: 10    jc: 10
    16:  8    bn:  8    ng:  8    q8:  8    dl:  7    sl:  7    9a:  6    ef:  6
    k4:  6    49:  5    92:  5    dh:  5    gn:  5    ip:  5    kc:  5    mn:  5
    ns:  5    pu:  5    3a:  4    5h:  4    9h:  4    af:  4    b4:  4    c8:  4
    f8:  4    g8:  4    ha:  4    ov:  4    pw:  4    qm:  4    sb:  4    wu:  4
    07:  3    5a:  3    70:  3    7c:  3    96:  3    9l:  3    a3:  3    cc:  3
    d6:  3    dm:  3    el:  3    g4:  3    j8:  3    k8:  3    lq:  3    m7:  3
    ma:  3    qj:  3    r4:  3    u9:  3    27:  2    38:  2    6g:  2    6l:  2
    81:  2    83:  2    9f:  2    9p:  2    c6:  2    d4:  2    d7:  2    d8:  2
    dn:  2    dp:  2    e4:  2    e7:  2    e8:  2    e9:  2    ff:  2    i8:  2
    ib:  2    in:  2    l8:  2    o8:  2    o9:  2    oe:  2    oh:  2    ol:  2
    om:  2    qc:  2    r1:  2    rc:  2    s4:  2    sz:  2    vh:  2    zx:  2
    03:  1    05:  1    10:  1    1b:  1    21:  1    22:  1    23:  1    26:  1
    29:  1    2c:  1    34:  1    35:  1    3b:  1    43:  1    44:  1    45:  1
    69:  1    6b:  1    6f:  1    6o:  1    84:  1    85:  1    90:  1    98:  1
    9e:  1    9m:  1    a1:  1    a2:  1    a4:  1    ao:  1    c1:  1    c5:  1
    c9:  1    cn:  1    d1:  1    d3:  1    d5:  1    d9:  1    dc:  1    df:  1
    dg:  1    ds:  1    e1:  1    f9:  1    fc:  1    fh:  1    fi:  1    fn:  1
    gc:  1    i1:  1    i2:  1    i4:  1    i9:  1    ie:  1    ii:  1    jq:  1
    k7:  1    kf:  1    ki:  1    kr:  1    l5:  1    li:  1    ll:  1    m4:  1
    m8:  1    o4:  1    o6:  1    oa:  1    on:  1    ot:  1    po:  1    q4:  1
    q7:  1    q9:  1    qf:  1    ql:  1    qq:  1    qv:  1    qx:  1    rb:  1
    rf:  1    ri:  1    rl:  1    rm:  1    ro:  1    rs:  1    rw:  1    s6:  1
    s7:  1    s8:  1    s9:  1    sm:  1    u4:  1    u7:  1    u8:  1    uf:  1
    ug:  1    ul:  1    v4:  1    vb:  1    vn:  1    vo:  1    wp:  1    xb:  1
    xg:  1    xv:  1    y9:  1    

The single character distribution is alarming, but the bigram
distribution is even more alarming. In particular, notice the exact 36
counts of '8f', 'fk', and 'kd'. This screamed to us, and we found that
there are exactly 36 counts of '8fkd'. We then reasoned that this group
of characters might map back to a single unique n-gram in the plaintext.
To follow this potential idea, we replaced '8fkd' with 'E' (arbitrary)
in the ciphertext, and proceeded to repeat this through the rest of the
ciphertext.

    8fkd: E    gnsl: R    6di:  J    381:  =
    4bg9: I    3af8: S    7ejc: K    270:  @
    lsxq: A    5ha:  T    ahmf: L    krwp: #
    fmrk: B    16:   U    bng:  M    qxv:  ü
    9gle: C    elqj: V    492:  N    jqvo: ~
    mtyr: D    ov:   W    szx:  O    ty:   ➜
    cjo:  F    07c:  X    pwu:  P    29e7: &
    htm:  G    5a3:  Y    ipu:  Q    nzs:  H
    b4:   Z

(This is actually our original table that we produced, and the Unicode is a
side effect of team member trolling)

We get this text (with the special characters replaced and newlines added for
reading cleanliness, this is 272 characters).

    JUWGHAFEDMIPCBILDIGKHMNFACBILDAKFCCEAEGHKEOMIPKFCCEAEGHJ
    QBQADDQRQCKERAD3WIAEDUREAEJHIGLBEDUREEPEGBFVEHAFIGLBEKEG
    HMEAEADORTUBFJCBILDBFVEHMEJMEJVEAEKCBILCUADFLGIBFGLHMEEG
    KUCIAIJEUA4MFHECBILQC5EIJETWHIBBKF6CIJHDIAEFAAEBEPIGHCBI
    LFDIDFDWGKEABFGENJZIXJN7XTN8XJ9YNUZS8ZYT9SIESSYZ

As one idea, we threw this into a single substitution cipher solver
trying statistical analysis on English.

    COUNTRIES HAV FLAGS AND THWIRFLAGSR DIFFERENT DEY HAV
    DIFFERENTCXLXRSSXMXFDE MRS3 U ARE SOME RECTANGLE SOME EVEN LIKE TRIANGLE
    DEN THERER SYMBOLIC FLAGS LIKE THE CHECKERED FLAG FOR SIGNALING THE END
    OF A RACE OR4 HITE FLAGXF5 EACE BUT ALL DI6FACTS ARE IRRELEVANT FLAG IS
    ASIS UNDERLINEW CZAJCW7JBW8JC9PWOZQ8ZPB9QAEQQPZ

We had to clean this up manually. In particular, we knew that the last
string is a 32 character hex string.. because the answer format is
ASIS\_md5. Notice right before the end.. *FLAG IS ASIS UNDERLINE*. So
we know that they are giving away the flag. We needed to clean this text
up as best we can by guessing the text. The organizers were also clever
in mixing numbers into the plaintext (to make it easier to correlate
back to the numerics in the hash) by including gems like "TH3IR" and
"C0L0R".

Once cleaned, we had this potential flag.

    3c6a1c371b381c943065864b95ae5546

Even after our attempted deciphering of the previous message, we weren't
sure about the correctness of the characters `12456789x`.

The javascript code in the ASIS ctf website checks for flag correctness
before sending it serverside (We did test to make sure they they did
also do server side validation :) ). The webpage hard codes the SHA-256
of the right answer, presumably to minimize server load, so we could
verify our answers on our own boxes before shipping it up.  So here is
the ~~pukey~~ Python that we used to bruteforce the the remaining flag
possibilities.

```python
from itertools import permutations
from hashlib import sha256

def test(s):
  e = '9f2a579716af14400c9ba1de8682ca52c17b3ed4235ea17ac12ae78ca24876ef'
  return sha256('ASIS_' + s).hexdigest() == e

m = '3c6a1c371b381c943065864b95ae5546'
s = '12456789x'
for p in permutations(s):
    def f(sub, c):
        if c in sub:
            return sub[c]
        else:
            return c
    sub = {c : d for c, d in zip(s, p)}
    z = ''.join(f(sub, c) for c in m)
    if test(z):
        print z
        break
```

And it dumps out the flag!

    ASIS_3c5a6c386b326c143059254b19ae9945
