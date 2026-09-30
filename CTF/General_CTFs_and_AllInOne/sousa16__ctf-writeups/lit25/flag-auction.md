
**NOTE: This is a post-solution writeup, created after reviewing the official solution/other players’ approaches. 
It’s for learning and documentation.**

Write-up:

1. The site allows users to place bids for a flag. After analyzing the code, this
challenge is probably about exploiting the auction logic.

2. Bidding `NaN` on the flag item allows us to win the auction: `LITCTF{we_shall_never_have_error_500_at_the_most_critical_times}`