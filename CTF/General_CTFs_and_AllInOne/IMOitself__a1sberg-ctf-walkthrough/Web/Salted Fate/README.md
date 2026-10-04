1. i extract the js from the site and reference the flag patterns, variable names. etc. see `basta.js`. 
- instead of actually brute forcing (which takes 2 YEARS!). we do **timing attack**. this turns 100,000,000 guesses into a maximum of **80 guesses** (10 numbers × 8 positions). It will take seconds instead of years!

1. It tries `00000000` through `90000000`. If `40000000` takes 500ms longer than the rest, it knows the first digit is **4**.
2. It then tries `40000000` through `49000000`. If `47000000` takes longer than the rest, it knows the second digit is **7**.
3. It repeats this until the 8-digit pin is fully cracked. 

2. must have `nodejs`. run `nodejs local.js` on your terminal locally.