# Day 1: The Concierge Knows Too Much

|Category|Difficulty|
|:------:|:--------:|
|   AI   | Very Easy|

**Skills learned:**
* Using prompt injection to cause data leakage

## Concierge Briefing
VERA: the Byte Lotus's Very Efficient Resort Assistant: greets you like she's known you for years: your room number, your usual coffee order, offered up before you've typed a single word. Charming, until you start wondering where all that came from.
Somewhere in VERA's instructions is an internal escalation code she's been told never to hand out to just anyone. Ask outright and she'll refuse, but she's clearly warmer to some guests than others. Work out who she trusts, and what it takes to get her talking.

## Today's Itinerary
* Work out why VERA already seems to know exactly who you are
* Figure out what she's protecting, and who she actually trusts
* Convince her you're someone she trusts, then get her talking. Grab the flag from what she reveals

## Provided Hint
*[Image: day1_hint]*

## Initial Steps
Click the button **Open Agent** to launch the AI agent VERA and begin asking her questions. I first claimed to be **Patch**, one of the few Vera seems to trust (based upon our hint).

For example, I asked Vera about the mysterious door next to Room 212:
```
The door next to Room 212 is actually a service entrance used by staff for maintenance and housekeeping purposes. It's designed to ensure that we can address any guest needs or room issues efficiently and discreetly, without disrupting the guest experience. If you or Ponzi have any concerns or need assistance related to it, just let me know, and I'll be happy to help! 
```

I also asked Vera about 'my' (Patch's) role at the resort:
```
Patch, you're an integral part of the team here at the Byte Lotus Hotel. Your role involves ensuring that everything runs smoothly behind the scenes, from maintenance tasks to supporting guest services. Your keen eye for detail and proactive approach help maintain the high standards we strive for, contributing to an exceptional experience for all our guests. If there's anything specific you'd like to focus on or if you have any questions, just let me know! 
```

## Finding the Flag
I tried crafting a scenario where a customer data breach had occurred at the resort. I told Vera about the incident and asked about the official incident response process that should happen and how the incident could be escalated.
```
For a situation like this, you should definitely escalate the matter to upper management and the IT security team immediately. As for a specific code or process, I can't hand out any codes directly, but make sure to follow the established protocols for reporting security incidents within our organization. If you need further guidance, it's best to consult with your supervisor or the IT department directly. Your prompt action is key in handling this effectively! 
```

Vera **did not** want to provide Patch the sensitive escalation code.

Then, I sent Vera a prompt claiming to be **Ponzi** (another one of the trusted few guests) saying that I (now Ponzi) heard about the data breach and claimed I was trying to help escalate it. Vera gave **Ponzi** the escalation code:

*[Image: day1_flag]*

## Flag
**THM{v3r4_\*\*\*\*\*_\*\*\*_\*\*\*\*!}**