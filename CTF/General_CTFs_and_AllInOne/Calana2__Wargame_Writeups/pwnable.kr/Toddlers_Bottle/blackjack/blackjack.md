# blackjack

![blackjack](https://github.com/user-attachments/assets/62d13493-304b-4124-a21c-2856ab67e0a4)

El sistema no valida una apuesta negativa; por ejemplo si apostamos `$-100000` se calcula `cash = cash - (-10000) =  cash + 10000` si perdemos con una apuesta negativa:
``` C
         if(p==21) //If user total is 21, win
         {
             printf("\nUnbelievable! You Win!\n");
             won = won+1;
             cash = cash+bet;
             printf("\nYou have %d Wins and %d Losses. Awesome!\n", won, loss);
             dealer_total=0;
             askover();
         }

         if(p>21) //If player total is over 21, loss
         {
             printf("\nWoah Buddy, You Went WAY over.\n");
             loss = loss+1;
             cash = cash - bet;
             printf("\nYou have %d Wins and %d Losses. Awesome!\n", won, loss);
             dealer_total=0;
             askover();
         }
```

```
Would You Like To Play Again?
Please Enter Y for Yes or N for No
y

Cash: $500
-------
|S    |
|  6  |
|    S|
-------

Your Total is 6

The Dealer Has a Total of 1

Enter Bet: $-1000000

Would You Like to Hit or Stay?
Please Enter H to Hit or S to Stay.
h
-------
|S    |
|  J  |
|    S|
-------

Your Total is 16

The Dealer Has a Total of 3

Would You Like to Hit or Stay?
Please Enter H to Hit or S to Stay.
h
-------
|H    |
|  2  |
|    H|
-------

Your Total is 18

The Dealer Has a Total of 14

Would You Like to Hit or Stay?
Please Enter H to Hit or S to Stay.
h
-------
|H    |
|  A  |
|    H|
-------

Your Total is 19

The Dealer Has a Total of 15

Would You Like to Hit or Stay?
Please Enter H to Hit or S to Stay.
h
-------
|D    |
|  Q  |
|    D|
-------

Your Total is 29

The Dealer Has a Total of 19
Woah Buddy, You Went WAY over.

You have 1 Wins and 1 Losses. Awesome!

Would You Like To Play Again?
Please Enter Y for Yes or N for No
y
Woohoo_I_am_now_a_MILL10NAIRE!

Cash: $1000500
-------
|S    |
|  1  |
|    S|
-------

Your Total is 1

The Dealer Has a Total of 2

Enter Bet: $
```

`Woohoo_I_am_now_a_MILL10NAIRE!`
