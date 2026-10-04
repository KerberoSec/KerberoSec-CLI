```
╔═╗┬─┐┬┌─┐┬┌┐┌┌─┐┬    ╔═╗┌─┐┌─┐┌─┐┌─┐┬─┐  ╔═╗┬┌─┐┬ ┬┌─┐┬─┐
║ ║├┬┘││ ┬││││├─┤│    ║  ├─┤├┤ └─┐├─┤├┬┘  ║  │├─┘├─┤├┤ ├┬┘
╚═╝┴└─┴└─┘┴┘└┘┴ ┴┴─┘  ╚═╝┴ ┴└─┘└─┘┴ ┴┴└─  ╚═╝┴┴  ┴ ┴└─┘┴└─
```
In this challenge you shall break the Caesar encryption in its original form. [^1]

Introduction
-----------------------------------------------------------------------------------------
The Caesar cipher is a very simple example of a monoalphabetic substitution. It was
named after Gaius Julius Caesar who used it to encrypt messages of military significance.
Your challenge is first to decrypt the ciphertext given as follows.

> JQRRG, JQRRG, TGKVGT<br>
>
> JQRRG, JQRRG, TGKVGT,<br>
> YGPP GT HCGNNV, FCPP UEJTGKV GT.<br>
> HCGNNV GT KP FGP ITCDGP,<br>
> HTGUUGP KJP FKG TCDGP,<br>
> HCGNNV GT KP FGP UWORH,<br>
> FCPP OCEJV FGT TGKVGT RNWORU!<br>
>
> JWORVA FWORVA<br>
>
> JWORVA FWORVA UCV QP C YCNN<br>
> JWORVA FWORVA JCF C ITGCV HCNN<br>
> CNN VJG MKPI’U JQTUGU CPF CNN VJG MKPI’U OGP<br>
> EQWNFP’V RWV JWORVA VQIGVJGT CICKP.

As the cipher is from a time when cryptography was still in its infancy perhaps the right
plaintext will remind you of your childhood. The plaintext is partly German and partly
English. The solution to this challenge is the last word of the German part of the
plaintext and must be entered in capital letters.

Solution
-----------------------------------------------------------------------------------------
The Caesar cipher works by shifting each letter in the message a fixed number of places
in the alphabet. To solve it, we can try shifting all the letters backward by different
amounts until the text turns into readable words. Because there are only 25 possible
shifts in the alphabet, only one of them will usually clearly make sense. We can solve it
by using one of the many online decryptors, such as [^2] or by using the command `caesar`
from the "BSD Games" in a shell of our choice.

> HOPPE, HOPPE, REITER<br>
>
> HOPPE, HOPPE, REITER,<br>
> WENN ER FAELLT, DANN SCHREIT ER.<br>
> FAELLT ER IN DEN GRABEN,<br>
> FRESSEN IHN DIE RABEN,<br>
> FAELLT ER IN DEN SUMPF,<br>
> DANN MACHT DER REITER PLUMPS!<br>
>
> HUMPTY DUMPTY<br>
>
> HUMPTY DUMPTY SAT ON A WALL<br>
> HUMPTY DUMPTY HAD A GREAT FALL<br>
> ALL THE KING’S HORSES AND ALL THE KING’S MEN<br>
> COULDN’T PUT HUMPTY TOGETHER AGAIN.

Therefore, we get a traditional German and English children's nursery rhyme. The flag is
the last word of the first verse.
    
[^1]: https://mysterytwister.org/challenges/level-1/original-caesar-cipher
[^2]: https://www.dcode.fr/caesar-cipher
