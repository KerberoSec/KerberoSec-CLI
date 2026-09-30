# AI Security Testing Report

**Project:** [Project / Lab Name]  
**Date:** [DD/MM/YYYY]  
**Tester:** [Your Name]  
**Target:** [AI Application / Chatbot / API]  
**Model:** [Model Name / Version, if known]  
**Environment:** [Lab / Staging / Production]  
**Test Type:** [LLM / GenAI / AI Application]

---

# 1. Executive Summary

## Overview

Security testing was performed against **[AI application name]** to identify weaknesses that could allow an attacker to manipulate the model, access restricted information, abuse application functionality, or bypass security controls.

The assessment focused on:

- Prompt Injection
- Sensitive Information Disclosure
- Jailbreak Attempts
- Insecure Output Handling
- Excessive Agency
- Access Control
- [Other test areas]

## Overall Result

**Security Rating:** [Low / Medium / High / Critical]

A total of **[number]** security issues were identified.

The most significant finding was **[finding name]**, which could allow an attacker to **[brief impact]**.

| Severity | Finding | Impact |
|---|---|---|
| Critical | [Finding] | [Impact] |
| High | [Finding] | [Impact] |
| Medium | [Finding] | [Impact] |
| Low | [Finding] | [Impact] |

---

# 2. Scope and Objectives

## Scope

The following components were tested:

- **Application:** [Name]
- **Interface:** [Web / API / Chatbot]
- **Model:** [Model]
- **Endpoint:** [URL / API]
- **Authentication:** [Required / Not required]

## Objectives

The main objectives were to determine whether an attacker could:

- Manipulate model behavior.
- Bypass system instructions.
- Access sensitive information.
- Extract hidden prompts or instructions.
- Trigger unauthorized functionality.
- Abuse connected tools or APIs.
- Cause unsafe or unintended output.

## Out of Scope

The following were not tested:

- [Example: Denial-of-Service]
- [Example: Infrastructure attacks]
- [Example: Physical security]
- [Other exclusions]

---

# 3. Methodology

Testing was performed using a combination of manual testing and security techniques.

## 3.1 Application Reconnaissance

The application was analyzed to identify:

- Available features
- Model functionality
- User roles
- API endpoints
- Connected tools
- External integrations
- Input and output mechanisms

## 3.2 Prompt Testing

Different prompts were used to evaluate how the model responded to potentially malicious or unexpected instructions.

Examples:

```text
[Prompt used during testing]
```

```text
[Another prompt]
```

## 3.3 Security Testing

The following test categories were considered:

| Test | Result |
|---|---|
| Prompt Injection | [Pass / Fail] |
| Jailbreak | [Pass / Fail] |
| Sensitive Data Disclosure | [Pass / Fail] |
| System Prompt Extraction | [Pass / Fail] |
| Excessive Agency | [Pass / Fail] |
| Insecure Output Handling | [Pass / Fail] |
| Access Control | [Pass / Fail] |
| Tool Abuse | [Pass / Fail] |

---

# 4. Findings and Analysis

## Finding #[01]: [Finding Name]

**Severity:** [Critical / High / Medium / Low]  
**Category:** [Prompt Injection / Data Disclosure / etc.]  
**Affected Component:** [Component]

### Description

[Explain what the vulnerability is.]

### Attack Scenario

An attacker could potentially:

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Test Input

```text
[Prompt / Input]
```

### Model Response

```text
[Relevant model response]
```

### Evidence

[Insert screenshot]

**Figure 1: [Description]**

### Result

The test demonstrated that:

[Explain what happened.]

### Impact

An attacker could potentially:

- [Impact 1]
- [Impact 2]
- [Impact 3]

### Risk

**Likelihood:** [Low / Medium / High]  
**Impact:** [Low / Medium / High]  
**Overall Risk:** [Low / Medium / High / Critical]

### Recommendation

Recommended remediation:

- [Fix 1]
- [Fix 2]
- [Fix 3]

---

# 5. Test Cases

## Test Case #[01]: Prompt Injection

**Objective:** Determine whether user input can override application instructions.

### Input

```text
[Prompt]
```

### Expected Result

The application should:

[Expected secure behavior]

### Actual Result

[What actually happened]

### Status

**[PASS / FAIL]**

### Evidence

[Add screenshot or response]

---

## Test Case #[02]: Sensitive Information Disclosure

**Objective:** Determine whether the model reveals restricted information.

### Input

```text
[Prompt]
```

### Expected Result

The model should not reveal:

- System prompts
- Credentials
- API keys
- Private data
- Internal configuration

### Actual Result

[Result]

### Status

**[PASS / FAIL]**

---

## Test Case #[03]: Jailbreak

**Objective:** Determine whether model safety controls can be bypassed.

### Input

```text
[Prompt]
```

### Expected Result

The model should maintain its security restrictions.

### Actual Result

[Result]

### Status

**[PASS / FAIL]**

---

## Test Case #[04]: Excessive Agency

**Objective:** Determine whether the AI can perform actions beyond what the user should be authorized to perform.

### Test

[Describe attempted action.]

### Expected Result

[Expected behavior]

### Actual Result

[Actual behavior]

### Status

**[PASS / FAIL]**

---

# 6. Attack Chain

When multiple weaknesses were successfully combined, document the attack chain here.

### Step 1: Initial Access

[How the attacker interacted with the application.]

### Step 2: Prompt Manipulation

[How the model behavior was manipulated.]

### Step 3: Access to Information

[What information became available.]

### Step 4: Additional Action

[What additional action was possible.]

### Final Impact

[Explain the complete impact of the attack chain.]

---

# 7. Recommendations

## High Priority

- [Remediation]
- [Remediation]

## Medium Priority

- [Remediation]
- [Remediation]

## Low Priority

- [Remediation]

### General AI Security Improvements

Consider implementing:

- Strong input validation.
- Output validation.
- Proper authorization outside the model.
- Least-privilege access for AI tools.
- Protection of system prompts and sensitive information.
- Logging and monitoring of suspicious interactions.
- Human approval for high-impact actions.
- Regular adversarial testing.

---

# 8. Conclusion

The security assessment identified **[number]** findings in **[AI application]**.

The most significant issue was **[finding]**, which could allow an attacker to **[impact]**.

The assessment demonstrates that AI applications should not rely solely on the model to enforce security controls. Authorization, access control, and validation should be implemented at the application layer.

A retest should be performed after remediation to confirm that the identified issues have been addressed.

---

# 9. Appendix

## Tools Used

| Tool | Purpose |
|---|---|
| Burp Suite | HTTP/API testing |
| [LLM testing tool] | AI security testing |
| [Tool] | [Purpose] |

## Prompts Used

```text
[Prompt]
```

```text
[Prompt]
```

## Evidence

[Screenshots]

## References

- OWASP Top 10 for LLM Applications
- MITRE ATLAS
- [Other reference]

## Notes

[Additional observations or limitations]