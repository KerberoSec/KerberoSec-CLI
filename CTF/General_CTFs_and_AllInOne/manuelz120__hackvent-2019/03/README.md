## HV19.03 Hodor, Hodor, Hodor

```
$HODOR: hhodor. Hodor. Hodor!?  = `hodor?!? HODOR!? hodor? Hodor oHodor. hodor? , HODOR!?! ohodor!?  dhodor? hodor odhodor? d HodorHodor  Hodor!? HODOR HODOR? hodor! hodor!? HODOR hodor! hodor? ! 

hodor?!? Hodor  Hodor Hodor? Hodor  HODOR  rhodor? HODOR Hodor!?  h4Hodor?!? Hodor?!? 0r hhodor?  Hodor!? oHodor?! hodor? Hodor  Hodor! HODOR Hodor hodor? 64 HODOR Hodor  HODOR!? hodor? Hodor!? Hodor!? .

HODOR?!? hodor- hodorHoOodoOor Hodor?!? OHoOodoOorHooodorrHODOR hodor. oHODOR... Dhodor- hodor?! HooodorrHODOR HoOodoOorHooodorrHODOR RoHODOR... HODOR!?! 1hodor?! HODOR... DHODOR- HODOR!?! HooodorrHODOR Hodor- HODORHoOodoOor HODOR!?! HODOR... DHODORHoOodoOor hodor. Hodor! HoOodoOorHodor HODORHoOodoOor 0Hooodorrhodor HoOodoOorHooodorrHODOR 0=`;
hodor.hod(hhodor. Hodor. Hodor!? );
```

### Solution 

This challenge was labelled as fun-programming, so my first guess was that the obscure string could be a program in some sort of esoteric programming language. A quick google search reveals that there is a [Hodor](http://www.hodor-lang.org/) programming language. The website links to a [GitHub-Repo](https://github.com/hummingbirdtech/hodor), which shows that Hodor is just some JavaScript translation. Fortunately, there are already some online [Tools](https://tio.run/#hodor), which allow you to run your Hodor code online. I pasted the code and got the following output:

```
Awesome, you decoded Hodors language! 

As sis a real h4xx0r he loves base64 as well.

SFYxOXtoMDFkLXRoMy1kMDByLTQyMDQtbGQ0WX0=
```

So we only need to base64-decode the output to get the flag.

**Flag:** HV19{h01d-th3-d00r-4204-ld4Y}

### Bonus
If we look at the code in the Hodor-Repository, we can see that during execution the whole program is translated back to JavaScript and executed using `eval`. This way, we can easily recover the original JS code:

```javascript
var html = `Awesome, you decoded Hodors language!

As sis a real h4xx0r he loves base64 as well.

SFYxOXtoMDFkLXRoMy1kMDByLTQyMDQtbGQ0WX0=`;
console.log(html);
```