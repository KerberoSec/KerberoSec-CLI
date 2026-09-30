Ooh...this challenge seems like interesting!
![Bandit9](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit9/level9-%3Elevel10.png)

Let's see what we'll have to do here.
```
bandit9@bandit:~$ ls
data.txt
bandit9@bandit:~$ strings data.txt 
Z/,_
WW"&8
2Qk)
xWa_
x?Xn
//M$
;yzEt!
WpU~e
`Rn,I
VSXdK
WB|{
GhG$
========== the*2i"4
DUJmU
ux.j
=:G e
8.jD
)'0K
9DLW
f0"q
zf~Z
 flf
a{KG
lj}ZRO
662Z
.Y `04
wUhy
X38UL
v"*-
AxEf
aeTh
OeOS
e}\"
[72V]>e
N+{G6Q
7XK5
B}T<d
SQr.
{8xG\
|b;{
Y4xsm
-xnfv
6@Bj
-|38
,F3&A
iQ>Zc
 r8C
|wJ*"
gtg~o6c
&>\	7
xk9~
.,N?
n~C!l
LCbD
wqND
tmC>
'<o-
OxYF
68}j
Q~a`%
========== password
#|-l
G}`:
o]zb
JbnhB
:j9)
t7qM
9-q?9z
gh'Kz
uWO)
dxG9
e})nQ
~}K{
acer
?.}@
"*a%si*
<I=zsGi
&15h
!G[\
uOZ\K
BYD1
D2?	
Z)========== is
x[U*
m/;7
r%z$c
C !n
&/Lhh[}~s
b$J})Q
z3p)
fRk4Ck
Jq{`
fVHi
Y<_M
88)%
E>aS
*S{"
k<02
i;C\\N
t;afX
:mJ\
){.h
ZcO3
>K`t;X
'p6:
/g'x
l6C4
@17J
V?**
141>Y
YZ+y
K#VV
|6Uj
ckd^r
zDshn:X
A=|t&E
n8os
O\0	f	>
]v#8
2X[eO{
TjIR\+
qeY|
I[aJtZH:
LkfWdO5`
pC:*
X^+5
Aiwj~
	0^8]W
4k1S
BbYR
:hk9
ZpE5
mWW#+\
s/#m`
*Ybc
vNHkt
tVQq
S_JtG1
CQ:[`
63KS+
Rw_0
)'p5
y.f+3
G?'P
olV_
0X Gx
6\Ni
X$)4!
B-"q
p1bz
P%W"
W`yI
ve&I
Zdb=
M]W>g
9!ipo
x3tl%E
{)Xiw-
Mef?Mo
Tr]Zo
;x47
/Uil>
c^ LAh=3G
QR%q
C&&b
fXzzO(Ub
.y#2
LsyH
R	w&
,V*.m
g.o]]|W
]A2xd}M
il,m
.;].F
}<@M
N:)c
sssyJ
:T	Y
_^XF)ZB.g
;9'~
\Jg`
S/gA
g<%x
xzY<
blsN
~U^y
x@nQ
*SF=s
}1:LF
]vur
Emlld
&========== truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
_Gmz
\Uli,
A5RK
S'$0
<4t",
4cXO
cj13c:?
&Yra
zEwa
b2+x
z`tlR
o|8M]
.p4Hv
)z<p
S=A.H&^
#hu#
"C}Jy
0R@R_
~KW?
b#Nzx$b
RlG#t]Z}
e790
JzV1O
XEgp
2Q d
z#j\
1Qit
a'b~
bxBB\u$
8Zpc	$FOxF[
ANYwPCpk
Xk]E
bh}s
P'uP
\-A:
sCtY
Z/1x+
ej8z
P"`\XZ
1KOA
```

Oh fish!
Actually we have a hint from the challenge statement, right?
`The password for the next level is stored in the file <h3>data.txt</h3> in one of the few human-readable strings, preceded by several ‘=’ characters.`

So, what shall we do now?
Aaah! I think we know a tool to find patterns, right?
The mighty GREP!

Let's see what we can do with that.
```
bandit9@bandit:~$ strings data.txt | grep -E "*==*"
========== the*2i"4
=:G e
========== password
<I=zsGi
Z)========== is
A=|t&E
Zdb=
c^ LAh=3G
*SF=s
&========== truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
S=A.H&^
```
Is it GREP tool which we've used before?
Absolutely YES!

We just supplied an option <tag -E>, which is:
`-E, --extended-regexp     PATTERN is an extended regular expression (ERE)`

If you've used `re` module in Python Programming Language or Word processing languages like `awk` or `Perl`, this will be a piece-of-cake for you.

Anyhow, hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk` to log into the remote-machine as `bandit10`.

**Warning: Please, first try Level 10 -> Level 11! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
