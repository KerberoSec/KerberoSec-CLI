```
╦  ┌─┐┌┬┐┌┬┐┌─┐┬─┐  ╔╦╗┌─┐  ╔╦╗┬ ┬┌─┐  ╔╦╗┌─┐┌┬┐┌─┐┬  ┌─┐┬─┐┌─┐       ╔═╗┌─┐┬─┐┌┬┐  ╦╦╦
║  ├┤  │  │ ├┤ ├┬┘   ║ │ │   ║ ├─┤├┤    ║ ├┤ │││├─┘│  ├─┤├┬┘└─┐  ───  ╠═╝├─┤├┬┘ │   ║║║
╩═╝└─┘ ┴  ┴ └─┘┴└─   ╩ └─┘   ╩ ┴ ┴└─┘   ╩ └─┘┴ ┴┴  ┴─┘┴ ┴┴└─└─┘       ╩  ┴ ┴┴└─ ┴   ╩╩╩
```
Can you decrypt the last part of the letter and read the friend's advice? [^1]

Introduction
-----------------------------------------------------------------------------------------
The letter to the templars consists of three parts. This challenge is about the third
part. The key that has been used here consists of seven digits. Refer to the ciphertext
as follows. 

> ydonoaT4ethh1tpStefeo1e30brmKuinor7saighsgndareanwsaretr-n-aatrsityangdaalunopelaTmltwhnsirexptecoonuaoYibteceorrtedpuaet13nhoOocthft1e30broaBck(l7aiy)rdFodnvncadtasceitriceehrobeyusinngogllniqadssdseiauncfisoteadTctsyraleohbaerhmcesntasheadlelsrtstteealdmalotiransiovffietweitcsichhatehoeopgtretmonhennotadnrfeteobrmnieohtohegfnOtct3h11e30brotnosad7tilyrctolwtolfsitrenhotnsciuaninotctthedoeIrfyodwifltuaoyrouamoveesslreewihrtabnulelcredpendtwaneeaorrefv-t-assektecdanfeyoroalsvereufnaiadstoountleestdrneaoumtileorwlrznedaigclefoipTchereoaplsoePlinowlokayobctlhipPiuaVsdIhpoepevleoiwnhsdtregtasiellhwyhtePutpnedepuosrsuperwHileerehattrlstplnoeaFnctriucrcsheinnsadhtgeaiateossrcpetgrnhosnofudotriceehhneeitstnhaetvPhoptetlastfieciondsoenhiiutpuorspsyooufrtnloteyRethenhooothpfl-spur-erofayutnhthtiiawleonesnsaterymoudandobeLrrytouihw

First, all spaces are removed from the plaintext. Then, the message is separated into
blocks of the same length as the key. In this case, the blocks are seven characters long.
Finally, each block is encrypted separately by shifting each letter to the position of
the number in the key. The letter was written in English. In what should the knights put
all their faith? 

Solution
-----------------------------------------------------------------------------------------
The task description provided us with the ciphertext and the key length of seven.
Therefore, we can write a script `letter_to_the_templars_part_3.py` which splits the
ciphertext into blocks of seven characters each and assembles all the permutations of the
key. For each possible permutation of the key, we then decrypt the message and check if
the word "faith" appears in it.
Upon manually checking all possible key permutations that result in plaintext with the
word "faith" in it, we find out that the key `[6, 4, 1, 5, 0, 2, 3]` produces the most
plausible text. With this key, we can decrypt the full message. Finally, we add spaces
between words and add punctuation to enhance the readability of the text.

> Today on the 14th of September 1307 our King has signed an arrest warrant against you
> and all Templars with no exception. You are to be captured on the 13th of October 1307
> (Black Friday) and convicted as heretics your belongings and liquid assets confiscated.
> The royal chamber has sent sealed letters to all administrative offices with the charge
> to open the mon and not before the morning of the 13th October 1307 and to strictly
> follow the instructions contained to the word. If you fail to arm yourselves there will
> be an unprecedented wave of arrests and take care of yourselves and fail not to
> underestimate our well organized policeforce. The Pope also will not back you. Philipp
> IV has developed his own strategy he will put the Pope under pressure. He will threaten
> to split Frances church and instigate a process on the grounds of heretics in the event
> that the Pope fails to discontinue his support for you. Rely not on the help of others,
> put your faith in the own alertness and may our Lord be with you.

By reading this plaintext, we now know the noun in which templars should put their faith
in and submit it in capital letters.

[^1]: https://mysterytwister.org/challenges/level-2/letter-to-the-templars-part-3
