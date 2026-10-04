# Flag Command: Hack The Box Writeup

![Difficulty](https://img.shields.io/badge/Difficulty-Easy-green)
![Category](https://img.shields.io/badge/Category-Web%20%2F%20Logic-orange)
![Type](https://img.shields.io/badge/Type-Challenge-blue)

---

## Challenge Information

| Attribute | Details |
|-----------|---------|
| **Challenge Name** | Flag Command |
| **Category** | Web / Logic |
| **Platform** | Hack The Box |
| **Release Date** | 31 May 2024 |
| **Creator** | Xclow3n |
| **Type** | Web Challenge |

---

## Table of Contents

- [Overview](#overview)
- [Challenge Analysis](#challenge-analysis)
- [Step-by-Step Solution](#step-by-step-solution)
- [The Secret Discovery](#the-secret-discovery)
- [The Critical Twist](#the-critical-twist)
- [Flag Capture](#flag-capture)
- [Why This Challenge Is Tricky](#why-this-challenge-is-tricky)
- [Key Takeaways](#key-takeaways)

---

## Overview

This writeup documents the complete solution for the **Flag Command** challenge on Hack The Box. 

### Challenge Summary

**Flag Command** presents itself as a text-based fantasy adventure game where players navigate through a forest using directional and narrative commands. However, this is **intentionally misleading**.

**The Reality:**
- Dying is **expected** and part of the solution
- Progress is tracked **server-side**, not through the narrative
- The secret must be used **AFTER** the game ends
- Almost every choice results in death **on purpose**

This challenge tests analytical skills, patience, and the ability to look beyond surface-level game mechanics.

---

## Challenge Analysis

### Initial Impression

When first accessing the challenge, it appears to be a classic text adventure game with multiple-choice navigation:

```
You find yourself at the edge of a dark forest...
What do you do?
```

### Deceptive Elements

The challenge deliberately includes:
- **Silent failures**: Commands fail without clear feedback
- **Identical responses**: Different inputs produce same outputs
- **Narrative misdirection**: Story text doesn't reflect actual state
- **Late validation**: Success conditions checked after apparent failure
- **Client-side leakage**: Critical data visible in browser DevTools

---

## Step-by-Step Solution

### Step 1: Starting the Game

**Initial Prompt:**

```
HEAD NORTH
HEAD EAST
HEAD WEST
HEAD SOUTH
```

**Action Taken:**

```
HEAD NORTH
```

**Result:**
- Game advances to next stage
- Other directions either reset, fail silently, or loop the story

**Important Notes:**
- Commands must be **ALL CAPS**
- Exact spelling required
- No extra spaces allowed

---

### Step 2: Deeper Into the Forest

**Second Stage Prompt:**

```
GO DEEPER INTO THE FOREST
FOLLOW A MYSTERIOUS PATH
CLIMB A TREE
TURN BACK
```

**Action Taken:**

```
GO DEEPER INTO THE FOREST
```

**Result:**
- Successfully progresses to next stage
- Game continues with new choices

**Command Requirements:**
✓ All uppercase letters  
✓ Exact phrase matching  
✓ No leading/trailing whitespace  
✗ Variations or abbreviations fail silently

---

### Step 3: Mid-Game Choices (Death Is Normal)

**Typical Mid-Game Prompt:**

```
ENTER A MAGICAL PORTAL
SWIM ACROSS A MYSTERIOUS LAKE
FOLLOW A SINGING SQUIRREL
BUILD A RAFT AND SAIL DOWNSTREAM
```

**What Happens:**

Regardless of which option is chosen:
1. The story continues briefly
2. Eventually, you **die**
3. Message appears: `You died and couldn't escape the forest.`

**Critical Insight:**

> **This is intentional behavior, not failure.**

At this point, the backend state matters more than the narrative text displayed on screen.

---

## The Secret Discovery

### Step 4: Finding the Hidden Secret

**Method:** Browser Developer Tools Analysis

**Location:** Network Tab → XHR/Fetch Requests → Response JSON

**Discovery:**

While playing the game, inspection of network traffic revealed a JSON response containing:

```json
{
  "secret": "Blip-blop, in a pickle with a hiccup! Shmigity-shmack"
}
```

### Key Observations

| Aspect | Detail |
|--------|--------|
| **Visibility** | Client-side leak in API response |
| **Display** | Not shown in game narrative |
| **Purpose** | Not the flag itself |
| **Validation** | Not checked immediately upon entry |
| **Timing** | Must be used at specific game state |

**How to Find:**

```
1. Open Browser DevTools (F12)
2. Navigate to Network tab
3. Filter by XHR/Fetch
4. Play through the game
5. Inspect response bodies
6. Look for JSON containing "secret" field
```

---

## The Critical Twist

### Step 5: Understanding the Logic

**Common Misconception:**

Most players assume the secret must be entered **before dying** or **during active gameplay**.

**❌ This is incorrect.**

### The Correct Logic Flow

```
1. Play the game normally
2. Make choices (most lead to death)
3. Reach "You died" message
4. Game STILL accepts input
5. Enter the secret AFTER death
6. Secret is validated post-mortem
```

**Why This Matters:**

Many solution attempts "look correct" but fail because:
- Secret entered too early
- Secret entered before death state
- Player restarts after dying (resetting server state)
- Assumption that death = failure

---

## Flag Capture

### Step 6: Using the Secret (After Death)

After reaching the end of the game and seeing the death message, the secret was entered **exactly as discovered**:

```
Blip-blop, in a pickle with a hiccup! Shmigity-shmack
```

**Critical Requirements:**

| Requirement | Details |
|-------------|---------|
| **Case Sensitivity** | Must match exactly |
| **Punctuation** | Comma, exclamation marks required |
| **Quotes** | Do NOT include quotes |
| **Whitespace** | No extra spaces before/after |
| **Timing** | After death message appears |

**Incorrect Attempts:**

```
❌ "Blip-blop, in a pickle with a hiccup! Shmigity-shmack"  (has quotes)
❌ blip-blop, in a pickle with a hiccup! shmigity-shmack    (wrong case)
❌ Blip-blop in a pickle with a hiccup! Shmigity-shmack     (missing comma)
```

---

### Step 7: Flag Revealed

**Success Response:**

```
You escaped the forest and won the game! Congratulations!
```

**Flag:**

```
HTB{D3v3l0p3r_t0015_4r3_b35t_t0015_wh4t_d0_y0u_Th1nk??}
```

**Analysis of Flag:**

The flag message reads (in leetspeak):
```
HTB{Developer_tools_are_best_tools_what_do_you_Think??}
```

This directly references the solution method: using browser developer tools to discover the hidden secret in network responses.

---

## Why This Challenge Is Tricky

### Deceptive Design Elements

1. **Narrative Misdirection**
   - Game story suggests exploration and correct choices matter
   - Reality: Most choices are irrelevant to actual solution
   - Death appears to be failure but is actually required

2. **Silent Failures**
   - Incorrect commands give no feedback
   - Valid commands at wrong time appear identical to invalid ones
   - No clear indication of progress or state

3. **Identical Network Responses**
   - Multiple different inputs produce same HTTP responses
   - Makes it difficult to determine if actions are registering
   - Only subtle state changes tracked server-side

4. **Late Validation**
   - Secret not validated when discovered
   - Validation occurs after apparent game failure
   - Counter-intuitive timing requirement

5. **Client-Side Secret Leakage**
   - Secret visible in browser DevTools
   - Not protected or obfuscated
   - Tests observation skills, not exploitation techniques

---

## Solution Strategy

### Recommended Approach

```
Step 1: Play the game normally
  ↓
Step 2: Monitor network traffic in DevTools
  ↓
Step 3: Identify the secret in JSON responses
  ↓
Step 4: Continue playing until death
  ↓
Step 5: Wait for death message
  ↓
Step 6: Enter secret exactly as found
  ↓
Step 7: Capture the flag
```

### What NOT to Do

❌ Restart after dying  
❌ Enter secret before death  
❌ Modify or quote the secret string  
❌ Assume first success-looking input is correct  
❌ Ignore network traffic analysis

---

## Key Takeaways

### Technical Lessons

1. **Always Inspect Network Responses**
   - Client-side applications often leak sensitive data
   - API responses may contain more than what's displayed
   - DevTools are essential for web challenge analysis

2. **Backend State ≠ Story Text**
   - Visual narrative can be completely decoupled from actual logic
   - Server-side state tracking operates independently
   - UI feedback may be intentionally misleading

3. **Dying Does Not Mean Failing**
   - Game over screens don't necessarily end the challenge
   - Applications may accept input in "failed" states
   - Post-failure validation is a valid design pattern

4. **Never Assume First Success Is Correct**
   - Apparent solutions may be red herrings
   - Multiple validation stages can exist
   - Timing of input matters as much as content

5. **Exact Strings Matter in CTFs**
   - Case sensitivity is critical
   - Punctuation must be precise
   - Whitespace and formatting count
   - Copy-paste is safer than manual retyping

### Security Implications

This challenge demonstrates real-world vulnerabilities:

- **Information Disclosure**: Sensitive data in client-side responses
- **Insufficient Access Control**: Secrets accessible without authentication
- **Poor State Management**: Client can manipulate game state
- **Logic Flaws**: Unintended input acceptance in edge states

---

## Tools Used

- **Browser DevTools (F12)**: Network traffic analysis
- **Network Tab**: XHR/Fetch request inspection
- **JSON Viewer**: Response parsing and analysis

---

## Defensive Recommendations

For developers building similar applications:

1. **Never Trust Client-Side Data**
   - Validate all input server-side
   - Don't leak secrets in API responses
   - Implement proper authentication

2. **State Management**
   - Properly validate game/application state
   - Prevent input in invalid states
   - Clear server state on reset

3. **Data Minimization**
   - Only send data the client needs
   - Secrets should never reach the browser
   - Use server-side validation tokens

4. **Clear Feedback**
   - Provide meaningful error messages
   - Don't make users guess at correct behavior
   - Indicate when input is being rejected

---

## Challenge Timeline

```
[Start] → Navigate Forest → Die Multiple Times → Monitor Network
    ↓
Discover Secret in JSON Response
    ↓
Continue Playing Until Death
    ↓
Enter Secret Post-Mortem
    ↓
[Flag Captured] ✓
```

---

## Flag

```
HTB{D3v3l0p3r_t0015_4r3_b35t_t0015_wh4t_d0_y0u_Th1nk??}
```

**Translation:** Developer tools are best tools, what do you think??

---

**Challenge Completed:** ✓  
**Difficulty Rating:** Easy (with DevTools knowledge)

---

*This writeup is for educational purposes only. It demonstrates the importance of thorough web application analysis and the power of browser developer tools in security testing.*
