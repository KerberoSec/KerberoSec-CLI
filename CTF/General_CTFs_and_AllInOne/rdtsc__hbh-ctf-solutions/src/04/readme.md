Timed Challenge 4
-----------------

> You will be given a string, it will be scrambled using the following rules:
>
> For every character in the string, take the position of the character.
> (Starting from 0)
>
> The initial character remains static.
>
> If the current position is even, then leave the character as it is.
>
> If its odd, add your current position and two.
>
> The character following the initial character, will be your last.
>
> Remember! Rules Matter!
>
> You have two seconds to answer this challenge.
>
> Pseudo Code:
>
> ```
> FOR i = 0; i < str.length; i++
>   IF isEvenOrZero(i)
>     final += final[i]
>   ELSE
>     final += final[i+2]
> END FOR
>
> final += final[1]
>
> RETURN final
> ```
>
> Your word is: tlyroa

The provided string is non-static and refreshes with each request.
