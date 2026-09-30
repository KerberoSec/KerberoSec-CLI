# HackTheBox: AI Evasion: First-Order Attacks (Skills Assesment)

**Platform:** [HackTheBox Academy](https://academy.hackthebox.com)

**Room:** AI Evasion: First-Order Attacks (Skills Assesment 1 and 2)

---
# Skills Assesment 1
## Overview

Task:

*[Image: Task decription]*

*[Image: Task decription]*

---
## Approach

__You can find full notebook with a solution here: "[FGSM.ipynb](./Challenge%201/FGSM.ipynb)".__

The main change was making the attack targeted instead of untargeted. Instead of maximizing the loss on the true label to push the model away from it, I minimized the loss on the target label to pull the model toward it: which just means flipping the sign of the update.

---
# Skills Assesment 2
## Overview

Task:

*[Image: Task decription]*

*[Image: Task decription]*

---
## Approach

__You can find full notebook with a solution here: "[deepfool.ipynb](./Challenge%201/deepfool.ipynb)".__

I do not understand a point of this challenge, because it can be solved using function from "DeepFool Implementation" section without any significant changes in its logic.  

---