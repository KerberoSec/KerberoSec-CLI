## HV19.14 Achtung das Flag

Let's play another little game this year. Once again, I promise it is hardly obfuscated.

### Resources

```perl
use Tk;use MIME::Base64;chomp(($a,$a,$b,$c,$f,$u,$z,$y,$r,$r,$u)=<DATA>);sub M{$M=shift;##
@m=keys %::;(grep{(unpack("%32W*",$_).length($_))eq$M}@m)[0]};$zvYPxUpXMSsw=0x1337C0DE;###
/_help_me_/;$PMMtQJOcHm8eFQfdsdNAS20=sub{$zvYPxUpXMSsw=($zvYPxUpXMSsw*16807)&0xFFFFFFFF;};
($a1Ivn0ECw49I5I0oE0='07&3-"11*/(')=~y$!-=$`-~$;($Sk61A7pO='K&:P3&44')=~y$!-=$`-~$;m/Mm/g;
($sk6i47pO='K&:R&-&"4&')=~y$!-=$`-~$;;;;$d28Vt03MEbdY0=sub{pack('n',$fff[$S9cXJIGB0BWce++]
^($PMMtQJOcHm8eFQfdsdNAS20->()&0xDEAD));};'42';($vgOjwRk4wIo7_=MainWindow->new)->title($r)
;($vMnyQdAkfgIIik=$vgOjwRk4wIo7_->Canvas("-$a"=>640,"-$b"=>480,"-$u"=>$f))->pack;@p=(42,42
);$cqI=$vMnyQdAkfgIIik->createLine(@p,@p,"-$y"=>$c,"-$a"=>3);;;$S9cXJIGB0BWce=0;$_2kY10=0;
$_8NZQooI5K4b=0;$Sk6lA7p0=0;$MMM__;$_=M(120812).'/'.M(191323).M(133418).M(98813).M(121913)
.M(134214).M(101213).'/'.M(97312).M(6328).M(2853).'+'.M(4386);s|_||gi;@fff=map{unpack('n',
$::{M(122413)}->($_))}m:...:g;($T=sub{$vMnyQdAkfgIIik->delete($t);$t=$vMnyQdAkfgIIik->#FOO
createText($PMMtQJOcHm8eFQfdsdNAS20->()%600+20,$PMMtQJOcHm8eFQfdsdNAS20->()%440+20,#Perl!!
"-text"=>$d28Vt03MEbdY0->(),"-$y"=>$z);})->();$HACK;$i=$vMnyQdAkfgIIik->repeat(25,sub{$_=(
$_8NZQooI5K4b+=0.1*$Sk6lA7p0);;$p[0]+=3.0*cos;$p[1]-=3*sin;;($p[0]>1&&$p[1]>1&&$p[0]<639&&
$p[1]<479)||$i->cancel();00;$q=($vMnyQdAkfgIIik->find($a1Ivn0ECw49I5I0oE0,$p[0]-1,$p[1]-1,
$p[0]+1,$p[1]+1)||[])->[0];$q==$t&&$T->();$vMnyQdAkfgIIik->insert($cqI,'end',\@p);($q==###
$cqI||$S9cXJIGB0BWce>44)&&$i->cancel();});$KE=5;$vgOjwRk4wIo7_->bind("<$Sk61A7pO-n>"=>sub{
$Sk6lA7p0=1;});$vgOjwRk4wIo7_->bind("<$Sk61A7pO-m>"=>sub{$Sk6lA7p0=-1;});$vgOjwRk4wIo7_#%"
->bind("<$sk6i47pO-n>"=>sub{$Sk6lA7p0=0 if$Sk6lA7p0>0;});$vgOjwRk4wIo7_->bind("<$sk6i47pO"
."-m>"=>sub{$Sk6lA7p0=0 if $Sk6lA7p0<0;});$::{M(7998)}->();$M_decrypt=sub{'HACKVENT2019'};
__DATA__
The cake is a lie!
width
height
orange
black
green
cyan
fill
Only perl can parse Perl!
Achtung das Flag! --> Use N and M
background
M'); DROP TABLE flags; -- 
Run me in Perl!
__DATA__
```

### Solution

For this challenge, we get a perl implementation of the game [Achtung die Kurve](https://achtungkurve.com/). Instead of opponents, we need to collect parts of the flag (similar to snake). Of course, solving the challenge by simply playing the game is really hard (if not impossible) and also boring. Therefore, I decided to patch the script. In the first step, I started to format the script and rename variables, to get some general overview what is going on. 

Using this approach, it was quite easy to figure out which conditions force the game to prematurely exit (because they lead to a call of the cancel function). This way, I was able to prevent the game from stopping once I hit a wall or some part of my snake. Moreover, I made sure the game still renders already collected flag fragments (by commenting out the call to delete) and adapted the placement of the characters. Finally, I patched updated the condition to always render the next part of the flag, no matter if the previous one was already collected. After all these changes, the game is essentially self-solving and prints the flag without further human interaction: 

The final patched version of my program looks as follows:

```perl
use Tk;
use MIME::Base64;
chomp(($a,$a,$b,$c,$f,$u,$z,$y,$r,$r,$u)=<DATA>);
sub M{
    $M=shift;##
    @m=keys %::;
    (grep{(unpack("%32W*",$_).length($_))eq$M}@m)[0]
};
$zvYPxUpXMSsw=0x1337C0DE;###
/_help_me_/;
$PMMtQJOcHm8eFQfdsdNAS20=sub{
    $zvYPxUpXMSsw=($zvYPxUpXMSsw*16807)&0xFFFFFFFF;
};

($a1Ivn0ECw49I5I0oE0='07&3-"11*/(')=~y$!-=$`-~$;
($Sk61A7pO='K&:P3&44')=~y$!-=$`-~$;
m/Mm/g;
($sk6i47pO='K&:R&-&"4&')=~y$!-=$`-~$;;;;
$d28Vt03MEbdY0=sub{
    pack('n',$fff[$S9cXJIGB0BWce++] ^($PMMtQJOcHm8eFQfdsdNAS20->()&0xDEAD));
};
'42';
($vgOjwRk4wIo7_=MainWindow->new)->title($r);

($vMnyQdAkfgIIik=$vgOjwRk4wIo7_->Canvas("-$a"=>640,"-$b"=>480,"-$u"=>$f))->pack;
@p=(42,42);
$cqI=$vMnyQdAkfgIIik->createLine(@p,@p,"-$y"=>$c,"-$a"=>3);;;
$S9cXJIGB0BWce=0;
$_2kY10=0;
$_8NZQooI5K4b=0;
$Sk6lA7p0=0;
$MMM__;
$_=M(120812).'/'.M(191323).M(133418).M(98813).M(121913)
.M(134214).M(101213).'/'.M(97312).M(6328).M(2853).'+'.M(4386);
s|_||gi;
@fff=map{unpack('n',$::{M(122413)}->($_))}m:...:g;
$posx = 20;
$posy = 20;
($T=sub{
    #$vMnyQdAkfgIIik->delete($t);
    $pos_t = $PMMtQJOcHm8eFQfdsdNAS20->();$posx += 15;
    $pos_y = $PMMtQJOcHm8eFQfdsdNAS20->();

    $newPosX = $posx%600+20;
    $idealPosX = $posx+20;

    if ($newPosX < $idealPosX) {$posy += 20;}

    $t=$vMnyQdAkfgIIik->#FOO
    createText($posx%600+20,$posy%440+20,#Perl!!
    "-text"=>$d28Vt03MEbdY0->(),"-$y"=>$z);
})->();
$HACK;
$i=$vMnyQdAkfgIIik->repeat(25, sub{
    $_=($_8NZQooI5K4b+=0.1*$Sk6lA7p0);;
    $p[0]+=3.0*cos;
    $p[1]-=3*sin;;
    #($p[0]>1 && $p[1]>1 && $p[0]<639 && $p[1]<479) || $i->cancel();
    00;
    $q=($vMnyQdAkfgIIik->find($a1Ivn0ECw49I5I0oE0,$p[0]-1,$p[1]-1, $p[0]+1,$p[1]+1)||[])->[0];
    #$q==$t&&$T->();
    $T->();
    #$vMnyQdAkfgIIik->insert($cqI,'end',\@p);
    ($S9cXJIGB0BWce > 44) && $i->cancel();
   # ($q == $cqI || $S9cXJIGB0BWce > 44) && $i->cancel();
});

$KE=5;
$vgOjwRk4wIo7_->bind("<$Sk61A7pO-n>"=>sub{
    $Sk6lA7p0=1;
});
$vgOjwRk4wIo7_->bind("<$Sk61A7pO-m>"=>sub{
    $Sk6lA7p0=-1;
});
$vgOjwRk4wIo7_#%"
    ->bind("<$sk6i47pO-n>"=>sub{
        $Sk6lA7p0=0 if$Sk6lA7p0>0;
    });
$vgOjwRk4wIo7_->bind("<$sk6i47pO"
    ."-m>"=>sub{
        $Sk6lA7p0=0 if $Sk6lA7p0<0;
    });
$::{M(7998)}->();
$M_decrypt=sub{'HACKVENT2019'};
__DATA__
The cake is a lie!
width
height
orange
black
green
cyan
fill
Only perl can parse Perl!
Achtung das Flag! --> Use N and M
background
M'); DROP TABLE flags; -- 
Run me in Perl!
__DATA__
```

**Flag:** HV19{s@@jSfx4gPcvtiwxPCagrtQ@,y^p-za-oPQ^a-z\x20\n^&&s[(.)(..)][\2\1]g;s%4(...)%"p$1t"%ee}
