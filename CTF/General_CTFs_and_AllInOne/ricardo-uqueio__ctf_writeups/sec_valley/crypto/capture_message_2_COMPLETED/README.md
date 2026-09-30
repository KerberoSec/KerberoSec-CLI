**Challenge:** capture message 2<br>
**Level 1**<br>
**Score**: 10 <br>
**Category:** crypto<br><br>
**Description**<br>
Hm hm hm. We have seen this before... a long time ago. But we are to stupid to crack it...help us, again! I guess the original content of this weird garbage is english. Maybe that help's you to break it! Hint: Flag content should be lowercase.

Link: https://github.com/SecurityValley/PublicCTFChallenges/tree/master/crypto/weird_but_old

**Solution**<br>
Used [quipquip](https://www.quipqiup.com/) to decrypt the message.

Since the flag should not be capitalized and still has to be formatted before submitting, I made this cool bash script that converts it to lowercase and correctly formats it for submission:

`echo 'THEFLAGFOUND' | tr A-Z a-z | sed 's/\(.*\)/SecVal\{\1\}/'`

So cool :)
