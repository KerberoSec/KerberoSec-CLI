---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, blue-team, training]
source: TryHackMe: Training Impact on Teams
platform: tryhackme
room: Training Impact on Teams
slug: training-impact-on-teams
path: TryHackMe/80-blue-team/training-impact-on-teams/training-impact-on-teams.md
topic: 80-blue-team
domain: [blueteam]
skills: [awareness-training, reporting, risk-communication]
artifacts: [concept-notes]
sanitized: true
---

# Training Impact on Teams

## Summary

This note summarises the **TryHackMe room: *Training Impact on Teams*** and the attached 1‑page business case on cyber security training.

Goal: understand **why structured cyber security training matters** for both individuals and organisations, how to **argue for investment** (ROI), and what to watch for when **selecting a training vendor**.

---

## Key Concepts

### 2. Why Cyber Security Training Matters

#### 2.1 For individuals

* Cyber security is a **skill‑based discipline**: mastery requires **practice + feedback**, not just theory.
* Safe practice usually needs an **isolated lab environment** so experiments don’t damage production systems.
* Training platforms provide:

  * Ready‑made **labs and CTFs** instead of self‑built fragile labs.
  * A way to **keep skills up to date** as tools, threats and techniques evolve.
  * A social layer (team CTFs, shared rooms) that **builds relationships and trust** inside the team.

#### 2.2 For organisations

* "An ounce of prevention is worth a pound of cure":

  * Well‑trained staff **prevent incidents** or **detect them earlier**, reducing impact.
  * Teams learn during **simulation** rather than during real outages.
* Training **increases capacity without hiring more people**:

  * Staff hit the ground running instead of learning from scratch in an incident.
  * Juniors ramp up faster; seniors spend **less time re‑teaching basics**.
* Centralised training gives a **common baseline**:

  * Replace vague labels like *junior/senior* with **measurable skill levels**.
  * Easier to assign the right person to the right task and plan career paths.
* Psychological side:

  * Structured training signals **investment in people**, improving retention.
  * Shared challenges (e.g. team CTFs) **strengthen team cohesion**.

---

### 3. Training for Larger Organisations

When teams grow (≈20+ people) or requirements are specialised, **generic off‑the‑shelf paths are not enough**.

Key ideas:

* Use a platform that supports **custom content and paths**:

  * On TryHackMe this is provided by **Content Studio**.
  * Organisations can remix existing rooms, add internal context, or build full custom modules.
* Integration requirements for enterprises:

  * **SSO (Single Sign‑On)** so staff use existing identities.
  * **APIs & reporting** to plug into HR / LMS / SIEM or internal dashboards.
* Output: a **role‑based curriculum**: e.g. SOC analyst, incident responder, malware analyst: mapped to specific rooms and paths.

---

### 4. Financial Impact & ROI of Training

#### 4.1 Example calculation (from room text)

Assumptions:

* Team size: **10** security employees.
* Average cost per employee: **$80,000/year**.
* Productivity gain from training: **4%**.
* Training cost: **$500 per employee**.

Calculations:

* Total annual payroll: `10 × $80,000 = $800,000`.
* Value of productivity gain: `4% × $800,000 = $32,000`.
* Total training cost: `10 × $500 = $5,000`.
* **ROI** (Return On Investment):

  ```text
  ROI = (gain from investment) / (cost of investment)
      = $32,000 / $5,000
      = 6.4  →  640%
  ```

Interpretation:

* Spending $5k on training **unlocks ≈$32k worth of extra productive capacity** per year.
* Even if the 4% assumption is optimistic, the investment still looks attractive.

#### 4.2 1‑page business case: core points

From the attached “Cost savings by investing in Cyber Security training” one‑pager:

**Problems it highlights**

* Team performance is limited by **missing or outdated knowledge**.
* Recruiting skilled cyber staff is hard; market is **overheated**.
* Senior staff lose time **onboarding new hires** and re‑teaching basics.
* Learning happens on **live incidents**, not in structured labs.
* Internal, home‑grown training labs are:

  * Expensive to maintain.
  * Potential **attack vectors** themselves.
* Dependence on **external consultants** despite internal staff being eager to learn.

**Recommended approach**

* Use an **air‑gapped interactive platform** with up‑to‑date content.
* Expand the talent pool by **hiring non‑security candidates** and upskilling them.
* Standardise onboarding using **industry‑standard modules + custom org‑specific content**.
* Reduce reliance on internal labs and consultants.

**Business conclusion**

* Engaging a platform like TryHackMe is framed as a **highly positive business case**, not just a “nice to have” training perk.

---

### 5. Writing a Cyber Security Training Investment Proposal

When proposing training spend to management (especially CFO / HR / CISO), emphasise:

1. **Problem statement**

   * Skills gaps, hiring challenges, incident load, and reliance on external consultants.
   * Quantify the cost of incidents and time senior staff spend on ad‑hoc training.

2. **Proposed solution**

   * Platform choice (e.g. TryHackMe) + customisation (Content Studio, internal paths).
   * Links to career paths and compliance requirements.

3. **Financials**

   * Direct training costs (licences × headcount).
   * Productivity gains (example ROI calculation above).
   * Reduced consulting spend and lab maintenance overhead.

4. **Implementation plan**

   * Pilot group → rollout.
   * Mapping of **roles → learning paths**.
   * Metrics: completion rates, challenge scores, incident response KPIs.

5. **Risk & mitigation**

   * Training content is **air‑gapped** from production.
   * Clear acceptable‑use guidelines for hacking labs.

6. **Timeline**

   * Short pilot (e.g. 1-3 months) to validate value, then annual renewal.

---

### 6. Vendor Selection: Key Questions

When selecting a training vendor, decision‑makers should ask:

1. **Audience fit**

   * Who is this training for? (SOC, devs, IT, non‑technical staff.)
   * What are the current **experience levels** and backgrounds?

2. **Content relevance & quality**

   * Does the vendor cover the **topics that matter** to us (blue team, cloud, web, OT, etc.)?
   * Is there enough **depth** for advanced staff, not just intros?
   * Is content **kept up‑to‑date** with new attack techniques?

3. **Platform capabilities**

   * Single platform for **learn + lab + assessment**?
   * Good **reporting & dashboards** for managers?
   * Support for **SSO, APIs, integrations** into existing LMS/HR systems?

4. **Scalability & customisation**

   * Can we create **organisation‑specific paths** and custom content?
   * How are **teams and permissions** managed at scale?

5. **Cost vs value**

   * Training prices vs **employee salary levels**: usually training cost is small compared to productivity gain.
   * Options for **seat‑based vs consumption‑based** pricing.

---

## Takeaways

* Training is both a **technical necessity** and a **business investment**.
* Good training platforms:

  * Increase **team capacity** and reduce incident frequency.
  * Allow **cheaper hiring** (more juniors, cross‑training from other roles).
  * Provide **measurable baselines** and clear career paths.
* For large organisations, look for:

  * Customisable content (**Content Studio**).
  * SSO, APIs, and good reporting.
* A simple ROI example already shows **>600% return**, making a strong case for budget approval.

> Core mental model: *"Train in safe labs so you don’t have to learn under fire."*
